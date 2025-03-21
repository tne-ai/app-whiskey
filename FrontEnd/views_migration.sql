-- View mapping projects table to sites terminology
CREATE OR REPLACE VIEW public.sites AS
SELECT 
  project_id AS site_id,
  company_id,
  site_name,
  project_name,
  site_type,
  site_address,
  land_use,
  build_type,
  construction_floor_area_sqm,
  estimated_project_value,
  stories,
  site_start_date,
  site_finish_date,
  building_owner,
  description,
  created_by_name,
  created_by_email
FROM public.projects;

-- View mapping project_stages to site_stages
CREATE OR REPLACE VIEW public.site_stages AS
SELECT
  stage_id,
  project_id AS site_id,
  stage_name,
  start_date,
  finish_date
FROM public.project_stages;

-- View mapping resource_managers to use site_id terminology
CREATE OR REPLACE VIEW public.site_resource_managers AS
SELECT
  manager_id,
  project_id AS site_id,
  company_name,
  manager_name,
  email,
  role,
  mobile
FROM public.resource_managers;

-- View mapping ordered_items to use site_id terminology
CREATE OR REPLACE VIEW public.site_ordered_items AS
SELECT
  order_id,
  project_id AS site_id,
  delivery_date,
  stage,
  trade_provider,
  item_name,
  material,
  sub_material,
  excess_percentage,
  density,
  cubic_m3,
  weight_per_unit,
  total_material_weight,
  waste_weight,
  waste_value,
  unit_quantities,
  unit_measure,
  price_per_unit,
  purchase_cost_total,
  includes,
  excludes,
  estimated_removal_cost,
  open,
  waste_plan,
  landfill,
  cleanfill,
  recycle,
  reuse,
  estimated_destination,
  created_by_name,
  created_by_email
FROM public.ordered_items;

-- View mapping material_diversion_targets to use site_id terminology
CREATE OR REPLACE VIEW public.site_material_diversion_targets AS
SELECT
  target_id,
  project_id AS site_id,
  material,
  diversion_target_percentage,
  target_date
FROM public.material_diversion_targets;

-- View mapping logistics_emissions to use site_id terminology
CREATE OR REPLACE VIEW public.site_logistics_emissions AS
SELECT
  emission_id,
  project_id AS site_id,
  date,
  vehicle_type,
  fuel_type,
  distance_km,
  load_weight_kg,
  emission_factor,
  total_emissions,
  notes
FROM public.logistics_emissions;

-- View mapping water_usage to use site_id terminology
CREATE OR REPLACE VIEW public.site_water_usage AS
SELECT
  usage_id,
  project_id AS site_id,
  date,
  source_type,
  volume_m3,
  transport_distance_km,
  notes
FROM public.water_usage;

-- View mapping electricity_usage to use site_id terminology
CREATE OR REPLACE VIEW public.site_electricity_usage AS
SELECT
  usage_id,
  project_id AS site_id,
  date,
  usage_kwh,
  source,
  notes
FROM public.electricity_usage;

-- View mapping project_contractors to use site_id terminology
CREATE OR REPLACE VIEW public.site_contractors AS
SELECT
  project_id AS site_id,
  company_id,
  staff_id,
  role_id,
  start_date,
  end_date
FROM public.project_contractors;

-- Grant permissions for the views
GRANT SELECT ON public.sites TO anon, authenticated, service_role;
GRANT SELECT ON public.site_stages TO anon, authenticated, service_role;
GRANT SELECT ON public.site_resource_managers TO anon, authenticated, service_role;
GRANT SELECT ON public.site_ordered_items TO anon, authenticated, service_role;
GRANT SELECT ON public.site_material_diversion_targets TO anon, authenticated, service_role;
GRANT SELECT ON public.site_logistics_emissions TO anon, authenticated, service_role;
GRANT SELECT ON public.site_water_usage TO anon, authenticated, service_role;
GRANT SELECT ON public.site_electricity_usage TO anon, authenticated, service_role;
GRANT SELECT ON public.site_contractors TO anon, authenticated, service_role; 