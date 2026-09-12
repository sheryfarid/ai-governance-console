import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════════════════
// TOKENS
// ════════════════════════════════════════════════════════════════════════
const C = {
  navy: "#0A1420", navyMid: "#101E30", slate: "#1B3048", steel: "#284260",
  accent: "#0FA3FF", accentL: "#4DBBFF", teal: "#12C9AE", amber: "#F5A623",
  red: "#EF4444", green: "#22C55E", purple: "#A78BFA",
  text: "#E7EEF9", textDim: "#7690B3", border: "#1B3048", card: "#0D1B2C",
};

const STORAGE_KEY = "ai-eval-gov-stack-v1";

// ════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ════════════════════════════════════════════════════════════════════════
function Card({ children, style = {}, highlight, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${highlight || C.border}`, borderRadius: 8,
      padding: 18, cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>{children}</h2>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textDim, maxWidth: 640 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function Btn({ children, onClick, active, variant = "default", small, style = {} }) {
  const variants = {
    default: { bg: active ? C.accent : C.navyMid, border: active ? C.accent : C.border, color: active ? "#04101F" : C.text },
    ghost: { bg: "transparent", border: C.border, color: C.textDim },
    success: { bg: active ? C.green : "transparent", border: C.green, color: active ? "#04101F" : C.green },
    danger: { bg: active ? C.red : "transparent", border: C.red, color: active ? "#04101F" : C.red },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      background: v.bg, border: `1px solid ${v.border}`, color: v.color, borderRadius: 6,
      padding: small ? "4px 10px" : "7px 16px", fontSize: small ? 11 : 12, fontWeight: 600,
      cursor: "pointer", whiteSpace: "nowrap", ...style,
    }}>{children}</button>
  );
}

function Tag({ label, color }) {
  return <span style={{ border: `1px solid ${color}`, color, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", background: color + "18" }}>{label}</span>;
}

function Ring({ pct, size = 76, stroke = 7, color = C.accent, label }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)} strokeLinecap="round" />
        <text x={size/2} y={size/2+1} fill={C.text} fontSize={size*0.2} textAnchor="middle"
          dominantBaseline="middle" transform={`rotate(90 ${size/2} ${size/2})`} fontWeight="800">{pct}%</text>
      </svg>
      {label && <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{label}</div>}
    </div>
  );
}

function Bar({ pct, color, height = 6 }) {
  return <div style={{ height, background: C.border, borderRadius: height }}>
    <div style={{ width: `${Math.min(Math.max(pct,0),100)}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.4s" }} />
  </div>;
}

const STATUS_CYCLES = {
  method: ["Not Adopted","Trial","Adopted"],
  tool: ["Not Integrated","Trial","Integrated"],
  standard: ["Not Started","In Progress","Implemented"],
  control: ["Not Implemented","Planned","Implemented"],
  pipeline: ["Not Built","Partial","Operational"],
};
const STATUS_COLOR = {
  "Not Adopted": C.textDim, "Trial": C.amber, "Adopted": C.green,
  "Not Integrated": C.textDim, "Integrated": C.green,
  "Not Started": C.textDim, "In Progress": C.amber, "Implemented": C.green,
  "Not Implemented": C.textDim, "Planned": C.amber,
  "Not Built": C.textDim, "Partial": C.amber, "Operational": C.green,
};

function StatusPill({ status, onClick }) {
  const color = STATUS_COLOR[status] || C.textDim;
  return (
    <button onClick={onClick} style={{
      background: color + "18", border: `1px solid ${color}`, color, borderRadius: 4,
      padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap",
    }}>{status}</button>
  );
}

function weightOf(status) {
  if (status === "Adopted" || status === "Integrated" || status === "Implemented" || status === "Operational") return 100;
  if (status === "Trial" || status === "In Progress" || status === "Planned" || status === "Partial") return 50;
  return 0;
}

// ════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════
const EVAL_METHODS = [
  { id: "golden", name: "Golden dataset evaluation", cat: "Dataset & Testing", desc: "Maintain approved questions, expected answers, edge cases and failure cases.", tools: ["LangSmith","MLflow","Microsoft Foundry Evaluation"] },
  { id: "offline", name: "Offline evaluation", cat: "Dataset & Testing", desc: "Test models, prompts, RAG pipelines and agents before deployment.", tools: ["LangSmith","Arize Phoenix","MLflow","W&B Weave"] },
  { id: "regression", name: "Regression evaluation", cat: "Dataset & Testing", desc: "Re-run the same evaluation suite after every model, prompt, code or knowledge-base change.", tools: ["LangSmith","MLflow","Microsoft Foundry Evaluation"] },
  { id: "human", name: "Human evaluation", cat: "Judgment Methods", desc: "Domain experts score correctness, relevance, safety and business suitability.", tools: ["LangSmith","MLflow","Amazon Bedrock Evaluations"] },
  { id: "llmjudge", name: "LLM-as-a-Judge", cat: "Judgment Methods", desc: "Use an independent LLM with a defined rubric to score outputs.", tools: ["LangSmith","Arize Phoenix","MLflow","Microsoft Foundry Evaluation","Amazon Bedrock Evaluations"] },
  { id: "pairwise", name: "Pairwise evaluation", cat: "Judgment Methods", desc: "Compare Model A against Model B, Prompt A against Prompt B, or Agent A against Agent B.", tools: ["LangSmith"] },
  { id: "deterministic", name: "Deterministic evaluation", cat: "Judgment Methods", desc: "Exact match, regex, schema validation, JSON validation, rule checks and business rules.", tools: ["LangSmith","Arize Phoenix","MLflow"] },
  { id: "rag", name: "RAG evaluation", cat: "Domain-Specific", desc: "Measure retrieval relevance, context relevance, groundedness, faithfulness, answer relevance and answer correctness.", tools: ["Ragas","Arize Phoenix","Amazon Bedrock Evaluations"] },
  { id: "agent", name: "Agent evaluation", cat: "Domain-Specific", desc: "Measure task completion, tool selection, tool-call accuracy, tool parameters, trajectory, number of steps and final outcome.", tools: ["W&B Weave","Microsoft Foundry Evaluation","Arize Phoenix"] },
  { id: "hallucination", name: "Hallucination evaluation", cat: "Domain-Specific", desc: "Check whether claims are supported by trusted evidence.", tools: ["Ragas","Arize Phoenix","Microsoft Foundry Evaluation"] },
  { id: "safety", name: "Safety evaluation", cat: "Safety & Security", desc: "Test harmful content, toxicity, unsafe actions, sensitive data disclosure and policy violations.", tools: ["Microsoft Foundry Evaluation","MLCommons AILuminate","Amazon Bedrock Evaluations"] },
  { id: "redteam", name: "Security red teaming", cat: "Safety & Security", desc: "Prompt injection, jailbreaks, indirect prompt injection, malicious files, tool abuse, data exfiltration and excessive agency.", tools: ["Microsoft Foundry Evaluation"] },
  { id: "fairness", name: "Fairness and bias evaluation", cat: "Safety & Security", desc: "Measure differences in outcomes across relevant groups.", tools: ["MLCommons AILuminate","Amazon Bedrock Evaluations"] },
  { id: "robustness", name: "Robustness testing", cat: "Safety & Security", desc: "Test typos, ambiguous questions, adversarial inputs, missing context and unexpected tool responses.", tools: ["Arize Phoenix","W&B Weave"] },
  { id: "performance", name: "Performance evaluation", cat: "Performance & Production", desc: "Latency, throughput, availability, token use and cost.", tools: ["LangSmith","Arize Phoenix","W&B Weave","Microsoft Foundry Evaluation"] },
  { id: "onlineeval", name: "Online evaluation", cat: "Performance & Production", desc: "Evaluate sampled production interactions and traces.", tools: ["LangSmith","Arize Phoenix","W&B Weave"] },
  { id: "abtest", name: "A/B testing", cat: "Performance & Production", desc: "Compare versions with real or controlled traffic.", tools: ["MLflow","W&B Weave"] },
  { id: "contmonitor", name: "Continuous monitoring", cat: "Performance & Production", desc: "Detect quality degradation, drift, safety failures and cost changes.", tools: ["Arize Phoenix","W&B Weave","Microsoft Foundry Evaluation"] },
];

const EVAL_CATEGORIES = ["Dataset & Testing","Judgment Methods","Domain-Specific","Safety & Security","Performance & Production"];

const TOOLS = [
  { id: "langsmith", name: "LangSmith", focus: "LLM & agent tracing, datasets, experiments", desc: "Formally supports offline and online evaluation, human evaluation, code rules, LLM-as-a-judge and pairwise comparison.",
    caps: ["Tracing","Datasets","LLM-Judge","Pairwise","Human Eval","Regression","Production Eval"] },
  { id: "ragas", name: "Ragas", focus: "RAG-specific evaluation", desc: "Strong choice for RAG evaluation and custom RAG metrics.",
    caps: ["RAG Metrics","Groundedness","Faithfulness","Custom Metrics"] },
  { id: "phoenix", name: "Arize Phoenix", focus: "Open-source tracing & observability", desc: "Supports correctness, faithfulness, document relevance and agent tool evaluation.",
    caps: ["Tracing","Observability","Experiments","Agent Tools","Open Source"] },
  { id: "mlflow", name: "MLflow", focus: "Evaluation datasets & production monitoring", desc: "Evaluation datasets, human feedback, LLM judges, GenAI evaluation, agent evaluation and production monitoring.",
    caps: ["Datasets","Human Feedback","LLM-Judge","Agent Eval","Monitoring","A/B Testing"] },
  { id: "weave", name: "W&B Weave", focus: "Agent trajectories & production monitoring", desc: "Evaluation, traces, scorers, agent evaluation, latency, cost, safety and production monitoring.",
    caps: ["Traces","Scorers","Agent Trajectories","Latency","Cost","Safety","Monitoring"] },
  { id: "foundry", name: "Microsoft Foundry Evaluation", focus: "Enterprise Azure evaluation & governance", desc: "Quality, groundedness, relevance, safety, agent evaluation, monitoring and tracing. Includes agent-specific measures such as tool-call accuracy and task completion.",
    caps: ["Quality","Groundedness","Safety","Agent Eval","Monitoring","Tracing","RBAC"] },
  { id: "bedrock", name: "Amazon Bedrock Evaluations", focus: "AWS-native model & RAG evaluation", desc: "Model evaluation, RAG evaluation, automatic LLM judging and human evaluation.",
    caps: ["Model Eval","RAG Eval","LLM-Judge","Human Eval"] },
  { id: "mlcommons", name: "MLCommons AILuminate", focus: "Standardised safety benchmarking", desc: "Standardised safety and risk benchmarking for GenAI systems, including safety testing approaches.",
    caps: ["Safety Benchmarking","Fairness","Standardised Testing"] },
];

const ALL_CAPS = Array.from(new Set(TOOLS.flatMap(t => t.caps))).sort();

const GOV_STANDARDS = [
  { id: "iso42001", name: "ISO/IEC 42001:2023", type: "Management System", desc: "AI Management System — one of the main enterprise standards for establishing, operating, monitoring and continually improving organisational AI governance." },
  { id: "nistrmf", name: "NIST AI RMF 1.0 + AI 600-1 (GenAI Profile)", type: "Risk Framework", desc: "AI risk management framework covering organisational AI risk management, plus the Generative AI Profile. Currently being revised — track updates." },
  { id: "iso23894", name: "ISO/IEC 23894:2023", type: "Risk Framework", desc: "AI-specific risk management guidance." },
  { id: "iso38507", name: "ISO/IEC 38507:2022", type: "Governance", desc: "Governance implications of AI use at organisational and board level." },
  { id: "iso23053", name: "ISO/IEC 23053:2022", type: "Technical Framework", desc: "Framework for describing machine-learning-based AI systems." },
  { id: "iso27001", name: "ISO/IEC 27001:2022", type: "Security Framework", desc: "Information security management — important for protecting AI data, models, services and infrastructure." },
  { id: "euaiact", name: "EU AI Act", type: "Legislation", desc: "Regulatory framework based on AI risk. High-risk requirements include risk management, data governance, logging, documentation, transparency, human oversight, accuracy, robustness and cybersecurity." },
  { id: "owasp", name: "OWASP Top 10 for LLM & GenAI Applications", type: "Security Framework", desc: "Security framework covering risks such as prompt injection, sensitive information disclosure, supply-chain issues and data/model poisoning." },
  { id: "mlcommonsrisk", name: "MLCommons AI Risk and Reliability", type: "Benchmarking", desc: "Standardised AI safety and reliability benchmarking work." },
];

const TYPE_COLOR = {
  "Management System": C.purple, "Risk Framework": C.amber, "Governance": C.accentL,
  "Technical Framework": C.teal, "Security Framework": C.red, "Legislation": C.text, "Benchmarking": C.textDim,
};

const GOV_CONTROLS = [
  { cat: "Inventory & Classification", items: [
    "AI use-case inventory and AI system register", "AI risk classification", "AI impact assessment", "Algorithmic or AI risk assessment",
  ]},
  { cat: "Data & Model Governance", items: [
    "Data governance and data lineage", "Model cards and system cards", "AI factsheets", "Dataset and knowledge-base versioning",
    "Model registry", "Model and prompt version control",
  ]},
  { cat: "Controls & Oversight", items: [
    "Risk and control register", "Responsible AI scorecards", "Human-in-the-loop approval", "Segregation of duties", "Policy-as-code",
  ]},
  { cat: "Security & Testing", items: [
    "Evaluation gates in CI/CD", "Security testing and AI red teaming", "Bias and fairness testing", "Explainability assessments",
    "Privacy and PII controls", "Access control using RBAC and managed identities",
  ]},
  { cat: "Operations", items: [
    "Continuous model and agent monitoring", "Drift and quality monitoring", "Incident management", "Kill switch and rollback controls",
    "Audit trails and traceability", "Third-party model and supplier risk management", "Periodic governance review", "Regulatory evidence collection",
  ]},
];

const PIPELINE_STAGES = [
  { id: "usecase", name: "Business Use Case", detail: "Define the business problem, owner, and success criteria before any AI work begins." },
  { id: "riskclass", name: "AI Risk Classification", detail: "Classify the use case (low/moderate/high/critical) against internal and regulatory criteria." },
  { id: "controls", name: "ISO 42001 / NIST AI RMF Controls", detail: "Apply management-system and risk-framework controls appropriate to the risk classification." },
  { id: "datagov", name: "Data Governance", detail: "Establish data lineage, ownership, quality and residency controls for all data used." },
  { id: "dev", name: "Model / RAG / Agent Development", detail: "Build the solution — model integration, retrieval pipeline, or agent orchestration." },
  { id: "golden", name: "Golden Evaluation Dataset", detail: "Curate versioned approved questions, expected answers, edge and failure cases." },
  { id: "autoevals", name: "Automated Evals", detail: "Run offline, regression, deterministic, LLM-judge and RAG/agent-specific evaluations." },
  { id: "redteam", name: "Safety and Security Red Teaming", detail: "Test for harmful content, prompt injection, jailbreaks, and excessive agency." },
  { id: "humanapproval", name: "Human Approval", detail: "Domain experts and accountable owners review evaluation evidence and sign off." },
  { id: "cicdgate", name: "CI/CD Governance Gate", detail: "Automated policy-as-code gate blocks promotion unless all thresholds are met." },
  { id: "deploy", name: "Deployment", detail: "Release to production via controlled rollout (canary, blue/green, or staged)." },
  { id: "tracing", name: "Tracing and Observability", detail: "Capture full traces of prompts, retrieval, tool calls and responses in production." },
  { id: "onlineevals", name: "Online Evals", detail: "Continuously evaluate sampled production interactions against the same rubric." },
  { id: "monitoring", name: "Drift / Safety / Cost Monitoring", detail: "Track quality drift, safety violations, and cost trends against baselines." },
  { id: "incident", name: "Incident Management", detail: "Defined process for triage, rollback, and root-cause analysis of AI incidents." },
  { id: "govreview", name: "Continuous Governance Review", detail: "Periodic review of the whole stack against standards, risk register, and business outcomes." },
];

const STACK_PROFILES = {
  Azure: {
    combo: ["Microsoft Foundry Evaluation", "MLflow or LangSmith", "Ragas", "Automated CI/CD evaluation gates"],
    note: "A strong practical combination for an Azure-based enterprise system: Microsoft Foundry Evaluation for quality/safety/agent evaluation and governance controls, paired with MLflow or LangSmith for experiment tracking, Ragas for RAG-specific metrics, and CI/CD evaluation gates to enforce thresholds automatically.",
  },
  AWS: {
    combo: ["Amazon Bedrock Evaluations", "Ragas", "MLflow", "Automated CI/CD evaluation gates"],
    note: "For an AWS-native stack, Bedrock Evaluations provides model and RAG evaluation with automatic LLM judging natively integrated with Bedrock models, complemented by Ragas for deeper RAG metrics and MLflow for experiment and production tracking.",
  },
  "Open Source / Self-Hosted": {
    combo: ["LangSmith or Arize Phoenix", "Ragas", "MLflow", "W&B Weave (for agents)"],
    note: "A vendor-neutral, open-source-friendly stack: LangSmith or Phoenix for tracing and experiments, Ragas for RAG evaluation, MLflow for the model/evaluation registry, and W&B Weave where agent trajectory evaluation is a priority.",
  },
  "Multi-Cloud / Governance-First": {
    combo: ["Arize Phoenix", "Ragas", "MLflow", "IBM watsonx.governance (governance layer)"],
    note: "Where vendor neutrality and formal governance evidence matter most, pair open evaluation tooling (Phoenix, Ragas, MLflow) with a dedicated governance platform such as IBM watsonx.governance for AI inventory, risk, policy and compliance workflows.",
  },
};

const GOV_PLATFORMS = [
  { name: "IBM watsonx.governance", use: "AI inventory, risks, policies, controls, compliance, governance workflows, model factsheets and continuous monitoring." },
  { name: "Microsoft Foundry", use: "Evaluation, tracing, monitoring, identity, RBAC, content controls, network controls and Azure Policy." },
  { name: "Azure ML Responsible AI Dashboard", use: "Fairness, responsible AI assessment and governance evidence generation." },
];

// ════════════════════════════════════════════════════════════════════════
// DEFAULT STATE
// ════════════════════════════════════════════════════════════════════════
function buildDefaultState() {
  const methodStatus = {};
  EVAL_METHODS.forEach(m => { methodStatus[m.id] = "Not Adopted"; });
  ["golden","offline","deterministic","rag"].forEach(id => methodStatus[id] = "Adopted");
  ["regression","human","llmjudge","performance"].forEach(id => methodStatus[id] = "Trial");

  const toolStatus = {};
  TOOLS.forEach(t => { toolStatus[t.id] = "Not Integrated"; });
  toolStatus.ragas = "Integrated"; toolStatus.langsmith = "Trial"; toolStatus.mlflow = "Trial";

  const standardStatus = {};
  GOV_STANDARDS.forEach(s => { standardStatus[s.id] = "Not Started"; });
  standardStatus.owasp = "In Progress"; standardStatus.nistrmf = "In Progress"; standardStatus.iso27001 = "Implemented";

  const controlStatus = {};
  GOV_CONTROLS.forEach(g => g.items.forEach(item => { controlStatus[item] = "Not Implemented"; }));
  controlStatus["Model registry"] = "Implemented";
  controlStatus["Audit trails and traceability"] = "Implemented";
  controlStatus["Access control using RBAC and managed identities"] = "Implemented";
  controlStatus["AI use-case inventory and AI system register"] = "Planned";
  controlStatus["Evaluation gates in CI/CD"] = "Planned";
  controlStatus["Human-in-the-loop approval"] = "Planned";

  const pipelineStatus = {};
  PIPELINE_STAGES.forEach(p => { pipelineStatus[p.id] = "Not Built"; });
  ["usecase","riskclass","datagov","dev"].forEach(id => pipelineStatus[id] = "Operational");
  ["golden","autoevals","tracing"].forEach(id => pipelineStatus[id] = "Partial");

  return { methodStatus, toolStatus, standardStatus, controlStatus, pipelineStatus, selectedEnv: "Azure" };
}

// ════════════════════════════════════════════════════════════════════════
// STORAGE HOOK
// ════════════════════════════════════════════════════════════════════════
function useAppState() {
  const [state, setState] = useState(buildDefaultState());
  const [loaded, setLoaded] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage?.get(STORAGE_KEY, false);
        if (res && res.value) setState(prev => ({ ...prev, ...JSON.parse(res.value) }));
      } catch (e) { /* first run */ }
      finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { await window.storage?.set(STORAGE_KEY, JSON.stringify(state), false); } catch (e) {}
    }, 400);
    return () => clearTimeout(timer.current);
  }, [state, loaded]);

  const cycle = (bucket, key) => {
    setState(prev => {
      const cycleType = bucket === "methodStatus" ? "method" : bucket === "toolStatus" ? "tool" : bucket === "standardStatus" ? "standard" : bucket === "controlStatus" ? "control" : "pipeline";
      const order = STATUS_CYCLES[cycleType];
      const cur = prev[bucket][key];
      const next = order[(order.indexOf(cur) + 1) % order.length];
      return { ...prev, [bucket]: { ...prev[bucket], [key]: next } };
    });
  };

  const setEnv = (env) => setState(prev => ({ ...prev, selectedEnv: env }));

  const reset = async () => {
    try { await window.storage?.delete(STORAGE_KEY, false); } catch (e) {}
    setState(buildDefaultState());
  };

  return { state, cycle, setEnv, reset, loaded };
}

