import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:           "#080C12",
  surface:      "#0E1420",
  surfaceB:     "#141B28",
  surfaceC:     "#1A2236",
  border:       "#1E2A3A",
  borderHi:     "#2A3F5F",
  accent:       "#0066FF",
  accentSoft:   "#0A1F44",
  accentGlow:   "#0066FF33",
  text:         "#D4E0F0",
  textMid:      "#7A93B8",
  textDim:      "#3A4F6A",
  green:        "#00C896",
  greenSoft:    "#00281A",
  amber:        "#F0A020",
  amberSoft:    "#2A1A00",
  red:          "#FF4060",
  redSoft:      "#300A10",
  purple:       "#9060FF",
  purpleSoft:   "#1A0A30",
  cyan:         "#20BEFF",
  cyanSoft:     "#001A28",
  gold:         "#C8A000",
  goldSoft:     "#201400",
  t1: "#00C896", t1s: "#00281A",
  t2: "#0066FF", t2s: "#0A1F44",
  t3: "#9060FF", t3s: "#1A0A30",
  t4: "#FF4060", t4s: "#300A10",
};

// ─── Shared Data ──────────────────────────────────────────────────────────────
const PROVIDERS = ["OpenAI","Microsoft Azure OpenAI","Anthropic","Google","AWS Bedrock","Meta","Mistral","Cohere","Internal","Fine-tuned Enterprise","On-premise"];
const MODEL_TYPES = ["Small language model","General-purpose LLM","Reasoning model","Embedding model","Vision model","Speech model","Classification model","Fine-tuned model","Agent model"];
const TASK_NAMES = ["Sentiment Analysis","Document Classification","Entity Extraction","Summarisation","Translation","Email Drafting","Enterprise Search","RAG Q&A","Document Comparison","Contract Analysis","Risk Analysis","Financial Analysis","Code Generation","Complex Reasoning","Planning","Agentic Workflow","Tool Execution","Customer Support","Fraud Investigation","Regulatory Decision Support"];
const BIZ_UNITS = ["Legal","Finance","Operations","Technology","Risk","Compliance","HR","Sales","Marketing","Product","Procurement"];
const LATENCY_OPTS = ["Ultra-low <100ms","Low <500ms","Moderate <2s","High 2s+"];
const ACCURACY_OPTS = ["<80%","80–90%","90–95%","95–99%",">99%"];
const RISK_OPTS = ["Low","Medium","High","Critical"];
const AUTONOMY_OPTS = ["None","Assisted","Semi-autonomous","Autonomous","Fully autonomous"];
const DATA_TYPES = ["Public","Internal","Confidential","Personal (PII)","Special Category","Financial","Health","Biometric","Children's","Customer","Employee","Intellectual Property"];
const IMPACT_OPTS = ["Negligible","Low","Medium","High","Critical"];
const FRAMEWORKS = ["NIST AI RMF","ISO/IEC 42001","ISO/IEC 27001","EU AI Act","Internal AI Policy","Model Risk Management","FinOps Controls","OWASP GenAI Top 10","UK AI Regulation","DORA"];
const HOSTING_OPTS = ["Cloud API","Private cloud","On-premise","Hybrid"];
const REGIONS = ["UK","EU","US","APAC","Global","On-premise only"];

const GOV_METHODS = [
  { id: "inventory",     cat: "Inventory & Register",     name: "AI Use-Case Inventory & System Register",   desc: "Maintain a live register of all AI use cases, systems, and models in production." },
  { id: "risk_class",   cat: "Risk",                      name: "AI Risk Classification",                    desc: "Classify each AI system by risk level: prohibited, high-risk, limited-risk, minimal." },
  { id: "impact",       cat: "Risk",                      name: "AI Impact Assessment",                      desc: "Assess potential harms across safety, rights, fairness, and operations before deployment." },
  { id: "algo_risk",    cat: "Risk",                      name: "Algorithmic / AI Risk Assessment",          desc: "Structured assessment of model-specific risks: bias, drift, hallucination, misuse." },
  { id: "data_gov",     cat: "Data",                      name: "Data Governance & Data Lineage",            desc: "Track data provenance, quality, access controls, and lineage across model pipelines." },
  { id: "model_cards",  cat: "Documentation",             name: "Model Cards & System Cards",                desc: "Structured documentation of model capabilities, limitations, training data, and intended use." },
  { id: "factsheets",   cat: "Documentation",             name: "AI Factsheets",                             desc: "Transparency documents for AI systems published internally or to stakeholders." },
  { id: "risk_reg",     cat: "Risk",                      name: "Risk & Control Register",                   desc: "Live register mapping each AI risk to mitigating controls and control owners." },
  { id: "rai_score",    cat: "Accountability",            name: "Responsible AI Scorecard",                  desc: "Periodic scoring of each AI system against responsible AI principles." },
  { id: "hitl",         cat: "Human Oversight",           name: "Human-in-the-Loop Approval",                desc: "Require human review before AI decisions reach production or affect end users." },
  { id: "sod",          cat: "Human Oversight",           name: "Segregation of Duties",                     desc: "Separate model development, approval, and monitoring across distinct roles." },
  { id: "version",      cat: "Version Control",           name: "Model & Prompt Version Control",            desc: "Track every model version and prompt change with rollback capability." },
  { id: "dataset_ver",  cat: "Version Control",           name: "Dataset & Knowledge-Base Versioning",       desc: "Version control all training datasets and retrieval knowledge bases used in production." },
  { id: "model_reg",    cat: "Registry",                  name: "Model Registry",                            desc: "Central catalogue of approved models, versions, performance metrics, and approval status." },
  { id: "audit",        cat: "Traceability",              name: "Audit Trails & Traceability",               desc: "Immutable logs of model decisions, routing choices, and data accessed." },
  { id: "pac",          cat: "Policy",                    name: "Policy-as-Code",                            desc: "Encode governance rules as machine-readable policies evaluated at runtime." },
  { id: "eval_gate",    cat: "Evaluation",                name: "Evaluation Gates in CI/CD",                 desc: "Automated evaluation checkpoints that block model deployment if thresholds are not met." },
  { id: "red_team",     cat: "Security",                  name: "Security Testing & AI Red Teaming",         desc: "Adversarial testing of models for jailbreaks, prompt injection, data extraction, and misuse." },
  { id: "bias",         cat: "Fairness",                  name: "Bias & Fairness Testing",                   desc: "Evaluate model outputs for demographic bias, disparate impact, and representation issues." },
  { id: "explain",      cat: "Explainability",            name: "Explainability Assessments",                desc: "Assess whether model decisions can be explained to users, regulators, and affected parties." },
  { id: "privacy",      cat: "Privacy",                   name: "Privacy & PII Controls",                    desc: "Prevent personal and special-category data from entering models without authorisation." },
  { id: "rbac",         cat: "Access Control",            name: "RBAC & Managed Identities",                 desc: "Role-based access to AI systems with managed service identities and credential controls." },
  { id: "monitoring",   cat: "Monitoring",                name: "Continuous Model & Agent Monitoring",       desc: "Real-time monitoring of model outputs, agent behaviour, costs, and policy compliance." },
  { id: "drift",        cat: "Monitoring",                name: "Drift & Quality Monitoring",                desc: "Detect model performance degradation, concept drift, and output quality deterioration." },
  { id: "incident",     cat: "Incident Management",       name: "Incident Management",                       desc: "Defined process for detecting, reporting, containing, and remediating AI incidents." },
  { id: "killswitch",   cat: "Controls",                  name: "Kill Switch & Rollback Controls",           desc: "Ability to immediately disable or revert any AI model or routing decision." },
  { id: "third_party",  cat: "Supplier Risk",             name: "Third-Party Model & Supplier Risk",         desc: "Assess and monitor AI providers for security, reliability, compliance, and lock-in risk." },
  { id: "review",       cat: "Governance",                name: "Periodic Governance Review",                desc: "Scheduled reviews of AI policies, routing rules, model performance, and governance posture." },
  { id: "reg_evidence", cat: "Compliance",                name: "Regulatory Evidence Collection",            desc: "Systematic collection of evidence for regulatory audits and compliance reporting." },
];

const GOV_TOOLS = [
  { name: "IBM watsonx.governance",  desc: "AI inventory, risks, policies, controls, compliance, governance workflows, model factsheets, continuous monitoring.", url: "#", color: T.accent },
  { name: "Microsoft Azure Foundry", desc: "Evaluation, tracing, monitoring, identity, RBAC, content controls, network controls, Azure Policy.", url: "#", color: T.cyan },
  { name: "Azure ML Responsible AI", desc: "Fairness dashboard, responsible AI assessment, governance evidence collection.", url: "#", color: T.purple },
  { name: "LangSmith",               desc: "LLM tracing, evaluation, prompt versioning, production monitoring.", url: "#", color: T.green },
  { name: "Ragas",                   desc: "RAG evaluation framework: faithfulness, groundedness, context precision.", url: "#", color: T.amber },
  { name: "Arize Phoenix",           desc: "Open-source LLM observability, evaluation, and drift monitoring.", url: "#", color: T.gold },
  { name: "MLflow",                  desc: "Open-source model lifecycle, experiment tracking, registry, deployment.", url: "#", color: T.red },
];

const PRODUCTION_PIPELINE = [
  { id: "usecase",   label: "Business Use Case",              desc: "Define scope, stakeholders, success metrics, and risk appetite." },
  { id: "riskclass", label: "AI Risk Classification",          desc: "Apply risk tiers per ISO 42001 / EU AI Act: prohibited → high → limited → minimal." },
  { id: "controls",  label: "ISO 42001 / NIST AI RMF Controls",desc: "Select applicable controls from your governance framework library." },
  { id: "datgov",    label: "Data Governance",                 desc: "Validate data lineage, consent, quality, and access controls." },
  { id: "dev",       label: "Model / RAG / Agent Development", desc: "Build or configure the AI system with versioned prompts, tools, and retrieval." },
  { id: "goldenset", label: "Golden Evaluation Dataset",       desc: "Curate ground-truth examples covering edge cases and high-risk scenarios." },
  { id: "autoevals", label: "Automated Evals",                 desc: "Run accuracy, groundedness, faithfulness, latency, and cost evaluations at scale." },
  { id: "redteam",   label: "Safety & Security Red Teaming",   desc: "Adversarially probe for jailbreaks, bias, data leakage, and misuse vectors." },
  { id: "approval",  label: "Human Approval",                  desc: "Governance sign-off from AI, Risk, Security, Legal, and Business owners." },
  { id: "cicd",      label: "CI/CD Governance Gate",           desc: "Automated gate: block deployment if evaluation scores fall below policy thresholds." },
  { id: "deploy",    label: "Deployment",                      desc: "Deploy to production via approved model registry with routing policy active." },
  { id: "tracing",   label: "Tracing & Observability",         desc: "Log every request, decision, token, cost, latency, and routing outcome." },
  { id: "online",    label: "Online Evals",                    desc: "Continuously evaluate production outputs against evaluation criteria." },
  { id: "driftmon",  label: "Drift / Safety / Cost Monitoring",desc: "Alert on performance degradation, safety violations, and budget overruns." },
  { id: "incident",  label: "Incident Management",             desc: "Investigate, contain, remediate, and report AI incidents within SLA." },
  { id: "govreview", label: "Continuous Governance Review",    desc: "Scheduled reviews to update policies, routing rules, and model approvals." },
];

