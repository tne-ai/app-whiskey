<script lang="ts">
	import { page } from '$app/stores';
	import type { Site, SiteStage, SiteResourceManager } from '$lib/types';
	import { formatAddress } from '$lib/types';

	const { data } = $props<{
		data: {
			site: Site;
			stages: SiteStage[];
			resourceManagers: SiteResourceManager[];
		};
	}>();

	// Destructure data from load function
	const { site, stages, resourceManagers } = data;

	// Example site stats - in a real app, these would be calculated from database values
	const siteStats = [
		{ label: 'Total Waste', value: '345 tons', change: '+12% from last month' },
		{ label: 'Diversion Rate', value: '78%', change: '+5% from last month' },
		{ label: 'CO2 Avoided', value: '56 tons', change: '' },
		{ label: 'Active Workers', value: '42', change: '-3 from last week' }
	];

	// Tab handling for sub-navigation
	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'documents', label: 'Documents' }
	];

	let activeTab = $state('overview');

	const setActiveTab = (tabId: string) => {
		activeTab = tabId;
	};

	// Find primary contact details
	const primaryContact = resourceManagers.length > 0 ? resourceManagers[0] : null;
</script>

<svelte:head>
	<title>{site.site_name} - Details | WasteXpert</title>
</svelte:head>

<!-- Site Header and Top Navigation -->
<div class="bg-gray-100 p-6 mb-6 rounded-lg">
	<div class="mb-4">
		<h1 class="text-3xl font-bold">{site.site_name}</h1>
		<p class="text-gray-600">{site.site_type} • {formatAddress(site.site_address)}</p>
	</div>

	<div class="flex flex-wrap gap-2">
		<a href="/sites/{site.site_id}/materials" class="btn">Materials</a>
		<a href="/sites/{site.site_id}/waste" class="btn">Waste</a>
		<a href="/sites/{site.site_id}/logistics" class="btn">Logistics</a>
		<a href="/sites/{site.site_id}/embedded-carbon" class="btn">Embedded Carbon</a>
	</div>
</div>

<!-- Key Metrics Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
	{#each siteStats as stat}
		<div class="bg-white p-6 rounded-lg shadow-md">
			<h3 class="text-gray-600 text-sm mb-1">{stat.label}</h3>
			<p class="text-4xl font-bold mb-1">{stat.value}</p>
			{#if stat.change}
				<p class="text-sm text-gray-500">{stat.change}</p>
			{/if}
		</div>
	{/each}
</div>

<!-- Tab Navigation -->
<div class="tabs mb-6">
	{#each tabs as tab}
		<button
			class="tab tab-bordered {activeTab === tab.id ? 'tab-active' : ''}"
			onclick={() => setActiveTab(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<!-- Tab Content -->
<div class="bg-white rounded-lg shadow-md p-6">
	{#if activeTab === 'overview'}
		<div>
			<h2 class="text-xl font-bold mb-4">Site Description</h2>
			<p class="mb-8">
				{site.description ||
					'A 15-story commercial building in the downtown area with focus on sustainable materials and waste reduction practices.'}
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Project Details Card -->
				<div class="bg-gray-50 p-6 rounded-lg">
					<h3 class="text-xl font-bold mb-4">Project Details</h3>

					<div class="grid grid-cols-2 gap-y-4">
						<div>
							<p class="text-gray-600">Start Date:</p>
						</div>
						<div>
							<p>{new Date(site.site_start_date).toISOString().split('T')[0]}</p>
						</div>

						<div>
							<p class="text-gray-600">Projected End:</p>
						</div>
						<div>
							<p>{new Date(site.site_finish_date).toISOString().split('T')[0]}</p>
						</div>
					</div>
				</div>

				<!-- Contact Information Card -->
				<div class="bg-gray-50 p-6 rounded-lg">
					<h3 class="text-xl font-bold mb-4">Contact Information</h3>

					<div class="grid grid-cols-2 gap-y-4">
						<div>
							<p class="text-gray-600">Name:</p>
						</div>
						<div>
							<p>{primaryContact ? primaryContact.manager_name : 'Alex Johnson'}</p>
						</div>

						<div>
							<p class="text-gray-600">Email:</p>
						</div>
						<div>
							<p>{primaryContact?.email || 'alex@example.com'}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if activeTab === 'timeline'}
		<div>
			<h2 class="text-xl font-bold mb-4">Project Timeline</h2>

			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th>Stage</th>
							<th>Start Date</th>
							<th>End Date</th>
						</tr>
					</thead>
					<tbody>
						{#each stages as stage}
							<tr>
								<td>{stage.stage_name}</td>
								<td>{new Date(stage.start_date).toLocaleDateString()}</td>
								<td>{new Date(stage.finish_date).toLocaleDateString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if activeTab === 'documents'}
		<div>
			<h2 class="text-xl font-bold mb-4">Site Documents</h2>
			<p class="text-gray-600">No documents available for this site.</p>
			<a href="/sites/{site.site_id}/add-document" class="btn btn-primary mt-4">Add Document</a>
		</div>
	{/if}
</div>
