import React from "react";
import { BuoyDock } from "@workbuoy/ui";

const chatMessages = [
  { id: 1, author: "Buoy", text: "Hei! Hvordan kan jeg hjelpe deg i dag?" },
  {
    id: 2,
    author: "Du",
    text: "Vis meg de viktigste navigasjonskortene for denne uken.",
  },
  {
    id: 3,
    author: "Buoy",
    text: "Klart! Navi har tre anbefalinger og to varsler du bør se på.",
  },
];

const naviSections = [
  {
    id: "alerts",
    title: "Varsler",
    description: "Oppdater SLA for team Beta og sjekk nye risikomeldinger.",
  },
  {
    id: "insights",
    title: "Innsikt",
    description: "Pipeline-konvertering opp 14% siden forrige uke.",
  },
  {
    id: "actions",
    title: "Handlinger",
    description: "Planlegg kvartalsmøte og bekreft nye dashboards.",
  },
  {
    id: "reports",
    title: "Rapporter",
    description: "Q2 status er klar med detaljerte segmentanalyser.",
  },
  {
    id: "team",
    title: "Team",
    description: "3 nye medlemmer trenger onboarding i Navi.",
  },
  {
    id: "roadmap",
    title: "Roadmap",
    description: "Oppgaver for juli sprinten er klare til sign-off.",
  },
];

function ChatPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
      }}
    >
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {chatMessages.map((message) => (
          <li
            key={message.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              background: "rgba(15, 23, 42, 0.65)",
              borderRadius: "12px",
              padding: "12px 14px",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{message.author}</span>
            <span style={{ fontSize: "0.95rem" }}>{message.text}</span>
          </li>
        ))}
      </ul>
      <form
        aria-label="Send melding"
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.7)",
          borderRadius: "12px",
          padding: "8px 12px",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          placeholder="Skriv en melding..."
          aria-label="Meldingsfelt"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "inherit",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          className="wbui-focus-ring"
          style={{
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "rgba(148, 163, 184, 0.16)",
            color: "inherit",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function NaviPanel({ expanded }: { expanded: boolean }) {
  const visibleSections = expanded ? naviSections : naviSections.slice(0, 3);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: expanded ? "repeat(2, minmax(0, 1fr))" : "1fr",
        gap: "12px",
        paddingBottom: "4px",
      }}
    >
      {visibleSections.map((section) => (
        <article
          key={section.id}
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem" }}>{section.title}</h3>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
            {section.description}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function DockDemo() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #1e293b, #020617)",
        color: "#f8fafc",
        padding: "48px",
      }}
    >
      <section style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
          BuoyDock widget
        </h1>
        <p style={{ margin: 0, opacity: 0.75, fontSize: "1.05rem" }}>
          En kompakt chatflate foran og Navi på baksiden. Bruk flip for å bytte
          flate, og utvid for større innsikt når du trenger mer plass.
        </p>
      </section>
      <BuoyDock
        titleFront="buoy ai"
        titleBack="Navi"
        expanded={expanded}
        onExpandedChange={setExpanded}
        childrenFront={<ChatPanel />}
        childrenBack={<NaviPanel expanded={expanded} />}
        ariaLabel="BuoyDock widget"
      />
    </main>
  );
}
