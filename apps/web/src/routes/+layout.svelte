<script lang="ts">
  import "../app.css";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <a href="/" class="text-xl font-bold text-brand">Debatr</a>
        <nav class="flex gap-4 text-sm">
          <a href="/debates" class="hover:text-brand">Debates</a>
          <a href="/rankings" class="hover:text-brand">Rankings</a>
          <a href="/profile" class="hover:text-brand">Profile</a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</QueryClientProvider>