const EXPERTISE = [
  { topic: "ISO 42001",             priority: "Core", why: "AI management system standard — the backbone of enterprise AI governance." },
  { topic: "NIST AI RMF",           priority: "Core", why: "Risk management framework with MAP / MEASURE / MANAGE / GOVERN functions." },
  { topic: "ISO 23894",             priority: "Core", why: "AI risk management guidance aligned to ISO 31000." },
  { topic: "EU AI Act",             priority: "Core", why: "Mandatory regulatory compliance for AI systems operating in the EU." },
  { topic: "ISO 27001",             priority: "Core", why: "Information security management — essential for AI data and model security." },
  { topic: "OWASP GenAI Top 10",    priority: "Core", why: "Security risks specific to LLMs: prompt injection, model theft, data leakage." },
  { topic: "LangSmith",             priority: "Tool", why: "Production LLM tracing, evaluation, and prompt version management." },
  { topic: "Ragas",                 priority: "Tool", why: "RAG evaluation framework for faithfulness, context precision, and recall." },
  { topic: "Arize Phoenix",         priority: "Tool", why: "Open-source LLM observability and online evaluation platform." },
  { topic: "MLflow",                priority: "Tool", why: "Model registry, experiment tracking, and lifecycle management." },
  { topic: "Microsoft Foundry Eval",priority: "Tool", why: "Azure-native evaluation with content safety, grounding, and tracing." },
  { topic: "IBM watsonx.governance",priority: "Tool", why: "Enterprise AI governance platform with compliance, factsheets, and monitoring." },
];

// ─── Micro Components ─────────────────────────────────────────────────────────
const px = (v) => typeof v === "number" ? `${v}px` : v;

const Badge = ({ label, color = T.accent, bg }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, color, background: bg || color+"22", border:`1px solid ${color}44`, whiteSpace:"nowrap" }}>{label}</span>
);

const RiskBadge = ({ risk }) => {
  const m = { Low:[T.green,T.greenSoft], Medium:[T.amber,T.amberSoft], High:[T.red,T.redSoft], Critical:["#FF0040","#400010"] };
  const [c,bg] = m[risk]||[T.textMid,T.surfaceB];
  return <Badge label={risk} color={c} bg={bg} />;
};

const TierChip = ({ tier }) => {
  const m = { 1:[T.t1,T.t1s,"Low Cost"], 2:[T.t2,T.t2s,"General"], 3:[T.t3,T.t3s,"Reasoning"], 4:[T.t4,T.t4s,"Agentic"] };
  const [c,bg,lbl] = m[tier]||[T.textMid,T.surfaceB,"?"];
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color:c, background:bg, border:`1px solid ${c}44` }}>T{tier} · {lbl}</span>;
};

const Dot = ({ color = T.green, size = 8 }) => (
  <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%", background:color, flexShrink:0 }} />
);

const Divider = ({ my = 20 }) => <div style={{ borderTop:`1px solid ${T.border}`, margin:`${my}px 0` }} />;

const Label = ({ children }) => <div style={{ fontSize:11, color:T.textMid, marginBottom:5, fontWeight:600, letterSpacing:"0.02em" }}>{children}</div>;

const Input = ({ value, onChange, placeholder, type="text", style={} }) => (
  <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
    style={{ background:T.surfaceC, border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 12px", color:T.text, fontSize:13, width:"100%", outline:"none", boxSizing:"border-box", ...style }}
  />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ background:T.surfaceC, border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 12px", color:T.text, fontSize:13, width:"100%", outline:"none" }}>
    <option value="">— Select —</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Btn = ({ children, onClick, variant="primary", size="md", disabled=false, style={} }) => {
  const bg = variant==="primary"?T.accent: variant==="success"?T.green: variant==="danger"?T.red: variant==="ghost"?"transparent": T.surfaceC;
  const col = variant==="ghost"?T.textMid:T.text;
  const pad = size==="sm"?"5px 10px":"8px 18px";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:bg, color:col, border:`1px solid ${variant==="ghost"?T.border:bg}`, borderRadius:6, padding:pad, fontSize:size==="sm"?12:13, fontWeight:600, cursor:disabled?"default":"pointer", display:"inline-flex", alignItems:"center", gap:6, opacity:disabled?0.5:1, ...style }}>
      {children}
    </button>
  );
};

const Card = ({ children, style={}, glow=false }) => (
  <div style={{ background:T.surface, border:`1px solid ${glow?T.borderHi:T.border}`, borderRadius:10, padding:20, boxShadow: glow?`0 0 20px ${T.accentGlow}`:"none", ...style }}>
    {children}
  </div>
);

const MetricCard = ({ label, value, sub, color=T.accent }) => (
  <Card>
    <div style={{ fontSize:28, fontWeight:800, color, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>{value}</div>
    <div style={{ fontSize:12, color:T.text, fontWeight:600, marginTop:4 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:T.textMid, marginTop:2 }}>{sub}</div>}
  </Card>
);

const Grid = ({ cols=2, gap=16, children, style={} }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap, ...style }}>{children}</div>
);

const Row = ({ children, gap=12, align="center", justify="flex-start", style={} }) => (
  <div style={{ display:"flex", alignItems:align, justifyContent:justify, gap, flexWrap:"wrap", ...style }}>{children}</div>
);

const Col = ({ children, gap=12, style={} }) => (
  <div style={{ display:"flex", flexDirection:"column", gap, ...style }}>{children}</div>
);

const SectionHead = ({ title, sub, action }) => (
  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, color:T.text, margin:0, letterSpacing:"-0.01em" }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:T.textMid, marginTop:6, lineHeight:1.5, maxWidth:580 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const FormField = ({ label, children }) => <div><Label>{label}</Label>{children}</div>;

const ProgressBar = ({ value, max=100, color=T.accent }) => (
  <div style={{ background:T.surfaceC, borderRadius:4, height:5, overflow:"hidden" }}>
    <div style={{ width:`${Math.min(100,(value/max)*100)}%`, background:color, height:"100%", borderRadius:4, transition:"width .5s ease" }} />
  </div>
);

// ─── AI Advisor ───────────────────────────────────────────────────────────────
function AIAdvisor({ context, mini=false }) {
  const [msgs, setMsgs] = useState([
    { role:"assistant", text:"I'm your AI Governance & Routing Policy advisor.\n\nAsk me to:\n• Recommend a model tier for a workload\n• Assess risk classification\n• Map controls to NIST AI RMF or ISO 42001\n• Review a routing rule\n• Estimate cost impact\n• Identify governance gaps" }
  ]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    if (!q.trim() || loading) return;
    const question = q.trim(); setQ(""); setLoading(true);
    setMsgs(m => [...m, { role:"user", text:question }]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1000,
          system:`You are an expert enterprise AI Governance Architect and Model Routing Policy advisor. You specialise in ISO/IEC 42001, NIST AI RMF, EU AI Act, ISO 27001, OWASP GenAI Top 10, model risk management, FinOps for AI, and enterprise AI governance. You help organisations design responsible AI operating architectures including model routing policies, risk classifications, governance controls, evaluation gates, and audit trails. Current session context: ${JSON.stringify(context).slice(0,600)}. Be precise, cite specific frameworks and controls, and give actionable enterprise-grade recommendations. Use short paragraphs. Reference specific tiers (Tier 1–4), governance methods, and evaluation metrics where relevant.`,
          messages: msgs.filter((_,i)=>i>0||msgs[0].role==="user").concat({ role:"user", content:question }).map(m=>({ role:m.role, content:m.text }))
        })
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"No response.";
      setMsgs(m => [...m, { role:"assistant", text }]);
    } catch { setMsgs(m => [...m, { role:"assistant", text:"Connection error. Please try again." }]); }
    setLoading(false);
  };

  return (
    <Card style={{ display:"flex", flexDirection:"column", height: mini?400:520 }} glow>
      <Row gap={8} style={{ marginBottom:14 }}>
        <Dot color={T.green} size={9} />
        <span style={{ fontSize:13, fontWeight:700, color:T.text }}>AI Governance Advisor</span>
        <Badge label="Powered by Claude" color={T.purple} />
      </Row>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"90%",
            background:m.role==="user"?T.accentSoft:T.surfaceB,
            border:`1px solid ${m.role==="user"?T.accent:T.border}`,
            borderRadius:8, padding:"10px 14px", fontSize:12.5, lineHeight:1.65, color:T.text, whiteSpace:"pre-wrap" }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ alignSelf:"flex-start", background:T.surfaceB, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 14px", fontSize:12, color:T.textMid }}>Analysing…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <Input value={q} onChange={setQ} placeholder="Ask about routing, risk, governance, cost…" style={{ flex:1 }} />
        <Btn onClick={send} disabled={loading}>Ask</Btn>
      </div>
    </Card>
  );
}

