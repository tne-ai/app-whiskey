<script lang="ts">
  import { onMount } from 'svelte';
  import { filters, companyNames, siteNames, stageNames, filterDescription } from '$lib/stores';
  import type { ContractorCompany, Site, SiteStage } from '$lib/types';
  
  // Component props using $props() rune
  const { companies, sites, stages } = $props<{
    companies: ContractorCompany[];
    sites: Site[];
    stages: SiteStage[];
  }>();
  
  // Local state with proper Runes syntax
  let selectedCompanyId = $state<number | null>($filters.companyId);
  let selectedSiteId = $state<number | null>($filters.siteId);
  let selectedStageId = $state<number | null>($filters.stageId);
  let startDate = $state<string | null>($filters.startDate);
  let endDate = $state<string | null>($filters.endDate);
  
  // Filter sites based on selected company
  let filteredSites = $derived(selectedCompanyId 
    ? sites.filter((site: Site) => site.company_id === selectedCompanyId)
    : sites);
  
  // Filter stages based on selected site
  let filteredStages = $derived(selectedSiteId
    ? stages.filter((stage: SiteStage) => stage.site_id === selectedSiteId)
    : []);
  
  // Update the filters store when component state changes
  $effect(() => {
    filters.update(f => ({
      ...f,
      companyId: selectedCompanyId,
      siteId: selectedSiteId,
      stageId: selectedStageId,
      startDate,
      endDate
    }));
  });
  
  // Reset dependent filters when parent filter changes
  $effect(() => {
    if (selectedCompanyId === null) {
      selectedSiteId = null;
    }
  });
  
  $effect(() => {
    if (selectedSiteId === null) {
      selectedStageId = null;
    }
  });
  
  // Update name lookup caches
  onMount(() => {
    // Update company names cache
    const companyMap: Record<number, string> = {};
    companies.forEach((company: ContractorCompany) => {
      companyMap[company.company_id] = company.company_name;
    });
    companyNames.set(companyMap);
    
    // Update site names cache
    const siteMap: Record<number, string> = {};
    sites.forEach((site: Site) => {
      siteMap[site.site_id] = site.site_name;
    });
    siteNames.set(siteMap);
    
    // Update stage names cache
    const stageMap: Record<number, string> = {};
    stages.forEach((stage: SiteStage) => {
      stageMap[stage.stage_id] = stage.stage_name;
    });
    stageNames.set(stageMap);
  });
  
  // Clear all filters
  function clearFilters() {
    selectedCompanyId = null;
    selectedSiteId = null;
    selectedStageId = null;
    startDate = null;
    endDate = null;
  }
</script>

<div class="filter-container">
  <div class="filter-controls">
    <div class="filter-group">
      <label for="company-select">Company</label>
      <select 
        id="company-select" 
        bind:value={selectedCompanyId}
        class="select select-bordered w-full"
      >
        <option value={null}>All Companies</option>
        {#each companies as company}
          <option value={company.company_id}>{company.company_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="site-select">Site</label>
      <select 
        id="site-select" 
        bind:value={selectedSiteId}
        disabled={!selectedCompanyId}
        class="select select-bordered w-full"
      >
        <option value={null}>All Sites</option>
        {#each filteredSites as site}
          <option value={site.site_id}>{site.site_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="stage-select">Stage</label>
      <select 
        id="stage-select" 
        bind:value={selectedStageId}
        disabled={!selectedSiteId}
        class="select select-bordered w-full"
      >
        <option value={null}>All Stages</option>
        {#each filteredStages as stage}
          <option value={stage.stage_id}>{stage.stage_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="start-date">Start Date</label>
      <input 
        id="start-date"
        type="date" 
        bind:value={startDate}
        class="input input-bordered w-full"
      />
    </div>
    
    <div class="filter-group">
      <label for="end-date">End Date</label>
      <input 
        id="end-date"
        type="date" 
        bind:value={endDate}
        class="input input-bordered w-full"
      />
    </div>
    
    <button 
      class="btn btn-outline btn-sm self-end"
      onclick={clearFilters}
    >
      Clear Filters
    </button>
  </div>
  
  {#if $filterDescription !== 'Showing all data'}
    <div class="filter-description">
      {$filterDescription}
    </div>
  {/if}
</div>

<style>
  /* Direct TailwindCSS classes instead of @apply */
  .filter-container {
    padding: 1rem;
    background-color: hsl(var(--b2));
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .filter-controls {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
  }
  
  @media (min-width: 640px) {
    .filter-controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 768px) {
    .filter-controls {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .filter-controls {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .filter-description {
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: hsl(var(--in, 212 96% 78%) / 0.1);
    color: hsl(var(--in));
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
</style> 