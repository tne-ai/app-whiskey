// @ts-nocheck
import sql from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Site, SiteStage, SiteResourceManager } from '$lib/types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    // Parse siteId from route parameters
    const siteId = parseInt(params.siteId);
    
    if (isNaN(siteId)) {
      throw error(400, 'Invalid site ID. Must be a number.');
    }
    
    console.log(`Loading details for site ${siteId}...`);
    
    // Get site details - using tagged template literals
    const sites = await sql<Site[]>`
      SELECT * FROM sites WHERE site_id = ${siteId}
    `;
    
    if (sites.length === 0) {
      throw error(404, 'Site not found');
    }
    
    const site = sites[0];
    
    // Get site stages
    const stages = await sql<SiteStage[]>`
      SELECT * FROM site_stages 
      WHERE site_id = ${siteId} 
      ORDER BY start_date
    `;
    
    // Get resource managers
    const resourceManagers = await sql<SiteResourceManager[]>`
      SELECT * FROM site_resource_managers 
      WHERE site_id = ${siteId}
    `;
    
    return {
      site,
      stages,
      resourceManagers
    };
  } catch (e) {
    console.error('Error loading site details:', e);
    throw error(500, 'Error loading site details');
  }
}; 