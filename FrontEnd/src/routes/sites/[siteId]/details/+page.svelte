<script lang="ts">
	import { page } from '$app/stores';
	import type { Site, SiteStage, SiteResourceManager } from '$lib/types';
	import { formatAddress } from '$lib/types';
	import { onMount } from 'svelte';

	const { data } = $props<{
		data: {
			site: Site;
			stages: SiteStage[];
			resourceManagers: SiteResourceManager[];
		};
	}>();

	// Destructure data from load function
	const { site, stages, resourceManagers } = data;

	// Define types
	type SiteStat = {
		label: string;
		value: string;
		change: string;
	};

	type UploadedDocument = {
		name: string;
		uploadDate: string;
		type: string;
		status: 'success' | 'failed';
		wasteMassKg: number;
	};

	// Initialize uploadedFiles state
	let uploadedFiles = $state<UploadedDocument[]>([]);

	// Calculate waste metrics
	const totalWasteFromDocs = $derived(uploadedFiles.reduce((sum, file) => sum + (file.wasteMassKg || 0), 0) / 1000);
	const remainingWaste = $derived(Math.max(0, 345 - totalWasteFromDocs).toFixed(1));

	// Site stats array
	const siteStats = $derived([
		{ label: 'Total Waste', value: `${remainingWaste} tons`, change: '+12% from last month' },
		{ label: 'Diversion Rate', value: '78%', change: '+5% from last month' },
		{ label: 'CO2 Avoided', value: '56 tons', change: '' },
		{ label: 'Active Workers', value: '42', change: '-3 from last week' }
	] as SiteStat[]);

	// Tab handling for sub-navigation
	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'documents', label: 'Documents' }
	];

	let activeTab = $state($page.url.searchParams.get('tab') || 'overview');

	const setActiveTab = (tabId: string) => {
		activeTab = tabId;
		// Update URL without page reload
		const url = new URL(window.location.href);
		url.searchParams.set('tab', tabId);
		window.history.pushState({}, '', url);
	};

	// Find primary contact details
	const primaryContact = resourceManagers.length > 0 ? resourceManagers[0] : null;

	// Load data from localStorage only after component mounts in browser
	onMount(() => {
		const stored = window.localStorage.getItem('uploadedFiles');
		if (stored) {
			// Migrate existing documents to include wasteMassKg if missing
			const docs = JSON.parse(stored);
			const migratedDocs = docs.map((doc: UploadedDocument) => ({
				...doc,
				wasteMassKg: doc.wasteMassKg ?? Math.floor(Math.random() * (1000 - 100 + 1)) + 100
			}));
			uploadedFiles = migratedDocs;
			// Save migrated documents back to localStorage
			window.localStorage.setItem('uploadedFiles', JSON.stringify(migratedDocs));
		}
	});

	function clearDocuments() {
		uploadedFiles = [];
		window.localStorage.setItem('uploadedFiles', '[]');
	}

	function trackDocument(file: File, success: boolean) {
		const newDoc: UploadedDocument = {
			name: file.name,
			uploadDate: new Date().toISOString(),
			type: file.type,
			status: success ? 'success' : 'failed',
			wasteMassKg: Math.floor(Math.random() * (1000 - 100 + 1)) + 100 // Random between 100-1000 kg
		};
		uploadedFiles = [...uploadedFiles, newDoc];
		window.localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
	}

	async function handleUpload(file: File, siteId: string, documentType: string) {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('siteId', siteId);
		formData.append('documentType', documentType);

		try {
			const response = await fetch('/api/documents/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error(`Upload failed: ${response.statusText}`);
			}

			const result = await response.json();
			trackDocument(file, true);
			return result;

		} catch (error) {
			console.error('Upload error:', error);
			trackDocument(file, false);
			throw error;
		}
	}
</script>

<svelte:head>
	<title>{site.site_name} - Details | WasteXpert</title>
</svelte:head>

<!-- Site Header and Top Navigation -->
<div class="bg-gray-100 p-6 mb-6 rounded-lg">
	<div class="mb-4">
		<h1 class="text-3xl font-bold">{site.site_name}</h1>
		<p class="text-gray-600">{site.site_type} • {formatAddress(site.site_address)}</p>
	</div>

	<div class="flex flex-wrap gap-2">
		<a href="/sites/{site.site_id}/materials" class="btn">Materials</a>
		<a href="/sites/{site.site_id}/waste" class="btn">Waste</a>
		<a href="/sites/{site.site_id}/logistics" class="btn">Logistics</a>
		<a href="/sites/{site.site_id}/embedded-carbon" class="btn">Embedded Carbon</a>
	</div>
