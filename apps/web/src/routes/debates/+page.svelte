<script lang="ts">
  const debates = [
    { id: "1", topic: "Social media does more harm than good", status: "active" },
    { id: "2", topic: "Remote work improves productivity", status: "pending" },
  ];
</script>

<h1 class="mb-6 text-2xl font-bold">Debates</h1>

<ul class="flex flex-col gap-3">
  {#each debates as debate}
    <li class="rounded-lg border border-slate-200 bg-white p-4">
      <p class="font-medium">{debate.topic}</p>
      <span class="text-sm text-slate-500">{debate.status}</span>
    </li>
  {/each}
</ul>