// ─── Approved Models ──────────────────────────────────────────────────────────
function ModelsTab({ data, setData }) {
  const [open, setOpen] = useState(false);
  const blank = { provider:"",name:"",version:"",type:"",hosting:"",region:"",inputCost:"",outputCost:"",contextWindow:"",latency:"",reasoning:"",multimodal:false,toolUse:false,structuredOut:false,dataResidency:"",secClass:"",status:"Pending",expiry:"" };
  const [form, setForm] = useState(blank);
  const models = data.models||[];

  const add = () => {
    if (!form.provider||!form.name) return;
    setData(d=>({...d, models:[...models,{...form,id:Date.now()}]}));
    setForm(blank); setOpen(false);
  };
  const del = id => setData(d=>({...d,models:models.filter(m=>m.id!==id)}));

  return (
    <Col gap={20}>
      <SectionHead title="Approved Model Registry"
        sub="Register AI models approved for enterprise use. Approval here establishes eligibility — it does not determine routing."
        action={<Btn onClick={()=>setOpen(!open)}>+ Register Model</Btn>} />

      <Card style={{ background:T.accentSoft, border:`1px solid ${T.accent}44` }}>
        <p style={{ margin:0, fontSize:13.5, color:T.cyan, fontWeight:600, lineHeight:1.6 }}>
          Approved models tell the organisation what it is <em>allowed</em> to use.<br/>
          Model routing tells the organisation what should <em>run where, when, and why</em>.
        </p>
      </Card>

      {open && (
        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:16 }}>Register New Model</div>
          <Grid cols={3} gap={14}>
            <FormField label="Provider"><Select value={form.provider} onChange={v=>setForm(f=>({...f,provider:v}))} options={PROVIDERS}/></FormField>
            <FormField label="Model Name"><Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. GPT-4o"/></FormField>
            <FormField label="Version"><Input value={form.version} onChange={v=>setForm(f=>({...f,version:v}))} placeholder="e.g. 2024-11"/></FormField>
            <FormField label="Model Type"><Select value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} options={MODEL_TYPES}/></FormField>
            <FormField label="Hosting"><Select value={form.hosting} onChange={v=>setForm(f=>({...f,hosting:v}))} options={HOSTING_OPTS}/></FormField>
            <FormField label="Region"><Select value={form.region} onChange={v=>setForm(f=>({...f,region:v}))} options={REGIONS}/></FormField>
            <FormField label="Input Cost £/1M tokens"><Input value={form.inputCost} onChange={v=>setForm(f=>({...f,inputCost:v}))} placeholder="e.g. 0.50" type="number"/></FormField>
            <FormField label="Output Cost £/1M tokens"><Input value={form.outputCost} onChange={v=>setForm(f=>({...f,outputCost:v}))} placeholder="e.g. 1.50" type="number"/></FormField>
            <FormField label="Context Window (tokens)"><Input value={form.contextWindow} onChange={v=>setForm(f=>({...f,contextWindow:v}))} placeholder="e.g. 128000"/></FormField>
            <FormField label="Latency Class"><Select value={form.latency} onChange={v=>setForm(f=>({...f,latency:v}))} options={LATENCY_OPTS}/></FormField>
            <FormField label="Reasoning Capability"><Select value={form.reasoning} onChange={v=>setForm(f=>({...f,reasoning:v}))} options={["Basic","Standard","Advanced","Expert"]}/></FormField>
            <FormField label="Security Classification"><Select value={form.secClass} onChange={v=>setForm(f=>({...f,secClass:v}))} options={["Public","Restricted","Confidential","Secret"]}/></FormField>
            <FormField label="Data Residency"><Select value={form.dataResidency} onChange={v=>setForm(f=>({...f,dataResidency:v}))} options={REGIONS}/></FormField>
            <FormField label="Approval Status"><Select value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={["Pending","Approved","Conditional","Suspended","Retired"]}/></FormField>
            <FormField label="Approval Expiry"><Input value={form.expiry} onChange={v=>setForm(f=>({...f,expiry:v}))} type="date"/></FormField>
          </Grid>
          <Row gap={12} style={{ marginTop:14 }}>
            {[["Multimodal","multimodal"],["Tool-Use","toolUse"],["Structured Output","structuredOut"]].map(([lbl,key])=>(
              <label key={key} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:T.textMid }}>
                <input type="checkbox" checked={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.checked}))} /> {lbl}
              </label>
            ))}
          </Row>
          <Row gap={8} style={{ marginTop:16 }}>
            <Btn onClick={add}>Save Model</Btn>
            <Btn variant="ghost" onClick={()=>setOpen(false)}>Cancel</Btn>
          </Row>
        </Card>
      )}

      {models.length===0 ? (
        <Card style={{ textAlign:"center", padding:48, color:T.textMid }}>
          <div style={{ fontSize:32, marginBottom:12 }}>◈</div>
          <div style={{ fontWeight:600, color:T.text }}>No models registered</div>
          <div style={{ fontSize:13, marginTop:4 }}>Click "Register Model" to begin building your approved model registry.</div>
        </Card>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {["Provider","Model","Version","Type","Hosting","Region","In £/1M","Out £/1M","Context","Latency","Reasoning","Status",""].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:T.textMid, fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m,i)=>(
                <tr key={m.id} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"9px 10px" }}>{m.provider}</td>
                  <td style={{ padding:"9px 10px", fontWeight:700, color:T.text }}>{m.name}</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{m.version}</td>
                  <td style={{ padding:"9px 10px" }}><Badge label={m.type||"—"} color={T.purple}/></td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{m.hosting}</td>
                  <td style={{ padding:"9px 10px" }}>{m.region}</td>
                  <td style={{ padding:"9px 10px" }}>£{m.inputCost||"—"}</td>
                  <td style={{ padding:"9px 10px" }}>£{m.outputCost||"—"}</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{m.contextWindow?Number(m.contextWindow).toLocaleString():"—"}</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{m.latency}</td>
                  <td style={{ padding:"9px 10px" }}>{m.reasoning}</td>
                  <td style={{ padding:"9px 10px" }}>
                    <Badge label={m.status} color={m.status==="Approved"?T.green:m.status==="Suspended"?T.red:T.amber} />
                  </td>
                  <td style={{ padding:"9px 10px" }}>
                    <Btn variant="ghost" size="sm" onClick={()=>del(m.id)} style={{ color:T.red }}>Remove</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Col>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
function TasksTab({ data, setData }) {
  const [open, setOpen] = useState(false);
  const blank = { name:"",unit:"",criticality:"Medium",volume:"Medium",inputTokens:"",outputTokens:"",reqPerDay:"",latency:"Moderate <2s",accuracy:"90–95%",reasoning:"Standard",autonomy:"None",humanReview:"No" };
  const [form, setForm] = useState(blank);
  const tasks = data.tasks||[];

  const add = () => {
    if (!form.name) return;
    setData(d=>({...d,tasks:[...tasks,{...form,id:Date.now()}]}));
    setForm(blank); setOpen(false);
  };

  return (
    <Col gap={20}>
      <SectionHead title="AI Workload Classification"
        sub="Define every AI task type your organisation runs. Each class drives routing, risk, and cost decisions."
        action={<Btn onClick={()=>setOpen(!open)}>+ Add Task Class</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
        {TASK_NAMES.slice(0,8).map(t=>(
          <Card key={t} style={{ cursor:"pointer", padding:"12px 14px" }}
            onClick={()=>{ setForm(f=>({...f,name:t})); setOpen(true); }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{t}</div>
            <div style={{ fontSize:11, color:T.textMid, marginTop:3 }}>Click to configure →</div>
          </Card>
        ))}
      </div>

      {open && (
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Configure Task Class</div>
          <Grid cols={3} gap={14}>
            <FormField label="Task Name"><Select value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} options={TASK_NAMES}/></FormField>
            <FormField label="Business Unit"><Select value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))} options={BIZ_UNITS}/></FormField>
            <FormField label="Business Criticality"><Select value={form.criticality} onChange={v=>setForm(f=>({...f,criticality:v}))} options={RISK_OPTS}/></FormField>
            <FormField label="Volume"><Select value={form.volume} onChange={v=>setForm(f=>({...f,volume:v}))} options={["Low","Medium","High","Very High"]}/></FormField>
            <FormField label="Avg Input Tokens"><Input value={form.inputTokens} onChange={v=>setForm(f=>({...f,inputTokens:v}))} placeholder="e.g. 2000"/></FormField>
            <FormField label="Avg Output Tokens"><Input value={form.outputTokens} onChange={v=>setForm(f=>({...f,outputTokens:v}))} placeholder="e.g. 500"/></FormField>
            <FormField label="Requests Per Day"><Input value={form.reqPerDay} onChange={v=>setForm(f=>({...f,reqPerDay:v}))} placeholder="e.g. 5000"/></FormField>
            <FormField label="Latency Requirement"><Select value={form.latency} onChange={v=>setForm(f=>({...f,latency:v}))} options={LATENCY_OPTS}/></FormField>
            <FormField label="Accuracy Requirement"><Select value={form.accuracy} onChange={v=>setForm(f=>({...f,accuracy:v}))} options={ACCURACY_OPTS}/></FormField>
            <FormField label="Reasoning Requirement"><Select value={form.reasoning} onChange={v=>setForm(f=>({...f,reasoning:v}))} options={["Basic","Standard","Advanced","Expert"]}/></FormField>
            <FormField label="Autonomy Level"><Select value={form.autonomy} onChange={v=>setForm(f=>({...f,autonomy:v}))} options={AUTONOMY_OPTS}/></FormField>
            <FormField label="Human Review"><Select value={form.humanReview} onChange={v=>setForm(f=>({...f,humanReview:v}))} options={["No","Conditional","Yes","Mandatory"]}/></FormField>
          </Grid>
          <Row gap={8} style={{ marginTop:16 }}>
            <Btn onClick={add}>Add Task</Btn>
            <Btn variant="ghost" onClick={()=>setOpen(false)}>Cancel</Btn>
          </Row>
        </Card>
      )}

      {tasks.length>0 && (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {["Task","Unit","Criticality","Volume","Req/Day","Latency","Accuracy","Autonomy","Review"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:T.textMid }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t,i)=>(
                <tr key={t.id} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"9px 10px", fontWeight:700 }}>{t.name}</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{t.unit}</td>
                  <td style={{ padding:"9px 10px" }}><RiskBadge risk={t.criticality}/></td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{t.volume}</td>
                  <td style={{ padding:"9px 10px" }}>{t.reqPerDay||"—"}</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{t.latency}</td>
                  <td style={{ padding:"9px 10px" }}>{t.accuracy}</td>
                  <td style={{ padding:"9px 10px" }}>{t.autonomy}</td>
                  <td style={{ padding:"9px 10px" }}>
                    <Badge label={t.humanReview} color={t.humanReview==="Mandatory"?T.red:t.humanReview==="Yes"?T.amber:T.textMid}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Col>
  );
}

