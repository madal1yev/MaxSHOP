import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./styles/index.css";

// Apply the saved theme before the first paint so pages never switch themes
// when navigating between layouts.
const savedTheme = localStorage.getItem("maxshop-theme") || "light";
document.documentElement.classList.toggle("dark", savedTheme === "dark");
document.documentElement.style.colorScheme = savedTheme;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
