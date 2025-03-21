<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Chart from 'chart.js/auto';
    import type { ChartConfiguration, ChartItem, ChartData, ChartOptions } from 'chart.js';
    import { formatAddress } from '$lib/types';
    // Define the expected data types more explicitly
    interface Material {
        material: string;
        cost_percentage: string;
        weight_percentage: string;
        total_weight: number;
        total_volume: number;
        total_cost: number;
    }
    
    interface MaterialHistory {
        delivery_date: string;
        item_name: string | null;
        material: string;
        sub_material: string | null;
        trade_provider: string;
        unit_quantities: number;
        unit_measure: string;
        total_material_weight: number;
        cubic_m3: number;
        purchase_cost_total: number;
        excess_percentage: number;
        created_by_name: string | null;
    }
    
    // Get data from the page store using $derived
    const data = $derived($page.data);
    const site = $derived(data?.site);
    const materialsData = $derived(data?.materialsData);
    
    // Enhanced debugging
    $effect(() => {
        console.log('Page data received:', $page.data);
        console.log('Site data:', site);
        console.log('Materials data:', materialsData);
        if (site) {
            console.log('Site name:', site.site_name);
            console.log('Site ID:', site.site_id);
        }
        if (materialsData) {
            console.log('Diversion target:', materialsData.diversionTarget);
            console.log('Breakdown items:', materialsData.breakdown?.length || 0);
            console.log('History items:', materialsData.history?.length || 0);
        }
    });
    
    // Chart references
    let materialChart1 = $state<HTMLCanvasElement | null>(null);
    let materialChart2 = $state<HTMLCanvasElement | null>(null);
    let chart1Instance: Chart;
    let chart2Instance: Chart;
    
    // Tab handling for sub-navigation
    const materialTabs = [
        { id: 'overview', label: 'Overview', active: true },
        { id: 'breakdown', label: 'Breakdown', active: false },
        { id: 'history', label: 'History', active: false }
    ];
    
    let activeTab = $state('overview');
    
    const setActiveTab = (tabId: string) => {
        activeTab = tabId;
    };
    
    // Fixed color palette for materials
    const materialColors = {
        'Glass': 'rgba(158, 193, 217, 0.8)',
        'Cardboard / Paper': 'rgba(103, 148, 170, 0.8)',
        'Carpet': 'rgba(242, 158, 109, 0.8)',
        'Plasterboard': 'rgba(242, 109, 70, 0.8)',
        'Timber': 'rgba(43, 61, 79, 0.8)',
        'Plastic': 'rgba(103, 128, 159, 0.8)',
        'Metals': 'rgba(70, 124, 157, 0.8)',
        'Rubble': 'rgba(130, 155, 180, 0.8)'
    };
    
    type MaterialKey = keyof typeof materialColors;
    
    // Assign colors to each material
    const getColorForMaterial = (material: string): string => {
        return materialColors[material as MaterialKey] || `hsl(${Math.random() * 360}, 70%, 60%)`;
    };
    
    type MaterialChartItem = {
        name: string;
        percentage: number;
        color: string;
    };
    
    // Format materials data for charts
    const formatMaterialsForChart = (data: typeof materialsData): MaterialChartItem[] => {
        if (!data?.breakdown?.length) return [];
        
        return data.breakdown.map((item: Material) => ({
            name: item.material,
            percentage: parseFloat(item.cost_percentage),
            color: getColorForMaterial(item.material)
        }));
    };
    
    // Filter states
    let selectedMaterial = $state('All');
    let selectedSubMaterial = $state('All');
    let dateRange = $state('All Time');
    let searchQuery = $state('');
    
    function initCharts(): void {
        if (!materialsData?.breakdown?.length) {
            console.log('No material data available for charts');
            return;
        }
        
        // Clean up existing charts
        if (chart1Instance) chart1Instance.destroy();
        if (chart2Instance) chart2Instance.destroy();
        
        try {
            const chartData = formatMaterialsForChart(materialsData);
            
            console.log('Creating charts with data:', chartData);
            
            // Create the first pie chart (by cost percentage)
            if (materialChart1) {
                chart1Instance = new Chart(materialChart1, {
                    type: 'pie',
                    data: {
                        labels: chartData.map((m: MaterialChartItem) => m.name),
                        datasets: [{
                            data: chartData.map((m: MaterialChartItem) => m.percentage),
                            backgroundColor: chartData.map((m: MaterialChartItem) => m.color),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'left',
                            },
                            title: {
                                display: true,
                                text: 'Material Breakdown (% / Cost)'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.label}: ${context.raw}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Create the second pie chart (by weight percentage)
            if (materialChart2) {
                const weightChartData = materialsData.breakdown.map((item: Material) => ({
                    name: item.material,
                    percentage: parseFloat(item.weight_percentage),
                    color: getColorForMaterial(item.material)
                }));
                
                chart2Instance = new Chart(materialChart2, {
                    type: 'pie',
                    data: {
                        labels: weightChartData.map((m: MaterialChartItem) => m.name),
                        datasets: [{
                            data: weightChartData.map((m: MaterialChartItem) => m.percentage),
                            backgroundColor: weightChartData.map((m: MaterialChartItem) => m.color),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'left',
                            },
                            title: {
                                display: true,
                                text: 'Material Breakdown (% / Weight)'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.label}: ${context.raw}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }
    
    function formatDate(dateStr: string | null): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    function formatCurrency(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '-';
        return '$' + parseFloat(value.toString()).toLocaleString();
    }
    
    function formatNumber(value: number | string | null | undefined, decimals = 1): string {
        if (value === null || value === undefined) return '-';
        return parseFloat(value.toString()).toFixed(decimals);
    }
    
    function handleAddRecord(): void {
        alert('Add Record functionality would open a form here');
    }
    
    $effect(() => {
        // This effect will run when materialsData changes
        if (materialsData) {
            console.log('Effect triggered, materialsData is available');
            
            // Schedule chart initialization after component renders
            setTimeout(() => {
                initCharts();
            }, 0);
        }
    });
    
    onMount(() => {
        console.log('Component mounted, init charts if data is available');
        
        // Initialize charts after component is mounted and canvas elements are ready
        if (materialsData?.breakdown?.length) {
            // Wait for a tick to ensure the DOM is ready
            setTimeout(() => {
                initCharts();
            }, 100);
        }
        
        // Cleanup on component destruction
        return () => {
            if (chart1Instance) chart1Instance.destroy();
            if (chart2Instance) chart2Instance.destroy();
        };
    });
</script>

<div class="space-y-6">
    <!-- Site navigation header -->
    <div class="bg-base-200 p-4 rounded-lg">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                {#if site}
                    <h1 class="text-2xl font-bold">{site.site_name}</h1>
                    <p class="text-sm opacity-70">{site.site_type} • {formatAddress(site.site_address)}</p>
                {:else}
                    <h1 class="text-2xl font-bold">Loading site...</h1>
                {/if}
            </div>
            
            <div class="flex gap-2">
                {#if site}
                    <a href="/sites/{site.site_id}/details" class="btn btn-sm">Details</a>
                    <a href="/sites/{site.site_id}/materials" class="btn btn-sm btn-primary">Materials</a>
                    <a href="/sites/{site.site_id}/waste" class="btn btn-sm">Waste</a>
                    <a href="/sites/{site.site_id}/logistics" class="btn btn-sm">Logistics</a>
                    <a href="/sites/{site.site_id}/embedded-carbon" class="btn btn-sm">Embedded Carbon</a>
                {:else}
                    <a href="/sites" class="btn btn-sm">Back to Sites</a>
                {/if}
            </div>
        </div>
    </div>
    
    <!-- Diversion target -->
    <div class="stats shadow bg-base-100 w-full">
        <div class="stat">
            <div class="stat-title">Diversion Target</div>
            <div class="stat-value">{materialsData?.diversionTarget ?? 'N/A'}%</div>
            <div class="stat-actions">
                <button class="btn btn-xs">Edit</button>
            </div>
        </div>
    </div>
    
    <!-- Tab navigation -->
    <div class="tabs tabs-boxed bg-base-200 p-1">
        {#each materialTabs as tab}
            <button 
                class="tab {activeTab === tab.id ? 'tab-active' : ''}" 
                onclick={() => setActiveTab(tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </div>
    
    <!-- Tab content -->
    <div class="bg-base-100 p-6 rounded-lg shadow">
        {#if activeTab === 'overview'}
            <div class="space-y-6">
                {#if materialsData?.breakdown?.length}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="card bg-base-200">
                            <div class="card-body p-4">
                                <canvas bind:this={materialChart1}></canvas>
                            </div>
                        </div>
                        <div class="card bg-base-200">
                            <div class="card-body p-4">
                                <canvas bind:this={materialChart2}></canvas>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="flex flex-col items-center justify-center p-12">
                        <div class="text-center">
                            <p class="text-lg mb-4">No material data available for this site</p>
                            <button class="btn btn-primary" onclick={handleAddRecord}>Add Materials</button>
                        </div>
                    </div>
                {/if}
            </div>
        {:else if activeTab === 'breakdown'}
            <div class="space-y-6">
                <h2 class="text-xl font-bold mb-2">Material Breakdown</h2>
                <div class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Percentage (Cost)</th>
                                <th>Percentage (Weight)</th>
                                <th>Weight (kg)</th>
                                <th>Volume (m³)</th>
                                <th>Cost ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if !materialsData?.breakdown?.length}
                                <tr>
                                    <td colspan="6" class="text-center py-4">No material data available</td>
                                </tr>
                            {:else}
                                {#each materialsData.breakdown as material}
                                    <tr>
                                        <td>{material.material}</td>
                                        <td>{material.cost_percentage}%</td>
                                        <td>{material.weight_percentage}%</td>
                                        <td>{formatNumber(material.total_weight, 1)}</td>
                                        <td>{formatNumber(material.total_volume, 2)}</td>
                                        <td>{formatCurrency(material.total_cost)}</td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        {:else if activeTab === 'history'}
            <div class="space-y-4">
                <div class="flex flex-wrap gap-2 justify-between items-center mb-4">
                    <div class="form-control">
                        <div class="input-group">
                            <input type="text" placeholder="Search..." class="input input-bordered" bind:value={searchQuery} />
                            <button class="btn btn-square" aria-label="Search">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2">
                        <select class="select select-bordered w-full max-w-xs">
                            <option disabled selected>Materials</option>
                            <option>All</option>
                            {#if materialsData?.breakdown?.length}
                                {#each materialsData.breakdown as material}
                                    <option>{material.material}</option>
                                {/each}
                            {/if}
                        </select>
                        
                        <select class="select select-bordered w-full max-w-xs">
                            <option disabled selected>Sub-Materials</option>
                            <option>All</option>
                        </select>
                        
                        <select class="select select-bordered w-full max-w-xs">
                            <option disabled selected>Date Range</option>
                            <option>All Time</option>
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                            <option>Last Year</option>
                        </select>
                        
                        <button class="btn btn-primary" onclick={handleAddRecord}>Add Record</button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Delivery Date</th>
                                <th>Item</th>
                                <th>Materials</th>
                                <th>Sub-Material</th>
                                <th>Trade Provider</th>
                                <th>Quantity</th>
                                <th>Weight (kg)</th>
                                <th>Volume (m³)</th>
                                <th>Cost ($)</th>
                                <th>% Excess</th>
                                <th>Ordered By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if !materialsData?.history?.length}
                                <tr>
                                    <td colspan="11" class="text-center py-4">No material history available</td>
                                </tr>
                            {:else}
                                {#each materialsData.history as row}
                                    <tr>
                                        <td>{formatDate(row.delivery_date)}</td>
                                        <td>{row.item_name || '-'}</td>
                                        <td>{row.material}</td>
                                        <td>{row.sub_material || '-'}</td>
                                        <td>{row.trade_provider}</td>
                                        <td>{row.unit_quantities} {row.unit_measure}</td>
                                        <td>{formatNumber(row.total_material_weight)}</td>
                                        <td>{formatNumber(row.cubic_m3, 2)}</td>
                                        <td>{formatCurrency(row.purchase_cost_total)}</td>
                                        <td>{formatNumber(row.excess_percentage)}%</td>
                                        <td>{row.created_by_name || '-'}</td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    </div>
</div>