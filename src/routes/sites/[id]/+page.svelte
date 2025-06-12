<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import sitesService, { type Site, type RecentActivities } from '$lib/services/sites';
	
	let site = $state<Site | null>(null);
	let recentActivities = $state<RecentActivities | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	
	let siteId = $derived($page.params.id);

	async function loadSiteData() {
		if (!siteId) return;
		
		loading = true;
		error = null;
		
		try {
			const [siteData, activitiesData] = await Promise.all([
				sitesService.getSiteById(siteId),
				sitesService.getRecentActivities(siteId)
			]);
			
			site = siteData;
			recentActivities = activitiesData;
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

	// Reload when site ID changes
	$effect(() => {
		if (siteId) {
			loadSiteData();
		}
	});
</script>

<div class="container mx-auto px-4 py-4">
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
	{:else if site}
		<!-- Site Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">{site.site_name}</h1>
			<p class="text-gray-600">Site Overview and Recent Activities</p>
		</div>

		<!-- Site Information -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Site Information</h2>
					
					{#if site.site_address || site.site_city}
						<div class="mb-3">
							<span class="font-medium text-gray-700">Address:</span>
							<div class="text-gray-600">
								{#if site.site_address}
									<div>{site.site_address}</div>
								{/if}
								{#if site.site_city || site.site_state}
									<div>
										{site.site_city || ''}{site.site_city && site.site_state ? ', ' : ''}{site.site_state || ''}
										{site.site_postal_code ? ` ${site.site_postal_code}` : ''}
									</div>
								{/if}
							</div>
						</div>
					{/if}

					{#if site.project_cost}
						<div class="mb-3">
							<span class="font-medium text-gray-700">Project Cost:</span>
							<span class="text-gray-600">${site.project_cost.toLocaleString()}</span>
						</div>
					{/if}

					{#if site.floor_area_m_2}
						<div class="mb-3">
							<span class="font-medium text-gray-700">Floor Area:</span>
							<span class="text-gray-600">{site.floor_area_m_2.toLocaleString()} m²</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Manage Data for {site?.site_name && site.site_name.length > 20 ? site.site_name.substring(0, 20) + '...' : site?.site_name || 'Site'}</h2>
					<div class="space-y-2">
						<a href="/sites/{siteId}/deliveries" class="btn btn-outline btn-block justify-start">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
							</svg>
							Materials
						</a>
						<a href="/sites/{siteId}/removals" class="btn btn-outline btn-block justify-start">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Removals
						</a>
						<a href="/sites/{siteId}/logistics/delivery-removal" class="btn btn-outline btn-block justify-start">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
							</svg>
							Delivery & Removal
						</a>
						<a href="/sites/{siteId}/logistics/onsite-machinery" class="btn btn-outline btn-block justify-start">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Onsite Machinery
						</a>
						<a href="/sites/{siteId}/logistics/water-energy" class="btn btn-outline btn-block justify-start">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							Water & Energy
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Activities -->
		{#if recentActivities}
			<div class="mb-6">
				<h2 class="text-2xl font-bold text-gray-800 mb-6">Latest Activity</h2>
			</div>
			
			<div class="space-y-6">
				<!-- Materials -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title text-xl">Materials</h2>
							<a href="/sites/{siteId}/deliveries" class="btn btn-sm btn-primary">View All</a>
						</div>
						
						{#if recentActivities.deliveries.length > 0}
							<div class="overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Document Name</th>
											<th>Delivery Date</th>
											<th>Description</th>
										</tr>
									</thead>
									<tbody>
										{#each recentActivities.deliveries as delivery}
											<tr>
												<td class="font-medium">{delivery.arrival_doc_name}</td>
												<td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
												<td class="text-sm text-gray-600">{delivery.arrival_doc_description || 'No description'}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<div class="text-center py-8 text-gray-500">
								<p>No recent materials</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Removals -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title text-xl">Removals</h2>
							<a href="/sites/{siteId}/removals" class="btn btn-sm btn-primary">View All</a>
						</div>
						
						{#if recentActivities.removals.length > 0}
							<div class="overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Removal Date</th>
											<th>Waste Weight (kg)</th>
											<th>Disposal Method</th>
										</tr>
									</thead>
									<tbody>
										{#each recentActivities.removals as removal}
											<tr>
												<td>{new Date(removal.removal_date).toLocaleDateString()}</td>
												<td>{removal.waste_weight_kg?.toLocaleString() || 'N/A'}</td>
												<td>{removal.disposal_method_name || 'Not specified'}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<div class="text-center py-8 text-gray-500">
								<p>No recent removals</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Delivery & Removal -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title text-xl">Delivery & Removal</h2>
							<a href="/sites/{siteId}/logistics/delivery-removal" class="btn btn-sm btn-primary">View All</a>
						</div>
						
						{#if recentActivities.logistics.length > 0}
							<div class="overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Delivery Date</th>
											<th>Transport Mode</th>
											<th>Distance (km)</th>
										</tr>
									</thead>
									<tbody>
										{#each recentActivities.logistics as logistic}
											<tr>
												<td>{new Date(logistic.delivery_date).toLocaleDateString()}</td>
												<td>{logistic.transport_mode || 'Not specified'}</td>
												<td>{logistic.distance_km?.toLocaleString() || 'N/A'}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<div class="text-center py-8 text-gray-500">
								<p>No recent delivery & removal activities</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Onsite Machinery -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title text-xl">Onsite Machinery</h2>
							<a href="/sites/{siteId}/logistics/onsite-machinery" class="btn btn-sm btn-primary">View All</a>
						</div>
						
						{#if recentActivities.machineUsage.length > 0}
							<div class="overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Usage Date</th>
											<th>Machine Type</th>
											<th>Usage Hours</th>
										</tr>
									</thead>
									<tbody>
										{#each recentActivities.machineUsage as usage}
											<tr>
												<td>{new Date(usage.usage_date).toLocaleDateString()}</td>
												<td>{usage.machine_type || 'Not specified'}</td>
												<td>{usage.usage_hours?.toLocaleString() || 'N/A'}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<div class="text-center py-8 text-gray-500">
								<p>No recent machine operations</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Water & Energy -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title text-xl">Water & Energy</h2>
							<a href="/sites/{siteId}/logistics/water-energy" class="btn btn-sm btn-primary">View All</a>
						</div>
						
						{#if recentActivities.waterEnergy.length > 0}
							<div class="overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Consumption Date</th>
											<th>Resource Type</th>
											<th>Consumption</th>
										</tr>
									</thead>
									<tbody>
										{#each recentActivities.waterEnergy as resource}
											<tr>
												<td>{new Date(resource.consumption_date).toLocaleDateString()}</td>
												<td>{resource.resource_type || 'Not specified'}</td>
												<td>{resource.consumption_amount?.toLocaleString() || 'N/A'} {resource.unit || ''}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<div class="text-center py-8 text-gray-500">
								<p>No recent water & energy usage</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<div class="text-center py-12">
			<p class="text-gray-500 text-lg">Site not found</p>
		</div>
	{/if}
</div>
