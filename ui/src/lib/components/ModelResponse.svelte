<script lang="ts">
  import type { ModelAnalysis, PartialModelAnalysis } from '$lib/types';

  export let data: ModelAnalysis | PartialModelAnalysis;

  // Helper function to format confidence scores
  function formatConfidence(score: number | undefined | null): string {
    return `${((score ?? 0) * 100).toFixed(0)}%`;
  }

  // Type guard to check if an item is a valid OrderedItem
  function isValidOrderedItem(item: unknown): item is ModelAnalysis['ordered_items'][0] {
    return (
      item !== null &&
      typeof item === 'object' &&
      'item_name' in item &&
      'material_classification' in item &&
      'quantity_specification' in item
    );
  }

  // Helper to safely get review flags
  const getReviewFlags = () => data.extraction_metadata?.overall_confidence?.review_flags ?? [];

  // Helper function to strip code fences if present
  function stripCodeFences(content: string): string {
    // Match opening and closing code fences for JSON
    const codeFencePattern = /^```json\n([\s\S]*?)\n```$/;
    const match = content.match(codeFencePattern);
    
    // If code fences are found, return the content between them
    // Otherwise return the original content
    return match ? match[1] : content;
  }
</script>

<div class="space-y-6">
  <!-- Document Overview -->
  <section class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-xl font-semibold mb-4">Document Information</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <h3 class="font-medium text-gray-700">Source Document</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-600">Type:</div>
          <div>{data.source_document?.type || 'Not specified'}</div>
          <div class="text-gray-600">Provider:</div>
          <div>{data.source_document?.provider || 'Not specified'}</div>
          <div class="text-gray-600">Date:</div>
          <div>{data.source_document?.date || 'Not specified'}</div>
          <div class="text-gray-600">Confidence:</div>
          <div>{formatConfidence(data.source_document?.extraction_confidence?.score)}</div>
        </div>
      </div>
      
      <div class="space-y-2">
        <h3 class="font-medium text-gray-700">Extraction Details</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-600">Processed:</div>
          <div>{data.extraction_metadata?.processing_timestamp 
            ? new Date(data.extraction_metadata.processing_timestamp).toLocaleString()
            : 'Not specified'}</div>
          <div class="text-gray-600">Version:</div>
          <div>{data.extraction_metadata?.extraction_version || 'Not specified'}</div>
          <div class="text-gray-600">Overall Confidence:</div>
          <div>{formatConfidence(data.extraction_metadata?.overall_confidence?.score)}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Ordered Items -->
  {#if data.ordered_items?.length}
    <section class="bg-white p-6 rounded-lg shadow overflow-x-auto">
      <h2 class="text-xl font-semibold mb-4">Ordered Items</h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-material</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (mm)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width (mm)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height (mm)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.ordered_items as item}
            {#if isValidOrderedItem(item)}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.item_name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.material_classification?.material || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.material_classification?.sub_material || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.dimensions?.length_mm ?? 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.dimensions?.width_mm ?? 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.dimensions?.height_mm ?? 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity_specification?.count?.value ?? 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatConfidence(item.material_classification?.confidence?.score)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class={item.mass_calculation.requires_review ? 
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800" :
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"}>
                    {item.mass_calculation.requires_review ? 'Needs Review' : 'Complete'}
                  </span>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </section>
  {/if}

  <!-- Review Flags -->
  {#if getReviewFlags().length > 0}
    <div class="bg-yellow-50 p-4 rounded-lg">
      <h3 class="text-sm font-medium text-yellow-800">Review Required</h3>
      <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
        {#each getReviewFlags() as flag}
          <li>{flag}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div> 