import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";

import { BuoyDock, type BuoyDockProps } from "./BuoyDock.js";

type StoryArgs = Pick<
  BuoyDockProps,
  "initialSide" | "defaultExpanded" | "titleFront" | "titleBack"
> & {
  ariaLabel: string;
};

const chatLog = [
  "Hei! Jeg er Buoy – klar for spørsmål?",
  "Gi meg de viktigste Navi-flisene for denne uken.",
  "Selvsagt! Jeg har tre anbefalinger klare.",
];

const naviItems = [
  { title: "Varsler", description: "Oppdater SLA og sjekk nye risikoer." },
  { title: "Handlinger", description: "Planlegg neste kvartalsmøte." },
  { title: "Dashboards", description: "Tre nye dashboards trenger godkjenning." },
  { title: "Innsikt", description: "Konvertering opp 12% siden forrige uke." },
  { title: "Team", description: "To nye medlemmer klar for onboarding." },
  { title: "Rapporter", description: "Månedlig status er klar for review." },
];

function StoryChat() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px 16px",
          background: "rgba(15, 23, 42, 0.65)",
          borderRadius: "16px",
          border: "1px solid rgba(148, 163, 184, 0.3)",
        }}
      >
        {chatLog.map((line, index) => (
          <p key={line} style={{ margin: 0, fontSize: "0.95rem", opacity: index === 0 ? 0.9 : 0.75 }}>
            {line}
          </p>
        ))}
      </div>
      <button
        type="button"
        className="wbui-focus-ring"
        style={{
          alignSelf: "flex-end",
          borderRadius: "999px",
          border: "1px solid rgba(148, 163, 184, 0.4)",
          background: "rgba(148, 163, 184, 0.16)",
          color: "inherit",
          padding: "8px 16px",
          fontSize: "0.85rem",
        }}
      >
        Send forslag
      </button>
    </div>
  );
}

function StoryNavi({ expanded }: { expanded: boolean }) {
  const visible = useMemo(() => (expanded ? naviItems : naviItems.slice(0, 3)), [expanded]);

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        gridTemplateColumns: expanded ? "repeat(2, minmax(0, 1fr))" : "1fr",
      }}
    >
      {visible.map((item) => (
        <article
          key={item.title}
          style={{
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem" }}>{item.title}</h3>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

const meta = {
  title: "Dock/BuoyDock",
  component: BuoyDock,
  args: {
    initialSide: "front",
    defaultExpanded: false,
    titleFront: "buoy ai",
    titleBack: "Navi",
    ariaLabel: "BuoyDock widget",
  },
  argTypes: {
    initialSide: {
      control: "inline-radio",
      options: ["front", "back"],
      description: "Velg hvilken side som vises først når docken monteres.",
    },
    defaultExpanded: {
      control: "boolean",
      description: "Starter docken i utvidet dialog-modus.",
    },
    titleFront: { control: "text" },
    titleBack: { control: "text" },
    ariaLabel: { control: "text" },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "BuoyDock fungerer som en fast widget nederst til høyre. Forsiden viser en kompakt Buoy-chat, mens baksiden holder Navi. Bruk flip-kontrollen for å bytte side og `Expand` for å gå inn i et dialog-lignende panel med fokusfelle. Reduced motion respekteres automatisk.",
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(args.defaultExpanded ?? false);

    useEffect(() => {
      setExpanded(args.defaultExpanded ?? false);
    }, [args.defaultExpanded]);

    const { defaultExpanded, ...rest } = args;

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top right, #1e293b, #020617)",
          color: "#f8fafc",
          padding: "48px",
        }}
      >
        <section style={{ maxWidth: 680 }}>
          <h1 style={{ fontSize: "2.25rem", marginBottom: "12px" }}>BuoyDock</h1>
          <p style={{ margin: 0, opacity: 0.75 }}>
            Flip for å bytte mellom chat og Navi, og utvid når du trenger mer plass.
          </p>
        </section>
        <BuoyDock
          {...rest}
          expanded={expanded}
          onExpandedChange={(value) => {
            setExpanded(value);
          }}
          childrenFront={<StoryChat />}
          childrenBack={<StoryNavi expanded={expanded} />}
        />
      </div>
    );
  },
};