</div>

<!-- Key Metrics Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
	{#each siteStats as stat}
		<div class="bg-white p-6 rounded-lg shadow-md">
			<h3 class="text-gray-600 text-sm mb-1">{stat.label}</h3>
			<p class="text-4xl font-bold mb-1">{stat.value}</p>
			{#if stat.change}
				<p class="text-sm text-gray-500">{stat.change}</p>
			{/if}
		</div>
	{/each}
</div>

<!-- Tab Navigation -->
<div class="tabs mb-6">
	{#each tabs as tab}
		<button
			class="tab tab-bordered {activeTab === tab.id ? 'tab-active' : ''}"
			onclick={() => setActiveTab(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<!-- Tab Content -->
<div class="bg-white rounded-lg shadow-md p-6">
	{#if activeTab === 'overview'}
		<div>
			<h2 class="text-xl font-bold mb-4">Site Description</h2>
			<p class="mb-8">
				{site.description ||
					'A 15-story commercial building in the downtown area with focus on sustainable materials and waste reduction practices.'}
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Project Details Card -->
				<div class="bg-gray-50 p-6 rounded-lg">
					<h3 class="text-xl font-bold mb-4">Project Details</h3>

					<div class="grid grid-cols-2 gap-y-4">
						<div>
							<p class="text-gray-600">Start Date:</p>
						</div>
						<div>
							<p>{new Date(site.site_start_date).toISOString().split('T')[0]}</p>
						</div>

						<div>
							<p class="text-gray-600">Projected End:</p>
						</div>
						<div>
							<p>{new Date(site.site_finish_date).toISOString().split('T')[0]}</p>
						</div>
					</div>
				</div>

				<!-- Contact Information Card -->
				<div class="bg-gray-50 p-6 rounded-lg">
					<h3 class="text-xl font-bold mb-4">Contact Information</h3>

					<div class="grid grid-cols-2 gap-y-4">
						<div>
							<p class="text-gray-600">Name:</p>
						</div>
						<div>
							<p>{primaryContact ? primaryContact.manager_name : 'Alex Johnson'}</p>
						</div>

						<div>
							<p class="text-gray-600">Email:</p>
						</div>
						<div>
							<p>{primaryContact?.email || 'alex@example.com'}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if activeTab === 'timeline'}
		<div>
			<h2 class="text-xl font-bold mb-4">Project Timeline</h2>

			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th>Stage</th>
							<th>Start Date</th>
							<th>End Date</th>
						</tr>
					</thead>
					<tbody>
						{#each stages as stage}
							<tr>
								<td>{stage.stage_name}</td>
								<td>{new Date(stage.start_date).toLocaleDateString()}</td>
								<td>{new Date(stage.finish_date).toLocaleDateString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if activeTab === 'documents'}
		<div>
			<h2 class="text-xl font-bold mb-4">Site Documents</h2>
			
			{#if uploadedFiles.length === 0}
				<p class="text-gray-600">No documents available for this site.</p>
			{:else}
				<div class="overflow-x-auto mb-4">
					<table class="table table-zebra w-full">
						<thead>
							<tr>
								<th>File Name</th>
								<th class="text-right">Waste Mass (kg)</th>
								<th>Upload Date</th>
								<th>Type</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each uploadedFiles as file}
								<tr>
									<td>{file.name}</td>
									<td class="text-right">{file.wasteMassKg?.toLocaleString() ?? 'N/A'}</td>
									<td>{new Date(file.uploadDate).toLocaleDateString()}</td>
									<td>{file.type}</td>
									<td>
										<span class="badge badge-{file.status === 'success' ? 'success' : 'error'}">
											{file.status}
										</span>
									</td>
								</tr>
							{/each}
							<tr class="font-bold bg-base-200">
								<td>Total Waste Mass</td>
								<td class="text-right">{uploadedFiles.reduce((sum, file) => sum + (file.wasteMassKg || 0), 0).toLocaleString()} kg</td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
			{/if}
			
			<div class="flex justify-between items-center mt-4">
				{#if uploadedFiles.length > 0}
					<button class="btn btn-error" onclick={clearDocuments}>Clear Documents</button>
				{:else}
					<div></div>
				{/if}
				<a href="/sites/{site.site_id}/add-document" class="btn btn-primary">Add Document</a>
			</div>
		</div>
	{/if}
</div>
