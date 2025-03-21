<script lang="ts">
  const { file } = $props<{ file: File }>();
  let rows = $state<string[][]>([]);
  let error = $state<string>('');

  // Parse CSV string, handling quoted fields
  function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Handle escaped quotes
          currentCell += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of cell
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' && !insideQuotes) {
        // End of row
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    
    // Handle last row if needed
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  }

  $effect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        rows = parseCSV(raw).slice(0, 11); // Get first 11 rows (header + 10 data rows)
      } catch (err) {
        error = 'Could not parse CSV file';
      }
    };

    reader.onerror = () => {
      error = 'Error reading file';
    };

    reader.readAsText(file);
  });
</script>

<div class="max-h-48 w-full overflow-auto">
  {#if error}
    <div class="text-red-500 text-sm p-2">
      {error}
    </div>
  {:else if rows.length}
    <div class="p-4 bg-gray-50 rounded-lg">
      <table class="w-full table-fixed text-sm text-left border-collapse bg-white rounded-lg shadow-sm">
        <thead class="bg-gray-50">
          <tr>
            {#each rows[0] as header}
              <th class="px-4 py-2 font-medium text-gray-900 border-b w-1/{rows[0].length}" title={header}>
                {header}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each rows.slice(1) as row}
            <tr class="hover:bg-gray-50">
              {#each row as cell}
                <td 
                  class="px-4 py-2 border-b text-gray-700 truncate cursor-help" 
                  title={cell}
                >
                  {cell}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="h-48 flex items-center justify-center text-gray-400">
      Loading preview...
    </div>
  {/if}
</div> 