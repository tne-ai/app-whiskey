<script lang="ts">
    // Example company data
    const company = {
        name: "EcoBuilders Inc.",
        established: "2015",
        employees: 120,
        headquarters: "Portland, OR",
        mission: "To revolutionize construction waste management through innovative recycling and reuse solutions that reduce environmental impact while driving economic value."
    };
    
    // Example compliance records
    const complianceRecords = [
        { id: 1, title: "Annual Environmental Report", status: "Approved", date: "2023-05-15", score: 94 },
        { id: 2, title: "Waste Management Certification", status: "Current", date: "2023-03-22", score: 88 },
        { id: 3, title: "Carbon Reduction Plan", status: "In Review", date: "2023-06-10", score: null },
        { id: 4, title: "Hazardous Materials Handling", status: "Requires Update", date: "2022-11-05", score: 76 }
    ];
</script>

<div class="space-y-6">
    <h1 class="text-3xl font-bold">Company Profile</h1>
    
    <!-- Company overview card -->
    <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
            <div class="flex flex-col md:flex-row md:items-center gap-6">
                <div class="avatar placeholder flex-shrink-0">
                    <div class="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center">
                        <span class="text-2xl text-center" style="line-height: 1; display: flex; align-items: center; justify-content: center;">{company.name.substring(0, 2)}</span>
                    </div>
                </div>
                
                <div class="flex-grow space-y-2">
                    <h2 class="card-title text-2xl">{company.name}</h2>
                    <p class="opacity-80">{company.mission}</p>
                    <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm opacity-70 mt-4">
                        <div>
                            <span class="font-bold">Established:</span> {company.established}
                        </div>
                        <div>
                            <span class="font-bold">Employees:</span> {company.employees}
                        </div>
                        <div>
                            <span class="font-bold">Headquarters:</span> {company.headquarters}
                        </div>
                    </div>
                </div>
                
                <div class="flex-shrink-0">
                    <button class="btn btn-outline">Edit Profile</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Quick stats -->
    <div class="stats shadow bg-base-200 w-full">
        <div class="stat">
            <div class="stat-title">Total Sites</div>
            <div class="stat-value">15</div>
            <div class="stat-desc">Active and closed combined</div>
        </div>
        
        <div class="stat">
            <div class="stat-title">Waste Diverted</div>
            <div class="stat-value">1,254 tons</div>
            <div class="stat-desc text-success">↗︎ 14% vs last year</div>
        </div>
        
        <div class="stat">
            <div class="stat-title">Compliance Score</div>
            <div class="stat-value text-primary">92%</div>
            <div class="stat-desc">↗︎ 5% vs last quarter</div>
        </div>
    </div>
    
    <!-- Compliance Records -->
    <div>
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Compliance Records</h2>
            <button class="btn btn-sm btn-primary">Upload Document</button>
        </div>
        
        <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th>Score</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each complianceRecords as record}
                        <tr>
                            <td>{record.title}</td>
                            <td>
                                {#if record.status === "Approved"}
                                    <span class="badge badge-success">{record.status}</span>
                                {:else if record.status === "Current"}
                                    <span class="badge badge-info">{record.status}</span>
                                {:else if record.status === "In Review"}
                                    <span class="badge badge-warning">{record.status}</span>
                                {:else}
                                    <span class="badge badge-error">{record.status}</span>
                                {/if}
                            </td>
                            <td>{record.date}</td>
                            <td>
                                {#if record.score !== null}
                                    <span class={record.score >= 90 ? "text-success" : 
                                             record.score >= 80 ? "text-info" : 
                                             record.score >= 70 ? "text-warning" : "text-error"}>
                                        {record.score}%
                                    </span>
                                {:else}
                                    <span class="opacity-50">Pending</span>
                                {/if}
                            </td>
                            <td>
                                <div class="btn-group">
                                    <button class="btn btn-xs">View</button>
                                    <button class="btn btn-xs">Edit</button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div> 