import React from "react";
import { FlipCard, type FlipCardProps, ProactivitySwitch, type Mode } from "@workbuoy/ui";
import "@workbuoy/ui/styles/focus.css";
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
const PRIORITY_LOADING_MESSAGE_ID = "dashboard-priority-loading";
const PRIORITY_PARTIAL_MESSAGE_ID = "dashboard-priority-partial";
const DASHBOARD_LIVE_REGION_ID = "dashboard-live";

type DataState = "idle" | "loading" | "partial" | "ready" | "error" | "empty";

const PARTIAL_TILE_RATIO = 0.6;

function chooseOutcome(): Exclude<DataState, "idle" | "loading"> {
  const value = Math.random();

  if (value < 0.2) {
    return "empty";
  }

  if (value < 0.4) {
    return "error";
  }

  if (value < 0.7) {
    return "partial";
  }

  return "ready";
}

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

type DashboardTileProps = {
  tile: TileDefinition;
  isActive: boolean;
  onToggle: (id: string) => void;
};

function DashboardTile({ tile, isActive, onToggle }: DashboardTileProps) {
  const descriptionId = `${tile.id}-description`;
  const highlightsId = `${tile.id}-highlights`;

  const handleToggle = React.useCallback(() => {
    onToggle(tile.id);
  }, [onToggle, tile.id]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  return (
    <article className="dashboard__tile" aria-labelledby={`${tile.id}-title`} data-active={isActive}>
      <div
        className="dashboard__tile-surface wbui-focus-ring"
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-describedby={`${descriptionId} ${highlightsId}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <div className="dashboard__tile-header">
          <h3 id={`${tile.id}-title`} className="wbui-contrast-strong">
            {tile.title}
          </h3>
          <p id={descriptionId}>{tile.description}</p>
        </div>
        <ul className="dashboard__list" id={highlightsId}>
          {tile.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
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
  const mainRef = React.useRef<HTMLElement>(null);
  const [mode, setMode] = React.useState<Mode>("proactive");
  const [status, setStatus] = React.useState("Proactive view enabled");
  const [dataState, setDataState] = React.useState<DataState>("idle");
  const [liveMessage, setLiveMessage] = React.useState("Initialiserer dashboard…");
  const [loadedCount, setLoadedCount] = React.useState(0);
  const [activeTiles, setActiveTiles] = React.useState<Set<string>>(() => new Set());
  const loadTimeoutRef = React.useRef<number | null>(null);
  const retryButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const shouldRestoreFocusRef = React.useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, []);

  React.useEffect(() => {
    setStatus(mode === "proactive" ? "Proactive view enabled" : "Reactive view enabled");
  }, [mode]);

  const orderedTiles = React.useMemo(() => {
    return mode === "proactive"
      ? [...PROACTIVE_TILES, ...REACTIVE_TILES]
      : [...REACTIVE_TILES, ...PROACTIVE_TILES];
  }, [mode]);

  const orderedTilesRef = React.useRef(orderedTiles);

  React.useEffect(() => {
    orderedTilesRef.current = orderedTiles;
  }, [orderedTiles]);

  const beginLoad = React.useCallback(() => {
    if (loadTimeoutRef.current !== null) {
      clearTimeout(loadTimeoutRef.current);
    }

    setDataState("loading");
    setLiveMessage("Laster inn dashboard-paneler…");
    setLoadedCount(0);
    setActiveTiles(new Set());

    loadTimeoutRef.current = window.setTimeout(() => {
      const outcome = chooseOutcome();
      const totalTiles = orderedTilesRef.current.length;
      const partialCount = Math.min(
        Math.max(1, Math.ceil(totalTiles * PARTIAL_TILE_RATIO)),
        Math.max(totalTiles - 1, 1),
      );

      if (outcome === "partial") {
        setLoadedCount(partialCount);
      } else if (outcome === "ready") {
        setLoadedCount(totalTiles);
      } else {
        setLoadedCount(0);
      }

      setDataState(outcome);
    }, SKELETON_DELAY);
  }, []);

  const reload = React.useCallback(() => {
    shouldRestoreFocusRef.current = true;
    beginLoad();
  }, [beginLoad]);

  React.useEffect(() => {
    beginLoad();

    return () => {
      if (loadTimeoutRef.current !== null) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [beginLoad]);

  React.useEffect(() => {
    switch (dataState) {
      case "loading":
        setLiveMessage("Laster inn dashboard-paneler…");
        break;
      case "error":
        setLiveMessage("Feil ved lasting – prøv igjen");
        break;
      case "empty":
        setLiveMessage("Tomt dashboard – legg til paneler");
        break;
      case "partial": {
        const totalTiles = orderedTilesRef.current.length;
        setLiveMessage(`${loadedCount} av ${totalTiles} paneler klare`);
        break;
      }
      case "ready":
        setLiveMessage("Alle dashboard-paneler klare");
        break;
      default:
        break;
    }
  }, [dataState, loadedCount]);

  React.useEffect(() => {
    if (dataState === "error" && shouldRestoreFocusRef.current) {
      retryButtonRef.current?.focus({ preventScroll: true });
      shouldRestoreFocusRef.current = false;
    }
  }, [dataState]);

  const flipCardProps = React.useMemo<Partial<FlipCardProps>>(
    () => ({
      motionProfile: prefersReducedMotion ? "calm" : "default",
      allowedSizes: ["sm", "md", "lg"],
      size: "md",
    }),
    [prefersReducedMotion],
  );

  const toggleTile = React.useCallback((tileId: string) => {
    setActiveTiles((previous) => {
      const next = new Set(previous);
      if (next.has(tileId)) {
        next.delete(tileId);
      } else {
        next.add(tileId);
      }
      return next;
    });
  }, []);

  const handleRetryKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        reload();
      }
    },
    [reload],
  );

  const handleAddPanelsKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
    }
  }, []);

  const isLoading = dataState === "loading";
  const totalTiles = orderedTiles.length;
  const visibleTiles = React.useMemo(() => {
    if (dataState === "ready") {
      return orderedTiles;
    }

    if (dataState === "partial") {
      const tileCount = orderedTiles.length;
      return orderedTiles.slice(0, Math.min(loadedCount, tileCount));
    }

    return [];
  }, [dataState, loadedCount, orderedTiles]);

  const sectionDescriptionIds = [] as string[];
  if (isLoading) {
    sectionDescriptionIds.push(PRIORITY_LOADING_MESSAGE_ID);
  }
  if (dataState === "partial") {
    sectionDescriptionIds.push(PRIORITY_PARTIAL_MESSAGE_ID);
  }
  const sectionDescribedBy = sectionDescriptionIds.length > 0 ? sectionDescriptionIds.join(" ") : undefined;

  return (
    <main ref={mainRef} tabIndex={-1} className="dashboard" aria-labelledby="dashboard-heading">
      <div className="dashboard__layout">
        <div
          id={DASHBOARD_LIVE_REGION_ID}
          aria-live="polite"
          aria-atomic="true"
          className="dashboard__sr-only"
          data-testid="dash-live"
        >
          {liveMessage}
        </div>
        <header className="dashboard__header">
          <div className="dashboard__heading">
            <h1 id="dashboard-heading">Dashboard</h1>
            <p>Prioritise what matters across proactive and reactive work.</p>
          </div>
          <section
            className="dashboard__controls"
            aria-labelledby="dashboard-proactivity-heading"
            role="region"
          >
            <h2 id="dashboard-proactivity-heading" className="dashboard__sr-only">
              Proactivity controls
            </h2>
            <IntrospectionBadge />
            <PrimaryNav currentPath="/dashboard" aria-label="Primary navigation" />
            <ProactivitySwitch
              value={mode}
              onChange={setMode}
              aria-label="Dashboard proactivity mode"
              className="dashboard__switch"
            />
            <span
              className="dashboard__status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-testid="dashboard-status"
            >
              {status}
            </span>
          </section>
        </header>

        <section
          className="dashboard__section"
          aria-labelledby="dashboard-priority-heading"
          aria-busy={isLoading}
          aria-describedby={sectionDescribedBy}
          role="region"
        >
          <div className="dashboard__section-header">
            <div className="dashboard__section-heading">
              <h2 id="dashboard-priority-heading">Priority overview</h2>
              {dataState === "partial" && (
                <span className="dashboard__chip dashboard__chip--partial" aria-label="Delvis lastet">
                  Delvis
                </span>
              )}
            </div>
            <p>Tiles reorder based on the selected mode so the right work stays first.</p>
          </div>
          {isLoading && (
            <p id={PRIORITY_LOADING_MESSAGE_ID} className="dashboard__sr-only">
              Loading priority overview…
            </p>
          )}
          {dataState === "empty" && (
            <div className="dashboard__state dashboard__state--empty" role="status">
              <div className="dashboard__state-content">
                <h3>Ingen paneler ennå</h3>
                <p>Legg til paneler for å fylle ut oversikten din.</p>
              </div>
              <div
                role="button"
                tabIndex={0}
                className="dashboard__link-button wbui-focus-ring"
                onKeyDown={handleAddPanelsKeyDown}
              >
                Legg til paneler
              </div>
            </div>
          )}
          {dataState === "error" && (
            <div className="dashboard__state dashboard__state--error" role="status">
              <div className="dashboard__state-content">
                <h3>Kunne ikke laste panelene</h3>
                <p>Det oppstod en feil. Prøv igjen om et øyeblikk.</p>
              </div>
              <button
                ref={retryButtonRef}
                type="button"
                className="dashboard__retry-button wbui-focus-ring"
                onClick={reload}
                onKeyDown={handleRetryKeyDown}
              >
                Prøv igjen
              </button>
            </div>
          )}
          {dataState === "partial" && (
            <p id={PRIORITY_PARTIAL_MESSAGE_ID} className="dashboard__state-description">
              {loadedCount} av {totalTiles} paneler klare
            </p>
          )}
          {isLoading ? (
            <div className="dashboard__skeleton-grid" aria-hidden="true">
              {Array.from({ length: SKELETON_TILES }).map((_, index) => (
                <div key={index} className="dashboard__skeleton-tile" />
              ))}
            </div>
          ) : (
            <div className="dashboard__grid">
              {visibleTiles.map((tile) => (
                <DashboardTile
                  key={tile.id}
                  tile={tile}
                  isActive={activeTiles.has(tile.id)}
                  onToggle={toggleTile}
                />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard__section" aria-labelledby="dashboard-activity-heading" role="region">
          <div className="dashboard__section-header">
            <h2 id="dashboard-activity-heading">Activity highlights</h2>
            <p>Flip between what is happening today and the rest of the week.</p>
          </div>
          <div className="dashboard__flip">
            <div className="dashboard__flip-card">
              <FlipCard
                front={
                  <div className="dashboard__flip-surface" aria-label="Today">
                    <h3 className="wbui-contrast-strong">Today</h3>
                    <ul>
                      {TODAY_ITEMS.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                }
                back={
                  <div className="dashboard__flip-surface" aria-label="This week">
                    <h3 className="wbui-contrast-strong">This week</h3>
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
