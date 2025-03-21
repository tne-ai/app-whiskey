import type { PartialModelAnalysis } from '$lib/types';

export function parseModelResponse(response: string): PartialModelAnalysis {
  try {
    // Handle JSON string
    let parsed;
    if (typeof response === 'string') {
      try {
        parsed = JSON.parse(response);
      } catch (e) {
        // If not valid JSON, try to extract JSON from text
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                         response.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e2) {
            throw new Error('Could not parse JSON from response');
          }
        } else {
          // If no JSON found, return the text as content
          return {
            content: response
          };
        }
      }
    } else {
      parsed = response;
    }
    
    // Return the parsed data as PartialModelAnalysis
    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      return { _parseError: error };
    }
    return { _parseError: new Error('Unknown parsing error') };
  }
} 