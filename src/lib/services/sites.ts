import api from './api';

export interface Site {
  site_id: string;
  site_name: string;
  site_address?: string;
  site_city?: string;
  site_state?: string;
  site_postal_code?: string;
  site_country?: string;
  site_type_id?: string;
  land_use_id?: string;
  creation_date?: string;
  project_cost?: number;
  floor_area_m_2?: number;
}

export interface SiteType {
  site_type_id: string;
  site_type_name: string;
}

export interface LandUse {
  land_use_id: string;
  land_use_name: string;
}

export interface Stage {
  stage_id: string;
  stage_name: string;
}

export interface Company {
  company_name: string;
}

export interface GetSitesParams {
  company?: string;
  site_name?: string;
  stage?: string;
  city?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
}

export interface RecentActivities {
  deliveries: any[];
  removals: any[];
  logistics: any[];
  machineUsage: any[];
  waterEnergy: any[];
}

class SitesService {
  async getSites(params?: GetSitesParams): Promise<Site[]> {
    try {
      let url = '/i_sites';
      const urlParams = new URLSearchParams();
      
      // Start with basic select - we'll add joins only if needed
      let select = '*';
      
      // Add company join if filtering by company
      if (params?.company) {
        select = '*,r_site_details(company_name)';
      }
      
      urlParams.append('select', select);
      
      // Add filters
      if (params?.company) {
        urlParams.append('r_site_details.company_name', `ilike.*${params.company}*`);
      }
      
      if (params?.site_name) {
        urlParams.append('site_name', `ilike.*${params.site_name}*`);
      }
      
      if (params?.city) {
        urlParams.append('site_city', `ilike.*${params.city}*`);
      }
      
      if (params?.state) {
        urlParams.append('site_state', `ilike.*${params.state}*`);
      }
      
      if (params?.start_date) {
        urlParams.append('creation_date', `gte.${params.start_date}`);
      }
      
      if (params?.end_date) {
        urlParams.append('creation_date', `lte.${params.end_date}`);
      }
      
      // Add order by site name
      urlParams.append('order', 'site_name.asc');
      
      const queryString = urlParams.toString();
      url += `?${queryString}`;
      
      let response = await api.get(url);
      let sites = response.data;
      
      // Handle stage filtering separately since there's no FK relationship
      if (params?.stage) {
        // First get the stage_id for the selected stage name
        const stageResponse = await api.get(
          `/l_stages?select=stage_id&stage_name=ilike.*${params.stage}*`
        );
        
        if (stageResponse.data.length > 0) {
          const stageIds = stageResponse.data.map((stage: any) => stage.stage_id);
          
          // Then get site IDs that have any of these stage IDs
          const siteStageResponse = await api.get(
            `/i_sites_stages?select=site_id&stage_id=in.(${stageIds.join(',')})`
          );
          
          const siteIdsWithStage = siteStageResponse.data.map((item: any) => item.site_id);
          
          // Filter the sites to only include those with the specified stage
          sites = sites.filter((site: Site) => siteIdsWithStage.includes(site.site_id));
        } else {
          // No matching stages found, return empty array
          sites = [];
        }
      }
      
      return sites;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await api.get('/r_site_details?select=company_name&order=company_name.asc');
      // Get unique company names
      const uniqueCompanies = response.data.reduce((acc: Company[], current: any) => {
        const exists = acc.find(company => company.company_name === current.company_name);
        if (!exists && current.company_name) {
          acc.push({ company_name: current.company_name });
        }
        return acc;
      }, []);
      return uniqueCompanies;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async getStages(): Promise<Stage[]> {
    try {
      const response = await api.get('/l_stages?select=*&order=stage_name.asc');
      return response.data;
    } catch (error) {
      console.error('Error fetching stages:', error);
      throw error;
    }
  }

  async getCities(): Promise<string[]> {
    try {
      const response = await api.get('/i_sites?select=site_city&site_city=not.is.null&order=site_city.asc');
      // Get unique city names
      const uniqueCities = response.data.reduce((acc: string[], current: any) => {
        if (current.site_city && !acc.includes(current.site_city)) {
          acc.push(current.site_city);
        }
        return acc;
      }, []);
      return uniqueCities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  async getStates(): Promise<string[]> {
    try {
      const response = await api.get('/i_sites?select=site_state&site_state=not.is.null&order=site_state.asc');
      // Get unique state names
      const uniqueStates = response.data.reduce((acc: string[], current: any) => {
        if (current.site_state && !acc.includes(current.site_state)) {
          acc.push(current.site_state);
        }
        return acc;
      }, []);
      return uniqueStates;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  }

  async getSiteById(siteId: string): Promise<Site | null> {
    try {
      const response = await api.get(`/i_sites?site_id=eq.${siteId}&select=*`);
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching site:', error);
      throw error;
    }
  }

  async getSiteTypes(): Promise<SiteType[]> {
    try {
      const response = await api.get('/l_site_types?select=*');
      return response.data;
    } catch (error) {
      console.error('Error fetching site types:', error);
      throw error;
    }
  }

  async getLandUses(): Promise<LandUse[]> {
    try {
      const response = await api.get('/l_land_uses?select=*');
      return response.data;
    } catch (error) {
      console.error('Error fetching land uses:', error);
      throw error;
    }
  }

  async getRecentActivities(siteId: string): Promise<RecentActivities> {
    try {
      // Get recent deliveries (arrival documents)
      const deliveriesResponse = await api.get(
        `/i_arrival_documents?site_id=eq.${siteId}&select=*&order=delivery_date.desc&limit=3`
      );

      // Get recent removals with joined lookup tables
      const removalsResponse = await api.get(
        `/i_resource_removal?site_id=eq.${siteId}&select=*,l_submaterials(submaterial_name),l_disposal_methods(disposal_method_name),l_disposal_facilities(disposal_facility_name)&order=removal_date.desc&limit=3`
      );

      // Get recent logistics
      const logisticsResponse = await api.get(
        `/i_logistics?site_id=eq.${siteId}&select=*&order=delivery_date.desc&limit=3`
      );

      // Get recent machine usage
      const machineUsageResponse = await api.get(
        `/i_machine_usage?site_id=eq.${siteId}&select=*&order=usage_date.desc&limit=3`
      );

      // Get recent water & energy data
      const waterEnergyResponse = await api.get(
        `/i_water_energy?site_id=eq.${siteId}&select=*&order=consumption_date.desc&limit=3`
      );

      // Transform removals data to flatten joined fields
      const transformedRemovals = removalsResponse.data.map((removal: any) => ({
        ...removal,
        submaterial_name: removal.l_submaterials?.submaterial_name,
        disposal_method_name: removal.l_disposal_methods?.disposal_method_name,
        disposal_facility_name: removal.l_disposal_facilities?.disposal_facility_name
      }));

      return {
        deliveries: deliveriesResponse.data,
        removals: transformedRemovals,
        logistics: logisticsResponse.data,
        machineUsage: machineUsageResponse.data,
        waterEnergy: waterEnergyResponse.data
      };
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  async getSiteDeliveries(siteId: string, pagination?: any, filters?: any): Promise<any[]> {
    try {
      let url = `/i_arrival_documents?site_id=eq.${siteId}&select=*`;
      
      if (pagination?.order) {
        url += `&order=${pagination.order}`;
      }
      
      if (pagination?.limit) {
        url += `&limit=${pagination.limit}`;
      }
      
      if (pagination?.offset) {
        url += `&offset=${pagination.offset}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching site deliveries:', error);
      throw error;
    }
  }

  async getSiteRemovals(siteId: string, pagination?: any): Promise<any[]> {
    try {
      let url = `/i_resource_removal?site_id=eq.${siteId}&select=*,l_submaterials(submaterial_name),l_disposal_methods(disposal_method_name),l_disposal_facilities(disposal_facility_name)`;
      
      if (pagination?.order) {
        url += `&order=${pagination.order}`;
      }
      
      if (pagination?.limit) {
        url += `&limit=${pagination.limit}`;
      }
      
      if (pagination?.offset) {
        url += `&offset=${pagination.offset}`;
      }

      const response = await api.get(url);
      
      // Transform the data to flatten joined fields
      const transformedData = response.data.map((removal: any) => ({
        ...removal,
        submaterial_name: removal.l_submaterials?.submaterial_name,
        disposal_method_name: removal.l_disposal_methods?.disposal_method_name,
        disposal_facility_name: removal.l_disposal_facilities?.disposal_facility_name
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching site removals:', error);
      throw error;
    }
  }

  async getSiteLogistics(siteId: string, pagination?: any): Promise<any[]> {
    try {
      let url = `/i_logistics?site_id=eq.${siteId}&select=*`;
      
      if (pagination?.order) {
        url += `&order=${pagination.order}`;
      }
      
      if (pagination?.limit) {
        url += `&limit=${pagination.limit}`;
      }
      
      if (pagination?.offset) {
        url += `&offset=${pagination.offset}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching site logistics:', error);
      throw error;
    }
  }

  async getSiteMachineUsage(siteId: string, pagination?: any): Promise<any[]> {
    try {
      let url = `/i_machine_usage?site_id=eq.${siteId}&select=*`;
      
      if (pagination?.order) {
        url += `&order=${pagination.order}`;
      }
      
      if (pagination?.limit) {
        url += `&limit=${pagination.limit}`;
      }
      
      if (pagination?.offset) {
        url += `&offset=${pagination.offset}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching site machine usage:', error);
      throw error;
    }
  }
}

export default new SitesService();
