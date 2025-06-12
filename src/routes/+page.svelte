<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { sitesService, type Site, type Company, type Stage, type GetSitesParams } from '$lib';
    
    let sites = $state<Site[]>([]);
    let companies = $state<Company[]>([]);
    let stages = $state<Stage[]>([]);
    let cities = $state<string[]>([]);
    let states = $state<string[]>([]);
    let allSites = $state<Site[]>([]);
    let loading = $state(true);
    let loadingFilters = $state(false);
    let error = $state<string | null>(null);

    // Filter state
    let selectedCompany = $state('');
    let selectedSiteName = $state('');
    let selectedStage = $state('');
    let selectedCity = $state('');
    let selectedState = $state('');
    let startDate = $state('');
    let endDate = $state('');

    // Reset state when city is selected, and vice versa
    $effect(() => {
        if (selectedCity) {
            selectedState = '';
        }
    });

    $effect(() => {
        if (selectedState) {
            selectedCity = '';
        }
    });

    async function loadFilterOptions() {
        try {
            loadingFilters = true;
            const [companiesData, stagesData, citiesData, statesData, sitesData] = await Promise.all([
                sitesService.getCompanies(),
                sitesService.getStages(),
                sitesService.getCities(),
                sitesService.getStates(),
                sitesService.getSites() // Load all sites for site name filter options
            ]);
            companies = companiesData;
            stages = stagesData;
            cities = citiesData;
            states = statesData;
            allSites = sitesData;
        } catch (err) {
            console.error('Error loading filter options:', err);
        } finally {
            loadingFilters = false;
        }
    }

    async function loadSites(filters?: GetSitesParams) {
        loading = true;
        error = null;
        try {
            sites = await sitesService.getSites(filters);
        } catch (err) {
            console.error('Error loading sites:', err);
            error = 'Failed to load sites. Please try again later.';
        } finally {
            loading = false;
        }
    }

    function clearFilters() {
        selectedCompany = '';
        selectedSiteName = '';
        selectedStage = '';
        selectedCity = '';
        selectedState = '';
        startDate = '';
        endDate = '';
    }

    function navigateToSite(siteId: string) {
        goto(`/sites/${siteId}`);
    }

    // Get unique site names for dropdown
    const uniqueSiteNames = $derived(
        allSites
            .map((site: Site) => site.site_name)
            .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index)
            .sort()
    );

    // Reactive effect for immediate filter application
    $effect(() => {
        const filters: GetSitesParams = {};
        
        if (selectedCompany) filters.company = selectedCompany;
        if (selectedSiteName) filters.site_name = selectedSiteName;
        if (selectedStage) filters.stage = selectedStage;
        if (selectedCity) filters.city = selectedCity;
        if (selectedState) filters.state = selectedState;
        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;
        
        // Always load sites when filters change (including when they're cleared)
        loadSites(Object.keys(filters).length > 0 ? filters : undefined);
    });

    onMount(() => {
        loadFilterOptions();
    });
