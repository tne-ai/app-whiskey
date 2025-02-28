export const ReportGenerator = {
  version: 0.5,
  nodes: {
    fileType: {
      value: ""
    },
    fileContent: {
      value: ""
    },
    extractionSchema: {
      value: {
        "type": "json_schema",
        "json_schema": {
          "name": "extraction_schema",
          "schema": {
            "type": "object",
            "properties": {
              "source_document": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "invoice",
                      "csv",
                      "schedule",
                      "delivery_note"
                    ]
                  },
                  "provider": {"type": "string"},
                  "document_id": {"type": "string"},
                  "date": {
                    "type": "string"
                  },
                  "extraction_confidence": {
                    "type": "object",
                    "properties": {
                      "score": {"type": "number"},
                      "notes": {"type": "string"}
                    },
                    "additionalProperties": false,
                    "required": [
                      "score",
                      "notes"
                    ]
                  }
                },
                "additionalProperties": false,
                "required": [
                  "type",
                  "provider",
                  "document_id",
                  "date",
                  "extraction_confidence"
                ]
              },
              "ordered_items": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "item_name": {"type": "string"},
                    "material_classification": {
                      "type": "object",
                      "properties": {
                        "material": { "type": "string" },
                        "sub_material": { "type": "string" },
                        "confidence": {
                          "type": "object",
                          "properties": {
                            "score": {"type": "number"},
                            "reasoning": {"type": "string"},
                            "assumptions": {
                              "type": "array",
                              "items": {"type": "string"}
                            }
                          },
                          "additionalProperties": false,
                          "required": [
                            "score",
                            "reasoning",
                            "assumptions"
                          ]
                        }
                      },
                      "additionalProperties": false,
                      "required": [
                        "material",
                        "sub_material",
                        "confidence"
                      ]
                    },
                    "dimensions": {
                      "type": "object",
                      "properties": {
                        "length_mm": {"type": "number"},
                        "width_mm": {"type": "number"},
                        "height_mm": {"type": "number"},
                        "diameter_mm": {"type": "number"},
                        "raw_dimension_text": {"type": "string"},
                        "gauge": {"type": "string"},
                        "thread_specification": {"type": "string"},
                        "confidence": {
                          "type": "object",
                          "properties": {
                            "score": {"type": "number"},
                            "assumptions": {
                              "type": "array",
                              "items": {"type": "string"}
                            }
                          },
                          "additionalProperties": false,
                          "required": [
                            "score",
                            "assumptions"
                          ]
                        }
                      },
                      "additionalProperties": false,
                      "required": [
                        "length_mm",
                        "width_mm",
                        "height_mm",
                        "diameter_mm",
                        "raw_dimension_text",
                        "gauge",
                        "thread_specification",
                        "confidence"
                      ]
                    },
                    "quantity_specification": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "enum": [
                            "volume",
                            "count",
                            "mass",
                            "dimensional"
                          ]
                        },
                        "volume": {
                          "type": "object",
                          "properties": {
                            "value": {"type": "number"},
                            "unit": {"type": "string"},
                          },
                          "additionalProperties": false,
                          "required": [
                            "value",
                            "unit",
                          ]
                        },
                        "count": {
                          "type": "object",
                          "properties": {
                            "value": {"type": "number"},
                            "unit_type": {"type": "string"},
                            "pieces_per_pack": {"type": "number"}
                          },
                          "additionalProperties": false,
                          "required": [
                            "value",
                            "unit_type",
                            "pieces_per_pack"
                          ]
                        },
                        "mass": {
                          "type": "object",
                          "properties": {
                            "value": {"type": "number"},
                            "unit": {"type": "string"},
                          },
                          "additionalProperties": false,
                          "required": [
                            "value",
                            "unit",
                          ]
                        },
                        "piece_mass": {
                          "type": "object",
                          "properties": {
                            "value": {"type": "number"},
                            "unit": {"type": "string"}
                          },
                          "additionalProperties": false,
                          "required": [
                            "value",
                            "unit"
                          ]
                        },
                        "confidence": {
                          "type": "object",
                          "properties": {
                            "score": {"type": "number"},
                            "assumptions": {
                              "type": "array",
                              "items": {"type": "string"}
                            }
                          },
                          "additionalProperties": false,
                          "required": [
                            "score",
                            "assumptions"
                          ]
                        }
                      },
                      "additionalProperties": false,
                      "required": [
                        "type",
                        "volume",
                        "count",
                        "mass",
                        "piece_mass",
                        "confidence"
                      ]
                    },
                    "mass_calculation": {
                      "type": "object",
                      "properties": {
                        "method": {
                          "type": "string",
                          "enum": [
                            "direct_mass_measurement",
                            "count_and_piece_mass",
                            "volume_and_density",
                            "dimensional_and_density"
                          ]
                        },
                        "total_material_weight": {"type": "number"},
                        "confidence": {
                          "type": "object",
                          "properties": {
                            "score": {"type": "number"},
                            "reasoning": {"type": "string"},
                            "assumptions": {
                              "type": "array",
                              "items": {"type": "string"}
                            },
                            "conversion_steps": {
                              "type": "array",
                              "items": {"type": "string"}
                            }
                          },
                          "additionalProperties": false,
                          "required": [
                            "score",
                            "reasoning",
                            "assumptions",
                            "conversion_steps"
                          ]
                        },
                        "requires_review": {"type": "boolean"}
                      },
                      "additionalProperties": false,
                      "required": [
                        "method",
                        "total_material_weight",
                        "confidence",
                        "requires_review"
                      ]
                    },
                    "cubic_m3": {"type": "number"},
                    "unit_quantities": {"type": "number"},
                    "unit_measure": {"type": "string"},
                    "price_per_unit": {"type": "number"},
                    "purchase_cost_total": {"type": "number"},
                    "delivery_date": {
                      "type": "string"
                    },
                    "trade_provider": {"type": "string"},
                    "excess_percentage": {"type": "number"},
                    "density": {"type": "number"},
                    "weight_per_unit": {"type": "number"},
                    "waste_weight": {"type": "number"},
                    "waste_value": {"type": "number"},
                    "waste_management": {
                      "type": "object",
                      "properties": {
                        "includes": {"type": "boolean"},
                        "excludes": {"type": "boolean"},
                        "waste_plan": {"type": "boolean"},
                        "landfill": {"type": "boolean"},
                        "cleanfill": {"type": "boolean"},
                        "recycle": {"type": "boolean"},
                        "reuse": {"type": "boolean"},
                        "estimated_destination": {"type": "string"}
                      },
                      "additionalProperties": false,
                      "required": [
                        "includes",
                        "excludes",
                        "waste_plan",
                        "landfill",
                        "cleanfill",
                        "recycle",
                        "reuse",
                        "estimated_destination"
                      ]
                    }
                  },
                  "additionalProperties": false,
                  "required": [
                    "item_name",
                    "material_classification",
                    "dimensions",
                    "quantity_specification",
                    "mass_calculation",
                    "cubic_m3",
                    "unit_quantities",
                    "unit_measure",
                    "price_per_unit",
                    "purchase_cost_total",
                    "delivery_date",
                    "trade_provider",
                    "excess_percentage",
                    "density",
                    "weight_per_unit",
                    "waste_weight",
                    "waste_value",
                    "waste_management"
                  ]
                }
              },
              "logistics": {
                "type": "object",
                "properties": {
                  "vehicle_registration": {"type": "string"},
                  "delivery_address": {"type": "string"},
                  "carrier": {"type": "string"},
                  "vehicle_type": {"type": "string"},
                  "distance_km": {"type": "number"},
                  "vehicle_load_type": {
                    "type": "string",
                    "enum": [
                      "full_load",
                      "partial_load",
                      "unknown"
                    ]
                  }
                },
                "additionalProperties": false,
                "required": [
                  "vehicle_registration",
                  "delivery_address",
                  "carrier",
                  "vehicle_type",
                  "distance_km",
                  "vehicle_load_type"
                ]
              },
              "project_context": {
                "type": "object",
                "properties": {
                  "project_id": {"type": "number"},
                  "stage": {"type": "string"},
                  "site_location": {"type": "string"}
                },
                "additionalProperties": false,
                "required": [
                  "project_id",
                  "stage",
                  "site_location"
                ]
              },
              "extraction_metadata": {
                "type": "object",
                "properties": {
                  "processing_timestamp": {
                    "type": "string"
                  },
                  "extraction_version": {"type": "string"},
                  "raw_text_available": {"type": "boolean"},
                  "source_file_type": {"type": "string"},
                  "source_file_hash": {"type": "string"},
                  "overall_confidence": {
                    "type": "object",
                    "properties": {
                      "score": {"type": "number"},
                      "review_flags": {
                        "type": "array",
                        "items": {"type": "string"}
                      }
                    },
                    "additionalProperties": false,
                    "required": [
                      "score",
                      "review_flags"
                    ]
                  }
                },
                "additionalProperties": false,
                "required": [
                  "processing_timestamp",
                  "extraction_version",
                  "raw_text_available",
                  "source_file_type",
                  "source_file_hash",
                  "overall_confidence"
                ]
              }
            },
            "additionalProperties": false,
            "required": [
              "source_document",
              "ordered_items",
              "logistics",
              "project_context",
              "extraction_metadata"
            ]
          },
          "strict": true
        }
      }
    },
    extractionPrompt: {
      value: "You are an expert construction materials analyst. Your task is to analyze construction material orders and extract standardized information about material type and quantity. The final goal is to accurately determine the type and mass of the material contained in each ordered item. If only a volume is calculable from the given data, the mass will be calculated in a later process.\n" +
          "\n" +
          "Most line item descriptions include some scale data. Use common sense about the scales of various building materials when you do these extractions and associations.\n" +
          "\n" +
          "For each line item in the document:\n" +
          "\n" +
          "First identify the material and sub-material from the allowed enumerations. Pay attention to descriptive terms, brand names, and common abbreviations that indicate material types.\n" +
          "Then determine the quantity through one of these paths, in order of preference:\n" +
          "Direct mass (e.g., \"500G\", \"2.5KG\")\n" +
          "Count with known piece mass (e.g., \"100PK of 10g screws\")\n" +
          "Dimensions with density (e.g., \"90x45mm treated timber\")\n" +
          "Volume with density (e.g., \"2.5m³ concrete\")\n" +
          "Record both intensive and extensive quantities:\n" +
          "\n" +
          "Intensive: Units per package (e.g., \"500G/pack\", \"100 pieces/box\")\n" +
          "Extensive: Total number of packages ordered (e.g., \"Quantity: 42 boxes\")\n" +
          "Calculate or estimate the total material mass by:\n" +
          "\n" +
          "Direct mass: Multiply pack mass by quantity\n" +
          "Count-based: Multiply (pieces per pack × piece mass × number of packs)\n" +
          "Dimensional: Calculate volume and multiply by standard density\n" +
          "Volume-based: Multiply volume by standard density\n" +
          "Assign confidence scores (0-1) for both material classification and mass calculation:\n" +
          "\n" +
          "Material Classification Confidence:\n" +
          "\n" +
          "1.0: Exact match to enumerated material/sub-material\n" +
          "0.9: Standard industry abbreviation/brand name\n" +
          "0.8: Clear inference from product type\n" +
          "0.6: Ambiguous between similar sub-materials\n" +
          "0.4: Only main material category clear\n" +
          "0.2: Material inferred from context only\n" +
          "Mass Calculation Confidence:\n" +
          "\n" +
          "Direct Mass:\n" +
          "\n" +
          "1.0: Explicit mass in standard units\n" +
          "0.9: Mass requiring unit conversion\n" +
          "0.8: Package mass with clear unit count\n" +
          "0.6: Package mass with ambiguous count\n" +
          "Count and Piece Mass:\n" +
          "\n" +
          "1.0: Both count and piece mass stated\n" +
          "0.9: Standard item with known piece mass\n" +
          "0.8: Count clear, piece mass from reference\n" +
          "0.6: Uncertain count or piece mass\n" +
          "Dimensional:\n" +
          "\n" +
          "1.0: All dimensions explicit in standard units\n" +
          "0.9: Dimensions needing conversion\n" +
          "0.8: Standard size reference\n" +
          "0.6: Some dimensions inferred\n" +
          "0.4: Multiple dimensional assumptions\n" +
          "Volume-Based:\n" +
          "\n" +
          "1.0: Volume explicit in m³\n" +
          "0.9: Volume needing unit conversion\n" +
          "0.8: Volume from clear dimensions\n" +
          "0.6: Volume inferred from context\n" +
          "Confidence Rules:\n" +
          "\n" +
          "Final confidence = Min(Material_Confidence, Mass_Calculation_Confidence)\n" +
          "Each assumption/conversion: -0.1\n" +
          "Missing required fields: -0.3\n" +
          "Flag for review if below 0.6\n" +
          "Output each line item as a JSON object matching the schema, including these confidence scores for material classification and mass calculation. Track your path to mass calculation using the mass_calculation_method field and include your reasoning in calculation_notes.\n" +
          "For each quantity that `requires_review`, you must copy the reasoning into `review_flags` in the `extraction_metadata`.\n" +
          "\n" +
          "Materials and Submaterials:\n" +
          "\n" +
          "It's important to identify the material of a line item using only the pairings of material and sub-material shown in the schema.\n"
    },
    runImageExtraction: {
      agent: "compareAgent",
      inputs: {
        array: [":fileType", "!=", "text/csv"]
      },
    },
    imageURL: {
      agent: "stringTemplateAgent",
      inputs: {
        imageType: ":fileType",
        imageContent: ":fileContent"
      },
      params: {
        template: "data:${imageType};base64,${imageContent}"
      }
    },
    imageInputTemplate: {
      agent: "stringTemplateAgent",
      inputs: {
        "imageURL": ":imageURL",
      },
      params: {
        "template": {
          "role": "user",
          "content": [
            {
              "type": "image_url",
              "image_url": {"url": "${imageURL}"}
            },
          ]
        }
      }
    },
    extractImage: {
      agent: "openAIAgent",
      if: ":runImageExtraction",
      inputs: {
        messages: [":imageInputTemplate"],
        system: "From the given image, extract the tabular data in a CSV format."
      },
      params: {
        model: "gpt-4o"
      },
    },
    imageReport: {
      agent: "openAIAgent",
      inputs: {
        prompt: ":extractImage.text",
        system: ":extractionPrompt",
        response_format: ":extractionSchema"
      },
      params: {
        model: "gpt-4o-mini"
      },
      isResult: true,
    },
    csvReport: {
      agent: "openAIAgent",
      unless: ":runImageExtraction",
      inputs: {
        prompt: ":fileContent",
        system: ":extractionPrompt",
        response_format: ":extractionSchema"
      },
      params: {
        model: "gpt-4o-mini"
      },
      isResult: true,
    }
  }
};

