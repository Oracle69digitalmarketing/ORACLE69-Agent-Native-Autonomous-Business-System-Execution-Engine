import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      throw new Error("GEMINI_API_KEY is not configured or is a placeholder.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Lazy-initialization of Groq API client
let groqClient: Groq | null = null;
function getGroqClient(): Groq {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key || key.includes("MY_GROQ_API_KEY") || key === "") {
      throw new Error("GROQ_API_KEY is not configured or is a placeholder.");
    }
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

// Highly robust generator helper that implements model fallbacks and exponential retry loops
async function generateContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<{ text: string }> {
  // Models to try in sequence if one experiences capacity constraints or service outages.
  // We prioritize gemini-3.1-flash-lite and gemini-flash-latest as they are highly stable interfaces under sandbox loads.
  const models = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    const retries = 2; // 2 attempts per model
    const delayMs = 1500;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Executing generateContent on model: ${model} (Attempt ${attempt}/${retries})`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config
        });
        
        if (response && response.text) {
          return { text: response.text };
        }
        throw new Error("Empty text response returned from Gemini client.");
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        
        // Match standard model-unavailable and rate-limiting signals
        const isTransient = 
          errMsg.includes("503") || 
          errMsg.includes("UNAVAILABLE") || 
          errMsg.includes("demand") || 
          errMsg.includes("429") || 
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("overloaded");

        console.log(`Model ${model} (attempt ${attempt}/${retries}) transient pressure: ${errMsg}`);

        if (attempt < retries && isTransient) {
          const jitter = Math.random() * 300;
          const waitTime = (delayMs * attempt) + jitter;
          console.log(`Retrying Model ${model} in ${Math.round(waitTime)}ms after transient load response.`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Try next model fallback
          break;
        }
      }
    }
  }

  throw lastError || new Error("All model fallback attempts failed.");
}

// Groq direct completion generator with Llama model cascades
async function generateWithGroq(prompt: string, config?: any): Promise<{ text: string }> {
  const groq = getGroqClient();
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`Executing Groq completions on model: ${model}`);
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a professional business intelligence and systems automation agent. Always output strict valid JSON matching the requested schema. Do not write introductory words or conversational greetings. Do not wrap code in markdown delimiters. Output pure valid parsable JSON blocks." 
          },
          { role: "user", content: prompt }
        ],
        model: model,
        response_format: config?.responseMimeType === "application/json" ? { type: "json_object" } : undefined,
        temperature: config?.temperature ?? 0.7,
      });

      const responseText = chatCompletion.choices[0]?.message?.content;
      if (responseText) {
        return { text: responseText };
      }
      throw new Error("Empty text response returned from Groq client.");
    } catch (err: any) {
      lastError = err;
      console.error(`Groq Model ${model} execution pressure:`, err?.message || String(err));
    }
  }
  throw lastError || new Error("All Groq fallback models failed.");
}

// Resilient unified generation engine coordinating both Gemini and Groq seamlessly
async function generateUnifiedAI(
  prompt: string,
  config?: any,
  preferredProvider?: string
): Promise<{ text: string; source: string }> {
  const provider = preferredProvider?.toLowerCase() || "gemini";
  
  if (provider === "groq") {
    try {
       console.log("Unified AI Engine: Attempting Groq Completion...");
       const res = await generateWithGroq(prompt, config);
       return { text: res.text, source: "Groq (Llama-3.3)" };
    } catch (groqErr: any) {
       console.warn("Groq Completion failed or key unconfigured, falling back to Gemini:", groqErr?.message || groqErr);
       try {
         const ai = getGeminiClient();
         const res = await generateContentWithFallback(ai, prompt, config);
         return { text: res.text, source: "Gemini AI (Groq Failover)" };
       } catch (geminiErr: any) {
         throw new Error(`Both Groq & Gemini AI failed. Groq: ${groqErr?.message}. Gemini: ${geminiErr?.message}`);
       }
    }
  } else {
    // Default to Gemini
    try {
       console.log("Unified AI Engine: Attempting Gemini Completion...");
       const ai = getGeminiClient();
       const res = await generateContentWithFallback(ai, prompt, config);
       return { text: res.text, source: "Gemini AI" };
    } catch (geminiErr: any) {
       console.warn("Gemini Completion failed, checking as fallback to Groq...");
       try {
         const res = await generateWithGroq(prompt, config);
         return { text: res.text, source: "Groq Llama-3.3 (Gemini Failover)" };
       } catch (groqErr: any) {
         throw new Error(`Both Gemini & Groq AI failed. Gemini: ${geminiErr?.message}. Groq: ${groqErr?.message}`);
       }
    }
  }
}

// Ensure the helper is fail-safe or falls back nicely to custom-curated, highly realistic mock data
const fallbackLeads = [
  {
    name: "Lagos Heights Academy",
    industry: "Schools",
    contactName: "Dr. Kunle Alao (Proprietor)",
    location: "Lekki, Lagos",
    signal: "Inoperable website. Operational reviews state: 'WhatsApp lines are silent, hard to confirm school fee receipts.' Only takes cash/direct transfers.",
    score: 88,
    inefficiency: "Manual school fee verification & spreadsheet receipts. Wastes ~12 hours/week tracking manual transfers.",
    system: "Oracle69 AutoThinker integrated with WhatsApp Receipt Verification Bot & Parents Portal.",
    outreach: "Hello Dr. Kunle, noticed Lagos Heights takes manual transfers for fee collection. Wasted time tracking confirmations usually costs high-performing schools over 10 hours a week. We engineered a WhatsApp confirmation bot that automates this. Would you be open to a 5-minute diagnostic walkthrough?",
    status: "Ready for review"
  },
  {
    name: "Apex Family Clinic",
    industry: "Clinics",
    contactName: "Dr. Amanda Ngozi",
    location: "Surulere, Lagos",
    signal: "Facebook comments complaining about 2-hour phone queues just to schedule checks. Website has simple static landing with no direct appointment system.",
    score: 94,
    inefficiency: "Fragmented tools. Booking is done over the phone or written in physical diaries, leading to 25% patient no-shows.",
    system: "Oracle69 Custom Patient Booking Workflow + WhatsApp Reminders Engine.",
    outreach: "Hi Dr. Amanda, parents waiting in Surulere deserve instant clinical callbacks. We observed Apex's patients complain about long booking delays. We build localized WhatsApp self-service schedulers that link to secure calendars. Saved over 15 hours of front-desk calls for similar community clinics. Mind if we send a 1-page design?",
    status: "Ready for review"
  },
  {
    name: "Zeta Logistics Hub",
    industry: "SMEs",
    contactName: "Chidi Okafor (COO)",
    location: "Ikeja, Lagos",
    signal: "Active hiring for 2 operations roles. Quora questions from the founders asking: 'best way to track delivery driver logs across Lagos without calling every hour.'",
    score: 82,
    inefficiency: "Communication gap. Dispatch riders share Excel status spreadsheets via WhatsApp at night, leading to client delivery dispute delays.",
    system: "Oracle69 harmonized driver dispatch pipeline & automatic client alerts.",
    outreach: "Hey Chidi, saw Zeta is hiring dispatch heads to manage logistics. Handling updates via spreadsheets is chaotic for delivery agents. We design fully offline-friendly delivery status routing sheets on WhatsApp. Could we share a quick sandbox proposal designed for logistics SMEs?",
    status: "Ready for review"
  },
  {
    name: "Oakwood Preschool",
    industry: "Schools",
    contactName: "Mrs. Evelyn Udoh",
    location: "Yaba, Lagos",
    signal: "No active social media, website is a Wix placeholder. Review sentiment states 'Lovely teachers, but getting billing notices on paper slips is messy.'",
    score: 79,
    inefficiency: "Manual billing notifications. Fee tracking takes ~8 hours/week paper processing.",
    system: "Oracle69 Smart School Assistant + parent billing automation.",
    outreach: "Hi Mrs. Evelyn, paper fee slips often get lost in school bags. We built Oakwood a custom automated SMS and WhatsApp ledger notice generator. Can we schedule a quick call to check feasibility?",
    status: "Ready for review"
  }
];

// 1. Lead Generation Loop
app.post("/api/agent/scout", async (req, res) => {
  const { market = "Lagos, Nigeria", targetIndustry = "Schools", source = "Google Maps Scout", provider } = req.body;
  try {
    const prompt = `You are the Lead Generation Loop agent for Oracle69 business intelligence engine.
Your purpose is to scan and discover 4 high-value, highly specific, and authentic prospective lead opportunities (schools, clinics, or SMEs) in ${market} targeting the ${targetIndustry} sector from ${source}.

To ensure professional analytical quality, follow these instructions strictly:
1. TARGET EXACT LOCAL REALITIES: Avoid generic boilerplate or abstract descriptions. Each lead MUST represent a realistic local establishment in suburbs of ${market}.
2. CRITICAL SIGNAL DIAGNOSTICS: Identify real-world inefficiencies (e.g. lack of automated payments verification, manual patient book-keeping, 2-hour WhatsApp callback queues).
3. SYSTEM RECOMMENDED SUITE: Suggest one clear target system: "Oracle69 AutoThinker integrated with WhatsApp Receipt Verification Bot", "Oracle69 Patient Scheduler Web Suite", "Oracle69 Logistics & Route Sync", or "Oracle69 Custom Automation Client Portal".
4. DIRECT OUTCOME-ORIENTED OUTREACH: Draft a professional, direct, 3-sentence outreach cold message that references their specific friction point directly, quantifies wasted admin hours (e.g., 8-15 hours/week), and propose a diagnostic walkthrough slot. Avoid marketing hype or flowery adjectives.
5. REALISTIC INEFFICIENCY METRICS: Detail the exact quantitative operational bottlenecks (manual reconciliations, lost billing slips, spreadsheet delays).

Generate the output exactly matching the JSON array structure below:
[
  {
    "name": "Specific Local Company Name",
    "industry": "${targetIndustry}",
    "contactName": "Realistic Decision Maker (e.g. Principal, Founder, MD)",
    "location": "Realistic suburb inside ${market}",
    "signal": "Concrete online signals observed (missing website booking, reviews complaining about WhatsApp delays, Quora posts, etc.)",
    "score": 85,
    "inefficiency": "Operational bottleneck description (e.g. Manual invoicing wasting 8h/week, paper records)",
    "system": "The suggested Oracle69 System (AutoThinker/SkillThinker/Harmonize EcoConnect/Custom Automation)",
    "outreach": "Targeted direct outreach pitch referencing their specific pain.",
    "status": "Ready for review"
  }
]`;

    const result = await generateUnifiedAI(prompt, {
      responseMimeType: "application/json",
      temperature: 0.7,
    }, provider);

    const parsedData = JSON.parse(result.text || "[]");
    return res.json({ success: true, leads: parsedData, source: result.source });
  } catch (error: any) {
    console.error("Scout error, entering fallback mode:", error?.message);
    const filteredFallback = fallbackLeads.filter(lead => 
      lead.industry.toLowerCase().includes(targetIndustry.toLowerCase().slice(0, -1)) || targetIndustry === "All"
    );
    const responseData = filteredFallback.length > 0 ? filteredFallback : fallbackLeads;
    return res.json({ 
      success: true, 
      leads: responseData.map(l => ({...l, location: `${l.location.split(',')[0]}, ${market.split(',')[0]}`})), 
      source: "Offline Deterministic Generation Rules",
      errorMsg: error?.message 
    });
  }
});

// 2. Sales Conversion Loop
app.post("/api/agent/proposal", async (req, res) => {
  const { lead, provider } = req.body;
  if (!lead) {
    return res.status(400).json({ error: "Missing lead payload" });
  }

  try {
    const prompt = `You are the Oracle69 Sales Conversion Loop agent.
Your objective is to convert the identified prospect into a paying system client by drafting a high-impact, outcome-based, professional business case proposal and custom ROI estimation.

Lead Profile:
- Business: ${lead.name}
- Inefficiency: ${lead.inefficiency}
- Location: ${lead.location}
- Score: ${lead.score}
- Oracle69 Proposed Product: ${lead.system}

Strict Professional Guidelines:
1. DIAGNOSE WITH HIGH FIDELITY: Unpack their specific operational pain point, calculating the exact manual hours wasted (such as 10-15 hours/week of admin time) and the manual error rate consequences (transcription errors, lost records, patient no-shows). Do not hallucinate or use boilerplate summaries.
2. DESIGN INTEGRITY: Provide a clear, detailed technical outline of how the proposed ${lead.system} works (e.g. custom Google Sheets triggers, Gemini OCR API receipt scanning nodes, localized WhatsApp routing sequences, unified parent calendars).
3. QUANTIFIABLE ROI ASSURANCE: Outline hard business outcomes rather than soft features (e.g., "Saves up to 12 weekly labor hours, increases callback speed by 75%, and reduces appointment no-shows by 30% inside the first month").
4. MILESTONE PRICING: Provide a realistic local commercial range in Naira (₦) suited to local market standards, formatted elegantly (e.g. "₦950,000 - ₦1,400,000" with milestone details).
5. PROFESSIONAL NURTURING: Create three highly tactical WhatsApp follow-up messages. They must be brief, professional, client-centric, and focused on setting up a 1-click sandbox walkthrough demo. No fluff.

Respond in exactly JSON format with the following keys:
{
  "problemStatement": "Unpack their operational bottleneck, counting manual hours wasted and error rate impact.",
  "proposedSystem": "Detailed design of their custom Oracle69 solution (automated flows, bots, forms).",
  "roiEstimate": "Save estimate (e.g., saves 10 hrs/week, boosts booking rates by 35% within 30 days).",
  "pricingRange": "Strategic pricing matching scope, e.g., ₦850,000 - ₦1,500,000 (milestone-linked).",
  "implementationOutline": [
    "Phase 1: Discovery & API Setup (Weeks 1-2)",
    "Phase 2: Automation Development & WhatsApp integration (Weeks 3-4)",
    "Phase 3: Deploy, Testing & User Training (Week 5)"
  ],
  "whatsappNurtureSequence": [
    "Nurture 1 text",
    "Nurture 2 text",
    "Nurture 3 text"
  ]
}`;

    const result = await generateUnifiedAI(prompt, {
      responseMimeType: "application/json",
      temperature: 0.6,
    }, provider);

    const parsedData = JSON.parse(result.text || "{}");
    return res.json({ success: true, proposal: parsedData, source: result.source });
  } catch (error: any) {
    console.error("Proposal error, utilizing default template:", error?.message);
    const mockProposal = {
      problemStatement: `You spend over 10-15 hours a week handling manual bookings, fee reconciliations, and tracking scattered payments via spreadsheets for ${lead.name}. Fragmented systems result in communication overhead, delayed notifications, and a high risk of manual error.`,
      proposedSystem: `Deployment of ${lead.system}. This features automated triggers built with Gumloop workflows, automated WhatsApp invoice reconciliation, interactive client scheduling dashboards, and unified digital ledgers.`,
      roiEstimate: "Saves up to 12 labor-hours per week, completely minimizes billing errors, and increases response velocities by 82%.",
      pricingRange: lead.industry === "Schools" ? "₦1,200,000 - ₦1,800,000 (30% upfront, 40% milestone, 30% delivery)" : "₦750,000 - ₦1,400,000",
      implementationOutline: [
        "Phase 1: Discovery & Mapping of Database Rules (Days 1-7)",
        "Phase 2: WhatsApp API Node setup & Gumloop agent triggers sandbox (Days 8-21)",
        "Phase 3: Live Pilot deployment, Admin training & operational transition (Days 22-30)"
      ],
      whatsappNurtureSequence: [
        `Hi ${lead.contactName || "Team"}, I'm following up on our proposal for ${lead.name}. We mapped out how the Oracle69 WhatsApp verification bot clears up 10 hours of manual lookup. Ready to review the live draft architecture?`,
        `Hi ${lead.contactName || "Team"}, we set up a quick 1-click video demo showing how our parent payments integration auto-verifies bank receipts. Let me know if you would like to test the sandbox.`,
        `Hi ${lead.contactName || "Team"} - we have open delivery capacity starting next week to deploy the WhatsApp portal. Let's lock in a quick 5-min diagnostic slot to confirm specifications?`
      ]
    };
    return res.json({ success: true, proposal: mockProposal, source: "Offline Playbook Engine", errorMsg: error?.message });
  }
});

