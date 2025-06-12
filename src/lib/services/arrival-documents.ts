import api from './api';
import type { Site } from './sites';

export type ArrivalDocument = {
  arrival_doc_id: string;
  delivery_date: string | null;
  arrival_doc_name: string | null;
  arrival_doc_description: string | null;
  arrival_doc_text: string | null;
  site_id: string | null;
  site_name?: string | null;
  is_validated?: boolean;
  is_valid?: boolean;
  materials_count?: number;
  computed_is_valid?: boolean;
};

export type ArrivalDocumentCreate = {
  delivery_date: string | null;
  arrival_doc_name: string;
  arrival_doc_description: string | null;
  arrival_doc_text: string | null;
  site_id: string;
  is_valid?: boolean;
};

export type ArrivalDocumentUpdate = {
  delivery_date: string | null;
  arrival_doc_name: string;
  arrival_doc_description: string | null;
  arrival_doc_text: string | null;
  site_id: string;
  is_valid?: boolean;
};

export type GetArrivalDocumentsParams = {
  page?: number;
  limit?: number;
  siteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Legacy type aliases for backward compatibility
export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type FilterParams = {
  siteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type GetArrivalDocumentsResponse = {
  data: ArrivalDocument[];
  totalPages: number;
  totalCount: number;
};

class ArrivalDocumentsService {
  async getArrivalDocuments(params?: GetArrivalDocumentsParams): Promise<GetArrivalDocumentsResponse> {
    let url = '/i_arrival_documents';
    const urlParams = new URLSearchParams();

    // Calculate pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    // Add pagination
    urlParams.append('limit', limit.toString());
    urlParams.append('offset', offset.toString());

    // Add sorting
    if (params?.sortBy) {
      const order = `${params.sortBy}.${params.sortOrder || 'asc'}`;
      urlParams.append('order', order);
    }

    // Add site filter
    if (params?.siteId) {
      urlParams.append('site_id', `eq.${params.siteId}`);
    }

    // Get total count for pagination using Prefer header
    const countUrl = `/i_arrival_documents${params?.siteId ? `?site_id=eq.${params.siteId}` : ''}`;
    
    try {
      const [dataResponse, countResponse] = await Promise.all([
        api.get(`${url}?${urlParams.toString()}`),
        api.get(countUrl, {
          headers: {
            'Prefer': 'count=exact'
          }
        })
      ]);

      const documents = dataResponse.data;
      const totalCount = parseInt(countResponse.headers['content-range']?.split('/')[1] || '0');
      const totalPages = Math.ceil(totalCount / limit);
      
      // Fetch site names for all documents
      if (documents && documents.length > 0) {
        // Get unique site IDs
        const siteIds = [...new Set(documents.map((doc: ArrivalDocument) => doc.site_id).filter(Boolean))];
        
        if (siteIds.length > 0) {
          try {
            // Fetch all sites in one call
            const sitesResponse = await api.get(`/i_sites?site_id=in.(${siteIds.join(',')})`);
            const sites = sitesResponse.data;
            
            // Create a map of site_id to site_name
            const siteMap = new Map<string, string>();
            sites.forEach((site: Site) => {
              siteMap.set(site.site_id, site.site_name);
            });
            
            // Add site names to documents
            documents.forEach((doc: ArrivalDocument) => {
              if (doc.site_id) {
                doc.site_name = siteMap.get(doc.site_id) || null;
              }
            });
          } catch (error: any) {
            console.error('Error fetching site names:', error);
          }
        }
      }

      // Fetch materials for validation status
      if (documents && documents.length > 0) {
        const docIds = documents.map((doc: ArrivalDocument) => doc.arrival_doc_id);
        
        try {
          const materialsResponse = await api.get(`/i_materials?arrival_doc_id=in.(${docIds.join(',')})`);
          const materials = materialsResponse.data;
          
          // Group materials by arrival_doc_id and calculate validation status
          const materialsByDoc = new Map<string, any[]>();
          materials.forEach((material: any) => {
            if (!materialsByDoc.has(material.arrival_doc_id)) {
              materialsByDoc.set(material.arrival_doc_id, []);
            }
            materialsByDoc.get(material.arrival_doc_id)?.push(material);
          });
          
          // Add computed validation status to each document
          documents.forEach((doc: ArrivalDocument) => {
            const docMaterials = materialsByDoc.get(doc.arrival_doc_id) || [];
            doc.materials_count = docMaterials.length;
            
            // Document is valid if all materials are valid
            doc.computed_is_valid = docMaterials.length > 0 && 
              docMaterials.every((material: any) => material.is_valid === true);
          });
        } catch (error: any) {
          console.error('Error fetching materials for validation:', error);
          // Set default validation status
          documents.forEach((doc: ArrivalDocument) => {
            doc.materials_count = 0;
            doc.computed_is_valid = false;
          });
        }
      }

      return {
        data: documents,
        totalPages,
        totalCount
      };
    } catch (error: any) {
      console.error('Error fetching arrival documents:', error);
      throw error;
    }
  }

  async getArrivalDocument(id: string): Promise<ArrivalDocument> {
    const response = await api.get(`/i_arrival_documents?arrival_doc_id=eq.${id}`);
    const document = response.data[0];
    
    // If document has a site_id, fetch the site name
    if (document && document.site_id) {
      try {
        const siteResponse = await api.get(`/i_sites?site_id=eq.${document.site_id}&select=site_name`);
        if (siteResponse.data && siteResponse.data[0]) {
          document.site_name = siteResponse.data[0].site_name;
        }
      } catch (err: any) {
        console.error('Error fetching site name:', err);
        document.site_name = null;
      }
    }
    
    return document;
  }

  async createArrivalDocument(document: ArrivalDocumentCreate): Promise<ArrivalDocument> {
    const response = await api.post('/i_arrival_documents', document);
    return response.data;
  }

  async updateArrivalDocument(id: string, document: ArrivalDocumentUpdate): Promise<ArrivalDocument> {
    const response = await api.patch(`/i_arrival_documents?arrival_doc_id=eq.${id}`, document);
    return response.data;
  }

  async deleteArrivalDocument(id: string): Promise<void> {
    await api.delete(`/i_arrival_documents?arrival_doc_id=eq.${id}`);
  }

  async getSites(): Promise<Site[]> {
    const response = await api.get('/i_sites');
    return response.data;
  }

  async getArrivalDocumentMaterials(arrivalDocId: string): Promise<any[]> {
    const response = await api.get(`/i_materials?arrival_doc_id=eq.${arrivalDocId}`);
    return response.data;
  }

  async updateArrivalDocumentValidationStatus(id: string, isValid: boolean): Promise<void> {
    await api.patch(`/i_arrival_documents?arrival_doc_id=eq.${id}`, {
      is_validated: isValid
    });
  }
}

const arrivalDocumentsService = new ArrivalDocumentsService();
export default arrivalDocumentsService;
