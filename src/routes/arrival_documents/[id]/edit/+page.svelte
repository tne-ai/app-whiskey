<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import arrivalDocumentsService, { type ArrivalDocument, type ArrivalDocumentUpdate, type Site } from '$lib/services/arrival-documents';
  
  // State variables
  let arrivalDocument: ArrivalDocument | null = null;
  let sites: Site[] = [];
  let loading = true;
  let saving = false;
  let error: string | null = null;
  let validationErrors: Record<string, string> = {};
  
  // Form data
  let formData: ArrivalDocumentUpdate = {
    delivery_date: '',
    arrival_doc_name: '',
    arrival_doc_description: '',
    arrival_doc_text: '',
    site_id: '',
    is_valid: false
  };
  
  // Get document ID from URL
  $: documentId = $page.params.id;
  
  // Load document and reference data
  async function loadData() {
    if (!documentId) return;
    
    loading = true;
    error = null;
    try {
      const [docData, sitesData] = await Promise.all([
        arrivalDocumentsService.getArrivalDocument(documentId),
        arrivalDocumentsService.getSites()
      ]);
      
      arrivalDocument = docData;
      sites = sitesData;
      
      // Populate form with existing data
      formData = {
        delivery_date: docData.delivery_date || '',
        arrival_doc_name: docData.arrival_doc_name || '',
        arrival_doc_description: docData.arrival_doc_description || '',
        arrival_doc_text: docData.arrival_doc_text || '',
        site_id: docData.site_id || '',
        is_valid: docData.is_valid || false
      };
    } catch (err) {
      console.error('Error loading data', err);
      error = 'Failed to load arrival document. Please try again later.';
    } finally {
      loading = false;
    }
  }
  
  // Validate form
  function validateForm(): boolean {
    validationErrors = {};
    
    if (!formData.arrival_doc_name?.trim()) {
      validationErrors.arrival_doc_name = 'Document name is required';
    }
    
    if (!formData.site_id) {
      validationErrors.site_id = 'Site is required';
    }
    
    if (formData.delivery_date && isNaN(Date.parse(formData.delivery_date))) {
      validationErrors.delivery_date = 'Invalid date format';
    }
    
    return Object.keys(validationErrors).length === 0;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    saving = true;
    error = null;
    try {
      await arrivalDocumentsService.updateArrivalDocument(documentId, formData);
      goto(`/arrival_documents/${documentId}`);
    } catch (err) {
      console.error('Error updating arrival document', err);
      error = 'Failed to update arrival document. Please try again.';
    } finally {
      saving = false;
    }
  }
  
  // Navigate back without saving
  function goBack() {
    goto(`/arrival_documents/${documentId}`);
  }
  
  // Format date for input
  function formatDateForInput(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  onMount(() => {
    loadData();
  });
</script>

<div class="container mx-auto p-6">
  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Loading arrival document...</span>
    </div>
  {:else if error && !arrivalDocument}
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
    <!-- Navigation -->
    <div class="mb-6">
      <button
        on:click={goBack}
        class="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Document
      </button>
    </div>

    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Edit Arrival Document</h1>
      <p class="text-gray-600 mt-2">Update the arrival document information</p>
    </div>

    <!-- Error Message -->
    {#if error}
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
    {/if}

    <!-- Form -->
    <div class="bg-white shadow rounded-lg">
      <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
        <!-- Document Name -->
        <div>
          <label for="arrival_doc_name" class="block text-sm font-medium text-gray-700 mb-1">
            Document Name *
          </label>
          <input
            type="text"
            id="arrival_doc_name"
            bind:value={formData.arrival_doc_name}
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            class:border-red-500={validationErrors.arrival_doc_name}
            placeholder="Enter document name"
            required
          />
          {#if validationErrors.arrival_doc_name}
            <p class="text-red-600 text-sm mt-1">{validationErrors.arrival_doc_name}</p>
          {/if}
        </div>

        <!-- Site -->
        <div>
          <label for="site_id" class="block text-sm font-medium text-gray-700 mb-1">
            Site *
          </label>
          <select
            id="site_id"
            bind:value={formData.site_id}
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            class:border-red-500={validationErrors.site_id}
            required
          >
            <option value="">Select a site</option>
            {#each sites as site}
              <option value={site.site_id}>{site.site_name}</option>
            {/each}
          </select>
          {#if validationErrors.site_id}
            <p class="text-red-600 text-sm mt-1">{validationErrors.site_id}</p>
          {/if}
        </div>

        <!-- Delivery Date -->
        <div>
          <label for="delivery_date" class="block text-sm font-medium text-gray-700 mb-1">
            Arrival Date
          </label>
          <input
            type="date"
            id="delivery_date"
            bind:value={formData.delivery_date}
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            class:border-red-500={validationErrors.delivery_date}
          />
          {#if validationErrors.delivery_date}
            <p class="text-red-600 text-sm mt-1">{validationErrors.delivery_date}</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="arrival_doc_description" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="arrival_doc_description"
            bind:value={formData.arrival_doc_description}
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document description"
          ></textarea>
        </div>

        <!-- Document Text -->
        <div>
          <label for="arrival_doc_text" class="block text-sm font-medium text-gray-700 mb-1">
            Document Content
          </label>
          <textarea
            id="arrival_doc_text"
            bind:value={formData.arrival_doc_text}
            rows="6"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document content"
          ></textarea>
        </div>

        <!-- Document Data Valid -->
        <div>
          <div class="flex items-center">
            <input
              type="checkbox"
              id="is_valid"
              bind:checked={formData.is_valid}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="is_valid" class="ml-2 block text-sm font-medium text-gray-700">
              Document Data Valid
            </label>
          </div>
          <p class="text-sm text-gray-500 mt-1">Check this box if the document data has been validated</p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            on:click={goBack}
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if saving}
              <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            {:else}
              Save Changes
            {/if}
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>