// 3. Discovery Loop
app.post("/api/agent/discovery", async (req, res) => {
  const { leadName, notes, provider } = req.body;
  if (!notes) {
    return res.status(400).json({ error: "Missing conversation notes or transcript parameters" });
  }

  try {
    const prompt = `You are the Oracle69 Discovery Loop agent.
Analyze the following client diagnostic notes/transcript:
"${notes}"

Strict Technical Guidelines:
1. REQUIREMENTS DOCUMENTATION (Markdown): Compile a comprehensive, professional requirements sheet. Outline primary objectives, admin vs client interfaces, specific functional modules, real-world data-capture rules, and zero placeholders. Avoid any hand-waving references.
2. PROCESS FLOW COMPARISON: Formulate a clear, sequential description of the current broken as-is workflow (e.g. unstructured WhatsApp paper checks, unrecorded spreadsheets, manual billing tracking).
3. TARGETED OBSTACLES: Outline precise operational bottleneck issues (e.g. delayed receipt confirmation, no-show queues) with realistic Severity levels (High/Medium/Low) based strictly on points mentioned in the dialogue. Do not invent unrelated obstacles.
4. SYSTEM ARCHITECTURE MODULES: Propose 3 high-performance modular layers detailing how they directly alleviate each identified pain point.
5. MODERN INTEGRATION STACK: Outline a professional technology stack consisting of real, existing developer tools (e.g. React/Vite, Node.js + Express, Google Sheets Webhook API, WhatsApp Business API Cloud SDK, Gemini OCR Vision).

Respond in exactly JSON format matching the schema below:
{
  "requirementsDoc": "Extracted user requirements, admin roles, and flow specifications in Markdown.",
  "currentWorkflow": "Step-by-step description of current broken operational workflow.",
  "painPoints": [
    { "issue": "Pain point description", "severity": "High" }
  ],
  "systemModules": [
    { "moduleName": "Module title", "description": "Scope of module automation functionality" }
  ],
  "techStack": ["React/NextJS", "Node/Express", "WhatsApp API", "SupaBase"]
}`;

    const result = await generateUnifiedAI(prompt, {
      responseMimeType: "application/json",
      temperature: 0.5,
    }, provider);

    const parsedData = JSON.parse(result.text || "{}");
    return res.json({ success: true, discovery: parsedData, source: result.source });
  } catch (error: any) {
    console.error("Discovery API error, using playbook parser:", error?.message);
    const mockDiscovery = {
      requirementsDoc: `### Oracle69 Discovery Specifications - ${leadName || "Lead Partner"}
- **Primary Objective**: Automate client onboarding, request routing, and unified billing confirmations.
- **Admin Role**: Operations Lead can view real-time pipeline states, match bookings, and trigger manual invoice reminders.
- **Client Role**: Interactive WhatsApp bot self-registration, file uploading, and instant PDF receipts generation.`,
      currentWorkflow: "Unstructured chat conversations -> Manual ledger entry on paper / Google Sheets -> Admin reviews transfers manually every morning -> Parents call/request receipts.",
      painPoints: [
        { issue: "Manual receipt lookups causing bookkeeping delay", severity: "High" },
        { issue: "Booking confirmation backlog via WhatsApp phone numbers", severity: "Medium" },
        { issue: "Lack of centralized report logs for late payment fee accounts", severity: "High" }
      ],
      systemModules: [
        { moduleName: "WhatsApp Ledger Bot", description: "Listens for customer screenshot submissions, parses metadata using AI OCR, and updates spreadsheet records." },
        { moduleName: "School Parent Dashboard", description: "Simple web interface where parents log in and view outstanding invoices, historical payments, and calendar deadlines." },
        { moduleName: "Admin Alert Notification", description: "Hourly automatic triggers dispatch notifications containing overdue reports directly to Clinic/School management." }
      ],
      techStack: ["Vite React", "TypeScript Node", "WhatsApp Cloud SDK API", "Google Sheets API Integration", "Gemini AI Vision"]
    };
    return res.json({ success: true, discovery: mockDiscovery, source: "Offline playbook heuristics", errorMsg: error?.message });
  }
});

