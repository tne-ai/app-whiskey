<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import arrivalDocumentsService, { type ArrivalDocument } from '$lib/services/arrival-documents';
	import sitesService, { type Site } from '$lib/services/sites';
	import UploadModal from '$lib/components/UploadModal.svelte';

	let site = $state<Site | null>(null);
	let deliveries = $state<ArrivalDocument[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let sortBy = $state<string>('delivery_date');
	let sortOrder = $state<'asc' | 'desc'>('desc');
	let showUploadModal = $state(false);
	let uploadSuccess = $state<string | null>(null);

	let siteId = $derived($page.params.id);

	async function loadData() {
		if (!siteId) return;
		
		loading = true;
		error = null;
		
		try {
			console.log('Loading data for siteId:', siteId);
			const [siteData, deliveriesData] = await Promise.all([
				sitesService.getSiteById(siteId),
				arrivalDocumentsService.getArrivalDocuments({
					page: currentPage,
					limit: 10,
					siteId: siteId,
					sortBy,
					sortOrder
				})
			]);
			
			console.log('Site data:', siteData);
			console.log('Deliveries data:', deliveriesData);
			
			site = siteData;
			deliveries = deliveriesData.data;
			totalPages = deliveriesData.totalPages;
		} catch (err) {
			console.error('Error loading deliveries:', err);
			console.error('Error details:', { message: (err as Error).message, response: (err as any).response, status: (err as any).status });
			error = 'Failed to load deliveries. Please try again later.';
		} finally {
			loading = false;
		}
	}

	function loadDeliveries() {
		loadData();
	}

	onMount(() => {
		loadData();
	});

	// Reactive loading when parameters change
	$effect(() => {
		if (siteId) {
			loadData();
		}
	});

	function handleSort(column: string) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
	}

	function goToPage(pageNumber: number) {
		currentPage = pageNumber;
	}

	function viewDocument(documentId: string) {
		goto(`/arrival_documents/${documentId}`);
	}

	function createDocument() {
		goto(`/arrival_documents/new?siteId=${siteId}`);
	}

	function getSortIcon(column: string) {
		if (sortBy !== column) return '';
		return sortOrder === 'asc' ? '↑' : '↓';
	}

	function handleUploadClick() {
		showUploadModal = true;
		uploadSuccess = null;
	}

	function handleUploadModalClose() {
		showUploadModal = false;
	}

	function handleUploadComplete(event: CustomEvent<{ success: boolean; message: string }>) {
		const { success, message } = event.detail;
		
		if (success) {
			uploadSuccess = message;
			// Reload the deliveries to show newly uploaded documents
			loadData();
		} else {
			error = message;
		}
		
		showUploadModal = false;
		
		// Clear success message after 5 seconds
		if (success) {
			setTimeout(() => {
				uploadSuccess = null;
			}, 5000);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
		<div class="alert alert-error mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{error}</span>
		</div>
	{:else}
		<!-- Success message for uploads -->
		{#if uploadSuccess}
			<div class="alert alert-success mb-6">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{uploadSuccess}</span>
			</div>
		{/if}

		<!-- Header -->
		<div class="mb-8">
			<div class="breadcrumbs text-sm mb-4">
				<ul>
					<li><a href="/">Sites</a></li>
					<li><a href="/sites/{siteId}">{site?.site_name || 'Site'}</a></li>
					<li>Deliveries</li>
				</ul>
			</div>
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Deliveries - {site?.site_name}</h1>
					<p class="text-gray-600">Manage arrival documents and deliveries for this site</p>
				</div>
				<div class="flex gap-3">
					<button onclick={handleUploadClick} class="btn btn-secondary">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
						</svg>
						Upload Delivery Document
					</button>
					<button onclick={createDocument} class="btn btn-primary">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Create Delivery Document
					</button>
				</div>
			</div>
		</div>

		{#if deliveries.length === 0}
			<div class="text-center py-12">
				<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
				<p class="text-gray-500 mb-4">Get started by creating or uploading your first delivery document.</p>
				<div class="flex gap-3 justify-center">
					<button onclick={handleUploadClick} class="btn btn-secondary">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
						</svg>
						Upload Delivery Document
					</button>
					<button onclick={createDocument} class="btn btn-primary">
						Create Delivery Document
					</button>
				</div>
			</div>
		{:else}
			<!-- Documents Table -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>
										<button onclick={() => handleSort('arrival_doc_name')} class="flex items-center hover:text-primary">
											Name {getSortIcon('arrival_doc_name')}
										</button>
									</th>
									<th>
										<button onclick={() => handleSort('delivery_date')} class="flex items-center hover:text-primary">
											Delivery Date {getSortIcon('delivery_date')}
										</button>
									</th>
									<th>Description</th>
									<th>
										<button onclick={() => handleSort('is_valid')} class="flex items-center hover:text-primary">
											Status {getSortIcon('is_valid')}
										</button>
									</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each deliveries as document}
									<tr>
										<td class="font-medium">{document.arrival_doc_name}</td>
										<td>{document.delivery_date ? new Date(document.delivery_date).toLocaleDateString() : 'No date'}</td>
										<td class="text-sm text-gray-600 max-w-xs truncate">
											{document.arrival_doc_description || 'No description'}
										</td>
										<td>
											{#if document.computed_is_valid}
												<div class="badge badge-success">Valid</div>
											{:else}
												<div class="badge badge-error">Invalid</div>
											{/if}
										</td>
										<td>
											<button 
												onclick={() => viewDocument(document.arrival_doc_id)}
												class="btn btn-sm btn-outline"
											>
												View
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="flex justify-center mt-6">
							<div class="join">
								{#each Array(totalPages) as _, i}
									<button 
										class="join-item btn {currentPage === i + 1 ? 'btn-active' : ''}"
										onclick={() => goToPage(i + 1)}
									>
										{i + 1}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Upload Modal -->
<UploadModal 
	open={showUploadModal} 
	siteId={siteId || ''} 
	on:close={handleUploadModalClose}
	on:uploadComplete={handleUploadComplete}
/>
