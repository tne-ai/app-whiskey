<script lang="ts">
    import { onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { page } from '$app/stores';

    // --- Type Definitions ---
    interface ChartItem {
        material: string;
        waste_generation_rate: number;
    }


    // Define types for our data
    type WasteItem = {
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
    };
    
    type WasteMaterial = {
        material: string;
        waste_weight: number;
        waste_generation_rate: number;
    };

    // --- Data from the Page Store ---
    const data = $page.data;
    const site = $derived(data?.site);
    const wasteData = $derived(data?.wasteData);

    // --- State Variables ---
    let isLoading = $state<boolean>(true);
    let hasError = $state<boolean>(false);
    let errorMessage = $state<string>('');
    let chartContainer = $state<HTMLDivElement | null>(null);
    let chartCanvas = $state<HTMLCanvasElement | null>(null);
    let wasteGenerationChart: Chart | null = null;

    // --- Filter State Variables ---
    let searchTerm = $state<string>('');
    let selectedMaterial = $state<string>('');
    let selectedSubMaterial = $state<string>('');
    let dateRange = $state<string>('');

    // --- Data Arrays (regular let, re-assigned in $effect) ---
    let wasteItemsArray = $state<WasteItem[]>([]);
    let materialsArray = $state<string[]>([]);
    let subMaterialsArray = $state<string[]>([]);
    let filteredWasteItemsArray = $state<WasteItem[]>([]);

     // --- Main Data Loading and Chart Initialization Effect ---
    $effect(() => {
        isLoading = true;
        hasError = false;
        errorMessage = '';

        if ($page.error) {
            hasError = true;
            errorMessage = $page.error.message || 'Error loading waste data';
            isLoading = false;
            console.error("Page error:", errorMessage);
            return;
        }

        if (!data) {
            console.log("No data received yet.");
            return;
        }

        if (!wasteData || !site) {
            hasError = true;
            errorMessage = 'Failed to load waste data';
            isLoading = false;
            console.error("wasteData or site is missing:", wasteData, site);
            return;
        }

        // --- Data Processing ---  STEP 1: Assign to the arrays.
        wasteItemsArray = wasteData.wasteItems || [];
        materialsArray = [...new Set(wasteItemsArray.map(item => item.material))];
        subMaterialsArray = [...new Set(wasteItemsArray.map(item => item.sub_material).filter((sm): sm is string => sm != null))];

        // --- Filtering Logic --- STEP 2:  *Then* use the arrays.
        filteredWasteItemsArray = wasteItemsArray.filter(item => {
            // ... (Your filtering logic, unchanged) ...
            // This code now *reliably* uses the updated array values.
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                (item.item_name && item.item_name.toLowerCase().includes(searchLower)) ||
                (item.material && item.material.toLowerCase().includes(searchLower)) ||
                (item.sub_material && item.sub_material.toLowerCase().includes(searchLower)) ||
                (item.removal_partner && item.removal_partner?.toLowerCase().includes(searchLower));

            const matchesMaterial = selectedMaterial === '' || item.material === selectedMaterial;
            const matchesSubMaterial = selectedSubMaterial === '' || item.sub_material === selectedSubMaterial;

            let matchesDate = true;
            if (dateRange) {
                const itemDate = new Date(item.delivery_date);
                const now = new Date();

                if (dateRange === 'last30') {
                    const thirtyDaysAgo = new Date(now);
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    matchesDate = itemDate >= thirtyDaysAgo;
                } else if (dateRange === 'last90') {
                    const ninetyDaysAgo = new Date(now);
                    ninetyDaysAgo.setDate(now.getDate() - 90);
                    matchesDate = itemDate >= ninetyDaysAgo;
                } else if (dateRange === 'lastyear') {
                    const oneYearAgo = new Date(now);
                    oneYearAgo.setFullYear(now.getFullYear() - 1);
                    matchesDate = itemDate >= oneYearAgo;
                }
            }

            return matchesSearch && matchesMaterial && matchesSubMaterial && matchesDate;
        });

        // --- Chart Initialization --- STEP 3: And *finally*, check for chart initialization.
        if (chartCanvas && wasteData.wasteByMaterial?.length) {
           initializeWasteGenerationChart();
        }

        isLoading = false; // MUST be at the very end.
    });

    // ... (The rest of your component: helper functions, chart functions, HTML) ...
    // (All the helper functions, chart initialization, and HTML remain unchanged)

    // --- Helper Functions ---
    function formatNumber(value: number | null | undefined, unit = '', decimals = 0) {
       if (value == null) {
            return '-';
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
            return '-';
        }
        const roundedValue = numValue.toFixed(decimals);
        return unit ? `${roundedValue} ${unit}` : roundedValue;
    }

    function formatDate(dateString: string) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function getDestination(item: WasteItem) {
        if (item.reuse) return 'Reuse';
        if (item.recycle) return 'Recycle';
        if (item.cleanfill) return 'Cleanfill';
        if (item.landfill) return 'Landfill';
        return item.estimated_destination || 'Unknown';
    }


    // --- Chart Initialization Function ---
    function initializeWasteGenerationChart() {
        if (!chartCanvas) {
            console.error('Chart canvas not available');
            return;
        }

        if (wasteGenerationChart) {
            wasteGenerationChart.destroy();
            wasteGenerationChart = null;
        }

        const processedData = processChartData();
        if (!processedData) {
            console.log("processChartData returned null. No chart to draw.");
            return;
        }

        const { labels, dataValues, colors } = processedData;

        const chartData = {
            labels,
            datasets: [{
                label: 'Waste Generation Rate (kg/m²)',
                data: dataValues,
                backgroundColor: colors,
                borderWidth: 1
            }]
        };

        try {
			wasteGenerationChart = new Chart(chartCanvas, {
				type: 'bar',
				data: chartData,
				options: {
					indexAxis: 'y',
					responsive: true,
					maintainAspectRatio: false,
					animation: {
						duration: 750
					},
					plugins: {
						legend: {
							display: false
						},
						title: {
							display: true,
							text: 'Waste Generation Rate (kg/m²) per Material'
						},
						tooltip: {
							callbacks: {
								label: (context) => {
									const value = context.raw as number;
									return formatNumber(value, 'kg/m²', 2);
								}
							}
						}
					},
					scales: {
						x: {
							beginAtZero: true,
							title: {
								display: true,
								text: 'kg/m²'
							},
							ticks: {
								callback: (value) => formatNumber(value as number, '', 1)
							}
						},
						y: {
							title: {
								display: true,
								text: 'Material'
							}
						}
					}
				}
			});
            console.log('Chart initialized successfully');
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }

    // --- Chart Data Processing Function ---
    function processChartData() {
       if (!wasteData?.wasteByMaterial || wasteData.wasteByMaterial.length === 0) {
            console.log('No waste by material data available for chart');
            return null;
        }


        const colors = [
            '#4B5563', '#3B82F6', '#EF4444', '#10B981', '#6366F1',
            '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#6B7280',
            '#8B5CF6', '#22D3EE'
        ];

		const processedData = wasteData.wasteByMaterial
			.map((item: WasteMaterial): ChartItem | null => {
				const rate = Number(item.waste_generation_rate);
				if (isNaN(rate)) {
					console.warn(`Invalid waste generation rate for material ${item.material}:`, item.waste_generation_rate);
					return null;
				}
				return {
					material: item.material,
					waste_generation_rate: rate
				};
			})
			.filter((item: unknown): item is ChartItem => item !== null);

        if (processedData.length === 0) {
            console.error('No valid data available for chart after processing');
            return null;
        }

        processedData.sort((a: ChartItem, b: ChartItem) => b.waste_generation_rate - a.waste_generation_rate);
        const topItems = processedData.slice(0, 10);

        return {
            labels: topItems.map((d: ChartItem) => d.material),
            dataValues: topItems.map((d: ChartItem) => d.waste_generation_rate),
            colors: topItems.map((_: ChartItem, i: number) => colors[i % colors.length])
        };
    }

	onDestroy(() => {
        if (wasteGenerationChart) {
            wasteGenerationChart.destroy();
        }
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
                            {#if typeof wasteData?.summaryMetrics?.totalWaste === 'number'}
                                {formatNumber(wasteData.summaryMetrics.totalWaste / 1000, 'tons', 1)}
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
                            {#if typeof wasteData?.summaryMetrics?.diversionRate === 'number'}
                                {formatNumber(wasteData.summaryMetrics.diversionRate, '%', 1)}
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
                            {#if typeof wasteData?.summaryMetrics?.co2Avoided === 'number'}
                                {formatNumber(wasteData.summaryMetrics.co2Avoided, 'kg', 0)}
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
                            {#if typeof wasteData?.summaryMetrics?.activeWorkers === 'number'}
                                {formatNumber(wasteData.summaryMetrics.activeWorkers)}
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
                            {#if typeof wasteData?.diversionTarget?.diversion_target_percentage === 'number'}
                                <p class="text-5xl font-bold">{formatNumber(wasteData.diversionTarget.diversion_target_percentage, '%', 0)}</p>
                                <p class="mt-2 text-gray-500">Target Date: {formatDate(wasteData.diversionTarget.target_date)}</p>
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
                            {#if typeof wasteData?.wasteGenerationRate === 'number'}
                                <p class="text-5xl font-bold">{formatNumber(wasteData.wasteGenerationRate, '', 1)}</p>
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
                    <div class="flex justify-between items-center">
                        <h2 class="card-title">Waste Generation by Material</h2>
                        <button class="btn btn-circle btn-sm" aria-label="Refresh chart" onclick={() => initializeWasteGenerationChart()}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div class="relative w-full" style="height: 400px; min-height: 300px;" bind:this={chartContainer}>
                        {#if wasteData?.wasteByMaterial && wasteData.wasteByMaterial.length > 0}
                            <canvas bind:this={chartCanvas} width="800" height="400"></canvas>
                        {:else}
                            <div class="flex flex-col items-center justify-center h-full">
                                <p class="text-lg text-gray-500">No waste generation data available to display</p>
                                <button class="btn btn-primary mt-4">Add Waste Data</button>
                            </div>
                        {/if}
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
                            {#each materialsArray as material}
                                <option value={material}>{material}</option>
                            {/each}
                        </select>

                        <select class="select select-bordered w-full max-w-xs" bind:value={selectedSubMaterial}>
                            <option value="">All Sub-Materials</option>
                            {#each subMaterialsArray as subMaterial}
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

				{#if filteredWasteItemsArray && filteredWasteItemsArray.length > 0}
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
                                {#each filteredWasteItemsArray as item}
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