// 4. Delivery Loop
app.post("/api/agent/delivery", async (req, res) => {
  const { systemName, reqs, provider } = req.body;
  try {
    const prompt = `You are the Oracle69 Delivery Loop (Systems Builder) Agent.
Given the target system "${systemName}" and requirements snapshot "${reqs}", generate a production-ready, highly technical delivery blueprint.

Strict Blue-collar Engineering Guidelines:
1. ASCII CODE SYSTEM TOPOLOGY: Draft a highly professional and descriptive ASCII flow diagram showing real-world architectural nodes (e.g. WhatsApp Inbound -> Express Router Router Endpoint -> Gumloop Webhook -> Supabase DB). Use structured connectors.
2. STEP-BY-STEP WORKFLOW SCHEMATIC: Provide 3 exact, logical execution steps of the automated workflow (e.g. specifying trigger hooks, OCR extraction rules, ledger updates, and outbound receipt dispatches).
3. SPRINT TASK METRICS: Detail a checklist of realistic developer sprint tasks showing specific roles and realistic hours estimates (e.g. Admin UI Dashboard scaffold, SMS webhook integration testing).
4. CONCRETE RISK MANAGEMENT: Detail 2 real technical hurdles (such as API rate thresholds, unreadable/skewed invoice photos) along with realistic mitigation strategies.
5. PRE-DEPLOYMENT VERIFICATION: Formulate a 3-step pre-flight checklist for validating environmental parameters, sandbox credentials, and endpoint connectivity before going live.

Respond in exactly JSON format matching the schema below:
{
  "architecture": "Text representation of architecture components and data flows",
  "workflowDesign": [
    "Step 1: Webhook received ...",
    "Step 2: Parse attachment ...",
    "Step 3: Route and store state ..."
  ],
  "tasks": [
    { "taskName": "Set up database collections", "role": "Backend Engineer", "estHours": 4 }
  ],
  "risks": [
    "Hurdle: WhatsApp Cloud API daily messaging quota thresholds"
  ],
  "deploymentChecklist": [
    "Verify environment credentials (.env secret pipelines)",
    "Establish connection webhooks and test fallback payload",
    "Run QA simulation with 10 parallel mocked client notifications"
  ]
}`;

    const result = await generateUnifiedAI(prompt, {
      responseMimeType: "application/json",
      temperature: 0.5,
    }, provider);

    const parsedData = JSON.parse(result.text || "{}");
    return res.json({ success: true, delivery: parsedData, source: result.source });
  } catch (error: any) {
    console.error("Delivery API error:", error?.message);
    const mockDelivery = {
      architecture: `[Client WhatsApp] ══❯ [Webhook Receiver API] ══❯ [Gumloop OCR Agent]
                                            │
                                            ▼
                                     [Supabase DB / Sheets] ❮══ [Vite Admin Board]`,
      workflowDesign: [
        "Step 1: Parent triggers payment notification through school catalog link or sends receipt image directly to the registered WhatsApp business number.",
        "Step 2: Webhook logs photo link in database, dispatching OCR agent to extract target student ID, date, bank transaction code, and paid sum.",
        "Step 3: Auto-verifies receipt parameters against pending invoice balances and sends beautiful matching green confirmation ticket to parenting group."
      ],
      tasks: [
        { taskName: "WhatsApp Meta Sandbox Setup & Webhook Handler Endpoint", role: "DevOps / Backend", estHours: 6 },
        { taskName: "OCR Gemini Prompt configuration & parsed response validation logic", role: "AI Engineer", estHours: 5 },
        { taskName: "Local Admin dashboard & real-time socket spreadsheet integration", role: "Frontend Dev", estHours: 12 },
        { taskName: "Testing pipeline - simulate edge transfer errors & mock failures", role: "QA Engineer", estHours: 4 }
      ],
      risks: [
        "Risk: Delay or rejection of META business profile submission verification.",
        "Risk: Unstructured image scan fail if bank receipt is torn or heavily skewed (Requires human fallback dashboard router)."
      ],
      deploymentChecklist: [
        "Authorize Meta WhatsApp Cloud Business Manager token.",
        "Deploy backend container services via CI/CD.",
        "Initiate Google Sheets API service account authentication.",
        "Review edge check alerts layout."
      ]
    };
    return res.json({ success: true, delivery: mockDelivery, source: "Offline Blueprint System", errorMsg: error?.message });
  }
});

