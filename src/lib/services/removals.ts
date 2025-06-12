import api from './api';

// Types for Removal Records
export interface Removal {
  removal_id: string;
  site_id: string;
  submaterial_id: string;
  waste_weight_kg?: number;
  waste_volume_m3?: number;
  removal_distance_km?: number;
  removal_date?: string;
  disposal_method_id?: string;
  disposal_facility_id?: string;
  removal_cost?: number;
  removal_notes?: string;
  removal_partner_id?: string;
  appx_resource_value?: number;
  id_po?: string;
  // Joined fields for display
  submaterial_name?: string;
  disposal_method_name?: string;
  disposal_facility_name?: string;
}

export interface RemovalCreate {
  site_id: string;
  submaterial_id: string;
  waste_weight_kg?: number;
  waste_volume_m3?: number;
  removal_distance_km?: number;
  removal_date?: string;
  disposal_method_id?: string;
  disposal_facility_id?: string;
  removal_cost?: number;
  removal_notes?: string;
  removal_partner_id?: string;
  appx_resource_value?: number;
  id_po?: string;
}

export interface RemovalUpdate {
  submaterial_id?: string;
  waste_weight_kg?: number;
  waste_volume_m3?: number;
  removal_distance_km?: number;
  removal_date?: string;
  disposal_method_id?: string;
  disposal_facility_id?: string;
  removal_cost?: number;
  removal_notes?: string;
  removal_partner_id?: string;
  appx_resource_value?: number;
  id_po?: string;
}

// Lookup table types
export interface DisposalMethod {
  disposal_method_id: string;
  disposal_method_name: string;
}

export interface DisposalFacility {
  disposal_facility_id: string;
  disposal_facility_name: string;
}

export interface Submaterial {
  submaterial_id: string;
  submaterial_name: string;
  material_id?: string;
}

// Query parameters
export interface GetRemovalsParams {
  siteId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  disposalMethodId?: string;
  submaterialId?: string;
}

export interface GetRemovalsResponse {
  data: Removal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class RemovalsService {
  async getRemovals(params: GetRemovalsParams): Promise<GetRemovalsResponse> {
    let url = '/i_resource_removal';
    const urlParams = new URLSearchParams();

    // Filter by site
    urlParams.append('site_id', `eq.${params.siteId}`);

    // Date range filters
    if (params.dateFrom) {
      urlParams.append('removal_date', `gte.${params.dateFrom}`);
    }
    if (params.dateTo) {
      urlParams.append('removal_date', `lte.${params.dateTo}`);
    }

    // Other filters
    if (params.disposalMethodId) {
      urlParams.append('disposal_method_id', `eq.${params.disposalMethodId}`);
    }
    if (params.submaterialId) {
      urlParams.append('submaterial_id', `eq.${params.submaterialId}`);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    
    urlParams.append('limit', limit.toString());
    urlParams.append('offset', offset.toString());

    // Sorting
    const sortBy = params.sortBy || 'removal_date';
    const sortOrder = params.sortOrder || 'desc';
    urlParams.append('order', `${sortBy}.${sortOrder}`);

    // Select with joins for display names
    urlParams.append('select', '*,l_submaterials(submaterial_name),l_disposal_methods(disposal_method_name),l_disposal_facilities(disposal_facility_name)');

    url += '?' + urlParams.toString();

    try {
      const response = await api.get(url);
      
      // Get total count for pagination
      const countResponse = await api.get(
        `/i_resource_removal?site_id=eq.${params.siteId}&select=count`,
        { headers: { 'Prefer': 'count=exact' } }
      );

      const total = parseInt(countResponse.headers['content-range']?.split('/')[1] || '0');
      const totalPages = Math.ceil(total / limit);

      // Transform the data to flatten joined fields
      const transformedData = response.data.map((removal: any) => ({
        ...removal,
        submaterial_name: removal.l_submaterials?.submaterial_name,
        disposal_method_name: removal.l_disposal_methods?.disposal_method_name,
        disposal_facility_name: removal.l_disposal_facilities?.disposal_facility_name
      }));

      return {
        data: transformedData,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching removals:', error);
      throw error;
    }
  }

  async getRemovalById(removalId: string): Promise<Removal | null> {
    try {
      const response = await api.get(
        `/i_resource_removal?removal_id=eq.${removalId}&select=*,l_submaterials(submaterial_name),l_disposal_methods(disposal_method_name),l_disposal_facilities(disposal_facility_name)`
      );
      
      if (response.data.length === 0) return null;

      const removal = response.data[0];
      return {
        ...removal,
        submaterial_name: removal.l_submaterials?.submaterial_name,
        disposal_method_name: removal.l_disposal_methods?.disposal_method_name,
        disposal_facility_name: removal.l_disposal_facilities?.disposal_facility_name
      };
    } catch (error) {
      console.error('Error fetching removal:', error);
      throw error;
    }
  }

  async createRemoval(removal: RemovalCreate): Promise<Removal> {
    try {
      const response = await api.post('/i_resource_removal', removal);
      return response.data;
    } catch (error) {
      console.error('Error creating removal:', error);
      throw error;
    }
  }

  async updateRemoval(removalId: string, updates: RemovalUpdate): Promise<Removal> {
    try {
      const response = await api.patch(`/i_resource_removal?removal_id=eq.${removalId}`, updates);
      return response.data[0];
    } catch (error) {
      console.error('Error updating removal:', error);
      throw error;
    }
  }

  async deleteRemoval(removalId: string): Promise<void> {
    try {
      await api.delete(`/i_resource_removal?removal_id=eq.${removalId}`);
    } catch (error) {
      console.error('Error deleting removal:', error);
      throw error;
    }
  }

  // Lookup data methods
  async getDisposalMethods(): Promise<DisposalMethod[]> {
    try {
      const response = await api.get('/l_disposal_methods?select=*&order=disposal_method_name.asc');
      return response.data;
    } catch (error) {
      console.error('Error fetching disposal methods:', error);
      throw error;
    }
  }

  async getDisposalFacilities(): Promise<DisposalFacility[]> {
    try {
      const response = await api.get('/l_disposal_facilities?select=*&order=disposal_facility_name.asc');
      return response.data;
    } catch (error) {
      console.error('Error fetching disposal facilities:', error);
      throw error;
    }
  }

  async getSubmaterials(): Promise<Submaterial[]> {
    try {
      const response = await api.get('/l_submaterials?select=*&order=submaterial_name.asc');
      return response.data;
    } catch (error) {
      console.error('Error fetching submaterials:', error);
      throw error;
    }
  }
}

const removalsService = new RemovalsService();
export default removalsService;
