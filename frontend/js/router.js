import { renderGlobalOverviewPage } from "./pages/globalOverviewPage.js";
import { renderDeviceOverviewPage } from "./pages/overviewPage.js";

export function startRouter(app) {
  async function renderRoute() {
    const hash = window.location.hash || "#/";
    const deviceMatch = hash.match(/^#\/devices\/([^/]+)$/);

    if (deviceMatch) {
      await renderDeviceOverviewPage(app, decodeURIComponent(deviceMatch[1]));
      return;
    }

    await renderGlobalOverviewPage(app);
  }

  window.addEventListener("hashchange", () => {
    renderRoute().catch((error) => {
      app.innerHTML = `<p class="muted">Failed to render page.</p>`;
      console.error(error);
    });
  });

  return renderRoute();
}
