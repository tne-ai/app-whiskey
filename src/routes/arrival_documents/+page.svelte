<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { 
    arrivalDocumentsService, 
    type ArrivalDocument, 
    type GetArrivalDocumentsParams, 
    type Site 
  } from '$lib';

  // State variables
  let arrivalDocuments: ArrivalDocument[] = [];
  let loading = true;
  let error: string | null = null;

  // Pagination state
  let currentPage = 1;
  let limit = 10;
  let totalPages = 0;
  let totalCount = 0;

  // Filter state
  let selectedSiteId: string = '';
  let sortBy: string = 'delivery_date';
  let sortOrder: 'asc' | 'desc' = 'desc';
  let sites: Site[] = [];

  // Load arrival documents data
  async function loadArrivalDocuments() {
    loading = true;
    error = null;
    try {
      const params: GetArrivalDocumentsParams = {
        page: currentPage,
        limit: limit,
        siteId: selectedSiteId || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
      const response = await arrivalDocumentsService.getArrivalDocuments(params);
      arrivalDocuments = response.data;
      totalPages = response.totalPages;
      totalCount = response.totalCount;
    } catch (err) {
      console.error('Error loading arrival documents', err);
      error = 'Failed to load arrival documents. Please try again later.';
    } finally {
      loading = false;
    }
  }

  // Load reference data for filters
  async function loadReferenceData() {
    try {
      sites = await arrivalDocumentsService.getSites();
    } catch (err) {
      console.error('Error loading reference data', err);
    }
  }

  // Handle sorting
  function handleSort(column: string) {
    if (sortBy === column) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortOrder = 'asc';
    }
    currentPage = 1; // Reset to first page when sorting
    loadArrivalDocuments();
  }

  // Handle site filter change
  function handleSiteFilter() {
    currentPage = 1; // Reset to first page when filtering
    loadArrivalDocuments();
  }

  // Handle page change
  function handlePageChange(newPage: number) {
    currentPage = newPage;
    loadArrivalDocuments();
  }

  // Navigate to view page
  function viewDocument(id: string) {
    goto(`/arrival_documents/${id}`);
  }

  // Navigate to create page
  function createDocument() {
    goto('/arrival_documents/new');
  }

  // Get sort icon
  function getSortIcon(column: string): string {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  }

  // Format date
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Check if document is validated (all materials are valid)
  function isValidated(doc: ArrivalDocument): boolean {
    return doc.computed_is_valid || false;
  }

  // Initialize data on mount
  onMount(() => {
    loadReferenceData();
    loadArrivalDocuments();
  });
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Arrival Documents</h1>
    <button
      on:click={createDocument}
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Create Arrival Document
    </button>
  </div>

  <!-- Filters -->
  <div class="bg-white p-4 rounded-lg shadow mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="site-filter" class="block text-sm font-medium text-gray-700 mb-1">Site</label>
        <select
          id="site-filter"
          bind:value={selectedSiteId}
          on:change={handleSiteFilter}
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sites</option>
          {#each sites as site}
            <option value={site.site_id}>{site.site_name}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <!-- Loading and Error States -->
  {#if loading}
    <div class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Loading arrival documents...</span>
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
  {:else}
    <!-- Data Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              on:click={() => handleSort('site_name')}
            >
              Site {getSortIcon('site_name')}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              on:click={() => handleSort('arrival_doc_name')}
            >
              Name {getSortIcon('arrival_doc_name')}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              on:click={() => handleSort('delivery_date')}
            >
              Arrival Date {getSortIcon('delivery_date')}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doc Data
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Materials Data
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each arrivalDocuments as document}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {document.site_name || '-'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {document.arrival_doc_name || '-'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(document.delivery_date)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if isValidated(document)}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Valid
                  </span>
                {:else}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Invalid
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if isValidated(document)}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Validated
                  </span>
                {:else}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Invalid
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  on:click={() => viewDocument(document.arrival_doc_id)}
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      
      {#if arrivalDocuments.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-500">No arrival documents found.</p>
        </div>
      {/if}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            on:click={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            on:click={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{(currentPage - 1) * limit + 1}</span>
              to
              <span class="font-medium">{Math.min(currentPage * limit, totalCount)}</span>
              of
              <span class="font-medium">{totalCount}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                on:click={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                on:click={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
