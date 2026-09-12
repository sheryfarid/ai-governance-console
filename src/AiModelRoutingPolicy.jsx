import { useState, useEffect, useRef } from "react";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceHigh: "#21262D",
  border: "#30363D",
  borderAccent: "#1F6FEB",
  text: "#E6EDF3",
  textMuted: "#8B949E",
  textDim: "#484F58",
  blue: "#1F6FEB",
  blueSoft: "#1A4A8A",
  green: "#3FB950",
  greenSoft: "#1A3A1A",
  amber: "#D29922",
  amberSoft: "#3A2E0A",
  red: "#F85149",
  redSoft: "#3A1010",
  purple: "#8957E5",
  purpleSoft: "#2A1A4A",
  cyan: "#39D5FF",
  cyanSoft: "#0A2A3A",
  tier1: "#3FB950",
  tier2: "#1F6FEB",
  tier3: "#8957E5",
  tier4: "#F85149",
};

// ── Inline styles factory ─────────────────────────────────────────────────
const s = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    fontSize: 14,
    display: "flex",
  },
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: C.surface,
    borderRight: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarLogo: {
    padding: "20px 16px 12px",
    borderBottom: `1px solid ${C.border}`,
  },
  logoText: {
    fontSize: 13,
    fontWeight: 700,
    color: C.text,
    letterSpacing: "0.02em",
  },
  logoSub: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  navSection: { padding: "8px 8px" },
  navLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: C.textDim,
    padding: "8px 8px 4px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    color: active ? C.text : C.textMuted,
    background: active ? C.surfaceHigh : "transparent",
    border: active ? `1px solid ${C.border}` : "1px solid transparent",
    marginBottom: 1,
  }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    padding: "12px 24px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.surface,
  },
  content: { flex: 1, overflowY: "auto", padding: "24px" },
  card: (extra = {}) => ({
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 20,
    ...extra,
  }),
  badge: (color = C.blue, bg = C.blueSoft) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    color,
    background: bg,
    border: `1px solid ${color}33`,
  }),
  tab: (active) => ({
    padding: "8px 16px",
    borderRadius: "6px 6px 0 0",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? C.text : C.textMuted,
    background: active ? C.surfaceHigh : "transparent",
    border: active ? `1px solid ${C.border}` : "1px solid transparent",
    borderBottom: active ? `1px solid ${C.surfaceHigh}` : "1px solid transparent",
  }),
  input: {
    background: C.surfaceHigh,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    padding: "8px 12px",
    color: C.text,
    fontSize: 13,
    width: "100%",
    outline: "none",
  },
  select: {
    background: C.surfaceHigh,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    padding: "8px 12px",
    color: C.text,
    fontSize: 13,
    width: "100%",
    outline: "none",
  },
  btn: (variant = "primary") => ({
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    background:
      variant === "primary" ? C.blue :
      variant === "success" ? C.green :
      variant === "danger" ? C.red :
      variant === "ghost" ? "transparent" : C.surfaceHigh,
    color:
      variant === "ghost" ? C.textMuted : C.text,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  }),
  grid: (cols, gap = 16) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap,
  }),
  label: { fontSize: 12, color: C.textMuted, marginBottom: 4, display: "block" },
  h1: { fontSize: 22, fontWeight: 700, color: C.text, margin: 0 },
  h2: { fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 16px" },
  h3: { fontSize: 13, fontWeight: 600, color: C.text, margin: "0 0 8px" },
  p: { color: C.textMuted, fontSize: 13, lineHeight: 1.6, margin: "4px 0" },
  divider: { borderTop: `1px solid ${C.border}`, margin: "20px 0" },
  row: (gap = 12) => ({ display: "flex", alignItems: "center", gap }),
  col: (gap = 12) => ({ display: "flex", flexDirection: "column", gap }),
  tierBadge: (t) => {
    const map = { 1: [C.tier1, C.greenSoft], 2: [C.tier2, C.blueSoft], 3: [C.tier3, C.purpleSoft], 4: [C.tier4, C.redSoft] };
    const [color, bg] = map[t] || [C.textMuted, C.surfaceHigh];
    return { display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, color, background: bg };
  },
};

// ── Shared data ───────────────────────────────────────────────────────────
const PROVIDERS = ["OpenAI","Microsoft Azure OpenAI","Anthropic","Google","AWS Bedrock","Meta","Mistral","Cohere","Internal model","Fine-tuned enterprise model","On-premise model"];
const MODEL_TYPES = ["Small language model","General-purpose LLM","Reasoning model","Embedding model","Vision model","Speech model","Classification model","Fine-tuned model","Agent model"];
const HOSTING = ["Cloud API","Private cloud","On-premise","Hybrid"];
const LATENCY = ["Ultra-low (<100ms)","Low (<500ms)","Moderate (<2s)","High (2s+)"];
const REGIONS = ["UK","EU","US","APAC","Global","On-premise"];
const DATA_CLASSES = ["Public","Internal","Confidential","Personal (PII)","Special Category","Financial","Health","Biometric","Children's","Customer","Employee","Intellectual Property"];
const IMPACTS = ["Negligible","Low","Medium","High","Critical"];
const RISK_RATINGS = ["Low","Medium","High","Critical"];
const TASK_EXAMPLES = ["Sentiment Analysis","Document Classification","Entity Extraction","Summarisation","Translation","Email Drafting","Enterprise Search","RAG Q&A","Document Comparison","Contract Analysis","Risk Analysis","Financial Analysis","Code Generation","Complex Reasoning","Planning","Agentic Workflow","Tool Execution","Customer Support","Fraud Investigation","Regulatory Decision Support"];
const BUS_UNITS = ["Legal","Finance","Operations","Technology","Risk","Compliance","HR","Sales","Marketing","Product"];
const ACCURACY_REQ = ["<80%","80–90%","90–95%","95–99%",">99%"];
const AUTONOMY = ["None","Assisted","Semi-autonomous","Autonomous","Fully autonomous"];
const FRAMEWORKS = ["NIST AI RMF","ISO/IEC 42001","ISO/IEC 27001","EU AI Act","Internal AI Policy","Model Risk Management","FinOps Controls","OWASP GenAI Top 10"];

// ── Tiny components ───────────────────────────────────────────────────────
const Badge = ({ label, color = C.blue, bg = C.blueSoft }) => (
  <span style={s.badge(color, bg)}>{label}</span>
);

const TierBadge = ({ tier }) => {
  const labels = { 1: "Tier 1 · Low Cost", 2: "Tier 2 · General", 3: "Tier 3 · Reasoning", 4: "Tier 4 · Agentic" };
  return <span style={s.tierBadge(tier)}>{labels[tier]}</span>;
};

const RiskBadge = ({ risk }) => {
  const map = { Low: [C.green, C.greenSoft], Medium: [C.amber, C.amberSoft], High: [C.red, C.redSoft], Critical: [C.red, "#5A0010"] };
  const [c, bg] = map[risk] || [C.textMuted, C.surfaceHigh];
  return <Badge label={risk} color={c} bg={bg} />;
};

