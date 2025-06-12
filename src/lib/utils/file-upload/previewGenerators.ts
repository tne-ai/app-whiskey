import type { PreviewData } from './types';

export async function generatePreview(file: File): Promise<PreviewData> {
	const type = file.type.toLowerCase();
	
	// Image preview
	if (type.startsWith('image/')) {
		return generateImagePreview(file);
	}
	
	// PDF preview
	if (type === 'application/pdf') {
		return generatePdfPreview(file);
	}
	
	// CSV preview
	if (type === 'text/csv' || type === 'application/csv' || file.name.toLowerCase().endsWith('.csv')) {
		return generateCsvPreview(file);
	}
	
	// Default preview for unsupported types
	return {
		type: 'text',
		data: `Preview not available for ${file.type}`,
		metadata: {
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type
		}
	};
}

export async function generateImagePreview(file: File): Promise<PreviewData> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			resolve({
				type: 'image',
				data: result,
				metadata: {
					fileName: file.name,
					fileSize: file.size,
					fileType: file.type
				}
			});
		};
		reader.onerror = () => reject(new Error('Failed to read image file'));
		reader.readAsDataURL(file);
	});
}

export async function generatePdfPreview(file: File): Promise<PreviewData> {
	// For now, return a placeholder for PDF files
	// TODO: Integrate pdfjs-dist for actual PDF preview
	return {
		type: 'pdf',
		data: 'PDF Preview - First page preview coming soon',
		metadata: {
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			pages: 'Unknown' // Would be determined by PDF parsing
		}
	};
}

export async function generateCsvPreview(file: File): Promise<PreviewData> {
	try {
		const text = await file.text();
		const lines = text.split('\n').filter(line => line.trim());
		
		if (lines.length === 0) {
			return {
				type: 'csv',
				data: [],
				metadata: {
					fileName: file.name,
					fileSize: file.size,
					fileType: file.type,
					rows: 0,
					columns: 0
				}
			};
		}

		// Parse CSV - simple implementation
		const rows = lines.slice(0, 10).map(line => {
			// Simple CSV parsing - handle basic cases
			const cells = [];
			let current = '';
			let inQuotes = false;
			
			for (let i = 0; i < line.length; i++) {
				const char = line[i];
				
				if (char === '"') {
					inQuotes = !inQuotes;
				} else if (char === ',' && !inQuotes) {
					cells.push(current.trim());
					current = '';
				} else {
					current += char;
				}
			}
			cells.push(current.trim()); // Don't forget the last cell
			
			return cells;
		});

		const columns = rows.length > 0 ? rows[0].length : 0;

		return {
			type: 'csv',
			data: rows,
			metadata: {
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type,
				rows: lines.length,
				columns: columns,
				preview: true,
				previewRows: Math.min(10, lines.length)
			}
		};
	} catch (error) {
		throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export function cleanupPreview(previewData: PreviewData): void {
	// For image URLs created with createObjectURL, we would revoke them here
	// Currently not needed for our implementation
	if (previewData.type === 'image' && previewData.data.startsWith('blob:')) {
		URL.revokeObjectURL(previewData.data);
	}
}