</script>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Sites</h1>
        <p class="text-gray-600">Filter and select sites to view details and manage activities</p>
    </div>

    <!-- Filter Panel -->
    <div class="card bg-base-100 shadow-lg mb-8">
        <div class="card-body py-4">
            <div class="flex flex-wrap items-center gap-4">
                <!-- Company Filter -->
                <div class="flex items-center gap-2">
                    <label for="company-filter" class="text-sm font-medium whitespace-nowrap">Company:</label>
                    <select 
                        id="company-filter"
                        class="select select-bordered select-sm w-40"
                        bind:value={selectedCompany}
                        disabled={loadingFilters}
                    >
                        <option value="">All Companies</option>
                        {#each companies as company}
                            <option value={company.company_name}>{company.company_name}</option>
                        {/each}
                    </select>
                </div>

                <!-- Site Name Filter -->
                <div class="flex items-center gap-2">
                    <label for="site-filter" class="text-sm font-medium whitespace-nowrap">Site:</label>
                    <select 
                        id="site-filter"
                        class="select select-bordered select-sm w-40"
                        bind:value={selectedSiteName}
                        disabled={loadingFilters}
                    >
                        <option value="">All Sites</option>
                        {#each uniqueSiteNames as siteName}
                            <option value={siteName}>{siteName}</option>
                        {/each}
                    </select>
                </div>

                <!-- Stage Filter -->
                <div class="flex items-center gap-2">
                    <label for="stage-filter" class="text-sm font-medium whitespace-nowrap">Stage:</label>
                    <select 
                        id="stage-filter"
                        class="select select-bordered select-sm w-40"
                        bind:value={selectedStage}
                        disabled={loadingFilters}
                    >
                        <option value="">All Stages</option>
                        {#each stages as stage}
                            <option value={stage.stage_name}>{stage.stage_name}</option>
                        {/each}
                    </select>
                </div>

                <!-- City Filter -->
                <div class="flex items-center gap-2">
                    <label for="city-filter" class="text-sm font-medium whitespace-nowrap">City:</label>
                    <select 
                        id="city-filter"
                        class="select select-bordered select-sm w-40"
                        bind:value={selectedCity}
                        disabled={loadingFilters}
                    >
                        <option value="">All Cities</option>
                        {#each cities as city}
                            <option value={city}>{city}</option>
                        {/each}
                    </select>
                </div>

                <!-- State Filter -->
                <div class="flex items-center gap-2">
                    <label for="state-filter" class="text-sm font-medium whitespace-nowrap">State:</label>
                    <select 
                        id="state-filter"
                        class="select select-bordered select-sm w-40"
                        bind:value={selectedState}
                        disabled={loadingFilters}
                    >
                        <option value="">All States</option>
                        {#each states as state}
                            <option value={state}>{state}</option>
                        {/each}
                    </select>
                </div>

                <!-- Start Date Filter -->
                <div class="flex items-center gap-2">
                    <label for="start-date-filter" class="text-sm font-medium whitespace-nowrap">From:</label>
                    <input 
                        id="start-date-filter"
                        type="date"
                        class="input input-bordered input-sm w-40"
                        bind:value={startDate}
                    />
                </div>

                <!-- End Date Filter -->
                <div class="flex items-center gap-2">
                    <label for="end-date-filter" class="text-sm font-medium whitespace-nowrap">To:</label>
                    <input 
                        id="end-date-filter"
                        type="date"
                        class="input input-bordered input-sm w-40"
                        bind:value={endDate}
                    />
                </div>

                <!-- Clear Filters Button -->
                <button 
                    class="btn btn-outline btn-sm ml-auto"
                    onclick={clearFilters}
                    disabled={!selectedCompany && !selectedSiteName && !selectedStage && !selectedCity && !selectedState && !startDate && !endDate}
                >
                    Clear Filters
                </button>
            </div>
        </div>
    </div>

    <!-- Sites Grid -->
    {#if loading}
        <div class="flex justify-center items-center h-64">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
    {:else if error}
        <div class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
        </div>
    {:else if sites.length === 0}
        <div class="text-center py-12">
            <p class="text-gray-500 text-lg">No sites found matching the selected filters</p>
            <button class="btn btn-outline btn-sm mt-4" onclick={clearFilters}>
                Clear Filters
            </button>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each sites as site}
                <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" 
                     onclick={() => navigateToSite(site.site_id)}
                     onkeydown={(e) => e.key === 'Enter' && navigateToSite(site.site_id)}
                     role="button"
                     tabindex="0">
                    <div class="card-body">
                        <h2 class="card-title text-lg font-semibold text-gray-900">
                            {site.site_name}
                        </h2>
                        
                        {#if site.site_address || site.site_city}
                            <div class="text-sm text-gray-600 mb-2">
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
                        {/if}

                        {#if site.creation_date}
                            <div class="text-sm text-gray-600">
                                <span class="font-medium">Created:</span> {new Date(site.creation_date).toLocaleDateString()}
                            </div>
                        {/if}

                        {#if site.project_cost}
                            <div class="text-sm text-gray-600">
                                <span class="font-medium">Project Cost:</span> ${site.project_cost.toLocaleString()}
                            </div>
                        {/if}

                        {#if site.floor_area_m_2}
                            <div class="text-sm text-gray-600">
                                <span class="font-medium">Floor Area:</span> {site.floor_area_m_2.toLocaleString()} m²
                            </div>
                        {/if}

                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-primary btn-sm">View Details</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="postcss">
    @reference "tailwindcss";
    :global(html) {
        background-color: theme(--color-gray-100);
    }
</style>
