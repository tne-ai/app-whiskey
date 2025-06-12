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
	<title>Water & Energy - {siteName} - WasteX™</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<nav class="text-sm breadcrumbs">
			<ul>
				<li><a href="/" class="text-blue-600 hover:text-blue-800">Sites</a></li>
				<li><a href="/sites/{siteId}" class="text-blue-600 hover:text-blue-800">{siteName}</a></li>
				<li><a href="/sites/{siteId}/logistics" class="text-blue-600 hover:text-blue-800">Logistics</a></li>
				<li class="text-gray-500">Water & Energy</li>
			</ul>
		</nav>
		
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Water & Energy Management</h1>
				<p class="text-gray-600 mt-2">Resource consumption tracking for {siteName}</p>
			</div>
		</div>
	</div>

	<!-- Placeholder Content -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
		<div class="text-center">
			<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-100 mb-4">
				<svg class="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">Water & Energy Consumption</h3>
			<p class="text-gray-500 mb-6">Monitor and analyze water and energy usage patterns at this site.</p>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
				<div class="bg-gray-50 rounded-lg p-6">
					<h4 class="font-semibold text-gray-900 mb-2">Water Usage</h4>
					<p class="text-gray-600 text-sm">Track water consumption and identify optimization opportunities</p>
				</div>
				<div class="bg-gray-50 rounded-lg p-6">
					<h4 class="font-semibold text-gray-900 mb-2">Energy Consumption</h4>
					<p class="text-gray-600 text-sm">Monitor electricity and fuel usage across operations</p>
				</div>
				<div class="bg-gray-50 rounded-lg p-6">
					<h4 class="font-semibold text-gray-900 mb-2">Efficiency Metrics</h4>
					<p class="text-gray-600 text-sm">Analyze resource efficiency and sustainability metrics</p>
				</div>
			</div>
		</div>
	</div>
</div>
