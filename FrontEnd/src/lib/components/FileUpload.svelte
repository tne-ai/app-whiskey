<script lang="ts">
  import { Toast, Progressbar } from 'flowbite-svelte';
  import { appState } from '$lib/stores';
  import PdfPreview from './PdfPreview.svelte';
  import CsvPreview from './CsvPreview.svelte';
  import { convertPdfToImages, type PdfPageImage } from '$lib/utils/pdfUtils';
  import { onMount } from 'svelte';

  const { siteId } = $props<{ siteId: number }>();

  let file = $state<File | null>(null);
  let error = $state('');
  let progress = $state(0);
  let isDragging = $state(false);
  let previewUrl = $state<string | null>(null);

  // Subscribe to the store
  const isUploading = $derived($appState.isUploading);

  let uploadedFiles = $state<UploadedDocument[]>([]);

  onMount(() => {
    const stored = window.localStorage.getItem('uploadedFiles');
    if (stored) {
      uploadedFiles = JSON.parse(stored);
    }
  });

  interface UploadedDocument {
    name: string;
    uploadDate: string;
    type: string;
    status: 'success' | 'failed';
    wasteMassKg: number;
  }

  function trackDocument(uploadFile: File | null, success: boolean): void {
    if (!uploadFile) return;
    
    const newDoc: UploadedDocument = {
        name: uploadFile.name,
        uploadDate: new Date().toISOString(),
        type: uploadFile.type,
        status: success ? 'success' : 'failed',
        wasteMassKg: Math.floor(Math.random() * (1000 - 100 + 1)) + 100 // Random between 100-1000 kg
    };
    
    const stored = window.localStorage.getItem('uploadedFiles');
    const currentFiles = stored ? JSON.parse(stored) as UploadedDocument[] : [];
    const updatedFiles = [...currentFiles, newDoc];
    window.localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
  }

  $effect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      previewUrl = url;
      return () => URL.revokeObjectURL(url);
    } else {
      previewUrl = null;
    }
  });

  const handleFile = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const selectedFile = input.files?.[0];

    if (!selectedFile) {
      file = null;
      return;
    }

    // Client-side validation
    const errors = [];

    if (selectedFile.size > 10 * 1024 * 1024) {
      errors.push('File exceeds 10MB limit');
    }

    if (!['image/png', 'image/jpeg', 'application/pdf', 'text/csv'].includes(selectedFile.type)) {
      errors.push('Unsupported file type');
    }

    if (errors.length > 0) {
      error = errors.join(', ');
      file = null;
      input.value = ''; // Clear file input
    } else {
      file = selectedFile;
      error = '';
    }
  };

  const upload = async () => {
    if (!file) return;

    appState.setUploading(true);
    progress = 0;
    error = '';

    try {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // If it's a PDF, convert to images first
      if (file.type === 'application/pdf') {
        try {
          const images = await convertPdfToImages(file);
          formData.append(
            'file',
            JSON.stringify({
              type: 'pdf-images',
              images: images,
              originalName: file.name,
            })
          );
        } catch (err) {
          trackDocument(file, false);  // Track failed PDF conversion
          throw new Error('Failed to convert PDF to images: ' + (err instanceof Error ? err.message : String(err)));
        }
      } else {
        formData.append('file', file);
      }

      xhr.open('POST', '/api/documents');
      xhr.timeout = 5 * 60 * 1000; // 5m

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress = Math.round((e.loaded / e.total) * 100);
        }
      });

      interface ModelResponse {
        modelAnalysis: string;
      }

      const response = await new Promise<ModelResponse>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            trackDocument(file, true);  // Track successful upload
            const data = JSON.parse(xhr.response) as ModelResponse;
            resolve(data);
          } else {
            trackDocument(file, false);  // Track failed upload
            reject(new Error(xhr.statusText));
          }
        };

        xhr.onerror = () => {
          trackDocument(file, false);  // Track failed upload
          reject(new Error('Network error'));
        };
        xhr.send(formData);
      });

      appState.setData({
        modelAnalysis: response.modelAnalysis,
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
      appState.setError(error);
    } finally {
      appState.setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragover') {
      isDragging = true;
    } else if (e.type === 'dragleave') {
      isDragging = false;
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging = false;

    const files = e.dataTransfer?.files;
    if (files?.length) {
      handleFile({ target: { files } } as unknown as Event);
    }
  };
</script>

<div class="space-y-4">
  <label
    class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
           hover:border-blue-500 transition-colors
           {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
    ondragover={handleDrag}
    ondragleave={handleDrag}
    ondrop={handleDrop}
  >
    <input type="file" class="hidden" accept=".pdf,.png,.jpg,.jpeg,.csv" onchange={handleFile} />

    {#if file?.type.startsWith('image/')}
      <img src={previewUrl} alt="Preview" class="max-h-48 max-w-full object-contain" />
    {:else if file?.type === 'application/pdf'}
      <PdfPreview {file} />
    {:else if file?.type === 'text/csv'}
      <CsvPreview {file} />
    {:else}
      <div class="text-center space-y-2">
        <svg class="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p class="text-sm text-gray-600">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">PDF, PNG, JPG, CSV (MAX 10MB)</p>
      </div>
    {/if}
  </label>

  {#if file}
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span class="truncate">{file.name}</span>
      <span class="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
    </div>
  {/if}

  <button
    onclick={upload}
    class="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
    disabled={!file || isUploading}
  >
    {isUploading ? 'Processing...' : 'Upload File'}
  </button>

  {#if isUploading}
    <Progressbar {progress} class="mt-4" />
  {/if}

  {#if error}
    <Toast color="red" class="mt-4">
      {error}
    </Toast>
  {/if}
</div>
