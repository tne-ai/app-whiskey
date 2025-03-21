<script lang="ts">
    import { page } from '$app/stores';

    // Define navigation items
    const navItems = [
        { label: 'Home', href: '/', icon: 'home' },
        { label: 'My Sites', href: '/sites', icon: 'building' },
        { label: 'My Team', href: '/team', icon: 'users' },
        { label: 'Company', href: '/company', icon: 'briefcase' }
    ];

    // Check if a nav item is active
    const isActive = (href: string) => {
        // For the home route, only highlight when exactly at '/'
        if (href === '/') {
            return $page.url.pathname === '/';
        }

        // For other routes, check if the current path starts with this href
        // This ensures nested routes highlight their parent item
        return $page.url.pathname.startsWith(href);
    };
</script>

<div class="h-full w-64 bg-base-200 text-base-content flex flex-col">
    <!-- Logo section -->
    <div class="p-4 border-b border-base-300 flex items-center">
        <span class="text-xl font-bold">WasteXpert</span>
    </div>

    <!-- Navigation section -->
    <nav class="flex-grow p-4">
        <ul class="space-y-2">
            {#each navItems as { label, href, icon }}
                <li>
                    <a
                        href={href}
                        class="flex items-center p-3 rounded-lg transition-colors hover:bg-base-300 {isActive(href) ? 'bg-primary text-primary-content' : ''}"
                    >
                        <!-- Icon placeholder - we'll use DaisyUI or heroicons later -->
                        <span class="w-6 h-6 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" class="w-5 h-5">
                                {#if icon === 'home'}
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                {:else if icon === 'building'}
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                {:else if icon === 'users'}
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                {:else if icon === 'briefcase'}
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                {/if}
                            </svg>
                        </span>
                        {label}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

    <!-- User profile section -->
    <div class="p-4 border-t border-base-300">
        <div class="flex items-center space-x-3">
            <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content rounded-full w-10 flex items-center justify-center">
                    <span class="text-center" style="line-height: 1; display: flex; align-items: center; justify-content: center;">US</span>
                </div>
            </div>
            <div>
                <p class="font-medium">Jean Luc</p>
                <a href="/settings" class="text-sm opacity-70 hover:opacity-100">Settings</a>
            </div>
        </div>
    </div>
</div>