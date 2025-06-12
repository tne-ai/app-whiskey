<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FileUploadKit } from './file-upload';
  import { DEFAULT_VALIDATION_OPTIONS, type UploadProgress } from '$lib/utils/file-upload';

  interface Props {
    open: boolean;
    siteId: string;
  }

  let { open, siteId }: Props = $props();

  const dispatch = createEventDispatcher<{
    close: void;
    uploadComplete: { success: boolean; message: string };
  }>();

  let uploading = $state(false);
  let uploadComplete = $state(false);
  let uploadResults = $state<Array<{ file: File; success: boolean; data?: any; error?: string }>>([]);

  // Custom upload options for delivery documents
  const uploadOptions = {
    endpoint: `/api/sites/${siteId}/delivery-documents/upload`,
    timeout: 600000 // 10 minutes
  };

  function handleClose() {
    if (uploading) return; // Prevent closing while uploading
    dispatch('close');
    resetState();
  }

  function resetState() {
    uploading = false;
    uploadComplete = false;
    uploadResults = [];
  }

  function handleUploadStart(event: CustomEvent<{ files: File[] }>) {
    uploading = true;
    uploadComplete = false;
  }

  function handleUploadFinished(event: CustomEvent<{ results: Array<{ file: File; success: boolean; data?: any; error?: string }> }>) {
    uploading = false;
    uploadComplete = true;
    uploadResults = event.detail.results;

    const successCount = uploadResults.filter(r => r.success).length;
    const totalCount = uploadResults.length;

    if (successCount === totalCount) {
      dispatch('uploadComplete', { 
        success: true, 
        message: `Successfully uploaded ${successCount} delivery document${successCount !== 1 ? 's' : ''}` 
      });
    } else {
      dispatch('uploadComplete', { 
        success: false, 
        message: `Upload completed with errors: ${successCount}/${totalCount} files uploaded successfully` 
      });
    }
  }

  function handleContinue() {
    if (uploadResults.some(r => r.success)) {
      // Some files uploaded successfully, close modal
      handleClose();
    }
  }
</script>

{#if open}
  <!-- Modal backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <!-- Modal content -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- Modal header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Upload Delivery Documents</h2>
        <button
          onclick={handleClose}
          disabled={uploading}
          class="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal body -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {#if !uploadComplete}
          <div class="space-y-4">
            <div class="text-sm text-gray-600">
              <p>Upload delivery documents for processing. Supported formats include PDF, images (PNG, JPEG), and CSV files.</p>
              <p class="mt-1">Files will be automatically processed and linked to arrival documents for this site.</p>
            </div>

            <FileUploadKit
              acceptedTypes={DEFAULT_VALIDATION_OPTIONS.allowedTypes}
              maxFileSize={DEFAULT_VALIDATION_OPTIONS.maxSize}
              uploadUrl={uploadOptions.endpoint}
              autoUpload={false}
              multiple={true}
              showPreview={true}
              on:uploadStart={handleUploadStart}
              on:uploadFinished={handleUploadFinished}
            />
          </div>
        {:else}
          <!-- Upload results -->
          <div class="space-y-4">
            <div class="text-center">
              {#if uploadResults.every(r => r.success)}
                <svg class="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Upload Successful!</h3>
                <p class="text-sm text-gray-600">All {uploadResults.length} file{uploadResults.length !== 1 ? 's' : ''} uploaded successfully.</p>
              {:else if uploadResults.some(r => r.success)}
                <svg class="mx-auto h-12 w-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Partial Upload Success</h3>
                <p class="text-sm text-gray-600">
                  {uploadResults.filter(r => r.success).length} of {uploadResults.length} files uploaded successfully.
                </p>
              {:else}
                <svg class="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Upload Failed</h3>
                <p class="text-sm text-gray-600">None of the files could be uploaded.</p>
              {/if}
            </div>

            <!-- Results detail -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Upload Results</h4>
              <div class="space-y-2">
                {#each uploadResults as result}
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700 truncate flex-1 mr-2">{result.file.name}</span>
                    {#if result.success}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        Success
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                        Failed
                      </span>
                    {/if}
                  </div>
                  {#if !result.success && result.error}
                    <p class="text-xs text-red-600 ml-4">{result.error}</p>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Modal footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        {#if !uploadComplete}
          <button
            onclick={handleClose}
            disabled={uploading}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Cancel'}
          </button>
        {:else}
          <button
            onclick={handleContinue}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
