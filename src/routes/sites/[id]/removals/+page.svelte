<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		sitesService, 
		removalsService, 
		type Site, 
		type Removal, 
		type GetRemovalsParams, 
		type DisposalMethod, 
		type Submaterial 
	} from '$lib';

	let site = $state<Site | null>(null);
	let removals = $state<Removal[]>([]);
	let disposalMethods = $state<DisposalMethod[]>([]);
	let submaterials = $state<Submaterial[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Pagination and filtering state
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalCount = $state(0);
	let pageSize = $state(20);

	// Filter state
	let dateFromFilter = $state('');
	let dateToFilter = $state('');
	let disposalMethodFilter = $state('');
	let submaterialFilter = $state('');
	let sortBy = $state('removal_date');
	let sortOrder = $state<'asc' | 'desc'>('desc');

	let siteId = $derived($page.params.id);

	async function loadData() {
		if (!siteId) return;
		
		loading = true;
		error = null;
		
		try {
			// Load site info and lookup data in parallel
			const [siteData, disposalMethodsData, submaterialsData] = await Promise.all([
				sitesService.getSiteById(siteId),
				removalsService.getDisposalMethods(),
				removalsService.getSubmaterials()
			]);

			site = siteData;
			disposalMethods = disposalMethodsData;
			submaterials = submaterialsData;

			// Load removals data
			await loadRemovals();
		} catch (err) {
			console.error('Error loading data:', err);
			error = 'Failed to load data. Please try again later.';
		} finally {
			loading = false;
		}
	}

	async function loadRemovals() {
		if (!siteId) return;

		try {
			const params: GetRemovalsParams = {
				siteId,
				page: currentPage,
				limit: pageSize,
				sortBy,
				sortOrder
			};

			// Add filters if they exist
			if (dateFromFilter) params.dateFrom = dateFromFilter;
			if (dateToFilter) params.dateTo = dateToFilter;
			if (disposalMethodFilter) params.disposalMethodId = disposalMethodFilter;
			if (submaterialFilter) params.submaterialId = submaterialFilter;

			const response = await removalsService.getRemovals(params);
			removals = response.data;
			totalPages = response.totalPages;
			totalCount = response.total;
		} catch (err) {
			console.error('Error loading removals:', err);
			error = 'Failed to load removals data.';
		}
	}

	function handleSort(column: string) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'desc';
		}
		currentPage = 1;
		loadRemovals();
	}

	function handlePageChange(newPage: number) {
		currentPage = newPage;
		loadRemovals();
	}

	function clearFilters() {
		dateFromFilter = '';
		dateToFilter = '';
		disposalMethodFilter = '';
		submaterialFilter = '';
		currentPage = 1;
		loadRemovals();
	}

	function viewRemoval(removalId: string) {
		goto(`/sites/${siteId}/removals/${removalId}`);
	}

	function createRemoval() {
		goto(`/sites/${siteId}/removals/new`);
	}

	function formatCurrency(amount?: number): string {
		if (amount === null || amount === undefined) return 'N/A';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function formatWeight(weight?: number): string {
		if (weight === null || weight === undefined) return 'N/A';
		return `${weight.toLocaleString()} kg`;
	}

	function formatVolume(volume?: number): string {
		if (volume === null || volume === undefined) return 'N/A';
		return `${volume.toLocaleString()} m³`;
	}

	onMount(() => {
		loadData();
	});

	$effect(() => {
		if (siteId) {
			loadData();
		}
	});

	// Apply filters immediately when filter values change
	$effect(() => {
		if (siteId && (dateFromFilter || dateToFilter || disposalMethodFilter || submaterialFilter)) {
			currentPage = 1;
			loadRemovals();
		}
	});

	// Also trigger when clearing filters (when all filters are empty)
	$effect(() => {
		if (siteId && !dateFromFilter && !dateToFilter && !disposalMethodFilter && !submaterialFilter) {
			currentPage = 1;
			loadRemovals();
		}
	});
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
		<!-- Header -->
		<div class="mb-8">
			<div class="breadcrumbs text-sm mb-4">
				<ul>
					<li><a href="/">Sites</a></li>
					<li><a href="/sites/{siteId}">{site?.site_name || 'Site'}</a></li>
					<li>Removals</li>
				</ul>
			</div>
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Removals - {site?.site_name}</h1>
					<p class="text-gray-600">Manage waste removals and disposal for this site</p>
				</div>
				<button class="btn btn-primary" onclick={createRemoval}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Create Removal Record
				</button>
			</div>
		</div>

		<!-- Filters -->
		<div class="card bg-base-100 shadow-lg mb-6">
			<div class="card-body">
				<h3 class="card-title text-lg mb-4">Filters</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<!-- Date From -->
					<div class="form-control">
						<label class="label" for="date-from">
							<span class="label-text">Date From</span>
						</label>
						<input
							id="date-from"
							type="date"
							class="input input-bordered"
							bind:value={dateFromFilter}
						/>
					</div>

					<!-- Date To -->
					<div class="form-control">
						<label class="label" for="date-to">
							<span class="label-text">Date To</span>
						</label>
						<input
							id="date-to"
							type="date"
							class="input input-bordered"
							bind:value={dateToFilter}
						/>
					</div>

					<!-- Disposal Method -->
					<div class="form-control">
						<label class="label" for="disposal-method">
							<span class="label-text">Disposal Method</span>
						</label>
						<select id="disposal-method" class="select select-bordered" bind:value={disposalMethodFilter}>
							<option value="">All Methods</option>
							{#each disposalMethods as method}
								<option value={method.disposal_method_id}>{method.disposal_method_name}</option>
							{/each}
						</select>
					</div>

					<!-- Submaterial -->
					<div class="form-control">
						<label class="label" for="submaterial">
							<span class="label-text">Material Type</span>
						</label>
						<select id="submaterial" class="select select-bordered" bind:value={submaterialFilter}>
							<option value="">All Materials</option>
							{#each submaterials as submaterial}
								<option value={submaterial.submaterial_id}>{submaterial.submaterial_name}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Filter Actions -->
				<div class="flex gap-2 mt-4">
					<button class="btn btn-outline" onclick={clearFilters}>
						Clear Filters
					</button>
				</div>
			</div>
		</div>

		<!-- Results Summary -->
		<div class="mb-4">
			<p class="text-sm text-gray-600">
				Showing {removals.length} of {totalCount} removal records
			</p>
		</div>

		<!-- Data Table -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body p-0">
				{#if removals.length > 0}
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>
										<button class="btn btn-ghost btn-sm" onclick={() => handleSort('removal_date')}>
											Removal Date
											{#if sortBy === 'removal_date'}
												<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
											{/if}
										</button>
									</th>
									<th>
										Material Type
									</th>
									<th>
										<button class="btn btn-ghost btn-sm" onclick={() => handleSort('waste_weight_kg')}>
											Weight
											{#if sortBy === 'waste_weight_kg'}
												<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
											{/if}
										</button>
									</th>
									<th>
										<button class="btn btn-ghost btn-sm" onclick={() => handleSort('waste_volume_m3')}>
											Volume
											{#if sortBy === 'waste_volume_m3'}
												<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
											{/if}
										</button>
									</th>
									<th>Disposal Method</th>
									<th>
										<button class="btn btn-ghost btn-sm" onclick={() => handleSort('removal_cost')}>
											Cost
											{#if sortBy === 'removal_cost'}
												<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
											{/if}
										</button>
									</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each removals as removal}
									<tr>
										<td>
											{removal.removal_date ? new Date(removal.removal_date).toLocaleDateString() : 'N/A'}
										</td>
										<td class="font-medium">
											{removal.submaterial_name || 'Unknown'}
										</td>
										<td>
											{formatWeight(removal.waste_weight_kg)}
										</td>
										<td>
											{formatVolume(removal.waste_volume_m3)}
										</td>
										<td>
											{removal.disposal_method_name || 'Not specified'}
										</td>
										<td>
											{formatCurrency(removal.removal_cost)}
										</td>
										<td>
											<div class="flex gap-2">
												<button
													class="btn btn-sm btn-outline"
													onclick={() => viewRemoval(removal.removal_id)}
												>
													View
												</button>
												<button
													class="btn btn-sm btn-primary"
													onclick={() => goto(`/sites/${siteId}/removals/${removal.removal_id}/edit`)}
												>
													Edit
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="text-center py-16">
						<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						<h3 class="text-lg font-medium text-gray-900 mb-2">No removal records found</h3>
						<p class="text-gray-600 mb-6">
							{dateFromFilter || dateToFilter || disposalMethodFilter || submaterialFilter
								? 'No removal records match your current filters.'
								: 'No removal records have been created for this site yet.'}
						</p>
						<button class="btn btn-primary" onclick={createRemoval}>
							Create First Removal Record
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex justify-center mt-6">
				<div class="join">
					<button
						class="join-item btn"
						class:btn-disabled={currentPage === 1}
						onclick={() => handlePageChange(currentPage - 1)}
					>
						Previous
					</button>
					
					{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						const startPage = Math.max(1, currentPage - 2);
						return startPage + i;
					}) as pageNum}
						{#if pageNum <= totalPages}
							<button
								class="join-item btn"
								class:btn-active={pageNum === currentPage}
								onclick={() => handlePageChange(pageNum)}
							>
								{pageNum}
							</button>
						{/if}
					{/each}
					
					<button
						class="join-item btn"
						class:btn-disabled={currentPage === totalPages}
						onclick={() => handlePageChange(currentPage + 1)}
					>
						Next
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
