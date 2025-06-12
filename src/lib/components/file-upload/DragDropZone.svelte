<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { validateFile, type ValidationOptions } from '$lib/utils/file-upload';

  interface Props {
    validationOptions: ValidationOptions;
    disabled?: boolean;
    multiple?: boolean;
  }

  let { validationOptions, disabled = false, multiple = false }: Props = $props();

  const dispatch = createEventDispatcher<{
    filesSelected: { files: File[]; isValid: boolean; errors: string[] };
  }>();

  let dragActive = $state(false);
  let fileInput: HTMLInputElement;

  function handleDragOver(event: DragEvent) {
    if (disabled) return;
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    if (disabled) return;
    event.preventDefault();
    // Only deactivate if leaving the drop zone entirely
    if (!event.currentTarget || !event.relatedTarget) {
      dragActive = false;
    }
  }

  function handleDrop(event: DragEvent) {
    if (disabled) return;
    event.preventDefault();
    dragActive = false;

    const files = Array.from(event.dataTransfer?.files || []);
    processFiles(files);
  }

  function handleFileSelect(event: Event) {
    if (disabled) return;
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    processFiles(files);
  }

  function processFiles(files: File[]) {
    if (files.length === 0) return;

    // If not multiple, only take first file
    const filesToProcess = multiple ? files : files.slice(0, 1);

    // Validate each file
    const validationResults = filesToProcess.map(file => ({
      file,
      validation: validateFile(file, validationOptions)
    }));

    const allValid = validationResults.every(result => result.validation.isValid);
    const allErrors = validationResults.flatMap(result => result.validation.errors);

    dispatch('filesSelected', {
      files: filesToProcess,
      isValid: allValid,
      errors: allErrors
    });
  }

  function handleClick() {
    if (disabled) return;
    fileInput.click();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div
  class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors
         {dragActive ? 'border-blue-500 bg-blue-50' : ''}
         {disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}"
  role="button"
  tabindex={disabled ? -1 : 0}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <input
    bind:this={fileInput}
    type="file"
    class="hidden"
    {multiple}
    accept={validationOptions.allowedTypes.join(',')}
    onchange={handleFileSelect}
    {disabled}
  />

  <div class="space-y-2">
    <svg
      class="mx-auto h-12 w-12 text-gray-400"
      stroke="currentColor"
      fill="none"
      viewBox="0 0 48 48"
    >
      <path
        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <div class="text-sm text-gray-600">
      <p class="font-medium">
        {dragActive ? 'Drop files here' : 'Drag and drop files here, or click to select'}
      </p>
      <p class="text-xs mt-1">
        Supports: {validationOptions.allowedTypes.map(type => {
          if (type === 'application/pdf') return 'PDF';
          if (type.startsWith('image/')) return type.split('/')[1].toUpperCase();
          if (type === 'text/csv') return 'CSV';
          return type;
        }).join(', ')}
      </p>
      <p class="text-xs">
        Max size: {(validationOptions.maxSize / 1024 / 1024).toFixed(1)}MB
        {multiple ? ' per file' : ''}
      </p>
    </div>
  </div>
</div>
