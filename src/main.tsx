import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((value) => console.log(value))
      .catch((error) => console.log(error));
  }
};

if (document.readyState === "complete") {
  registerServiceWorker();
} else {
  window.addEventListener("load", () => {
    registerServiceWorker();
  });
}
