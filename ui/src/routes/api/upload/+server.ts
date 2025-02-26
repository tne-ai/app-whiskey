import { json, error } from '@sveltejs/kit';
import { MODEL_API_KEY, MODEL_API_URL, USE_GRAPHAI, GRAPHAI_ENDPOINT, GRAPHAI_SERVER_MODE } from '$env/static/private';

import { GraphAI } from 'graphai';
import * as agents from '@graphai/vanilla';
import { openAIAgent } from '@graphai/openai_agent';
import { httpAgentFilter } from '@graphai/agent_filters';

import * as graphDataSet from '../../../lib/agents';

const GRAPH_NAME = 'ReportGenerator';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'application/pdf', 'text/csv']);

export async function POST({ request, fetch }) {
	const formData = await request.formData();

	const file = formData.get('file') as File;
	console.log('2. Received file:', {
		name: file?.name,
		type: file?.type,
		size: file?.size
	});

	// Validation
	if (!file || typeof file === 'string') throw error(400, 'No file uploaded');
	if (file.size > MAX_FILE_SIZE) throw error(413, 'File exceeds 10MB limit');
	if (!ALLOWED_TYPES.has(file.type)) throw error(415, 'Unsupported file type');

	try {
		// Convert file to text/base64 depending on type
		let fileContent;
		try {
			if (file.type === 'text/csv') {
				fileContent = await file.text();
			} else {
				// Handle binary files as base64
				const arrayBuffer = await file.arrayBuffer();
				fileContent = Buffer.from(arrayBuffer).toString('base64');
			}
			console.log('3. File content length:', fileContent.length);
		} catch (err) {
			console.error('4. Failed to read file:', err);
			throw error(500, 'Failed to read file');
		}

		let modelResponse;
		try {
			if (USE_GRAPHAI === "1") {
				console.log('5. Preparing to send to model at:', GRAPHAI_ENDPOINT);
				const config = {
					openAIAgent: {
					  stream: false,
					},
				};

				const serverAgents: string[] = [];
				if (GRAPHAI_SERVER_MODE === "1") {
					serverAgents.push("openAIAgent");
				}
				const agentFilters = [
					{
					  name: 'httpAgentFilter',
					  agent: httpAgentFilter,
					  filterParams: {
					  	server: {
							  baseUrl: GRAPHAI_ENDPOINT
					  	}
					  },
					  agentIds: serverAgents
					}
				];

				const graphData = graphDataSet[GRAPH_NAME];
				const graphai = new GraphAI(
					graphData,
					{
						...agents,
						openAIAgent,
					},
					{ agentFilters, config }
				);
				graphai.injectValue('fileContent', fileContent);
				graphai.injectValue('fileType', file?.type);
				modelResponse = await graphai.run();
				// No image input
				let modelData;
				if (modelResponse.csvReport) {
					modelData = modelResponse.csvReport?.text;
				} else {
					modelData = modelResponse.imageReport?.text;
				}
				// Image input
				return json({ modelAnalysis: modelData });
			} else {
				console.log('5. Preparing to send to model at:', MODEL_API_URL);
				modelResponse = await fetch(MODEL_API_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${MODEL_API_KEY}`
					},
					body: JSON.stringify({
						model: 'wastex-document---json',
						messages: [
							{
								role: 'system',
								content:
									'Extract the data from the delivery document and return it in a JSON format as specified above.'
							},
							{
								role: 'user',
								content: fileContent,
								...(file.type !== 'text/csv' && {
									file: {
										name: file.name,
										mime_type: file.type,
										data: fileContent
									}
								})
							}
						],
						max_tokens: 2000
					})
				});
				console.log('6. Received model response:', {
					status: modelResponse.status,
					ok: modelResponse.ok
				});

				if (!modelResponse.ok) {
					const errorText = await modelResponse.text();
					console.error('8. Model response not OK:', {
						status: modelResponse.status,
						error: errorText
					});
					throw error(modelResponse.status, `Model processing failed: ${errorText}`);
				}

				// Return model results
				console.log('9. Processing model response...');
				const modelData = await modelResponse.json();
				console.log('10. Returning results to client');

				return json({
					modelAnalysis: modelData.choices?.[0]?.message?.content || modelData
				});
			}
		} catch (err) {
			console.error('7. Model processing failed:', err);
			throw error(500, 'Failed to process with model');
		}
	} catch (err) {
		console.error('Final error handler:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to process file');
	}
}
