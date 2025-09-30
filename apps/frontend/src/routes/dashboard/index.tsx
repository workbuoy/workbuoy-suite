import React from "react";
import { FlipCard, type FlipCardProps, ProactivitySwitch, type Mode } from "@workbuoy/ui";
import { IntrospectionBadge } from "@/components/IntrospectionBadge";
import { PrimaryNav } from "@/components/PrimaryNav";
import "./dashboard.css";

type TileDefinition = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  actions: string[];
};

const PROACTIVE_TILES: TileDefinition[] = [
  {
    id: "next-steps",
    title: "Suggested next steps",
    description: "Signals from account health and planner",
    highlights: [
      "Schedule outreach with Northwind — response overdue by 2 days",
      "Share KPI summary with Phoenix Solar ahead of renewals",
      "Review the auto-generated brief for the newly assigned region",
    ],
    actions: ["Plan outreach", "Open planner"],
  },
  {
    id: "momentum",
    title: "Momentum boosts",
    description: "Keep successful threads moving forward",
    highlights: [
      "Acknowledge Beacon Corp pilot launch success",
      "Offer next-step workshop to Delta Analytics champions",
      "Queue a follow-up for partners flagged as high potential",
    ],
    actions: ["Share update", "Celebrate wins"],
  },
];

const REACTIVE_TILES: TileDefinition[] = [
  {
    id: "escalations",
    title: "Customer escalations",
    description: "Requires attention today",
    highlights: [
      "Critical: Beacon Corp requesting pricing adjustments",
      "High: Ticket #4821 waiting on solution validation",
      "Reminder: Support rotation handoff due before 14:00",
    ],
    actions: ["View escalation", "Reply now"],
  },
  {
    id: "inbox",
    title: "Inbox queue",
    description: "Items assigned directly to you",
    highlights: [
      "5 new requests in the shared inbox",
      "3 follow-ups due by 17:00",
      "Auto-generated summary ready for tomorrow's sync",
    ],
    actions: ["Open inbox", "Mark blockers"],
  },
];

const TODAY_ITEMS = [
  "Daily stand-up summary posted",
  "Renewal risk alerts updated",
  "Two opportunities flagged for quick review",
];

const WEEK_ITEMS = [
  "Three renewals closing this week",
  "Workflow automation report ready",
  "Team retro scheduled for Thursday",
];

const SKELETON_TILES = 4;
const SKELETON_DELAY = 900;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
    } else if (typeof query.addListener === "function") {
      query.addListener(listener);
    }

    return () => {
      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", listener);
      } else if (typeof query.removeListener === "function") {
        query.removeListener(listener);
      }
    };
  }, []);

  return prefersReducedMotion;
}

function DashboardTile({ tile }: { tile: TileDefinition }) {
  return (
    <article className="dashboard__tile" aria-labelledby={`${tile.id}-title`}>
      <div className="dashboard__tile-header">
        <h3 id={`${tile.id}-title`}>{tile.title}</h3>
        <p>{tile.description}</p>
      </div>
      <ul className="dashboard__list">
        {tile.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div role="group" className="dashboard__tile-actions" aria-label={`${tile.title} actions`}>
        {tile.actions.map((action) => (
          <button key={action} type="button" className="wbui-focus-ring dashboard__action-button">
            {action}
          </button>
        ))}
      </div>
    </article>
  );
}

export default function DashboardRoute() {
  const [mode, setMode] = React.useState<Mode>("proactive");
  const [status, setStatus] = React.useState("Proactive view enabled");
  const [loading, setLoading] = React.useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    setStatus(mode === "proactive" ? "Proactive view enabled" : "Reactive view enabled");
  }, [mode]);

  const orderedTiles = React.useMemo(() => {
    return mode === "proactive"
      ? [...PROACTIVE_TILES, ...REACTIVE_TILES]
      : [...REACTIVE_TILES, ...PROACTIVE_TILES];
  }, [mode]);

  const flipCardProps = React.useMemo<Partial<FlipCardProps>>(
    () => ({
      motionProfile: prefersReducedMotion ? "calm" : "default",
      allowedSizes: ["sm", "md", "lg"],
      size: "md",
    }),
    [prefersReducedMotion],
  );

  return (
    <main role="main" className="dashboard">
      <div className="dashboard__layout">
        <header className="dashboard__header">
          <div className="dashboard__heading">
            <h1>Dashboard</h1>
            <p>Prioritise what matters across proactive and reactive work.</p>
          </div>
          <div className="dashboard__controls">
            <IntrospectionBadge />
            <PrimaryNav currentPath="/dashboard" aria-label="Primary navigation" />
            <ProactivitySwitch
              value={mode}
              onChange={setMode}
              aria-label="Dashboard proactivity mode"
              className="dashboard__switch"
            />
            <span className="dashboard__status" aria-live="polite" data-testid="dashboard-status">
              {status}
            </span>
          </div>
        </header>

        <section className="dashboard__section" aria-labelledby="dashboard-priority-heading" aria-busy={loading}>
          <div className="dashboard__section-header">
            <h2 id="dashboard-priority-heading">Priority overview</h2>
            <p>Tiles reorder based on the selected mode so the right work stays first.</p>
          </div>
          {loading ? (
            <div className="dashboard__skeleton-grid" aria-hidden="true">
              {Array.from({ length: SKELETON_TILES }).map((_, index) => (
                <div key={index} className="dashboard__skeleton-tile" />
              ))}
            </div>
          ) : (
            <div className="dashboard__grid">
              {orderedTiles.map((tile) => (
                <DashboardTile key={tile.id} tile={tile} />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard__section" aria-labelledby="dashboard-activity-heading">
          <div className="dashboard__section-header">
            <h2 id="dashboard-activity-heading">Activity highlights</h2>
            <p>Flip between what is happening today and the rest of the week.</p>
          </div>
          <div className="dashboard__flip">
            <div className="dashboard__flip-card">
              <FlipCard
                front={
                  <div className="dashboard__flip-surface" aria-label="Today">
                    <h3>Today</h3>
                    <ul>
                      {TODAY_ITEMS.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                }
                back={
                  <div className="dashboard__flip-surface" aria-label="This week">
                    <h3>This week</h3>
                    <ul>
                      {WEEK_ITEMS.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                }
                ariaLabelFront="Today"
                ariaLabelBack="This week"
                {...flipCardProps}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