// 5. Operations Loop
app.post("/api/agent/operations", async (req, res) => {
  const { logsText, provider } = req.body;
  try {
    const prompt = `You are the Oracle69 Operations Loop (CRM Monitoring) Agent.
Track ongoing tasks and status updates based on the current logs text: "${logsText}".

Strict Operational Guidelines:
1. PERFORMANCE AUDIT REPORT: Synthesize a highly strategic, professional summary of project health, milestone progress, and client onboarding compliance.
2. PIPELINE BLOCKERS: Outline real operational bottleneck risks and delays experienced by engineers or clients.
3. IMMEDIATE ACTION DIRECTIVES: Detail exact client-facing instructions, outreach directions, and operational followups to bypass blockers and accelerate delivery. No general checklists—be highly specific to the logged events.

Respond in exactly JSON:
{
  "statusReport": "Brief summary outlining general project milestone progress and health",
  "risks": ["Risk point 1", "Risk point 2"],
  "nextActions": ["Action 1", "Action 2"],
  "bottlenecks": ["Bottleneck item 1"]
}`;

    const result = await generateUnifiedAI(prompt, {
      responseMimeType: "application/json",
      temperature: 0.4,
    }, provider);

    const parsedData = JSON.parse(result.text || "{}");
    return res.json({ success: true, operations: parsedData, source: result.source });
  } catch (error: any) {
    console.error("Operations loop error, loading mock state:", error?.message);
    const mockOps = {
      statusReport: "Active development proceeding smoothly. WhatsApp Webhook sandbox testing has commenced. Dashboard scaffolding complete; pending direct database bindings.",
      risks: [
        "Client has delayed submitting actual sample parent lists and invoice samples.",
        "Vague requirements surrounding refund exceptions might cause scope bloat."
      ],
      nextActions: [
        "Transmit standardized spreadsheet template and ask client director to fill standard fields.",
        "Establish mock ledger dataset and run performance benchmarks."
      ],
      bottlenecks: [
        "DevOps bottlenecks: Awaiting approved client WhatsApp developer sandbox access token keys."
      ]
    };
    return res.json({ success: true, operations: mockOps, source: "Offline Heuristics Agent", errorMsg: error?.message });
  }
});

