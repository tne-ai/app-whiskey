// @ts-nocheck
import { error } from '@sveltejs/kit';
import sql from '$lib/server/db';
import type { PageServerLoad } from './$types';

interface Site {
  site_id: string;
  site_name: string;
  site_type: string;
  site_address: string;
}

interface MaterialBreakdown {
  material: string;
  total_weight: string;
  total_volume: string;
  total_cost: string;
  cost_percentage?: string;
  weight_percentage?: string;
}

interface MaterialHistory {
  order_id: number;
  delivery_date: string;
  stage: string;
  item_name: string | null;
  material: string;
  sub_material: string | null;
  trade_provider: string;
  unit_quantities: number;
  unit_measure: string;
  total_material_weight: number;
  cubic_m3: number;
  purchase_cost_total: number;
  excess_percentage: number;
  created_by_name: string | null;
}

interface DiversionTarget {
  diversion_target_percentage: number;
}

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  const siteId = parseInt(params.siteId);
  
  if (isNaN(siteId)) {
    throw error(400, 'Invalid site ID. Must be a number.');
  }
  
  try {
    console.log(`Loading data for site ID: ${siteId}`);
    
    // 1. Fetch basic site information
    const sites = await sql<Site[]>`
      SELECT 
        site_id::text,
        site_name,
        site_type,
        site_address
      FROM sites 
      WHERE site_id = ${siteId}
    `;
    
    // Check if site exists
    if (sites.length === 0) {
      console.error(`Site with ID ${siteId} not found`);
      throw error(404, 'Site not found');
    }
    
    const site = sites[0];
    
    // Log the site data to help with debugging
    console.log('Site data:', JSON.stringify(site));
    
    // 2. Fetch material breakdown data (for pie charts)
    const materialBreakdown = await sql<MaterialBreakdown[]>`
      SELECT 
        material,
        SUM(total_material_weight)::text as total_weight,
        SUM(cubic_m3)::text as total_volume,
        SUM(purchase_cost_total)::text as total_cost
      FROM site_ordered_items
      WHERE site_id = ${siteId}
      GROUP BY material
      ORDER BY SUM(purchase_cost_total) DESC
    `;
    
    console.log(`Material breakdown data: ${materialBreakdown.length} items`);
    
    // Calculate total cost for percentage calculations
    const totalCost = materialBreakdown.reduce((sum: number, item: MaterialBreakdown) => sum + parseFloat(item.total_cost || '0'), 0);
    const totalWeight = materialBreakdown.reduce((sum: number, item: MaterialBreakdown) => sum + parseFloat(item.total_weight || '0'), 0);
    
    console.log(`Total cost: ${totalCost}, Total weight: ${totalWeight}`);
    
    // Add percentage to each material and convert string values to numbers
    const materialsWithPercentages = materialBreakdown.map((material: MaterialBreakdown) => ({
      material: material.material,
      cost_percentage: ((parseFloat(material.total_cost || '0') / (totalCost || 1)) * 100).toFixed(1),
      weight_percentage: ((parseFloat(material.total_weight || '0') / (totalWeight || 1)) * 100).toFixed(1),
      total_weight: parseFloat(material.total_weight || '0'),
      total_volume: parseFloat(material.total_volume || '0'),
      total_cost: parseFloat(material.total_cost || '0')
    }));
    
    // 3. Fetch the most recent diversion target
    const diversionTargets = await sql<DiversionTarget[]>`
      SELECT diversion_target_percentage
      FROM site_material_diversion_targets
      WHERE site_id = ${siteId}
      ORDER BY target_date DESC
      LIMIT 1
    `;
    
    const diversionTarget = diversionTargets.length > 0 ? diversionTargets[0].diversion_target_percentage : 80; // Default if not set
    
    console.log(`Diversion target: ${diversionTarget}%`);
    
    // 4. Fetch material detailed history (for the history tab)
    const materialHistory = await sql<MaterialHistory[]>`
      SELECT 
        order_id,
        delivery_date::text,
        stage,
        item_name,
        material,
        sub_material,
        trade_provider,
        unit_quantities,
        unit_measure,
        total_material_weight,
        cubic_m3,
        purchase_cost_total,
        excess_percentage,
        created_by_name
      FROM site_ordered_items
      WHERE site_id = ${siteId}
      ORDER BY delivery_date DESC
    `;
    
    console.log(`Material history data: ${materialHistory.length} items`);
    
    // Create the response object
    const response = {
      site,
      materialsData: {
        diversionTarget,
        breakdown: materialsWithPercentages,
        history: materialHistory
      }
    };
    
    // Log the data we're returning to help with debugging
    console.log('Returning data with site:', JSON.stringify(site));
    console.log('Site ID:', site.site_id);
    console.log('Site Name:', site.site_name);
    console.log('Material breakdown:', materialsWithPercentages.length, 'items');
    console.log('Material history:', materialHistory.length, 'items');
    console.log('Response structure:', Object.keys(response));
    console.log('MaterialsData structure:', Object.keys(response.materialsData));
    
    return response;
  } catch (e) {
    console.error('Error loading site materials data:', e);
    throw error(500, 'Error loading site materials data');
  }
} 