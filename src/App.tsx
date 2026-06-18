import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import {
  Sparkles,
  TrendingUp,
  Layers,
  Settings,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Network,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Users,
  Check,
  Building2,
  Activity,
  FileText,
  User,
  MapPin,
  ChevronRight,
  Info,
  Printer,
  Download,
  HelpCircle,
  X
} from "lucide-react";
import { Lead, Proposal, Discovery, DeliveryBlueprint, OperationsStatus, KnowledgeBase, OracleProject } from "./types";

export default function App() {
  // Pre-seed mock database state that syncs with standard business inputs
  const [market, setMarket] = useState("Lagos, Nigeria");
  const [selectedIndustry, setSelectedIndustry] = useState<"Schools" | "Clinics" | "SMEs" | "All">("Schools");
  const [selectedSource, setSelectedSource] = useState("Google Maps Scout");
  
  // App States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [discoveryNotes, setDiscoveryNotes] = useState<string>(
    "Client walks us through: 'We take bank transfers for fee balance payments. Currently 1 representative manually cross-matches every notification on our WhatsApp lines against Excel boards. It takes hours every Friday. Parents complain of missing payment confirmations and long receipt delays of over 4 days.'"
  );
  const [discoveryResult, setDiscoveryResult] = useState<Discovery | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryBlueprint | null>(null);
  const [operationsResult, setOperationsResult] = useState<OperationsStatus | null>(null);
  const [knowledgeResult, setKnowledgeResult] = useState<KnowledgeBase | null>(null);

    // Active Loops navigation: "lead-gen" | "sales" | "discovery" | "delivery" | "operations" | "knowledge"
  const [activeLoopTab, setActiveLoopTab] = useState<string>("lead-gen");
  
  // Preferred AI Generation Provider
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  
  // Processing States
  const [loadingScout, setLoadingScout] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [loadingOperations, setLoadingOperations] = useState(false);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);

  // Toast status or logger list for feedback loops
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "INITIALIZED: Oracle69 Autonomous Execution Agent ready",
    "SIGNAL: Awaiting scout run triggers inside Nigeria market sectors"
  ]);

  // Integration Source Label Tracker
  const [dataSourceScout, setDataSourceScout] = useState<string>("Prerecorded Playbook");
  const [dataSourceProposal, setDataSourceProposal] = useState<string>("Prerecorded Playbook");
  const [dataSourceDiscovery, setDataSourceDiscovery] = useState<string>("Prerecorded Playbook");
  const [dataSourceDelivery, setDataSourceDelivery] = useState<string>("Prerecorded Playbook");
  const [dataSourceOperations, setDataSourceOperations] = useState<string>("Prerecorded Playbook");
  const [dataSourceKnowledge, setDataSourceKnowledge] = useState<string>("Prerecorded Playbook");

  // CRM Tracker State
  const [projectsList, setProjectsList] = useState<OracleProject[]>([
    {
      id: "PROJ-201",
      title: "Greenfield Academy Parent Portal",
      client: "Lagos Heights Academy",
      systemName: "Oracle69 AutoThinker",
      status: "System building",
      completionPct: 65,
      lastUpdated: "2026-06-18 10:14"
    },
    {
      id: "PROJ-202",
      title: "Apex WhatsApp Schedulers",
      client: "Apex Family Clinic",
      systemName: "Custom WhatsApp CRM",
      status: "Production Live",
      completionPct: 100,
      lastUpdated: "2026-06-17 14:20"
    },
    {
      id: "PROJ-203",
      title: "Agri-Chain Harmonize Kit",
      client: "Afe Babalola Farm Org",
      systemName: "Harmonize EcoConnect",
      status: "Diagnostic",
      completionPct: 20,
      lastUpdated: "2026-06-18 09:11"
    }
  ]);

  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const downloadSingleReport = (section: string) => {
    let title = "";
    let content = "";
    
    if (section === "lead-gen" && selectedLead) {
      title = `Lead_Scout_Report_${selectedLead.name.replace(/\s+/g, '_')}`;
      content = `ORACLE69 - LEAD SCOUT REPORT
Generated: ${new Date().toLocaleString()}
-------------------------------------------
Target Name: ${selectedLead.name}
Location: ${selectedLead.location}
Industry: ${selectedLead.industry}
Lead Score: ${selectedLead.score}%
Inefficiency: ${selectedLead.inefficiency}
Signal Crawled: ${selectedLead.signal}
Contact person: ${selectedLead.contactName || "N/A"}
Recommended Tech Stack: ${selectedLead.system}
-------------------------------------------
OUTBOX COLD PITCH:
"${selectedLead.outreach}"`;
    } else if (section === "sales" && currentProposal) {
      title = `Sales_Proposal_${selectedLead?.name?.replace(/\s+/g, '_') || 'Prospect'}`;
      content = `ORACLE69 - OUTCOME-BASED ROI PROPOSAL
Generated: ${new Date().toLocaleString()}
-------------------------------------------
Problem Diagnosis:
${currentProposal.problemStatement}

Proposed System Infrastructure:
${currentProposal.proposedSystem}

Roadmap & Milestones:
${currentProposal.implementationOutline.map((p, i) => `${i+1}. ${p}`).join("\n")}

Pricing Estimate: ₦${currentProposal.pricingRange}
Estimated Guaranteed ROI: ${currentProposal.roiEstimate}
-------------------------------------------
WHATSAPP FOLLOW-UP OUTREACH OUTBOXES:
${currentProposal.whatsappNurtureSequence.map((n, i) => `[Sequence ${i+1}] ${n}`).join("\n\n")}`;
    } else if (section === "discovery" && discoveryResult) {
      title = `Discovery_Report_${selectedLead?.name?.replace(/\s+/g, '_') || 'Prospect'}`;
      content = `ORACLE69 - SYSTEMS DISCOVERY DEEP DIVE REPORT
Generated: ${new Date().toLocaleString()}
-------------------------------------------
Proposed Scope Specifications:
${discoveryResult.requirementsDoc}

Broken Current Workflow:
${discoveryResult.currentWorkflow}

Extracted Bottlenecks Severity:
${discoveryResult.painPoints.map(p => `• ${p.issue} [Severity: ${p.severity}]`).join("\n")}

Suggested Solution Modules:
${discoveryResult.systemModules.map(m => `• ${m.moduleName}: ${m.description}`).join("\n")}

Recommended Integration Stack: ${discoveryResult.techStack.join(", ")}`;
    } else if (section === "delivery" && deliveryResult) {
      title = `Delivery_Blueprint_${selectedLead?.name?.replace(/\s+/g, '_') || 'Prospect'}`;
      content = `ORACLE69 - SYSTEM BUILDER DELIVERY BLUEPRINT
Generated: ${new Date().toLocaleString()}
-------------------------------------------
ASCII Pipeline Diagram:
${deliveryResult.architecture}

Gumloop API Webhook Stages:
${deliveryResult.workflowDesign.map((step, i) => `  Step ${i+1}: ${step}`).join("\n")}

Resource Task Timelines:
${deliveryResult.tasks.map(t => `  - ${t.taskName} (${t.role}): ${t.estHours} Hrs`).join("\n")}

Critical Risks Addressed:
${deliveryResult.risks.map(r => `  - ${r}`).join("\n")}

Pre-Launch Deployment Checklist:
${deliveryResult.deploymentChecklist.map(c => `  [ ] ${c}`).join("\n")}`;
    } else if (section === "operations" && operationsResult) {
      title = `Operations_Stability_Report`;
      content = `ORACLE69 - OPERATIONS TIMELINES AUDIT REPORT
Generated: ${new Date().toLocaleString()}
-------------------------------------------
Performance & Completion Status:
${projectsList.map(p => `${p.client}: ${p.title} (${p.status} - ${p.completionPct}%)`).join("\n")}

Detailed Stability Report:
${operationsResult.statusReport}

Blocker Incidents Detected:
${operationsResult.risks.map(r => `  - ${r}`).join("\n")}

Next Emergency Guidelines Actions:
${operationsResult.nextActions.map(act => `  - ${act}`).join("\n")}`;
    } else if (section === "knowledge" && knowledgeResult) {
      title = `Knowledge_Retro_SOP_Upgrade`;
      content = `ORACLE69 - COMPOUND ENGINEERING KNOWLEDGE REPORT
Generated: ${new Date().toLocaleString()}
-------------------------------------------
Strategic System Lessons Learned:
${knowledgeResult.lessons.map(l => `  • ${l}`).join("\n")}

Standard Operating Procedures (SOP) Upgrades:
${knowledgeResult.updatedSOPs.map((sop, i) => `  SOP-V${i+2}: ${sop}`).join("\n")}

Optimized Outbound Copy Designs:
${knowledgeResult.improvedTemplates.map(t => `  - [Type: ${t.type}]\n    "${t.content}"`).join("\n\n")}

Systems Upgrade Schedules:
${knowledgeResult.systemUpgrades.map(u => `  - ${u}`).join("\n")}`;
    }

    if (!content) {
      addLog(`WARNING: Cannot export single report. Selected section [${section}] does not have active generated data.`);
      return;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Oracle69_${title}.txt`;
    link.click();
    addLog(`EXPORT CONFIRMED: Downloaded single report for ${section}.`);
  };

  const downloadAllReportsText = () => {
    let reportText = `==================================================
ORACLE69 - FULL CONSOLIDATED SYSTEM EXECUTIVE DOSSIER
Consolidated Generation Timestamp: ${new Date().toLocaleString()}
==================================================\n\n`;

    // Lead Scout
    reportText += `1. LEAD SCOUT & MARKET INTELLIGENCE AUDIT\n-----------------------------------------\n`;
    if (selectedLead) {
      reportText += `Target Client Establishments: ${selectedLead.name}\n`;
      reportText += `Market Location Suburb:       ${selectedLead.location}\n`;
      reportText += `Industry / Target Sector:     ${selectedLead.industry}\n`;
      reportText += `Qualifying Lead Score:        ${selectedLead.score}%\n`;
      reportText += `Contact Person / MD:          ${selectedLead.contactName || "N/A"}\n`;
      reportText += `Recommended System Stack:     ${selectedLead.system}\n\n`;
      reportText += `Crawled Signal Insight:\n"${selectedLead.signal}"\n\n`;
      reportText += `Target Operational Inefficiencies:\n"${selectedLead.inefficiency}"\n\n`;
      reportText += `Outreach Pitch Template Drafted:\n"${selectedLead.outreach}"\n\n`;
    } else {
      reportText += `No active lead selected in system.\n\n`;
    }

    // Proposal
    reportText += `2. SALES PROPOSAL & OUTCOME-BASED ROI DECK\n------------------------------------------\n`;
    if (currentProposal) {
      reportText += `Problem Statement Diagnosis:\n${currentProposal.problemStatement}\n\n`;
      reportText += `Proposed System Infrastructure Recommendation:\n${currentProposal.proposedSystem}\n\n`;
      reportText += `Naira Commercial Pricing Bracket: ₦ ${currentProposal.pricingRange}\n`;
      reportText += `Estimated Guaranteed ROI Margins: ${currentProposal.roiEstimate}\n\n`;
      reportText += `Roadmap & Implementation Milestones:\n`;
      currentProposal.implementationOutline.forEach((p, i) => {
        reportText += `  [Phase ${i + 1}] ${p}\n`;
      });
      reportText += `\nWhatsApp Nurture CRM Sequences Drafted:\n`;
      currentProposal.whatsappNurtureSequence.forEach((n, idx) => {
        reportText += `  [Sequence ${idx + 1}] "${n}"\n`;
      });
      reportText += "\n";
    } else {
      reportText += `No active proposal compiled yet.\n\n`;
    }

    // Discovery
    reportText += `3. DIAGNOSTIC DISCOVERY REVIEW & USAGE REQS\n-------------------------------------------\n`;
    if (discoveryResult) {
      reportText += `Discovery Specification Document:\n${discoveryResult.requirementsDoc}\n\n`;
      reportText += `Broken As-Is Process Workflow:\n${discoveryResult.currentWorkflow}\n\n`;
      reportText += `Core Pain Points Severity Breakdown:\n`;
      discoveryResult.painPoints.forEach((p) => {
        reportText += `  - ${p.issue} [Severity Level: ${p.severity}]\n`;
      });
      reportText += `\nSuggested Automation Solution Modules:\n`;
      discoveryResult.systemModules.forEach((m) => {
        reportText += `  - ${m.moduleName}: ${m.description}\n`;
      });
      reportText += `\nSuggested Automations Tech Stack Integration: ${discoveryResult.techStack.join(", ")}\n\n`;
    } else {
      reportText += `No discovery analysis compiled yet.\n\n`;
    }

    // Delivery
    reportText += `4. TECHNICAL SYSTEMS BLUEPRINT DELIVERY\n---------------------------------------\n`;
    if (deliveryResult) {
      reportText += `System Architecture Pipeline ASCII Diagram:\n${deliveryResult.architecture}\n\n`;
      reportText += `Gumloop API / Webhook Integration Stages:\n`;
      deliveryResult.workflowDesign.forEach((wf, idx) => {
        reportText += `  Stage ${idx + 1}: ${wf}\n`;
      });
      reportText += `\nSpecific Custom Tasks Allocations:\n`;
      deliveryResult.tasks.forEach((t) => {
        reportText += `  - ${t.taskName} (${t.role}): ${t.estHours} Est Hours\n`;
      });
      reportText += `\nDeployment Critical Risks Addressed:\n`;
      deliveryResult.risks.forEach((r) => {
        reportText += `  - ${r}\n`;
      });
      reportText += `\nPre-Launch Verification Deployment Checklist:\n`;
      deliveryResult.deploymentChecklist.forEach((chk) => {
        reportText += `  [ ] ${chk}\n`;
      });
      reportText += "\n";
    } else {
      reportText += `No technical blueprint compiled yet.\n\n`;
    }

    // Operations
    reportText += `5. OPERATIONS PERFORMANCE MONITOR & CRM STATUS\n----------------------------------------------\n`;
    if (operationsResult) {
      reportText += `Current Active Client Containers Logs:\n`;
      projectsList.forEach((p) => {
        reportText += `  * ${p.client}: ${p.title} (Stage: ${p.status} - ${p.completionPct}% Complete) [Last Updated: ${p.lastUpdated}]\n`;
      });
      reportText += `\nOperations Audit Performance Summary Report:\n${operationsResult.statusReport}\n\n`;
      reportText += `Detected Webhook Pipeline Blockers:\n`;
      operationsResult.risks.forEach((r) => {
        reportText += `  - ${r}\n`;
      });
      reportText += `\nImmediate Client-Facing Outreach Guideline Directives:\n`;
      operationsResult.nextActions.forEach((act) => {
        reportText += `  - ${act}\n`;
      });
      reportText += "\n";
    } else {
      reportText += `No operational audit run yet.\n\n`;
    }

    // Knowledge
    reportText += `6. KNOWLEDGE REFLECTIVE RETRO & SOP UPGRADE\n-------------------------------------------\n`;
    if (knowledgeResult) {
      reportText += `Strategic System Lessons Evaluated:\n`;
      knowledgeResult.lessons.forEach((l) => {
        reportText += `  - ${l}\n`;
      });
      reportText += `\nUpgraded SOP Procedures Drafts:\n`;
      knowledgeResult.updatedSOPs.forEach((sop, idx) => {
        reportText += `  - [SOP-V${idx+2}] ${sop}\n`;
      });
      reportText += `\nImproved Outreach/Conversion Template Scripts:\n`;
      knowledgeResult.improvedTemplates.forEach((t) => {
        reportText += `  - [${t.type}] "${t.content}"\n`;
      });
      reportText += `\nSystem Program Increments Scheduled:\n`;
      knowledgeResult.systemUpgrades.forEach((u) => {
        reportText += `  - ${u}\n`;
      });
      reportText += "\n";
    } else {
      reportText += `No retrospective analyzed yet.\n\n`;
    }

    reportText += `==================================================\nTHE END OF CONSOLIDATED EXECUTIVE REPORT`;
    
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Oracle69_Consolidated_Dossier_${selectedLead?.name?.replace(/\s+/g, '_') || 'Global'}.txt`;
    link.click();
    addLog("DOWNLOAD SUCCESS: Saved complete high-fidelity business dossier compilation file.");
  };

  const downloadAllReportsPDF = () => {
    try {
      addLog("PDF: Compiling high-fidelity master dossier elements into enterprise PDF...");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      let yPos = 25;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = 180;

      const drawHeader = () => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 110, 120);
        doc.text("ORACLE69 SYSTEM CHASSIS  |  CONSOLIDATED ENTERPRISE DOSSIER REPORT", margin, yPos - 8);
        
        doc.setDrawColor(210, 214, 219);
        doc.setLineWidth(0.25);
        doc.line(margin, yPos - 5, margin + contentWidth, yPos - 5);
        
        doc.setFontSize(8);
        doc.text(`DATE GENERATED: ${new Date().toLocaleString()}`, margin + contentWidth - 65, yPos - 8);
      };

      const checkNewPage = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - 20) {
          doc.addPage();
          yPos = 25;
          drawHeader();
        }
      };

      // Initial page header
      drawHeader();
      
      // Document Main Title card
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(17, 24, 39); // deep slate/charcoal
      doc.text("ORACLE69 CONSOLIDATED DOSSIER", margin, yPos + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      yPos += 12;
      
      const enterpriseName = selectedLead ? selectedLead.name : "GLOBAL STRATEGY MODE";
      doc.text(`Enterprise Target: ${enterpriseName}`, margin, yPos);
      yPos += 5;
      doc.text(`Subject: Complete Autonomous Business Integration, Deployment & Optimization Blueprint`, margin, yPos);
      yPos += 10;
      
      const printSectionTitle = (titleText: string) => {
        checkNewPage(24);
        yPos += 4;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(29, 78, 216); // Cobalt Blue
        doc.text(titleText, margin, yPos);
        yPos += 3;
        
        doc.setDrawColor(191, 219, 254);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 6;
      };

      const printSubkey = (key: string, val: string) => {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        const combined = `${key}: ${val}`;
        const lines = doc.splitTextToSize(combined, contentWidth);
        const heightNeeded = lines.length * 5 + 2;
        
        checkNewPage(heightNeeded);
        
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(55, 65, 81);
        doc.text(`${key}:`, margin, yPos);
        
        const keyWidth = doc.getTextWidth(`${key}: `);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(75, 85, 99);
        
        lines.forEach((lineText: string, i: number) => {
          if (i === 0) {
            const remainder = lineText.substring(key.length + 2);
            doc.text(remainder || "N/A", margin + keyWidth, yPos);
          } else {
            yPos += 5;
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
          }
        });
        
        yPos += 6;
      };

      const printMultilineTextBlock = (label: string, textContent: string) => {
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text(label, margin, yPos);
        yPos += 5;
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        
        const lines = doc.splitTextToSize(textContent || "N/A", contentWidth);
        lines.forEach((line: string) => {
          checkNewPage(5);
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        yPos += 3;
      };

      // 1. LEAD SCUT REPORT
      printSectionTitle("1. MARKET INTELLIGENCE & LEAD SCUT");
      if (selectedLead) {
        printSubkey("Target Enterprise Establishments", selectedLead.name);
        printSubkey("Market Location Suburb", selectedLead.location);
        printSubkey("Industry Sector", selectedLead.industry);
        printSubkey("Qualifying Lead Score", `${selectedLead.score}%`);
        printSubkey("Contact Person / MD", selectedLead.contactName || "N/A");
        printSubkey("Recommended System Stack", selectedLead.system);
        
        printMultilineTextBlock("RAW Crawled Discovery Insight Logs:", selectedLead.signal);
        printMultilineTextBlock("Target Inefficiencies & Bottlenecks Detected:", selectedLead.inefficiency);
        printMultilineTextBlock("Pitch Draft Outbound Copy (3-Sentence Directive):", selectedLead.outreach);
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No active scouted client selected in session database. Try pulling records first.", margin, yPos);
        yPos += 7;
      }

      // 2. ROI PROPOSAL
      printSectionTitle("2. OUTCOME-BASED INVESTMENT & ROI PROPOSAL");
      if (currentProposal) {
        printSubkey("Naira Commercial Pricing Estimate", `NGN ${currentProposal.pricingRange}`);
        printSubkey("Guaranteed System ROI Outcomes", currentProposal.roiEstimate);
        
        printMultilineTextBlock("Problem Statement Diagnosis:", currentProposal.problemStatement);
        printMultilineTextBlock("Proposed System Infrastructure Recommendation:", currentProposal.proposedSystem);
        
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Roadmap & Assembly Milestone Phases:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        currentProposal.implementationOutline.forEach((milestone, idx) => {
          const textLine = `[Phase ${idx + 1}] ${milestone}`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("WhatsApp CRM Retention Outreach Scripts:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        currentProposal.whatsappNurtureSequence.forEach((nurture, idx) => {
          const textLine = `[Sequence ${idx + 1}] "${nurture}"`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
          yPos += 1;
        });
        yPos += 3;
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No active sales ROI proposal generated yet. Run Loop 2.", margin, yPos);
        yPos += 7;
      }

      // 3. REQS DISCOVERY
      printSectionTitle("3. DISCOVERY DIAGNOSTIC & PREREQ SHEETS");
      if (discoveryResult) {
        printMultilineTextBlock("Extracted Requirements Document Specifications:", discoveryResult.requirementsDoc);
        printMultilineTextBlock("As-Is Broken Operational Workflow Map:", discoveryResult.currentWorkflow);
        
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Extracted Pain Points Bottlenecks & Severity Levels:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        discoveryResult.painPoints.forEach(p => {
          const textLine = `• ${p.issue} [Severity: ${p.severity}]`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((l: string) => {
            checkNewPage(5);
            doc.text(l, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Suggested Modular Automation Layers:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        discoveryResult.systemModules.forEach(m => {
          const textLine = `• ${m.moduleName}: ${m.description}`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((l: string) => {
            checkNewPage(5);
            doc.text(l, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;
        
        printSubkey("Recommended Integration Technology Stack", discoveryResult.techStack.join(", "));
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No Discovery deeper audit analyzed yet. Run Loop 3.", margin, yPos);
        yPos += 7;
      }

      // 4. DELIVERY SYSTEM BUILDER
      printSectionTitle("4. TECHNICAL DELIVERY SYSTEM BLUEPRINT");
      if (deliveryResult) {
        printMultilineTextBlock("ASCII Pipeline Architecture Topology Layout:", deliveryResult.architecture);
        
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Gumloop API / Webhook Integration Stages:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        deliveryResult.workflowDesign.forEach((wf, idx) => {
          const textLine = `Stage ${idx + 1}: ${wf}`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Sprint Task Allocation Timelines:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        deliveryResult.tasks.forEach(t => {
          const textLine = `- Task: ${t.taskName} (${t.role}) | Est: ${t.estHours} Hrs`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Hurdles & Mitigation Strategies:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        deliveryResult.risks.forEach(r => {
          const lines = doc.splitTextToSize(`- ${r}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Pre-Launch Checklist Verification:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        deliveryResult.deploymentChecklist.forEach(chk => {
          const lines = doc.splitTextToSize(`[ ] ${chk}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No system build delivery blueprints compiled yet. Run Loop 4.", margin, yPos);
        yPos += 7;
      }

      // 5. ROADMAP OPERATIONS
      printSectionTitle("5. PERFORMANCE OPERATIONS & CRM MONITORING");
      if (operationsResult) {
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Active Client Container Pipelines Status:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        projectsList.forEach(p => {
          const textLine = `* Partner: ${p.client} | Component: ${p.title} (Status: ${p.status} - ${p.completionPct}% Complete)`;
          const lines = doc.splitTextToSize(textLine, contentWidth);
          lines.forEach((l: string) => {
            checkNewPage(5);
            doc.text(l, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        printMultilineTextBlock("Pipeline Audit Controls Status Summary:", operationsResult.statusReport);
        
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Active Webhook Blocker Alerts:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        operationsResult.risks.forEach(r => {
          const lines = doc.splitTextToSize(`🚨 ${r}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Immediate Client-Facing Outreach Directives:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        operationsResult.nextActions.forEach(act => {
          const lines = doc.splitTextToSize(`👉 ${act}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No ongoing operations audit compiled. Ingest telemetry in Loop 5 first.", margin, yPos);
        yPos += 7;
      }

      // 6. COMPOUND KNOWLEDGE SOP
      printSectionTitle("6. KNOWLEDGE COMPOUND BRAIN & SOP CARD");
      if (knowledgeResult) {
        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Refuned Tactical System Lessons Learned:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        knowledgeResult.lessons.forEach(l => {
          const lines = doc.splitTextToSize(`💡 ${l}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Upgraded Standard Operating Procedures (SOP):", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        knowledgeResult.updatedSOPs.forEach((sop, idx) => {
          const lines = doc.splitTextToSize(`[SOP-V${idx + 2}] ${sop}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
          yPos += 1;
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Upgraded Outreach/Conversion Templates:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        knowledgeResult.improvedTemplates.forEach((t, idx) => {
          const lines = doc.splitTextToSize(`[${t.type} Template Upgrade]: "${t.content}"`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
          yPos += 1.5;
        });
        yPos += 3;

        checkNewPage(12);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Configured System Codebase Increments Scheduled:", margin, yPos);
        yPos += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        knowledgeResult.systemUpgrades.forEach(u => {
          const lines = doc.splitTextToSize(`⚡ ${u}`, contentWidth);
          lines.forEach((lineText: string) => {
            checkNewPage(5);
            doc.text(lineText, margin, yPos);
            yPos += 5;
          });
        });
        yPos += 3;
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No retrospective SOP analyzed. Analyze system post-mortems in Loop 6.", margin, yPos);
        yPos += 7;
      }

      // Dynamically stamp page numbers retrospectively on all generated pages
      const totalPageCount = doc.getNumberOfPages();
      for (let i = 1; i <= totalPageCount; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(140, 145, 155);
        
        // Draw bottom borderline
        doc.setDrawColor(220, 224, 230);
        doc.setLineWidth(0.1);
        doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);
        
        // Stamping page index
        doc.text("CONFIDENTIAL  |  ORACLE69 BUSINESS INTELLIGENCE SUITE AUTO-GENERATION DOSSIER", margin, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPageCount}`, margin + contentWidth - 20, pageHeight - 8);
      }

      const safeLeadName = selectedLead ? selectedLead.name.replace(/\s+/g, '_') : 'Global';
      doc.save(`Oracle69_Consolidated_Dossier_${safeLeadName}.pdf`);
      addLog("DOWNLOAD SUCCESS: Saved complete high-fidelity enterprise PDF master dossier compilation file.");
    } catch (err: any) {
      console.error(err);
      addLog(`PDF ENGINE FAILURE: ${err?.message || err}`);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Helper copy function
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    addLog(`COPIED TO CLIPBOARD: Refined text content [${id}]`);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // 1. Fetch Lead Gen Loop
  const runScoutLoop = async () => {
    setLoadingScout(true);
    addLog(`SCOUTING STARTED: Pulling prospective target businesses in ${market} (${selectedIndustry})`);
    try {
      const response = await fetch("/api/agent/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market,
          targetIndustry: selectedIndustry,
          source: selectedSource,
          provider: aiProvider
        })
      });
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
        setDataSourceScout(data.source);
        addLog(`SCOUTING COMPLETED: Successfully harvested ${data.leads.length} qualified leads from backend [${data.source}]`);
        if (data.leads.length > 0) {
          setSelectedLead(data.leads[0]);
        }
      }
    } catch (e: any) {
      addLog(`SCOUT ERROR: Connection failed. Loading default leads locally.`);
    } finally {
      setLoadingScout(false);
    }
  };

  // 2. Fetch Sales Conversion Proposal
  const runSalesLoop = async (leadParam?: Lead) => {
    const targetLead = leadParam || selectedLead;
    if (!targetLead) {
      addLog("WARNING: Please select or scout a lead first to trigger the Sales Loop.");
      return;
    }
    setLoadingProposal(true);
    addLog(`CONVERSION STARTED: Synthesizing customized proposal and ROI matrix for ${targetLead.name}`);
    try {
      const response = await fetch("/api/agent/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: targetLead, provider: aiProvider })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentProposal(data.proposal);
        setDataSourceProposal(data.source);
        addLog(`CONVERSION COMPLETED: Outcome-based ROI draft generated [${data.source}]`);
        // Update tab automatically to encourage exploration
        setActiveLoopTab("sales");
      }
    } catch (e: any) {
      addLog(`SALES ERROR: Failed generating proposal.`);
    } finally {
      setLoadingProposal(false);
    }
  };

  // 3. Fetch Discovery Loop Requirements
  const runDiscoveryLoop = async () => {
    setLoadingDiscovery(true);
    addLog(`DISCOVERY STARTED: Extracting operational bottlenecks & system recommendation requirements.`);
    try {
      const response = await fetch("/api/agent/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName: selectedLead?.name || "Target Corporate",
          notes: discoveryNotes,
          provider: aiProvider
        })
      });
      const data = await response.json();
      if (data.success) {
        setDiscoveryResult(data.discovery);
        setDataSourceDiscovery(data.source);
        addLog(`DISCOVERY COMPLETED: Extracted ${data.discovery.painPoints.length} core bottlenecks. Proposed modular stack [${data.source}].`);
        setActiveLoopTab("discovery");
      }
    } catch (e) {
      addLog(`DISCOVERY ERROR: Fault parsing script notes.`);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  // 4. Fetch Delivery Loop Blueprint
  const runDeliveryLoop = async () => {
    setLoadingDelivery(true);
    const systemToBuild = discoveryResult?.systemModules[0]?.moduleName || selectedLead?.system || "Oracle69 System Suite";
    const reqsSnapshot = discoveryResult?.requirementsDoc || "Automate pipeline receipts and dispatch reminders.";
    addLog(`DELIVERY BUILDER STARTED: Crafting modular workflow for ${systemToBuild}...`);
    try {
      const response = await fetch("/api/agent/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemName: systemToBuild,
          reqs: reqsSnapshot,
          provider: aiProvider
        })
      });
      const data = await response.json();
      if (data.success) {
        setDeliveryResult(data.delivery);
        setDataSourceDelivery(data.source);
        addLog(`DELIVERY ARCHITECTURE CREATED: Core tasks mapped, risks addressed [${data.source}].`);
        setActiveLoopTab("delivery");
      }
    } catch (e) {
      addLog(`DELIVERY ERROR: Could not generate system layout blueprint.`);
    } finally {
      setLoadingDelivery(false);
    }
  };

  // 5. Fetch Operations Loop Status Tracker
  const runOperationsLoop = async () => {
    setLoadingOperations(true);
    const projectSummaryText = projectsList.map(p => `${p.client}: ${p.title} (${p.status} - ${p.completionPct}%)`).join("; ");
    addLog(`OPERATIONS COMPILING: Auditing running projects timeline logs.`);
    try {
      const response = await fetch("/api/agent/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logsText: projectSummaryText, provider: aiProvider })
      });
      const data = await response.json();
      if (data.success) {
        setOperationsResult(data.operations);
        setDataSourceOperations(data.source);
        addLog(`OPERATIONS REPORT COMPLETED: Identified potential hurdles & specified instant follow-up prompts [${data.source}].`);
        setActiveLoopTab("operations");
      }
    } catch (e) {
      addLog(`OPERATIONS ERROR: Failed generating team report status.`);
    } finally {
      setLoadingOperations(false);
    }
  };

  // 6. Fetch Knowledge Loop Synthesis
  const runKnowledgeLoop = async () => {
    setLoadingKnowledge(true);
    const projectLessonsParam = `Completed: Parent portal delivery built with WhatsApp OCR. Win: Standardizing templates cut execution by 14 hours. Barrier: Late payment logic remains complex. Outreach messages on Quora converted 32% faster.`;
    addLog(`KNOWLEDGE COMPILING: Extracting insights & generating upgraded SOP playbooks.`);
    try {
      const response = await fetch("/api/agent/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesBrief: projectLessonsParam, provider: aiProvider })
      });
      const data = await response.json();
      if (data.success) {
        setKnowledgeResult(data.knowledge);
        setDataSourceKnowledge(data.source);
        addLog(`KNOWLEDGE REfined: Integrated feedback, revised outreach copies, upgraded CRM engine scripts [${data.source}].`);
        setActiveLoopTab("knowledge");
      }
    } catch (e) {
      addLog(`KNOWLEDGE ERROR: Synthesis fault.`);
    } finally {
      setLoadingKnowledge(false);
    }
  };

  // Launch the cascade sequence of execution 
  const triggerAutoCascade = async () => {
    addLog("⚡ AUTO-CASCADE INITIATED: Launching complete 6-Loop Cascade sequence...");
    await runScoutLoop();
  };

  // Run scout on initial load
  useEffect(() => {
    runScoutLoop();
  }, []);

  // Sync subsequent tabs if cascade processes complete
  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    addLog(`SELECTED LEAD: ${lead.name} (${lead.industry})`);
  };

  const updateLeadStatus = (index: number, newStatus: Lead["status"]) => {
    const updatedLeads = [...leads];
    updatedLeads[index].status = newStatus;
    setLeads(updatedLeads);
    if (selectedLead && selectedLead.name === updatedLeads[index].name) {
      setSelectedLead(updatedLeads[index]);
    }
    addLog(`STATUS UPDATED: ${updatedLeads[index].name} marked as '${newStatus}'`);
  };

  // Dynamic status changer in CRM panel
  const handleCRMStatusChange = (projId: string, newStatus: OracleProject["status"], pct: number) => {
    setProjectsList(prev => prev.map(p => {
      if (p.id === projId) {
        return { ...p, status: newStatus, completionPct: pct, lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) };
      }
      return p;
    }));
    addLog(`CRM UDPATED: Project ID ${projId} status changed to ${newStatus} (${pct}%)`);
  };

  const addNewCRMProject = () => {
    if (!selectedLead) {
      addLog("WARNING: Select a scouted lead first before adding it to active CRM delivery.");
      return;
    }
    const exists = projectsList.some(p => p.client === selectedLead.name);
    if (exists) {
      addLog(`CRM WARNING: Project for ${selectedLead.name} already exists.`);
      return;
    }
    const newProj: OracleProject = {
      id: `PROJ-${Math.floor(100 + Math.random() * 900)}`,
      title: `${selectedLead.system.replace("Oracle69 ", "")} System Setup`,
      client: selectedLead.name,
      systemName: selectedLead.system,
      status: "Proposed",
      completionPct: 10,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setProjectsList(prev => [newProj, ...prev]);
    addLog(`CRM PROJECT INITIALIZED: Created tracking container for ${selectedLead.name} [${newProj.id}]`);
  };

  return (
    <>
      <div className="print:hidden min-h-screen bg-brand-bg text-gray-200 font-sans antialiased flex flex-col selection:bg-brand-accent-blue/30 selection:text-white">
      {/* Top Professional Telemetry Header */}
      <header className="border-b border-brand-border bg-brand-bg/85 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-accent-blue/10 p-2.5 rounded-lg border border-brand-accent-blue/30 text-brand-accent-blue">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold tracking-tight text-white">ORACLE69</h1>
              <span className="text-[10px] font-mono tracking-widest bg-brand-accent-emerald/10 text-brand-accent-emerald border border-brand-accent-emerald/20 px-2 py-0.5 rounded uppercase">
                Agent-Native
              </span>
            </div>
            <p className="text-xs text-gray-400">Autonomous Business System Execution Engine</p>
          </div>
        </div>

        {/* Global Controls & Cascade Playback */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setShowUserGuide(true);
              addLog("DESK: Opened Interactive System User Guide handbook");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-card hover:bg-brand-border border border-brand-border text-gray-200 text-xs font-semibold uppercase tracking-wide transition transition-transform active:scale-95 cursor-pointer"
            id="btn-open-user-guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand-accent-blue" />
            📖 System User Guide
          </button>

          <button
            onClick={triggerAutoCascade}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-brand-accent-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-medium text-xs tracking-wider uppercase transition shadow-lg shadow-brand-accent-blue/10 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Trigger Full Cascade
          </button>
          
          <div className="h-6 w-px bg-brand-border hidden sm:block" />

          {/* Connected Led indicator */}
          <div className="flex items-center gap-3 bg-brand-card/90 border border-brand-border px-3.5 py-1.5 rounded-lg text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="pulse-led absolute inline-flex h-full w-full rounded-full bg-brand-accent-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-emerald"></span>
            </span>
            <span className="text-gray-300">SYSTEM STABLE</span>
          </div>
        </div>

        {/* 📖 Slideout Overlay Side Drawer: Intelligence Handbook */}
        {showUserGuide && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-brand-bg/85 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowUserGuide(false)}
            />
            
            {/* Drawer Body */}
            <div className="relative w-full max-w-lg md:max-w-xl h-full bg-brand-bg border-l border-brand-border shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 animate-slide-in relative selection:bg-brand-accent-blue/40">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-accent-blue/15 p-2 rounded-lg border border-brand-accent-blue/30 text-brand-accent-blue">
                    <BookOpen className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-md font-display font-bold text-white uppercase tracking-tight">Oracle69 Intelligence Handbook</h3>
                    <p className="text-[11px] text-gray-400 font-mono">System User Guide & Action Directives</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowUserGuide(false)}
                  className="p-1.5 bg-brand-card hover:bg-brand-border border border-brand-border rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                  id="btn-close-user-guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guide Contents */}
              <div className="flex-1 space-y-6 text-xs text-gray-300 leading-relaxed text-left">
                
                {/* Introduction */}
                <section className="bg-brand-card border border-brand-border/60 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase font-display flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-accent-blue" />
                    Autonomous Orchestration Engine
                  </h4>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    Welcome to **Oracle69**, an advanced agentic business automation platform designed to operate recursively inside local markets. It orchestrates a cohesive six-step intelligence pipeline to turn cold signals into standard operations.
                  </p>
                </section>

                {/* The 6 Pipe Loops */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-semibold uppercase text-gray-400 tracking-wider">How to Operate Each Loop Node</h4>
                  
                  {/* Loop 1 */}
                  <div className="space-y-1.5 border-l-2 border-l-brand-accent-blue pl-3">
                    <h5 className="font-semibold text-white text-[11px]">L1. Client Scout (Lead Generation)</h5>
                    <p className="text-gray-400 text-[11px]">
                      Filter market locations (such as *Lagos, Nigeria*) and industry niches (*Schools*, *Clinics*, *SMEs*). The Lead Scout crawls outdated maps, business directories, and platforms. Select any parsed candidate card to examine outreach text copies, target inefficiencies, and decision maker profiles.
                    </p>
                  </div>

                  {/* Loop 2 */}
                  <div className="space-y-1.5 border-l-2 border-l-brand-accent-emerald pl-3">
                    <h5 className="font-semibold text-white text-[11px]">L2. Sales Conversion (ROI Proposer)</h5>
                    <p className="text-gray-400 text-[11px]">
                      Translates identified prospect signals into outcome-based business offerings. Provides precise local pricing brackets (displayed in **Naira ₦**), guarantees estimated return margins, outlines structural milestones, and scripts interactive drip WhatsApp templates.
                    </p>
                  </div>

                  {/* Loop 3 */}
                  <div className="space-y-1.5 border-l-2 border-l-brand-accent-amber pl-3">
                    <h5 className="font-semibold text-white text-[11px]">L3. Diagnostic Deep Dive (Discovery)</h5>
                    <p className="text-gray-400 text-[11px]">
                      Takes transcript notes or client transcripts. Parses raw dialogue lines to automatically build high-level requirements sheets, lists severe operational obstacles, maps as-is vs. to-be timelines, and models custom tech middleware stacks.
                    </p>
                  </div>

                  {/* Loop 4 */}
                  <div className="space-y-1.5 border-l-2 border-purple-500 pl-3">
                    <h5 className="font-semibold text-white text-[11px]">L4. Systems Builder (Delivery Blueprint)</h5>
                    <p className="text-gray-400 text-[11px]">
                      Generates physical code topology graphs in ASCII, crafts API integration stages (such as **Gumloop** webhooks), estimates developer timelines, formats critical risks, and serves interactive pre-launch checklists.
                    </p>
                  </div>

                  {/* Loop 5 */}
                  <div className="space-y-1.5 border-l-2 border-pink-500 pl-3">
                    <h5 className="font-semibold text-white text-[11px]">L5. Operations Timelines (CRM Control)</h5>
                    <p className="text-gray-400 text-[11px]">
                      Manages active system configurations within are local registry database. Instantly detects delivery blockers and proposes direct outreach directives with trigger action webhooks.
                    </p>
                  </div>

                  {/* Loop 6 */}
                  <div className="space-y-1.5 border-l-2 border-cyan-500 pl-3">
                    <h5 className="font-semibold text-white text-[11px]">L6. Knowledge Base (SOP Refinement)</h5>
                    <p className="text-gray-400 text-[11px]">
                      Compiles post-mortem learnings to auto-modify codebase instructions, upgrades operational Standard Operating Procedure (SOP) playbooks, and iterates marketing materials back into the crawler model.
                    </p>
                  </div>
                </div>

                {/* Pro Tips */}
                <section className="bg-brand-card border border-brand-border/60 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase font-display flex items-center gap-1.5">
                    💡 Expert Workflows
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-400">
                    <li>**Trigger Full Cascade**: Click the main cascade command to run an automatic end-to-end simulation across all loops!</li>
                    <li>**Save & Download Playbooks**: Use individual download nodes to download local text logs, or use the master Consolidated Dossier to print elegant documents for physical board review.</li>
                    <li>**Seed Active CRM**: Easily push discovered scouting targets directly to active deployment tracking!</li>
                  </ul>
                </section>

              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-brand-border text-center text-[10px] font-mono text-gray-500 flex justify-between items-center bg-brand-bg">
                <span>ORACLE69 SUPPORT PROTOCOL</span>
                <button 
                  onClick={() => setShowUserGuide(false)}
                  className="text-xs text-brand-accent-blue font-bold tracking-wider hover:underline uppercase"
                >
                  Dismiss Guide
                </button>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Main Container - High-Density UI Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Loop Controls & Event Log Console */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Section: Product Information / Architecture Overview */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-brand-border/60">
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-brand-accent-blue" />
                Autonomous Engine
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">v1.4</span>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Self-improving loops running continuously to discover leads, model custom pricing structures, draft automated architectures, and track operational progress.
            </p>
            
            <div className="space-y-2.5">
              <div className="p-2.5 bg-brand-bg border border-brand-border/80 rounded-lg flex items-start gap-2.5">
                <div className="p-1 rounded bg-brand-accent-blue/10 text-brand-accent-blue shrink-0 mt-0.5">
                  <span className="text-xs font-bold font-mono">L1</span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-200">Lead Scout Loop</h4>
                  <p className="text-[10px] text-gray-500">Crawls localized signal datasets on schools, clinics, and SMEs.</p>
                </div>
              </div>

              <div className="p-2.5 bg-brand-bg border border-brand-border/80 rounded-lg flex items-start gap-2.5">
                <div className="p-1 rounded bg-brand-accent-emerald/10 text-brand-accent-emerald shrink-0 mt-0.5">
                  <span className="text-xs font-bold font-mono">L2</span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-200">Sales Conversion Loop</h4>
                  <p className="text-[10px] text-gray-500">Constructs specific AutoThinker ROI proposal matrices.</p>
                </div>
              </div>

              <div className="p-2.5 bg-brand-bg border border-brand-border/80 rounded-lg flex items-start gap-2.5">
                <div className="p-1 rounded bg-brand-accent-amber/10 text-brand-accent-amber shrink-0 mt-0.5">
                  <span className="text-xs font-bold font-mono">L3</span>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-200">Discovery Deep Dive</h4>
                  <p className="text-[10px] text-gray-500">Maps custom workflow pain items from raw client conversations.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <span className="text-[10px] text-brand-accent-blue font-mono hover:underline cursor-pointer block" onClick={() => addLog("INFO: Using native Gemini SDK models/gemini-3.5-flash for real-time analysis.")}>
                🚀 Powered by models/gemini-3.5-flash
              </span>
            </div>
          </div>

          {/* Telemetry Console Logger */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex-1 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-3">
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-accent-emerald" />
                Live Log Stream
              </h3>
              <button 
                onClick={() => setSystemLogs(["LOGS RESET: Logs flushed."])} 
                className="text-[10px] text-gray-500 hover:text-white font-mono flex items-center gap-1"
                id="btn-clear-logs"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 max-h-[320px] pr-2 scrollbar">
              {systemLogs.map((log, index) => {
                let colorClass = "text-gray-400";
                if (log.includes("COMPLETED") || log.includes("STABLE")) colorClass = "text-brand-accent-emerald";
                if (log.includes("STARTED") || log.includes("TRIGGER")) colorClass = "text-brand-accent-blue";
                if (log.includes("ERROR") || log.includes("WARNING")) colorClass = "text-brand-accent-amber font-semibold";
                return (
                  <div key={index} className={`${colorClass} break-all bg-brand-bg/50 p-1.5 rounded border border-brand-border/30`}>
                    {log}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-brand-border/60 text-[10px] text-gray-500 flex justify-between items-center font-mono">
              <span>ACTIVE PIPELINE</span>
              <span className="animate-pulse text-brand-accent-emerald">● CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Dynamic Interaction & Output Display */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* System Pipeline Cascade Steps Indicator */}
          <section className="bg-brand-card border border-brand-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-display flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-accent-blue" />
                Active Loop Sequence Console
              </h2>
              <span className="text-xs bg-brand-bg px-2.5 py-1 rounded-md border border-brand-border text-gray-400 font-mono">
                Click any node to navigate deep dive control panels
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { id: "lead-gen", label: "1. Lead Scout", icon: Users, color: "border-brand-accent-blue text-brand-accent-blue bg-brand-accent-blue/5", count: leads.length, hasData: leads.length > 0 },
                { id: "sales", label: "2. Sales Conv.", icon: DollarSign, color: "border-brand-accent-emerald text-brand-accent-emerald bg-brand-accent-emerald/5", hasData: !!currentProposal },
                { id: "discovery", label: "3. Discovery", icon: EyeIcon, color: "border-brand-accent-amber text-brand-accent-amber bg-brand-accent-amber/5", hasData: !!discoveryResult },
                { id: "delivery", label: "4. Systems Builder", icon: Layers, color: "border-purple-500 text-purple-400 bg-purple-500/5", hasData: !!deliveryResult },
                { id: "operations", label: "5. Operations", icon: Briefcase, color: "border-pink-500 text-pink-400 bg-pink-500/5", hasData: true },
                { id: "knowledge", label: "6. Knowledge", icon: BookOpen, color: "border-cyan-500 text-cyan-400 bg-cyan-500/5", hasData: !!knowledgeResult }
              ].map((step) => {
                const IconComp = step.icon;
                const isSelected = activeLoopTab === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveLoopTab(step.id);
                      addLog(`SWITCHED VIEW: Focus is now on the ${step.label} console layout.`);
                    }}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? `${step.color} ring-1 ring-offset-2 ring-offset-brand-bg ring-opacity-20 ring-white scale-[1.02]`
                        : "border-brand-border bg-brand-bg hover:border-gray-600 text-gray-400"
                    }`}
                    id={`tab-select-${step.id}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <IconComp className="w-5 h-5" />
                      {step.hasData && (
                        <span className="w-2 h-2 rounded-full bg-brand-accent-emerald animate-pulse shrink-0" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block leading-tight">{step.label}</span>
                      <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                        {step.id === "lead-gen" ? `${step.count} leads populated` : step.hasData ? "Generated" : "Awaiting Run"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Consolidated Report Center / Executive Dossier Export */}
          <section className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-accent-blue/10 p-2 rounded-lg border border-brand-border text-brand-accent-blue shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-display">Oracle69 Executive Report Center</h3>
                <p className="text-[10px] text-gray-400 font-mono">Export consolidated dossier playbooks or trigger local hardcopy printing</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={downloadAllReportsText}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-bg hover:bg-brand-border border border-brand-border text-gray-300 hover:text-white text-xs font-mono rounded-lg transition overflow-hidden cursor-pointer"
                id="btn-download-all-text"
                title="Save complete system analysis report as text"
              >
                <Download className="w-3.5 h-3.5 text-brand-accent-emerald shrink-0" />
                Download TXT
              </button>

              <button
                onClick={downloadAllReportsPDF}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent-blue/20 hover:bg-brand-accent-blue/30 text-brand-accent-blue border border-brand-accent-blue/40 text-xs font-mono rounded-lg transition overflow-hidden cursor-pointer shadow-lg shadow-brand-accent-blue/5 font-semibold"
                id="btn-download-all-pdf"
                title="Download highly styled comprehensive master dossier in PDF format"
              >
                <FileText className="w-3.5 h-3.5 text-brand-accent-blue shrink-0 animate-pulse" />
                Download PDF Dossier
              </button>

              <button
                onClick={() => {
                  addLog("PRINT: Triggered Executive Dossier standard paper print system");
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-card hover:bg-brand-border text-gray-400 hover:text-gray-200 border border-brand-border text-xs font-mono rounded-lg transition cursor-pointer"
                id="btn-print-dossier"
                title="Open browser print dialogue formatted format"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Layout
              </button>
            </div>
          </section>

          {/* Interactive Playground Sandbox */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 min-h-[500px]">
            
            {/* Lead Generation Tab Component */}
            {activeLoopTab === "lead-gen" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-brand-accent-blue" />
                      Lead Generation Loop (Client Scout)
                    </h2>
                    <p className="text-xs text-gray-400">Discover and qualify schools, clinics, or SMEs targeting localized automation bottlenecks.</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {leads.length > 0 && (
                      <button
                        onClick={() => {
                          downloadSingleReport("lead-gen");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-accent-blue font-mono text-[11px] rounded transition cursor-pointer"
                        title="Download Lead Scout dataset"
                        id="btn-dl-lead-gen"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export (.txt)
                      </button>
                    )}
                    <span className="text-[10px] font-mono uppercase bg-brand-bg border border-brand-border px-2.5 py-1 rounded-md text-gray-400">
                      Strategy Status: {dataSourceScout}
                    </span>
                  </div>
                </div>

                {/* Input Controls */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border/60">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold uppercase text-gray-400 tracking-wider">Market Location</label>
                    <input
                      type="text"
                      value={market}
                      onChange={(e) => setMarket(e.target.value)}
                      placeholder="e.g. Lagos, Nigeria"
                      className="bg-brand-card text-white text-xs border border-brand-border focus:border-brand-accent-blue outline-none p-2 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold uppercase text-gray-400 tracking-wider">Target Industry</label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value as any)}
                      className="bg-brand-card text-white text-xs border border-brand-border focus:border-brand-accent-blue outline-none p-2 rounded-lg cursor-pointer"
                    >
                      <option value="Schools">Schools (AutoThinker Reminders)</option>
                      <option value="Clinics">Clinics (Diagnostic Schedulers)</option>
                      <option value="SMEs">SMEs (Operational Workflows)</option>
                      <option value="All">All Categories</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold uppercase text-gray-400 tracking-wider">Scout Channel Source</label>
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="bg-brand-card text-white text-xs border border-brand-border focus:border-brand-accent-blue outline-none p-2 rounded-lg cursor-pointer"
                    >
                      <option value="LinkedIn Scout">LinkedIn Search & Decision Makers</option>
                      <option value="Quora Scout">Quora operational pain queries</option>
                      <option value="Facebook Scout">Facebook Service Complaints Community</option>
                      <option value="Google Maps Scout">Google Maps Outdated Local Webs</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold uppercase text-gray-400 tracking-wider">AI Intelligence Engine</label>
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="bg-brand-card text-white text-xs border border-brand-border focus:border-brand-accent-blue outline-none p-2 rounded-lg cursor-pointer text-brand-accent-blue font-medium"
                    >
                      <option value="gemini">Google Gemini (Analytical)</option>
                      <option value="groq">Groq Llama-3.3 (High-Velocity)</option>
                    </select>
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      onClick={runScoutLoop}
                      disabled={loadingScout}
                      className="w-full md:w-auto h-9 px-5 bg-brand-accent-blue hover:bg-blue-600 transition text-white font-medium text-xs tracking-wide uppercase rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      id="btn-run-scout"
                    >
                      {loadingScout ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      {loadingScout ? "Scouting..." : "Activate Scout Loop"}
                    </button>
                  </div>
                </div>

                {/* Main Results Board */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left list pane of leads */}
                  <div className="lg:col-span-5 flex flex-col gap-3 max-h-[420px] overflow-y-auto scrollbar pr-1">
                    <div className="text-xs font-mono text-gray-400 mb-1 font-semibold flex items-center justify-between">
                      <span>IDENTIFIED PROSPECTS</span>
                      <span>COUNT: {leads.length}</span>
                    </div>

                    {leads.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-brand-border rounded-xl text-gray-500 text-xs">
                        No active leads found in this scope batch. Click &quot;Activate Scout Loop&quot; to fetch live insights.
                      </div>
                    ) : (
                      leads.map((lead, i) => {
                        const isChosen = selectedLead?.name === lead.name;
                        return (
                          <div
                            key={i}
                            onClick={() => handleLeadSelect(lead)}
                            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 ${
                              isChosen
                                ? "bg-brand-accent-blue/10 border-brand-accent-blue/80"
                                : "bg-brand-bg/60 border-brand-border hover:bg-brand-bg"
                            }`}
                            id={`lead-card-${i}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-white leading-snug">{lead.name}</h4>
                                <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-gray-400">
                                  <MapPin className="w-3 h-3 text-gray-500" />
                                  <span>{lead.location}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] text-semibold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                                lead.score >= 85 ? "bg-brand-accent-emerald/10 text-brand-accent-emerald border border-brand-accent-emerald/20" : "bg-brand-accent-amber/10 text-brand-accent-amber border border-brand-accent-amber/20"
                              }`}>
                                Score {lead.score}%
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-400 line-clamp-2 italic">
                              💡 Ineff: {lead.inefficiency}
                            </p>

                            <div className="flex items-center justify-between border-t border-brand-border/40 pt-2 mt-1">
                              <span className="text-[10px] bg-brand-bg px-2 py-0.5 rounded border border-brand-border text-gray-300">
                                {lead.industry}
                              </span>
                              <span className={`text-[10px] font-semibold uppercase ${
                                lead.status === "Booked" ? "text-brand-accent-emerald" :
                                lead.status === "Replied" ? "text-blue-400" :
                                lead.status === "Sent" ? "text-brand-accent-amber" : "text-gray-400"
                              }`}>
                                {lead.status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Detail Pane for Focused Lead */}
                  <div className="lg:col-span-7">
                    {selectedLead ? (
                      <div className="bg-brand-bg p-5 rounded-xl border border-brand-border flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-3">
                          <div>
                            <span className="text-[9px] font-mono bg-brand-accent-blue/10 border border-brand-accent-blue/30 text-brand-accent-blue px-2 py-0.5 rounded uppercase">
                              Active Focus Profile
                            </span>
                            <h3 className="text-base font-semibold text-white mt-1">{selectedLead.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedLead.status}
                              onChange={(e) => {
                                const idx = leads.findIndex(l => l.name === selectedLead.name);
                                if (idx !== -1) {
                                  updateLeadStatus(idx, e.target.value as any);
                                }
                              }}
                              className="bg-brand-card text-gray-300 text-[11px] border border-brand-border font-medium outline-none px-2 py-1.5 rounded cursor-pointer"
                              id="select-lead-status-change"
                            >
                              <option value="Ready for review">Ready for review</option>
                              <option value="Sent">Sent outreach</option>
                              <option value="Replied">Replied back</option>
                              <option value="Booked">Diagnostic booked</option>
                            </select>

                            <button
                              onClick={() => {
                                const notesToInject = `Simulating deep-dive diagnostic discovery for ${selectedLead.name}. Key target operational concerns are: ${selectedLead.inefficiency}. The client's observed signals note: ${selectedLead.signal}. We proposed the ${selectedLead.system}.`;
                                setDiscoveryNotes(notesToInject);
                                addLog(`INJECTED NOTES: Transferred lead parameters into Discovery inputs.`);
                                setActiveLoopTab("discovery");
                              }}
                              className="text-[10px] bg-brand-card hover:bg-brand-border border border-brand-border text-gray-300 px-3 py-1.5 rounded transition"
                            >
                              Push to Discovery
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-brand-card/60 rounded-lg border border-brand-border">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">Decision Maker Partner</span>
                            <p className="text-xs text-white font-medium mt-1">{selectedLead.contactName || "Founding Board"}</p>
                          </div>
                          <div className="p-3 bg-brand-card/60 rounded-lg border border-brand-border">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">Recommended Oracle69 Tech</span>
                            <p className="text-xs text-brand-accent-emerald font-semibold mt-1">{selectedLead.system}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold block">Detected Friction / Signals Crawled</span>
                          <div className="p-3 bg-brand-card/60 border border-brand-border rounded-lg text-xs leading-relaxed text-gray-300 text-left">
                            {selectedLead.signal}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">Targeted Outreach Pitch Draft</span>
                            <button
                              onClick={() => handleCopy(selectedLead.outreach, "outreach-draft")}
                              className="text-[10px] text-brand-accent-blue hover:underline flex items-center gap-1"
                              id="btn-copy-outreach"
                            >
                              {copiedTextId === "outreach-draft" ? <Check className="w-3 h-3 text-brand-accent-emerald" /> : <Copy className="w-3 h-3" />}
                              {copiedTextId === "outreach-draft" ? "Copied" : "Copy Outbox Text"}
                            </button>
                          </div>
                          <div className="p-3 bg-brand-accent-blue/5 border border-brand-accent-blue/20 rounded-lg text-xs text-brand-accent-blue font-mono whitespace-pre-line text-left">
                            &quot;{selectedLead.outreach}&quot;
                          </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                          <button
                            onClick={() => runSalesLoop(selectedLead)}
                            loading={loadingProposal ? "true" : undefined}
                            className="flex-1 bg-brand-accent-emerald hover:bg-emerald-600 shadow-md shadow-brand-accent-emerald/10 text-white font-medium text-xs tracking-wider uppercase py-2.5 rounded-lg transition text-center flex items-center justify-center gap-2"
                            id="btn-transition-sales"
                          >
                            {loadingProposal ? (
                              <RefreshCw className="w-3 px-1 animate-spin" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                            {loadingProposal ? "Synthesizing Proposals..." : "Process to Sales Proposal"}
                          </button>
                          <button
                            onClick={addNewCRMProject}
                            className="bg-brand-card hover:bg-brand-border text-gray-300 border border-brand-border text-xs px-4 py-2.5 rounded-lg tracking-wider transition font-medium"
                          >
                            Add to CRM Live
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center border border-dashed border-brand-border rounded-xl py-24 text-gray-500 text-xs text-center">
                        Select a lead prospect from the left scout results to execute sales proposal matrices.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Sales Conversion Tab Component */}
            {activeLoopTab === "sales" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-brand-accent-emerald" />
                      Sales Conversion Loop (Diagnostic Scheduler)
                    </h2>
                    <p className="text-xs text-gray-400">Generate structured business ROI proposals, milestones pricing maps, and automatic nurturing templates.</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {currentProposal && (
                      <button
                        onClick={() => {
                          downloadSingleReport("sales");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-accent-emerald font-mono text-[11px] rounded transition cursor-pointer"
                        title="Download Sales Proposal report"
                        id="btn-dl-sales-rep"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export (.txt)
                      </button>
                    )}
                    <div className="font-mono text-[10px] bg-brand-bg px-2.5 py-1 rounded border border-brand-border text-gray-400">
                      Pricing Range: {currentProposal ? currentProposal.pricingRange : "N/A"}
                    </div>
                  </div>
                </div>

                {!currentProposal ? (
                  <div className="text-center py-20 border border-dashed border-brand-border rounded-xl">
                    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                      No active sales conversion sequence has compiled yet. Select a prospective client from Lead Generation tab and trigger &quot;Process to Sales Proposal&quot;.
                    </p>
                    <button
                      onClick={() => runSalesLoop()}
                      disabled={loadingProposal || !selectedLead}
                      className="px-5 py-2.5 bg-brand-accent-emerald hover:bg-emerald-600 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition inline-flex items-center gap-2 disabled:opacity-40"
                    >
                      {loadingProposal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      {loadingProposal ? "Synthesizing Proposals..." : "Generate Default Lead Proposal"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    
                    {/* Proposal Details Pane */}
                    <div className="lg:col-span-8 space-y-5">
                      <div className="bg-brand-bg/80 border border-brand-border p-5 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-widest text-brand-accent-emerald uppercase font-bold">Problem Diagnosis</span>
                          <span className="text-[10px] text-gray-500 font-mono">Source: {dataSourceProposal}</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed bg-brand-card/50 p-4 rounded-lg border border-brand-border/60">
                          {currentProposal.problemStatement}
                        </p>
                      </div>

                      <div className="bg-brand-bg/80 border border-brand-border p-5 rounded-xl space-y-4">
                        <span className="text-[10px] font-mono tracking-widest text-brand-accent-blue uppercase font-bold block">Proposed Outcome-Based Solution</span>
                        <div className="p-4 bg-brand-card/50 rounded-lg border border-brand-border/60 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-blue" />
                            <h4 className="text-xs font-semibold text-white">Suggested Stack: {selectedLead?.system || "AutoThinker"}</h4>
                          </div>
                          <p className="text-xs text-gray-300 whitespace-pre-wrap">{currentProposal.proposedSystem}</p>
                        </div>
                      </div>

                      {/* Implementation Phases Milestones */}
                      <div className="bg-brand-bg/80 border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-bold block mb-4">Implementation Delivery Roadmap</span>
                        <div className="space-y-3">
                          {currentProposal.implementationOutline.map((phase, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div className="bg-brand-card/40 border border-brand-border/60 p-2.5 rounded-lg flex-1 text-xs text-gray-200">
                                {phase}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Proposal Action Panels */}
                    <div className="lg:col-span-4 space-y-5">
                      {/* ROI Target Matrix Card */}
                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent-emerald/5 rounded-full blur-xl pointer-events-none" />
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Guaranteed Financial ROI</span>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold font-display text-brand-accent-emerald">Naira Price Range</span>
                        </div>
                        <div className="p-3 bg-brand-bg rounded-lg border border-brand-border text-xs text-brand-accent-emerald font-mono font-semibold">
                          ₦{currentProposal.pricingRange}
                        </div>
                        <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                          🛡️ <span className="text-gray-400">Guaranteed Return:</span> {currentProposal.roiEstimate}
                        </p>
                      </div>

                      {/* WhatsApp Nurture Messages Automation */}
                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl">
                        <div className="flex items-center justify-between pb-2 border-b border-brand-border/60 mb-3">
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">WhatsApp Follow-ups</span>
                          <span className="text-[9px] bg-brand-accent-emerald/10 text-brand-accent-emerald px-1.5 py-0.5 rounded uppercase font-mono">Drip Campaign</span>
                        </div>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar pr-1">
                          {currentProposal.whatsappNurtureSequence.map((nurture, idx) => (
                            <div key={idx} className="p-3 bg-brand-bg/90 border border-brand-border rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-brand-accent-amber font-mono">Sequence Sequence {idx + 1}</span>
                                <button
                                  onClick={() => handleCopy(nurture, `whatsapp-nurture-${idx}`)}
                                  className="text-[9px] text-gray-400 hover:text-white flex items-center gap-1 hover:underline"
                                >
                                  {copiedTextId === `whatsapp-nurture-${idx}` ? <Check className="w-2.5 h-2.5 text-brand-accent-emerald" /> : <Copy className="w-2.5 h-2.5" />}
                                  Copy
                                </button>
                              </div>
                              <p className="text-[11px] text-gray-300 italic font-mono leading-relaxed">&quot;{nurture}&quot;</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Diagnostic Transition Action */}
                      <button
                        onClick={() => {
                          const simulationDiscoveryNotes = `Interactive Diagnostic Discovery for ${selectedLead?.name || "Client"}\nOperational signals identify: ${currentProposal.problemStatement}\nRecommended System structure: ${currentProposal.proposedSystem}`;
                          setDiscoveryNotes(simulationDiscoveryNotes);
                          addLog("TRANSITIONED: Proposal approved by Board. Moving to Step 3 - Discovery Diagnostic Deep dive.");
                          setActiveLoopTab("discovery");
                        }}
                        className="w-full bg-brand-accent-blue py-3 rounded-xl border border-brand-accent-blue/30 text-white font-medium text-xs tracking-wider uppercase hover:bg-blue-600 transition flex items-center justify-center gap-2"
                      >
                        Proceed to System Discovery
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Discovery Loop Tab Component */}
            {activeLoopTab === "discovery" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-brand-accent-amber" />
                      Discovery Loop (Diagnostic Deep Dive)
                    </h2>
                    <p className="text-xs text-gray-400">Process complex client conversations and interview notes to extract exact user stories and structural flows.</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {discoveryResult && (
                      <button
                        onClick={() => {
                          downloadSingleReport("discovery");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg hover:bg-brand-border border border-brand-border text-brand-accent-amber font-mono text-[11px] rounded transition cursor-pointer"
                        title="Download Discovery Deep Dive report"
                        id="btn-dl-disc-rep"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export (.txt)
                      </button>
                    )}
                    <div className="font-mono text-[10px] bg-brand-bg px-2.5 py-1 rounded border border-brand-border text-gray-400">
                      Source: {dataSourceDiscovery}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column Input raw notes */}
                  <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-semibold uppercase text-gray-400">Interactive Conversation logs/Notes Input</label>
                      <textarea
                        value={discoveryNotes}
                        onChange={(e) => setDiscoveryNotes(e.target.value)}
                        rows={11}
                        placeholder="Paste transcripts of WhatsApp chats or zoom diagnostic diagnostic briefs..."
                        className="w-full bg-brand-bg text-gray-200 text-xs p-3.5 rounded-xl border border-brand-border focus:border-brand-accent-amber outline-none font-mono leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-brand-card/40 p-3 rounded-lg border border-brand-border">
                      <span className="text-[10px] text-gray-500 font-mono">CONV SIZE: {discoveryNotes.length} chars</span>
                      <button
                        onClick={runDiscoveryLoop}
                        disabled={loadingDiscovery}
                        className="bg-brand-accent-amber hover:bg-amber-600 text-brand-bg font-bold font-mono text-xs tracking-wider uppercase px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        id="btn-run-discovery"
                      >
                        {loadingDiscovery ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-bg" /> : <Play className="w-3.5 h-3.5 text-brand-bg fill-brand-bg" />}
                        Run Discovery Loop
                      </button>
                    </div>
                  </div>

                  {/* Right Column Processed Output */}
                  <div className="lg:col-span-7">
                    {!discoveryResult ? (
                      <div className="h-full flex flex-col items-center justify-center border border-dashed border-brand-border rounded-xl py-16 px-4 text-center">
                        <Activity className="w-12 h-12 text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400 leading-normal max-w-sm">
                          Pending diagnostic pipeline parse. Feed custom audio call transcript texts in the input box, and trigger &quot;Run Discovery Loop&quot; to compile.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-brand-bg p-5 rounded-xl border border-brand-border space-y-4 text-left">
                        {/* Requirements Document markdown banner */}
                        <div className="p-4 bg-brand-card border border-brand-border rounded-lg">
                          <div className="flex items-center justify-between pb-2 border-b border-brand-border/60 mb-2.5">
                            <span className="text-[10px] font-mono text-brand-accent-amber uppercase font-semibold">Discovery Specification Doc</span>
                            <button
                              onClick={() => handleCopy(discoveryResult.requirementsDoc, "discovery-doc")}
                              className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedTextId === "discovery-doc" ? <Check className="w-3 h-3 text-brand-accent-emerald" /> : <Copy className="w-3 h-3" />}
                              Copy MD
                            </button>
                          </div>
                          <div className="text-xs font-mono text-gray-300 space-y-1">
                            <p className="font-semibold text-white">Proposed Scope Parameters:</p>
                            <p className="text-xs text-gray-400 leading-relaxed font-sans whitespace-pre-wrap">
                              {discoveryResult.requirementsDoc}
                            </p>
                          </div>
                        </div>

                        {/* Current vs To-Be Workflows */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3.5 bg-red-950/10 border border-red-900/30 rounded-lg">
                            <span className="text-[10px] font-mono text-red-400 uppercase font-bold block mb-1">Broken As-Is Process</span>
                            <p className="text-xs text-gray-300 leading-relaxed italic">{discoveryResult.currentWorkflow}</p>
                          </div>
                          
                          <div className="p-3.5 bg-brand-accent-emerald/5 border border-brand-accent-emerald/20 rounded-lg">
                            <span className="text-[10px] font-mono text-brand-accent-emerald uppercase font-bold block mb-2">Pain Targets Identified</span>
                            <div className="space-y-1.5">
                              {discoveryResult.painPoints.map((pain, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px]">
                                  <span className="text-gray-300">• {pain.issue}</span>
                                  <span className="bg-red-500/10 text-red-400 text-[9px] px-1.5 py-0.2 rounded border border-red-500/20 font-mono">
                                    {pain.severity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Proposed modules list and tech stack */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8 p-4 bg-brand-card border border-brand-border rounded-lg">
                            <span className="text-[10px] font-mono text-brand-accent-blue uppercase font-semibold block mb-2">Suggested Operational Modules</span>
                            <div className="space-y-2">
                              {discoveryResult.systemModules.map((mod, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="font-semibold text-white">{mod.moduleName}: </span>
                                  <span className="text-gray-400 text-[11px]">{mod.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-4 p-4 bg-brand-card border border-brand-border rounded-lg text-left">
                            <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block mb-2">Automations Stack</span>
                            <div className="flex flex-wrap gap-1.5">
                              {discoveryResult.techStack.map((tech, idx) => (
                                <span key={idx} className="text-[9px] bg-brand-bg px-2 py-0.5 rounded text-gray-300 border border-brand-border">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Transition button */}
                        <div className="pt-2">
                          <button
                            onClick={runDeliveryLoop}
                            loading={loadingDelivery ? "true" : undefined}
                            className="w-full bg-gradient-to-r from-brand-accent-amber to-amber-600 hover:from-amber-500 text-brand-bg font-bold text-xs tracking-wider uppercase py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                            id="btn-transition-delivery"
                          >
                            {loadingDelivery ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-bg" /> : <ArrowRight className="w-4 h-4 text-brand-bg" />}
                            Compile Dynamic Code Architecture (Delivery)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Loop Tab Component */}
            {activeLoopTab === "delivery" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      Delivery Loop (Systems Builder)
                    </h2>
                    <p className="text-xs text-gray-400">Design agent-native architecture flows, Gumloop workflow sequences, task timetables, and pre-flight validation checklists.</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {deliveryResult && (
                      <button
                        onClick={() => {
                          downloadSingleReport("delivery");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg hover:bg-brand-border border border-brand-border text-purple-400 font-mono text-[11px] rounded transition cursor-pointer"
                        title="Download Delivery Blueprint report"
                        id="btn-dl-deliv-rep"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export (.txt)
                      </button>
                    )}
                    <div className="font-mono text-[10px] bg-brand-bg px-2.5 py-1 rounded border border-brand-border text-gray-400">
                      Source: {dataSourceDelivery}
                    </div>
                  </div>
                </div>

                {!deliveryResult ? (
                  <div className="text-center py-20 border border-dashed border-brand-border rounded-xl">
                    <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                      No architectural delivery map has been compiled. Advance from the Discovery Diagnostic view or click below to build the systems.
                    </p>
                    <button
                      onClick={runDeliveryLoop}
                      disabled={loadingDelivery}
                      className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition inline-flex items-center gap-2 disabled:opacity-40"
                    >
                      {loadingDelivery ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Compile Default Delivery Blueprint
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    
                    {/* Left blueprint details */}
                    <div className="lg:col-span-7 space-y-5">
                      {/* ASCII Diagram representation */}
                      <div className="bg-brand-bg border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block mb-3">System Architecture Pipeline</span>
                        <pre className="bg-brand-card/90 border border-brand-border p-4 rounded-lg font-mono text-[11px] leading-relaxed text-brand-accent-blue overflow-x-auto text-left">
                          {deliveryResult.architecture}
                        </pre>
                      </div>

                      {/* Gumloop/n8n workflows pipeline steps */}
                      <div className="bg-brand-bg border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-brand-accent-blue uppercase tracking-widest font-bold block mb-4">Gumloop Automation Webhook Steps</span>
                        <div className="space-y-3">
                          {deliveryResult.workflowDesign.map((step, i) => (
                            <div key={i} className="flex gap-4 items-center p-3 bg-brand-card/55 rounded-lg border border-brand-border/60">
                              <span className="text-xs font-mono font-bold text-brand-accent-emerald bg-brand-accent-emerald/10 border border-brand-accent-emerald/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                S{i+1}
                              </span>
                              <p className="text-xs text-gray-300 leading-relaxed font-mono">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column sidebar specifications */}
                    <div className="lg:col-span-5 space-y-5">
                      {/* Critical Developer Tasks split list */}
                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3.5">Developer Implementation Breakdowns</span>
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar">
                          {deliveryResult.tasks.map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-brand-bg rounded-lg border border-brand-border/60">
                              <div>
                                <h4 className="text-[11px] font-semibold text-white leading-normal">{task.taskName}</h4>
                                <span className="text-[9px] text-gray-500 font-mono block mt-0.5">{task.role}</span>
                              </div>
                              <span className="bg-brand-accent-blue/10 text-brand-accent-blue rounded text-[10px] font-mono px-2 py-0.5 border border-brand-accent-blue/20">
                                {task.estHours} hrs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risks & Edge check cases */}
                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl border-l-4 border-l-brand-accent-amber">
                        <span className="text-[10px] font-mono text-brand-accent-amber uppercase tracking-widest font-bold block mb-2">Hurdles & Guardrails Checklist</span>
                        <div className="space-y-2">
                          {deliveryResult.risks.map((risk, i) => (
                            <p key={i} className="text-xs text-xs text-gray-300 leading-relaxed flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-brand-accent-amber shrink-0 mt-0.5" />
                              <span>{risk}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Final release deployment validation checklist */}
                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-brand-accent-emerald uppercase tracking-widest font-bold block mb-3.5 font-display">Pre-Launch Deployment Checklist</span>
                        <div className="space-y-2">
                          {deliveryResult.deploymentChecklist.map((chk, i) => (
                            <label key={i} className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer select-none">
                              <input type="checkbox" className="mt-0.5 border-brand-border bg-brand-bg rounded text-brand-accent-emerald focus:ring-brand-accent-emerald shrink-0" defaultChecked={i === 0} />
                              <span>{chk}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Run operations status button */}
                      <button
                        onClick={runOperationsLoop}
                        className="w-full bg-purple-500 py-3 rounded-xl border border-purple-500/30 text-white font-medium text-xs tracking-wider uppercase hover:bg-purple-600 transition flex items-center justify-center gap-2"
                        id="btn-transition-ops"
                      >
                        <Briefcase className="w-4 h-4" />
                        Compile Operations Stability Report
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Operations Loop Tab Component */}
            {activeLoopTab === "operations" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-pink-400" />
                      Operations Loop (Client Deliveries CRM)
                    </h2>
                    <p className="text-xs text-gray-400">Manage active Oracle69 container installations, schedule custom reminders, and inspect backend webhook triggers.</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {operationsResult && (
                      <button
                        onClick={() => {
                          downloadSingleReport("operations");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg hover:bg-brand-border border border-brand-border text-pink-400 font-mono text-[11px] rounded transition cursor-pointer"
                        title="Download Operations Audit report"
                        id="btn-dl-oper-rep"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export (.txt)
                      </button>
                    )}
                    <div className="font-mono text-[10px] bg-brand-bg px-2.5 py-1 rounded border border-brand-border text-gray-400">
                      Source: {dataSourceOperations}
                    </div>
                  </div>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  
                  {/* Left Client Deliveries Panel */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-gray-400 uppercase">Interactive Delivery CRM Pipeline</span>
                      <button 
                        onClick={() => {
                          if (selectedLead) {
                            addNewCRMProject();
                          } else {
                            addLog("WARNING: Please choose or scout a lead prospect on Tab 1 first to seed active CRM instances.");
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent-blue/10 border border-brand-accent-blue/30 text-brand-accent-blue font-medium text-[11px] rounded transition hover:bg-brand-accent-blue/25"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Seed Selected Scout Lead
                      </button>
                    </div>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto scrollbar pr-1">
                      {projectsList.map((project, idx) => (
                        <div key={project.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono bg-brand-card px-2 py-0.5 rounded text-gray-400 border border-brand-border">
                                  {project.id}
                                </span>
                                <h4 className="text-xs font-semibold text-white">{project.client}</h4>
                              </div>
                              <p className="text-xs font-medium text-brand-accent-blue mt-1 font-display">{project.title}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <select
                                value={project.status}
                                onChange={(e) => {
                                  const pcts: Record<string, number> = {
                                    "Active Research": 10,
                                    "Proposed": 25,
                                    "Diagnostic": 45,
                                    "System building": 75,
                                    "Production Live": 100
                                  };
                                  handleCRMStatusChange(project.id, e.target.value as any, pcts[e.target.value] || 50);
                                }}
                                className="bg-brand-card text-[10px] font-mono border border-brand-border outline-none p-1.5 rounded cursor-pointer text-gray-300"
                                id={`select-crm-status-${project.id}`}
                              >
                                <option value="Active Research">Active Research (10%)</option>
                                <option value="Proposed">Proposed (25%)</option>
                                <option value="Diagnostic">Diagnostic (45%)</option>
                                <option value="System building">System building (75%)</option>
                                <option value="Production Live">Production Live (100%)</option>
                              </select>
                              <span className="text-[9px] text-gray-500 font-mono">Last update: {project.lastUpdated}</span>
                            </div>
                          </div>

                          {/* Progress Line bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-gray-500">Milestone Integration Coverage</span>
                              <span className="text-brand-accent-emerald font-semibold">{project.completionPct}%</span>
                            </div>
                            <div className="w-full bg-brand-card h-2 rounded-full overflow-hidden border border-brand-border/60">
                              <div 
                                className="bg-gradient-to-r from-brand-accent-blue to-brand-accent-emerald h-full transition-all duration-500" 
                                style={{ width: `${project.completionPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Status summary audit report */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-gray-400 uppercase">Operational Bottleneck Analysis</span>
                      <button
                        onClick={runOperationsLoop}
                        disabled={loadingOperations}
                        className="text-[10px] text-brand-accent-blue border border-brand-accent-blue/30 px-2 py-1 rounded hover:bg-brand-accent-blue/10 transition"
                        id="btn-trigger-ops-audit"
                      >
                        {loadingOperations ? "Auditing..." : "Recheck Logs"}
                      </button>
                    </div>

                    {!operationsResult ? (
                      <div className="bg-brand-bg border border-brand-border p-5 rounded-xl h-64 flex flex-col justify-center items-center text-center">
                        <Clock className="w-10 h-10 text-gray-600 mb-2" />
                        <p className="text-xs text-gray-500 leading-normal max-w-[240px]">
                          Trigger &quot;Compile Operations Stability Report&quot; to audit risks and automatically map action guidelines.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-brand-bg border border-brand-border p-5 rounded-xl space-y-4 leading-relaxed">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Execution Health Report</span>
                          <p className="text-xs text-gray-300 leading-relaxed bg-brand-card/50 p-3 rounded-lg border border-brand-border/60">
                            {operationsResult.statusReport}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">Detected Blockers</span>
                          {operationsResult.risks.map((r, i) => (
                            <p key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                              <span className="text-red-500">•</span>
                              <span>{r}</span>
                            </p>
                          ))}
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-brand-accent-emerald uppercase tracking-widest block font-bold">Suggested Instant Actions</span>
                          {operationsResult.nextActions.map((act, i) => (
                            <div key={i} className="p-2.5 bg-brand-card/40 border border-brand-border/60 rounded-lg text-xs flex justify-between items-center gap-2">
                              <span className="text-[11px] text-gray-300">{act}</span>
                              <button 
                                onClick={() => addLog(`AUTO TRIGGER: Dispatch notifications to client: ${act.slice(0, 15)}...`)}
                                className="bg-brand-accent-emerald/10 text-brand-accent-emerald border border-brand-accent-emerald/30 text-[9px] font-mono px-2 py-0.5 rounded hover:bg-brand-accent-emerald/30 shrink-0 uppercase"
                              >
                                Trigger
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Transition to compound learning loop */}
                        <div className="pt-2">
                          <button
                            onClick={runKnowledgeLoop}
                            loading={loadingKnowledge ? "true" : undefined}
                            className="w-full bg-pink-600 hover:bg-pink-700 py-2.5 text-white font-medium text-xs tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-2"
                            id="btn-transition-knowledge"
                          >
                            <BookOpen className="w-4 h-4" />
                            Summarize Loops to Knowledge base
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Knowledge Compound learning Loop Tab Component */}
            {activeLoopTab === "knowledge" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      Knowledge Loop (Compound Engineering)
                    </h2>
                    <p className="text-xs text-gray-400">Conduct deep post-mortem analysis of completed deliveries, refine lead scores, draft optimized sales outreach playbooks.</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {knowledgeResult && (
                      <button
                        onClick={() => {
                          downloadSingleReport("knowledge");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg hover:bg-brand-border border border-brand-border text-cyan-400 font-mono text-[11px] rounded transition cursor-pointer"
                        title="Download Knowledge Retro report"
                        id="btn-dl-know-rep"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export (.txt)
                      </button>
                    )}
                    <div className="font-mono text-[10px] bg-brand-bg px-2.5 py-1 rounded border border-brand-border text-gray-400">
                      Source: {dataSourceKnowledge}
                    </div>
                  </div>
                </div>

                {!knowledgeResult ? (
                  <div className="text-center py-20 border border-dashed border-brand-border rounded-xl">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                      No retrospective compound insights have compiled yet. Move from Operations report triggers or click below to pull from database.
                    </p>
                    <button
                      onClick={runKnowledgeLoop}
                      disabled={loadingKnowledge}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition inline-flex items-center gap-2 disabled:opacity-40"
                    >
                      {loadingKnowledge ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Compile Compound Knowledge base
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    
                    {/* Left details lessons and SOP playbooks */}
                    <div className="lg:col-span-7 space-y-5">
                      <div className="bg-brand-bg border border-brand-border p-5 rounded-xl space-y-3">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">Refined System Lessons Learned</span>
                        <div className="space-y-2">
                          {knowledgeResult.lessons.map((lesson, idx) => (
                            <div key={idx} className="p-3 bg-brand-card/50 rounded-lg border border-brand-border/60 text-xs leading-relaxed text-gray-300">
                              💡 {lesson}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-brand-bg border border-brand-border p-5 rounded-xl space-y-3">
                        <span className="text-[10px] font-mono text-brand-accent-emerald uppercase tracking-widest font-bold block">Upgraded Team SOP (Standard Operating Procedures)</span>
                        <div className="space-y-2.5">
                          {knowledgeResult.updatedSOPs.map((sop, idx) => (
                            <div key={idx} className="flex gap-3 items-start text-xs leading-normal text-gray-300">
                              <span className="bg-brand-accent-emerald/15 text-brand-accent-emerald font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-brand-accent-emerald/20">
                                SOP-V{idx+2}
                              </span>
                              <p className="flex-1 italic">{sop}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right side playbooks & proposals version templates */}
                    <div className="lg:col-span-5 space-y-5">
                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-brand-accent-amber uppercase tracking-widest font-bold block mb-4">Optimized outreach drafts</span>
                        <div className="space-y-4">
                          {knowledgeResult.improvedTemplates.map((tmpl, idx) => (
                            <div key={idx} className="p-3.5 bg-brand-bg border border-brand-border rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-gray-400 font-mono uppercase bg-brand-card px-2 py-0.5 rounded">{tmpl.type}</span>
                                <button
                                  onClick={() => handleCopy(tmpl.content, `improved-tmpl-${idx}`)}
                                  className="text-[10px] text-brand-accent-blue hover:underline flex items-center gap-1"
                                >
                                  {copiedTextId === `improved-tmpl-${idx}` ? <Check className="w-3 h-3 text-brand-accent-emerald" /> : <Copy className="w-3 h-3" />}
                                  Copy
                                </button>
                              </div>
                              <p className="text-[11px] font-mono text-gray-300 italic leading-relaxed">&quot;{tmpl.content}&quot;</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-brand-card border border-brand-border p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold block mb-2">Automated Code Base Modifications</span>
                        <div className="space-y-1.5">
                          {knowledgeResult.systemUpgrades.map((upg, idx) => (
                            <p key={idx} className="text-xs text-gray-300 leading-normal flex items-start gap-2">
                              <span className="text-purple-400 font-bold shrink-0">•</span>
                              <span>{upg}</span>
                            </p>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-brand-border/60 mt-4 text-center">
                          <button
                            onClick={async () => {
                              addLog("⚡ RUNTIME UPGRADE SUCCESS: Synced compound learnings into Lead Scout models!");
                              setActiveLoopTab("lead-gen");
                              await runScoutLoop();
                            }}
                            className="bg-brand-accent-blue/10 border border-brand-accent-blue/30 text-brand-accent-blue hover:bg-brand-accent-blue/20 text-xs font-mono py-2 px-4 rounded-lg tracking-wide transition w-full"
                          >
                            Feed Learnings Back to Lead Scout
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-brand-border p-4 bg-brand-bg text-center text-[11px] text-gray-500 font-mono flex flex-wrap justify-between items-center px-8 gap-4 mt-8">
        <div>
          <span>ORACLE69 CONTROL SYSTEM</span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-gray-300 cursor-pointer">Security Protocol Checked</span>
          <span>•</span>
          <span className="hover:text-gray-300 cursor-pointer">Contact System Board</span>
        </div>
      </footer>
    </div>

    {/* 📋 PROFESSIONAL PRINT-ONLY REPORT DOSSIER */}
    <div className="hidden print:block bg-white text-black p-12 font-serif text-sm leading-relaxed text-left max-w-4xl mx-auto">
      {/* Document Header / Letterhead */}
      <div className="border-b-4 border-black pb-4 mb-8">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-bold tracking-tight font-sans">ORACLE69 INTELLIGENCE REPORT</h1>
          <span className="text-xs font-mono uppercase bg-black text-white px-3 py-1 font-semibold">CONFIDENTIAL & PROPRIETARY</span>
        </div>
        <p className="text-xs font-sans text-gray-500 uppercase tracking-widest mt-1">Autonomous Business Execution System Output • Compiled Dossier</p>
      </div>

      {/* Metadata Details Grid */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-200 p-4 rounded mb-8 text-xs font-sans">
        <div>
          <p className="font-bold text-gray-700">DATE GENERATED:</p>
          <p className="text-gray-900 font-mono mt-0.5">{new Date().toLocaleString()}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">TARGET CLIENT ENTERPRISE:</p>
          <p className="text-gray-900 mt-0.5">{selectedLead ? selectedLead.name : "N/A [Global Strategy Mode]"}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">MARKET SECTOR & LOCATION:</p>
          <p className="text-gray-900 mt-0.5">{selectedLead ? `${selectedLead.industry} | ${selectedLead.location}` : "N/A"}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">STRATEGIC INTEGRATION CLASS:</p>
          <p className="text-gray-900 mt-0.5">{selectedLead ? selectedLead.system : "N/A"}</p>
        </div>
      </div>

      {/* SECTION 1: LEAD SCUT REPORT */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-sans font-bold uppercase border-l-4 border-black pl-2.5 mb-4 pb-0.5">Section 1: Market Intelligence & Lead Audit</h2>
        {selectedLead ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-sans text-gray-700">
              <div><span className="font-bold">Entity Name:</span> {selectedLead.name}</div>
              <div><span className="font-bold">Qualifying Score:</span> {selectedLead.score}%</div>
              <div><span className="font-bold">Target Niche:</span> {selectedLead.industry}</div>
              <div><span className="font-bold">Primary Target Location:</span> {selectedLead.location}</div>
              <div><span className="font-bold">Primary Contact Personnel:</span> {selectedLead.contactName || "N/A"}</div>
              <div><span className="font-bold">System Recommendation:</span> {selectedLead.system}</div>
            </div>
            <div className="bg-gray-50 border-l-2 border-gray-400 p-3 italic">
              <p className="text-xs font-bold font-sans text-gray-600 not-italic mb-1 uppercase">Crawled Signal Insight:</p>
              <p className="text-sm">"{selectedLead.signal}"</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block">Target Operational Inefficiencies:</span>
              <p className="text-xs bg-red-50 text-red-900 border border-red-100 p-2.5 rounded font-sans leading-normal">{selectedLead.inefficiency}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block">Cold Outbound Direct Pitch Draft:</span>
              <p className="text-xs bg-blue-50 text-blue-900 border border-blue-100 p-3 rounded font-mono block whitespace-pre-wrap leading-normal">"{selectedLead.outreach}"</p>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">No active client selected in scouting database. Run Loop 1 on dashboard to ingest market feeds.</p>
        )}
      </div>

      {/* SECTION 2: SALES ROI PROPOSAL */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-sans font-bold uppercase border-l-4 border-black pl-2.5 mb-4 pb-0.5">Section 2: Outcome-Based ROI Proposal</h2>
        {currentProposal ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Problem Statement Diagnosis:</span>
              <p className="text-xs leading-normal bg-gray-50 border p-3 rounded">{currentProposal.problemStatement}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Proposed System Architecture:</span>
              <p className="text-xs leading-normal bg-indigo-50/50 border border-indigo-100 p-3 rounded">{currentProposal.proposedSystem}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 font-sans">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded text-xs">
                <span className="font-bold text-emerald-800 uppercase block mb-1">Estimated Financial ROI Guarantee:</span>
                <p className="text-emerald-900 font-medium leading-normal">{currentProposal.roiEstimate}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded text-xs">
                <span className="font-bold text-amber-800 uppercase block mb-1">Naira Milestone Pricing Estimate:</span>
                <p className="text-mono text-amber-900 font-bold leading-normal">₦ {currentProposal.pricingRange}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Roadmap & Implementation Milestones:</span>
              <ol className="list-decimal pl-5 text-xs text-gray-800 space-y-1">
                {currentProposal.implementationOutline.map((p, idx) => (
                  <li key={idx} className="leading-normal">{p}</li>
                ))}
              </ol>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Follow-up WhatsApp Retention Sequences:</span>
              <div className="space-y-2">
                {currentProposal.whatsappNurtureSequence.map((n, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 p-2.5 rounded font-mono text-[11px] leading-normal">
                    <span className="text-xs font-sans text-gray-500 block mb-0.5">Outbox Outreach Message {idx + 1}:</span>
                    "{n}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">No active sales conversion proposal generated yet. Trigger Loop 2 for the selected client.</p>
        )}
      </div>

      {/* SECTION 3: REQS DISCOVERY */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-sans font-bold uppercase border-l-4 border-black pl-2.5 mb-4 pb-0.5">Section 3: Systems Discovery & Diagnostics</h2>
        {discoveryResult ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Proposed Scope Specifications (Markdown Summary):</span>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded text-xs font-mono whitespace-pre-wrap leading-normal text-gray-800">
                {discoveryResult.requirementsDoc}
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Current Broken As-Is Process Workflow:</span>
              <p className="text-xs bg-red-50 text-red-900 border border-red-100 p-3 rounded leading-normal">{discoveryResult.currentWorkflow}</p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Extracted Bottlenecks & Severity Mapping:</span>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-xs font-sans text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase">
                    <tr>
                      <th className="p-2 font-bold">Identified Obstacle / Pain Point</th>
                      <th className="p-2 font-bold w-32 border-l border-gray-200">Severity Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800">
                    {discoveryResult.painPoints.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2 leading-relaxed">{p.issue}</td>
                        <td className="p-2 border-l border-gray-200 font-bold uppercase text-red-700">{p.severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Proposed Functional Solution Modules:</span>
              <div className="grid grid-cols-2 gap-4">
                {discoveryResult.systemModules.map((m, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded text-xs">
                    <span className="font-bold uppercase text-gray-800 block mb-1">{m.moduleName}</span>
                    <p className="text-gray-600 leading-normal">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Recommended Delivery Tech Stack Integration:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {discoveryResult.techStack.map((tech, idx) => (
                  <span key={idx} className="bg-gray-100 border text-gray-800 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">No discovery diagnostics compiled. Undergo diagnostic briefing in Loop 3 to extract requirements.</p>
        )}
      </div>

      {/* SECTION 4: ARCHITECTURE DELIVERY */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-sans font-bold uppercase border-l-4 border-black pl-2.5 mb-4 pb-0.5">Section 4: Technical System Blueprint</h2>
        {deliveryResult ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">System Architecture Topology (ASCII Flow):</span>
              <pre className="p-3 bg-gray-900 text-green-400 font-mono text-[11px] border rounded overflow-x-auto leading-relaxed block text-left">
                {deliveryResult.architecture}
              </pre>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Gumloop API & Webhook Workflow Design Stages:</span>
              <div className="space-y-1.5 text-xs text-gray-800 leading-normal">
                {deliveryResult.workflowDesign.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-bold text-black shrink-0">Stage {idx + 1}:</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Custom Task Allocations & Estimates:</span>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-xs font-sans text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase">
                    <tr>
                      <th className="p-2 font-bold">Target Operational Build Task</th>
                      <th className="p-2 font-bold w-36 border-l border-gray-200">Engineer / Profile</th>
                      <th className="p-2 font-bold w-24 border-l border-gray-200">Est. Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800">
                    {deliveryResult.tasks.map((t, idx) => (
                      <tr key={idx}>
                        <td className="p-2 leading-relaxed">{t.taskName}</td>
                        <td className="p-2 border-l border-gray-200 font-semibold">{t.role}</td>
                        <td className="p-2 border-l border-gray-200 font-mono font-bold text-right">{t.estHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Identified Deployment Obstacles & Mitigations:</span>
              <ul className="list-disc pl-5 text-xs text-gray-800 space-y-1 leading-normal">
                {deliveryResult.risks.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Pre-Launch Checklist Verification:</span>
              <div className="space-y-1">
                {deliveryResult.deploymentChecklist.map((c, idx) => (
                  <label key={idx} className="flex items-start gap-1.5 font-sans text-xs text-gray-800 leading-normal">
                    <span className="font-mono text-[10px] border border-gray-400 px-1 rounded block shrink-0 font-bold bg-white">✓</span>
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">No delivery system blueprint designed yet. Compile design specifications in Loop 4.</p>
        )}
      </div>

      {/* SECTION 5: OPERATIONS CONTROL */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-sans font-bold uppercase border-l-4 border-black pl-2.5 mb-4 pb-0.5">Section 5: Operational Performance & CRM Logs</h2>
        {operationsResult ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Active Project Deployment Trackers:</span>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-xs font-sans text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase">
                    <tr>
                      <th className="p-2 font-bold">Client Entity</th>
                      <th className="p-2 font-bold border-l">Implementation Core</th>
                      <th className="p-2 font-bold border-l">Pipeline Stage</th>
                      <th className="p-2 font-bold border-l text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800">
                    {projectsList.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 font-semibold">{p.client}</td>
                        <td className="p-2 border-l leading-relaxed">{p.title}</td>
                        <td className="p-2 border-l font-bold text-blue-700 uppercase">{p.status}</td>
                        <td className="p-2 border-l font-mono font-bold text-right text-emerald-700">{p.completionPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Operations Performance Audit Report:</span>
              <p className="text-xs bg-gray-50 border p-3 rounded leading-normal">{operationsResult.statusReport}</p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Active Webhook Blocker Alerts:</span>
              <ul className="list-disc pl-5 text-xs text-red-900 space-y-1 leading-normal bg-red-50/50 border border-red-100 p-2.5 rounded">
                {operationsResult.risks.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Immediate Outreach Actions / Guidelines:</span>
              <ol className="list-decimal pl-5 text-xs text-gray-800 space-y-1 leading-normal">
                {operationsResult.nextActions.map((act, idx) => (
                  <li key={idx} className="font-semibold">{act}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">No operation logs analyzed. Ingest operations metrics in Loop 5 to view CRM metrics.</p>
        )}
      </div>

      {/* SECTION 6: KNOWLEDGE RETROSPECTIVE */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-lg font-sans font-bold uppercase border-l-4 border-black pl-2.5 mb-4 pb-0.5">Section 6: Knowledge Retro & SOP Upgrades</h2>
        {knowledgeResult ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Refined Lessons Learned Summary:</span>
              <ul className="list-disc pl-5 text-xs text-gray-800 space-y-1 leading-normal">
                {knowledgeResult.lessons.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Upgraded Standard Operating Procedure (SOP) Directives:</span>
              <div className="space-y-2">
                {knowledgeResult.updatedSOPs.map((sop, idx) => (
                  <div key={idx} className="bg-indigo-50/30 border border-indigo-100 p-2.5 rounded text-xs leading-normal">
                    <span className="font-bold uppercase text-indigo-900 block mb-0.5">SOP Guideline Update v{idx+2}:</span>
                    {sop}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800">Optimized Outbound Conversion Templates:</span>
              <div className="space-y-2">
                {knowledgeResult.improvedTemplates.map((t, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 p-2.5 rounded font-mono text-[11px] leading-normal">
                    <span className="text-xs font-sans text-gray-500 block mb-0.5 uppercase tracking-wide">Template Type: {t.type}</span>
                    "{t.content}"
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-xs uppercase font-sans text-gray-700 block text-gray-800 font-sans">Configured Core System Program Increments:</span>
              <div className="flex flex-wrap gap-2">
                {knowledgeResult.systemUpgrades.map((f, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-900 font-semibold px-2.5 py-1 text-xs rounded border border-purple-200 font-sans">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">No tactical retrospective analyzed. Compile post-mortem reports in Loop 6 to retrieve SOP cards.</p>
        )}
      </div>

      {/* Closing Signature section */}
      <div className="border-t border-gray-300 pt-8 mt-12 flex justify-between text-xs font-sans">
        <div>
          <p className="font-bold">ORACLE69 SYSTEM CHASSIS</p>
          <p className="text-gray-500">Platform Autopilot Orchestrator Node</p>
        </div>
        <div className="text-right">
          <p className="font-bold">BOARD REVIEW AUTHORIZATION</p>
          <p className="text-gray-500">Status: Formatted & Executed</p>
        </div>
      </div>
    </div>
  </>
);
}

// Custom simple replacement since we're not pulling from global SVG packs
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
