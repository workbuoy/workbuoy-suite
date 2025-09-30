import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import DockDemo from "./routes/dock-demo";
import "./styles/tokens.css";
import "./styles/base.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./lib/api/mock"; // mock /api/*
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing root element");
}

const isDockDemo = window.location.pathname.includes("dock-demo");

createRoot(rootElement).render(isDockDemo ? <DockDemo /> : <App />);
