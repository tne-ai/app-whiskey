<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import materialsService, { type Material, type Item, type ArrivalDocument } from '$lib/services/materials';
  
  // Get material ID from the URL parameter
  const materialId = $page.params.id;
  const isNewMaterial = materialId === 'new';
  
  // State variables
  let material: Partial<Material> = isNewMaterial ? {
    is_valid: false
  } : {};
  let loading = true;
  let saving = false;
  let error: string | null = null;
  let saveSuccess = false;
  
  // For percentage display (convert from decimal to whole number percent)
  let editWastePct: number | null = null;
  
  // Reference data
  let sites: Array<{ site_id: string; site_name: string }> = [];
  let submaterials: Array<{ submaterial_id: string; submaterial_name: string }> = [];
  let units: Array<{ unit_id: string; unit_name: string }> = [];
  let suppliers: Array<{ supplier_id: string; supplier_name: string }> = [];
  let stages: Array<{ stage_id: string; stage_name: string }> = [];
  let items: Array<{ item_id: string; item_name: string }> = [];
  let arrivalDocuments: Array<{ arrival_doc_id: string; arrival_doc_name: string }> = [];
  
  // Load material data if editing existing
  async function loadMaterial() {
    loading = true;
    error = null;
    
    try {
      if (!isNewMaterial) {
        const loadedMaterial = await materialsService.getMaterial(materialId);
        
        if (!loadedMaterial) {
          error = 'Material not found';
          return;
        }
        
        material = { ...loadedMaterial };
        
        // Convert waste percentage from decimal to display percentage
        if (material.default_waste_pct !== undefined && material.default_waste_pct !== null) {
          editWastePct = Math.round(material.default_waste_pct * 100);
        }
      }
      
      // Load reference data
      [sites, submaterials, units, suppliers, stages, items, arrivalDocuments] = await Promise.all([
        materialsService.getSites(),
        materialsService.getSubmaterials(),
        materialsService.getUnits(),
        materialsService.getSuppliers(),
        materialsService.getStages(),
        materialsService.getItems(),
        materialsService.getArrivalDocuments()
      ]);
      
    } catch (err) {
      console.error('Error loading data', err);
      error = 'Failed to load data. Please try again later.';
    } finally {
      loading = false;
    }
  }
  
  // Save material
  // Convert waste percentage back to decimal before saving
  function updateWastePercentage() {
    if (editWastePct !== null && editWastePct !== undefined) {
      material.default_waste_pct = editWastePct / 100;
    } else {
      material.default_waste_pct = null;
    }
  }
  
  async function saveMaterial() {
    // Convert percentage back to decimal before saving
    updateWastePercentage();
    saving = true;
    error = null;
    saveSuccess = false;
    
    try {
      // Validate required fields
      if (!material.site_id) {
        error = 'Site is required';
        return;
      }
      
      if (material.quantity === undefined || material.quantity === null) {
        error = 'Quantity is required';
        return;
      }
      
      if (!material.unit_id) {
        error = 'Unit is required';
        return;
      }
      
      console.log('Submitting material data:', JSON.stringify(material, null, 2));
      
      if (isNewMaterial) {
        const newMaterial = await materialsService.createMaterial(material as Omit<Material, 'material_entry_id'>);
        saveSuccess = true;
        // Redirect to the newly created material
        setTimeout(() => {
          goto(`/materials/${newMaterial.material_entry_id}`);
        }, 1500);
      } else {
        await materialsService.updateMaterial(materialId, material);
        saveSuccess = true;
        // Stay on the edit page to allow further edits
      }
    } catch (err: any) {
      console.error('Error saving material', err);
      // Enhanced error logging
      if (err && err.response && err.response.data) {
        console.error('Server error details:', err.response.data);
        error = `Failed to save: ${err.response.data.message || JSON.stringify(err.response.data)}`;
      } else {
        error = 'Failed to save material. Please try again later.';
      }
    } finally {
      saving = false;
    }
  }
  
  function cancel() {
    if (isNewMaterial) {
      goto('/materials');
    } else {
      goto(`/materials/${materialId}`);
    }
  }
  
  // Load data on component mount
  onMount(loadMaterial);
</script>