// ─── Routing Rules ────────────────────────────────────────────────────────────
function RoutingTab({ data, setData }) {
  const [form, setForm] = useState({ task:"", risk:"", maxTokens:"", specialCat:false, tier:"", reason:"", doNotRoute:"" });
  const rules = data.rules||[];
  const tasks = data.tasks||[];
  const tierColors = { "1":T.t1, "2":T.t2, "3":T.t3, "4":T.t4 };

  const add = () => {
    if (!form.task||!form.tier) return;
    setData(d=>({...d,rules:[...rules,{...form,id:Date.now()}]}));
    setForm({ task:"",risk:"",maxTokens:"",specialCat:false,tier:"",reason:"",doNotRoute:"" });
  };

  return (
    <Col gap={20}>
      <SectionHead title="Routing Policy Builder"
        sub="Build IF/THEN rules that determine which model tier handles each workload, under what conditions, and with what controls." />

      <Card>
        <div style={{ fontSize:13, fontWeight:700, color:T.textMid, marginBottom:14, letterSpacing:"0.02em" }}>New Routing Rule</div>
        <Card style={{ background:T.surfaceB, marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.cyan, marginBottom:10 }}>IF CONDITIONS</div>
          <Grid cols={3} gap={12}>
            <FormField label="Task Type">
              <Select value={form.task} onChange={v=>setForm(f=>({...f,task:v}))}
                options={tasks.length>0?tasks.map(t=>t.name):TASK_NAMES}/>
            </FormField>
            <FormField label="Risk Rating">
              <Select value={form.risk} onChange={v=>setForm(f=>({...f,risk:v}))} options={RISK_OPTS}/>
            </FormField>
            <FormField label="Max Input Tokens">
              <Input value={form.maxTokens} onChange={v=>setForm(f=>({...f,maxTokens:v}))} placeholder="e.g. 10000"/>
            </FormField>
          </Grid>
          <label style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, cursor:"pointer", fontSize:13, color:T.textMid }}>
            <input type="checkbox" checked={form.specialCat} onChange={e=>setForm(f=>({...f,specialCat:e.target.checked}))}/> Contains Special Category Data
          </label>
        </Card>
        <Card style={{ background:"#0A1A0A", border:`1px solid ${T.green}33`, marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.green, marginBottom:10 }}>THEN ROUTE TO</div>
          <Grid cols={2} gap={12}>
            <FormField label="Route to Tier">
              <Select value={form.tier} onChange={v=>setForm(f=>({...f,tier:v}))} options={["1","2","3","4"]}/>
            </FormField>
            <FormField label="Do Not Route To">
              <Select value={form.doNotRoute} onChange={v=>setForm(f=>({...f,doNotRoute:v}))} options={["","Tier 3","Tier 4","Any premium tier"]}/>
            </FormField>
          </Grid>
          <div style={{ marginTop:12 }}>
            <FormField label="Routing Reason">
              <Input value={form.reason} onChange={v=>setForm(f=>({...f,reason:v}))} placeholder="Explain the business and technical rationale for this routing decision"/>
            </FormField>
          </div>
        </Card>
        <Row gap={8}>
          <Btn onClick={add}>Add Rule</Btn>
        </Row>
      </Card>

      {rules.length>0 && (
        <Col gap={10}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>Active Routing Rules ({rules.length})</div>
          {rules.map(r=>(
            <Card key={r.id} style={{ borderLeft:`3px solid ${tierColors[r.tier]||T.accent}` }}>
              <Grid cols={3} gap={16}>
                <div>
                  <div style={{ fontSize:10, color:T.textMid, fontWeight:700, marginBottom:4 }}>IF TASK =</div>
                  <Badge label={r.task} color={T.cyan}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:T.textMid, fontWeight:700, marginBottom:4 }}>AND RISK =</div>
                  {r.risk?<RiskBadge risk={r.risk}/>:<span style={{ fontSize:12, color:T.textMid }}>Any</span>}
                </div>
                <div>
                  <div style={{ fontSize:10, color:T.textMid, fontWeight:700, marginBottom:4 }}>THEN ROUTE TO</div>
                  <TierChip tier={parseInt(r.tier)}/>
                </div>
              </Grid>
              {r.reason && <p style={{ fontSize:12, color:T.textMid, marginTop:10, marginBottom:0 }}>Reason: {r.reason}</p>}
              {r.doNotRoute && <p style={{ fontSize:12, color:T.red, marginTop:4, marginBottom:0 }}>Do not route to: {r.doNotRoute}</p>}
            </Card>
          ))}
        </Col>
      )}
    </Col>
  );
}

