<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import sitesService from '$lib/services/sites';

	let siteId: string;
	let siteName = 'Loading...';

	onMount(async () => {
		siteId = $page.params.id;
		try {
			const site = await sitesService.getSiteById(siteId);
			siteName = site?.site_name || `Site ${siteId.slice(0, 8)}...`;
		} catch (error) {
			console.error('Error fetching site:', error);
			siteName = `Site ${siteId.slice(0, 8)}...`;
		}
	});
</script>

<svelte:head>
	<title>Delivery & Removal - {siteName} - WasteX™</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<nav class="text-sm breadcrumbs">
			<ul>
				<li><a href="/" class="text-blue-600 hover:text-blue-800">Sites</a></li>
				<li><a href="/sites/{siteId}" class="text-blue-600 hover:text-blue-800">{siteName}</a></li>
				<li><a href="/sites/{siteId}/logistics" class="text-blue-600 hover:text-blue-800">Logistics</a></li>
				<li class="text-gray-500">Delivery & Removal</li>
			</ul>
		</nav>
		
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Delivery & Removal</h1>
				<p class="text-gray-600 mt-2">Logistics operations for {siteName}</p>
			</div>
		</div>
	</div>

	<!-- Placeholder Content -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
		<div class="text-center">
			<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
				<svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">Delivery & Removal Operations</h3>
			<p class="text-gray-500 mb-6">This page will show detailed delivery and removal logistics data for this site.</p>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
				<div class="bg-gray-50 rounded-lg p-6">
					<h4 class="font-semibold text-gray-900 mb-2">Delivery Tracking</h4>
					<p class="text-gray-600 text-sm">Monitor incoming deliveries and their status</p>
				</div>
				<div class="bg-gray-50 rounded-lg p-6">
					<h4 class="font-semibold text-gray-900 mb-2">Removal Scheduling</h4>
					<p class="text-gray-600 text-sm">Schedule and track waste removal operations</p>
				</div>
				<div class="bg-gray-50 rounded-lg p-6">
					<h4 class="font-semibold text-gray-900 mb-2">Route Optimization</h4>
					<p class="text-gray-600 text-sm">Optimize delivery and pickup routes</p>
				</div>
			</div>
		</div>
	</div>
</div>
