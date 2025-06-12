<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import sitesService, { type Site } from '$lib/services/sites';
	import removalsService, { type Removal } from '$lib/services/removals';

	let site = $state<Site | null>(null);
	let removal = $state<Removal | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let siteId = $derived($page.params.id);
	let removalId = $derived($page.params.removalId);

	async function loadData() {
		if (!siteId || !removalId) return;
		
		loading = true;
		error = null;
		
		try {
			const [siteData, removalData] = await Promise.all([
				sitesService.getSiteById(siteId),
				removalsService.getRemovalById(removalId)
			]);

			site = siteData;
			removal = removalData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = 'Failed to load removal data. Please try again later.';
		} finally {
			loading = false;
		}
	}

	function editRemoval() {
		goto(`/sites/${siteId}/removals/${removalId}/edit`);
	}

	function backToRemovals() {
		goto(`/sites/${siteId}/removals`);
	}

	async function deleteRemoval() {
		if (!removalId || !confirm('Are you sure you want to delete this removal record? This action cannot be undone.')) {
			return;
		}

		try {
			await removalsService.deleteRemoval(removalId);
			goto(`/sites/${siteId}/removals`);
		} catch (err) {
			console.error('Error deleting removal:', err);
			alert('Failed to delete removal record. Please try again.');
		}
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

	function formatDistance(distance?: number): string {
		if (distance === null || distance === undefined) return 'N/A';
		return `${distance.toLocaleString()} km`;
	}

	onMount(() => {
		loadData();
	});

	$effect(() => {
		if (siteId && removalId) {
			loadData();
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
		<button class="btn btn-outline" on:click={backToRemovals}>
			← Back to Removals
		</button>
	{:else if removal}
		<!-- Header -->
		<div class="mb-8">
			<div class="breadcrumbs text-sm mb-4">
				<ul>
					<li><a href="/">Sites</a></li>
					<li><a href="/sites/{siteId}">{site?.site_name || 'Site'}</a></li>
					<li><a href="/sites/{siteId}/removals">Removals</a></li>
					<li>Removal Details</li>
				</ul>
			</div>
			<div class="flex justify-between items-start">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Removal Record</h1>
					<p class="text-gray-600">Viewing removal details for {site?.site_name}</p>
				</div>
				<div class="flex gap-2">
					<button class="btn btn-outline" on:click={backToRemovals}>
						← Back to Removals
					</button>
					<button class="btn btn-primary" on:click={editRemoval}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit
					</button>
					<button class="btn btn-error btn-outline" on:click={deleteRemoval}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Delete
					</button>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Basic Information -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-6">Basic Information</h2>
					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-gray-500">Removal Date</label>
							<p class="text-lg font-medium">
								{removal.removal_date ? new Date(removal.removal_date).toLocaleDateString() : 'Not specified'}
							</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Material Type</label>
							<p class="text-lg font-medium">{removal.submaterial_name || 'Unknown'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Disposal Method</label>
							<p class="text-lg font-medium">{removal.disposal_method_name || 'Not specified'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Disposal Facility</label>
							<p class="text-lg font-medium">{removal.disposal_facility_name || 'Not specified'}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Quantities and Measurements -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-6">Quantities & Measurements</h2>
					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-gray-500">Waste Weight</label>
							<p class="text-lg font-medium">{formatWeight(removal.waste_weight_kg)}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Waste Volume</label>
							<p class="text-lg font-medium">{formatVolume(removal.waste_volume_m3)}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Removal Distance</label>
							<p class="text-lg font-medium">{formatDistance(removal.removal_distance_km)}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Financial Information -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-6">Financial Information</h2>
					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-gray-500">Removal Cost</label>
							<p class="text-lg font-medium">{formatCurrency(removal.removal_cost)}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Approximate Resource Value</label>
							<p class="text-lg font-medium">{formatCurrency(removal.appx_resource_value)}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Purchase Order ID</label>
							<p class="text-lg font-medium">{removal.id_po || 'Not specified'}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Additional Information -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-6">Additional Information</h2>
					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-gray-500">Removal Partner ID</label>
							<p class="text-lg font-medium">{removal.removal_partner_id || 'Not specified'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-gray-500">Notes</label>
							<div class="bg-gray-50 p-4 rounded-lg">
								<p class="text-sm whitespace-pre-wrap">
									{removal.removal_notes || 'No notes provided'}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Summary Statistics -->
		<div class="mt-8">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-6">Summary</h2>
					<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div class="stat">
							<div class="stat-title">Total Weight</div>
							<div class="stat-value text-2xl">{formatWeight(removal.waste_weight_kg)}</div>
						</div>
						<div class="stat">
							<div class="stat-title">Total Volume</div>
							<div class="stat-value text-2xl">{formatVolume(removal.waste_volume_m3)}</div>
						</div>
						<div class="stat">
							<div class="stat-title">Total Cost</div>
							<div class="stat-value text-2xl">{formatCurrency(removal.removal_cost)}</div>
						</div>
						<div class="stat">
							<div class="stat-title">Resource Value</div>
							<div class="stat-value text-2xl">{formatCurrency(removal.appx_resource_value)}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
