<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-base-100">
	<!-- Sidebar -->
	<aside class="h-full">
		<Sidebar />
	</aside>
	
	<!-- Main content -->
	<main class="flex-1 overflow-auto p-6">
		{@render children()}
	</main>
</div>
