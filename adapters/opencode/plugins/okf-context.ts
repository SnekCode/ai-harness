// Placeholder OpenCode plugin: surface relevant OKF context.
// Intended responsibilities:
// - read router/mode config
// - make OKF search/read tools available
// - guide agents away from loading the entire OKF bundle

export default function okfContextPlugin() {
  return {
    name: "ai-harness-okf-context"
  };
}
