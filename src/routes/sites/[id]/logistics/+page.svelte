<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import sitesService, { type Site } from '$lib/services/sites';

	let site = $state<Site | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let siteId = $derived($page.params.id);

	async function loadSiteData() {
		if (!siteId) return;
		
		loading = true;
		error = null;
		
		try {
			site = await sitesService.getSiteById(siteId);
		} catch (err) {
			console.error('Error loading site data:', err);
			error = 'Failed to load site data. Please try again later.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadSiteData();
	});

	$effect(() => {
		if (siteId) {
			loadSiteData();
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
					<li>Logistics</li>
				</ul>
			</div>
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Logistics - {site?.site_name}</h1>
					<p class="text-gray-600">Manage transportation, emissions, and logistics operations for this site</p>
				</div>
				<button class="btn btn-primary" disabled>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Create Logistics Entry
				</button>
			</div>
		</div>

		<!-- Coming Soon Card -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body text-center py-16">
				<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
				</svg>
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Logistics Management</h2>
				<p class="text-gray-600 mb-6 max-w-md mx-auto">
					This section will help you track transportation, calculate emissions, and optimize logistics operations for material deliveries and removals.
				</p>
				<div class="text-sm text-gray-500">
					<p>Coming soon...</p>
				</div>
			</div>
		</div>

		<!-- Feature Preview -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-lg">Transportation Tracking</h3>
					<p class="text-sm text-gray-600">Monitor delivery routes, distances, and transport modes</p>
				</div>
			</div>
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-lg">Emissions Calculation</h3>
					<p class="text-sm text-gray-600">Calculate and track carbon emissions from logistics activities</p>
				</div>
			</div>
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-lg">Route Optimization</h3>
					<p class="text-sm text-gray-600">Optimize delivery routes to reduce costs and environmental impact</p>
				</div>
			</div>
		</div>
	{/if}
</div>
