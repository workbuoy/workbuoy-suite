import { useCallback, useMemo, useState } from "react";

export type Connection = {
  key: string;
  type: string;
  id: string;
  label: string;
  createdAt: string;
  source?: "buoy" | "navi";
};

export type ConnectionInput = {
  type: string;
  id: string;
  label?: string;
};

function toKey(link: ConnectionInput) {
  return `${link.type}:${link.id}`.toLowerCase();
}

export function useConnections(initial: Connection[] = []) {
  const [connections, setConnections] = useState<Connection[]>(initial);
  const [highlight, setHighlight] = useState<string | null>(null);

  const addConnection = useCallback((link: ConnectionInput) => {
    setConnections((prev) => {
      const key = toKey(link);
      if (prev.some((item) => item.key === key)) {
        return prev.map((item) => (item.key === key ? { ...item, createdAt: new Date().toISOString() } : item));
      }
      const next: Connection = {
        key,
        type: link.type,
        id: link.id,
        label: link.label ?? link.id,
        createdAt: new Date().toISOString(),
        source: "buoy",
      };
      return [next, ...prev].slice(0, 20);
    });
    setHighlight(toKey(link));
  }, []);

  const removeConnection = useCallback((key: string) => {
    setConnections((prev) => prev.filter((item) => item.key !== key));
    setHighlight((prev) => (prev === key ? null : prev));
  }, []);

  const markFromNavi = useCallback((key: string) => {
    setHighlight(key);
    setConnections((prev) =>
      prev.map((item) => (item.key === key ? { ...item, source: "navi", createdAt: new Date().toISOString() } : item)),
    );
  }, []);

  const orderedConnections = useMemo(() => {
    return [...connections].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [connections]);

  return {
    connections: orderedConnections,
    addConnection,
    removeConnection,
    highlight,
    markFromNavi,
  };
}
