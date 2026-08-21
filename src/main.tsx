import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PomodoroProvider } from "./store/PomodoroContext";
import "./styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <PomodoroProvider>
      <App />
    </PomodoroProvider>
  </StrictMode>,
);
