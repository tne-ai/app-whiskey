import api from './api';
import type { Site } from './sites';

export type Material = {
  material_entry_id: string;
  site_id: string;
  submaterial_id: string | null;
  quantity: number;
  unit_id: string;
  weight_kg: number | null;
  volume_m3: number | null;
  cost_per_unit: number | null;
  total_cost: number | null;
  supplier_id: string | null;
  delivery_date: string | null;
  stage_id: string | null;
  notes: string | null;
  item_id: string | null;
  arrival_doc_item_name: string | null;
  arrival_doc_id: string | null;
  is_valid: boolean;
  default_waste_pct: number | null;
  id_po: string | null;
  item_name?: string | null;
  arrival_doc_name?: string | null;
};

export type Submaterial = {
  submaterial_id: string;
  submaterial_name: string;
};

export type Unit = {
  unit_id: string;
  unit_name: string;
};

export type Supplier = {
  supplier_id: string;
  supplier_name: string;
};

export type Stage = {
  stage_id: string;
  stage_name: string;
};

export type Item = {
  item_id: string;
  item_name: string;
};

export type ArrivalDocument = {
  arrival_doc_id: string;
  arrival_doc_name: string;
};

export type PaginationParams = {
  limit: number;
  offset: number;
  order?: string;
};

export type FilterParams = {
  site_id?: string;
  submaterial_id?: string;
  unit_id?: string;
  supplier_id?: string;
  stage_id?: string;
  is_valid?: boolean;
  arrival_doc_id?: string;
};