const Metric = ({ label, value, sub, accent = C.blue }) => (
  <div style={s.card({ textAlign: "center" })}>
    <div style={{ fontSize: 28, fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ title, sub, action }) => (
  <div style={{ ...s.row(0), justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
    <div>
      <h2 style={s.h1}>{title}</h2>
      {sub && <p style={{ ...s.p, marginTop: 4 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label style={s.label}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input style={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
);

const Select = ({ value, onChange, options }) => (
  <select style={s.select} value={value} onChange={e => onChange(e.target.value)}>
    <option value="">— Select —</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const ProgressBar = ({ value, max = 100, color = C.blue }) => (
  <div style={{ background: C.surfaceHigh, borderRadius: 4, height: 6, overflow: "hidden" }}>
    <div style={{ width: `${(value / max) * 100}%`, background: color, height: "100%", borderRadius: 4, transition: "width .4s" }} />
  </div>
);

// ── AI Assistant Panel ────────────────────────────────────────────────────
function AIAssistant({ context, onInsight }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I'm your AI Routing Policy advisor. Ask me to evaluate routing rules, assess risk, estimate costs, or recommend model tiers for your workloads." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are an expert enterprise AI Governance and Model Routing Policy advisor. You help organisations design AI model routing policies, classify workload risk, select appropriate model tiers, and ensure governance compliance. Context about the current session: ${JSON.stringify(context).slice(0, 800)}. Be concise, practical, and reference specific tiers, risk levels, and governance frameworks where relevant. Format responses with clear structure.`,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: q }
          ]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Unable to respond.";
      setMessages(m => [...m, { role: "assistant", text }]);
      if (onInsight) onInsight(text);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ ...s.card(), display: "flex", flexDirection: "column", height: 480 }}>
      <div style={{ ...s.row(8), marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>AI Policy Advisor</span>
        <Badge label="Claude" color={C.purple} bg={C.purpleSoft} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", ...s.col(12) }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "88%",
            background: m.role === "user" ? C.blueSoft : C.surfaceHigh,
            border: `1px solid ${m.role === "user" ? C.borderAccent : C.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.6,
            color: C.text,
            whiteSpace: "pre-wrap",
          }}>{m.text}</div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.textMuted }}>
            Analysing…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ ...s.row(8), marginTop: 12 }}>
        <input
          style={{ ...s.input, flex: 1 }}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="Ask about routing rules, risk, cost optimisation…"
        />
        <button style={s.btn()} onClick={ask} disabled={loading}>Ask</button>
      </div>
    </div>
  );
}

// ── Step wizard helper ────────────────────────────────────────────────────
const STEPS = [
  "Approved Models","Task Classification","Data & Risk","Model Tiers","Routing Rules",
  "Cost Simulator","Evaluation Gates","Escalation","Governance","Change Control",
  "Agentic Controls","Budget Guardrails","Exceptions","Policy Document","Monitoring"
];

// ── Step 1: Approved Models ───────────────────────────────────────────────
function StepApprovedModels({ data, setData }) {
  const [form, setForm] = useState({
    provider: "", name: "", version: "", type: "", hosting: "", region: "",
    inputCost: "", outputCost: "", contextWindow: "", latency: "",
    reasoning: "", multimodal: false, toolUse: false, structuredOutput: false,
    dataResidency: "", securityClass: "", approvalStatus: "Pending", approvalExpiry: ""
  });
  const [showForm, setShowForm] = useState(false);

  const add = () => {
    if (!form.provider || !form.name) return;
    setData(d => ({ ...d, models: [...(d.models || []), { ...form, id: Date.now() }] }));
    setForm({ provider: "", name: "", version: "", type: "", hosting: "", region: "", inputCost: "", outputCost: "", contextWindow: "", latency: "", reasoning: "", multimodal: false, toolUse: false, structuredOutput: false, dataResidency: "", securityClass: "", approvalStatus: "Pending", approvalExpiry: "" });
    setShowForm(false);
  };

  const models = data.models || [];

  return (
    <div style={s.col(20)}>
      <SectionHeader
        title="Approved Model Registry"
        sub="Register AI models that are approved for enterprise use. Approval here does not determine routing — it determines eligibility."
        action={<button style={s.btn()} onClick={() => setShowForm(!showForm)}>+ Register Model</button>}
      />

      <div style={{ ...s.card({ background: C.blueSoft, border: `1px solid ${C.borderAccent}` }) }}>
        <p style={{ ...s.p, color: C.cyan, fontWeight: 600 }}>
          Approved models tell the organisation what it is <em>allowed</em> to use.<br />
          Model routing tells the organisation what <em>should run where, when and why</em>.
        </p>
      </div>

      {showForm && (
        <div style={s.card()}>
          <h3 style={s.h3}>Register New Model</h3>
          <div style={s.grid(3, 16)}>
            <FormField label="Provider"><Select value={form.provider} onChange={v => setForm(f => ({ ...f, provider: v }))} options={PROVIDERS} /></FormField>
            <FormField label="Model Name"><Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. GPT-4o" /></FormField>
            <FormField label="Version"><Input value={form.version} onChange={v => setForm(f => ({ ...f, version: v }))} placeholder="e.g. 2024-11" /></FormField>
            <FormField label="Model Type"><Select value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={MODEL_TYPES} /></FormField>
            <FormField label="Hosting Model"><Select value={form.hosting} onChange={v => setForm(f => ({ ...f, hosting: v }))} options={HOSTING} /></FormField>
            <FormField label="Region"><Select value={form.region} onChange={v => setForm(f => ({ ...f, region: v }))} options={REGIONS} /></FormField>
            <FormField label="Input Token Cost (£/1M)"><Input value={form.inputCost} onChange={v => setForm(f => ({ ...f, inputCost: v }))} type="number" placeholder="e.g. 0.50" /></FormField>
            <FormField label="Output Token Cost (£/1M)"><Input value={form.outputCost} onChange={v => setForm(f => ({ ...f, outputCost: v }))} type="number" placeholder="e.g. 1.50" /></FormField>
            <FormField label="Context Window (tokens)"><Input value={form.contextWindow} onChange={v => setForm(f => ({ ...f, contextWindow: v }))} placeholder="e.g. 128000" /></FormField>
            <FormField label="Latency Class"><Select value={form.latency} onChange={v => setForm(f => ({ ...f, latency: v }))} options={LATENCY} /></FormField>
            <FormField label="Reasoning Capability"><Select value={form.reasoning} onChange={v => setForm(f => ({ ...f, reasoning: v }))} options={["Basic","Standard","Advanced","Expert"]} /></FormField>
            <FormField label="Security Classification"><Select value={form.securityClass} onChange={v => setForm(f => ({ ...f, securityClass: v }))} options={["Public","Restricted","Confidential","Secret"]} /></FormField>
            <FormField label="Data Residency"><Select value={form.dataResidency} onChange={v => setForm(f => ({ ...f, dataResidency: v }))} options={REGIONS} /></FormField>
            <FormField label="Approval Status"><Select value={form.approvalStatus} onChange={v => setForm(f => ({ ...f, approvalStatus: v }))} options={["Pending","Approved","Conditional","Suspended","Retired"]} /></FormField>
            <FormField label="Approval Expiry"><Input value={form.approvalExpiry} onChange={v => setForm(f => ({ ...f, approvalExpiry: v }))} type="date" /></FormField>
          </div>
          <div style={{ ...s.row(8), marginTop: 8 }}>
            {["Multimodal Support","Tool-Use Support","Structured Output"].map((cap, i) => {
              const key = ["multimodal","toolUse","structuredOutput"][i];
              return (
                <label key={cap} style={{ ...s.row(6), cursor: "pointer", fontSize: 13, color: C.textMuted }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                  {cap}
                </label>
              );
            })}
          </div>
          <div style={{ ...s.row(8), marginTop: 16 }}>
            <button style={s.btn()} onClick={add}>Add Model</button>
            <button style={s.btn("ghost")} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {models.length === 0 ? (
        <div style={{ ...s.card(), textAlign: "center", padding: 40, color: C.textMuted }}>
          No models registered yet. Click "Register Model" to begin.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Provider","Model","Version","Type","Hosting","Region","Input £/1M","Output £/1M","Context","Latency","Reasoning","Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                  <td style={{ padding: "10px 12px" }}>{m.provider}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{m.version}</td>
                  <td style={{ padding: "10px 12px" }}><Badge label={m.type || "—"} color={C.purple} bg={C.purpleSoft} /></td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{m.hosting}</td>
                  <td style={{ padding: "10px 12px" }}>{m.region}</td>
                  <td style={{ padding: "10px 12px" }}>£{m.inputCost || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>£{m.outputCost || "—"}</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{m.contextWindow ? Number(m.contextWindow).toLocaleString() : "—"}</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{m.latency}</td>
                  <td style={{ padding: "10px 12px" }}>{m.reasoning}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge
                      label={m.approvalStatus}
                      color={m.approvalStatus === "Approved" ? C.green : m.approvalStatus === "Suspended" ? C.red : C.amber}
                      bg={m.approvalStatus === "Approved" ? C.greenSoft : m.approvalStatus === "Suspended" ? C.redSoft : C.amberSoft}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Task Classification ───────────────────────────────────────────
function StepTaskClassification({ data, setData }) {
  const [form, setForm] = useState({
    name: "", businessUnit: "", businessProcess: "", criticality: "Medium",
    volume: "Medium", avgInputTokens: "", avgOutputTokens: "", requestsPerDay: "",
    latency: "Moderate (<2s)", accuracy: "90–95%", reasoning: "Standard",
    contextSize: "", structuredOutput: false, toolUse: false, multimodal: false,
    autonomy: "None", humanReview: "No"
  });
  const [showForm, setShowForm] = useState(false);
  const tasks = data.tasks || [];

  const add = () => {
    if (!form.name) return;
    setData(d => ({ ...d, tasks: [...(d.tasks || []), { ...form, id: Date.now() }] }));
    setForm({ name: "", businessUnit: "", businessProcess: "", criticality: "Medium", volume: "Medium", avgInputTokens: "", avgOutputTokens: "", requestsPerDay: "", latency: "Moderate (<2s)", accuracy: "90–95%", reasoning: "Standard", contextSize: "", structuredOutput: false, toolUse: false, multimodal: false, autonomy: "None", humanReview: "No" });
    setShowForm(false);
  };

  return (
    <div style={s.col(20)}>
      <SectionHeader
        title="AI Workload Classification"
        sub="Define the types of AI tasks your organisation runs. Each task class drives routing decisions."
        action={<button style={s.btn()} onClick={() => setShowForm(!showForm)}>+ Add Task Class</button>}
      />

      <div style={s.grid(3, 12)}>
        {TASK_EXAMPLES.slice(0, 6).map(t => (
          <button key={t} style={{ ...s.card(), cursor: "pointer", textAlign: "left", border: `1px solid ${C.border}` }}
            onClick={() => { setForm(f => ({ ...f, name: t })); setShowForm(true); }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Click to configure</div>
          </button>
        ))}
      </div>

      {showForm && (
        <div style={s.card()}>
          <h3 style={s.h3}>Configure Task Class</h3>
          <div style={s.grid(3, 16)}>
            <FormField label="Task Name">
              <Select value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} options={TASK_EXAMPLES} />
            </FormField>
            <FormField label="Business Unit"><Select value={form.businessUnit} onChange={v => setForm(f => ({ ...f, businessUnit: v }))} options={BUS_UNITS} /></FormField>
            <FormField label="Business Criticality"><Select value={form.criticality} onChange={v => setForm(f => ({ ...f, criticality: v }))} options={["Low","Medium","High","Critical"]} /></FormField>
            <FormField label="Volume"><Select value={form.volume} onChange={v => setForm(f => ({ ...f, volume: v }))} options={["Low","Medium","High","Very High"]} /></FormField>
            <FormField label="Avg Input Tokens"><Input value={form.avgInputTokens} onChange={v => setForm(f => ({ ...f, avgInputTokens: v }))} placeholder="e.g. 2000" /></FormField>
            <FormField label="Avg Output Tokens"><Input value={form.avgOutputTokens} onChange={v => setForm(f => ({ ...f, avgOutputTokens: v }))} placeholder="e.g. 500" /></FormField>
            <FormField label="Requests Per Day"><Input value={form.requestsPerDay} onChange={v => setForm(f => ({ ...f, requestsPerDay: v }))} placeholder="e.g. 5000" /></FormField>
            <FormField label="Latency Requirement"><Select value={form.latency} onChange={v => setForm(f => ({ ...f, latency: v }))} options={LATENCY} /></FormField>
            <FormField label="Accuracy Requirement"><Select value={form.accuracy} onChange={v => setForm(f => ({ ...f, accuracy: v }))} options={ACCURACY_REQ} /></FormField>
            <FormField label="Reasoning Requirement"><Select value={form.reasoning} onChange={v => setForm(f => ({ ...f, reasoning: v }))} options={["Basic","Standard","Advanced","Expert"]} /></FormField>
            <FormField label="Autonomy Level"><Select value={form.autonomy} onChange={v => setForm(f => ({ ...f, autonomy: v }))} options={AUTONOMY} /></FormField>
            <FormField label="Human Review Required"><Select value={form.humanReview} onChange={v => setForm(f => ({ ...f, humanReview: v }))} options={["No","Conditional","Yes","Mandatory"]} /></FormField>
          </div>
          <div style={{ ...s.row(8), marginTop: 12 }}>
            <button style={s.btn()} onClick={add}>Add Task</button>
            <button style={s.btn("ghost")} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Task","Business Unit","Criticality","Volume","Req/Day","Latency","Accuracy","Autonomy","Human Review"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: "10px 12px" }}>{t.businessUnit}</td>
                  <td style={{ padding: "10px 12px" }}><RiskBadge risk={t.criticality} /></td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{t.volume}</td>
                  <td style={{ padding: "10px 12px" }}>{t.requestsPerDay || "—"}</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{t.latency}</td>
                  <td style={{ padding: "10px 12px" }}>{t.accuracy}</td>
                  <td style={{ padding: "10px 12px" }}>{t.autonomy}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge
                      label={t.humanReview}
                      color={t.humanReview === "Mandatory" ? C.red : t.humanReview === "Yes" ? C.amber : C.textMuted}
                      bg={t.humanReview === "Mandatory" ? C.redSoft : t.humanReview === "Yes" ? C.amberSoft : C.surfaceHigh}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Data & Risk ───────────────────────────────────────────────────
function StepDataRisk({ data, setData }) {
  const [selected, setSelected] = useState(null);
  const [riskMap, setRiskMap] = useState(data.riskMap || {});
  const tasks = data.tasks || [];

  const update = (taskId, field, value) => {
    const next = { ...riskMap, [taskId]: { ...(riskMap[taskId] || {}), [field]: value } };
    setRiskMap(next);
    setData(d => ({ ...d, riskMap: next }));
  };

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Data & Risk Classification" sub="Classify the data types and risk profile for each task. This drives routing tier assignment." />

      {tasks.length === 0 && (
        <div style={{ ...s.card(), textAlign: "center", padding: 40, color: C.textMuted }}>
          Add task classes in Step 2 first.
        </div>
      )}

      <div style={s.grid(2, 16)}>
        {tasks.map(t => {
          const r = riskMap[t.id] || {};
          const isSelected = selected === t.id;
          return (
            <div key={t.id} style={{ ...s.card(), border: isSelected ? `1px solid ${C.borderAccent}` : `1px solid ${C.border}`, cursor: "pointer" }}
              onClick={() => setSelected(isSelected ? null : t.id)}>
              <div style={s.row(8)}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                {r.riskRating && <RiskBadge risk={r.riskRating} />}
              </div>
              {isSelected && (
                <div style={{ marginTop: 16 }} onClick={e => e.stopPropagation()}>
                  <div style={s.divider} />
                  <p style={{ ...s.p, fontWeight: 600, marginBottom: 8 }}>Data Types Involved</p>
                  <div style={s.grid(3, 8)}>
                    {DATA_CLASSES.map(dc => (
                      <label key={dc} style={{ ...s.row(6), cursor: "pointer", fontSize: 12 }}>
                        <input type="checkbox"
                          checked={(r.dataClasses || []).includes(dc)}
                          onChange={e => {
                            const cur = r.dataClasses || [];
                            update(t.id, "dataClasses", e.target.checked ? [...cur, dc] : cur.filter(c => c !== dc));
                          }} />
                        {dc}
                      </label>
                    ))}
                  </div>
                  <div style={s.divider} />
                  <div style={s.grid(3, 12)}>
                    {["Business Impact","Security Impact","Privacy Impact","Regulatory Impact","Customer Impact","Financial Impact"].map(imp => (
                      <FormField key={imp} label={imp}>
                        <Select value={r[imp] || ""} onChange={v => update(t.id, imp, v)} options={IMPACTS} />
                      </FormField>
                    ))}
                  </div>
                  <div style={s.divider} />
                  <FormField label="Overall Risk Rating">
                    <div style={s.row(8)}>
                      {RISK_RATINGS.map(rr => (
                        <button key={rr} style={{
                          ...s.btn(r.riskRating === rr ? "primary" : "ghost"),
                          background: r.riskRating === rr ? (rr === "Low" ? C.green : rr === "Medium" ? C.amber : C.red) : C.surfaceHigh,
                        }} onClick={() => update(t.id, "riskRating", rr)}>{rr}</button>
                      ))}
                    </div>
                  </FormField>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Model Tiers ───────────────────────────────────────────────────
const DEFAULT_TIERS = [
  { id: 1, name: "Tier 1 · Low Cost / High Volume", color: C.tier1, suitable: ["Classification","Tagging","Sentiment","Simple extraction","Formatting","Basic summarisation"], chars: ["Low cost","Low latency","High throughput","Limited reasoning"] },
  { id: 2, name: "Tier 2 · General Purpose", color: C.tier2, suitable: ["Enterprise search","RAG","Summarisation","Content generation","Customer support","Knowledge assistants"], chars: ["Moderate cost","Moderate reasoning","General enterprise workloads"] },
  { id: 3, name: "Tier 3 · Advanced Reasoning", color: C.tier3, suitable: ["Complex analysis","Multi-document reasoning","Planning","Technical investigation","Code reasoning","Financial reasoning"], chars: ["Higher cost","Higher reasoning capability","Use only when justified"] },
  { id: 4, name: "Tier 4 · Specialist / Agentic", color: C.tier4, suitable: ["Autonomous workflows","Multi-agent orchestration","Tool execution","Complex planning","High-impact workflows"], chars: ["Stricter controls","Runtime monitoring","Human approval where required","Tool-level permissions"] },
];

function StepModelTiers({ data, setData }) {
  const tiers = data.tiers || DEFAULT_TIERS;
  const models = data.models || [];

  const assignModel = (tierId, modelId) => {
    setData(d => {
      const t = (d.tiers || DEFAULT_TIERS).map(t => t.id === tierId ? { ...t, assignedModel: modelId } : t);
      return { ...d, tiers: t };
    });
  };

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Model Tier Configuration" sub="Define cost and capability tiers. Assign approved models to each tier. Routing rules reference tiers, not individual models." />

      <div style={{ ...s.card({ background: "#0A1A0A", border: `1px solid ${C.green}33` }) }}>
        <p style={{ ...s.p, color: C.green }}>
          The most capable model should not automatically become the default model.<br />
          Route every workload to the lowest-cost model that meets its quality, security, risk and business requirements.
        </p>
      </div>

      <div style={s.grid(2, 16)}>
        {tiers.map(tier => (
          <div key={tier.id} style={{ ...s.card(), borderLeft: `3px solid ${tier.color}` }}>
            <div style={s.row(8)}>
              <TierBadge tier={tier.id} />
            </div>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>Suitable for</p>
              <div style={s.row(6)}>
                {tier.suitable.slice(0, 4).map(s2 => (
                  <Badge key={s2} label={s2} color={tier.color} bg={tier.color + "22"} />
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>Characteristics</p>
              {tier.chars.map(c => <div key={c} style={{ fontSize: 12, color: C.textMuted, marginBottom: 2 }}>· {c}</div>)}
            </div>
            {models.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <FormField label="Assigned Primary Model">
                  <Select
                    value={tier.assignedModel || ""}
                    onChange={v => assignModel(tier.id, v)}
                    options={models.map(m => `${m.name} (${m.provider})`)}
                  />
                </FormField>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 5: Routing Rules ─────────────────────────────────────────────────
function StepRoutingRules({ data, setData }) {
  const [form, setForm] = useState({ task: "", risk: "", maxTokens: "", specialCategory: false, tier: "", reason: "", doNotRoute: "" });
  const rules = data.rules || [];
  const tasks = data.tasks || [];

  const add = () => {
    if (!form.task || !form.tier) return;
    setData(d => ({ ...d, rules: [...(d.rules || []), { ...form, id: Date.now() }] }));
    setForm({ task: "", risk: "", maxTokens: "", specialCategory: false, tier: "", reason: "", doNotRoute: "" });
  };

  const tierColors = { 1: C.tier1, 2: C.tier2, 3: C.tier3, 4: C.tier4 };

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Routing Policy Builder" sub="Build IF/THEN routing rules. Define conditions that determine which model tier handles each workload." />

      <div style={s.card()}>
        <h3 style={s.h3}>New Routing Rule</h3>
        <div style={{ ...s.card({ background: C.surfaceHigh }), marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.cyan, fontWeight: 600, marginBottom: 8 }}>IF</div>
          <div style={s.grid(3, 12)}>
            <FormField label="Task Type">
              <Select value={form.task} onChange={v => setForm(f => ({ ...f, task: v }))}
                options={tasks.length > 0 ? tasks.map(t => t.name) : TASK_EXAMPLES} />
            </FormField>
            <FormField label="Risk Rating">
              <Select value={form.risk} onChange={v => setForm(f => ({ ...f, risk: v }))} options={RISK_RATINGS} />
            </FormField>
            <FormField label="Max Input Tokens">
              <Input value={form.maxTokens} onChange={v => setForm(f => ({ ...f, maxTokens: v }))} placeholder="e.g. 10000" />
            </FormField>
          </div>
          <label style={{ ...s.row(6), marginTop: 8, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={form.specialCategory} onChange={e => setForm(f => ({ ...f, specialCategory: e.target.checked }))} />
            Contains Special Category Data
          </label>
        </div>
        <div style={{ ...s.card({ background: "#0A1A2A" }), marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 8 }}>THEN</div>
          <div style={s.grid(2, 12)}>
            <FormField label="Route to Tier">
              <Select value={form.tier} onChange={v => setForm(f => ({ ...f, tier: v }))} options={["1","2","3","4"]} />
            </FormField>
            <FormField label="Do Not Route To">
              <Select value={form.doNotRoute} onChange={v => setForm(f => ({ ...f, doNotRoute: v }))} options={["","Tier 3","Tier 4","Any premium tier"]} />
            </FormField>
          </div>
          <FormField label="Routing Reason">
            <Input value={form.reason} onChange={v => setForm(f => ({ ...f, reason: v }))} placeholder="Explain why this routing decision is correct" />
          </FormField>
        </div>
        <button style={s.btn()} onClick={add}>Add Routing Rule</button>
      </div>

      {rules.length > 0 && (
        <div style={s.col(12)}>
          {rules.map(r => (
            <div key={r.id} style={{ ...s.card(), borderLeft: `3px solid ${tierColors[r.tier] || C.blue}` }}>
              <div style={s.grid(3, 16)}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>IF TASK =</div>
                  <Badge label={r.task} color={C.cyan} bg={C.cyanSoft} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>AND RISK =</div>
                  {r.risk ? <RiskBadge risk={r.risk} /> : <span style={{ color: C.textMuted, fontSize: 12 }}>Any</span>}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>THEN ROUTE TO</div>
                  <TierBadge tier={parseInt(r.tier)} />
                </div>
              </div>
              {r.reason && <p style={{ ...s.p, marginTop: 8, fontSize: 12, color: C.textMuted }}>Reason: {r.reason}</p>}
              {r.doNotRoute && <p style={{ ...s.p, marginTop: 4, fontSize: 12, color: C.red }}>Do not route to: {r.doNotRoute}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 6: Cost Simulator ────────────────────────────────────────────────
function StepCostSimulator({ data }) {
  const tasks = data.tasks || [];
  const models = data.models || [];
  const rules = data.rules || [];

  const calcCost = (inputM, outputM, inputCost, outputCost) => {
    return (inputM * (parseFloat(inputCost) || 0) + outputM * (parseFloat(outputCost) || 0));
  };

  const rows = tasks.map(t => {
    const req = parseFloat(t.requestsPerDay) || 0;
    const avgIn = parseFloat(t.avgInputTokens) || 2000;
    const avgOut = parseFloat(t.avgOutputTokens) || 500;
    const monthlyIn = req * avgIn * 30;
    const monthlyOut = req * avgOut * 30;
    const monthlyInM = monthlyIn / 1e6;
    const monthlyOutM = monthlyOut / 1e6;

    const rule = rules.find(r => r.task === t.name);
    const assignedTierNum = rule ? parseInt(rule.tier) : null;
    const tiers = data.tiers || DEFAULT_TIERS;
    const tier = tiers.find(ti => ti.id === assignedTierNum);
    const assignedModelName = tier?.assignedModel || "";
    const assignedModel = models.find(m => assignedModelName.startsWith(m.name));

    const premModel = models.sort((a, b) => (parseFloat(b.outputCost) || 0) - (parseFloat(a.outputCost) || 0))[0];

    const optimisedCost = calcCost(monthlyInM, monthlyOutM, assignedModel?.inputCost || 0.5, assignedModel?.outputCost || 1.5);
    const premiumCost = calcCost(monthlyInM, monthlyOutM, premModel?.inputCost || 5, premModel?.outputCost || 15);
    const saving = premiumCost - optimisedCost;

    return { ...t, monthlyInM, monthlyOutM, optimisedCost, premiumCost, saving, assignedTierNum };
  });

  const totalOptimised = rows.reduce((s, r) => s + r.optimisedCost, 0);
  const totalPremium = rows.reduce((s, r) => s + r.premiumCost, 0);
  const totalSaving = totalPremium - totalOptimised;

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Cost Routing Simulator" sub="Compare current spend against an optimised routing policy. Uses configured model pricing." />

      <div style={s.grid(4, 16)}>
        <Metric label="Current (All Premium)" value={`£${totalPremium.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`} sub="Monthly estimate" accent={C.red} />
        <Metric label="Optimised Routing" value={`£${totalOptimised.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`} sub="Monthly estimate" accent={C.green} />
        <Metric label="Monthly Saving" value={`£${totalSaving.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`} sub="Avoided spend" accent={C.cyan} />
        <Metric label="Annual Saving" value={`£${(totalSaving * 12).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`} sub="Projected" accent={C.amber} />
      </div>

      {tasks.length === 0 ? (
        <div style={{ ...s.card(), textAlign: "center", padding: 40, color: C.textMuted }}>
          Add tasks with request volumes and configure routing rules to see cost projections.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Task","Req/Day","Monthly Tokens (In)","Monthly Tokens (Out)","Routed Tier","Optimised Cost","Premium Cost","Monthly Saving"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: "10px 12px" }}>{Number(r.requestsPerDay || 0).toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{(r.monthlyInM * 1e6 / 1e6).toFixed(1)}M</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{(r.monthlyOutM * 1e6 / 1e6).toFixed(1)}M</td>
                  <td style={{ padding: "10px 12px" }}>{r.assignedTierNum ? <TierBadge tier={r.assignedTierNum} /> : <span style={{ color: C.textMuted }}>Unrouted</span>}</td>
                  <td style={{ padding: "10px 12px", color: C.green }}>£{r.optimisedCost.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", color: C.red }}>£{r.premiumCost.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", color: r.saving > 0 ? C.cyan : C.textMuted, fontWeight: 600 }}>£{r.saving.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={s.grid(2, 16)}>
        <div style={s.card()}>
          <h3 style={s.h3}>Model Overuse Detector</h3>
          {rows.filter(r => !r.assignedTierNum || r.assignedTierNum > 2).map(r => (
            <div key={r.id} style={{ ...s.card({ background: C.amberSoft, border: `1px solid ${C.amber}33` }), marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>⚠ Potential Overuse: {r.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                Task may qualify for a lower-cost tier. Estimated saving: £{(r.saving * 0.6).toFixed(2)}/mo if moved to Tier 1.
              </div>
            </div>
          ))}
          {rows.every(r => r.assignedTierNum && r.assignedTierNum <= 2) && (
            <p style={s.p}>No overuse detected. Routing appears optimised.</p>
          )}
        </div>
        <div style={s.card()}>
          <h3 style={s.h3}>Underpower Detector</h3>
          <p style={{ ...s.p, marginBottom: 12 }}>Monitor for tasks where cheaper models cause quality failures, increasing total cost per successful outcome.</p>
          {(data.tasks || []).filter(t => t.accuracy === ">99%" && (!rules.find(r => r.task === t.name)?.tier || parseInt(rules.find(r => r.task === t.name)?.tier) <= 1)).map(t => (
            <div key={t.id} style={{ ...s.card({ background: C.redSoft, border: `1px solid ${C.red}33` }), marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.red }}>⚠ Potential Underpower: {t.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                Requires &gt;99% accuracy. Current tier may be insufficient. Consider Tier 2 or Tier 3.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 7: Governance ────────────────────────────────────────────────────
function StepGovernance({ data, setData }) {
  const [gov, setGov] = useState(data.governance || {
    policyOwner: "", technicalOwner: "", businessOwner: "", riskOwner: "", securityOwner: "",
    createRules: "", approveRules: "", approveExceptions: "", reviewCost: "", approveModels: "",
    selectedFrameworks: []
  });

  const update = (field, value) => {
    const next = { ...gov, [field]: value };
    setGov(next);
    setData(d => ({ ...d, governance: next }));
  };

  const toggleFramework = (fw) => {
    const cur = gov.selectedFrameworks || [];
    const next = cur.includes(fw) ? cur.filter(f => f !== fw) : [...cur, fw];
    update("selectedFrameworks", next);
  };

  const RACI_MATRIX = [
    ["Define Model Tiers", "R", "A", "C", "I", "C", "I", "I", "C", "I"],
    ["Approve New Models", "C", "A", "C", "R", "R", "C", "I", "I", "I"],
    ["Create Routing Rules", "R", "A", "C", "C", "C", "I", "I", "C", "I"],
    ["Approve Routing Changes", "C", "A", "I", "R", "C", "C", "I", "C", "I"],
    ["Review Cost & Spend", "I", "I", "I", "I", "I", "A", "R", "C", "I"],
    ["Monitor Model Risk", "C", "C", "I", "R", "A", "C", "I", "C", "R"],
    ["Approve Exceptions", "C", "A", "C", "R", "C", "C", "I", "R", "C"],
    ["Retire Models", "R", "A", "C", "C", "C", "I", "I", "I", "I"],
  ];
  const ROLES = ["AI Architecture","AI Governance","Engineering","Security","Data Protection","Legal","FinOps","Business Owner","Model Risk Mgmt"];
  const RACI_COLORS = { R: [C.blue, C.blueSoft], A: [C.amber, C.amberSoft], C: [C.green, C.greenSoft], I: [C.textMuted, C.surfaceHigh] };

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Governance & Ownership" sub="Define ownership, roles, and framework alignment for the model routing policy." />

      <div style={s.grid(2, 16)}>
        <div style={s.card()}>
          <h3 style={s.h3}>Policy Ownership</h3>
          <div style={s.col(12)}>
            {[["Policy Owner","policyOwner"],["Technical Owner","technicalOwner"],["Business Owner","businessOwner"],["Risk Owner","riskOwner"],["Security Owner","securityOwner"],["AI Governance Owner","govOwner"]].map(([label, key]) => (
              <FormField key={key} label={label}>
                <Input value={gov[key] || ""} onChange={v => update(key, v)} placeholder={`Name or team`} />
              </FormField>
            ))}
          </div>
        </div>
        <div style={s.card()}>
          <h3 style={s.h3}>Governance Framework Alignment</h3>
          <p style={{ ...s.p, marginBottom: 12 }}>Select frameworks this policy should align to. This does not assert automatic compliance.</p>
          <div style={s.col(8)}>
            {FRAMEWORKS.map(fw => (
              <label key={fw} style={{ ...s.row(8), cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox"
                  checked={(gov.selectedFrameworks || []).includes(fw)}
                  onChange={() => toggleFramework(fw)} />
                {fw}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={s.card()}>
        <h3 style={s.h3}>RACI Matrix — Model Routing Governance</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted }}>Activity</th>
                {ROLES.map(r => <th key={r} style={{ textAlign: "center", padding: "8px 8px", color: C.textMuted, fontSize: 11 }}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {RACI_MATRIX.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>{row[0]}</td>
                  {row.slice(1).map((cell, j) => {
                    const [color, bg] = RACI_COLORS[cell] || [C.textMuted, C.surfaceHigh];
                    return (
                      <td key={j} style={{ textAlign: "center", padding: "10px 8px" }}>
                        <span style={{ ...s.badge(color, bg), fontWeight: 700 }}>{cell}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...s.row(16), marginTop: 12 }}>
          {Object.entries(RACI_COLORS).map(([k, [c, bg]]) => (
            <span key={k} style={s.row(4)}>
              <span style={s.badge(c, bg)}>{k}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>
                {k === "R" ? "Responsible" : k === "A" ? "Accountable" : k === "C" ? "Consulted" : "Informed"}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 8: Evaluation Gates ──────────────────────────────────────────────
function StepEvaluationGates({ data, setData }) {
  const [thresholds, setThresholds] = useState(data.evalThresholds || {
    accuracy: 95, groundedness: 95, latencyP95: 2000, schemaCompliance: 99, hallucination: 5, safetyScore: 99, humanAcceptance: 90
  });

  const update = (k, v) => {
    const next = { ...thresholds, [k]: parseFloat(v) };
    setThresholds(next);
    setData(d => ({ ...d, evalThresholds: next }));
  };

  const metrics = [
    { key: "accuracy", label: "Accuracy", unit: "%", min: 0, max: 100, color: C.green, desc: "Minimum task accuracy for routing eligibility" },
    { key: "groundedness", label: "Groundedness", unit: "%", min: 0, max: 100, color: C.blue, desc: "Minimum factual grounding score" },
    { key: "hallucination", label: "Max Hallucination Rate", unit: "%", min: 0, max: 100, color: C.red, desc: "Maximum acceptable hallucination rate" },
    { key: "safetyScore", label: "Safety Score", unit: "%", min: 0, max: 100, color: C.amber, desc: "Minimum safety evaluation score" },
    { key: "schemaCompliance", label: "Schema Compliance", unit: "%", min: 0, max: 100, color: C.purple, desc: "Structured output compliance for API tasks" },
    { key: "humanAcceptance", label: "Human Acceptance Rate", unit: "%", min: 0, max: 100, color: C.cyan, desc: "Rate of reviewer acceptance during evaluation" },
    { key: "latencyP95", label: "P95 Latency", unit: "ms", min: 100, max: 30000, color: C.amber, desc: "Maximum acceptable P95 latency in milliseconds" },
  ];

  const GOV_METHODS = [
    "AI Use-Case Inventory","AI Risk Classification","AI Impact Assessment","Model Cards & System Cards","AI Factsheets",
    "Risk & Control Register","Responsible AI Scorecard","Human-in-the-Loop Approval","Segregation of Duties",
    "Model & Prompt Version Control","Dataset & Knowledge-Base Versioning","Model Registry","Audit Trails & Traceability",
    "Policy-as-Code","Evaluation Gates in CI/CD","Security Testing & AI Red Teaming","Bias & Fairness Testing",
    "Explainability Assessments","Privacy & PII Controls","RBAC & Managed Identities","Drift & Quality Monitoring",
    "Incident Management","Kill Switch & Rollback","Third-Party Supplier Risk","Periodic Governance Review"
  ];
  const [selectedMethods, setSelectedMethods] = useState(data.govMethods || []);
  const toggleMethod = m => {
    const next = selectedMethods.includes(m) ? selectedMethods.filter(x => x !== m) : [...selectedMethods, m];
    setSelectedMethods(next);
    setData(d => ({ ...d, govMethods: next }));
  };

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Evaluation Gates & Governance Methods" sub="A model should not move into a routing tier based on price alone. Set minimum evaluation thresholds." />

      <div style={s.grid(2, 16)}>
        <div style={s.card()}>
          <h3 style={s.h3}>Evaluation Thresholds</h3>
          <div style={s.col(16)}>
            {metrics.map(m => (
              <div key={m.key}>
                <div style={{ ...s.row(0), justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: m.color, fontWeight: 700 }}>{thresholds[m.key]}{m.unit}</span>
                </div>
                <input type="range" min={m.min} max={m.max} step={m.key === "latencyP95" ? 100 : 1}
                  value={thresholds[m.key]}
                  onChange={e => update(m.key, e.target.value)}
                  style={{ width: "100%", accentColor: m.color }} />
                <div style={{ fontSize: 11, color: C.textMuted }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.card()}>
          <h3 style={s.h3}>AI Governance Methods</h3>
          <p style={{ ...s.p, marginBottom: 12 }}>Select governance methods applied in your organisation.</p>
          <div style={{ maxHeight: 400, overflowY: "auto", ...s.col(6) }}>
            {GOV_METHODS.map(m => (
              <label key={m} style={{ ...s.row(8), cursor: "pointer", fontSize: 12, padding: "4px 0" }}>
                <input type="checkbox" checked={selectedMethods.includes(m)} onChange={() => toggleMethod(m)} />
                {m}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Badge label={`${selectedMethods.length} methods selected`} color={C.green} bg={C.greenSoft} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 9: Policy Document ───────────────────────────────────────────────
function StepPolicyDocument({ data }) {
  const [generating, setGenerating] = useState(false);
  const [doc, setDoc] = useState("");

  const generate = async () => {
    setGenerating(true);
    setDoc("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: "You are an enterprise AI Governance expert. Generate a concise, professional Model Routing Policy document based on the provided configuration data. Use clear headings, bullet points where appropriate, and enterprise-grade language. Include: Purpose, Scope, Approved Model Registry summary, Model Tiers, Task Classifications, Routing Matrix, Data Restrictions, Cost Controls, Escalation Policy, Governance roles, and Review Schedule.",
          messages: [{
            role: "user",
            content: `Generate a Model Routing Policy document based on this configuration:\n\nApproved Models: ${JSON.stringify((data.models || []).map(m => ({ name: m.name, provider: m.provider, type: m.type })))}\n\nTask Classes: ${JSON.stringify((data.tasks || []).map(t => ({ name: t.name, businessUnit: t.businessUnit, criticality: t.criticality })))}\n\nRouting Rules: ${JSON.stringify(data.rules || [])}\n\nGovernance: ${JSON.stringify(data.governance || {})}\n\nEvaluation Thresholds: ${JSON.stringify(data.evalThresholds || {})}\n\nSelected Governance Methods: ${JSON.stringify(data.govMethods || [])}`
          }]
        })
      });
      const d = await res.json();
      setDoc(d.content?.map(b => b.text || "").join("") || "Generation failed.");
    } catch {
      setDoc("Error generating policy document.");
    }
    setGenerating(false);
  };

  const ROUTING_MATRIX = [
    { task: "Sentiment Analysis", complexity: "Low", risk: "Low", tier: 1, humanReview: "No", costLimit: "£0.01" },
    { task: "Document Classification", complexity: "Low", risk: "Medium", tier: 1, humanReview: "No", costLimit: "£0.02" },
    { task: "Enterprise RAG", complexity: "Medium", risk: "Medium", tier: 2, humanReview: "Conditional", costLimit: "£0.10" },
    { task: "Contract Analysis", complexity: "High", risk: "High", tier: 3, humanReview: "Yes", costLimit: "£1.00" },
    { task: "Autonomous Procurement Agent", complexity: "High", risk: "Critical", tier: 4, humanReview: "Mandatory", costLimit: "£5.00" },
    ...(data.tasks || []).map(t => {
      const rule = (data.rules || []).find(r => r.task === t.name);
      const riskMap = data.riskMap || {};
      const risk = riskMap[t.id]?.riskRating || t.criticality || "Medium";
      return { task: t.name, complexity: t.criticality || "Medium", risk, tier: rule ? parseInt(rule.tier) : 2, humanReview: t.humanReview || "Conditional", costLimit: "—" };
    })
  ];

  return (
    <div style={s.col(20)}>
      <SectionHeader
        title="Generated Routing Policy"
        sub="Generate a complete enterprise model routing policy document based on your configuration."
        action={<button style={s.btn("success")} onClick={generate} disabled={generating}>{generating ? "Generating…" : "Generate Policy Document"}</button>}
      />

      <div style={s.card()}>
        <h3 style={s.h3}>Routing Matrix</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Task","Complexity","Risk","Default Tier","Human Review","Cost Limit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROUTING_MATRIX.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.task}</td>
                  <td style={{ padding: "10px 12px" }}><RiskBadge risk={r.complexity} /></td>
                  <td style={{ padding: "10px 12px" }}><RiskBadge risk={r.risk} /></td>
                  <td style={{ padding: "10px 12px" }}><TierBadge tier={r.tier} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge
                      label={r.humanReview}
                      color={r.humanReview === "Mandatory" ? C.red : r.humanReview === "Yes" ? C.amber : C.textMuted}
                      bg={r.humanReview === "Mandatory" ? C.redSoft : r.humanReview === "Yes" ? C.amberSoft : C.surfaceHigh}
                    />
                  </td>
                  <td style={{ padding: "10px 12px", color: C.cyan }}>{r.costLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {doc && (
        <div style={s.card()}>
          <div style={{ ...s.row(0), justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={s.h3}>Policy Document</h3>
            <Badge label="AI Generated · Review before publishing" color={C.amber} bg={C.amberSoft} />
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 500, overflowY: "auto" }}>
            {doc}
          </div>
        </div>
      )}

      <div style={s.card()}>
        <h3 style={s.h3}>Executive Summary</h3>
        <div style={s.grid(3, 12)}>
          <Metric label="Approved Models" value={(data.models || []).length} accent={C.blue} />
          <Metric label="Active Tiers" value="4" accent={C.green} />
          <Metric label="Workload Classes" value={(data.tasks || []).length} accent={C.purple} />
          <Metric label="Routing Rules" value={(data.rules || []).length} accent={C.cyan} />
          <Metric label="Premium Model Usage" value="12%" sub="Target: <20%" accent={C.amber} />
          <Metric label="Policy Compliance" value="96%" sub="Routing efficiency" accent={C.green} />
        </div>
        <div style={{ ...s.divider }} />
        <div style={{ padding: "16px 0", borderTop: `1px solid ${C.border}` }}>
          <p style={{ ...s.p, fontStyle: "italic", color: C.textMuted }}>
            Model selection is a procurement decision.<br />
            Model routing is an operating architecture decision.<br />
            This tool connects both.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Step 10: Monitoring ───────────────────────────────────────────────────
function StepMonitoring({ data }) {
  const efficiency = Math.min(100, Math.max(0,
    50 +
    ((data.rules || []).length > 3 ? 15 : 0) +
    ((data.models || []).length > 2 ? 10 : 0) +
    ((data.govMethods || []).length > 5 ? 15 : 0) +
    ((data.governance?.policyOwner) ? 10 : 0)
  ));

  const LOGS = [
    { id: "REQ-001", task: "Sentiment Analysis", model: "GPT-3.5-Turbo", tier: 1, tokens: 2340, cost: "£0.001", latency: "180ms", result: "Pass", ts: "09:41:02" },
    { id: "REQ-002", task: "Contract Analysis", model: "GPT-4o", tier: 3, tokens: 18400, cost: "£0.82", latency: "3.2s", result: "Pass (Human Review)", ts: "09:41:18" },
    { id: "REQ-003", task: "Enterprise RAG", model: "Claude 3.5 Sonnet", tier: 2, tokens: 6200, cost: "£0.09", latency: "1.1s", result: "Pass", ts: "09:41:35" },
    { id: "REQ-004", task: "Document Classification", model: "GPT-3.5-Turbo", tier: 1, tokens: 1800, cost: "£0.001", latency: "142ms", result: "Escalated → Tier 2", ts: "09:41:52" },
    { id: "REQ-005", task: "Code Generation", model: "Claude 3.5 Sonnet", tier: 3, tokens: 12000, cost: "£0.31", latency: "2.8s", result: "Pass", ts: "09:42:10" },
  ];

  return (
    <div style={s.col(20)}>
      <SectionHeader title="Runtime Monitoring & Observability" sub="Every routing decision is logged. Full traceability for governance, audit, and policy review." />

      <div style={s.grid(4, 16)}>
        <Metric label="Routing Efficiency" value={`${efficiency}/100`} sub="Policy score" accent={efficiency > 75 ? C.green : C.amber} />
        <Metric label="Requests Today" value="14,832" sub="Across all tiers" accent={C.blue} />
        <Metric label="Escalations" value="48" sub="Auto-escalated" accent={C.amber} />
        <Metric label="Policy Violations" value="3" sub="Requires review" accent={C.red} />
      </div>

      <div style={s.card()}>
        <h3 style={s.h3}>Routing Efficiency Score</h3>
        <div style={{ ...s.row(16), marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar value={efficiency} color={efficiency > 75 ? C.green : C.amber} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: efficiency > 75 ? C.green : C.amber, minWidth: 60 }}>{efficiency}/100</span>
        </div>
        <div style={s.grid(3, 12)}>
          {[
            ["Routed to lowest suitable tier", efficiency > 60 ? "Good" : "Review needed", efficiency > 60 ? C.green : C.amber],
            ["Routing rules configured", (data.rules || []).length > 0 ? "Yes" : "None", (data.rules || []).length > 0 ? C.green : C.red],
            ["Governance owners set", data.governance?.policyOwner ? "Set" : "Missing", data.governance?.policyOwner ? C.green : C.red],
            ["Evaluation thresholds", data.evalThresholds ? "Configured" : "Default", data.evalThresholds ? C.green : C.amber],
            ["Governance methods", `${(data.govMethods || []).length} selected`, (data.govMethods || []).length > 5 ? C.green : C.amber],
            ["Premium model usage", "12%", C.green],
          ].map(([label, value, color]) => (
            <div key={label} style={{ ...s.card({ background: C.surfaceHigh }), ...s.row(8) }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card()}>
        <h3 style={s.h3}>Routing Decision Log</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Request ID","Task","Model","Tier","Tokens","Cost","Latency","Result","Time"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOGS.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace", color: C.textMuted }}>{l.id}</td>
                  <td style={{ padding: "8px 10px" }}>{l.task}</td>
                  <td style={{ padding: "8px 10px", color: C.textMuted }}>{l.model}</td>
                  <td style={{ padding: "8px 10px" }}><TierBadge tier={l.tier} /></td>
                  <td style={{ padding: "8px 10px" }}>{l.tokens.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px", color: C.green }}>{l.cost}</td>
                  <td style={{ padding: "8px 10px", color: C.textMuted }}>{l.latency}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <Badge
                      label={l.result}
                      color={l.result.includes("Escalat") ? C.amber : l.result.includes("Human") ? C.blue : C.green}
                      bg={l.result.includes("Escalat") ? C.amberSoft : l.result.includes("Human") ? C.blueSoft : C.greenSoft}
                    />
                  </td>
                  <td style={{ padding: "8px 10px", color: C.textDim, fontFamily: "monospace" }}>{l.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── AI Gateway Architecture Diagram ──────────────────────────────────────
function ArchitectureDiagram() {
  const nodes = [
    { label: "User / Application", color: C.text, bg: C.surfaceHigh },
    { label: "API Gateway", color: C.cyan, bg: C.cyanSoft },
    { label: "AI Gateway", color: C.blue, bg: C.blueSoft },
    { label: "Policy Engine", color: C.purple, bg: C.purpleSoft },
    { label: "Task Classifier → Risk Classifier → Data Classification", color: C.amber, bg: C.amberSoft, wide: true },
    { label: "Routing Engine", color: C.blue, bg: C.blueSoft },
    { label: "Cost Guardrail + Security Guardrail", color: C.green, bg: C.greenSoft, wide: true },
    { label: "Approved Model Registry", color: C.text, bg: C.surfaceHigh },
  ];

  const tiers = [
    { label: "Tier 1\nLow-cost model", color: C.tier1 },
    { label: "Tier 2\nGeneral-purpose", color: C.tier2 },
    { label: "Tier 3\nReasoning model", color: C.tier3 },
    { label: "Tier 4\nAgent / Specialist", color: C.tier4 },
  ];

  const post = [
    { label: "Model Response", color: C.text, bg: C.surfaceHigh },
    { label: "Evaluation + Safety Check", color: C.green, bg: C.greenSoft },
    { label: "Grounding + Policy Check", color: C.purple, bg: C.purpleSoft },
    { label: "Human Review (if required)", color: C.amber, bg: C.amberSoft },
    { label: "Application / User", color: C.text, bg: C.surfaceHigh },
  ];

  const boxStyle = (color, bg, wide) => ({
    background: bg,
    border: `1px solid ${color}55`,
    borderRadius: 6,
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 600,
    color,
    textAlign: "center",
    width: wide ? 320 : 200,
    alignSelf: "center",
  });

  const arrow = () => (
    <div style={{ width: 2, height: 16, background: C.border, alignSelf: "center", margin: "0 auto" }} />
  );

  return (
    <div style={{ ...s.card(), overflow: "auto" }}>
      <h3 style={s.h3}>AI Gateway Architecture</h3>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {nodes.map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {i > 0 && arrow()}
            <div style={boxStyle(n.color, n.bg, n.wide)}>{n.label}</div>
          </div>
        ))}
        {arrow()}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          {tiers.map(t => (
            <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 2, height: 16, background: t.color, margin: "0 auto" }} />
              <div style={{ ...boxStyle(t.color, t.color + "22"), width: 130, whiteSpace: "pre-line", fontSize: 11 }}>{t.label}</div>
            </div>
          ))}
        </div>
        <div style={{ width: 2, height: 16, background: C.border, margin: "0 auto" }} />
        {post.map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {i > 0 && arrow()}
            <div style={boxStyle(n.color, n.bg)}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Overview / Dashboard ──────────────────────────────────────────────────
function Overview({ data, setActiveStep, setActiveNav }) {
  const efficiency = Math.min(100, 50 + ((data.rules || []).length > 3 ? 15 : 0) + ((data.models || []).length > 2 ? 10 : 0) + ((data.govMethods || []).length > 5 ? 15 : 0) + (data.governance?.policyOwner ? 10 : 0));

  return (
    <div style={s.col(20)}>
      <div style={{ ...s.card({ background: "#0A0F1A", border: `1px solid ${C.borderAccent}` }), marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>AI Model Routing Policy</div>
        <p style={{ ...s.p, color: C.cyan, fontSize: 14 }}>
          Approved models tell the organisation what it is <strong>allowed to use</strong>.<br />
          Model routing tells the organisation what should <strong>run where, when and why</strong>.
        </p>
        <p style={{ ...s.p, color: C.textMuted, marginTop: 8 }}>
          The most capable model should not automatically become the default model.<br />
          Route every workload to the lowest-cost model that meets its quality, security, risk and business requirements.
        </p>
      </div>

      <div style={s.grid(4, 16)}>
        <Metric label="Approved Models" value={(data.models || []).length} sub="Registered" accent={C.blue} />
        <Metric label="Workload Classes" value={(data.tasks || []).length} sub="Classified" accent={C.green} />
        <Metric label="Routing Rules" value={(data.rules || []).length} sub="Active" accent={C.purple} />
        <Metric label="Routing Efficiency" value={`${efficiency}/100`} sub="Policy score" accent={efficiency > 75 ? C.green : C.amber} />
      </div>

      <div style={s.grid(2, 16)}>
        <div style={s.card()}>
          <h3 style={s.h3}>Configuration Progress</h3>
          <div style={s.col(12)}>
            {[
              ["Approved Models", (data.models || []).length > 0, "Register AI models"],
              ["Task Classification", (data.tasks || []).length > 0, "Define workload types"],
              ["Data & Risk", Object.keys(data.riskMap || {}).length > 0, "Classify data risk"],
              ["Model Tiers", true, "Default tiers configured"],
              ["Routing Rules", (data.rules || []).length > 0, "Build routing logic"],
              ["Governance Owners", !!data.governance?.policyOwner, "Assign ownership"],
              ["Evaluation Thresholds", !!data.evalThresholds, "Set quality gates"],
            ].map(([label, done, hint]) => (
              <div key={label} style={{ ...s.row(12) }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? C.green : C.surfaceHigh, border: `2px solid ${done ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: done ? C.bg : C.textDim }}>{done ? "✓" : ""}</div>
                <div>
                  <div style={{ fontSize: 13, color: done ? C.text : C.textMuted, fontWeight: done ? 600 : 400 }}>{label}</div>
                  {!done && <div style={{ fontSize: 11, color: C.textDim }}>{hint}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <ArchitectureDiagram />
      </div>

      <div style={s.card()}>
        <h3 style={s.h3}>Quick Start</h3>
        <div style={s.grid(3, 12)}>
          {STEPS.slice(0, 6).map((step, i) => (
            <button key={step} style={{ ...s.card({ background: C.surfaceHigh, cursor: "pointer", textAlign: "left", border: `1px solid ${C.border}` }) }}
              onClick={() => setActiveStep(i)}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Step {i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{step}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("routing");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeStep, setActiveStep] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [data, setData] = useState({ models: [], tasks: [], rules: [], riskMap: {}, governance: {}, tiers: DEFAULT_TIERS });

  const NAV_ITEMS = [
    { id: "strategy", label: "AI Strategy", icon: "◈" },
    { id: "usecases", label: "AI Use Cases", icon: "◉" },
    { id: "portfolio", label: "AI Portfolio", icon: "◫" },
    { id: "models", label: "Approved Models", icon: "◈" },
    { id: "routing", label: "Model Routing", icon: "⇄", active: true },
    { id: "architecture", label: "AI Architecture", icon: "⬡" },
    { id: "governance", label: "AI Governance", icon: "⊛" },
    { id: "risk", label: "AI Risk", icon: "⚠" },
    { id: "evaluation", label: "AI Evaluation", icon: "✓" },
    { id: "finops", label: "AI FinOps", icon: "£" },
    { id: "agents", label: "AI Agents", icon: "⟳" },
    { id: "roadmap", label: "Roadmap", icon: "→" },
    { id: "reports", label: "Reports", icon: "⊟" },
  ];

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "models", label: "Models" },
    { id: "tasks", label: "Task Classes" },
    { id: "tiers", label: "Model Tiers" },
    { id: "rules", label: "Routing Rules" },
    { id: "cost", label: "Cost Simulator" },
    { id: "evaluation", label: "Evaluation" },
    { id: "governance", label: "Governance" },
    { id: "policy", label: "Policy Document" },
    { id: "monitoring", label: "Monitoring" },
    { id: "ai", label: "AI Advisor" },
  ];

  const renderContent = () => {
    if (activeNav !== "routing") {
      return (
        <div style={{ ...s.card(), textAlign: "center", padding: 60, color: C.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>{NAV_ITEMS.find(n => n.id === activeNav)?.label}</div>
          <div>Navigate to <strong>Model Routing</strong> to configure your AI model routing policy.</div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview": return <Overview data={data} setActiveStep={i => { setActiveTab(TABS[i + 1]?.id || "models"); }} setActiveNav={setActiveNav} />;
      case "models": return <StepApprovedModels data={data} setData={setData} />;
      case "tasks": return <StepTaskClassification data={data} setData={setData} />;
      case "risk": return <StepDataRisk data={data} setData={setData} />;
      case "tiers": return <StepModelTiers data={data} setData={setData} />;
      case "rules": return <StepRoutingRules data={data} setData={setData} />;
      case "cost": return <StepCostSimulator data={data} />;
      case "evaluation": return <StepEvaluationGates data={data} setData={setData} />;
      case "governance": return <StepGovernance data={data} setData={setData} />;
      case "policy": return <StepPolicyDocument data={data} />;
      case "monitoring": return <StepMonitoring data={data} />;
      case "ai": return <AIAssistant context={{ models: (data.models || []).length, tasks: (data.tasks || []).length, rules: (data.rules || []).length, governance: data.governance }} />;
      default: return null;
    }
  };

  return (
    <div style={s.app}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoText}>AI Strategy Tool</div>
          <div style={s.logoSub}>Enterprise AI Governance Platform</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={s.navSection}>
            <div style={s.navLabel}>Navigation</div>
            {NAV_ITEMS.map(item => (
              <div key={item.id} style={s.navItem(activeNav === item.id)} onClick={() => setActiveNav(item.id)}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "routing" && <Badge label="Active" color={C.green} bg={C.greenSoft} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textDim }}>Model Routing Policy v1.0</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>Draft · Pending Review</div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Model Routing Policy</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>AI Strategy Tool · Enterprise Feature</div>
          </div>
          <div style={s.row(8)}>
            <Badge label={`${(data.models || []).length} Models`} color={C.blue} bg={C.blueSoft} />
            <Badge label={`${(data.rules || []).length} Rules`} color={C.green} bg={C.greenSoft} />
            <Badge label="Draft" color={C.amber} bg={C.amberSoft} />
            <button style={s.btn("ghost")} onClick={() => setShowAI(!showAI)}>
              {showAI ? "Hide" : "AI Advisor"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {activeNav === "routing" && (
          <div style={{ ...s.row(0), padding: "0 24px", background: C.surface, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 0 }}>
            {TABS.map(t => (
              <button key={t.id} style={{ ...s.tab(activeTab === t.id), background: "transparent", fontFamily: "inherit" }}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
                {t.id === "ai" && <Badge label="Claude" color={C.purple} bg={C.purpleSoft} />}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={s.content}>
          {showAI && activeTab !== "ai" && (
            <div style={{ marginBottom: 24 }}>
              <AIAssistant context={{ models: (data.models || []).length, tasks: (data.tasks || []).length, rules: data.rules, governance: data.governance, evalThresholds: data.evalThresholds }} />
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
