import { renderGlobalOverviewPage } from "./pages/globalOverviewPage.js";

const app = document.querySelector("#app");

renderGlobalOverviewPage(app).catch((error) => {
  app.innerHTML = `<p class="muted">Failed to render device overview.</p>`;
  console.error(error);
});
