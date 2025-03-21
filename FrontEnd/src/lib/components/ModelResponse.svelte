<script lang="ts">
  import type { ModelAnalysis, PartialModelAnalysis } from '$lib/types';

  // Define types for the ExtendedFinalOrderExtraction data structure
  interface Confidence {
    score: number;
    reasoning: string;
    assumptions: string[];
  }

  interface VolMassMetadata {
    calculation_method: string;
    mass_calculation_method: string;
    conversion_steps: string[];
    confidence: Confidence;
  }

  interface ExtendedFinalOrder {
    project_id: string;
    delivery_date: string;
    stage: string;
    trade_provider: string;
    item_name: string;
    material: string;
    sub_material: string;
    excess_percentage: number | string;
    density: number | string;
    cubic_m3: number | string;
    weight_per_unit: number | string;
    total_material_weight: number | string;
    waste_weight: number | string;
    waste_value: number | string;
    unit_quantities: string;
    unit_measure: string;
    price_per_unit: number | string;
    purchase_cost_total: number | string;
    estimated_removal_cost: number | string;
    estimated_destination: string;
    created_by_name: string;
    created_by_email: string;
    materials_metadata: Confidence;
    vol_mass_metadata: VolMassMetadata;
  }

  interface ExtendedFinalOrderExtraction {
    ordered_items: ExtendedFinalOrder[];
  }

  // Allow for both the original data type and the new ExtendedFinalOrderExtraction
  export let data: ModelAnalysis | PartialModelAnalysis | ExtendedFinalOrderExtraction;

  // Helper function to format confidence scores
  function formatConfidence(score: number | undefined | null): string {
    return `${((score ?? 0) * 100).toFixed(0)}%`;
  }

  // Helper function to format values that might be "Insufficient Data"
  function formatValue(value: any): string {
    if (value === undefined || value === null) return 'N/A';
    if (value === 'Insufficient Data') return 'Insufficient Data';
    if (typeof value === 'number') return value.toString();
    return value;
  }

  // Type guard to check if data is ExtendedFinalOrderExtraction
  function isExtendedFinalOrderExtraction(data: any): data is ExtendedFinalOrderExtraction {
    return data && 
           Array.isArray(data.ordered_items) && 
           data.ordered_items.length > 0 && 
           'material' in data.ordered_items[0] &&
           'materials_metadata' in data.ordered_items[0];
  }

  // Type guard to check if data is ModelAnalysis or PartialModelAnalysis
  function isModelAnalysis(data: any): data is ModelAnalysis | PartialModelAnalysis {
    return data && 
           ('source_document' in data || 'extraction_metadata' in data);
  }

  // Type guard to check if an item is a valid ExtendedFinalOrder
  function isExtendedFinalOrder(item: unknown): item is ExtendedFinalOrder {
    return (
      item !== null &&
      typeof item === 'object' &&
      'material' in item &&
      'sub_material' in item &&
      'materials_metadata' in item
    );
  }

  // Type guard to check if an item is a valid OrderedItem from the original ModelAnalysis
  function isModelAnalysisOrderedItem(item: unknown): item is ModelAnalysis['ordered_items'][0] {
    return (
      item !== null &&
      typeof item === 'object' &&
      'item_name' in item &&
      'material_classification' in item &&
      'quantity_specification' in item
    );
  }

  // Helper to safely get review flags
  const getReviewFlags = () => {
    if (isModelAnalysis(data)) {
      return data.extraction_metadata?.overall_confidence?.review_flags ?? [];
    }
    return [];
  };

  // Helper function to strip code fences if present
  function stripCodeFences(content: string): string {
    // Match opening and closing code fences for JSON
    const codeFencePattern = /^```json\n([\s\S]*?)\n```$/;
    const match = content.match(codeFencePattern);
    
    // If code fences are found, return the content between them
    // Otherwise return the original content
    return match ? match[1] : content;
  }

  // Helper to determine if an item needs review
  function needsReview(item: any): boolean {
    if (isExtendedFinalOrder(item)) {
      return (item.materials_metadata?.score ?? 0) < 0.7 || 
             (item.vol_mass_metadata?.confidence?.score ?? 0) < 0.7;
    } else if (isModelAnalysisOrderedItem(item)) {
      return item.mass_calculation?.requires_review ?? false;
    }
    return false;
  }

  // Determine if we're using the new data format
  const isNewDataFormat = isExtendedFinalOrderExtraction(data);
