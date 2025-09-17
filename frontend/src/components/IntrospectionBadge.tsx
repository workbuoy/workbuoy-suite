import React, { useEffect, useState } from "react";
import { fetchIntrospectionReport, IntrospectionResponse } from "@/api/introspection";

type LoadState = "idle" | "loading" | "ready" | "error";

export function IntrospectionBadge() {
  const [state, setState] = useState<LoadState>("idle");
  const [snapshot, setSnapshot] = useState<IntrospectionResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    setState("loading");
    fetchIntrospectionReport()
      .then((data) => {
        if (!mounted) return;
        setSnapshot(data);
        setState("ready");
      })
      .catch(() => {
        if (!mounted) return;
        setState("error");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (state === "loading") {
    return <span className="chip">Laster introspeksjon…</span>;
  }

  if (state === "error") {
    return (
      <span className="chip" style={{ borderColor: "var(--err)", color: "var(--err)" }}>
        Introspeksjon utilgjengelig
      </span>
    );
  }

  if (state === "ready" && snapshot) {
    const pct = Math.round(snapshot.awarenessScore * 100);
    const summary = snapshot.introspectionReport.summary;
    const generatedAt = new Date(snapshot.introspectionReport.generatedAt);
    const title = `${summary} • Sist oppdatert ${generatedAt.toLocaleString()}`;
    return (
      <span className="chip" title={title}>
        Awareness score: {pct}%
      </span>
    );
  }

  return null;
}

export default IntrospectionBadge;
