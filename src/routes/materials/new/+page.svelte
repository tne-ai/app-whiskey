<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // Redirect to the edit form with ID "new"
  onMount(() => {
    goto('/materials/new/edit');
  });
</script>

<div class="flex justify-center items-center h-screen">
  <span class="loading loading-spinner loading-lg"></span>
</div>
