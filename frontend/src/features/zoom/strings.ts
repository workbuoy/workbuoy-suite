export const semanticZoomStrings = {
  title: "Semantisk zoom",
  levels: {
    list: "Liste",
    timeline: "Tidslinje",
    strategy: "Strategi",
  },
  shortcuts: {
    zoomIn: "Ctrl/Cmd + +",
    zoomOut: "Ctrl/Cmd + -",
    levelKeys: "1-3",
  },
  timelineLabel: (label: string) => label,
  clusterLabel: (type: string) => type,
};
export type SemanticZoomStrings = typeof semanticZoomStrings;
