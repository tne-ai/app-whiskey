export interface PartialModelAnalysis {
  _parseError?: Error;
  title?: string;
  date?: string;
  documentType?: string;
  content?: string;
  metadata?: Record<string, any>;
  // Add other relevant fields based on your model output
}

// Company types
export interface ContractorCompany {
  company_id: number;
  company_name: string;
  company_address: string | null;
  email_domain: string | null;
}

// Main site types
export interface Site {
  site_id: number;
  company_id: number;
  site_name: string;
  project_name: string;
  site_type: 'Construction' | 'Deconstruction' | 'Commercial';
  site_address: string;
  land_use: string;
  build_type: 'Single Residential' | 'Development' | 'Commercial Build' | 'Infrastructure' | 'Renovation';
  construction_floor_area_sqm: number;
  estimated_project_value: number;
  stories: number | null;
  site_start_date: string; // ISO date format
  site_finish_date: string; // ISO date format
  building_owner: string | null;
  description: string | null;
  created_by_name: string | null;
  created_by_email: string | null;
}

export interface SiteStage {
  stage_id: number;
  site_id: number;
  stage_name: string;
  start_date: string; // ISO date format
  finish_date: string; // ISO date format
}

export interface SiteResourceManager {
  manager_id: number;
  site_id: number;
  company_name: string;
  manager_name: string;
  email: string | null;
  role: string | null;
  mobile: string | null;
}

// Materials and waste
export interface MaterialDensity {
  density_id: number;
  material: string;
  sub_material: string | null;
  density_kg_m3: number;
}

export interface SiteOrderedItem {
  order_id: number;
  site_id: number;
  delivery_date: string; // ISO date format
  stage: string;
  trade_provider: string;
  item_name: string;
  material: string;
  sub_material: string | null;
  excess_percentage: number;
  density: number;
  cubic_m3: number;
  weight_per_unit: number;
  total_material_weight: number;
  waste_weight: number;
  waste_value: number;
  unit_quantities: number;
  unit_measure: string;
  price_per_unit: number;
  purchase_cost_total: number;
  includes: boolean;
  excludes: boolean;
  estimated_removal_cost: number | null;
  open: boolean;
  waste_plan: boolean;
  landfill: boolean;
  cleanfill: boolean;
  recycle: boolean;
  reuse: boolean;
  estimated_destination: string | null;
  created_by_name: string | null;
  created_by_email: string | null;
}

export interface WasteProvider {
  provider_id: number;
  name: string;
  location: string;
  material_type: string;
  removal_method: 'Landfill' | 'Cleanfill' | 'Recycle' | 'Reuse';
  provider_rate: number;
  rate_unit: string;
  diversion_rate: number | null;
}

export interface SiteMaterialDiversionTarget {
  target_id: number;
  site_id: number;
  material: string;
  diversion_target_percentage: number;
  target_date: string; // ISO date format
}

// Carbon and sustainability
export interface MaterialCarbonFactor {
  factor_id: number;
  material: string;
  sub_material: string | null;
  carbon_factor: number;
  source: string | null;
  valid_from: string; // ISO date format
  valid_to: string | null; // ISO date format
}

// Team management
export interface ContractorStaff {
  staff_id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
}

export interface ProjectRole {
  role_id: number;
  role_name: string;
}

export interface SiteContractor {
  site_id: number;
  company_id: number;
  staff_id: number;
  role_id: number;
  start_date: string | null; // ISO date format
  end_date: string | null; // ISO date format
}

export interface Contractor {
  site_id: number;
  company_name: string;
  project_leader_name: string;
  project_leader_email: string | null;
  project_leader_role: string;
  project_leader_mobile: string | null;
  company_address: string | null;
}

// Environmental data (reserved for future use)
export interface SiteLogisticsEmission {
  emission_id: number;
  site_id: number;
  date: string; // ISO date format
  vehicle_type: string;
  fuel_type: string;
  distance_km: number;
  load_weight_kg: number | null;
  emission_factor: number;
  total_emissions: number;
  notes: string | null;
}

export interface SiteWaterUsage {
  usage_id: number;
  site_id: number;
  date: string; // ISO date format
  source_type: 'mains' | 'recycled' | 'transported' | 'harvested';
  volume_m3: number;
  transport_distance_km: number | null;
  notes: string | null;
}

export interface SiteElectricityUsage {
  usage_id: number;
  site_id: number;
  date: string; // ISO date format
  usage_kwh: number;
  source: 'mains_grid' | 'solar' | 'generator' | 'other';
  notes: string | null;
}

export interface EmissionFactor {
  factor_id: number;
  category: string;
  subcategory: string;
  unit: string;
  factor_value: number;
  valid_from: string; // ISO date format
  valid_to: string | null; // ISO date format
  source: string | null;
}

export interface VehicleType {
  vehicle_type_id: number;
  name: string;
  category: string;
  max_load_kg: number | null;
  fuel_type: string;
  emission_category: string;
  notes: string | null;
}

// Filter state types
export interface FilterState {
  companyId: number | null;
  siteId: number | null;
  stageId: number | null;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Formats an address by converting any decimal street number to a whole number
 * For example: "10.0405168135598 Queen Street" becomes "10 Queen Street"
 */
export function formatAddress(address: string | null): string {
  if (!address) return '';
  return address.replace(/^(\d+)\.?\d*/, (_, wholeNumber) => wholeNumber);
} 

/**
 * Formats a number as currency with commas
 * For example: 1585499 becomes $1,585,499
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '$0';
  
  // Convert to string and handle potential non-number inputs
  const numStr = String(value);
  
  // Add commas every 3 digits from the right
  let result = '';
  for (let i = 0; i < numStr.length; i++) {
    if (i > 0 && (numStr.length - i) % 3 === 0) {
      result += ',';
    }
    result += numStr[i];
  }
  
  return '$' + result;
}