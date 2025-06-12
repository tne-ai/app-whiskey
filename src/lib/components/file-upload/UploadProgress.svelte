<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formatFileSize, type UploadProgress } from '$lib/utils/file-upload';

  interface Props {
    file: File;
    progress: UploadProgress;
    canCancel?: boolean;
    status: 'uploading' | 'success' | 'error' | 'cancelled';
    errorMessage?: string;
  }

  let { file, progress, canCancel = true, status, errorMessage }: Props = $props();

  const dispatch = createEventDispatcher<{
    cancel: void;
    retry: void;
  }>();

  function handleCancel() {
    dispatch('cancel');
  }

  function handleRetry() {
    dispatch('retry');
  }
</script>

<div class="bg-white border rounded-lg p-4">
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center space-x-3">
      <!-- File icon -->
      <div class="flex-shrink-0">
        {#if file.type.startsWith('image/')}
          <svg class="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
        {:else if file.type === 'application/pdf'}
          <svg class="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
          </svg>
        {:else}
          <svg class="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
          </svg>
        {/if}
      </div>

      <!-- File info -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p class="text-xs text-gray-500">
          {formatFileSize(file.size)}
          {#if status === 'uploading'}
            • {formatFileSize(progress.loaded)} of {formatFileSize(progress.total)}
          {/if}
        </p>
      </div>
    </div>

    <!-- Status indicator and actions -->
    <div class="flex items-center space-x-2">
      {#if status === 'uploading'}
        <span class="text-sm text-blue-600">{progress.percentage}%</span>
        {#if canCancel}
          <button
            onclick={handleCancel}
            class="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Cancel upload"
            title="Cancel upload"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      {:else if status === 'success'}
        <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      {:else if status === 'error'}
        <button
          onclick={handleRetry}
          class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
          title="Retry upload"
        >
          Retry
        </button>
        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      {:else if status === 'cancelled'}
        <svg class="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      {/if}
    </div>
  </div>

  <!-- Progress bar -->
  {#if status === 'uploading'}
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div 
        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style="width: {progress.percentage}%"
      ></div>
    </div>
  {:else if status === 'error' && errorMessage}
    <div class="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
      {errorMessage}
    </div>
  {:else if status === 'success'}
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div class="bg-green-600 h-2 rounded-full w-full"></div>
    </div>
  {:else if status === 'cancelled'}
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div class="bg-gray-500 h-2 rounded-full w-full"></div>
    </div>
  {/if}
</div>
