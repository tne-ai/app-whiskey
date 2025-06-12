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
					<li>Machine Operations</li>
				</ul>
			</div>
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Machine Operations - {site?.site_name}</h1>
					<p class="text-gray-600">Monitor and manage construction equipment and machinery usage</p>
				</div>
				<button class="btn btn-primary" disabled>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Log Machine Usage
				</button>
			</div>
		</div>

		<!-- Coming Soon Card -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body text-center py-16">
				<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Machine Operations</h2>
				<p class="text-gray-600 mb-6 max-w-md mx-auto">
					This section will help you track machinery usage, maintenance schedules, fuel consumption, and operational efficiency for construction equipment.
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
					<h3 class="card-title text-lg">Usage Tracking</h3>
					<p class="text-sm text-gray-600">Monitor machine hours, fuel consumption, and operational costs</p>
				</div>
			</div>
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-lg">Maintenance Scheduling</h3>
					<p class="text-sm text-gray-600">Track maintenance schedules and equipment condition</p>
				</div>
			</div>
			<div class="card bg-base-100 shadow">
				<div class="card-body">
					<h3 class="card-title text-lg">Efficiency Analysis</h3>
					<p class="text-sm text-gray-600">Analyze performance metrics and optimize equipment usage</p>
				</div>
			</div>
		</div>
	{/if}
</div>
