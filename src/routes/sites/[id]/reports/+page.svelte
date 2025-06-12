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

	const reports = [
		{
			title: 'Site Details',
			description: 'Comprehensive site information and analytics',
			url: `/sites/${$page.params.id}/reports/site-details`,
			externalUrl: 'http://localhost:3000/section1/',
			icon: '🏗️'
		},
		{
			title: 'Materials',
			description: 'Material usage and inventory reports',
			url: `/sites/${$page.params.id}/reports/materials`,
			externalUrl: 'http://localhost:3000/section2/',
			icon: '📦'
		},
		{
			title: 'Waste',
			description: 'Waste generation and disposal analytics',
			url: `/sites/${$page.params.id}/reports/waste`,
			externalUrl: 'http://localhost:3000/section3/',
			icon: '🗑️'
		},
		{
			title: 'Logistic Emissions',
			description: 'Transportation and logistics carbon footprint',
			url: `/sites/${$page.params.id}/reports/logistic-emissions`,
			externalUrl: 'http://localhost:3000/section4/',
			icon: '🚛'
		},
		{
			title: 'Embodied Carbon',
			description: 'Material embodied carbon analysis',
			url: `/sites/${$page.params.id}/reports/embodied-carbon`,
			externalUrl: 'http://localhost:3000/section5/',
			icon: '🌱'
		}
	];
</script>

<svelte:head>
	<title>Reports - {siteName} - WasteX™</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<nav class="text-sm breadcrumbs">
			<ul>
				<li><a href="/" class="text-blue-600 hover:text-blue-800">Sites</a></li>
				<li><a href="/sites/{siteId}" class="text-blue-600 hover:text-blue-800">{siteName}</a></li>
				<li class="text-gray-500">Reports</li>
			</ul>
		</nav>
		
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
				<p class="text-gray-600 mt-2">Comprehensive reporting and data analysis for {siteName}</p>
			</div>
		</div>
	</div>

	<!-- Reports Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each reports as report}
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="text-3xl">{report.icon}</div>
					<div class="flex gap-2">
						<a 
							href={report.url}
							class="btn btn-primary btn-sm"
						>
							View Report
						</a>
						<a 
							href={report.externalUrl}
							target="_blank"
							class="btn btn-outline btn-sm"
							title="Open in new tab"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>
					</div>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
				<p class="text-gray-600 text-sm">{report.description}</p>
			</div>
		{/each}
	</div>

	<!-- Additional Info -->
	<div class="mt-8 bg-blue-50 rounded-lg p-6">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-3">
				<h3 class="text-sm font-medium text-blue-800">About These Reports</h3>
				<div class="mt-2 text-sm text-blue-700">
					<p>These reports are generated from the external reporting system and embedded within the WasteX™ interface for seamless access. Each report can be viewed embedded or opened in a new tab for full functionality.</p>
				</div>
			</div>
		</div>
	</div>
</div>
