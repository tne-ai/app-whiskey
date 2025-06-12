<!--
FileUploadKit.svelte - Main orchestrator component for file uploads
Handles file selection, validation, preview generation, and upload management
-->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import DragDropZone from './DragDropZone.svelte';
    import FilePreview from './FilePreview.svelte';
    import UploadProgress from './UploadProgress.svelte';
    import { generatePreview, cleanupPreview } from '../../utils/file-upload/previewGenerators';
    import { uploadFile } from '../../utils/file-upload/uploadClient';
    import type { FileUploadResult, FileValidationResult, UploadState, PreviewData } from '../../utils/file-upload/types';
  
    // Props
    interface Props {
      autoUpload?: boolean;
      showPreview?: boolean;
      uploadUrl?: string;
      acceptedTypes?: string[];
      maxFileSize?: number;
      disabled?: boolean;
      multiple?: boolean;
    }
  
    let {
      autoUpload = false,
      showPreview = true,
      uploadUrl = '/api/upload',
      acceptedTypes = ['image/*', 'application/pdf', 'text/csv'],
      maxFileSize = 10 * 1024 * 1024, // 10MB
      disabled = false,
      multiple = true
    }: Props = $props();
  
    // State
    let selectedFiles: File[] = $state([]);
    let validationErrors: string[] = $state([]);
    let uploadStates = $state(new Map<File, UploadState>());
    let previewsData = $state<Record<string, PreviewData>>({});
    let isGeneratingPreviews = $state(false);

    // Create a derived reactive lookup for previews
    let filePreviews = $derived(new Map(
      selectedFiles.map(file => [file, previewsData[`${file.name}-${file.size}-${file.lastModified}`]])
    ));

    // Helper function to get file key
    function getFileKey(file: File): string {
      return `${file.name}-${file.size}-${file.lastModified}`;
    }
  
    // Event dispatcher
    const dispatch = createEventDispatcher<{
      filesSelected: { files: File[], validationResults: FileValidationResult[] };
      uploadComplete: { results: FileUploadResult[] };
      uploadProgress: { file: File, progress: number };
      uploadError: { file: File, error: string };
    }>();
  
    // Derived state
    let hasSelectedFiles = $derived(selectedFiles.length > 0);
    let hasValidationErrors = $derived(validationErrors.length > 0);
    let hasUploading = $derived(Array.from(uploadStates.values()).some(state => state.status === 'uploading'));
    let allUploaded = $derived(selectedFiles.length > 0 && selectedFiles.every(file => {
      const state = uploadStates.get(file);
      return state?.status === 'success';
    }));

    // Create validation options for DragDropZone
    let validationOptions = $derived({
      allowedTypes: acceptedTypes,
      maxSize: maxFileSize
    });
  
    // File selection handler
    async function handleFilesSelected(event: CustomEvent<{ files: File[], isValid: boolean, errors: string[] }>) {
      const { files, isValid, errors } = event.detail;
      
      selectedFiles = files;
      validationErrors = errors;
      
      // Initialize upload states
      uploadStates.clear();
      previewsData = {};
      
      for (const file of files) {
        uploadStates.set(file, { status: 'pending', progress: 0 });
      }
  
      // Generate previews if enabled
      if (showPreview && isValid && files.length > 0) {
        await generatePreviews(files);
      }
  
      // Auto upload if enabled and validation passed
      if (autoUpload && isValid && files.length > 0) {
        await uploadAllFiles();
      }
  
      // Dispatch files selected event
      const validationResults: FileValidationResult[] = files.map(file => ({
        file,
        isValid: !errors.some(error => error.includes(file.name)),
        errors: errors.filter(error => error.includes(file.name))
      }));
  
      dispatch('filesSelected', { files, validationResults });
    }
  
    // Generate previews for all files
    async function generatePreviews(files: File[]) {
      console.log('🔍 Generating previews for files:', files.map(f => f.name));
      isGeneratingPreviews = true;
      
      for (const file of files) {
        try {
          console.log(`🔍 Generating preview for: ${file.name} (${file.type})`);
          const preview = await generatePreview(file);
          console.log(`✅ Preview generated for ${file.name}:`, preview);
          previewsData[getFileKey(file)] = preview;
          previewsData = previewsData; // Trigger reactivity
        } catch (error) {
          console.error(`❌ Failed to generate preview for ${file.name}:`, error);
          // Set a fallback preview
          previewsData[getFileKey(file)] = {
            type: 'text',
            data: 'Preview generation failed',
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            }
          };
          previewsData = previewsData; // Trigger reactivity
        }
      }
      
      isGeneratingPreviews = false;
      console.log('🔍 Preview generation complete. Current previews:', previewsData);
    }
  
    // Upload all files
    async function uploadAllFiles() {
      const results: FileUploadResult[] = [];
      
      for (const file of selectedFiles) {
        const state = uploadStates.get(file);
        if (state && state.status === 'pending') {
          const result = await uploadSingleFile(file);
          results.push(result);
        }
      }
  
      dispatch('uploadComplete', { results });
    }
  
    // Upload single file
    async function uploadSingleFile(file: File): Promise<FileUploadResult> {
      const currentState = uploadStates.get(file);
      if (!currentState) {
        return { file, success: false, error: 'File not found in upload queue' };
      }
  
      // Update state to uploading
      uploadStates.set(file, { ...currentState, status: 'uploading', progress: 0 });
  
      try {
        const result = await uploadFile(file, {
          endpoint: uploadUrl,
          onProgress: (progress) => {
            const state = uploadStates.get(file);
            if (state) {
              uploadStates.set(file, { ...state, progress: progress.percentage });
              dispatch('uploadProgress', { file, progress: progress.percentage });
            }
          }
        });
  
        // Update state to success
        uploadStates.set(file, { status: 'success', progress: 100 });
        return { file, success: true, response: result };
  
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update state to error
        uploadStates.set(file, { 
          status: 'error', 
          progress: 0, 
          errorMessage 
        });
        
        dispatch('uploadError', { file, error: errorMessage });
        return { file, success: false, error: errorMessage };
      }
    }
  
    // Cancel upload
    function handleCancel(file: File) {
      const state = uploadStates.get(file);
      if (state && state.status === 'uploading') {
        uploadStates.set(file, { ...state, status: 'cancelled', progress: 0 });
      }
    }
  
    // Retry upload
    async function handleRetry(file: File) {
      const state = uploadStates.get(file);
      if (state && (state.status === 'error' || state.status === 'cancelled')) {
        uploadStates.set(file, { ...state, status: 'pending', progress: 0, errorMessage: undefined });
        await uploadSingleFile(file);
      }
    }
  
    // Clear all files
    function clearAll() {
      // Clean up previews
      for (const preview of Object.values(previewsData)) {
        cleanupPreview(preview);
      }
      
      selectedFiles = [];
      validationErrors = [];
      uploadStates.clear();
      previewsData = {};
    }
  
    // Remove single file
    function removeFile(file: File) {
      // Clean up preview
      const fileKey = getFileKey(file);
      if (previewsData[fileKey]) {
        cleanupPreview(previewsData[fileKey]);
        delete previewsData[fileKey];
        previewsData = previewsData; // Trigger reactivity
      }
      
      // Remove from arrays and maps
      selectedFiles = selectedFiles.filter(f => f !== file);
      uploadStates.delete(file);
      
      // Clear validation errors if no files left
      if (selectedFiles.length === 0) {
        validationErrors = [];
      }
    }
  </script>
  
  <div class="file-upload-kit space-y-4">
    <!-- Drag and Drop Zone -->
    <DragDropZone
      {validationOptions}
      {disabled}
      {multiple}
      on:filesSelected={handleFilesSelected}
    />
  
    <!-- Validation Errors -->
    {#if validationErrors.length > 0}
      <div class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800">Validation Errors</h3>
            <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
              {#each validationErrors as error}
                <li>{error}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    {/if}
  
    <!-- File Preview and Upload Progress -->
    {#if selectedFiles.length > 0}
      <div class="space-y-3">
        {#each selectedFiles as file}
          {@const uploadState = uploadStates.get(file)}
          {@const preview = previewsData[getFileKey(file)]}
          {console.log('🔍 File loop debug:', { 
            fileName: file.name, 
            fileMapSize: Object.keys(previewsData).length,
            hasPreviewForThisFile: !!preview,
            previewValue: preview,
            allMapKeys: Object.keys(previewsData)
          })}
          <div class="border rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between items-start mb-3">
              <h4 class="text-sm font-medium text-gray-900">
                {file.name}
              </h4>
              <button
                onclick={() => removeFile(file)}
                class="text-gray-400 hover:text-gray-600 p-1"
                disabled={uploadState?.status === 'uploading'}
                aria-label={`Remove ${file.name}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <!-- File Preview -->
            {#if showPreview}
              <div class="mb-3">
                {#if isGeneratingPreviews && !preview}
                  <div class="flex items-center justify-center py-8 text-gray-500">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Generating preview...
                  </div>
                {:else if preview}
                  <!-- Debug preview state -->
                  {console.log('🎯 About to render FilePreview:', { 
                    fileName: file.name, 
                    showPreview, 
                    isGeneratingPreviews, 
                    hasPreview: !!preview,
                    previewType: preview?.type,
                    previewDataLength: preview?.data?.length 
                  })}
                  <FilePreview {file} previewData={preview} />
                {/if}
              </div>
            {/if}
  
            <!-- Upload Progress -->
            {#if uploadState && uploadState.status !== 'pending'}
              <UploadProgress
                {file}
                progress={{
                  loaded: (uploadState.progress / 100) * file.size,
                  total: file.size,
                  percentage: uploadState.progress
                }}
                status={uploadState.status}
                errorMessage={uploadState.error || uploadState.errorMessage}
                on:cancel={() => handleCancel(file)}
                on:retry={() => handleRetry(file)}
              />
            {/if}
          </div>
        {/each}
      </div>
  
      <!-- Action Buttons -->
      {#if !autoUpload}
        <div class="flex justify-between items-center">
          <button
            onclick={clearAll}
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={hasUploading}
          >
            Clear All
          </button>
  
          <div class="flex gap-2">
            <button
              onclick={uploadAllFiles}
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={hasValidationErrors || hasUploading || allUploaded || selectedFiles.length === 0}
            >
              {#if hasUploading}
                Uploading...
              {:else if allUploaded}
                All Uploaded
              {:else}
                Upload Files
              {/if}
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>