</script>

<div class="space-y-6">
  <!-- Document Overview -->
  {#if isModelAnalysis(data)}
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
  {/if}

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
            {#if isNewDataFormat}
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (m³)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight/Unit (kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weight (kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Confidence</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume Confidence</th>
            {:else}
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (mm)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width (mm)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height (mm)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            {/if}
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.ordered_items as item}
            {#if isNewDataFormat && isExtendedFinalOrder(item)}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.item_name || 'Unnamed Item'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.material || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.sub_material || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatValue(item.cubic_m3)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatValue(item.weight_per_unit)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatValue(item.total_material_weight)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatConfidence(item.materials_metadata?.score)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatConfidence(item.vol_mass_metadata?.confidence?.score)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class={needsReview(item) ? 
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800" :
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"}>
                    {needsReview(item) ? 'Needs Review' : 'Complete'}
                  </span>
                </td>
              </tr>
            {:else if !isNewDataFormat && isModelAnalysisOrderedItem(item)}
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
                  <span class={item.mass_calculation?.requires_review ? 
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800" :
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"}>
                    {item.mass_calculation?.requires_review ? 'Needs Review' : 'Complete'}
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

  <!-- Item Details for Extended Final Order -->
  {#if isNewDataFormat && data.ordered_items?.length}
    <section class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Item Details</h2>
      <div class="space-y-6">
        {#each data.ordered_items as item}
          {#if isExtendedFinalOrder(item)}
            <div class="border rounded-lg p-4">
              <h3 class="font-medium text-lg mb-2">{item.item_name || 'Unnamed Item'}</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Material Information -->
                <div class="space-y-2">
                  <h4 class="font-medium text-gray-700">Material Information</h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="text-gray-600">Material:</div>
                    <div>{item.material || 'Unknown'}</div>
                    <div class="text-gray-600">Sub-material:</div>
                    <div>{item.sub_material || 'Unknown'}</div>
                    <div class="text-gray-600">Confidence:</div>
                    <div>{formatConfidence(item.materials_metadata?.score)}</div>
                  </div>
                  
                  {#if item.materials_metadata?.assumptions?.length}
                    <div class="mt-2">
                      <h5 class="text-sm font-medium text-gray-700">Assumptions:</h5>
                      <ul class="list-disc list-inside text-sm text-gray-600">
                        {#each item.materials_metadata.assumptions as assumption}
                          <li>{assumption}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
                
                <!-- Volume/Mass Information -->
                <div class="space-y-2">
                  <h4 class="font-medium text-gray-700">Volume/Mass Information</h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="text-gray-600">Volume (m³):</div>
                    <div>{formatValue(item.cubic_m3)}</div>
                    <div class="text-gray-600">Weight/Unit (kg):</div>
                    <div>{formatValue(item.weight_per_unit)}</div>
                    <div class="text-gray-600">Total Weight (kg):</div>
                    <div>{formatValue(item.total_material_weight)}</div>
                    <div class="text-gray-600">Calculation Method:</div>
                    <div>{item.vol_mass_metadata?.calculation_method || 'Not specified'}</div>
                    <div class="text-gray-600">Confidence:</div>
                    <div>{formatConfidence(item.vol_mass_metadata?.confidence?.score)}</div>
                  </div>
                  
                  {#if item.vol_mass_metadata?.conversion_steps?.length}
                    <div class="mt-2">
                      <h5 class="text-sm font-medium text-gray-700">Conversion Steps:</h5>
                      <ol class="list-decimal list-inside text-sm text-gray-600">
                        {#each item.vol_mass_metadata.conversion_steps as step}
                          <li>{step}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {/if}
</div> 