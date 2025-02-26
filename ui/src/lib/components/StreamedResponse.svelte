<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { PartialModelAnalysis } from '$lib/types';

  export let data: PartialModelAnalysis | null;
  let isExpanded = false;
</script>

<div class="bg-white p-6 rounded-lg shadow">
  <button
    class="w-full flex justify-between items-center text-left"
    on:click={() => isExpanded = !isExpanded}
  >
    <h2 class="text-xl font-semibold text-gray-900">Streamed Parse Results</h2>
    <svg
      class="w-6 h-6 transform transition-transform {isExpanded ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {#if isExpanded}
    <div transition:slide={{ duration: 300 }} class="mt-4">
      <pre class="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  {/if}
</div> 