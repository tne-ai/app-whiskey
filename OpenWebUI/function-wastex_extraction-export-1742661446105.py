"""
title: Example Filter
author: open-webui
author_url: https://github.com/open-webui
funding_url: https://github.com/open-webui
version: 0.1
"""

"""
title: Example Filter
author: open-webui
author_url: https://github.com/open-webui
funding_url: https://github.com/open-webui
version: 0.1
"""

from pydantic import BaseModel, Field, ValidationError
from typing import List, Literal, Union
from fastapi import Request

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from open_webui.models.users import Users
from open_webui.utils.chat import generate_chat_completion

import os

# Pydantic models for confidence details and material classification


class Confidence(BaseModel):
    score: float = Field(..., description="Confidence score between 0 and 1")
    reasoning: str = Field(..., description="Explanation of the confidence score")
    assumptions: List[str] = Field(
        ..., description="List of assumptions made during extraction"
    )


class MaterialClassification(BaseModel):
    material: Literal[
        "Timber",
        "Plastics",
        "Plasterboard",
        "Other Waste",
        "Metals",
        "Glass",
        "Carpet",
        "Concrete or Masonry",
        "not applicable",
    ] = Field(
        ...,
        description="Material type, must be one of the allowed enumerations or 'not applicable'",
    )
    sub_material: Literal[
        "MDF",
        "Timber",
        "Treated",
        "Untreated",
        "Weatherboard",
        "Polystyrene",
        "Plastic - Hard",
        "Shrink Wrap (Pallets)",
        "Building Wrap",
        "HDPE",
        "Polyethene",
        "LDPE",
        "Plasterboard",
        "Linoleum",
        "Cardboard",
        "Non-Ferrous",
        "Steel",
        "Metals (mixed) e.g. metal joinery, fittings",
        "Copper (pure)",
        "Cable (copper)",
        "Brass",
        "Aluminium",
        "Glass",
        "Broadloom Carpet",
        "Carpet Tiles",
        "Underlay",
        "Tiles",
        "Fibre Cement (Cladding)",
        "Concrete-based",
        "Clay-based",
        "Ceramic",
        "Rubble",
        "Concrete",
        "not applicable",
    ] = Field(
        ...,
        description="Sub-material type, must be one of the allowed enumerations or 'not applicable'",
    )
    confidence: Confidence = Field(
        ..., description="Confidence details for material classification"
    )


# Model for an ordered item (material classification extraction)


class OrderedItem(BaseModel):
    raw_data: str = Field(..., description="Original CSV row data")
    material_classification: MaterialClassification = Field(
        ..., description="Extracted material classification and confidence details"
    )


class MaterialsExtraction(BaseModel):
    ordered_items: List[OrderedItem] = Field(
        ...,
        description="List of ordered items with raw data and extracted material classification",
    )


# Pydantic models for volume/mass extraction


class VolumeMassData(BaseModel):
    total_volume_m3: Union[float, str] = Field(
        ...,
        description="Total volume in cubic meters (m³) or 'Insufficient Data' if not computable",
    )
    purchase_weight_kg: Union[float, str] = Field(
        ...,
        description="Total purchase weight in kilograms (kg) or 'Insufficient Data' if not computable",
    )
    weight_per_unit: Union[float, str] = Field(
        ...,
        description="Weight per unit in kilograms (kg per unit) or 'Insufficient Data' if not available",
    )
    calculation_method: str = Field(
        ...,
        description="Description of the general method used for volume calculation (e.g., 'rectangular', 'cylindrical', 'area with assumed thickness')",
    )
    mass_calculation_method: str = Field(
        ...,
        description="Description of how the weight was derived (e.g., 'direct_weight', 'calculated_from_volume')",
    )
    conversion_steps: List[str] = Field(
        ...,
        description="List of strings detailing every unit conversion step performed",
    )
    confidence: Confidence = Field(
        ..., description="Confidence details for volume/mass classification"
    )


class OrderedItem2(BaseModel):
    raw_data: str = Field(..., description="Original CSV row data")
    volume_mass_data: VolumeMassData = Field(
        ..., description="Extracted volume and mass information"
    )


