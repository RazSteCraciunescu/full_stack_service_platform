const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: "",
      metrics: {},
      requests: [],
      query: "",
      colors: { Backlog: "#a5aaa7", Open: "#438cb7", "In Progress": "#7163d6", Waiting: "#d69b36", Resolved: "#27a284", Closed: "#234a42" }
    };
  },
  computed: {
    filteredRequests() {
      const query = this.query.trim().toLowerCase();
      return this.requests.filter((item) => !query || `${item.id} ${item.title} ${item.category}`.toLowerCase().includes(query)).slice(0, 8);
    },
    statusRows() {
      return Object.entries(this.metrics.byStatus || {}).filter(([, value]) => value > 0).map(([name, value]) => ({ name, value, color: this.colors[name] || "#84918d" }));
    },
    donutStyle() {
      const rows = this.statusRows;
      const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
      let current = 0;
      const segments = rows.map((row) => {
        const start = current;
        current += (row.value / total) * 360;
        return `${row.color} ${start}deg ${current}deg`;
      });
      return { background: `conic-gradient(${segments.join(",")})` };
    }
  },
  methods: {
    async reload() {
      this.loading = true;
      this.error = "";
      try {
        const [metricsResponse, requestsResponse] = await Promise.all([fetch("/api/metrics"), fetch("/api/requests")]);
        if (!metricsResponse.ok || !requestsResponse.ok) throw new Error("The API returned an unexpected response.");
        this.metrics = await metricsResponse.json();
        this.requests = (await requestsResponse.json()).items;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    barWidth(count) {
      const values = (this.metrics.byCategory || []).map((row) => row.count);
      const max = Math.max(1, ...values);
      return `${Math.round((count / max) * 100)}%`;
    },
    shortDate(value) {
      return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
    }
  },
  mounted() { this.reload(); }
}).mount("#app");
