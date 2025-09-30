import React from "react";

const linkStyles: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "var(--surface, rgba(15,23,42,0.08))",
  color: "inherit",
  textDecoration: "none",
  border: "1px solid rgba(148, 163, 184, 0.5)",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const containerStyles: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

type LinkMatch = (path: string) => boolean;

type NavLink = {
  href: string;
  label: string;
  match: LinkMatch;
};

const NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    match: (path) => path === "/dashboard" || path.startsWith("/dashboard/"),
  },
  {
    href: "/demo",
    label: "Controls demo",
    match: (path) => path === "/demo" || path.startsWith("/demo/"),
  },
  {
    href: "/dock-demo",
    label: "Dock demo",
    match: (path) => path.includes("dock-demo"),
  },
];

export interface PrimaryNavProps {
  currentPath?: string;
  "aria-label"?: string;
}

export function PrimaryNav({ currentPath, "aria-label": ariaLabel = "Primary" }: PrimaryNavProps) {
  const resolvedPath = React.useMemo(() => {
    if (currentPath) return currentPath;
    if (typeof window === "undefined") return "";
    return window.location.pathname;
  }, [currentPath]);

  return (
    <nav aria-label={ariaLabel} style={containerStyles}>
      {NAV_LINKS.map((link) => {
        const isActive = link.match(resolvedPath);
        return (
          <a
            key={link.href}
            href={link.href}
            className="wbui-focus-ring"
            style={linkStyles}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}

export default PrimaryNav;
