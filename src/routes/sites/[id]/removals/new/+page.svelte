<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import sitesService, { type Site } from '$lib/services/sites';
	import removalsService, { type RemovalCreate, type DisposalMethod, type DisposalFacility, type Submaterial } from '$lib/services/removals';

	let site = $state<Site | null>(null);
	let disposalMethods = $state<DisposalMethod[]>([]);
	let disposalFacilities = $state<DisposalFacility[]>([]);
	let submaterials = $state<Submaterial[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let validationErrors = $state<Record<string, string>>({});

	// Form data
	let formData = $state<RemovalCreate>({
		site_id: '',
		submaterial_id: '',
		waste_weight_kg: undefined,
		waste_volume_m3: undefined,
		removal_distance_km: undefined,
		removal_date: '',
		disposal_method_id: '',
		disposal_facility_id: '',
		removal_cost: undefined,
		removal_notes: '',
		removal_partner_id: '',
		appx_resource_value: undefined,
		id_po: ''
	});

	let siteId = $derived($page.params.id);

	async function loadData() {
		if (!siteId) return;
		
		loading = true;
		error = null;
		
		try {
			const [siteData, disposalMethodsData, disposalFacilitiesData, submaterialsData] = await Promise.all([
				sitesService.getSiteById(siteId),
				removalsService.getDisposalMethods(),
				removalsService.getDisposalFacilities(),
				removalsService.getSubmaterials()
			]);

			site = siteData;
			disposalMethods = disposalMethodsData;
			disposalFacilities = disposalFacilitiesData;
			submaterials = submaterialsData;

			// Set site_id in form data
			formData.site_id = siteId;
		} catch (err) {
			console.error('Error loading data:', err);
			error = 'Failed to load form data. Please try again later.';
		} finally {
			loading = false;
		}
	}

	function validateForm(): boolean {
		validationErrors = {};

		if (!formData.submaterial_id) {
			validationErrors.submaterial_id = 'Material type is required';
		}

		if (!formData.removal_date) {
			validationErrors.removal_date = 'Removal date is required';
		}

		if (formData.waste_weight_kg !== undefined && formData.waste_weight_kg < 0) {
			validationErrors.waste_weight_kg = 'Weight must be positive';
		}

		if (formData.waste_volume_m3 !== undefined && formData.waste_volume_m3 < 0) {
			validationErrors.waste_volume_m3 = 'Volume must be positive';
		}

		if (formData.removal_distance_km !== undefined && formData.removal_distance_km < 0) {
			validationErrors.removal_distance_km = 'Distance must be positive';
		}

		if (formData.removal_cost !== undefined && formData.removal_cost < 0) {
			validationErrors.removal_cost = 'Cost must be positive';
		}

		if (formData.appx_resource_value !== undefined && formData.appx_resource_value < 0) {
			validationErrors.appx_resource_value = 'Resource value must be positive';
		}

		return Object.keys(validationErrors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		saving = true;
		error = null;

		try {
			const newRemoval = await removalsService.createRemoval(formData);
			goto(`/sites/${siteId}/removals/${newRemoval.removal_id}`);
		} catch (err) {
			console.error('Error creating removal:', err);
			error = 'Failed to create removal record. Please try again.';
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto(`/sites/${siteId}/removals`);
	}

	onMount(() => {
		loadData();
	});

	$effect(() => {
		if (siteId) {
			loadData();
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
		<div class="alert alert-error mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{error}</span>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="breadcrumbs text-sm mb-4">
				<ul>
					<li><a href="/">Sites</a></li>
					<li><a href="/sites/{siteId}">{site?.site_name || 'Site'}</a></li>
					<li><a href="/sites/{siteId}/removals">Removals</a></li>
					<li>New Removal</li>
				</ul>
			</div>
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Removal Record</h1>
					<p class="text-gray-600">Add a new waste removal record for {site?.site_name}</p>
				</div>
			</div>
		</div>

		<!-- Form -->
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Basic Information -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<h2 class="card-title text-xl mb-6">Basic Information</h2>
						<div class="space-y-4">
							<!-- Material Type -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Material Type *</span>
								</label>
								<select 
									class="select select-bordered" 
									class:select-error={validationErrors.submaterial_id}
									bind:value={formData.submaterial_id}
								>
									<option value="">Select material type</option>
									{#each submaterials as submaterial}
										<option value={submaterial.submaterial_id}>{submaterial.submaterial_name}</option>
									{/each}
								</select>
								{#if validationErrors.submaterial_id}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.submaterial_id}</span>
									</label>
								{/if}
							</div>

							<!-- Removal Date -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Removal Date *</span>
								</label>
								<input 
									type="date" 
									class="input input-bordered" 
									class:input-error={validationErrors.removal_date}
									bind:value={formData.removal_date}
								/>
								{#if validationErrors.removal_date}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.removal_date}</span>
									</label>
								{/if}
							</div>

							<!-- Disposal Method -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Disposal Method</span>
								</label>
								<select 
									class="select select-bordered" 
									bind:value={formData.disposal_method_id}
								>
									<option value="">Select disposal method</option>
									{#each disposalMethods as method}
										<option value={method.disposal_method_id}>{method.disposal_method_name}</option>
									{/each}
								</select>
							</div>

							<!-- Disposal Facility -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Disposal Facility</span>
								</label>
								<select 
									class="select select-bordered" 
									bind:value={formData.disposal_facility_id}
								>
									<option value="">Select disposal facility</option>
									{#each disposalFacilities as facility}
										<option value={facility.disposal_facility_id}>{facility.disposal_facility_name}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>
				</div>

				<!-- Quantities and Measurements -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<h2 class="card-title text-xl mb-6">Quantities & Measurements</h2>
						<div class="space-y-4">
							<!-- Waste Weight -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Waste Weight (kg)</span>
								</label>
								<input 
									type="number" 
									step="0.01"
									min="0"
									class="input input-bordered" 
									class:input-error={validationErrors.waste_weight_kg}
									bind:value={formData.waste_weight_kg}
									placeholder="Enter weight in kg"
								/>
								{#if validationErrors.waste_weight_kg}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.waste_weight_kg}</span>
									</label>
								{/if}
							</div>

							<!-- Waste Volume -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Waste Volume (m³)</span>
								</label>
								<input 
									type="number" 
									step="0.01"
									min="0"
									class="input input-bordered" 
									class:input-error={validationErrors.waste_volume_m3}
									bind:value={formData.waste_volume_m3}
									placeholder="Enter volume in m³"
								/>
								{#if validationErrors.waste_volume_m3}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.waste_volume_m3}</span>
									</label>
								{/if}
							</div>

							<!-- Removal Distance -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Removal Distance (km)</span>
								</label>
								<input 
									type="number" 
									min="0"
									class="input input-bordered" 
									class:input-error={validationErrors.removal_distance_km}
									bind:value={formData.removal_distance_km}
									placeholder="Enter distance in km"
								/>
								{#if validationErrors.removal_distance_km}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.removal_distance_km}</span>
									</label>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Financial Information -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<h2 class="card-title text-xl mb-6">Financial Information</h2>
						<div class="space-y-4">
							<!-- Removal Cost -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Removal Cost ($)</span>
								</label>
								<input 
									type="number" 
									step="0.01"
									min="0"
									class="input input-bordered" 
									class:input-error={validationErrors.removal_cost}
									bind:value={formData.removal_cost}
									placeholder="Enter cost in USD"
								/>
								{#if validationErrors.removal_cost}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.removal_cost}</span>
									</label>
								{/if}
							</div>

							<!-- Approximate Resource Value -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Approximate Resource Value ($)</span>
								</label>
								<input 
									type="number" 
									step="0.01"
									min="0"
									class="input input-bordered" 
									class:input-error={validationErrors.appx_resource_value}
									bind:value={formData.appx_resource_value}
									placeholder="Enter resource value in USD"
								/>
								{#if validationErrors.appx_resource_value}
									<label class="label">
										<span class="label-text-alt text-error">{validationErrors.appx_resource_value}</span>
									</label>
								{/if}
							</div>

							<!-- Purchase Order ID -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Purchase Order ID</span>
								</label>
								<input 
									type="text" 
									class="input input-bordered" 
									bind:value={formData.id_po}
									placeholder="Enter PO ID"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Additional Information -->
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<h2 class="card-title text-xl mb-6">Additional Information</h2>
						<div class="space-y-4">
							<!-- Removal Partner ID -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Removal Partner ID</span>
								</label>
								<input 
									type="text" 
									class="input input-bordered" 
									bind:value={formData.removal_partner_id}
									placeholder="Enter partner ID"
								/>
							</div>

							<!-- Notes -->
							<div class="form-control">
								<label class="label">
									<span class="label-text">Notes</span>
								</label>
								<textarea 
									class="textarea textarea-bordered h-32" 
									bind:value={formData.removal_notes}
									placeholder="Enter any additional notes about this removal..."
								></textarea>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Form Actions -->
			<div class="flex justify-end gap-4 mt-8">
				<button 
					type="button" 
					class="btn btn-outline" 
					on:click={handleCancel}
					disabled={saving}
				>
					Cancel
				</button>
				<button 
					type="submit" 
					class="btn btn-primary" 
					disabled={saving}
				>
					{#if saving}
						<span class="loading loading-spinner loading-sm mr-2"></span>
						Creating...
					{:else}
						Create Removal
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
