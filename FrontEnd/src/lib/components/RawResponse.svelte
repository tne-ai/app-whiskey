<script lang="ts">
  export let content: string;
  
  function formatJson(json: string): string {
    try {
      const parsed = typeof json === 'object' ? json : JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return json;
    }
  }
</script>

<div class="raw-response">
  <pre>{formatJson(content)}</pre>
</div>

<style>
  .raw-response {
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    font-size: 0.875rem;
    font-family: monospace;
  }
</style> 