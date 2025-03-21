<script lang="ts">
  import { goto } from '$app/navigation';
  import SiteFilters from '$lib/components/SiteFilters.svelte';
  import { formatAddress } from '$lib/types';
  import { formatCurrency } from '$lib/types';
  import type { ContractorCompany, Site, SiteStage } from '$lib/types';

  /** @type {import('./$types').PageData} */
  export let data;

  // Destructure data from load function
  const { companies, sites, stages } = data;

  function navigateToSite(siteId: number) {
    goto(`/sites/${siteId}/details`);
  }
</script>

<svelte:head>
  <title>Sites | WasteXpert</title>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Sites</h1>

  <SiteFilters {companies} {sites} {stages} />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each sites as site}
      <div
        class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        onclick={() => navigateToSite(site.site_id)}
      >
        <div class="card-body">
          <h2 class="card-title">{site.site_name}</h2>
          <p class="text-sm opacity-70">{formatAddress(site.site_address)}</p>

          <div class="divider my-2"></div>

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="font-semibold">Type:</span> {site.site_type}
            </div>
            <div>
              <span class="font-semibold">Build:</span> {site.build_type}
            </div>
            <div>
              <span class="font-semibold">Start:</span> {new Date(site.site_start_date).toLocaleDateString()}
            </div>
            <div>
              <span class="font-semibold">End:</span> {new Date(site.site_finish_date).toLocaleDateString()}
            </div>
            <div class="col-span-2">
              <span class="font-semibold">Value:</span> {formatCurrency(site.estimated_project_value)}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>