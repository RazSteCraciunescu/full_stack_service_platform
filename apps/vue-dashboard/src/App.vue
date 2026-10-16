<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { loadDashboard } from "./api";
import type { Metrics, RequestRow } from "./types";

const metrics = ref<Metrics | null>(null);
const requests = ref<RequestRow[]>([]);
const error = ref("");
const loading = ref(true);
const selectedPriority = ref("");

const visibleRequests = computed(() => selectedPriority.value
  ? requests.value.filter((item) => item.priority === selectedPriority.value)
  : requests.value
);

const maximumCategory = computed(() => Math.max(1, ...(metrics.value?.byCategory.map((item) => item.count) ?? [1])));

async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    const data = await loadDashboard();
    metrics.value = data.metrics;
    requests.value = data.requests;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Dashboard data could not be loaded.";
  } finally {
    loading.value = false;
  }
}

onMounted(refresh);
</script>

<template>
  <main class="analytics-shell">
    <header>
      <div><span class="eyebrow">Vue 3 client</span><h1>Service analytics</h1><p>A focused read-only view over the shared request API.</p></div>
      <div class="header-actions"><a href="/">Main portal</a><button @click="refresh">Refresh</button></div>
    </header>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <section class="metrics" aria-label="Metrics">
      <article><span>Total requests</span><strong>{{ metrics?.total ?? '—' }}</strong></article>
      <article><span>Active</span><strong>{{ metrics?.active ?? '—' }}</strong></article>
      <article><span>At risk</span><strong>{{ metrics?.atRisk ?? '—' }}</strong></article>
      <article><span>Resolution rate</span><strong>{{ metrics ? `${metrics.resolutionRate}%` : '—' }}</strong></article>
    </section>

    <section class="dashboard-grid">
      <article class="panel category-panel">
        <span class="eyebrow">Demand</span><h2>Requests by category</h2>
        <div v-if="metrics" class="bars">
          <div v-for="item in metrics.byCategory" :key="item.category" class="bar-row">
            <span>{{ item.category }}</span><div><i :style="{ width: `${(item.count / maximumCategory) * 100}%` }"></i></div><strong>{{ item.count }}</strong>
          </div>
        </div>
      </article>

      <article class="panel queue-panel">
        <div class="panel-heading"><div><span class="eyebrow">Workload</span><h2>Recent queue</h2></div><select v-model="selectedPriority"><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></div>
        <p v-if="loading">Loading…</p>
        <ul v-else>
          <li v-for="item in visibleRequests" :key="item.id"><div><small>{{ item.id }} · {{ item.category }}</small><strong>{{ item.title }}</strong></div><span :class="`priority ${item.priority.toLowerCase()}`">{{ item.priority }}</span></li>
        </ul>
      </article>
    </section>
  </main>
</template>
