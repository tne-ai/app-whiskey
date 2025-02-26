import type { PartialModelAnalysis } from '$lib/types';
import { JSONParser, TokenType } from '@streamparser/json';

// Helper function to strip code fences (unchanged)
export function stripCodeFences(content: string): string {
    if (content.startsWith('```json\n')) {
        content = content.slice(8);
    }
    if (content.endsWith('\n```')) {
        content = content.slice(0, -4);
    }
    return content.trim();
}

// Main parsing function
export function parseModelResponse(response: string): PartialModelAnalysis | null {
    // Initialize result outside try block
    let result: PartialModelAnalysis = {};
    
    try {
        const jsonStr = stripCodeFences(response);

        // Try regular JSON parse first
        try {
            return JSON.parse(jsonStr) as PartialModelAnalysis;
        } catch {
            // Fallback to streaming parser will occur
        }

        // Streaming parser variables
        const parser = new JSONParser();
        const currentPath: string[] = [];
        let currentValue: any = undefined;
        let currentKey: string | null = null;
        let parseError: string | null = null;
        let topLevelValue: any = undefined;
        let hasTopLevelValue = false;

        // Helper function to set values
        const setValue = (value: any) => {
            if (currentPath.length === 0) {
                topLevelValue = value;
                hasTopLevelValue = true;
            } else {
                let target: any = result;
                for (let i = 0; i < currentPath.length; i++) {
                    const pathPart = currentPath[i];
                    if (typeof pathPart === 'string') {
                        target = target[pathPart] = target[pathPart] || {};
                    } else if (typeof pathPart === 'number') {
                        target = target[pathPart] = target[pathPart] || (i === currentPath.length - 1 ? [] : {});
                    }
                }
                if (Array.isArray(target) && currentKey === null) {
                    target.push(value);
                } else if (currentKey !== null) {
                    target[currentKey] = value;
                }
            }
        };

        // Correctly type 'token' as TokenType
        parser.onToken = ({ token, value }: { token: TokenType; value: any }) => {
            switch (token) {
                case TokenType.LEFT_BRACE:
                    if (currentKey || currentPath.length > 0) {
                        const newObj = {};
                        setValue(currentValue);
                        currentValue = newObj;
                        if (currentKey) {
                            currentPath.push(currentKey);
                        }
                        currentKey = null;
                    } else {
                        currentValue = result;
                    }
                    break;

                case TokenType.RIGHT_BRACE:
                    if (currentPath.length > 0) {
                        setValue(currentValue);
                        currentPath.pop();
                        currentValue = undefined;
                    } else {
                        setValue(currentValue);
                        currentValue = undefined;
                    }
                    break;

                case TokenType.LEFT_BRACKET:
                    if (currentKey || currentPath.length > 0) {
                        const newArr: any = [];
                        if (currentKey) {
                            currentValue[currentKey] = newArr;
                            currentPath.push(currentKey);
                        }
                        currentPath.push(newArr.length); // Track array index
                        currentValue = newArr;
                    } else {
                        currentValue = [];
                        setValue(currentValue);
                    }
                    break;

                case TokenType.RIGHT_BRACKET:
                    if (currentPath.length > 0) {
                        setValue(currentValue);
                        currentPath.pop();
                        currentValue = undefined;
                    } else {
                        setValue(currentValue);
                        currentValue = undefined;
                    }
                    break;

                case TokenType.STRING:
                    if (currentKey !== null) {
                        currentValue[currentKey] = value;
                        currentKey = null;
                    } else if (Array.isArray(currentValue)) {
                        currentValue.push(value);
                    } else {
                        setValue(value);
                    }
                    break;

                case TokenType.NUMBER:
                case TokenType.TRUE:
                case TokenType.FALSE:
                case TokenType.NULL:
                    if (currentKey !== null) {
                        currentValue[currentKey] = value;
                        currentKey = null;
                    } else if (Array.isArray(currentValue)) {
                        currentValue.push(value);
                    } else {
                        setValue(value);
                    }
                    break;

                case TokenType.COLON:
                    // Handle colon if needed
                    break;

                case TokenType.COMMA:
                    // Handle comma if needed
                    break;
            }
        };

        parser.onError = (err) => {
            parseError = err.message;
        };

        parser.write(jsonStr);
        parser.end();

        if (hasTopLevelValue && typeof topLevelValue === 'object' && topLevelValue !== null) {
            Object.assign(result, topLevelValue);
        }
        if (hasTopLevelValue && (typeof topLevelValue !== 'object' || topLevelValue === null)) {
            result.topLevelPrimitive = topLevelValue;
        }

        if (parseError) {
            result._parseError = {
                message: parseError,
                position: -1,
            };
        }

        if (Object.keys(result).length === 0 && result._parseError === undefined) {
            return {
                _parseError: {
                    message: 'No valid data could be parsed',
                    position: -1
                }
            };
        }

        return result;

    } catch (err) {
        console.error('Parsing error:', err);
        return {
            ...result,
            _parseError: {
                message: err instanceof Error ? err.message : 'Parsing error',
                position: -1
            }
        };
    }
}