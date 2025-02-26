// src/lib/types.ts

export interface ModelAnalysis {
  source_document: {
      type: string;
      provider: string | null;
      document_id: string | null;
      date: string | null;
      extraction_confidence: {
          score: number;
          notes: string;
      };
  };
  ordered_items: Array<{
      item_name: string;
      material_classification: {
          material: string;
          sub_material: string;
          confidence: {
              score: number;
              reasoning: string;
              assumptions: string[];
          };
      };
      dimensions: {
          width_mm: number | null;
          height_mm: number | null;
          // ... other dimension fields
      };
      quantity_specification: {
          type: string;
          count: {
              value: number;
              unit_type: string;
          };
      };
      mass_calculation: {
          requires_review: boolean;
          confidence: {
              score: number;
              reasoning: string;
          };
      };
      // Add other missing fields
  }>;
  extraction_metadata: {
      processing_timestamp: string;
      extraction_version: string;
      overall_confidence: {
          score: number;
          review_flags: string[];
      };
  };
  logistics?: Record<string, any>;
  project_context?: Record<string, any>;
}

// Update PartialModelAnalysis to match the structure more precisely
export interface PartialModelAnalysis {
  source_document?: Partial<ModelAnalysis['source_document']>;
  ordered_items?: Array<Partial<ModelAnalysis['ordered_items'][0]>>;
  extraction_metadata?: Partial<ModelAnalysis['extraction_metadata']>;
  _parseError?: {
      message: string;
      position: number;
  };
  topLevelPrimitive?: any; // Add the topLevelPrimitive
  [key: string]: any;     // Allow for other properties
}