// ════════════════════════════════════════════════════════════════════════
// SCORE HELPERS
// ════════════════════════════════════════════════════════════════════════
function avgWeight(statusMap) {
  const vals = Object.values(statusMap);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((s, v) => s + weightOf(v), 0) / vals.length);
}

// ════════════════════════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════════════════════════
const NAV = [
  { id: "overview",  label: "Overview",          icon: "⬡" },
  { id: "methods",   label: "Evaluation Methods", icon: "◉" },
  { id: "tools",     label: "Tool Comparison",    icon: "⊞" },
  { id: "standards", label: "Governance Standards", icon: "◈" },
  { id: "controls",  label: "Governance Controls", icon: "☑" },
  { id: "pipeline",  label: "Production Pipeline", icon: "⟶" },
  { id: "recommender", label: "Stack Recommender", icon: "✦" },
  { id: "reports",   label: "Maturity Report",    icon: "⊟" },
];

// ════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ════════════════════════════════════════════════════════════════════════
function OverviewScreen({ state, setActive }) {
  const methodScore = avgWeight(state.methodStatus);
  const toolScore = avgWeight(state.toolStatus);
  const standardScore = avgWeight(state.standardStatus);
  const controlScore = avgWeight(state.controlStatus);
  const pipelineScore = avgWeight(state.pipelineStatus);
  const overall = Math.round((methodScore + toolScore + standardScore + controlScore + pipelineScore) / 5);

  const adoptedMethods = Object.values(state.methodStatus).filter(s => s === "Adopted").length;
  const integratedTools = Object.values(state.toolStatus).filter(s => s === "Integrated").length;
  const implementedStandards = Object.values(state.standardStatus).filter(s => s === "Implemented").length;
  const implementedControls = Object.values(state.controlStatus).filter(s => s === "Implemented").length;
  const operationalStages = Object.values(state.pipelineStatus).filter(s => s === "Operational").length;

  return (
    <div>
      <SectionTitle children="AI Evaluation & Governance Stack" sub="Industry-standard evaluation methods, tooling, governance standards and controls for enterprise AI, GenAI, RAG and Agentic AI." />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Overall Stack Maturity</div>
          <Ring pct={overall} size={110} stroke={10} color={overall >= 70 ? C.green : overall >= 40 ? C.amber : C.red} />
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {[
            ["Evaluation Methods", methodScore, `${adoptedMethods}/${EVAL_METHODS.length} adopted`, "methods", C.accent],
            ["Tool Integration", toolScore, `${integratedTools}/${TOOLS.length} integrated`, "tools", C.teal],
            ["Governance Standards", standardScore, `${implementedStandards}/${GOV_STANDARDS.length} implemented`, "standards", C.purple],
            ["Governance Controls", controlScore, `${implementedControls}/${GOV_CONTROLS.flatMap(g=>g.items).length} implemented`, "controls", C.amber],
            ["Pipeline Maturity", pipelineScore, `${operationalStages}/${PIPELINE_STAGES.length} operational`, "pipeline", C.accentL],
          ].map(([label, pct, sub, screen, color]) => (
            <Card key={label} onClick={() => setActive(screen)}>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{pct}%</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{sub}</div>
              <div style={{ marginTop: 8 }}><Bar pct={pct} color={color} /></div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Evaluation Method Coverage by Category</div>
          {EVAL_CATEGORIES.map(cat => {
            const items = EVAL_METHODS.filter(m => m.cat === cat);
            const adopted = items.filter(m => state.methodStatus[m.id] === "Adopted").length;
            const pct = Math.round(adopted / items.length * 100);
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 3 }}>
                  <span>{cat}</span><span>{adopted}/{items.length}</span>
                </div>
                <Bar pct={pct} color={C.accent} />
              </div>
            );
          })}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Governance Controls by Category</div>
          {GOV_CONTROLS.map(g => {
            const done = g.items.filter(i => state.controlStatus[i] === "Implemented").length;
            const pct = Math.round(done / g.items.length * 100);
            return (
              <div key={g.cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 3 }}>
                  <span>{g.cat}</span><span>{done}/{g.items.length}</span>
                </div>
                <Bar pct={pct} color={C.amber} />
              </div>
            );
          })}
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Production Pipeline Snapshot</div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
          {PIPELINE_STAGES.map((p, i) => {
            const status = state.pipelineStatus[p.id];
            const color = STATUS_COLOR[status];
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} title={p.name} />
                {i < PIPELINE_STAGES.length - 1 && <div style={{ width: 14, height: 1, background: C.border }} />}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 10 }}>
          <button onClick={() => setActive("pipeline")} style={{ background: "none", border: "none", color: C.accentL, cursor: "pointer", padding: 0, fontSize: 11 }}>
            View full pipeline →
          </button>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// EVALUATION METHODS
// ════════════════════════════════════════════════════════════════════════
function MethodsScreen({ state, cycle }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...EVAL_CATEGORIES];
  const visible = filter === "All" ? EVAL_METHODS : EVAL_METHODS.filter(m => m.cat === filter);

  return (
    <div>
      <SectionTitle children="AI Evaluation Methods" sub="18 industry-standard evaluation methods. Click a status pill to cycle Not Adopted → Trial → Adopted." />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {cats.map(c => <Btn key={c} active={filter === c} onClick={() => setFilter(c)} small>{c}</Btn>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {visible.map(m => (
          <Card key={m.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.name}</div>
              <StatusPill status={state.methodStatus[m.id]} onClick={() => cycle("methodStatus", m.id)} />
            </div>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8 }}>{m.cat}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>{m.desc}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {m.tools.map(t => <span key={t} style={{ fontSize: 10, color: C.accentL, background: "#0A2038", borderRadius: 3, padding: "2px 6px" }}>{t}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TOOL COMPARISON
// ════════════════════════════════════════════════════════════════════════
function ToolsScreen({ state, cycle }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <SectionTitle children="Evaluation Tool Comparison" sub="Click a tool card to see full capability detail. Click the status pill to cycle integration state." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 16 }}>
        {TOOLS.map(t => (
          <Card key={t.id} onClick={() => setSelected(selected === t.id ? null : t.id)} highlight={selected === t.id ? C.accent : C.border}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{t.focus}</div>
              </div>
              <StatusPill status={state.toolStatus[t.id]} onClick={(e) => { e.stopPropagation(); cycle("toolStatus", t.id); }} />
            </div>
            {selected === t.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>{t.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {t.caps.map(c => <Tag key={c} label={c} color={C.teal} />)}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Capability Matrix</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 10px", color: C.textDim, borderBottom: `1px solid ${C.border}`, position: "sticky", left: 0, background: C.card }}>Capability</th>
                {TOOLS.map(t => <th key={t.id} style={{ padding: "6px 8px", color: C.text, borderBottom: `1px solid ${C.border}`, fontSize: 10, minWidth: 70 }}>{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {ALL_CAPS.map((cap, i) => (
                <tr key={cap} style={{ background: i % 2 === 0 ? C.navyMid : "transparent" }}>
                  <td style={{ padding: "6px 10px", color: C.textDim, position: "sticky", left: 0, background: i % 2 === 0 ? C.navyMid : C.card }}>{cap}</td>
                  {TOOLS.map(t => (
                    <td key={t.id} style={{ textAlign: "center", padding: "6px 8px", color: t.caps.includes(cap) ? C.green : C.border }}>
                      {t.caps.includes(cap) ? "●" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GOVERNANCE STANDARDS
// ════════════════════════════════════════════════════════════════════════
function StandardsScreen({ state, cycle }) {
  return (
    <div>
      <SectionTitle children="AI Governance Standards & Frameworks" sub="ISO/IEC 42001 is a management-system standard, NIST AI RMF is a risk-management framework, the EU AI Act is legislation, and OWASP focuses on technical GenAI security risks." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GOV_STANDARDS.map(s => (
          <Card key={s.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.name}</div>
                  <Tag label={s.type} color={TYPE_COLOR[s.type]} />
                </div>
                <div style={{ fontSize: 12, color: C.textDim }}>{s.desc}</div>
              </div>
              <StatusPill status={state.standardStatus[s.id]} onClick={() => cycle("standardStatus", s.id)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// GOVERNANCE CONTROLS
// ════════════════════════════════════════════════════════════════════════
function ControlsScreen({ state, cycle }) {
  return (
    <div>
      <SectionTitle children="AI Governance Methods & Controls" sub="Click any status pill to cycle Not Implemented → Planned → Implemented." />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {GOV_CONTROLS.map(g => {
          const done = g.items.filter(i => state.controlStatus[i] === "Implemented").length;
          const pct = Math.round(done / g.items.length * 100);
          return (
            <Card key={g.cat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{g.cat}</div>
                <div style={{ fontSize: 12, color: C.textDim }}>{done}/{g.items.length}</div>
              </div>
              <div style={{ marginBottom: 12 }}><Bar pct={pct} color={C.amber} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {g.items.map(item => (
                  <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", background: C.navyMid, borderRadius: 6 }}>
                    <span style={{ fontSize: 12, color: C.text }}>{item}</span>
                    <StatusPill status={state.controlStatus[item]} onClick={() => cycle("controlStatus", item)} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PIPELINE
// ════════════════════════════════════════════════════════════════════════
function PipelineScreen({ state, cycle }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <SectionTitle children="Production Governance Pipeline" sub="Business Use Case through Continuous Governance Review. Click a stage to see detail; click its status pill to cycle status." />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PIPELINE_STAGES.map((p, i) => {
          const status = state.pipelineStatus[p.id];
          const color = STATUS_COLOR[status];
          return (
            <div key={p.id}>
              <Card onClick={() => setExpanded(expanded === p.id ? null : p.id)} highlight={expanded === p.id ? color : C.border}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: 600 }}>{p.name}</div>
                <StatusPill status={status} onClick={(e) => { e.stopPropagation(); cycle("pipelineStatus", p.id); }} />
              </Card>
              {expanded === p.id && (
                <div style={{ padding: "8px 16px 8px 56px", fontSize: 12, color: C.textDim }}>{p.detail}</div>
              )}
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ width: 1, height: 10, background: C.border, marginLeft: 29 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STACK RECOMMENDER
// ════════════════════════════════════════════════════════════════════════
function RecommenderScreen({ state, setEnv }) {
  const profile = STACK_PROFILES[state.selectedEnv];

  return (
    <div>
      <SectionTitle children="Stack Recommender" sub="Select your environment to see a practical, evidence-based tool combination." />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.keys(STACK_PROFILES).map(env => (
          <Btn key={env} active={state.selectedEnv === env} onClick={() => setEnv(env)}>{env}</Btn>
        ))}
      </div>

      <Card highlight={C.accent + "80"} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.accentL, fontWeight: 700, marginBottom: 10 }}>RECOMMENDED COMBINATION — {state.selectedEnv.toUpperCase()}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {profile.combo.map(c => <Tag key={c} label={c} color={C.accentL} />)}
        </div>
        <div style={{ fontSize: 13, color: C.text }}>{profile.note}</div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Dedicated Governance Platforms</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GOV_PLATFORMS.map(p => (
            <div key={p.name} style={{ padding: "10px 14px", background: C.navyMid, borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.textDim }}>{p.use}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Core Depth Areas for an AI Architect</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["ISO 42001","NIST AI RMF","ISO 23894","EU AI Act","ISO 27001","OWASP GenAI","LangSmith","Ragas","Phoenix","MLflow","Microsoft Foundry Evaluation","IBM watsonx.governance"].map(x => (
            <Tag key={x} label={x} color={C.purple} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MATURITY REPORT
// ════════════════════════════════════════════════════════════════════════
function ReportsScreen({ state }) {
  const methodScore = avgWeight(state.methodStatus);
  const toolScore = avgWeight(state.toolStatus);
  const standardScore = avgWeight(state.standardStatus);
  const controlScore = avgWeight(state.controlStatus);
  const pipelineScore = avgWeight(state.pipelineStatus);
  const overall = Math.round((methodScore + toolScore + standardScore + controlScore + pipelineScore) / 5);
  const rec = overall >= 75 ? "MATURE — Proceed with confidence" : overall >= 45 ? "DEVELOPING — Close key gaps before scaling" : "EARLY — Foundational work required";
  const recColor = overall >= 75 ? C.green : overall >= 45 ? C.amber : C.red;

  const gaps = [];
  EVAL_METHODS.forEach(m => { if (state.methodStatus[m.id] === "Not Adopted") gaps.push({ area: "Evaluation Method", name: m.name }); });
  GOV_STANDARDS.forEach(s => { if (state.standardStatus[s.id] === "Not Started") gaps.push({ area: "Governance Standard", name: s.name }); });
  GOV_CONTROLS.forEach(g => g.items.forEach(item => { if (state.controlStatus[item] === "Not Implemented") gaps.push({ area: g.cat, name: item }); }));

  return (
    <div>
      <SectionTitle children="Stack Maturity Report" sub="Generated live from your current assessment across all five dimensions." />

      <Card highlight={recColor + "80"} style={{ marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>OVERALL ASSESSMENT</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: recColor, marginBottom: 6 }}>{overall}%</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: recColor }}>{rec}</div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          ["Evaluation Methods", methodScore], ["Tool Integration", toolScore], ["Gov. Standards", standardScore],
          ["Gov. Controls", controlScore], ["Pipeline", pipelineScore],
        ].map(([label, pct]) => (
          <Card key={label} style={{ textAlign: "center" }}>
            <Ring pct={pct} size={64} stroke={6} color={C.accent} label={label} />
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Open Gaps ({gaps.length})</div>
        {gaps.length === 0 ? (
          <div style={{ fontSize: 12, color: C.green }}>No open gaps — everything tracked is fully implemented.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
            {gaps.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.navyMid, borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: C.text }}>{g.name}</span>
                <span style={{ fontSize: 10, color: C.textDim }}>{g.area}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════
export default function App() {
  const [active, setActive] = useState("overview");
  const { state, cycle, setEnv, reset, loaded } = useAppState();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!loaded) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.navy, color: C.textDim, fontFamily: "system-ui" }}>Loading workspace…</div>;
  }

  const screens = {
    overview: <OverviewScreen state={state} setActive={setActive} />,
    methods: <MethodsScreen state={state} cycle={cycle} />,
    tools: <ToolsScreen state={state} cycle={cycle} />,
    standards: <StandardsScreen state={state} cycle={cycle} />,
    controls: <ControlsScreen state={state} cycle={cycle} />,
    pipeline: <PipelineScreen state={state} cycle={cycle} />,
    recommender: <RecommenderScreen state={state} setEnv={setEnv} />,
    reports: <ReportsScreen state={state} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.navy, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: 210, background: C.navyMid, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.1em", marginBottom: 2 }}>ENTERPRISE AI</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1.25 }}>Evaluation &amp;<br/>Governance Stack</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px",
              borderRadius: 6, border: "none", background: active === n.id ? C.slate : "transparent",
              color: active === n.id ? C.text : C.textDim, fontSize: 12.5, cursor: "pointer", textAlign: "left",
              fontWeight: active === n.id ? 600 : 400,
            }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 10, cursor: "pointer", padding: 0 }}>Reset demo data</button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { reset(); setConfirmReset(false); }} style={{ background: "none", border: "none", color: C.red, fontSize: 10, cursor: "pointer", padding: 0, fontWeight: 700 }}>Confirm</button>
              <button onClick={() => setConfirmReset(false)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 10, cursor: "pointer", padding: 0 }}>Cancel</button>
            </div>
          )}
          <div style={{ fontSize: 9, color: C.border, marginTop: 6 }}>v1.0 · Auto-saved</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {screens[active]}
      </div>
    </div>
  );
}
