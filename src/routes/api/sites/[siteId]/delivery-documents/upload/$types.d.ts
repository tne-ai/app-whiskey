import type { RequestHandler as GenericRequestHandler } from '@sveltejs/kit';

export type RequestHandler = GenericRequestHandler<{
	siteId: string;
}>;

export interface UploadRequest {
	file: File;
}

export interface UploadResponse {
	success: boolean;
	message: string;
	data?: {
		id: string;
		fileName: string;
		originalName: string;
		size: number;
		type: string;
		siteId: string;
		uploadedAt: string;
		status: string;
	};
	error?: string;
}
