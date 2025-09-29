import React from "react";
import DockHost, { type DockHostProps } from "./DockHostLegacy";
import "./dock.css";

export type DockShellProps = DockHostProps;

export default function DockShell({ open = true, ...props }: DockShellProps) {
  return (
    <div className="wb-dock-shell">
      <DockHost {...props} open={open} />
    </div>
  );
}
