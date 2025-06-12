<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import sitesService from '$lib/services/sites';

	let siteId: string;
	let siteName = 'Loading...';
	let iframeRef: HTMLIFrameElement;

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

	function handleIframeLoad() {
		if (iframeRef && iframeRef.contentWindow) {
			try {
				const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow.document;
				if (iframeDoc) {
					// Enhanced CSS to isolate #evidence-main-article
					const style = iframeDoc.createElement('style');
					style.textContent = `
						/* Hide everything first */
						body * { display: none !important; }
						
						/* Show only the target element and its children */
						#evidence-main-article,
						#evidence-main-article * { 
							display: block !important; 
						}
						
						/* Reset body and target element styles */
						body { 
							margin: 0 !important; 
							padding: 0 !important; 
							background: white !important;
						}
						
						#evidence-main-article { 
							margin: 0 !important; 
							padding: 20px !important; 
							width: 100% !important;
							max-width: none !important;
							box-sizing: border-box !important;
						}
						
						/* Ensure proper display for common elements */
						#evidence-main-article p,
						#evidence-main-article div,
						#evidence-main-article span,
						#evidence-main-article h1,
						#evidence-main-article h2,
						#evidence-main-article h3,
						#evidence-main-article h4,
						#evidence-main-article h5,
						#evidence-main-article h6,
						#evidence-main-article table,
						#evidence-main-article tr,
						#evidence-main-article td,
						#evidence-main-article th,
						#evidence-main-article ul,
						#evidence-main-article ol,
						#evidence-main-article li {
							display: block !important;
						}
						
						#evidence-main-article table { display: table !important; }
						#evidence-main-article tr { display: table-row !important; }
						#evidence-main-article td, #evidence-main-article th { display: table-cell !important; }
						#evidence-main-article span { display: inline !important; }
					`;
					iframeDoc.head.appendChild(style);
				}
			} catch (error) {
				console.log('Cannot modify iframe content due to cross-origin restrictions');
			}
		}
	}
</script>

<svelte:head>
	<title>Logistic Emissions Report - {siteName} - WasteX™</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<nav class="text-sm breadcrumbs">
			<ul>
				<li><a href="/" class="text-blue-600 hover:text-blue-800">Sites</a></li>
				<li><a href="/sites/{siteId}" class="text-blue-600 hover:text-blue-800">{siteName}</a></li>
				<li><a href="/sites/{siteId}/reports" class="text-blue-600 hover:text-blue-800">Reports</a></li>
				<li class="text-gray-500">Logistic Emissions</li>
			</ul>
		</nav>
		
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Logistic Emissions Report</h1>
				<p class="text-gray-600 mt-2">Transportation and logistics carbon footprint for {siteName}</p>
			</div>
			<div class="flex gap-2">
				<a 
					href="http://localhost:3000/section4/?embed=true&element=evidence-main-article" 
					target="_blank" 
					class="btn btn-outline btn-sm"
				>
					Open in New Tab
				</a>
			</div>
		</div>
	</div>

	<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
		<iframe
			bind:this={iframeRef}
			src="http://localhost:3000/section4/?embed=true&element=evidence-main-article"
			on:load={handleIframeLoad}
			class="w-full h-[800px] border-0"
			title="Logistic Emissions Report"
			sandbox="allow-scripts allow-same-origin"
		></iframe>
	</div>

	<div class="mt-4 text-sm text-gray-500 text-center">
		If the report doesn't load properly, you can 
		<a href="http://localhost:3000/section4/?embed=true&element=evidence-main-article" target="_blank" class="text-blue-600 hover:text-blue-800 underline">
			open it in a new tab
		</a>.
	</div>
</div>
