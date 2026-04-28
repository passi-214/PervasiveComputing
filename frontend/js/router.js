import { renderGlobalOverviewPage } from "./pages/globalOverviewPage.js";
import { renderDeviceOverviewPage } from "./pages/overviewPage.js";
import { renderConductivityDetailPage } from "./pages/conductivityDetailPage.js";
import { renderTemperatureDetailPage } from "./pages/temperatureDetailPage.js";
import { renderTurbidityDetailPage } from "./pages/turbidityDetailPage.js";

export function startRouter(app) {
  async function renderRoute() {
    const hash = window.location.hash || "#/";
    const turbidityMatch = hash.match(/^#\/devices\/([^/]+)\/turbidity$/);
    const conductivityMatch = hash.match(/^#\/devices\/([^/]+)\/conductivity$/);
    const temperatureMatch = hash.match(/^#\/devices\/([^/]+)\/temperature$/);
    const deviceMatch = hash.match(/^#\/devices\/([^/]+)$/);

    if (turbidityMatch) {
      await renderTurbidityDetailPage(app, decodeURIComponent(turbidityMatch[1]));
      return;
    }

    if (conductivityMatch) {
      await renderConductivityDetailPage(app, decodeURIComponent(conductivityMatch[1]));
      return;
    }

    if (temperatureMatch) {
      await renderTemperatureDetailPage(app, decodeURIComponent(temperatureMatch[1]));
      return;
    }

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
