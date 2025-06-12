<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { 
    materialsService, 
    type Material, 
    type PaginationParams, 
    type FilterParams 
  } from '$lib';
  
  // State variables
  let materials: Material[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Pagination state
  let pagination: PaginationParams = {
    limit: 10,
    offset: 0,
    order: 'is_valid.asc'
  };
  let totalCount = 0;
  
  // Filter state
  let filters: FilterParams = {};
  let sites: Array<{ site_id: string; site_name: string }> = [];
  let arrivalDocuments: Array<{ arrival_doc_id: string; arrival_doc_name: string }> = [];
  
  // Load materials data
  async function loadMaterials() {
    loading = true;
    error = null;
    try {
      materials = await materialsService.getMaterials(pagination, filters);
      // In a real app, we would get total count from headers or a separate count endpoint
      // For now, we'll assume total count is available
      totalCount = materials.length >= pagination.limit ? 100 : materials.length;
    } catch (err) {
      console.error('Error loading materials', err);
      error = 'Failed to load materials. Please try again later.';
    } finally {
      loading = false;
    }
  }
  
  // Load reference data for filters
  async function loadReferenceData() {
    try {
      // Only load sites for filters
      sites = await materialsService.getSites();
      
      // Load arrival documents for the filter
      const arrivalDocs = await materialsService.getArrivalDocuments();
      // Add arrival documents to the component state
      arrivalDocuments = arrivalDocs;
    } catch (err) {
      console.error('Error loading reference data', err);
      error = 'Failed to load filter options. Some filters may not be available.';
    }
  }
  
  // Handle pagination
  function nextPage() {
    if (pagination.offset + pagination.limit < totalCount) {
      pagination.offset += pagination.limit;
      loadMaterials();
    }
  }
  
  function prevPage() {
    if (pagination.offset > 0) {
      pagination.offset = Math.max(0, pagination.offset - pagination.limit);
      loadMaterials();
    }
  }
  
  // Handle filters
  function resetFilters() {
    filters = {};
    pagination.offset = 0; // Reset to first page when filtering
    loadMaterials();
  }
  
  // Auto-apply filters when they change
  $: if (filters) {
    pagination.offset = 0; // Reset to first page when filtering
    loadMaterials();
  }
  
  // Navigate to material detail or edit
  function viewMaterial(id: string) {
    goto(`/materials/${id}`);
  }
  
  function editMaterial(id: string) {
    goto(`/materials/${id}/edit`);
  }
  
  function createNewMaterial() {
    goto('/materials/new');
  }
  
  // Component lifecycle
  onMount(async () => {
    await Promise.all([loadMaterials(), loadReferenceData()]);
  });
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Materials Validation</h1>
    <button 
      class="btn btn-primary" 
      on:click={createNewMaterial}
    >
      Create New Material
    </button>
  </div>
  
  <!-- Filters - Compact Layout -->
  <div class="bg-base-200 p-3 mb-6 rounded-lg">
    <div class="flex flex-wrap items-center gap-3">
      <!-- Site Filter -->
      <div style="min-width: 180px;">
        <label class="block text-xs mb-1" for="site-filter">Site</label>
        <select 
          id="site-filter"
          class="w-full border border-gray-300 rounded px-2 py-1 h-8" 
          bind:value={filters.site_id}
        >
          <option value={undefined}>All Sites</option>
          {#each sites as site}
            <option value={site.site_id}>{site.site_name}</option>
          {/each}
        </select>
      </div>
      
      <!-- Arrival Document Filter -->
      <div style="min-width: 180px;">
        <label class="block text-xs mb-1" for="arrival-doc-filter">Arrival Doc</label>
        <select 
          id="arrival-doc-filter"
          class="w-full border border-gray-300 rounded px-2 py-1 h-8" 
          bind:value={filters.arrival_doc_id}
        >
          <option value={undefined}>All Documents</option>
          {#each arrivalDocuments as doc}
            <option value={doc.arrival_doc_id}>{doc.arrival_doc_name}</option>
          {/each}
        </select>
      </div>
      
      <!-- Is Valid Filter -->
      <div style="width: 120px;">
        <label class="block text-xs mb-1" for="valid-filter">Valid</label>
        <select 
          id="valid-filter"
          class="w-full border border-gray-300 rounded px-2 py-1 h-8" 
          bind:value={filters.is_valid}
        >
          <option value={undefined}>All</option>
          <option value={true}>Valid</option>
          <option value={false}>Invalid</option>
        </select>
      </div>

      <!-- Filter Action Buttons -->
      <div class="flex gap-2 ml-auto">
        <button class="btn btn-sm btn-outline" on:click={resetFilters}>Reset</button>
      </div>
    </div>
  </div>
  
  <!-- Materials Table -->
  {#if loading}
    <div class="flex justify-center items-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {:else if materials.length === 0}
    <div class="alert alert-info">
      <span>No materials found. Try adjusting your filters or create a new material.</span>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Valid</th>
            <th class="text-right">Quantity</th>
            <th>Arrival Doc Item</th>
            <th>Item</th>
            <th class="text-right">Waste %</th>
            <th>Site</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each materials as material}
            <tr>
              <td>
                {#if material.is_valid === true}
                  <span class="badge badge-success">Valid</span>
                {:else}
                  <span class="badge badge-error">Invalid</span>
                {/if}
              </td>
              <td class="text-right">{material.quantity}</td>
              <td>{material.arrival_doc_item_name || 'N/A'}</td>
              <td>{material.item_name || 'N/A'}</td>
              <td class="text-right">{material.default_waste_pct ? (material.default_waste_pct * 100).toFixed(0) : 'N/A'}</td>
              <td>{sites.find(s => s.site_id === material.site_id)?.site_name || material.site_id}</td>
              <td>
                <div class="flex gap-1">
                  <button 
                    class="btn btn-xs btn-info" 
                    on:click={() => viewMaterial(material.material_entry_id)}
                  >
                    View
                  </button>
                  <button 
                    class="btn btn-xs btn-warning" 
                    on:click={() => editMaterial(material.material_entry_id)}
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4">
      <div>
        Showing {pagination.offset + 1}-{Math.min(pagination.offset + materials.length, totalCount)} of {totalCount} materials
      </div>
      <div class="join">
        <button 
          class="join-item btn" 
          disabled={pagination.offset === 0}
          on:click={prevPage}
        >
          Previous
        </button>
        <button 
          class="join-item btn" 
          disabled={pagination.offset + pagination.limit >= totalCount}
          on:click={nextPage}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>
