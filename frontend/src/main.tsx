import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/base.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./lib/api/mock"; // mock /api/*
createRoot(document.getElementById("root")!).render(<App />);