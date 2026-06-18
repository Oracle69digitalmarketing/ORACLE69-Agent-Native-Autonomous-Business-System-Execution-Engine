export interface Lead {
  name: string;
  industry: string;
  contactName?: string;
  location: string;
  signal: string;
  score: number;
  inefficiency: string;
  system: string;
  outreach: string;
  status: "Ready for review" | "Sent" | "Replied" | "Booked";
}

export interface Proposal {
  problemStatement: string;
  proposedSystem: string;
  roiEstimate: string;
  pricingRange: string;
  implementationOutline: string[];
  whatsappNurtureSequence: string[];
}

export interface Discovery {
  requirementsDoc: string;
  currentWorkflow: string;
  painPoints: { issue: string; severity: "High" | "Medium" | "Low" }[];
  systemModules: { moduleName: string; description: string }[];
  techStack: string[];
}

export interface DeliveryBlueprint {
  architecture: string;
  workflowDesign: string[];
  tasks: { taskName: string; role: string; estHours: number }[];
  risks: string[];
  deploymentChecklist: string[];
}

export interface OperationsStatus {
  statusReport: string;
  risks: string[];
  nextActions: string[];
  bottlenecks: string[];
}

export interface KnowledgeBase {
  lessons: string[];
  updatedSOPs: string[];
  improvedTemplates: { type: string; content: string }[];
  systemUpgrades: string[];
}

export interface OracleProject {
  id: string;
  title: string;
  client: string;
  systemName: string;
  status: "Active Research" | "Proposed" | "Diagnostic" | "System building" | "Production Live";
  completionPct: number;
  lastUpdated: string;
}
