<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import materialsService, { type Material, type Item } from '$lib/services/materials';
  
  // Get material ID from the URL parameter
  const materialId = $page.params.id;
  
  // State variables
  let material: Material | null = null;
  let loading = true;
  let error: string | null = null;
  
  // Reference data for displaying names instead of IDs
  let siteName = '';
  let submaterialName = '';
  let unitName = '';
  let supplierName = '';
  let stageName = '';
  let itemName = '';
  
  // Define reference data types
  type Site = { site_id: string; site_name: string };
  type Submaterial = { submaterial_id: string; submaterial_name: string };
  type Unit = { unit_id: string; unit_name: string };
  type Supplier = { supplier_id: string; supplier_name: string };
  type Stage = { stage_id: string; stage_name: string };
  
  // Load material and reference data
  async function loadMaterial() {
    loading = true;
    error = null;
    
    try {
      material = await materialsService.getMaterial(materialId);
      
      if (!material) {
        error = 'Material not found';
        return;
      }
      
      // Load reference data to display names
      const [sites, submaterials, units, suppliers, stages] = await Promise.all([
        materialsService.getSites(),
        materialsService.getSubmaterials(),
        materialsService.getUnits(),
        materialsService.getSuppliers(),
        materialsService.getStages()
      ]);
      
      // Get names from reference data
      if (material) {
        // Using non-null assertion (!) since we've confirmed material is not null
        const materialRef = material!;
        
        siteName = sites.find((s: Site) => s.site_id === materialRef.site_id)?.site_name || 'Unknown';
        submaterialName = submaterials.find((s: Submaterial) => s.submaterial_id === materialRef.submaterial_id)?.submaterial_name || '';
        unitName = units.find((u: Unit) => u.unit_id === materialRef.unit_id)?.unit_name || 'Unknown';
        supplierName = suppliers.find((s: Supplier) => s.supplier_id === materialRef.supplier_id)?.supplier_name || '';
        stageName = stages.find((s: Stage) => s.stage_id === materialRef.stage_id)?.stage_name || '';
        
        // If material has item_name property from joined data, use it
        itemName = materialRef.item_name || '';
        
        // If not, and there's an item_id, try to fetch it
        if (!itemName && materialRef.item_id) {
          const items = await materialsService.getItems();
          const item = items.find((i: Item) => i.item_id === materialRef.item_id);
          if (item) {
            itemName = item.item_name;
          }
        }
      }
      
    } catch (err) {
      console.error('Error loading material', err);
      error = 'Failed to load material details. Please try again later.';
    } finally {
      loading = false;
    }
  }
  
  // Helper functions
  function goBack() {
    goto('/materials');
  }
  
  function goToEdit() {
    goto(`/materials/${materialId}/edit`);
  }
  
  // Delete material with confirmation
  let deleting = false;
  let deleteError: string | null = null;
  
  async function deleteMaterial() {
    const confirmed = confirm('Are you sure you want to delete this material? This action cannot be undone.');
    
    if (!confirmed) return;
    
    deleting = true;
    deleteError = null;
    
    try {
      await materialsService.deleteMaterial(materialId);
      // Redirect back to materials list after successful deletion
      goto('/materials');
    } catch (err: any) {
      console.error('Error deleting material:', err);
      if (err && err.response && err.response.data) {
        deleteError = `Failed to delete: ${err.response.data.message || JSON.stringify(err.response.data)}`;
      } else {
        deleteError = 'Failed to delete material. Please try again later.';
      }
      deleting = false;
    }
  }
  
  // Load data on component mount
  onMount(loadMaterial);
</script>

<div class="container mx-auto p-4">
  <div class="flex items-center mb-6">
    <button class="btn btn-ghost" on:click={goBack}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Materials
    </button>
  </div>
  
  {#if loading}
    <div class="flex justify-center items-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {:else if material}
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Material Details</h1>
      <div class="flex gap-3">
        <button class="btn btn-error" on:click={deleteMaterial} disabled={deleting}>
          {#if deleting}
            <span class="loading loading-spinner loading-xs"></span>
          {/if}
          Delete Material
        </button>
        <button class="btn btn-warning" on:click={goToEdit}>Edit Material</button>
      </div>
    </div>
    
    {#if deleteError}
      <div class="alert alert-error mb-6">
        <span>{deleteError}</span>
      </div>
    {/if}
    
    <div class="bg-base-200 p-6 rounded-lg shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- ID -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Material ID</h3>
          <p class="mt-1">{material!.material_entry_id}</p>
        </div>
        
        <!-- Site -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Site</h3>
          <p class="mt-1">{siteName}</p>
        </div>
        
        <!-- Submaterial -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Submaterial</h3>
          <p class="mt-1">{submaterialName || 'N/A'}</p>
        </div>
        
        <!-- Quantity -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Quantity</h3>
          <p class="mt-1">{material!.quantity}</p>
        </div>
        
        <!-- Unit -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Unit</h3>
          <p class="mt-1">{unitName}</p>
        </div>
        
        <!-- Weight -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Weight (kg)</h3>
          <p class="mt-1">{material!.weight_kg ?? 'N/A'}</p>
        </div>
        
        <!-- Volume -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Volume (m³)</h3>
          <p class="mt-1">{material!.volume_m3 ?? 'N/A'}</p>
        </div>
        
        <!-- Cost Per Unit -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Cost Per Unit</h3>
          <p class="mt-1">{material!.cost_per_unit ?? 'N/A'}</p>
        </div>
        
        <!-- Total Cost -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Total Cost</h3>
          <p class="mt-1">{material!.total_cost ?? 'N/A'}</p>
        </div>
        
        <!-- Supplier -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Supplier</h3>
          <p class="mt-1">{supplierName || 'N/A'}</p>
        </div>
        
        <!-- Delivery Date -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Delivery Date</h3>
          <p class="mt-1">{material!.delivery_date ?? 'N/A'}</p>
        </div>
        
        <!-- Stage -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Stage</h3>
          <p class="mt-1">{stageName || 'N/A'}</p>
        </div>
        
        <!-- Item -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Item</h3>
          <p class="mt-1">{itemName || 'N/A'}</p>
        </div>
        
        <!-- Item ID -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Item ID</h3>
          <p class="mt-1">{material!.item_id ?? 'N/A'}</p>
        </div>
        
        <!-- Arrival Doc Item Name -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Arrival Doc Item</h3>
          <p class="mt-1">{material!.arrival_doc_item_name ?? 'N/A'}</p>
        </div>
        
        <!-- Arrival Document -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Arrival Document</h3>
          <p class="mt-1">{material!.arrival_doc_name ?? 'N/A'}</p>
        </div>
        
        <!-- PO ID -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">PO ID</h3>
          <p class="mt-1">{material!.id_po ?? 'N/A'}</p>
        </div>
        
        <!-- Valid Status -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Validation Status</h3>
          <p class="mt-1">
            {#if material!.is_valid}
              <span class="badge badge-success">Valid</span>
            {:else}
              <span class="badge badge-error">Invalid</span>
            {/if}
          </p>
        </div>
        
        <!-- Waste Percentage -->
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Default Waste %</h3>
          <p class="mt-1">{material!.default_waste_pct ? (material!.default_waste_pct * 100).toFixed(0) : 'N/A'}</p>
        </div>
      </div>
      
      <!-- Notes (full width) -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold text-gray-500">Notes</h3>
        <div class="mt-1 p-3 bg-base-100 rounded min-h-16">
          {material!.notes || 'No notes available'}
        </div>
      </div>
    </div>
  {/if}
</div>
