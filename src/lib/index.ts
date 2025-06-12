// Centralized barrel exports for all lib services and types
// This allows clean imports like: import { sitesService, type Site } from '$lib';

// Services
export { default as apiService } from './services/api';
export { default as sitesService } from './services/sites';
export { default as removalsService } from './services/removals';
export { default as materialsService } from './services/materials';
export { default as arrivalDocumentsService } from './services/arrival-documents';

// Types from sites service
export type {
	Site,
	SiteType,
	LandUse,
	Stage,
	Company,
	GetSitesParams,
	RecentActivities
} from './services/sites';

// Types from removals service
export type {
	Removal,
	RemovalCreate,
	RemovalUpdate,
	GetRemovalsParams,
	DisposalMethod,
	DisposalFacility,
	Submaterial
} from './services/removals';

// Types from materials service
export type {
	Material,
	Item,
	PaginationParams,
	FilterParams
} from './services/materials';

// Types from arrival documents service
export type {
	ArrivalDocument,
	ArrivalDocumentCreate,
	ArrivalDocumentUpdate,
	GetArrivalDocumentsParams
} from './services/arrival-documents';
