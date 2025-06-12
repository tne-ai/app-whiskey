<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { sitesService, type Site } from '$lib';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
  
	export let data: LayoutData;
	export let children;
  
	let sites: Site[] = [];
	let loading = true;
	let username = data.username;

	$: isLoginPage = $page.url.pathname === '/login';
  
	onMount(async () => {
	  if (!isLoginPage) {
		try {
		  sites = await sitesService.getSites();
		} catch (e) {
		  console.error('Failed to load sites:', e);
		} finally {
		  loading = false;
		}
	  }
	});

	let expandedSites = new Set<string>();

  function toggleSiteExpansion(siteId: string) {
    if (expandedSites.has(siteId)) {
      expandedSites.delete(siteId);
    } else {
      expandedSites.add(siteId);
    }
    expandedSites = new Set(expandedSites);
  }

  function closeDrawer() {
    const drawerToggle = document.getElementById('drawer') as HTMLInputElement;
    if (drawerToggle) drawerToggle.checked = false;
  }
</script>

<div class={isLoginPage ? 'min-h-screen' : 'drawer'}>
  {#if !isLoginPage}
    <input id="drawer" type="checkbox" class="drawer-toggle" />
  {/if}
  
  <div class={isLoginPage ? 'min-h-screen' : 'drawer-content flex flex-col min-h-screen'}>
    {#if !isLoginPage}
      <div class="p-2 flex items-center gap-2">
        <div class="flex items-center gap-2">
          <label for="drawer" class="btn btn-sm btn-square btn-ghost drawer-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <a href="/" class="btn btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Home
          </a>
          <div class="ml-4 text-lg font-bold text-primary">
            WasteX
          </div>
        </div>
        <div class="flex-1"></div>
      </div>
    {/if}
    {@render children()}
  </div>

  {#if !isLoginPage}
    <div class="drawer-side">
      <label for="drawer" class="drawer-overlay"></label>
    <aside class="w-80 min-h-full bg-base-200 flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <div class="p-2">
          <h2 class="text-lg font-semibold mb-4">Sites</h2>
        {#if loading}
          <div class="container mx-auto px-4 py-2">
            <span class="loading loading-spinner loading-sm"></span>
          </div>
        {:else if sites.length === 0}
          <div class="text-sm text-base-content/60">No sites found.</div>
        {:else}
          <ul class="menu p-0 w-full flex-1">
            {#each sites as site}
              <li>
                <div class="flex items-center justify-between">
                  <button
                    class="flex-1 text-left font-medium hover:bg-base-300 rounded-lg p-2"
                    onclick={() => toggleSiteExpansion(site.site_id)}
                  >
                    {site.site_name}
                  </button>
                  <button
                    class="btn btn-ghost btn-xs"
                    onclick={() => toggleSiteExpansion(site.site_id)}
                  >
                    {#if expandedSites.has(site.site_id)}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                    {/if}
                  </button>
                </div>
                {#if expandedSites.has(site.site_id)}
                  <ul class="ml-4 mt-2">
                    <li><a href={`/sites/${site.site_id}`} onclick={closeDrawer}>Overview</a></li>
                    <li><a href={`/sites/${site.site_id}/deliveries`} onclick={closeDrawer}>Deliveries</a></li>
                    <li><a href={`/sites/${site.site_id}/removals`} onclick={closeDrawer}>Removals</a></li>
                    <li><a href={`/sites/${site.site_id}/logistics`} onclick={closeDrawer}>Logistics</a></li>
                    <li><a href={`/sites/${site.site_id}/machine-operation`} onclick={closeDrawer}>Machine Operation</a></li>
                    <li>
                      <details>
                        <summary>Reports</summary>
                        <ul class="ml-2">
                          <li><a href={`http://localhost:3000/section1/`} target="_blank" onclick={closeDrawer}>Site Details</a></li>
                          <li><a href={`http://localhost:3000/section2/`} target="_blank" onclick={closeDrawer}>Materials</a></li>
                          <li><a href={`http://localhost:3000/section3/`} target="_blank" onclick={closeDrawer}>Waste</a></li>
                          <li><a href={`http://localhost:3000/section4/`} target="_blank" onclick={closeDrawer}>Logistic Emissions</a></li>
                          <li><a href={`http://localhost:3000/section5/`} target="_blank" onclick={closeDrawer}>Embodied Carbon</a></li>
                        </ul>
                      </details>
                    </li>
                  </ul>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
        </div>
      </div>
      {#if username}
        <div class="p-4 border-t border-base-300">
          <div class="text-sm text-base-content/80 mb-2 flex items-center gap-2">
            <span class="font-semibold">{username}</span>
            <span class="badge badge-success badge-sm">Logged in</span>
          </div>
          <a href="/logout" class="btn btn-outline btn-error btn-sm w-full">Logout</a>
        </div>
      {/if}
    </aside>
    </div>
  {/if}
</div>