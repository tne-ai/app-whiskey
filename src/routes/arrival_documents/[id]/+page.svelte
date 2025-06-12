<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import arrivalDocumentsService, { type ArrivalDocument } from '$lib/services/arrival-documents';
  
  // State variables
  let arrivalDocument: ArrivalDocument | null = null;
  let materials: any[] = [];
  let loading = true;
  let error: string | null = null;
  let updatingValidation = false;
  
  // Get document ID from URL
  $: documentId = $page.params.id;
  
  // Computed validation status based on materials
  $: isDocumentValid = materials.length > 0 && materials.every(material => material.is_valid === true);
  
  // Check if validation status has changed
  $: if (arrivalDocument && arrivalDocument.is_validated !== isDocumentValid) {
    // Auto-update the document validation status if it differs from computed value
    updateDocumentValidationStatus(isDocumentValid);
  }
  
  // Load document data
  async function loadDocument() {
    if (!documentId) return;
    
    loading = true;
    error = null;
    try {
      const [docData, materialsData] = await Promise.all([
        arrivalDocumentsService.getArrivalDocument(documentId),
        arrivalDocumentsService.getArrivalDocumentMaterials(documentId)
      ]);
      
      arrivalDocument = docData;
      materials = materialsData;
    } catch (err) {
      console.error('Error loading arrival document', err);
      error = 'Failed to load arrival document. Please try again later.';
    } finally {
      loading = false;
    }
  }
  
  // Navigate to edit page
  function editDocument() {
    goto(`/arrival_documents/${documentId}/edit`);
  }
  
  // Navigate back to list
  function goBack() {
    goto('/arrival_documents');
  }
  
  // Format date for display
  function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }
  
  // Format currency
  function formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Format percentage
  function formatPercentage(value: number | null): string {
    if (value === null || value === undefined) return '-';
    return `${Math.round(value * 100)}%`;
  }
  
  // Toggle validation status
  function toggleValidation() {
    // TO DO: implement validation toggle logic
  }
  
  // View material
  function viewMaterial(materialId: number) {
    goto(`/materials/${materialId}`);
  }
  
  // Edit material
  function editMaterial(materialId: number) {
    goto(`/materials/${materialId}/edit`);
  }
  
  // Update document validation status
  async function updateDocumentValidationStatus(isValid: boolean) {
    try {
      await arrivalDocumentsService.updateArrivalDocumentValidationStatus(documentId, isValid);
      arrivalDocument.is_validated = isValid;
    } catch (err) {
      console.error('Error updating document validation status', err);
    }
  }
  
  onMount(() => {
    loadDocument();
  });
</script>

<div class="container mx-auto p-6">
  <!-- Loading and Error States -->
  {#if loading}
    <div class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Loading arrival document...</span>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {:else if arrivalDocument}
    <!-- Navigation -->
    <div class="mb-6">
      <button
        on:click={goBack}
        class="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Arrival Documents
      </button>
    </div>

    <!-- Document Header - Top Row with Two Columns -->
    <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <!-- Left Column: Document Name -->
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            {arrivalDocument.arrival_doc_name || 'Unnamed Document'}
          </h1>
          {#if arrivalDocument.arrival_doc_description}
            <p class="text-lg text-gray-600 mb-4">{arrivalDocument.arrival_doc_description}</p>
          {/if}
          {#if arrivalDocument.arrival_doc_text}
            <div class="mt-4">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Document Content</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-700 whitespace-pre-wrap">{arrivalDocument.arrival_doc_text}</p>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Right Column: Document Attributes -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-xl font-medium text-gray-900 mb-6">Document Attributes</h3>
          
          <div class="space-y-4">
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500">Site</span>
              <span class="text-sm text-gray-900">{arrivalDocument.site_name || '-'}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500">Arrival Date</span>
              <span class="text-sm text-gray-900">{formatDate(arrivalDocument.delivery_date)}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500">Document Data Valid</span>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {arrivalDocument.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                {#if arrivalDocument.is_valid}
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Valid
                {:else}
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  Invalid
                {/if}
              </span>
            </div>
            
            <!-- Editable Validation Status -->
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500">All materials validated:</span>
              <div class="flex items-center space-x-2">
                <button
                  on:click={toggleValidation}
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors {isDocumentValid ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}"
                >
                  {#if isDocumentValid}
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Validated
                  {:else}
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Invalid
                  {/if}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Edit Link -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <button
              on:click={editDocument}
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Edit Document
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Materials Table - Bottom Row (Single Column) -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-xl font-medium text-gray-900">Associated Materials</h3>
        <p class="text-sm text-gray-500 mt-1">Materials linked to this arrival document</p>
      </div>
      
      {#if materials.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrival Doc Item
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waste %
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each materials as material}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    {#if material.is_valid === true}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Valid
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Invalid
                      </span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {material.quantity || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.arrival_doc_item_name || 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.item_name || 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {material.default_waste_pct ? (material.default_waste_pct * 100).toFixed(0) + '%' : 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(material.unit_cost)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(material.total_cost)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.site_name || 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        on:click={() => viewMaterial(material.material_entry_id)}
                        class="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View
                      </button>
                      <button
                        on:click={() => editMaterial(material.material_entry_id)}
                        class="text-yellow-600 hover:text-yellow-900 transition-colors"
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
      {:else}
        <div class="text-center py-8">
          <p class="text-gray-500">No materials associated with this arrival document.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
