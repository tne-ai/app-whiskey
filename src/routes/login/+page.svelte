<script lang="ts">
  let username = $state('');
  let password = $state('');
  let error = $state('');
  let logoLoaded = $state(true);
</script>

<div class="flex items-center justify-center min-h-screen bg-base-200">
  <form class="bg-base-100 p-8 rounded shadow-md w-full max-w-sm" method="POST">
    <div class="flex flex-col items-center mb-6">
      {#if logoLoaded}
  <img src="/logo.png" alt="Logo" class="w-20 h-20 mb-2" onerror={() => logoLoaded = false} />
  <h1 class="text-2xl font-bold">Sign In</h1>
{:else}
  <div class="w-20 h-20 flex items-center justify-center mb-2 bg-base-100 rounded-full border border-base-300">
    <span class="text-3xl font-extrabold text-primary">WasteX</span>
  </div>
  <h1 class="text-2xl font-bold">Sign In</h1>
{/if}
    </div>
    {#if error}
  <div class="alert alert-error mb-4">{typeof error === 'string' ? error : 'Login failed. Please try again.'}</div>
{/if}
    <div class="mb-4">
      <label class="label" for="username">Username</label>
      <input
        id="username"
        name="username"
        type="text"
        placeholder="Username"
        class="input input-bordered w-full"
        bind:value={username}
        autocomplete="username"
        required
      />
    </div>
    <div class="mb-6">
      <label class="label" for="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        class="input input-bordered w-full"
        bind:value={password}
        autocomplete="current-password"
        required
      />
    </div>
    <button class="btn btn-primary w-full" type="submit">
  Sign In
</button>
  </form>
</div>
