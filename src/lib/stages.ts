export const stages = [
  { stage: "planned", label: "Planned", step: "scrambled" },
  { stage: "cross", label: "Started", step: "cross" },
  { stage: "f2l", label: "In progress", step: "F2L" },
  { stage: "oll", label: "Almost done", step: "OLL" },
  { stage: "done", label: "Done", step: "solved" },
] as const;

export type Stage = (typeof stages)[number]["stage"];

export function stageLabel(stage: Stage) {
  const found = stages.find((s) => s.stage === stage)!;
  return `${found.label} (${found.step})`;
}
