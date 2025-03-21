import { error } from '@sveltejs/kit';
import sql from '$lib/server/db';
import type { PageServerLoad } from './$types';

interface Site {
  site_id: string;
  site_name: string;
  site_type: string;
  site_address: string;
  construction_floor_area_sqm: number;
}

interface DiversionTarget {
  diversion_target_percentage: number;
  target_date: string;
}

interface WasteByMaterial {
  material: string;
  waste_weight: number;
  waste_generation_rate: number;
}

interface WasteItem {
  delivery_date: string;
  stage: string;
  item_name: string | null;
  material: string;
  sub_material: string | null;
  waste_weight: number;
  cubic_m3: number;
  waste_value: number;
  estimated_removal_cost: number;
  landfill: boolean;
  cleanfill: boolean;
  recycle: boolean;
  reuse: boolean;
  estimated_destination: string;
  removal_partner: string | null;
}

interface SiteContractor {
  staff_id: number;
  name: string;
}

interface MaterialCarbonFactor {
  material: string;
  factor_value: number;
}

export const load: PageServerLoad = async ({ params }) => {
  const siteId = parseInt(params.siteId);
  
  if (isNaN(siteId)) {
    throw error(400, 'Invalid site ID. Must be a number.');
  }
  
  try {
    console.log(`Loading waste data for site ID: ${siteId}`);
    
    // 1. Fetch basic site information including floor area
    const sites = await sql<Site[]>`
      SELECT 
        site_id::text,
        site_name,
        site_type,
        site_address,
        construction_floor_area_sqm
      FROM sites 
      WHERE site_id = ${siteId}
    `;
    
    // Check if site exists
    if (sites.length === 0) {
      console.error(`Site with ID ${siteId} not found`);
      throw error(404, 'Site not found');
    }
    
    const site = sites[0];
    
    // Set a timeout promise to catch long-running queries
    const timeout = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), ms));
    
    // Utility to run a query with timeout
    const runQueryWithTimeout = async <T>(query: Promise<T>, timeoutMs = 5000): Promise<T> => {
      return Promise.race([
        query,
        timeout(timeoutMs)
      ]) as Promise<T>;
    };
    
    // 2. Fetch most recent diversion target
    const diversionTargets = await runQueryWithTimeout(sql<DiversionTarget[]>`
      SELECT 
        diversion_target_percentage,
        target_date::text
      FROM site_material_diversion_targets
      WHERE site_id = ${siteId}
      ORDER BY target_date DESC
      LIMIT 1
    `);
    
    const diversionTarget = diversionTargets.length > 0 
      ? diversionTargets[0] 
      : { diversion_target_percentage: 80, target_date: new Date().toISOString() };
    
    // 3. Calculate waste generation rate - limit to last 90 days to avoid timeout
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];
    
    const totalWaste = await runQueryWithTimeout(sql<{ total_waste: number }[]>`
      SELECT SUM(waste_weight) as total_waste
      FROM site_ordered_items
      WHERE site_id = ${siteId}
      AND delivery_date >= ${ninetyDaysAgoStr}::date
    `);
    
    const totalWasteWeight = totalWaste[0]?.total_waste || 0;
    const wasteGenerationRate = site.construction_floor_area_sqm > 0 
      ? totalWasteWeight / site.construction_floor_area_sqm 
      : 0;
    
    // 4. Fetch waste generation by material
    const wasteByMaterial = await runQueryWithTimeout(sql<WasteByMaterial[]>`
      SELECT 
        material,
        SUM(waste_weight) as waste_weight,
        SUM(waste_weight) / ${site.construction_floor_area_sqm} as waste_generation_rate
      FROM site_ordered_items
      WHERE site_id = ${siteId}
      AND delivery_date >= ${ninetyDaysAgoStr}::date
      GROUP BY material
      ORDER BY SUM(waste_weight) DESC
    `);
    
    // 5. Fetch detailed waste items for table - limit to 100 most recent items
    const wasteItems = await runQueryWithTimeout(sql<WasteItem[]>`
      SELECT 
        delivery_date::text,
        stage,
        item_name,
        material,
        sub_material,
        waste_weight,
        cubic_m3,
        waste_value,
        estimated_removal_cost,
        landfill,
        cleanfill,
        recycle,
        reuse,
        estimated_destination,
        NULL as removal_partner
      FROM site_ordered_items
      WHERE site_id = ${siteId}
      ORDER BY delivery_date DESC
      LIMIT 100
    `);
    
    // 6. Fetch active workers count
    const currentDate = new Date().toISOString().split('T')[0];
    const activeWorkers = await runQueryWithTimeout(sql<{ count: number }[]>`
      SELECT COUNT(staff_id) as count
      FROM site_contractors
      WHERE site_id = ${siteId}
      AND ${currentDate}::date BETWEEN start_date AND COALESCE(end_date, '9999-12-31'::date)
    `);
    
    const activeWorkersCount = activeWorkers[0]?.count || 0;
    
    // 7. Calculate CO2 avoided
    let co2Avoided = 0;
    try {
      console.log('Attempting to calculate CO2 avoided...');
      
      // Safely get diverted waste data
      const divertedWaste = await runQueryWithTimeout(sql<{ material: string, diverted_weight: number }[]>`
        SELECT 
          material,
          SUM(waste_weight) as diverted_weight
        FROM site_ordered_items
        WHERE site_id = ${siteId}
        AND (recycle = true OR reuse = true)
        AND delivery_date >= ${ninetyDaysAgoStr}::date
        GROUP BY material
      `);
      
      console.log('Diverted waste data:', divertedWaste);
      
      // Use a default factor for now (0.5 kg CO2 per kg of diverted waste)
      co2Avoided = divertedWaste.reduce((total, item) => total + (item.diverted_weight * 0.5), 0);
      console.log('CO2 avoided calculation complete:', co2Avoided);
    } catch (e) {
      console.error('Error calculating CO2 avoided:', e);
      co2Avoided = 0; // Ensure this is set to a default value
    }
    
    // 8. Calculate actual diversion rate
    const diversionRateQuery = await runQueryWithTimeout(sql<{ diversion_rate: number }[]>`
      SELECT 
        COALESCE(
          SUM(CASE WHEN recycle = true OR reuse = true THEN waste_weight ELSE 0 END) / 
          NULLIF(SUM(waste_weight), 0) * 100, 
          0
        ) as diversion_rate
      FROM site_ordered_items
      WHERE site_id = ${siteId}
      AND delivery_date >= ${ninetyDaysAgoStr}::date
    `);
    
    const actualDiversionRate = diversionRateQuery[0]?.diversion_rate || 0;
    
    // Prepare the response object - ensure numeric values are properly typed
    const response = {
      site,
      wasteData: {
        diversionTarget: {
          diversion_target_percentage: Number(diversionTarget.diversion_target_percentage),
          target_date: diversionTarget.target_date
        },
        wasteGenerationRate: Number(wasteGenerationRate),
        wasteByMaterial: wasteByMaterial.map(item => ({
          material: item.material,
          waste_weight: Number(item.waste_weight),
          waste_generation_rate: Number(item.waste_generation_rate)
        })),
        wasteItems: wasteItems.map(item => ({
          ...item,
          waste_weight: Number(item.waste_weight),
          cubic_m3: Number(item.cubic_m3),
          waste_value: Number(item.waste_value),
          estimated_removal_cost: Number(item.estimated_removal_cost)
        })),
        summaryMetrics: {
          totalWaste: Number(totalWasteWeight),
          diversionRate: Number(actualDiversionRate),
          co2Avoided: Number(co2Avoided),
          activeWorkers: Number(activeWorkersCount)
        }
      }
    };
    
    console.log('Successfully prepared waste data response');
    return response;
  } catch (e) {
    // Provide more specific error messages based on error type
    if (e instanceof Error) {
      if (e.message === 'Database query timeout') {
        console.error('Database query timeout loading site waste data');
        throw error(504, 'Database query timeout. Please try again.');
      }
      console.error('Error loading site waste data:', e.message);
      throw error(500, `Error loading site waste data: ${e.message}`);
    }
    
    console.error('Error loading site waste data:', e);
    throw error(500, 'Error loading site waste data');
  }
} 