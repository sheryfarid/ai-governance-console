import { useState } from "react";
import { createRoot } from "react-dom/client";
import EvalGovStack from "./AiEvaluationGovernanceStack.jsx";
import GovRoutingTool from "./AiGovernanceRoutingTool.jsx";
import ModelRoutingPolicy from "./AiModelRoutingPolicy.jsx";

const TOOLS = [
  { id: "stack", label: "Evaluation & Governance Stack", Component: EvalGovStack },
  { id: "routing", label: "Governance Routing Tool", Component: GovRoutingTool },
  { id: "policy", label: "Model Routing Policy", Component: ModelRoutingPolicy },
];

function Host() {
  const [active, setActive] = useState(TOOLS[0].id);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 9999, display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px", background: "#0A1420", borderBottom: "1px solid #1B3048",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <span style={{ color: "#4DBBFF", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", marginRight: 8 }}>
          3 TOOLS
        </span>
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid #1B3048", cursor: "pointer",
              background: active === t.id ? "#284260" : "#101E30",
              color: active === t.id ? "#E7EEF9" : "#7690B3", fontSize: 12, fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {TOOLS.map(t => {
          const Comp = t.Component;
          return (
            <div key={t.id} style={{ display: active === t.id ? "block" : "none" }}>
              <Comp />
            </div>
          );
        })}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Host />);