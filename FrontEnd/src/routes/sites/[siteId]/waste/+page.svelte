<script lang="ts">
    import { onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { page } from '$app/stores';
    import type { PageData } from './$types';

    // Type definitions
    interface WasteItem {
        delivery_date: string;
        stage: string;
        item_name: string | null;
        material: string;
        sub_material: string | null;
        waste_weight: number;
        cubic_m3: number;
        waste_value: number;
        estimated_removal_cost: number;
        landfill: boolean;
        cleanfill: boolean;
        recycle: boolean;
        reuse: boolean;
        estimated_destination: string;
        removal_partner: string | null;
    }

    interface SummaryMetrics {
        totalWaste: number;
        diversionRate: number;
        co2Avoided: number;
        activeWorkers: number;
    }

    interface WasteData {
        wasteItems: WasteItem[];
        summaryMetrics: SummaryMetrics;
        wasteByMaterial: Array<{
            material: string;
            waste_weight: number;
            waste_generation_rate: number;
        }>;
        diversionTarget: {
            diversion_target_percentage: number;
            target_date: string;
        };
        wasteGenerationRate: number;
    }

    // Props
    const { data } = $props();

    // Add these debug logs
    console.log('Initial data prop:', data);
    console.log('Initial wasteData:', data?.wasteData);

    // Base State
    let isLoading = $state(true);
    let hasError = $state(false);
    let errorMessage = $state('');
    let chartContainer = $state<HTMLDivElement | null>(null);
    let chartCanvas = $state<HTMLCanvasElement | null>(null);
    let chartCanvas2 = $state<HTMLCanvasElement | null>(null);
    let chart1: Chart | null = null;
    let chart2: Chart | null = null;

    // Processed Data States
    let processedWasteItems = $derived(data?.wasteData?.wasteItems ?? []);

    // Materials list
    let materials = $derived([...new Set(processedWasteItems.map(item => item.material))]);

    // Sub-materials list
    let subMaterials = $derived([...new Set(
        processedWasteItems
            .map(item => item.sub_material)
            .filter((v): v is string => v !== null)
    )]);

    // Filter States
    let searchTerm = $state('');
    let selectedMaterial = $state('');
    let selectedSubMaterial = $state('');
    let dateRange = $state('');

    // Filtered Data
    let filteredWasteItems = $derived(
        processedWasteItems.filter(item => {
            const matchesSearch = !searchTerm || item.material.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMaterial = !selectedMaterial || item.material === selectedMaterial;
            const matchesSubMaterial = !selectedSubMaterial || item.sub_material === selectedSubMaterial;
            return matchesSearch && matchesMaterial && matchesSubMaterial;
        })
    );

    // Summary Metrics
    let summaryMetrics = $derived({
        totalWaste: Number(data?.wasteData?.summaryMetrics?.totalWaste ?? 0),
        diversionRate: Number(data?.wasteData?.summaryMetrics?.diversionRate ?? 0),
        co2Avoided: Number(data?.wasteData?.summaryMetrics?.co2Avoided ?? 0),
        activeWorkers: Number(data?.wasteData?.summaryMetrics?.activeWorkers ?? 0)
    });

    // Helper Functions
    function formatNumber(value: number | null | undefined, unit = '', decimals = 0): string {
        if (value == null) return '-';
        const numValue = Number(value);
        if (isNaN(numValue)) return '-';
        const roundedValue = numValue.toFixed(decimals);
        return unit ? `${roundedValue} ${unit}` : roundedValue;
    }

    function formatDate(dateString: string): string {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    }

    function getDestination(item: WasteItem): string {
        if (item.reuse) return 'Reuse';
        if (item.recycle) return 'Recycle';
        if (item.cleanfill) return 'Cleanfill';
        if (item.landfill) return 'Landfill';
        return item.estimated_destination || 'Unknown';
    }

    // Simple chart creation functions
    function createWeightChart() {
        if (!chartCanvas || !data?.wasteData?.wasteByMaterial) return;
        
        const ctx = chartCanvas.getContext('2d');
        if (!ctx) return;

        if (chart1) chart1.destroy();
        
        const sortedData = [...data.wasteData.wasteByMaterial]
            .sort((a, b) => b.waste_weight - a.waste_weight);

        chart1 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(item => item.material),
                datasets: [{
                    label: 'Waste Weight (kg)',
                    data: sortedData.map(item => item.waste_weight),
                    backgroundColor: 'rgba(79, 70, 229, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function createRateChart() {
        if (!chartCanvas2 || !data?.wasteData?.wasteByMaterial) return;
        
        const ctx = chartCanvas2.getContext('2d');
        if (!ctx) return;

        if (chart2) chart2.destroy();
        
        const sortedData = [...data.wasteData.wasteByMaterial]
            .sort((a, b) => b.waste_generation_rate - a.waste_generation_rate);

        chart2 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(item => item.material),
                datasets: [{
                    label: 'Generation Rate (kg/m²)',
                    data: sortedData.map(item => item.waste_generation_rate),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Simple effect to create charts when data is available
    $effect(() => {
        if (data?.wasteData?.wasteByMaterial) {
            createWeightChart();
            createRateChart();
        }
    });

    // Effects
    $effect(() => {
        console.log('Effect running with data:', data);
        
        if (!data) {
            console.log('No data available, setting loading to true');
            isLoading = true;
            return;
        }
        
        try {
            if (!data.wasteData) {
                console.log('No wasteData available in data prop');
                throw new Error('No waste data available');
            }
            console.log('Data loaded successfully:', data.wasteData);
            hasError = false;
            errorMessage = '';
        } catch (e) {
            console.log('Error in effect:', e);
            hasError = true;
            errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        } finally {
            console.log('Setting loading to false');
            isLoading = false;
        }

        if (data) {
            console.log('Data type check:', {
                isObject: typeof data === 'object',
                hasWasteData: 'wasteData' in data,
                wasteDataType: typeof data.wasteData,
                summaryMetricsExists: 'summaryMetrics' in (data.wasteData || {}),
            });
        }
    });

    // Clean up on destroy
    onDestroy(() => {
        if (chart1) chart1.destroy();
        if (chart2) chart2.destroy();
    });
</script>

<!-- HTML Structure -->
<div class="w-full">
	    <!-- Tabs navigation -->
    <div class="tabs tabs-boxed bg-base-200 justify-start gap-4 px-4 py-2 mb-4">
        <a href="/sites/{$page.params.siteId}/materials" class="tab">Materials</a>
        <a href="/sites/{$page.params.siteId}/waste" class="tab tab-active">Waste</a>
    </div>

	{#if isLoading}
        <div class="p-4 flex justify-center">
            <div class="flex flex-col items-center">
                <div class="loading loading-spinner loading-lg"></div>
                <p class="mt-2">Loading waste data...</p>
            </div>
        </div>
    {:else if hasError}
        <div class="p-4">
            <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h3 class="font-bold">Error</h3>
                    <div class="text-sm">{errorMessage}</div>
                </div>
                <button class="btn btn-sm" onclick={() => window.location.reload()}>Retry</button>
            </div>
        </div>
    {:else}
        <div class="p-4">
            <!-- Summary Metrics (Top Cards) -->
            <div class="flex flex-wrap gap-4 mb-6">
                <!-- Total Waste Card -->
                <div class="card bg-primary text-primary-content shadow-xl flex-1 min-w-[200px]">
                    <div class="card-body p-4 text-center">
                        <h2 class="text-2xl font-bold">Total Waste</h2>
                        <p class="text-3xl font-bold">
                            {#if summaryMetrics && typeof summaryMetrics.totalWaste === 'number' && !isNaN(summaryMetrics.totalWaste)}
                                {formatNumber(summaryMetrics.totalWaste / 1000, 'tons', 1)}
                            {:else}
                                -
                            {/if}
                        </p>
                    </div>
                </div>

				<!-- Diversion Rate Card -->
                <div class="card bg-success text-success-content shadow-xl flex-1 min-w-[200px]">
                    <div class="card-body p-4 text-center">
                        <h2 class="text-2xl font-bold">Diversion Rate</h2>
                        <p class="text-3xl font-bold">
                            {#if typeof summaryMetrics?.diversionRate === 'number'}
                                {formatNumber(summaryMetrics.diversionRate, '%', 1)}
                            {:else}
                                -
                            {/if}
                        </p>
                    </div>
                </div>

				 <!-- CO2 Avoided Card -->
                <div class="card bg-secondary text-secondary-content shadow-xl flex-1 min-w-[200px]">
                    <div class="card-body p-4 text-center">
                        <h2 class="text-2xl font-bold">CO2 Avoided</h2>
                        <p class="text-3xl font-bold">
                            {#if typeof summaryMetrics?.co2Avoided === 'number'}
                                {formatNumber(summaryMetrics.co2Avoided, 'kg', 0)}
                            {:else}
                                -
                            {/if}
                        </p>
                    </div>
                </div>

				<!-- Active Workers Card -->
                <div class="card bg-accent text-accent-content shadow-xl flex-1 min-w-[200px]">
                    <div class="card-body p-4 text-center">
                        <h2 class="text-2xl font-bold">Active Workers</h2>
                        <p class="text-3xl font-bold">
                            {#if typeof summaryMetrics?.activeWorkers === 'number'}
                                {formatNumber(summaryMetrics.activeWorkers)}
                            {:else}
                                -
                            {/if}
                        </p>
                    </div>
                </div>
            </div>

			  <!-- Cards Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Diversion Target Card -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <div class="flex justify-between items-center">
                            <h2 class="card-title">Diversion Target</h2>
                            <button class="btn btn-sm">Edit</button>
                        </div>
                        <div class="flex flex-col items-center justify-center h-32">
                            {#if typeof data?.wasteData?.diversionTarget?.diversion_target_percentage === 'number'}
                                <p class="text-5xl font-bold">
                                    {formatNumber(data.wasteData.diversionTarget.diversion_target_percentage, '%', 0)}
                                </p>
                                <p class="mt-2 text-gray-500">
                                    Target Date: {formatDate(data.wasteData.diversionTarget.target_date)}
                                </p>
                            {:else}
                                <p class="text-5xl font-bold">-</p>
                                <p class="mt-2 text-gray-500">No target set</p>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Waste Generation Rate Card -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <div class="flex justify-between items-center">
                            <h2 class="card-title">Waste Generation Rate</h2>
                            <button class="btn btn-sm">Details</button>
                        </div>
                        <div class="flex flex-col items-center justify-center h-32">
                            {#if typeof data?.wasteData?.wasteGenerationRate === 'number'}
                                <p class="text-5xl font-bold">
                                    {formatNumber(data.wasteData.wasteGenerationRate, '', 1)}
                                </p>
                                <p class="mt-2 text-gray-500">kg per m²</p>
                            {:else}
                                <p class="text-5xl font-bold">-</p>
                                <p class="mt-2 text-gray-500">No data available</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

			<div class="card bg-base-100 shadow-xl mb-6">
                <div class="card-body">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="card-title">Waste Generation by Material</h2>
                        <button class="btn btn-circle btn-sm" aria-label="Refresh charts" 
                            onclick={() => {
                                createWeightChart();
                                createRateChart();
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="relative w-full" style="height: 400px;">
                            <canvas bind:this={chartCanvas}></canvas>
                        </div>
                        <div class="relative w-full" style="height: 400px;">
                            <canvas bind:this={chartCanvas2}></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Waste Data Table -->
            <div class="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
                <div class="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="form-control">
                        <div class="input-group">
                            <input type="text" placeholder="Search…" class="input input-bordered w-full max-w-xs" bind:value={searchTerm} />
                            <button class="btn btn-square">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span class="sr-only">Search</span>
                            </button>
                        </div>
                    </div>

					<div class="flex flex-wrap gap-2">
                        <select class="select select-bordered w-full max-w-xs" bind:value={selectedMaterial}>
                            <option value="">All Materials</option>
                            {#each materials as material}
                                <option value={material}>{material}</option>
                            {/each}
                        </select>

                        <select class="select select-bordered w-full max-w-xs" bind:value={selectedSubMaterial}>
                            <option value="">All Sub-Materials</option>
                            {#each subMaterials as subMaterial}
                                <option value={subMaterial}>{subMaterial}</option>
                            {/each}
                        </select>

                        <select class="select select-bordered w-full max-w-xs" bind:value={dateRange}>
                            <option value="">All Dates</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="last90">Last 90 Days</option>
                            <option value="lastyear">Last Year</option>
                        </select>
                    </div>
                </div>

				{#if filteredWasteItems.length > 0}
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Removal Date</th>
                                    <th>Stage</th>
                                    <th>Item</th>
                                    <th>Material</th>
                                    <th>Sub-Material</th>
                                    <th>Weight (kg)</th>
                                    <th>Volume (m³)</th>
                                    <th>Value</th>
                                    <th>Removal Cost</th>
                                    <th>Destination</th>
                                    <th>Removal Partner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each filteredWasteItems as item}
                                    <tr>
                                        <td>{formatDate(item.delivery_date)}</td>
                                        <td>{item.stage}</td>
                                        <td>{item.item_name || '-'}</td>
                                        <td>{item.material}</td>
                                        <td>{item.sub_material || '-'}</td>
                                        <td>{formatNumber(item.waste_weight, '', 1)}</td>
                                        <td>{formatNumber(item.cubic_m3, '', 2)}</td>
                                        <td>{formatNumber(item.waste_value, '$', 2)}</td>
                                        <td>{formatNumber(item.estimated_removal_cost, '$', 2)}</td>
                                        <td>{getDestination(item)}</td>
                                        <td>{item.removal_partner || '-'}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
					<div class="p-8 text-center">
                        <p class="text-lg">No waste data available</p>
                        <button class="btn btn-primary mt-4">Add Waste Data</button>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>