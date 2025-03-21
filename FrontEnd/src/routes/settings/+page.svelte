<script lang="ts">
    // Settings categories
    const categories = [
        { id: 'profile', label: 'Profile Settings', active: true },
        { id: 'account', label: 'Account Settings', active: false },
        { id: 'notifications', label: 'Notifications', active: false },
        { id: 'appearance', label: 'Appearance', active: false },
        { id: 'security', label: 'Security & Privacy', active: false }
    ];
    
    // Track which category is active
    let activeCategory = $state('profile');
    
    const setActiveCategory = (categoryId: string) => {
        activeCategory = categoryId;
    };
</script>

<div class="space-y-6">
    <h1 class="text-3xl font-bold">Settings</h1>
    
    <div class="flex flex-col md:flex-row gap-6">
        <!-- Settings navigation -->
        <div class="w-full md:w-64 bg-base-200 p-4 rounded-lg">
            <ul class="menu bg-base-200 w-full rounded-box">
                {#each categories as category}
                    <li>
                        <button 
                            class={activeCategory === category.id ? 'active' : ''} 
                            onclick={() => setActiveCategory(category.id)}
                        >
                            {category.label}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
        
        <!-- Settings content -->
        <div class="flex-grow bg-base-100 p-6 rounded-lg shadow-lg">
            {#if activeCategory === 'profile'}
                <div class="space-y-6">
                    <h2 class="text-xl font-bold">Profile Settings</h2>
                    
                    <div class="form-control w-full max-w-lg">
                        <label for="name" class="label">
                            <span class="label-text">Full Name</span>
                        </label>
                        <input type="text" value="John Doe" class="input input-bordered w-full" id="name" />
                    </div>
                    
                    <div class="form-control w-full max-w-lg">
                        <label for="email" class="label">
                            <span class="label-text">Email Address</span>
                        </label>
                        <input type="email" value="john.doe@example.com" class="input input-bordered w-full" id="email" />
                    </div>
                    
                    <div class="form-control w-full max-w-lg">
                        <label for="bio" class="label">
                            <span class="label-text">Job Title</span>
                        </label>
                        <input type="text" value="Project Manager" class="input input-bordered w-full" id="bio" />
                    </div>
                    
                    <div class="form-control w-full max-w-lg">
                        <label for="profile-photo" class="label">
                            <span class="label-text">Profile Photo</span>
                        </label>
                        <div class="flex items-center space-x-4">
                            <div class="avatar placeholder">
                                <div class="bg-neutral text-neutral-content rounded-full w-16 flex items-center justify-center">
                                    <span class="text-center" style="line-height: 1; display: flex; align-items: center; justify-content: center;">JD</span>
                                </div>
                            </div>
                            <button id="profile-photo" class="btn btn-sm">Change Photo</button>
                        </div>
                    </div>
                    
                    <div class="form-control w-full max-w-lg mt-8">
                        <button class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            {:else if activeCategory === 'account'}
                <div>
                    <h2 class="text-xl font-bold">Account Settings</h2>
                    <p class="opacity-60 mt-4">Account settings will be available here.</p>
                </div>
            {:else if activeCategory === 'notifications'}
                <div>
                    <h2 class="text-xl font-bold">Notification Settings</h2>
                    <p class="opacity-60 mt-4">Notification settings will be available here.</p>
                </div>
            {:else if activeCategory === 'appearance'}
                <div>
                    <h2 class="text-xl font-bold">Appearance Settings</h2>
                    <p class="opacity-60 mt-4">Appearance settings will be available here.</p>
                </div>
            {:else if activeCategory === 'security'}
                <div>
                    <h2 class="text-xl font-bold">Security & Privacy</h2>
                    <p class="opacity-60 mt-4">Security and privacy settings will be available here.</p>
                </div>
            {/if}
        </div>
    </div>
</div> 