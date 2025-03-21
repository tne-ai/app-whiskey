# Waste Page Data Sources
## Diversion Target Card
    Primary Source: site_material_diversion_targets view
    Required Columns:
    diversion_target_percentage, target_date
    Notes:
    Use most recent target date for current diversion target
## Waste Generation Rate Card
    Primary Source: site_ordered_items view + sites view
    Required Columns:
    waste_weight (from site_ordered_items)
    construction_floor_area_sqm (from sites)
    Calculation:
    Total waste weight / floor area = kg/m²
## Waste Generation by Material Chart
    Primary Source: site_ordered_items view
    Required Columns:
    material, waste_weight
    Aggregation Needed:
    GROUP BY material, calculate waste generation rate per material type
## Waste Data Table
    Primary Source: site_ordered_items view
    Required Columns:
    delivery_date (as removal date), stage, item_name, material, sub_material
    waste_weight, cubic_m3 (for volume), waste_value, estimated_removal_cost
    landfill, cleanfill, recycle, reuse, estimated_destination
    Related Tables:
    Join with waste_providers table for removal partner information
    Join with project_stages to get stage information
## Summary Metrics (Top Cards)
### Total Waste
    Source: site_ordered_items
    SUM of waste_weight, converted to tons
### Diversion Rate
    Source: site_ordered_items
    Calculate from waste destinations (percentage of recycle+reuse compared to total)
### CO2 Avoided
    Source: site_ordered_items + material_carbon_factors
    Calculate based on diverted materials and their carbon factors
### Active Workers
    Source: site_contractors view
    COUNT of staff_id where current date between start_date and end_date