class VolumeMassExtraction(BaseModel):
    ordered_items: List[OrderedItem2] = Field(
        ...,
        description="List of ordered items with raw data and extracted volume/mass data",
    )


# Combo model to combine material and volume/mass extraction results


class CombinedItem(BaseModel):
    raw_data: str
    volume_mass_data: VolumeMassData
    material_classification: MaterialClassification


class ComboExtraction(BaseModel):
    ordered_items: List[CombinedItem]


# Pydantic models for final order extraction


class FinalOrder(BaseModel):
    project_id: str = Field(..., description="Project ID, or 'Insufficient Data'")
    delivery_date: str = Field(
        ..., description="Delivery date in ISO format or 'Insufficient Data'"
    )
    stage: str = Field(..., description="Stage of the project or 'Insufficient Data'")
    trade_provider: str = Field(
        ..., description="Trade provider or 'Insufficient Data'"
    )
    item_name: str = Field(..., description="Item name or 'Insufficient Data'")
    material: str = Field(
        ..., description="Material type (from material_classification)"
    )
    sub_material: str = Field(
        ...,
        description="Sub-material type (from material_classification) or 'Insufficient Data'",
    )
    excess_percentage: Union[float, str] = Field(
        ..., description="Excess percentage or 'Insufficient Data'"
    )
    density: Union[float, str] = Field(
        ..., description="Density or 'Insufficient Data'"
    )
    cubic_m3: Union[float, str] = Field(
        ..., description="Volume in cubic meters (m³) or 'Insufficient Data'"
    )
    weight_per_unit: Union[float, str] = Field(
        ..., description="Weight per unit (kg) or 'Insufficient Data'"
    )
    total_material_weight: Union[float, str] = Field(
        ..., description="Total material weight (kg) or 'Insufficient Data'"
    )
    waste_weight: Union[float, str] = Field(
        ..., description="Waste weight or 'Insufficient Data'"
    )
    waste_value: Union[float, str] = Field(
        ..., description="Waste value or 'Insufficient Data'"
    )
    unit_quantities: str = Field(
        ..., description="Unit quantities or 'Insufficient Data'"
    )
    unit_measure: str = Field(..., description="Unit measure or 'Insufficient Data'")
    price_per_unit: Union[float, str] = Field(
        ..., description="Price per unit or 'Insufficient Data'"
    )
    purchase_cost_total: Union[float, str] = Field(
        ..., description="Total purchase cost or 'Insufficient Data'"
    )
    estimated_removal_cost: Union[float, str] = Field(
        ..., description="Estimated removal cost or 'Insufficient Data'"
    )
    estimated_destination: str = Field(
        ..., description="Estimated destination or 'Insufficient Data'"
    )
    created_by_name: str = Field(
        ..., description="Creator's name or 'Insufficient Data'"
    )
    created_by_email: str = Field(
        ..., description="Creator's email or 'Insufficient Data'"
    )


class VolMassMetadata(BaseModel):
    calculation_method: str
    mass_calculation_method: str
    conversion_steps: List[str]
    confidence: Confidence


class ExtendedFinalOrder(FinalOrder):
    materials_metadata: Confidence
    vol_mass_metadata: VolMassMetadata


class FinalOrderExtraction(BaseModel):
    ordered_items: List[FinalOrder] = Field(
        ..., description="List of final order objects with complete attributes"
    )


class ExtendedFinalOrderExtraction(BaseModel):
    ordered_items: List[ExtendedFinalOrder]


