// Placeholder OpenCode plugin: enforce bounded work-until-goal behavior.
// Intended responsibilities:
// - inject current goal state
// - enforce cycle limits
// - block unsafe actions
// - require verifier pass before goal closure

export default function goalLoopPlugin() {
  return {
    name: "ai-harness-goal-loop"
  };
}
