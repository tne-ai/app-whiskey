<div class="space-y-6">
    <!-- Welcome banner -->
    <div class="bg-primary text-primary-content p-6 rounded-lg shadow">
        <h1 class="text-3xl font-bold">Welcome to WasteXpert</h1>
        <p class="text-lg mt-2">Your sustainable waste management platform</p>
    </div>

    <!-- Dashboard cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Sites overview card -->
        <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
                <h2 class="card-title">Site Overview</h2>
                <div class="stats stats-vertical shadow">
                    <div class="stat">
                        <div class="stat-title">Active Sites</div>
                        <div class="stat-value">12</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Closed Sites</div>
                        <div class="stat-value">3</div>
                    </div>
                </div>
                <div class="card-actions justify-end">
                    <a href="/sites" class="btn btn-primary">View Sites</a>
                </div>
            </div>
        </div>

        <!-- Diversion metrics card -->
        <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
                <h2 class="card-title">Diversion Metrics</h2>
                <div class="flex items-center justify-center p-4">
                    <div class="radial-progress text-success" style="--value:78;">78%</div>
                </div>
                <p class="text-center">Total waste diverted from landfill</p>
                <div class="card-actions justify-end">
                    <a href="/sites" class="btn btn-primary">Details</a>
                </div>
            </div>
        </div>

        <!-- Carbon metrics card -->
        <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
                <h2 class="card-title">Carbon Impact</h2>
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-title">CO₂ Avoided</div>
                        <div class="stat-value text-success">254t</div>
                        <div class="stat-desc">↗︎ 14% vs last month</div>
                    </div>
                </div>
                <div class="card-actions justify-end">
                    <button class="btn btn-primary">Full Report</button>
                </div>
            </div>
        </div>
    </div>
</div>