<div class="container mx-auto p-4">
  <div class="flex items-center mb-6">
    <button class="btn btn-ghost" on:click={() => goto('/materials')}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Materials
    </button>
  </div>
  
  <h1 class="text-2xl font-bold mb-6">
    {isNewMaterial ? 'Create New Material' : 'Edit Material'}
  </h1>
  
  {#if loading}
    <div class="flex justify-center items-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error && !saving}
    <div class="alert alert-error mb-6">
      <span>{error}</span>
    </div>
  {:else}
    <form on:submit|preventDefault={saveMaterial} class="bg-base-200 p-6 rounded-lg shadow-md">
      {#if saveSuccess}
        <div class="alert alert-success mb-6">
          <span>Material {isNewMaterial ? 'created' : 'updated'} successfully!</span>
        </div>
      {/if}
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Site (Required) -->
        <div class="form-control w-full">
          <label for="site-input" class="label">
            <span class="label-text">Site *</span>
          </label>
          <select 
            id="site-input"
            class="select select-bordered w-full" 
            bind:value={material.site_id}
            required
          >
            <option value={undefined} disabled>Select Site</option>
            {#each sites as site}
              <option value={site.site_id}>{site.site_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Submaterial -->
        <div class="form-control w-full">
          <label for="submaterial-input" class="label">
            <span class="label-text">Submaterial</span>
          </label>
          <select 
            id="submaterial-input"
            class="select select-bordered w-full" 
            bind:value={material.submaterial_id}
          >
            <option value={undefined}>None</option>
            {#each submaterials as submaterial}
              <option value={submaterial.submaterial_id}>{submaterial.submaterial_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Quantity (Required) -->
        <div class="form-control w-full">
          <label for="quantity-input" class="label">
            <span class="label-text">Quantity *</span>
          </label>
          <input 
            id="quantity-input"
            type="number" 
            class="input input-bordered w-full" 
            step="0.01"
            bind:value={material.quantity}
            required
          />
        </div>
        
        <!-- Unit (Required) -->
        <div class="form-control w-full">
          <label for="unit-input" class="label">
            <span class="label-text">Unit *</span>
          </label>
          <select 
            id="unit-input"
            class="select select-bordered w-full" 
            bind:value={material.unit_id}
            required
          >
            <option value={undefined} disabled>Select Unit</option>
            {#each units as unit}
              <option value={unit.unit_id}>{unit.unit_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Weight -->
        <div class="form-control w-full">
          <label for="weight-input" class="label">
            <span class="label-text">Weight (kg)</span>
          </label>
          <input 
            id="weight-input"
            type="number" 
            class="input input-bordered w-full" 
            step="0.01"
            bind:value={material.weight_kg}
          />
        </div>
        
        <!-- Volume -->
        <div class="form-control w-full">
          <label for="volume-input" class="label">
            <span class="label-text">Volume (m³)</span>
          </label>
          <input 
            id="volume-input"
            type="number" 
            class="input input-bordered w-full" 
            step="0.01"
            bind:value={material.volume_m3}
          />
        </div>
        
        <!-- Cost Per Unit -->
        <div class="form-control w-full">
          <label for="cost-per-unit-input" class="label">
            <span class="label-text">Cost Per Unit</span>
          </label>
          <input 
            id="cost-per-unit-input"
            type="number" 
            class="input input-bordered w-full" 
            step="0.01"
            bind:value={material.cost_per_unit}
          />
        </div>
        
        <!-- Total Cost -->
        <div class="form-control w-full">
          <label for="total-cost-input" class="label">
            <span class="label-text">Total Cost</span>
          </label>
          <input 
            id="total-cost-input"
            type="number" 
            class="input input-bordered w-full" 
            step="0.01"
            bind:value={material.total_cost}
          />
        </div>
        
        <!-- Supplier -->
        <div class="form-control w-full">
          <label for="supplier-input" class="label">
            <span class="label-text">Supplier</span>
          </label>
          <select 
            id="supplier-input"
            class="select select-bordered w-full" 
            bind:value={material.supplier_id}
          >
            <option value={undefined}>None</option>
            {#each suppliers as supplier}
              <option value={supplier.supplier_id}>{supplier.supplier_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Delivery Date -->
        <div class="form-control w-full">
          <label for="delivery-date-input" class="label">
            <span class="label-text">Delivery Date</span>
          </label>
          <input 
            id="delivery-date-input"
            type="date" 
            class="input input-bordered w-full" 
            bind:value={material.delivery_date}
          />
        </div>
        
        <!-- Stage -->
        <div class="form-control w-full">
          <label for="stage-input" class="label">
            <span class="label-text">Stage</span>
          </label>
          <select 
            id="stage-input"
            class="select select-bordered w-full" 
            bind:value={material.stage_id}
          >
            <option value={undefined}>None</option>
            {#each stages as stage}
              <option value={stage.stage_id}>{stage.stage_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Item Selection -->
        <div class="form-control w-full">
          <label for="item-id-input" class="label">
            <span class="label-text">Item</span>
          </label>
          <select 
            id="item-id-input"
            class="select select-bordered w-full" 
            bind:value={material.item_id}
          >
            <option value={undefined}>None</option>
            {#each items as item}
              <option value={item.item_id}>{item.item_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Arrival Doc Item Name -->
        <div class="form-control w-full">
          <label for="arrival-doc-item-input" class="label">
            <span class="label-text">Arrival Doc Item</span>
          </label>
          <input 
            id="arrival-doc-item-input"
            type="text" 
            class="input input-bordered w-full" 
            bind:value={material.arrival_doc_item_name}
          />
        </div>
        
        <!-- Arrival Document -->
        <div class="form-control w-full">
          <label for="arrival-doc-id-input" class="label">
            <span class="label-text">Arrival Document</span>
          </label>
          <select 
            id="arrival-doc-id-input"
            class="select select-bordered w-full" 
            bind:value={material.arrival_doc_id}
          >
            <option value={undefined}>None</option>
            {#each arrivalDocuments as doc}
              <option value={doc.arrival_doc_id}>{doc.arrival_doc_name}</option>
            {/each}
          </select>
        </div>
        
        <!-- Is Valid -->
        <div class="form-control w-full">
          <label for="is-valid-input" class="label">
            <span class="label-text">Valid Status</span>
          </label>
          <div class="form-control">
            <label class="label cursor-pointer">
              <input 
                id="is-valid-input"
                type="checkbox" 
                class="checkbox checkbox-primary" 
                bind:checked={material.is_valid}
              />
              <span class="label-text ml-2">Is Valid</span>
            </label>
          </div>
        </div>
        
        <!-- Default Waste % -->
        <div class="form-control w-full">
          <label for="waste-pct-input" class="label">
            <span class="label-text">Default Waste %</span>
          </label>
          <div class="flex">
            <input 
              id="waste-pct-input"
              type="number" 
              class="input input-bordered w-full" 
              step="1"
              placeholder="Enter percentage"
              bind:value={editWastePct}
            />
            <span class="flex items-center px-3 bg-base-200">%</span>
          </div>
          <span class="label-text-alt mt-1">Enter the percentage as a whole number (e.g. 25 for 25%)</span>
        </div>
        
        <!-- PO ID -->
        <div class="form-control w-full">
          <label for="id-po-input" class="label">
            <span class="label-text">PO ID</span>
          </label>
          <input 
            id="id-po-input"
            type="text" 
            class="input input-bordered w-full" 
            bind:value={material.id_po}
          />
        </div>
      </div>
      
      <!-- Notes (full width) -->
      <div class="form-control w-full mt-6">
        <label for="notes-input" class="label">
          <span class="label-text">Notes</span>
        </label>
        <textarea 
          id="notes-input"
          class="textarea textarea-bordered h-24" 
          bind:value={material.notes}
        ></textarea>
      </div>
      
      <!-- Form Actions -->
      <div class="mt-8 flex justify-end gap-3">
        <button 
          type="button" 
          class="btn btn-outline" 
          on:click={cancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          disabled={saving}
        >
          {#if saving}
            <span class="loading loading-spinner"></span>
          {/if}
          {isNewMaterial ? 'Create Material' : 'Save Changes'}
        </button>
      </div>
      
      {#if error && saving}
        <div class="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      {/if}
    </form>
  {/if}
</div>
