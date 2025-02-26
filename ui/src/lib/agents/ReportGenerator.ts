export const ReportGenerator = {
  version: 0.5,
  nodes: {
    fileType: {
      value: ""
    },
    fileContent: {
      value: ""
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
          "\n" +
          "Materials and Submaterials:\n" +
          "\n" +
          "It's important to identify the material of a line item using only the pairings of material and sub-material shown in the schema.\n" +
          "\n" +
          "Schema:\n" +
          "{\n" +
          "  \"source_document\": {\n" +
          "    \"type\": {\n" +
          "      \"enum\": [\"invoice\", \"csv\", \"schedule\", \"delivery_note\"]\n" +
          "    },\n" +
          "    \"provider\": \"string\",\n" +
          "    \"document_id\": \"string\",\n" +
          "    \"date\": \"date\",\n" +
          "    \"extraction_confidence\": {\n" +
          "      \"score\": \"number\",\n" +
          "      \"notes\": \"string\"\n" +
          "    }\n" +
          "  },\n" +
          "  \"ordered_items\": [{\n" +
          "    \"item_name\": \"string\",\n" +
          "    \"material_classification\": {\n" +
          "      \"material\": {\n" +
          "        \"type\": \"string\",\n" +
          "        \"enum\": [\n" +
          "          \"Timber\",\n" +
          "          \"Plastics\",\n" +
          "          \"Plasterboard\",\n" +
          "          \"Other Waste\",\n" +
          "          \"Metals\",\n" +
          "          \"Glass\",\n" +
          "          \"Carpet\",\n" +
          "          \"Concrete or Masonry\"\n" +
          "        ]\n" +
          "      },\n" +
          "      \"sub_material\": {\n" +
          "        \"type\": \"string\",\n" +
          "        \"enum\": [\n" +
          "          \"MDF\",\n" +
          "          \"Timber\",\n" +
          "          \"Treated\",\n" +
          "          \"Untreated\",\n" +
          "          \"Weatherboard\",\n" +
          "          \"Polystyrene\",\n" +
          "          \"Plastic - Hard\",\n" +
          "          \"Shrink Wrap (Pallets)\",\n" +
          "          \"Building Wrap\",\n" +
          "          \"HDPE\",\n" +
          "          \"Polyethene\",\n" +
          "          \"LDPE\",\n" +
          "          \"Plasterboard\",\n" +
          "          \"Linoleum\",\n" +
          "          \"Cardboard\",\n" +
          "          \"Non-Ferrous\",\n" +
          "          \"Steel\",\n" +
          "          \"Metals (mixed) e.g. metal joinery, fittings\",\n" +
          "          \"Copper (pure)\",\n" +
          "          \"Cable (copper)\",\n" +
          "          \"Brass\",\n" +
          "          \"Aluminium\",\n" +
          "          \"Glass\",\n" +
          "          \"Broadloom Carpet\",\n" +
          "          \"Carpet Tiles\",\n" +
          "          \"Underlay\",\n" +
          "          \"Tiles\",\n" +
          "          \"Fibre Cement (Cladding)\",\n" +
          "          \"Concrete-based\",\n" +
          "          \"Clay-based\",\n" +
          "          \"Ceramic\",\n" +
          "          \"Rubble\",\n" +
          "          \"Concrete\"\n" +
          "        ]\n" +
          "      },\n" +
          "      \"confidence\": {\n" +
          "        \"score\": \"number\",\n" +
          "        \"reasoning\": \"string\",\n" +
          "        \"assumptions\": [\"string\"]\n" +
          "      }\n" +
          "    },\n" +
          "    \"dimensions\": {\n" +
          "      \"length_mm\": \"number\",\n" +
          "      \"width_mm\": \"number\",\n" +
          "      \"height_mm\": \"number\",\n" +
          "      \"diameter_mm\": \"number\",\n" +
          "      \"is_linear\": \"boolean\",\n" +
          "      \"raw_dimension_text\": \"string\",\n" +
          "      \"gauge\": \"string\",\n" +
          "      \"thread_specification\": \"string\",\n" +
          "      \"confidence\": {\n" +
          "        \"score\": \"number\",\n" +
          "        \"assumptions\": [\"string\"]\n" +
          "      }\n" +
          "    },\n" +
          "    \"quantity_specification\": {\n" +
          "      \"type\": {\n" +
          "        \"enum\": [\"volume\", \"count\", \"mass\", \"dimensional\"]\n" +
          "      },\n" +
          "      \"volume\": {\n" +
          "        \"value\": \"number\",\n" +
          "        \"unit\": \"string\",\n" +
          "        \"calculation_method\": \"string\"\n" +
          "      },\n" +
          "      \"count\": {\n" +
          "        \"value\": \"number\",\n" +
          "        \"unit_type\": \"string\",\n" +
          "        \"pieces_per_pack\": \"number\"\n" +
          "      },\n" +
          "      \"mass\": {\n" +
          "        \"value\": \"number\",\n" +
          "        \"unit\": \"string\",\n" +
          "        \"is_package_mass\": \"boolean\"\n" +
          "      },\n" +
          "      \"piece_mass\": {\n" +
          "        \"value\": \"number\",\n" +
          "        \"unit\": \"string\"\n" +
          "      },\n" +
          "      \"confidence\": {\n" +
          "        \"score\": \"number\",\n" +
          "        \"assumptions\": [\"string\"]\n" +
          "      }\n" +
          "    },\n" +
          "    \"mass_calculation\": {\n" +
          "      \"method\": {\n" +
          "        \"enum\": [\n" +
          "          \"direct_mass_measurement\",\n" +
          "          \"count_and_piece_mass\",\n" +
          "          \"volume_and_density\",\n" +
          "          \"dimensional_and_density\"\n" +
          "        ]\n" +
          "      },\n" +
          "      \"total_material_weight\": \"number\",\n" +
          "      \"confidence\": {\n" +
          "        \"score\": \"number\",\n" +
          "        \"reasoning\": \"string\",\n" +
          "        \"assumptions\": [\"string\"],\n" +
          "        \"conversion_steps\": [\"string\"]\n" +
          "      },\n" +
          "      \"requires_review\": \"boolean\"\n" +
          "    },\n" +
          "    \"cubic_m3\": \"number\",\n" +
          "    \"unit_quantities\": \"number\",\n" +
          "    \"unit_measure\": \"string\",\n" +
          "    \"price_per_unit\": \"number\",\n" +
          "    \"purchase_cost_total\": \"number\",\n" +
          "    \"delivery_date\": \"date\",\n" +
          "    \"trade_provider\": \"string\",\n" +
          "    \"excess_percentage\": \"number\",\n" +
          "    \"density\": \"number\",\n" +
          "    \"weight_per_unit\": \"number\",\n" +
          "    \"waste_weight\": \"number\",\n" +
          "    \"waste_value\": \"number\",\n" +
          "    \"waste_management\": {\n" +
          "      \"includes\": \"boolean\",\n" +
          "      \"excludes\": \"boolean\",\n" +
          "      \"waste_plan\": \"boolean\",\n" +
          "      \"landfill\": \"boolean\",\n" +
          "      \"cleanfill\": \"boolean\",\n" +
          "      \"recycle\": \"boolean\",\n" +
          "      \"reuse\": \"boolean\",\n" +
          "      \"estimated_destination\": \"string\"\n" +
          "    }\n" +
          "  }],\n" +
          "  \"logistics\": {\n" +
          "    \"vehicle_registration\": \"string\",\n" +
          "    \"delivery_address\": \"string\",\n" +
          "    \"carrier\": \"string\",\n" +
          "    \"vehicle_type\": \"string\",\n" +
          "    \"distance_km\": \"number\",\n" +
          "    \"vehicle_load_type\": {\n" +
          "      \"enum\": [\"full_load\", \"partial_load\", \"unknown\"]\n" +
          "    }\n" +
          "  },\n" +
          "  \"project_context\": {\n" +
          "    \"project_id\": \"number\",\n" +
          "    \"stage\": \"string\",\n" +
          "    \"site_location\": \"string\"\n" +
          "  },\n" +
          "  \"extraction_metadata\": {\n" +
          "    \"processing_timestamp\": \"date\",\n" +
          "    \"extraction_version\": \"string\",\n" +
          "    \"raw_text_available\": \"boolean\",\n" +
          "    \"source_file_type\": \"string\",\n" +
          "    \"source_file_hash\": \"string\",\n" +
          "    \"overall_confidence\": {\n" +
          "      \"score\": \"number\",\n" +
          "      \"review_flags\": [\"string\"]\n" +
          "    }\n" +
          "  }\n" +
          "}\n" +
          "\n" +
          "Very important: Respond with ONLY JSON conforming to the schema. Do not include any backticks, code fences, comments, etc. Only respond with conforming JSON."
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
        system: ":extractionPrompt"
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
        system: ":extractionPrompt"
      },
      params: {
        model: "gpt-4o-mini"
      },
      isResult: true,
    }
  }
};