// ─── Cost Simulator ───────────────────────────────────────────────────────────
function CostTab({ data }) {
  const tasks = data.tasks||[];
  const models = data.models||[];
  const rules = data.rules||[];

  const rows = tasks.map(t=>{
    const req = parseFloat(t.reqPerDay)||0;
    const avgIn = parseFloat(t.inputTokens)||2000;
    const avgOut = parseFloat(t.outputTokens)||500;
    const mIn = req*avgIn*30/1e6;
    const mOut = req*avgOut*30/1e6;
    const rule = rules.find(r=>r.task===t.name);
    const tierNum = rule?parseInt(rule.tier):2;
    const premModel = [...models].sort((a,b)=>(parseFloat(b.outputCost)||0)-(parseFloat(a.outputCost)||0))[0];
    const routedModel = models[Math.max(0,tierNum-2)]||models[0];
    const optCost = mIn*(parseFloat(routedModel?.inputCost)||0.5)+mOut*(parseFloat(routedModel?.outputCost)||1.5);
    const premCost = mIn*(parseFloat(premModel?.inputCost)||5)+mOut*(parseFloat(premModel?.outputCost)||15);
    return { ...t, mIn, mOut, optCost, premCost, saving:premCost-optCost, tier:tierNum };
  });

  const totOpt = rows.reduce((s,r)=>s+r.optCost,0);
  const totPrem = rows.reduce((s,r)=>s+r.premCost,0);
  const totSave = totPrem-totOpt;
  const fmt = v => `£${v.toLocaleString("en-GB",{maximumFractionDigits:0})}`;

  return (
    <Col gap={20}>
      <SectionHead title="Cost Routing Simulator"
        sub="Compare all-premium routing against a tier-optimised policy. Uses configured model pricing." />

      <Grid cols={4} gap={14}>
        <MetricCard label="All-Premium Monthly" value={fmt(totPrem)} sub="If everything runs on Tier 3+" color={T.red}/>
        <MetricCard label="Optimised Monthly" value={fmt(totOpt)} sub="With tier routing active" color={T.green}/>
        <MetricCard label="Monthly Saving" value={fmt(totSave)} sub="Avoided premium spend" color={T.cyan}/>
        <MetricCard label="Annual Saving" value={fmt(totSave*12)} sub="Projected" color={T.amber}/>
      </Grid>

      {tasks.length===0 ? (
        <Card style={{ textAlign:"center", padding:40, color:T.textMid }}>
          Add task classes with request volumes to see cost projections.
        </Card>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {["Task","Req/Day","In Tokens/Mo","Out Tokens/Mo","Routed Tier","Optimised","All-Premium","Saving"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:T.textMid }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={r.id} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"9px 10px", fontWeight:700 }}>{r.name}</td>
                  <td style={{ padding:"9px 10px" }}>{Number(r.reqPerDay||0).toLocaleString()}</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{(r.mIn).toFixed(1)}M</td>
                  <td style={{ padding:"9px 10px", color:T.textMid }}>{(r.mOut).toFixed(1)}M</td>
                  <td style={{ padding:"9px 10px" }}><TierChip tier={r.tier}/></td>
                  <td style={{ padding:"9px 10px", color:T.green }}>£{r.optCost.toFixed(2)}</td>
                  <td style={{ padding:"9px 10px", color:T.red }}>£{r.premCost.toFixed(2)}</td>
                  <td style={{ padding:"9px 10px", fontWeight:700, color:r.saving>0?T.cyan:T.textMid }}>£{r.saving.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Grid cols={2} gap={14}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Model Overuse Detector</div>
          {rows.filter(r=>r.tier>=3).length===0 ? (
            <p style={{ color:T.textMid, fontSize:13, margin:0 }}>No overuse detected.</p>
          ) : rows.filter(r=>r.tier>=3).map(r=>(
            <Card key={r.id} style={{ background:T.amberSoft, border:`1px solid ${T.amber}33`, marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.amber }}>⚠ Potential Overuse: {r.name}</div>
              <div style={{ fontSize:12, color:T.textMid, marginTop:4 }}>
                Routed to Tier {r.tier}. Estimated saving if moved to Tier 1: £{(r.saving*0.6).toFixed(2)}/mo
              </div>
            </Card>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Underpower Risk Detector</div>
          {(data.tasks||[]).filter(t=>t.accuracy===">99%"&&!(data.rules||[]).find(r=>r.task===t.name&&parseInt(r.tier)>=2)).map(t=>(
            <Card key={t.id} style={{ background:T.redSoft, border:`1px solid ${T.red}33`, marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.red }}>⚠ Underpower Risk: {t.name}</div>
              <div style={{ fontSize:12, color:T.textMid, marginTop:4 }}>Requires &gt;99% accuracy. Current routing tier may be insufficient — evaluate before lowering cost tier.</div>
            </Card>
          ))}
          {(data.tasks||[]).filter(t=>t.accuracy===">99%"&&!(data.rules||[]).find(r=>r.task===t.name&&parseInt(r.tier)>=2)).length===0 && (
            <p style={{ color:T.textMid, fontSize:13, margin:0 }}>No underpower risks detected.</p>
          )}
        </Card>
      </Grid>
    </Col>
  );
}

// ─── Governance Methods — THE STRONG SECTION ──────────────────────────────────
function GovernanceTab({ data, setData }) {
  const [selectedMethods, setSelectedMethods] = useState(data.govMethods||[]);
  const [govForm, setGovForm] = useState(data.governance||{ policyOwner:"",techOwner:"",bizOwner:"",riskOwner:"",secOwner:"",govOwner:"",selectedFrameworks:[] });
  const [activeCategory, setActiveCategory] = useState("All");
  const [pipelineStep, setPipelineStep] = useState(null);
  const [expertiseFilter, setExpertiseFilter] = useState("All");

  const categories = ["All",...[...new Set(GOV_METHODS.map(m=>m.cat))]];

  const toggle = id => {
    const next = selectedMethods.includes(id)?selectedMethods.filter(x=>x!==id):[...selectedMethods,id];
    setSelectedMethods(next);
    setData(d=>({...d,govMethods:next}));
  };

  const updateGov = (field,value) => {
    const next = {...govForm,[field]:value};
    setGovForm(next);
    setData(d=>({...d,governance:next}));
  };

  const toggleFW = fw => {
    const cur = govForm.selectedFrameworks||[];
    updateGov("selectedFrameworks", cur.includes(fw)?cur.filter(f=>f!==fw):[...cur,fw]);
  };

  const filteredMethods = activeCategory==="All"?GOV_METHODS:GOV_METHODS.filter(m=>m.cat===activeCategory);

  const RACI = [
    ["Define Model Tiers",         "R","A","C","I","C","I","I","C","I"],
    ["Approve New Models",         "C","A","C","R","R","C","I","I","I"],
    ["Create Routing Rules",       "R","A","C","C","C","I","I","C","I"],
    ["Approve Routing Changes",    "C","A","I","R","C","C","I","C","I"],
    ["Review AI Spend",            "I","I","I","I","I","A","R","C","I"],
    ["Monitor Model Risk",         "C","C","I","R","A","C","I","C","R"],
    ["Approve Exceptions",         "C","A","C","R","C","C","I","R","C"],
    ["Retire Models",              "R","A","C","C","C","I","I","I","I"],
    ["Evaluate Model Performance", "R","C","A","I","C","I","C","I","R"],
    ["Incident Response",          "C","A","R","R","C","I","I","C","R"],
  ];
  const RACI_ROLES = ["AI Architecture","AI Governance","Engineering","Security","Data Protection","Legal","FinOps","Business Owner","Model Risk Mgmt"];
  const RACI_COLORS = { R:[T.accent,T.accentSoft], A:[T.amber,T.amberSoft], C:[T.green,T.greenSoft], I:[T.textMid,T.surfaceC] };

  return (
    <Col gap={24}>
      <SectionHead title="AI Governance Methods & Controls"
        sub="The operational backbone of a responsible AI architecture. Select, configure, and map every governance control to your organisation's frameworks and regulatory requirements." />

      {/* Core statement */}
      <Card style={{ background:"#050B18", border:`2px solid ${T.accent}55`, padding:28 }} glow>
        <div style={{ fontSize:16, fontWeight:800, color:T.text, marginBottom:12 }}>
          Model selection is a procurement decision.<br/>
          Model routing is an operating architecture decision.
        </div>
        <div style={{ fontSize:13, color:T.textMid, lineHeight:1.7 }}>
          For AI architecture work, the core governance set worth knowing in depth is:
          <strong style={{ color:T.cyan }}> ISO 42001, NIST AI RMF, ISO 23894, EU AI Act, ISO 27001, OWASP GenAI</strong>,
          LangSmith, Ragas, Phoenix, MLflow, Microsoft Foundry Evaluation, and an enterprise governance platform
          such as <strong style={{ color:T.cyan }}>IBM watsonx.governance</strong>.
        </div>
      </Card>

      {/* Production Enterprise Pipeline */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:6 }}>Production Enterprise AI Architecture Pipeline</div>
        <p style={{ fontSize:13, color:T.textMid, marginBottom:16 }}>
          Click any stage to see what governance controls apply at that point in the lifecycle.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:0 }}>
          {PRODUCTION_PIPELINE.map((step,i)=>(
            <div key={step.id} style={{ display:"flex", alignItems:"center" }}>
              <div onClick={()=>setPipelineStep(pipelineStep===step.id?null:step.id)}
                style={{ cursor:"pointer", background:pipelineStep===step.id?T.accentSoft:T.surfaceB,
                  border:`1px solid ${pipelineStep===step.id?T.accent:T.border}`,
                  borderRadius:6, padding:"8px 12px", fontSize:11.5, fontWeight:600,
                  color:pipelineStep===step.id?T.cyan:T.textMid, transition:"all .2s",
                  whiteSpace:"nowrap" }}>
                {step.label}
              </div>
              {i<PRODUCTION_PIPELINE.length-1 && <div style={{ width:16, height:1, background:T.borderHi, flexShrink:0 }}/>}
            </div>
          ))}
        </div>
        {pipelineStep && (()=>{
          const step = PRODUCTION_PIPELINE.find(s=>s.id===pipelineStep);
          return (
            <Card style={{ background:T.accentSoft, border:`1px solid ${T.accent}44`, marginTop:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.cyan, marginBottom:6 }}>{step.label}</div>
              <p style={{ fontSize:13, color:T.text, marginBottom:10 }}>{step.desc}</p>
              <div style={{ fontSize:12, color:T.textMid }}>
                Governance controls: {GOV_METHODS.slice(0,4).map(m=>(
                  <Badge key={m.id} label={m.name.split(" ")[0]+" "+m.name.split(" ")[1]} color={T.accent} style={{ marginRight:4 }}/>
                ))}
              </div>
            </Card>
          );
        })()}
      </Card>

      {/* Governance Method Library */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:6 }}>Governance Method Library</div>
        <p style={{ fontSize:13, color:T.textMid, marginBottom:14 }}>
          Select all governance methods applied in your organisation. Each selected method contributes to your routing policy governance posture score.
        </p>
        <Row gap={6} style={{ marginBottom:16 }}>
          {categories.map(c=>(
            <Btn key={c} variant={activeCategory===c?"primary":"ghost"} size="sm" onClick={()=>setActiveCategory(c)}>{c}</Btn>
          ))}
        </Row>
        <Row gap={8} style={{ marginBottom:12 }}>
          <Badge label={`${selectedMethods.length} / ${GOV_METHODS.length} selected`} color={T.green}/>
          <ProgressBar value={selectedMethods.length} max={GOV_METHODS.length} color={T.green}/>
        </Row>
        <Grid cols={2} gap={10}>
          {filteredMethods.map(m=>{
            const sel = selectedMethods.includes(m.id);
            return (
              <div key={m.id} onClick={()=>toggle(m.id)}
                style={{ cursor:"pointer", background:sel?T.accentSoft:T.surfaceB,
                  border:`1px solid ${sel?T.accent:T.border}`, borderRadius:8, padding:"12px 14px",
                  transition:"all .2s" }}>
                <Row gap={10} align="flex-start">
                  <div style={{ width:16, height:16, borderRadius:4, background:sel?T.accent:T.surfaceC,
                    border:`1px solid ${sel?T.accent:T.border}`, flexShrink:0, display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:10, color:T.text, marginTop:1 }}>
                    {sel?"✓":""}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:sel?T.text:T.textMid }}>{m.name}</div>
                    <div style={{ fontSize:11, color:T.textDim, marginTop:3 }}>{m.desc}</div>
                    <Badge label={m.cat} color={T.purple} style={{ marginTop:5 }}/>
                  </div>
                </Row>
              </div>
            );
          })}
        </Grid>
      </Card>

      {/* Governance Tooling */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:6 }}>Enterprise AI Governance Tooling</div>
        <p style={{ fontSize:13, color:T.textMid, marginBottom:16 }}>Reference platforms used in production enterprise AI governance architectures.</p>
        <Grid cols={2} gap={12}>
          {GOV_TOOLS.map(tool=>(
            <Card key={tool.name} style={{ background:T.surfaceB, borderLeft:`3px solid ${tool.color}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:tool.color, marginBottom:4 }}>{tool.name}</div>
              <div style={{ fontSize:12, color:T.textMid, lineHeight:1.5 }}>{tool.desc}</div>
            </Card>
          ))}
        </Grid>
      </Card>

      {/* Core Expertise */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:6 }}>AI Architect Core Knowledge Set</div>
        <p style={{ fontSize:13, color:T.textMid, marginBottom:14 }}>
          For production enterprise AI architecture, the frameworks and tools worth knowing in depth.
        </p>
        <Row gap={6} style={{ marginBottom:14 }}>
          {["All","Core","Tool"].map(f=>(
            <Btn key={f} variant={expertiseFilter===f?"primary":"ghost"} size="sm" onClick={()=>setExpertiseFilter(f)}>{f}</Btn>
          ))}
        </Row>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {["Framework / Tool","Priority","Why It Matters"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:T.textMid }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXPERTISE.filter(e=>expertiseFilter==="All"||e.priority===expertiseFilter).map((e,i)=>(
                <tr key={e.topic} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:T.text }}>{e.topic}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <Badge label={e.priority} color={e.priority==="Core"?T.amber:T.green}/>
                  </td>
                  <td style={{ padding:"10px 12px", color:T.textMid, lineHeight:1.5 }}>{e.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Framework Alignment */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:6 }}>Governance Framework Alignment</div>
        <p style={{ fontSize:13, color:T.textMid, marginBottom:14 }}>
          Map your routing policy controls to enterprise frameworks. This shows alignment — it does not assert automatic compliance.
        </p>
        <Grid cols={5} gap={8}>
          {FRAMEWORKS.map(fw=>{
            const sel = (govForm.selectedFrameworks||[]).includes(fw);
            return (
              <div key={fw} onClick={()=>toggleFW(fw)}
                style={{ cursor:"pointer", background:sel?T.accentSoft:T.surfaceB,
                  border:`1px solid ${sel?T.accent:T.border}`, borderRadius:8, padding:"12px",
                  textAlign:"center", transition:"all .2s" }}>
                <div style={{ fontSize:11, fontWeight:700, color:sel?T.cyan:T.textMid }}>{fw}</div>
              </div>
            );
          })}
        </Grid>
      </Card>

      {/* RACI Matrix */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:4 }}>RACI Matrix — AI Governance Responsibilities</div>
        <p style={{ fontSize:13, color:T.textMid, marginBottom:16 }}>Who is Responsible, Accountable, Consulted, and Informed for each governance activity.</p>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:700 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                <th style={{ textAlign:"left", padding:"8px 12px", color:T.textMid, minWidth:200 }}>Activity</th>
                {RACI_ROLES.map(r=><th key={r} style={{ textAlign:"center", padding:"8px 8px", color:T.textMid, fontSize:10 }}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {RACI.map((row,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"9px 12px", fontWeight:500 }}>{row[0]}</td>
                  {row.slice(1).map((cell,j)=>{
                    const [color,bg] = RACI_COLORS[cell]||[T.textMid,T.surfaceC];
                    return (
                      <td key={j} style={{ textAlign:"center", padding:"9px 8px" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:22, height:22, borderRadius:4, background:bg, color, fontWeight:800, fontSize:11 }}>
                          {cell}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Row gap={16} style={{ marginTop:12 }}>
          {Object.entries(RACI_COLORS).map(([k,[c,bg]])=>(
            <Row key={k} gap={6}>
              <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:18, height:18, borderRadius:3, background:bg, color:c, fontWeight:800, fontSize:10 }}>{k}</span>
              <span style={{ fontSize:11, color:T.textMid }}>
                {k==="R"?"Responsible":k==="A"?"Accountable":k==="C"?"Consulted":"Informed"}
              </span>
            </Row>
          ))}
        </Row>
      </Card>

      {/* Ownership */}
      <Card>
        <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:16 }}>Policy Ownership</div>
        <Grid cols={3} gap={14}>
          {[["Policy Owner","policyOwner"],["Technical Owner","techOwner"],["Business Owner","bizOwner"],["Risk Owner","riskOwner"],["Security Owner","secOwner"],["AI Governance Owner","govOwner"]].map(([lbl,key])=>(
            <FormField key={key} label={lbl}>
              <Input value={govForm[key]||""} onChange={v=>updateGov(key,v)} placeholder="Name or team"/>
            </FormField>
          ))}
        </Grid>
      </Card>
    </Col>
  );
}

// ─── Policy Document ──────────────────────────────────────────────────────────
function PolicyTab({ data }) {
  const [generating, setGenerating] = useState(false);
  const [doc, setDoc] = useState("");

  const generate = async () => {
    setGenerating(true); setDoc("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1000,
          system:"You are an expert enterprise AI Governance architect. Generate a concise, well-structured Model Routing Policy document. Use clear headings. Include: Executive Summary, Purpose & Scope, Approved Model Registry summary, Model Tier Definitions, Routing Matrix, Data & Risk Controls, Cost Guardrails, Evaluation Requirements, Escalation Policy, Governance Roles & RACI, Exception Management, Monitoring & Observability, Change Management, Framework Alignment, and Review Schedule. Reference specific governance methods and frameworks where applicable.",
          messages:[{ role:"user", content:`Generate an enterprise AI Model Routing Policy based on this configuration:\n\nModels: ${JSON.stringify((data.models||[]).map(m=>({name:m.name,provider:m.provider,type:m.type})))}\n\nTasks: ${JSON.stringify((data.tasks||[]).map(t=>({name:t.name,unit:t.unit,criticality:t.criticality})))}\n\nRouting Rules: ${JSON.stringify(data.rules||[])}\n\nGovernance: ${JSON.stringify(data.governance||{})}\n\nFrameworks: ${JSON.stringify((data.governance?.selectedFrameworks)||[])}\n\nGovernance Methods Active: ${(data.govMethods||[]).length} of ${GOV_METHODS.length}\n\nEvaluation Thresholds: ${JSON.stringify(data.evalThresholds||{})}` }]
        })
      });
      const d = await res.json();
      setDoc(d.content?.map(b=>b.text||"").join("")||"Generation failed.");
    } catch { setDoc("Error connecting to API."); }
    setGenerating(false);
  };

  const MATRIX = [
    { task:"Sentiment Analysis",        complexity:"Low",    risk:"Low",      tier:1, review:"No",        cost:"£0.01" },
    { task:"Document Classification",   complexity:"Low",    risk:"Medium",   tier:1, review:"No",        cost:"£0.02" },
    { task:"Enterprise RAG",            complexity:"Medium", risk:"Medium",   tier:2, review:"Conditional",cost:"£0.10" },
    { task:"Contract Analysis",         complexity:"High",   risk:"High",     tier:3, review:"Yes",       cost:"£1.00" },
    { task:"Fraud Investigation",       complexity:"High",   risk:"Critical", tier:3, review:"Yes",       cost:"£2.00" },
    { task:"Autonomous Agent",          complexity:"High",   risk:"Critical", tier:4, review:"Mandatory", cost:"£5.00" },
    ...(data.tasks||[]).map(t=>({
      task:t.name, complexity:t.criticality||"Medium", risk:t.criticality||"Medium",
      tier:(data.rules||[]).find(r=>r.task===t.name)?parseInt((data.rules||[]).find(r=>r.task===t.name).tier):2,
      review:t.humanReview||"Conditional", cost:"—"
    }))
  ];

  return (
    <Col gap={20}>
      <SectionHead title="Generated Routing Policy"
        sub="Generate a complete enterprise AI Model Routing Policy document. Review before publishing."
        action={<Btn variant="success" onClick={generate} disabled={generating}>{generating?"Generating…":"Generate Policy Document"}</Btn>} />

      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Routing Matrix</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {["Task","Complexity","Risk","Tier","Human Review","Cost Limit"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:T.textMid }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((r,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"9px 10px", fontWeight:600 }}>{r.task}</td>
                  <td style={{ padding:"9px 10px" }}><RiskBadge risk={r.complexity}/></td>
                  <td style={{ padding:"9px 10px" }}><RiskBadge risk={r.risk}/></td>
                  <td style={{ padding:"9px 10px" }}><TierChip tier={r.tier}/></td>
                  <td style={{ padding:"9px 10px" }}>
                    <Badge label={r.review} color={r.review==="Mandatory"?T.red:r.review==="Yes"?T.amber:T.textMid}/>
                  </td>
                  <td style={{ padding:"9px 10px", color:T.cyan, fontWeight:600 }}>{r.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {doc && (
        <Card>
          <Row gap={10} style={{ marginBottom:16, justifyContent:"space-between" }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Policy Document</div>
            <Badge label="AI Generated · Requires human review before publishing" color={T.amber}/>
          </Row>
          <div style={{ fontSize:13, color:T.text, lineHeight:1.8, whiteSpace:"pre-wrap", maxHeight:520, overflowY:"auto", padding:"0 4px" }}>
            {doc}
          </div>
        </Card>
      )}

      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Executive Summary</div>
        <Grid cols={3} gap={12}>
          <MetricCard label="Approved Models"      value={(data.models||[]).length||"8"}  sub="Registered in registry" color={T.accent}/>
          <MetricCard label="Active Tiers"          value="4"                               sub="Low Cost → Agentic"    color={T.green}/>
          <MetricCard label="Workload Classes"      value={(data.tasks||[]).length||"36"}  sub="Classified"            color={T.purple}/>
          <MetricCard label="Routing Rules"         value={(data.rules||[]).length||"64"}  sub="Active policy rules"   color={T.cyan}/>
          <MetricCard label="Premium Model Usage"   value="12%"                            sub="Target: <20%"          color={T.amber}/>
          <MetricCard label="Policy Compliance"     value="96%"                            sub="Routing efficiency"    color={T.green}/>
        </Grid>
        <Divider/>
        <div style={{ fontSize:13, color:T.textMid, lineHeight:1.8, fontStyle:"italic" }}>
          Model selection is a procurement decision.<br/>
          Model routing is an operating architecture decision.<br/>
          This tool connects both.
        </div>
      </Card>
    </Col>
  );
}

// ─── Monitoring ───────────────────────────────────────────────────────────────
function MonitoringTab({ data }) {
  const govScore = Math.min(100, 40 + Math.round(((data.govMethods||[]).length/GOV_METHODS.length)*35) + ((data.rules||[]).length>3?10:0) + ((data.models||[]).length>2?5:0) + (data.governance?.policyOwner?10:0));

  const LOGS = [
    { id:"REQ-1001", task:"Sentiment Analysis", model:"GPT-3.5-Turbo", tier:1, tokens:2340, cost:"£0.001", latency:"178ms", result:"Pass",         ts:"09:41:02" },
    { id:"REQ-1002", task:"Contract Analysis",  model:"GPT-4o",         tier:3, tokens:18400,cost:"£0.82",  latency:"3.2s",  result:"Human Review", ts:"09:41:18" },
    { id:"REQ-1003", task:"Enterprise RAG",     model:"Claude Sonnet",  tier:2, tokens:6200, cost:"£0.09",  latency:"1.1s",  result:"Pass",         ts:"09:41:35" },
    { id:"REQ-1004", task:"Doc Classification", model:"GPT-3.5-Turbo", tier:1, tokens:1800, cost:"£0.001", latency:"142ms", result:"Escalated→T2", ts:"09:41:52" },
    { id:"REQ-1005", task:"Code Generation",    model:"Claude Sonnet",  tier:3, tokens:12000,cost:"£0.31",  latency:"2.8s",  result:"Pass",         ts:"09:42:10" },
  ];

  return (
    <Col gap={20}>
      <SectionHead title="Runtime Monitoring & Observability"
        sub="Every routing decision is logged with full traceability for governance, audit, and policy review." />

      <Grid cols={4} gap={14}>
        <MetricCard label="Routing Efficiency"  value={`${govScore}/100`}  sub="Governance posture"       color={govScore>75?T.green:T.amber}/>
        <MetricCard label="Requests Today"      value="14,832"              sub="Across all tiers"         color={T.accent}/>
        <MetricCard label="Escalations"         value="48"                  sub="Auto-escalated"           color={T.amber}/>
        <MetricCard label="Policy Violations"   value="3"                   sub="Requires review"          color={T.red}/>
      </Grid>

      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Governance Posture Score</div>
        <Row gap={16} style={{ marginBottom:10 }}>
          <div style={{ flex:1 }}><ProgressBar value={govScore} max={100} color={govScore>75?T.green:T.amber}/></div>
          <span style={{ fontSize:22, fontWeight:800, color:govScore>75?T.green:T.amber, minWidth:64 }}>{govScore}/100</span>
        </Row>
        <Grid cols={3} gap={10}>
          {[
            ["Governance Methods", `${(data.govMethods||[]).length}/${GOV_METHODS.length}`, (data.govMethods||[]).length>15?T.green:T.amber],
            ["Routing Rules",     `${(data.rules||[]).length} active`,  (data.rules||[]).length>0?T.green:T.red],
            ["Models Registered", `${(data.models||[]).length} models`, (data.models||[]).length>0?T.green:T.red],
            ["Policy Owner Set",  data.governance?.policyOwner?"Yes":"Missing", data.governance?.policyOwner?T.green:T.red],
            ["Framework Aligned", `${(data.governance?.selectedFrameworks||[]).length} frameworks`, (data.governance?.selectedFrameworks||[]).length>2?T.green:T.amber],
            ["Premium Usage",     "12%", T.green],
          ].map(([lbl,val,col])=>(
            <Card key={lbl} style={{ background:T.surfaceB, padding:"12px 14px" }}>
              <Row gap={8}>
                <Dot color={col} size={8}/>
                <div>
                  <div style={{ fontSize:11, color:T.textMid }}>{lbl}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:col }}>{val}</div>
                </div>
              </Row>
            </Card>
          ))}
        </Grid>
      </Card>

      <Card>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Routing Decision Log</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {["Request ID","Task","Model","Tier","Tokens","Cost","Latency","Result","Timestamp"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:T.textMid }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOGS.map((l,i)=>(
                <tr key={l.id} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"transparent":"#ffffff04" }}>
                  <td style={{ padding:"8px 10px", fontFamily:"monospace", color:T.textDim, fontSize:11 }}>{l.id}</td>
                  <td style={{ padding:"8px 10px" }}>{l.task}</td>
                  <td style={{ padding:"8px 10px", color:T.textMid }}>{l.model}</td>
                  <td style={{ padding:"8px 10px" }}><TierChip tier={l.tier}/></td>
                  <td style={{ padding:"8px 10px" }}>{l.tokens.toLocaleString()}</td>
                  <td style={{ padding:"8px 10px", color:T.green }}>{l.cost}</td>
                  <td style={{ padding:"8px 10px", color:T.textMid }}>{l.latency}</td>
                  <td style={{ padding:"8px 10px" }}>
                    <Badge label={l.result}
                      color={l.result.includes("Escalat")?T.amber:l.result.includes("Human")?T.accent:T.green}/>
                  </td>
                  <td style={{ padding:"8px 10px", color:T.textDim, fontFamily:"monospace", fontSize:11 }}>{l.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Col>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ data, setActiveTab }) {
  const govScore = Math.min(100, 40+Math.round(((data.govMethods||[]).length/GOV_METHODS.length)*35)+((data.rules||[]).length>3?10:0)+((data.models||[]).length>2?5:0)+(data.governance?.policyOwner?10:0));

  const ARCH_NODES = [
    { label:"User / Application",       color:T.text },
    { label:"API Gateway",              color:T.cyan },
    { label:"AI Gateway",               color:T.accent },
    { label:"Policy Engine",            color:T.purple },
    { label:"Task + Risk Classifier",   color:T.amber },
    { label:"Routing Engine",           color:T.accent },
    { label:"Cost + Security Guardrail",color:T.green },
    { label:"Approved Model Registry",  color:T.text },
  ];
  const TIER_NODES = [
    { tier:1, label:"Low-cost model",    color:T.t1 },
    { tier:2, label:"General model",     color:T.t2 },
    { tier:3, label:"Reasoning model",   color:T.t3 },
    { tier:4, label:"Agent / Specialist",color:T.t4 },
  ];
  const POST_NODES = [
    { label:"Model Response",    color:T.text },
    { label:"Evaluation",        color:T.green },
    { label:"Safety + Grounding",color:T.purple },
    { label:"Human Review",      color:T.amber },
    { label:"Application",       color:T.text },
  ];

  const steps_done = [
    (data.models||[]).length>0,
    (data.tasks||[]).length>0,
    Object.keys(data.riskMap||{}).length>0,
    true,
    (data.rules||[]).length>0,
    !!data.governance?.policyOwner,
    !!(data.evalThresholds),
  ];

  return (
    <Col gap={24}>
      <Card style={{ background:"#050A14", border:`2px solid ${T.accent}55`, padding:32 }} glow>
        <div style={{ fontSize:19, fontWeight:800, color:T.text, lineHeight:1.4, marginBottom:12 }}>
          Approved models tell the organisation what it is <span style={{ color:T.cyan }}>allowed to use</span>.<br/>
          Model routing tells the organisation what should <span style={{ color:T.cyan }}>run where, when and why</span>.
        </div>
        <p style={{ fontSize:13, color:T.textMid, margin:0, lineHeight:1.7 }}>
          The most capable model should not automatically become the default model.<br/>
          Route every workload to the lowest-cost model that meets its quality, security, risk and business requirements.
        </p>
      </Card>

      <Grid cols={4} gap={14}>
        <MetricCard label="Approved Models"    value={(data.models||[]).length||"0"} sub="In registry"      color={T.accent}/>
        <MetricCard label="Workload Classes"   value={(data.tasks||[]).length||"0"}  sub="Classified"       color={T.green}/>
        <MetricCard label="Routing Rules"      value={(data.rules||[]).length||"0"}  sub="Active"           color={T.purple}/>
        <MetricCard label="Gov. Posture"       value={`${govScore}/100`}             sub="Governance score" color={govScore>75?T.green:T.amber}/>
      </Grid>

      <Grid cols={2} gap={16}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Configuration Progress</div>
          <Col gap={10}>
            {[
              ["Register Approved Models","models"],
              ["Classify AI Workloads","tasks"],
              ["Assign Data & Risk Ratings","risk"],
              ["Configure Model Tiers","tiers"],
              ["Build Routing Rules","routing"],
              ["Assign Governance Owners","governance"],
              ["Set Evaluation Thresholds","evaluation"],
            ].map(([label,tab],i)=>(
              <div key={label} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0,
                  background:steps_done[i]?T.green:T.surfaceC,
                  border:`2px solid ${steps_done[i]?T.green:T.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, color:steps_done[i]?T.bg:T.textDim }}>
                  {steps_done[i]?"✓":""}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:steps_done[i]?T.text:T.textMid }}>{label}</div>
                  {!steps_done[i] && <div style={{ fontSize:11, color:T.textDim }}>Click {tab} tab to configure</div>}
                </div>
                {!steps_done[i] && (
                  <Btn variant="ghost" size="sm" onClick={()=>setActiveTab(tab)} style={{ marginLeft:"auto" }}>Configure</Btn>
                )}
              </div>
            ))}
          </Col>
        </Card>

        {/* Mini Architecture */}
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>AI Gateway Architecture</div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
            {ARCH_NODES.map((n,i)=>(
              <div key={n.label} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                {i>0 && <div style={{ width:1, height:10, background:T.borderHi }}/>}
                <div style={{ background:T.surfaceB, border:`1px solid ${n.color}44`,
                  borderRadius:5, padding:"5px 14px", fontSize:10.5, fontWeight:600,
                  color:n.color, whiteSpace:"nowrap" }}>{n.label}</div>
              </div>
            ))}
            <div style={{ width:1, height:10, background:T.borderHi }}/>
            <div style={{ display:"flex", gap:6 }}>
              {TIER_NODES.map(n=>(
                <div key={n.tier} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:1, height:10, background:n.color }}/>
                  <div style={{ background:n.color+"22", border:`1px solid ${n.color}55`,
                    borderRadius:5, padding:"5px 8px", fontSize:9.5, fontWeight:700,
                    color:n.color, textAlign:"center" }}>T{n.tier}<br/>{n.label}</div>
                </div>
              ))}
            </div>
            <div style={{ width:1, height:10, background:T.borderHi }}/>
            {POST_NODES.map((n,i)=>(
              <div key={n.label} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                {i>0 && <div style={{ width:1, height:8, background:T.borderHi }}/>}
                <div style={{ background:T.surfaceB, border:`1px solid ${n.color}33`,
                  borderRadius:5, padding:"4px 12px", fontSize:10, fontWeight:600,
                  color:n.color, whiteSpace:"nowrap" }}>{n.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      <Card style={{ background:T.surfaceB }}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Active Governance Methods</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {(data.govMethods||[]).map(id=>{
            const m = GOV_METHODS.find(g=>g.id===id);
            return m?<Badge key={id} label={m.name} color={T.green}/>:null;
          })}
          {(data.govMethods||[]).length===0 && <span style={{ fontSize:13, color:T.textDim }}>No governance methods selected yet — configure in the Governance tab.</span>}
        </div>
      </Card>
    </Col>
  );
}

// ─── Evaluation Gates ─────────────────────────────────────────────────────────
function EvaluationTab({ data, setData }) {
  const defaults = { accuracy:95, groundedness:95, hallucination:5, safety:99, schemaCompliance:99, humanAcceptance:90, latencyP95:2000 };
  const [thresholds, setThresholds] = useState(data.evalThresholds||defaults);

  const update = (k,v) => {
    const next = {...thresholds,[k]:parseFloat(v)};
    setThresholds(next);
    setData(d=>({...d,evalThresholds:next}));
  };

  const METRICS = [
    { k:"accuracy",         label:"Accuracy",             unit:"%", min:0, max:100, color:T.green,  desc:"Minimum task accuracy for routing eligibility" },
    { k:"groundedness",     label:"Groundedness",         unit:"%", min:0, max:100, color:T.accent, desc:"Minimum factual grounding score (RAG / retrieval tasks)" },
    { k:"hallucination",    label:"Max Hallucination",    unit:"%", min:0, max:30,  color:T.red,    desc:"Maximum acceptable hallucination rate — lower is better" },
    { k:"safety",           label:"Safety Score",         unit:"%", min:0, max:100, color:T.amber,  desc:"Minimum safety evaluation score from safety classifier" },
    { k:"schemaCompliance", label:"Schema Compliance",    unit:"%", min:0, max:100, color:T.purple, desc:"Structured output compliance for API / tool-use tasks" },
    { k:"humanAcceptance",  label:"Human Acceptance",     unit:"%", min:0, max:100, color:T.cyan,   desc:"Rate of human reviewer acceptance during evaluation" },
    { k:"latencyP95",       label:"P95 Latency",          unit:"ms",min:100,max:30000, color:T.amber,desc:"Maximum P95 latency in milliseconds" },
  ];

  return (
    <Col gap={20}>
      <SectionHead title="Evaluation Gates"
        sub="A model should not move into a routing tier based on price alone. Set minimum evaluation thresholds that must pass before a model becomes eligible for automatic routing." />

      <Card style={{ background:T.amberSoft, border:`1px solid ${T.amber}44` }}>
        <p style={{ margin:0, fontSize:13, color:T.amber, fontWeight:600, lineHeight:1.6 }}>
          Only models passing all policy thresholds become eligible for automatic routing.<br/>
          Evaluation gates apply in CI/CD pipelines before deployment and during periodic governance reviews.
        </p>
      </Card>

      <Grid cols={2} gap={16}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Evaluation Thresholds</div>
          <Col gap={18}>
            {METRICS.map(m=>(
              <div key={m.k}>
                <Row gap={0} style={{ justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, fontWeight:700 }}>{m.label}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:m.color }}>{thresholds[m.k]}{m.unit}</span>
                </Row>
                <input type="range" min={m.min} max={m.max} step={m.k==="latencyP95"?100:1}
                  value={thresholds[m.k]} onChange={e=>update(m.k,e.target.value)}
                  style={{ width:"100%", accentColor:m.color }}/>
                <div style={{ fontSize:11, color:T.textDim, marginTop:2 }}>{m.desc}</div>
              </div>
            ))}
          </Col>
        </Card>

        <Col gap={16}>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Evaluation Framework</div>
            <Col gap={8}>
              {[
                { tool:"LangSmith",             use:"Tracing, eval datasets, prompt versioning", color:T.green },
                { tool:"Ragas",                 use:"Faithfulness, groundedness, context precision", color:T.amber },
                { tool:"Arize Phoenix",         use:"Online evals, drift detection, observability", color:T.gold },
                { tool:"MLflow",                use:"Experiment tracking, model registry", color:T.red },
                { tool:"Azure Foundry Eval",    use:"Safety, grounding, content evaluation", color:T.cyan },
                { tool:"IBM watsonx.governance",use:"Governance, compliance, factsheets", color:T.accent },
              ].map(t=>(
                <Row key={t.tool} gap={10} align="flex-start">
                  <Dot color={t.color} size={8} style={{ marginTop:3 }}/>
                  <div>
                    <span style={{ fontSize:12, fontWeight:700, color:t.color }}>{t.tool}</span>
                    <span style={{ fontSize:12, color:T.textMid }}> — {t.use}</span>
                  </div>
                </Row>
              ))}
            </Col>
          </Card>

          <Card>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Evaluation Gates in CI/CD</div>
            <Col gap={8}>
              {[
                ["1. Run golden dataset evals",     T.accent],
                ["2. Check all thresholds pass",    T.green],
                ["3. Human review of edge cases",   T.amber],
                ["4. Security red team sign-off",   T.red],
                ["5. Governance gate approval",     T.purple],
                ["6. Deploy to approved registry",  T.green],
              ].map(([step,color])=>(
                <Row key={step} gap={10}>
                  <Dot color={color} size={7}/>
                  <span style={{ fontSize:12, color:T.textMid }}>{step}</span>
                </Row>
              ))}
            </Col>
          </Card>
        </Col>
      </Grid>
    </Col>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const NAV = [
  { id:"strategy",     label:"AI Strategy",     icon:"◈" },
  { id:"usecases",     label:"AI Use Cases",     icon:"◉" },
  { id:"portfolio",    label:"AI Portfolio",     icon:"◫" },
  { id:"models_nav",   label:"Approved Models",  icon:"◈" },
  { id:"routing",      label:"Model Routing",    icon:"⇄", active:true },
  { id:"architecture", label:"AI Architecture",  icon:"⬡" },
  { id:"governance_nav",label:"AI Governance",   icon:"⊛" },
  { id:"risk_nav",     label:"AI Risk",          icon:"⚠" },
  { id:"evaluation_nav",label:"AI Evaluation",   icon:"✓" },
  { id:"finops",       label:"AI FinOps",        icon:"£" },
  { id:"agents",       label:"AI Agents",        icon:"⟳" },
  { id:"roadmap",      label:"Roadmap",          icon:"→" },
  { id:"reports",      label:"Reports",          icon:"⊟" },
];

const TABS = [
  { id:"overview",    label:"Overview" },
  { id:"models",      label:"Models" },
  { id:"tasks",       label:"Task Classes" },
  { id:"tiers",       label:"Model Tiers" },
  { id:"routing",     label:"Routing Rules" },
  { id:"cost",        label:"Cost Simulator" },
  { id:"evaluation",  label:"Evaluation" },
  { id:"governance",  label:"Governance" },
  { id:"policy",      label:"Policy Document" },
  { id:"monitoring",  label:"Monitoring" },
  { id:"advisor",     label:"AI Advisor" },
];

const DEFAULT_TIERS = [
  { id:1, color:T.t1, label:"Tier 1 · Low Cost",     suits:["Classification","Tagging","Sentiment","Simple extraction","Formatting","Basic summarisation"],  chars:["Low cost","Low latency","High throughput","Limited reasoning"] },
  { id:2, color:T.t2, label:"Tier 2 · General",       suits:["Enterprise search","RAG","Summarisation","Content generation","Customer support","Knowledge assistants"], chars:["Moderate cost","Moderate reasoning","General enterprise workloads"] },
  { id:3, color:T.t3, label:"Tier 3 · Reasoning",     suits:["Complex analysis","Multi-doc reasoning","Planning","Technical investigation","Code reasoning","Financial reasoning"], chars:["Higher cost","Higher reasoning","Use only when justified"] },
  { id:4, color:T.t4, label:"Tier 4 · Agentic",       suits:["Autonomous workflows","Multi-agent","Tool execution","Complex planning","High-impact workflows"], chars:["Strictest controls","Runtime monitoring","Human approval","Tool-level permissions"] },
];

function TiersTab({ data, setData }) {
  const tiers = data.tiers||DEFAULT_TIERS;
  const models = data.models||[];

  const assign = (tierId, modelName) => {
    const next = tiers.map(t=>t.id===tierId?{...t,assignedModel:modelName}:t);
    setData(d=>({...d,tiers:next}));
  };

  return (
    <Col gap={20}>
      <SectionHead title="Model Tier Configuration"
        sub="Define cost and capability tiers. Assign approved models to each tier. Routing rules reference tiers, not individual models — enabling model substitution without changing routing logic." />
      <Card style={{ background:T.greenSoft, border:`1px solid ${T.green}44` }}>
        <p style={{ margin:0, fontSize:13, color:T.green, fontWeight:600, lineHeight:1.6 }}>
          The most capable model should not automatically become the default model.<br/>
          Route every workload to the lowest-cost model that meets its quality, security, risk and business requirements.
        </p>
      </Card>
      <Grid cols={2} gap={16}>
        {tiers.map(tier=>(
          <Card key={tier.id} style={{ borderLeft:`3px solid ${tier.color}` }}>
            <TierChip tier={tier.id}/>
            <div style={{ marginTop:12 }}>
              <Label>Suitable for</Label>
              <Row gap={5}>{tier.suits.map(s=><Badge key={s} label={s} color={tier.color}/>)}</Row>
            </div>
            <div style={{ marginTop:12 }}>
              <Label>Characteristics</Label>
              {tier.chars.map(c=><div key={c} style={{ fontSize:12, color:T.textMid, marginBottom:2 }}>· {c}</div>)}
            </div>
            {models.length>0 && (
              <div style={{ marginTop:14 }}>
                <FormField label="Assigned Primary Model">
                  <Select value={tier.assignedModel||""} onChange={v=>assign(tier.id,v)}
                    options={models.map(m=>`${m.name} (${m.provider})`)}/>
                </FormField>
              </div>
            )}
          </Card>
        ))}
      </Grid>
    </Col>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("routing");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [data, setData] = useState({ models:[], tasks:[], rules:[], riskMap:{}, governance:{}, tiers:DEFAULT_TIERS, govMethods:[] });

  const renderTab = () => {
    switch(activeTab) {
      case "overview":    return <OverviewTab    data={data} setActiveTab={setActiveTab}/>;
      case "models":      return <ModelsTab      data={data} setData={setData}/>;
      case "tasks":       return <TasksTab       data={data} setData={setData}/>;
      case "tiers":       return <TiersTab       data={data} setData={setData}/>;
      case "routing":     return <RoutingTab     data={data} setData={setData}/>;
      case "cost":        return <CostTab        data={data}/>;
      case "evaluation":  return <EvaluationTab  data={data} setData={setData}/>;
      case "governance":  return <GovernanceTab  data={data} setData={setData}/>;
      case "policy":      return <PolicyTab      data={data}/>;
      case "monitoring":  return <MonitoringTab  data={data}/>;
      case "advisor":     return <AIAdvisor context={{ models:(data.models||[]).length, tasks:(data.tasks||[]).length, rules:data.rules, governance:data.governance, govMethods:data.govMethods, evalThresholds:data.evalThresholds }}/>;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif", fontSize:14, display:"flex" }}>
      {/* Sidebar */}
      <div style={{ width:230, minHeight:"100vh", background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"20px 16px 14px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:13, fontWeight:800, color:T.text, letterSpacing:"-0.01em" }}>AI Strategy Tool</div>
          <div style={{ fontSize:10, color:T.textMid, marginTop:3 }}>Enterprise AI Governance Platform</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 8px" }}>
          <div style={{ fontSize:10, color:T.textDim, padding:"8px 8px 4px", fontWeight:700, letterSpacing:"0.06em" }}>Platform</div>
          {NAV.map(item=>(
            <div key={item.id} onClick={()=>setActiveNav(item.id)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px", borderRadius:6,
                cursor:"pointer", fontSize:13, marginBottom:1,
                color:activeNav===item.id?T.text:T.textMid,
                background:activeNav===item.id?T.surfaceC:"transparent",
                border:activeNav===item.id?`1px solid ${T.border}`:"1px solid transparent" }}>
              <span style={{ fontSize:12, width:16, textAlign:"center" }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id==="routing" && <Badge label="Active" color={T.green} style={{ marginLeft:"auto" }}/>}
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10, color:T.textDim }}>Routing Policy v1.0 · Draft</div>
          <ProgressBar value={(data.govMethods||[]).length} max={GOV_METHODS.length} color={T.accent}/>
          <div style={{ fontSize:10, color:T.textDim, marginTop:3 }}>{(data.govMethods||[]).length}/{GOV_METHODS.length} governance methods</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.surface }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.01em" }}>
              {activeNav==="routing"?"Model Routing Policy":NAV.find(n=>n.id===activeNav)?.label||"AI Strategy Tool"}
            </div>
            <div style={{ fontSize:11, color:T.textMid, marginTop:2 }}>AI Strategy Tool · Enterprise Feature</div>
          </div>
          <Row gap={8}>
            <Badge label={`${(data.models||[]).length} Models`} color={T.accent}/>
            <Badge label={`${(data.rules||[]).length} Rules`} color={T.green}/>
            <Badge label={`${(data.govMethods||[]).length} Gov Methods`} color={T.purple}/>
            <Badge label="Draft" color={T.amber}/>
            <Btn variant="ghost" size="sm" onClick={()=>setShowAdvisor(!showAdvisor)}>
              {showAdvisor?"Hide Advisor":"AI Advisor"}
            </Btn>
          </Row>
        </div>

        {/* Tabs (only for routing nav) */}
        {activeNav==="routing" && (
          <div style={{ display:"flex", padding:"0 24px", background:T.surface, borderBottom:`1px solid ${T.border}`, flexWrap:"wrap", gap:0, overflowX:"auto" }}>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{ padding:"9px 16px", background:"transparent", border:"none",
                  borderBottom:activeTab===tab.id?`2px solid ${T.accent}`:"2px solid transparent",
                  cursor:"pointer", fontSize:13, fontWeight:activeTab===tab.id?700:400,
                  color:activeTab===tab.id?T.text:T.textMid, whiteSpace:"nowrap",
                  display:"inline-flex", alignItems:"center", gap:6 }}>
                {tab.label}
                {tab.id==="advisor" && <Badge label="Claude" color={T.purple}/>}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
          {activeNav!=="routing" ? (
            <Card style={{ textAlign:"center", padding:60 }}>
              <div style={{ fontSize:40, marginBottom:16, color:T.textDim }}>{NAV.find(n=>n.id===activeNav)?.icon}</div>
              <div style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:8 }}>{NAV.find(n=>n.id===activeNav)?.label}</div>
              <div style={{ color:T.textMid, fontSize:13 }}>Select <strong>Model Routing</strong> in the navigation to configure your AI model routing policy.</div>
            </Card>
          ) : (
            <Col gap={20}>
              {showAdvisor && activeTab!=="advisor" && (
                <AIAdvisor mini context={{ models:(data.models||[]).length, tasks:(data.tasks||[]).length, rules:data.rules, governance:data.governance, govMethods:data.govMethods }}/>
              )}
              {renderTab()}
            </Col>
          )}
        </div>
      </div>
    </div>
  );
}
