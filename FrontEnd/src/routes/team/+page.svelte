<script lang="ts">
    // Example team data - would come from a store in the real app
    const team = [
        { id: 1, name: "Alex Johnson", role: "Project Manager", email: "alex@wastexpert.com", avatar: "AJ" },
        { id: 2, name: "Sam Williams", role: "Waste Specialist", email: "sam@wastexpert.com", avatar: "SW" },
        { id: 3, name: "Taylor Brown", role: "Site Coordinator", email: "taylor@wastexpert.com", avatar: "TB" },
        { id: 4, name: "Morgan Davis", role: "Data Analyst", email: "morgan@wastexpert.com", avatar: "MD" },
        { id: 5, name: "Jamie Wilson", role: "Sustainability Lead", email: "jamie@wastexpert.com", avatar: "JW" }
    ];
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">My Team</h1>
        <button class="btn btn-primary">Invite Member</button>
    </div>

    <!-- Team stats -->
    <div class="stats shadow bg-base-200 w-full">
        <div class="stat">
            <div class="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div class="stat-title">Team Members</div>
            <div class="stat-value">{team.length}</div>
        </div>

        <div class="stat">
            <div class="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
            </div>
            <div class="stat-title">Active Projects</div>
            <div class="stat-value">12</div>
        </div>

        <div class="stat">
            <div class="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
            </div>
            <div class="stat-title">Tasks This Week</div>
            <div class="stat-value">24</div>
        </div>
    </div>

    <!-- Team member list -->
    <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table class="table w-full">
            <thead>
                <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each team as member}
                    <tr>
                        <td>
                            <div class="flex items-center space-x-3">
                                <div class="avatar placeholder">
                                    <div class="bg-neutral text-neutral-content rounded-full w-12 flex items-center justify-center">
                                        <span class="text-center" style="line-height: 1; display: flex; align-items: center; justify-content: center;">{member.avatar}</span>
                                    </div>
                                </div>
                                <div>
                                    <div class="font-bold">{member.name}</div>
                                </div>
                            </div>
                        </td>
                        <td>{member.role}</td>
                        <td>{member.email}</td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-sm">Message</button>
                                <button class="btn btn-sm">Profile</button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>