// 6. Knowledge Loop
app.post("/api/agent/knowledge", async (req, res) => {
  const { notesBrief, provider } = req.body;
  try {
    const prompt = `You are the Oracle69 Compound Engineering Knowledge Loop Agent.
Goal: Extract compound intelligence from the project brief: "${notesBrief}".

Strict Knowledge Management Guidelines:
1. SYSTEMIC LESSONS LEARNED: Formulate 2 rigorous lessons regarding client acquisition, delivery velocity, pricing structures, or technical integration layers.
2. UPGRADED STANDARD OPERATING PROCEDURES (SOP): Write 2 professional SOP updates designed to prevent future delivery friction, streamline setup, and guarantee operational stability.
3. SYSTEM PLATFORM SOFTWARE UPGRADES: Detail concrete codebase, script, or configuration changes (e.g. migrating database interfaces, setting up automated background retries, adding OCR vision triggers) to optimize Oracle69 systems.
4. OUTBOUND TEMPLATE PERFORMANCE: Refine outreach copy templates for lead scouting and pricing proposals based on retrospective metrics.

Respond in exactly JSON:
{
  "lessons": ["Lesson 1", "Lesson 2"],
  "updatedSOPs": ["SOP Update 1", "SOP Update 2"],
  "improvedTemplates": [
    { "type": "Outreach or Proposal", "content": "Refined message" }
  ],
  "systemUpgrades": ["Feature upgrade detail"]
}`;

    const result = await generateUnifiedAI(prompt, {
      responseMimeType: "application/json",
      temperature: 0.6,
    }, provider);

    const parsedData = JSON.parse(result.text || "{}");
    return res.json({ success: true, knowledge: parsedData, source: result.source });
  } catch (error: any) {
    console.error("Knowledge Loop error, fallback rules triggered:", error?.message);
    const mockKnowledge = {
      lessons: [
        "Lesson: High opportunity score accounts prioritize fast setup over feature density (schools want payment reminders running in days, not an all-inclusive complex ERP).",
        "Lesson: Offering fixed-price milestones (₦900k) secures 40% faster signatures than variable timelines."
      ],
      updatedSOPs: [
        "SOP Upgrade: Always initiate client onboarding sequences step 1 by setting up standard offline Google Sheet schemas before launching custom Supabase architectures.",
        "SOP Upgrade: Every parent diagnostic checklist must include a manual fallback verification protocol to secure clinical trust."
      ],
      improvedTemplates: [
        { 
          type: "Lead Gen Outreach v2", 
          content: "Hi [ContactName], observed [Company] conducts manually coordinated invoices via Whatsapp order trails. We build simple localized 3-step automation blocks using n8n and Sheets that save typical admins up to 12 hours a week. Can we send over a 1-minute video demo tomorrow?" 
        },
        { 
          type: "Outcome Pricing Pitch v2", 
          content: "Instead of upfront licensing, Oracle69 systems operate on a flat setup fee of [PriceRange] linked directly to operational savings metrics: zero charges until automated confirmations save your staff 5 hours a week." 
        }
      ],
      systemUpgrades: [
        "Implementation of Gemini-3.5-flash-powered WhatsApp ticket tagger to filter non-billing chats automatically.",
        "Centralized Google Sheets real-time connector database template."
      ]
    };
    return res.json({ success: true, knowledge: mockKnowledge, source: "Offline playbook compiler", errorMsg: error?.message });
  }
});


// Serve static React files and setup Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
