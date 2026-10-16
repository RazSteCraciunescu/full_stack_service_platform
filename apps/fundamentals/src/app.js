const cards = document.querySelector("#requestCards");
const filter = document.querySelector("#filterInput");
const themeButton = document.querySelector("#themeButton");
let requests = [];

function makeCard(item) {
  const article = document.createElement("article");
  article.className = "request-card";
  const top = document.createElement("div");
  top.className = "top";
  const id = document.createElement("span");
  id.textContent = item.id;
  const priority = document.createElement("span");
  priority.textContent = item.priority;
  top.append(id, priority);
  const title = document.createElement("h3");
  title.textContent = item.title;
  const description = document.createElement("p");
  description.textContent = item.description;
  const footer = document.createElement("footer");
  const category = document.createElement("span");
  category.textContent = item.category;
  const status = document.createElement("span");
  status.className = "status";
  status.textContent = item.status;
  footer.append(category, status);
  article.append(top, title, description, footer);
  return article;
}

function render() {
  const query = filter.value.trim().toLowerCase();
  const visible = requests.filter((item) => !query || `${item.id} ${item.title} ${item.category} ${item.status}`.toLowerCase().includes(query));
  cards.replaceChildren(...visible.map(makeCard));
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.textContent = "No requests match that keyword.";
    cards.append(empty);
  }
}

async function load() {
  try {
    const response = await fetch("/api/requests");
    if (!response.ok) throw new Error();
    requests = (await response.json()).items;
    render();
  } catch {
    cards.textContent = "The local API is not available. Start the Node server and reload.";
  }
}

function setTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);
  themeButton.setAttribute("aria-pressed", String(dark));
  themeButton.textContent = dark ? "Use light theme" : "Use dark theme";
  localStorage.setItem("fundamentals-theme", dark ? "dark" : "light");
}

filter.addEventListener("input", render);
themeButton.addEventListener("click", () => setTheme(!document.documentElement.classList.contains("dark")));
setTheme(localStorage.getItem("fundamentals-theme") === "dark");
load();
