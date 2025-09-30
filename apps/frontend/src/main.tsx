import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import DockDemo from "./routes/dock-demo";
import ControlsDemo from "./routes/demo/controls-demo";
import DashboardRoute from "./routes/dashboard";
import "./styles/tokens.css";
import "./styles/base.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./lib/api/mock"; // mock /api/*
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing root element");
}

const path = window.location.pathname;
const isDockDemo = path.includes("dock-demo");
const isControlsDemo = path === "/demo" || path.startsWith("/demo/");
const isDashboard = path === "/dashboard" || path.startsWith("/dashboard/");

const element = isDockDemo
  ? <DockDemo />
  : isControlsDemo
    ? <ControlsDemo />
    : isDashboard
      ? <DashboardRoute />
      : <App />;

createRoot(rootElement).render(element);
