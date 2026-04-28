import { startRouter } from "./router.js";

const app = document.querySelector("#app");

startRouter(app).catch((error) => {
  app.innerHTML = `<p class="muted">Failed to start dashboard.</p>`;
  console.error(error);
});
