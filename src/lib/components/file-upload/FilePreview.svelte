<script lang="ts">
  import type { PreviewData } from '$lib/utils/file-upload/types';
  import { getFileTypeDescription } from '$lib/utils/file-upload';

  interface Props {
    file: File;
    previewData?: PreviewData | null;
  }

  let { file, previewData = null }: Props = $props();

  // Debug logging
  $effect(() => {
    console.log('📋 FilePreview props:', { 
      fileName: file?.name, 
      fileType: file?.type,
      hasPreviewData: !!previewData,
      previewData 
    });
  });
</script>

{#if file}
  <div class="file-preview border rounded-lg p-3 bg-white">
    <div class="flex items-start gap-3">
      <!-- File Info -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {getFileTypeDescription(file)} • {(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
    </div>

    <!-- Preview Content -->
    {#if previewData}
      <div class="mt-3">
        {#if previewData.type === 'image'}
          <div class="preview-image">
            <img 
              src={previewData.data} 
              alt="Preview of {file.name}"
              class="max-w-full h-auto max-h-48 rounded border"
            />
          </div>
        {:else if previewData.type === 'csv'}
          <div class="preview-csv">
            <div class="text-xs text-gray-600 mb-2">
              CSV Preview ({previewData.metadata?.previewRows || 0} of {previewData.metadata?.rows || 0} rows)
            </div>
            {#if Array.isArray(previewData.data) && previewData.data.length > 0}
              <div class="overflow-x-auto">
                <table class="min-w-full text-xs border-collapse border border-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      {#each previewData.data[0] as header, index}
                        <th class="border border-gray-200 px-2 py-1 text-left font-medium text-gray-700">
                          Column {index + 1}
                        </th>
                      {/each}
                    </tr>
                  </thead>
                  <tbody>
                    {#each previewData.data as row, rowIndex}
                      <tr class={rowIndex === 0 ? 'bg-blue-50' : rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                        {#each row as cell}
                          <td class="border border-gray-200 px-2 py-1 text-gray-800 max-w-32 truncate">
                            {cell || ''}
                          </td>
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="text-gray-500 text-sm">No data to preview</div>
            {/if}
          </div>
        {:else if previewData.type === 'pdf'}
          <div class="preview-pdf bg-gray-100 p-4 rounded border">
            <div class="flex items-center justify-center text-gray-600">
              <svg class="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div class="font-medium">PDF Preview</div>
                <div class="text-sm">{previewData.data}</div>
              </div>
            </div>
          </div>
        {:else}
          <div class="preview-text bg-gray-100 p-3 rounded border text-sm text-gray-700">
            {previewData.data}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