class Pipe:
    class Valves(BaseModel):
        MODEL_ID: str = Field(default="")
        GOOGLE_API_KEY: str = Field(default="")

    def __init__(self):
        self.valves = self.Valves(
            **{
                "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY", ""),
            }
        )

    async def pipe(self, body: dict, __user__: dict, __request__: Request) -> str:
        # Retrieve user details using the provided user id.
        user = Users.get_user_by_id(__user__["id"])

        file_body = body["messages"][-1].get("file", None)
        file_content = body["messages"][-1]["content"]
        file_type = ""
        if not file_body:
            file_type = "text/csv"
        else:
            file_type = file_body["mime_type"]

        body["stream"] = False

        # ---------------------------------------------------------------------
        # System prompt for CSV cleaning (data reorganization)
        # ---------------------------------------------------------------------
        csv_cleaning_prompt = """
        You are an expert in **data cleaning and CSV reorganization**.

        1. **Input Sources**  
           - You will receive a **messy** CSV file that may contain numerous blank rows, extraneous or repeated header lines, inconsistent formatting, merged cells, or other irregularities.
        
        2. **Output Requirements**  
           - Transform the messy CSV into a **single, well-structured** CSV table.  
           - **Retain all original data** from the input, ensuring no information is lost.  
           - Organize the data logically into rows and columns so it can be readily understood and utilized.  
        
        3. **Transformation Rules**  
           - Identify and merge any fragmented rows or columns into **cohesive** rows and columns.  
           - Remove superfluous blank lines or repeated headers while preserving **all unique content**.  
           - If the CSV contains multiple implied headers or partial row entries, unify them into a single, coherent set of column headers if possible.  
           - Ensure that each row in the final output corresponds to a single logical record.  
           - If certain data is unclear or cannot be placed definitively, place it in a separate column or note it in a way that preserves the information.
           - ENSURE you include the column names in the first row of the table.
           - When copying values that have embedded commas, ENSURE you wrap the value with quotation marks in your CSV output
        
        
        4. **Output Details**  
           - **Output only** the cleaned CSV, with no additional footers, explanatory text, or formatting.  
           - DO NOT INCLUDE ANY 'csv' HEADER ON THE FIRST ROW - OUTPUT ONLY THE CSV CONTENT (COLUMN NAMES MUST BE ON THE FIRST ROW)
           - The final CSV should have clear, consistent columns and rows that reflect **all** data from the original input.
        
        5. **Validation & Step-by-Step Reasoning**  
             1. Parse the CSV and identify meaningful column headers, data rows, and any stray text.  
             2. Organize rows and columns so they match logically and no data is lost.  
             3. Ensure every piece of information from the messy CSV has a place in the final output.  
           - Verify you have not discarded or overwritten any data.  
           - Confirm the structure is cohesive, with each record on its own row and each field in its correct column.

        Your response should contain ONLY the CSV data. Do not include any backticks ("`"), code fences, comments, etc.
        THE FIRST LINE OF YOUR OUTPUT MUST BE THE ROW OF COLUMN NAMES. IT IS IMPERATIVE THAT THE FIRST LINE OF YOUR OUTPUT IS THE ROW OF COLUMN NAMES!
        """

        # For image files, use the image extraction prompt.
        image_extraction_prompt = """
        1. Input:
           - The provided file (PDF or image) may contain one or more tables with various layouts, borders, and fonts. Tables might span multiple pages or have complex structures such as merged cells.
        
        2. Extraction Requirements:
           - Identify and extract every **product line item** present in the file that contains line items of an order.
             - Exclude or ignore any rows that do not represent actual line items (e.g., shipping or handling lines, extra charges, and other rows with no valid products in them).
           - Unify all **actual line-item** information into a single, coherent, CSV representation. Your output must be one SINGLE CSV table.
           - Preserve the original rows and columns for those line items as accurately as possible.
           - If a table has merged or nested cells, flatten the structure into a coherent CSV representation.
           - Ensure that all numerical and textual data for line items is captured without omission.
        
        3. Formatting:
           - Output only valid CSV data with the first row containing the column headers.
           - Do not include any additional text, explanations, or formatting in your output.
           - When data contains embedded commas, enclose the values in quotation marks to maintain CSV integrity.
        
        4. Validation:
           - Verify that each **actual line item** is fully and accurately extracted.
           - Confirm that the CSV output reflects the original table structures (for line items) without any loss of data.
        
        Your response should contain ONLY the CSV data. Do not include any backticks ("`"), code fences, comments, etc.
        THE FIRST LINE OF YOUR OUTPUT MUST BE THE ROW OF COLUMN NAMES. IT IS IMPERATIVE THAT THE FIRST LINE OF YOUR OUTPUT IS THE ROW OF COLUMN NAMES!
        """

        # ---------------------------------------------------------------------
        # Helper function: Calls the chat completion API with the current body,
        # validates the response against the provided Pydantic schema, and retries
        # until either a valid response is obtained or the max retries are reached.
        # This function uses and updates the nonlocal 'retry_count' variable.
        # ---------------------------------------------------------------------
        async def get_validated_response(schema_model, prompt_desc: str) -> any:
            nonlocal retry_count, max_retries, body, __request__, user, i
            while retry_count < max_retries:
                chat_call = await generate_chat_completion(__request__, body, user)
                response_content = chat_call["choices"][0]["message"]["content"]
                try:
                    validated_output = schema_model.model_validate_json(
                        response_content
                    )
                    print(f"Successfully processed {prompt_desc} batch {i}")
                    return validated_output
                except ValidationError:
                    retry_count += 1
                    print("RESPONSE CONTENT: \n\n" + response_content)
                    print("Failed, trying again")
                    continue
            return None

        # Helper function for Google Gemini API calls
        async def call_google_gemini(
            system_prompt, image_content, image_type="image/jpeg"
        ):
            # Configure Google API with the API key from environment or valves
            if not self.valves.GOOGLE_API_KEY:
                return "Error: GOOGLE_API_KEY is not set"
            genai.configure(api_key=GOOGLE_API_KEY)
            # google_api_key = "<FILL IN API KEY>"
            # genai.configure(api_key=google_api_key)
            model_id = "gemini-2.0-pro-exp"

            # Format content for Gemini API
            contents = []

            # Add system prompt as a user message (since Gemini doesn't have system role)
            if system_prompt:
                contents.append(
                    {"role": "user", "parts": [{"text": f"System: {system_prompt}"}]}
                )

            # Handle the image content
            parts = []

            # For single image
            if not isinstance(image_content, list):
                image_data = image_content
                if image_data.startswith("data:"):
                    image_data = image_data.split(",")[1]

                parts.append(
                    {"inline_data": {"mime_type": image_type, "data": image_data}}
                )
            else:
                # For multiple images (PDF case)
                for image_item in image_content:
                    if image_item.get("type") == "image_url":
                        image_url = image_item["image_url"]["url"]
                        # If it's a data URL, extract the base64 part
                        if image_url.startswith("data:"):
                            image_data = image_url.split(",")[1]
                        else:
                            image_data = image_url

                        parts.append(
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": image_data,
                                }
                            }
                        )

            # Add the parts to the contents
            contents.append({"role": "user", "parts": parts})

            # Create model and configuration
            model = genai.GenerativeModel(model_name=model_id)
            generation_config = GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                top_k=40,
                max_output_tokens=16384,
            )

            try:
                response = model.generate_content(
                    contents,
                    generation_config=generation_config,
                )
                return response.text
            except Exception as e:
                return f"Error calling Google Gemini API: {str(e)}"

        # ---------------------------------------------------------------------
        # First model call: Branch based on file type.
        # ---------------------------------------------------------------------
        if file_type == "text/csv":
            # For CSV files, use the original approach
            body["model"] = "gpt-4o"
            body["messages"][0]["content"] = csv_cleaning_prompt

            # Call the completion function to obtain the cleaned CSV output.
            first_call = await generate_chat_completion(__request__, body, user)
            first_response = first_call["choices"][0]["message"]["content"]

        elif file_type == "image/png" or file_type == "image/jpeg":
            # For image files, use Google Gemini
            print("Processing image with Google Gemini")
            first_response = await call_google_gemini(
                image_extraction_prompt, file_content, file_type
            )

        else:
            # For PDF files (which are a list of images)
            print("Processing PDF images with Google Gemini")
            first_response = await call_google_gemini(
                image_extraction_prompt, file_content
            )
        print("RECEIVED:", first_response)

        body["model"] = "gpt-4o"

        # Split the CSV output into rows and separate the header from data rows.
        rows = first_response.splitlines()
        if not rows:
            return "error in parsing rows"  # or handle error accordingly
        header_row = rows[0]
        print("HEADER ROW: \n\n", header_row)
        data_rows = rows[1:]

        # ---------------------------------------------------------------------
        # Define system prompts for the three extraction steps.
        # ---------------------------------------------------------------------
        materials_prompt = """
        You are an expert construction materials analyst. Your task is to analyze construction material orders and extract standardized information about material type and quantity.
        
        For each line item in the document:
        Identify the material and sub-material from the allowed enumerations. Pay attention to descriptive terms, brand names, and common abbreviations that indicate material types.
        Transfer the original CSV row data into the output under the 'raw_data' field.
        Assign confidence scores (0-1) for material classification:
        Material Classification Confidence:
        1.0: Exact match to enumerated material/sub-material
        0.9: Standard industry abbreviation/brand name
        0.8: Clear inference from product type
        0.6: Ambiguous between similar sub-materials
        0.4: Only main material category clear
        0.2: Material inferred from context only
        
        Materials and submaterials:
        It's also important to identify the material of a line item. You must use only the pairings of material and submaterial shown below:
        
        Timber,MDF
        Timber,Timber
        Timber,Treated
        Timber,Untreated
        Timber,Weatherboard
        Plastics,Polystyrene
        Plastics,Plastic - Hard
        Plastics,Shrink Wrap (Pallets)
        Plastics,Building Wrap
        Plastics,HDPE
        Plastics,Polyethene
        Plastics,LDPE
        Plasterboard,Plasterboard
        Other Waste,Linoleum
        Other Waste,Cardboard
        Metals,Non-Ferrous
        Metals,Steel
        Metals,"Metals (mixed) e.g. metal joinery, fittings"
        Metals,Copper (pure)
        Metals,Cable (copper)
        Metals,Brass
        Metals,Aluminium
        Glass,Glass
        Carpet,Broadloom Carpet
        Carpet,Carpet Tiles
        Carpet,Underlay
        Concrete or Masonry,Tiles
        Concrete or Masonry,Fibre Cement (Cladding)
        Concrete or Masonry,Concrete-based
        Concrete or Masonry,Clay-based
        Concrete or Masonry,Ceramic
        Concrete or Masonry,Rubble
        Concrete or Masonry,Concrete

        Important: If a line item does not pertain to material (for example, if it is not an actual item or contains no material-related information), assign "not applicable" to the material, sub_material, and the reasoning and assumptions fields within Confidence instead of forcing a classification. Assign the confidence score to be 0.
        
        Your response should conform to the following schema:
        
        {
          "ordered_items": [{
            "raw_data": "string",
            "material_classification": {
              "material": "string (one of [Timber, Plastics, Plasterboard, Other Waste, Metals, Glass, Carpet, Concrete or Masonry, not applicable])",
              "sub_material": "string (one of [MDF, Timber, Treated, Untreated, Weatherboard, Polystyrene, Plastic - Hard, Shrink Wrap (Pallets), Building Wrap, HDPE, Polyethene, LDPE, Plasterboard, Linoleum, Cardboard, Non-Ferrous, Steel, Metals (mixed) e.g. metal joinery, fittings, Copper (pure), Cable (copper), Brass, Aluminium, Glass, Broadloom Carpet, Carpet Tiles, Underlay, Tiles, Fibre Cement (Cladding), Concrete-based, Clay-based, Ceramic, Rubble, Concrete, not applicable])",
              "confidence": {
                "score": "float",
                "reasoning": "string",
                "assumptions": ["string"]
              }
            }
          }]
        }
        
        Very important: Respond with ONLY JSON conforming to the schema. Do not include any backticks ("`"), code fences, comments, etc. Only respond with conforming JSON.
        """

        volume_mass_prompt = """
        You are an expert in material quantity calculations, dimensional analysis, unit conversions, and weight extraction. Your task is to analyze a set of CSV rows representing a construction material order and extract mass (weight) data and/or standardized volume. 
        The input is provided as a list of objects, with each objection containing the raw csv data for that line item as well as a material classification. For each line item, perform the following steps and be as explicit as possible in showing all your calculation steps, assumptions, and conversion details:
        
        1. First, check if there is direct weight information in the raw_data (e.g., "500kg", "10KG", "2.5KG"). If available, record the purchase weight and, if present, the weight per unit. Document the exact source of these numbers.

        2. If direct weight data is not available, extract any available dimensional information from the input row. This may include explicit dimensions (e.g., "100x45x200 mm", "6M rebar", "Diameter 12mm, Length 6M") or implicit measurements embedded in the text. Clearly show all intermediate values. 
           - If multiple dimension sets appear in a single item description (e.g., "100 X 50 (90X45)"), prefer to use the dimensions inside the parentheses ("90X45") for your calculations.
    
        3. Determine the appropriate calculation method for volume and weight estimation:
             • For items with three dimensions, use the rectangular prism formula: Volume = Length × Width × Height (ensuring all dimensions are converted to meters).
             • For cylindrical items, use the formula: Volume = π × (Diameter/2)² × Length (with proper unit conversions).
             • If only an area is provided, assume a reasonable thickness based on industry standards and document this assumption.
           Note: These examples are provided for guidance. Think through your calculation approach based on the specific data and show every step. Use your knowledge of volume formulas to choose the correct approach given the item under consideration.
    
        4. Calculate the total volume in cubic meters (m³). If applicable, convert provided dimensions (e.g., from mm or cm to m) and document all unit conversion steps explicitly in a "conversion_steps" field. If the provided data is ambiguous or incomplete, output "Insufficient Data" for total volume.
    
        5. Assign a confidence score (between 0 and 1) based on the clarity of the provided dimensions, unit conversions, and any assumptions made. Clearly document your reasoning, list every assumption, and include explicit conversion steps.
    
        6. DO NOT infer density or weight if it is not explicitly provided. Only return weight values if they are directly given in the data. If no direct weight is provided, mark the weight fields as "Insufficient Data."
    
        7. Output your result as a JSON object with exactly one field "ordered_items", which is a list of objects. 
    
        Your response should conform to the following schema:
    
        {
          "ordered_items": [{
            "raw_data": "string",
            "volume_mass_data": {
              "total_volume_m3": "number or 'Insufficient Data'",
              "purchase_weight_kg": "number or 'Insufficient Data'",
              "weight_per_unit": "number or 'Insufficient Data'",
              "calculation_method": "string",
              "mass_calculation_method": "string",
              "conversion_steps": ["string"],
              "confidence": {
                "score": "float",
                "reasoning": "string",
                "assumptions": ["string"]
              }
            }
          }]
        }
    
        Example (demonstrating correct approach to parentheses dimensions):
    
        If the item name is "100 X 50 (90X45) Rad Nst Ut Pg Kd 28 @ 6.000 RANDOM" and the quantity is 168, and you see "@ 6.000" indicating a 6-meter length, then:
          - Extract the 90mm x 45mm as the cross-section (ignore the "100 X 50" outside the parentheses).
          - Convert 90mm to 0.09m and 45mm to 0.045m, length 6.000m to 6.0m.
          - Apply rectangular prism formula: Volume per piece = 0.09m × 0.045m × 6.0m = 0.0243m³.
          - Multiply by quantity 168 to get total volume = 168 × 0.0243m³ = 4.0824m³.
          - If no weight is explicitly mentioned, "purchase_weight_kg" and "weight_per_unit" both become "Insufficient Data."
    
        Very important: Respond with ONLY JSON conforming to the schema. Do not include any backticks ("`"), code fences, comments, etc. Only respond with conforming JSON.
        """

        final_order_prompt = """
        You are an expert in final order data extraction and mapping. Your task is to take as input a ComboExtraction – a JSON object with a single field "ordered_items", where each item contains:
          • raw_data: the original CSV row data,
          • material_classification: an object with fields "material", "sub_material", and associated confidence details,
          • volume_mass_data: an object with fields "total_volume_m3", "purchase_weight_kg", "weight_per_unit", "calculation_method", "mass_calculation_method", "conversion_steps", and confidence details.
        
        Using the information from each ComboExtraction item, map the available data into a final order object with the following attributes:
          - project_id: string (if not available, use "Insufficient Data")
          - delivery_date: string (delivery date in ISO format or "Insufficient Data")
          - stage: string (or "Insufficient Data")
          - trade_provider: string (or "Insufficient Data")
          - item_name: string
          - material: string (taken from material_classification.material)
          - sub_material: string (taken from material_classification.sub_material)
          - excess_percentage: number or "Insufficient Data"
          - density: number or "Insufficient Data"
          - cubic_m3: number (from volume_mass_data.total_volume_m3) or "Insufficient Data"
          - weight_per_unit: number (from volume_mass_data.weight_per_unit) or "Insufficient Data"
          - total_material_weight: number (from volume_mass_data.purchase_weight_kg) or "Insufficient Data"
          - waste_weight: number or "Insufficient Data"
          - waste_value: number or "Insufficient Data"
          - unit_quantities: string (or "Insufficient Data")
          - unit_measure: string (or "Insufficient Data")
          - price_per_unit: number or "Insufficient Data"
          - purchase_cost_total: number or "Insufficient Data"
          - estimated_removal_cost: number or "Insufficient Data"
          - estimated_destination: string (or "Insufficient Data")
          - created_by_name: string (or "Insufficient Data")
          - created_by_email: string (or "Insufficient Data")
        
        Important:
          • Map only the data that is present; do not force or invent values for any attribute. 
          • Ensure you fill in something meaningful for 'item_name' - do your best to deduce a reasonable item name from the 'raw_data' field
          • If an attribute is missing or cannot be reliably derived from the input ComboExtraction, set its value to "Insufficient Data".
          • Your output must be a JSON object with a single field "ordered_items", which is a list of final order objects exactly matching the schema below.
          • Do not include any extra text, code fences, or formatting. Respond with ONLY valid JSON.
        
        Your response should conform to the following schema:
        
        {
          "ordered_items": [{
            "project_id": "string",
            "delivery_date": "string",
            "stage": "string",
            "trade_provider": "string",
            "item_name": "string",
            "material": "string (from material_classification.material)",
            "sub_material": "string (from material_classification.sub_material or 'Insufficient Data')",
            "excess_percentage": "number or 'Insufficient Data'",
            "density": "number or 'Insufficient Data'",
            "cubic_m3": "number or 'Insufficient Data'",
            "weight_per_unit": "number or 'Insufficient Data'",
            "total_material_weight": "number or 'Insufficient Data'",
            "waste_weight": "number or 'Insufficient Data'",
            "waste_value": "number or 'Insufficient Data'",
            "unit_quantities": "string or 'Insufficient Data'",
            "unit_measure": "string or 'Insufficient Data'",
            "price_per_unit": "number or 'Insufficient Data'",
            "purchase_cost_total": "number or 'Insufficient Data'",
            "estimated_removal_cost": "number or 'Insufficient Data'",
            "estimated_destination": "string or 'Insufficient Data'",
            "created_by_name": "string or 'Insufficient Data'",
            "created_by_email": "string or 'Insufficient Data'"
          }]
        }

        Very important: Respond with ONLY JSON conforming to the schema. Do not include any backticks ("`"), code fences, comments, etc. Only respond with conforming JSON.
        """

        all_extracted_final_items = []
        batch_size = 20  # Process rows in batches
        max_retries = 3  # Maximum number of retries for each API call
        print("Total rows: " + str(len(data_rows)))
        print("Batch size: " + str(batch_size))
        # Process each batch of CSV data rows
        for i in range(0, len(data_rows), batch_size):
            # Reset retry counter at the beginning of each batch
            retry_count = 0

            # Create a batch that includes the header row and a subset of data rows.
            current_batch = [header_row] + data_rows[i : i + batch_size]
            print(f"Processing batch {i}")

            # ---------------------------
            # Step 1: Material Classification Extraction
            # ---------------------------
            body["messages"] = [
                {"role": "system", "content": materials_prompt},
                {
                    "role": "user",
                    "content": "Here is the table data: \n" + "\n".join(current_batch),
                },
            ]
            materials_output = await get_validated_response(
                MaterialsExtraction, "materials"
            )

            if not materials_output:
                print(f"Unsuccessfully processed batch {i}")
                return f"Unsuccessfully processed batch {i}"

            print("Materials Output: \n\n", materials_output.model_dump_json(indent=4))
            materials_metadata = [
                mat.material_classification.confidence
                for mat in materials_output.ordered_items
            ]
            # ---------------------------
            # Step 2: Volume/Mass Extraction
            # ---------------------------
            body["messages"] = [
                {"role": "system", "content": volume_mass_prompt},
                {
                    "role": "user",
                    "content": "Here are the column names (associated with the 'raw_data' attribute): \n"
                    + header_row
                    + "\n\nHere is the data: \n"
                    + materials_output.model_dump_json(indent=4),
                },
            ]
            body["model"] = "o3-mini"
            # body["model"] = "gpt-4o"
            vol_mass_output = await get_validated_response(
                VolumeMassExtraction, "vol/mass"
            )

            if not vol_mass_output:
                print(f"Unsuccessfully processed batch {i}")
                return f"Unsuccessfully processed batch {i}"

            print("Vol/Mass output: \n\n", vol_mass_output.model_dump_json(indent=4))
            vol_mass_metadata = [
                VolMassMetadata(
                    calculation_method=vm.volume_mass_data.calculation_method,
                    mass_calculation_method=vm.volume_mass_data.mass_calculation_method,
                    conversion_steps=vm.volume_mass_data.conversion_steps,
                    confidence=vm.volume_mass_data.confidence,
                )
                for vm in vol_mass_output.ordered_items
            ]

            # ---------------------------
            # Step 3: Combine Extraction Results
            # ---------------------------
            try:
                combined_items = [
                    CombinedItem(
                        raw_data=mat_item.raw_data,
                        volume_mass_data=vol_item.volume_mass_data,
                        material_classification=mat_item.material_classification,
                    )
                    for mat_item, vol_item in zip(
                        materials_output.ordered_items, vol_mass_output.ordered_items
                    )
                ]
            except (ValidationError, AttributeError, TypeError, IndexError) as e:
                print(f"Error during combination: {e}")
                return f"Error during combination: {e}"
            except Exception as e:
                print(f"Unexpected error: {e}")
                return f"Unexpected error: {e}"

            combo_extraction = ComboExtraction(ordered_items=combined_items)

            # ---------------------------
            # Step 4: Final Order Extraction
            # ---------------------------
            body["model"] = "gpt-4o"
            body["messages"] = [
                {"role": "system", "content": final_order_prompt},
                {
                    "role": "user",
                    "content": "Here are the column names (associated with the 'raw_data' attribute): \n"
                    + header_row
                    + "\n\nHere is the data: \n"
                    + combo_extraction.model_dump_json(indent=4),
                },
            ]
            final_order_output = await get_validated_response(
                FinalOrderExtraction, "final order"
            )
            if not final_order_output:
                print(f"Unsuccessfully processed batch {i}")
                return f"Unsuccessfully processed batch {i}"

            extended_final_order_output = ExtendedFinalOrderExtraction(
                ordered_items=[
                    ExtendedFinalOrder(
                        **final_order.dict(),
                        materials_metadata=materials_metadata[idx],
                        vol_mass_metadata=vol_mass_metadata[idx],
                    )
                    for idx, final_order in enumerate(final_order_output.ordered_items)
                ]
            )
            # Append the extracted final order items to the complete list.
            all_extracted_final_items.extend(extended_final_order_output.ordered_items)

        # Combine all final order items into the final extraction JSON.
        final_extraction = ExtendedFinalOrderExtraction(
            ordered_items=all_extracted_final_items
        )
        print("FINAL FINAL: \n\n" + final_extraction.model_dump_json(indent=4))
        return final_extraction.model_dump_json(indent=4)