const materialsService = {
  // Get arrival documents
  getArrivalDocuments: async () => {
    try {
      console.log('Getting arrival documents');
      const response = await api.get('/i_arrival_documents');
      console.log('Arrival documents received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting arrival documents:', error);
      throw error;
    }
  },
  
  // Get arrival document by ID
  getArrivalDocument: async (id: string) => {
    if (!id) return null;
    try {
      console.log('Getting arrival document with ID:', id);
      const url = `/i_arrival_documents?arrival_doc_id=eq.${id}`;
      
      const response = await api.get(url);
      console.log('Arrival document found:', !!response.data[0]);
      
      return response.data[0];
    } catch (error) {
      console.error('Error getting arrival document by ID:', error);
      return null;
    }
  },
  
  // Get item details
  getItems: async () => {
    try {
      console.log('Getting item details');
      const response = await api.get('/l_item_details');
      console.log('Item details received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting item details:', error);
      throw error;
    }
  },
  
  // Get an item by ID
  getItem: async (id: string) => {
    if (!id) return null;
    try {
      console.log('Getting item with ID:', id);
      const response = await api.get(`/l_item_details?item_id=eq.${id}`);
      console.log('Item found:', !!response.data[0]);
      return response.data[0];
    } catch (error) {
      console.error('Error getting item by ID:', error);
      return null;
    }
  },
  // Get materials with pagination and filtering
  getMaterials: async (pagination: PaginationParams, filters?: FilterParams) => {
    try {
      console.log('Getting materials with params:', pagination, filters);
      let queryParams = {};
      
      // Apply pagination
      queryParams = {
        ...queryParams,
        limit: pagination.limit,
        offset: pagination.offset,
      };
      
      if (pagination.order) {
        queryParams = { ...queryParams, order: pagination.order };
      }
      
      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle boolean values differently (is_valid needs special format for PostgREST)
            if (key === 'is_valid') {
              if (value === true) {
                // For true, only get records where is_valid is explicitly true
                queryParams = { ...queryParams, [key]: `eq.true` };
                console.log(`Setting ${key} filter to eq.true`);
              } else {
                // For false, get records where is_valid is false
                // Since you've updated all records to have explicit false values, we can use a simple equals
                queryParams = { ...queryParams, [key]: `eq.false` };
                console.log(`Setting ${key} filter to eq.false`);
              }
            } else {
              queryParams = { ...queryParams, [key]: `eq.${value}` };
              console.log(`Setting ${key} filter to eq.${value}`);
            }
          }
        });
      }
      
      console.log('Sending request to i_materials with params:', queryParams);
      const response = await api.get('/i_materials', { params: queryParams });
      console.log('Materials response data count:', response.data?.length || 0);
      
      // Get item details and arrival documents to merge into the materials data
      const [items, arrivalDocuments] = await Promise.all([
        materialsService.getItems(),
        materialsService.getArrivalDocuments()
      ]);
      
      const materialsWithJoinedData = response.data.map((material: Material) => {
        let result = { ...material };
        
        // Add item name if item exists
        if (material.item_id) {
          const item = items.find((i: Item) => i.item_id === material.item_id);
          if (item) {
            result.item_name = item.item_name;
          }
        }
        
        // Add arrival document name if arrival document exists
        if (material.arrival_doc_id) {
          const arrivalDoc = arrivalDocuments.find((a: ArrivalDocument) => a.arrival_doc_id === material.arrival_doc_id);
          result.arrival_doc_name = arrivalDoc?.arrival_doc_name;
        }
        
        return result;
      });
      
      return materialsWithJoinedData;
    } catch (error) {
      console.error('Error getting materials:', error);
      throw error;
    }
  },
  
  // Get material by ID
  getMaterial: async (id: string) => {
    try {
      console.log('Getting material with ID:', id);
      const response = await api.get(`/i_materials?material_entry_id=eq.${id}`);
      console.log('Material found:', !!response.data[0]);
      
      if (!response.data[0]) {
        return null;
      }
      
      const material = response.data[0];
      
      // Join item name if item_id exists
      if (material.item_id) {
        try {
          const itemResponse = await materialsService.getItem(material.item_id);
          if (itemResponse) {
            material.item_name = itemResponse.item_name;
          }
        } catch (err) {
          console.error('Error joining item data:', err);
        }
      }
      
      // Join arrival document name if arrival_doc_id exists
      if (material.arrival_doc_id) {
        console.log('Material has arrival_doc_id:', material.arrival_doc_id);
        try {
          console.log('Fetching arrival document for material:', material.material_entry_id);
          const arrivalDocResponse = await materialsService.getArrivalDocument(material.arrival_doc_id);
          console.log('Arrival doc response:', arrivalDocResponse);
          
          if (arrivalDocResponse) {
            console.log('Setting arrival_doc_name to:', arrivalDocResponse.arrival_doc_name);
            material.arrival_doc_name = arrivalDocResponse.arrival_doc_name;
          } else {
            console.log('No arrival document found for material arrival_doc_id:', material.arrival_doc_id);
          }
        } catch (err) {
          console.error('Error joining arrival document data:', err);
        }
      } else {
        console.log('Material has no arrival_doc_id');
      }
      
      return material;
    } catch (error) {
      console.error('Error getting material by ID:', error);
      throw error;
    }
  },
  
  // Create new material
  createMaterial: async (material: Omit<Material, 'material_entry_id'>) => {
    try {
      // Remove derived fields that don't exist in the database table
      const { arrival_doc_name, item_name, ...materialToSave } = material as any;
      
      console.log('Creating new material:', materialToSave);
      const response = await api.post('/i_materials', materialToSave);
      console.log('Material created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },
  
  // Update material
  updateMaterial: async (id: string, material: Partial<Material>) => {
    try {
      // Remove derived fields that don't exist in the database table
      const { arrival_doc_name, item_name, ...materialToSave } = material as any;
      
      console.log('Updating material:', id, materialToSave);
      const response = await api.patch(`/i_materials?material_entry_id=eq.${id}`, materialToSave);
      console.log('Material updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  },
  
  // Delete material
  deleteMaterial: async (id: string) => {
    try {
      console.log('Deleting material:', id);
      await api.delete(`/i_materials?material_entry_id=eq.${id}`);
      console.log('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },
  
  // Get reference data
  getSites: async () => {
    try {
      console.log('Getting sites');
      const response = await api.get('/i_sites');
      console.log('Sites received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting sites:', error);
      throw error;
    }
  },
  
  getSubmaterials: async () => {
    try {
      console.log('Getting submaterials');
      const response = await api.get('/l_submaterials');
      console.log('Submaterials received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting submaterials:', error);
      throw error;
    }
  },
  
  getUnits: async () => {
    try {
      console.log('Getting units');
      const response = await api.get('/l_units');
      console.log('Units received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting units:', error);
      throw error;
    }
  },
  
  getSuppliers: async () => {
    try {
      console.log('Getting suppliers');
      const response = await api.get('/l_suppliers');
      console.log('Suppliers received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw error;
    }
  },
  
  getStages: async () => {
    try {
      console.log('Getting stages');
      const response = await api.get('/l_stages');
      console.log('Stages received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error getting stages:', error);
      throw error;
    }
  }
};

export default materialsService;
