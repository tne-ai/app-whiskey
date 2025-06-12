// @ts-nocheck
import sql from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { ContractorCompany, Site, SiteStage } from '$lib/types';

export const load = async () => {
  try {
    console.log('Loading sites data...');
    
    // Use tagged template literals directly with the sql client
    const companies = await sql<ContractorCompany[]>`
      SELECT * FROM contractor_companies 
      ORDER BY company_name
    `;
    
    const sites = await sql<Site[]>`
      SELECT * FROM sites 
      ORDER BY site_name
    `;
    
    const stages = await sql<SiteStage[]>`
      SELECT * FROM site_stages 
      ORDER BY start_date
    `;
    
    console.log(`Loaded: ${companies.length} companies, ${sites.length} sites, ${stages.length} stages`);
    
    return {
      companies,
      sites,
      stages
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      companies: [],
      sites: [],
      stages: []
    };
  }
}; ;null as any as PageServerLoad;