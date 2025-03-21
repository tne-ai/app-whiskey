<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import ModelResponse from '$lib/components/ModelResponse.svelte';
  import RawResponse from '$lib/components/RawResponse.svelte';
  import { parseModelResponse } from '$lib/utils/jsonParser';
  import type { PartialModelAnalysis } from '$lib/types';

  const siteId = parseInt($page.params.siteId, 10);
  let parseError = '';
  let parsedData: PartialModelAnalysis | null = null;

  // Computed value for the parsed data
  $: {
    if ($appState.data?.modelAnalysis) {
      const result = parseModelResponse($appState.data.modelAnalysis);
      if (result?._parseError) {
        parseError = result._parseError.message;
      }
      parsedData = result;
    } else {
      parsedData = null;
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Upload Document</h1>
    <a href="/sites/{siteId}/details?tab=documents" class="text-primary hover:text-primary-focus">← Back to Documents</a>
  </div>
  
  <div class="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
    <FileUpload {siteId} />
    
    {#if $appState.isUploading}
      <div class="flex flex-col items-center justify-center py-8">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4">Processing document...</p>
      </div>
    {/if}

    {#if $appState.data?.modelAnalysis}
      {#if parsedData}
        <ModelResponse data={parsedData} />
      {/if}
      
      <details class="mt-6 bg-base-200 rounded-lg">
        <summary class="p-4 cursor-pointer font-medium">View Raw Response</summary>
        <RawResponse content={$appState.data.modelAnalysis} />
      </details>

      {#if parseError}
        <div class="alert alert-error mt-6">
          <div class="flex items-center gap-4">
            <span class="text-2xl">⚠️</span>
            <div>
              <h3 class="font-bold">Parse Error</h3>
              <p>{parseError}</p>
            </div>
          </div>
        </div>
      {/if}
    {/if}

    {#if $appState.error}
      <div class="alert alert-error mt-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl">❌</span>
          <div>
            <h3 class="font-bold">Upload Error</h3>
            <p>{$appState.error}</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <div class="flex justify-end gap-4">
    <button type="button" class="btn btn-ghost" on:click={() => goto(`/sites/${siteId}/details?tab=documents`)}>
      Cancel
    </button>
    {#if parsedData}
      <button type="button" class="btn btn-primary" on:click={() => {
        // Save processed document and navigate back
        goto(`/sites/${siteId}/details?tab=documents`);
      }}>
        Save Document
      </button>
    {/if}
  </div>
</div>

<style>
  /* Remove all existing styles since we're using Tailwind classes */
</style> 