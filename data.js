// ===================================================
// Agent Data — Complete registry of all 7 agents
// ===================================================

const AGENTS = [
    {
        id: "veille",
        name: "Agent Veille",
        icon: "🔍",
        subtitle: "Scientific Watch",
        color: "#6c5ce7",
        category: "data",
        description: "Continuously monitors scientific literature sources, collects articles, deduplicates using embeddings, tags by research theme, generates simplified summaries, and sends alerts to researchers.",
        autonomyLevel: "Notify",
        schedule: "Every 6 hours",
        tools: [
            { name: "RSS Collector", desc: "Fetches articles from RSS feeds (arXiv, HAL, PubMed)", type: "api" },
            { name: "CrossRef Client", desc: "Queries CrossRef API for DOI metadata and citations", type: "api" },
            { name: "Scholar Scraper", desc: "Monitors Google Scholar alerts via scholarly library", type: "api" },
            { name: "Embedding Generator", desc: "Generates vector embeddings via Mistral for semantic dedup", type: "llm" },
            { name: "Deduplicator", desc: "pgvector cosine similarity to detect duplicate articles", type: "db" },
            { name: "Thematic Tagger", desc: "Mistral AI classifies articles into lab research themes", type: "llm" },
            { name: "Summarizer", desc: "Generates vulgarized summaries in FR + EN via Mistral", type: "llm" },
            { name: "Alert Dispatcher", desc: "Sends email/in-app notifications matching researcher interests", type: "internal" },
        ],
        eventsEmitted: [
            "article.discovered",
            "article.tagged",
            "article.summarized",
            "alert.sent",
            "veille.cycle.completed"
        ],
        eventsConsumed: [
            "researcher.interests.updated",
            "orchestrateur.veille.trigger",
            "qualite.article.flagged"
        ],
        dependencies: {
            from: [
                { agent: "Bibliométrie", reason: "Receives researcher interest profiles for alert matching" },
                { agent: "Orchestrateur", reason: "Receives manual trigger commands and schedule overrides" },
                { agent: "Qualité", reason: "Receives data quality flags for re-processing" }
            ],
            to: [
                { agent: "Bibliométrie", reason: "Sends discovered articles that match lab researchers" },
                { agent: "Qualité", reason: "Sends raw articles for consistency validation" },
                { agent: "Orchestrateur", reason: "Reports cycle completion and metrics" }
            ]
        },
        models: [
            { name: "Source", fields: "id, name, type (rss|api|scraper), url, config, active, last_scraped" },
            { name: "Article", fields: "id, title, abstract, authors[], doi, url, source_id, published_at, embedding(1024), collected_at" },
            { name: "ArticleTag", fields: "article_id, tag, confidence, method (auto|manual)" },
            { name: "ArticleSummary", fields: "article_id, language (fr|en), summary_text, model_version, generated_at" },
            { name: "AlertRule", fields: "id, user_id, keywords[], themes[], frequency, channels[]" },
            { name: "AlertNotification", fields: "id, rule_id, article_id, sent_at, channel, status" },
        ],
        endpoints: [
            { method: "GET", path: "/api/veille/sources", desc: "List all configured scraping sources" },
            { method: "POST", path: "/api/veille/sources", desc: "Register a new RSS/API source" },
            { method: "GET", path: "/api/veille/articles", desc: "Paginated article list with filters" },
            { method: "GET", path: "/api/veille/articles/{id}", desc: "Full article detail with tags and summaries" },
            { method: "POST", path: "/api/veille/trigger", desc: "Manually trigger a collection cycle" },
            { method: "GET", path: "/api/veille/alerts", desc: "List alert rules for current user" },
            { method: "POST", path: "/api/veille/alerts", desc: "Create a new alert rule" },
        ]
    },
    {
        id: "bibliometrie",
        name: "Agent Bibliométrie",
        icon: "📊",
        subtitle: "Publications & CV",
        color: "#00cec9",
        category: "data",
        description: "Synchronizes researcher publications from ORCID, Google Scholar, and Scopus. Computes bibliometric indicators (h-index, citations), maintains interactive CV profiles, and generates branded PDF exports.",
        autonomyLevel: "Notify",
        schedule: "Weekly sync",
        tools: [
            { name: "ORCID Sync", desc: "Fetches works, affiliations, fundings via ORCID Public API v3", type: "api" },
            { name: "Scholar Sync", desc: "Scrapes Google Scholar profiles via scholarly library", type: "api" },
            { name: "Scopus Client", desc: "Queries Scopus API for publications and citation data", type: "api" },
            { name: "CrossRef Enricher", desc: "Enriches publication metadata (journal impact, open access status)", type: "api" },
            { name: "Indicator Calculator", desc: "Computes h-index, i10-index, citations/year, impact factors", type: "compute" },
            { name: "CV Builder", desc: "Generates interactive web CVs with publication timeline", type: "internal" },
            { name: "PDF Generator", desc: "WeasyPrint-based PDF CV in lab-branded template", type: "internal" },
            { name: "Diff Detector", desc: "Detects changes between syncs for human approval", type: "internal" },
        ],
        eventsEmitted: [
            "publication.synced",
            "publication.new",
            "researcher.indicators.updated",
            "cv.generated",
            "biblio.sync.completed"
        ],
        eventsConsumed: [
            "article.discovered",
            "orchestrateur.biblio.trigger",
            "researcher.profile.updated",
            "project.updated"
        ],
        dependencies: {
            from: [
                { agent: "Veille", reason: "Receives newly discovered articles matching lab researchers" },
                { agent: "MIS", reason: "Receives project updates to link publications to projects" },
                { agent: "Orchestrateur", reason: "Receives sync triggers and schedule overrides" }
            ],
            to: [
                { agent: "MIS", reason: "Sends publication counts and indicator updates for project reports" },
                { agent: "Qualité", reason: "Sends researcher data changes for RGPD compliance check" },
                { agent: "Veille", reason: "Sends updated researcher interests for alert refinement" },
                { agent: "Orchestrateur", reason: "Reports sync status and any errors" }
            ]
        },
        models: [
            { name: "Researcher", fields: "id, name, email, orcid_id, scholar_id, scopus_id, department, role, avatar_url" },
            { name: "Publication", fields: "id, title, abstract, doi, journal, year, type, citation_count, source, open_access" },
            { name: "ResearcherPublication", fields: "researcher_id, publication_id, author_position, is_corresponding" },
            { name: "BiblioIndicator", fields: "researcher_id, metric_name, value, computed_at, previous_value" },
            { name: "CVProfile", fields: "researcher_id, template, custom_sections, visibility, last_generated, pdf_path" },
        ],
        endpoints: [
            { method: "GET", path: "/api/biblio/researchers", desc: "List all researchers with indicators" },
            { method: "GET", path: "/api/biblio/researchers/{id}", desc: "Researcher profile with publications" },
            { method: "POST", path: "/api/biblio/sync/{researcher_id}", desc: "Trigger sync for one researcher" },
            { method: "POST", path: "/api/biblio/sync", desc: "Trigger full sync for all researchers" },
            { method: "GET", path: "/api/biblio/publications", desc: "Paginated publication list" },
            { method: "GET", path: "/api/biblio/cv/{researcher_id}", desc: "Get interactive CV data" },
            { method: "GET", path: "/api/biblio/cv/{researcher_id}/pdf", desc: "Download branded PDF CV" },
        ]
    },
    {
        id: "simulation",
        name: "Agent Simulation",
        icon: "🧪",
        subtitle: "Model Orchestration",
        color: "#e17055",
        category: "compute",
        description: "Orchestrates hydrological, agronomic, and hydraulic simulation models. Manages scenarios with versioned parameters, runs calibrations using Bayesian/GA methods, and tracks all results for comparison.",
        autonomyLevel: "Review",
        schedule: "On-demand",
        tools: [
            { name: "Model Registry", desc: "Register/discover simulation engines with parameter schemas", type: "internal" },
            { name: "SWAT Runner", desc: "Wrapper for SWAT hydrological model (mock in MVP)", type: "compute" },
            { name: "EPANET Runner", desc: "Wrapper for EPANET hydraulic network model (mock in MVP)", type: "compute" },
            { name: "HEC-HMS Runner", desc: "Wrapper for HEC-HMS rainfall-runoff model (mock in MVP)", type: "compute" },
            { name: "FAO-56 Runner", desc: "Crop evapotranspiration and irrigation scheduling", type: "compute" },
            { name: "Scenario Manager", desc: "Create, version, clone, and compare parameter sets", type: "internal" },
            { name: "Bayesian Calibrator", desc: "Bayesian optimization for parameter tuning", type: "compute" },
            { name: "GA Calibrator", desc: "Genetic algorithm for multi-parameter calibration", type: "compute" },
            { name: "Sensitivity Analyzer", desc: "Morris/Sobol sensitivity analysis on model parameters", type: "compute" },
        ],
        eventsEmitted: [
            "simulation.started",
            "simulation.completed",
            "simulation.failed",
            "calibration.completed",
            "scenario.created",
            "scenario.compared"
        ],
        eventsConsumed: [
            "simulation.request",
            "optimisation.simulation.needed",
            "orchestrateur.simulation.trigger"
        ],
        dependencies: {
            from: [
                { agent: "Optimisation", reason: "Receives simulation requests for optimization scenarios" },
                { agent: "Orchestrateur", reason: "Receives task assignments and priority overrides" }
            ],
            to: [
                { agent: "Optimisation", reason: "Sends completed simulation results for optimization" },
                { agent: "MIS", reason: "Reports simulation resource usage and completion metrics" },
                { agent: "Orchestrateur", reason: "Reports task status, errors, and resource consumption" }
            ]
        },
        models: [
            { name: "SimulationModel", fields: "id, name, engine (swat|epanet|hec_hms|fao56), version, parameters_schema, description" },
            { name: "Scenario", fields: "id, model_id, name, parameters, parent_id, created_by, created_at, status" },
            { name: "ModelRun", fields: "id, scenario_id, started_at, completed_at, status, metrics, output_path, log_path" },
            { name: "CalibrationJob", fields: "id, model_id, method (bayesian|ga), objective_function, best_params, iterations, convergence_log" },
            { name: "SensitivityResult", fields: "id, model_id, method (morris|sobol), parameter_name, sensitivity_index, confidence_interval" },
        ],
        endpoints: [
            { method: "GET", path: "/api/simulation/models", desc: "List registered simulation engines" },
            { method: "POST", path: "/api/simulation/models", desc: "Register a new model engine" },
            { method: "GET", path: "/api/simulation/scenarios", desc: "List scenarios with filters" },
            { method: "POST", path: "/api/simulation/scenarios", desc: "Create a new scenario" },
            { method: "POST", path: "/api/simulation/run", desc: "Launch a simulation run" },
            { method: "GET", path: "/api/simulation/runs/{id}", desc: "Get run status and results" },
            { method: "GET", path: "/api/simulation/calibrations", desc: "List calibration jobs" },
        ]
    },
    {
        id: "optimisation",
        name: "Agent Optimisation",
        icon: "⚡",
        subtitle: "Decision Support",
        color: "#fdcb6e",
        category: "compute",
        description: "Proposes operational recommendations for pumping schedules, irrigation strategies, and resource allocation. Uses multi-objective optimization with constraints and generates Pareto-optimal trade-off analyses.",
        autonomyLevel: "Review",
        schedule: "On-demand + post-simulation",
        tools: [
            { name: "Multi-Objective Optimizer", desc: "NSGA-II/MOEA for Pareto-optimal solutions", type: "compute" },
            { name: "Constraint Solver", desc: "Validates solutions against physical/budget/regulatory limits", type: "compute" },
            { name: "Pareto Analyzer", desc: "Generates Pareto front data for trade-off visualization", type: "compute" },
            { name: "Strategy Generator", desc: "Mistral AI explains recommendations in human-readable format", type: "llm" },
            { name: "Cost Estimator", desc: "Estimates energy/water/maintenance costs for each strategy", type: "compute" },
            { name: "Impact Assessor", desc: "Evaluates environmental and operational impact of strategies", type: "llm" },
        ],
        eventsEmitted: [
            "optimisation.started",
            "optimisation.completed",
            "recommendation.generated",
            "pareto.computed",
            "strategy.explained"
        ],
        eventsConsumed: [
            "simulation.completed",
            "optimisation.request",
            "orchestrateur.optimisation.trigger",
            "mis.constraint.updated"
        ],
        dependencies: {
            from: [
                { agent: "Simulation", reason: "Receives completed simulation results as optimization inputs" },
                { agent: "MIS", reason: "Receives budget constraints and project requirements" },
                { agent: "Orchestrateur", reason: "Receives task assignments and priority parameters" }
            ],
            to: [
                { agent: "Simulation", reason: "Requests additional simulation runs for new scenarios" },
                { agent: "MIS", reason: "Sends recommendations and cost estimates for project planning" },
                { agent: "Orchestrateur", reason: "Reports completion, proposes actions for review queue" }
            ]
        },
        models: [
            { name: "OptimizationRun", fields: "id, simulation_ids[], constraints[], method (nsga2|moea), status, started_at, completed_at" },
            { name: "Constraint", fields: "id, run_id, type (physical|budget|regulatory), variable, min_value, max_value, unit" },
            { name: "Recommendation", fields: "id, run_id, strategy_name, parameters, score, explanation, rank, confidence" },
            { name: "ParetoPoint", fields: "id, run_id, objective_values{}, decision_variables{}, is_dominated" },
        ],
        endpoints: [
            { method: "POST", path: "/api/optimisation/run", desc: "Launch a new optimization run" },
            { method: "GET", path: "/api/optimisation/runs/{id}", desc: "Get optimization results and Pareto front" },
            { method: "GET", path: "/api/optimisation/recommendations", desc: "List all generated recommendations" },
            { method: "GET", path: "/api/optimisation/recommendations/{id}", desc: "Recommendation detail with explanation" },
            { method: "GET", path: "/api/optimisation/pareto/{run_id}", desc: "Get Pareto front data for visualization" },
        ]
    },
    {
        id: "mis",
        name: "Agent MIS",
        icon: "📋",
        subtitle: "Management Information System",
        color: "#74b9ff",
        category: "governance",
        description: "Tracks projects (milestones, deliverables, risks), personnel (roles, workload, skills), equipment (inventory, calibration, maintenance), and budgets (allocations, spending, alerts). Generates AI-powered reports and insights.",
        autonomyLevel: "Notify",
        schedule: "Continuous + monthly reports",
        tools: [
            { name: "Project Tracker", desc: "Manages objectives, milestones, deliverables, risks, Gantt data", type: "internal" },
            { name: "HR Manager", desc: "Tracks roles, skills, workload allocation, training records", type: "internal" },
            { name: "Equipment Manager", desc: "Inventory, calibration schedules, maintenance logs, assignments", type: "internal" },
            { name: "Budget Monitor", desc: "Budget lines, commitments, expenses, threshold alerts", type: "internal" },
            { name: "Report Generator", desc: "Mistral AI generates monthly/quarterly reports from aggregated data", type: "llm" },
            { name: "Insight Engine", desc: "Detects bottlenecks, forecasts workload/costs, flags risks", type: "llm" },
            { name: "Gantt/Kanban Exporter", desc: "Generates Gantt chart and Kanban board data for front-end", type: "internal" },
        ],
        eventsEmitted: [
            "project.created",
            "project.updated",
            "milestone.completed",
            "milestone.overdue",
            "budget.threshold.reached",
            "equipment.maintenance.due",
            "report.generated",
            "mis.insight.detected"
        ],
        eventsConsumed: [
            "publication.synced",
            "simulation.completed",
            "optimisation.completed",
            "orchestrateur.mis.trigger",
            "qualite.inconsistency.found"
        ],
        dependencies: {
            from: [
                { agent: "Bibliométrie", reason: "Receives publication metrics for project activity tracking" },
                { agent: "Simulation", reason: "Receives simulation completion for project deliverable tracking" },
                { agent: "Optimisation", reason: "Receives cost estimates for budget planning" },
                { agent: "Qualité", reason: "Receives inconsistency alerts (budget ↔ deliverables)" },
                { agent: "Orchestrateur", reason: "Receives report triggers and schedule commands" }
            ],
            to: [
                { agent: "Optimisation", reason: "Sends budget constraints and project requirements" },
                { agent: "Qualité", reason: "Sends budget/project data for consistency validation" },
                { agent: "Orchestrateur", reason: "Sends milestone events, alerts, and report statuses" }
            ]
        },
        models: [
            { name: "Project", fields: "id, title, description, status, start_date, end_date, budget_total, risk_level, lead_id" },
            { name: "Milestone", fields: "id, project_id, title, due_date, status, deliverables[], completion_pct" },
            { name: "Personnel", fields: "id, name, role, department, skills[], workload_pct, hire_date, training_records[]" },
            { name: "Equipment", fields: "id, name, type, serial_number, location, status, next_calibration, assigned_to, maintenance_log[]" },
            { name: "BudgetLine", fields: "id, project_id, category, allocated, committed, spent, alert_threshold" },
            { name: "MISAlert", fields: "id, entity_type, entity_id, alert_type, message, severity, triggered_at, resolved_at" },
        ],
        endpoints: [
            { method: "GET", path: "/api/mis/projects", desc: "List projects with status filters" },
            { method: "POST", path: "/api/mis/projects", desc: "Create a new project" },
            { method: "GET", path: "/api/mis/projects/{id}", desc: "Project detail with milestones and budget" },
            { method: "GET", path: "/api/mis/personnel", desc: "List personnel with workload" },
            { method: "GET", path: "/api/mis/equipment", desc: "Equipment inventory and status" },
            { method: "GET", path: "/api/mis/budget/{project_id}", desc: "Budget breakdown for a project" },
            { method: "GET", path: "/api/mis/reports", desc: "List generated reports" },
            { method: "POST", path: "/api/mis/reports/generate", desc: "Trigger report generation" },
        ]
    },
    {
        id: "qualite",
        name: "Agent Qualité",
        icon: "✅",
        subtitle: "Quality & Compliance",
        color: "#00b894",
        category: "governance",
        description: "Cross-agent data quality guardian and RGPD compliance enforcer. Validates data consistency (budgets ↔ deliverables, equipment ↔ projects), audits access patterns, manages consent records, and handles right-to-forget requests.",
        autonomyLevel: "Auto / Review",
        schedule: "Daily scans + weekly audits",
        tools: [
            { name: "Data Validator", desc: "Cross-entity consistency checks across all agent databases", type: "db" },
            { name: "RGPD Checker", desc: "Personal data inventory, consent tracking, retention policy enforcement", type: "internal" },
            { name: "Access Auditor", desc: "Anomaly detection on access patterns, permission reviews", type: "internal" },
            { name: "Consent Manager", desc: "Tracks explicit consent for CV auto-updates, data sharing", type: "internal" },
            { name: "Forget Handler", desc: "Cascading deletion workflow for right-to-be-forgotten requests", type: "internal" },
            { name: "Quality Scorer", desc: "Computes data quality scores per entity type with issue breakdown", type: "compute" },
            { name: "Compliance Reporter", desc: "Generates audit-ready compliance reports and dashboards", type: "llm" },
        ],
        eventsEmitted: [
            "qualite.check.completed",
            "qualite.inconsistency.found",
            "qualite.article.flagged",
            "rgpd.consent.updated",
            "rgpd.forget.completed",
            "access.anomaly.detected"
        ],
        eventsConsumed: [
            "article.discovered",
            "publication.synced",
            "project.updated",
            "budget.threshold.reached",
            "researcher.profile.updated",
            "orchestrateur.qualite.trigger"
        ],
        dependencies: {
            from: [
                { agent: "Veille", reason: "Validates incoming article data quality and completeness" },
                { agent: "Bibliométrie", reason: "Checks researcher data changes for RGPD compliance" },
                { agent: "MIS", reason: "Validates budget-deliverable and equipment-project consistency" },
                { agent: "Orchestrateur", reason: "Receives audit triggers and compliance check schedules" }
            ],
            to: [
                { agent: "Veille", reason: "Flags articles with quality issues for re-processing" },
                { agent: "MIS", reason: "Reports data inconsistencies for correction" },
                { agent: "Orchestrateur", reason: "Reports compliance status, critical findings" }
            ]
        },
        models: [
            { name: "AuditLog", fields: "id, agent_name, action, entity_type, entity_id, user_id, timestamp, details, ip_address" },
            { name: "ConsentRecord", fields: "id, user_id, data_type, purpose, consent_given, given_at, revoked_at, method" },
            { name: "ComplianceCheck", fields: "id, check_type, scope, status, findings[], severity, run_at, resolved_at" },
            { name: "DataQualityScore", fields: "id, entity_type, entity_id, score (0-100), issues[], assessed_at, previous_score" },
        ],
        endpoints: [
            { method: "GET", path: "/api/qualite/checks", desc: "List compliance check results" },
            { method: "POST", path: "/api/qualite/checks/trigger", desc: "Trigger a manual compliance audit" },
            { method: "GET", path: "/api/qualite/scores", desc: "Data quality scores by entity" },
            { method: "GET", path: "/api/qualite/consent/{user_id}", desc: "Get consent records for a user" },
            { method: "POST", path: "/api/qualite/forget/{user_id}", desc: "Initiate right-to-forget process" },
            { method: "GET", path: "/api/qualite/audit-log", desc: "Paginated audit trail" },
        ]
    },
    {
        id: "orchestrateur",
        name: "Agent Orchestrateur",
        icon: "🎯",
        subtitle: "Central Coordinator",
        color: "#fd79a8",
        category: "governance",
        description: "The brain of the system. Plans multi-agent tasks as DAGs, resolves inter-agent conflicts, enforces governance policies (approval levels, rate limits), monitors agent health via heartbeats, and manages the human review queue.",
        autonomyLevel: "Auto (meta-level)",
        schedule: "Always running",
        tools: [
            { name: "Task Planner", desc: "Creates DAG-based execution plans spanning multiple agents", type: "internal" },
            { name: "Conflict Resolver", desc: "Mediates when agents disagree (e.g., budget vs. project needs)", type: "llm" },
            { name: "Policy Engine", desc: "Evaluates governance rules: approval levels, rate limits, priorities", type: "internal" },
            { name: "Health Monitor", desc: "Tracks agent heartbeats, error rates, queue depths", type: "internal" },
            { name: "Review Queue Manager", desc: "Manages pending human approvals with priority and expiry", type: "internal" },
            { name: "Event Router", desc: "Intelligent event fanout based on subscriptions and policies", type: "internal" },
            { name: "Dead Letter Handler", desc: "Retries or escalates failed event processing", type: "internal" },
        ],
        eventsEmitted: [
            "orchestrateur.veille.trigger",
            "orchestrateur.biblio.trigger",
            "orchestrateur.simulation.trigger",
            "orchestrateur.optimisation.trigger",
            "orchestrateur.mis.trigger",
            "orchestrateur.qualite.trigger",
            "action.approved",
            "action.rejected",
            "task.plan.created",
            "agent.health.alert"
        ],
        eventsConsumed: [
            "*.completed",
            "*.failed",
            "action.proposed",
            "agent.heartbeat",
            "mis.insight.detected",
            "qualite.inconsistency.found",
            "budget.threshold.reached"
        ],
        dependencies: {
            from: [
                { agent: "All Agents", reason: "Receives completion/failure events and heartbeats from every agent" },
                { agent: "Qualité", reason: "Receives critical compliance findings for escalation" },
                { agent: "MIS", reason: "Receives project insights and budget alerts for coordination" }
            ],
            to: [
                { agent: "All Agents", reason: "Sends triggers, schedule overrides, and approval decisions" }
            ]
        },
        models: [
            { name: "TaskPlan", fields: "id, name, description, dag_definition{}, status, created_by, created_at, completed_at" },
            { name: "TaskStep", fields: "id, plan_id, agent_name, action, params{}, depends_on[], status, result{}, error" },
            { name: "GovernancePolicy", fields: "id, agent_name, action_type, requires_approval, approval_level, max_frequency, priority, active" },
            { name: "AgentHeartbeat", fields: "agent_name, last_seen, status (healthy|degraded|down), error_count, queue_depth, uptime_pct" },
            { name: "ReviewQueueItem", fields: "id, agent_name, action_type, payload{}, proposed_at, expires_at, reviewed_by, decision, rationale" },
        ],
        endpoints: [
            { method: "GET", path: "/api/orchestrateur/status", desc: "System-wide health dashboard" },
            { method: "GET", path: "/api/orchestrateur/agents", desc: "List all agents with health status" },
            { method: "GET", path: "/api/orchestrateur/review-queue", desc: "List pending human reviews" },
            { method: "POST", path: "/api/orchestrateur/review/{id}/approve", desc: "Approve a proposed action" },
            { method: "POST", path: "/api/orchestrateur/review/{id}/reject", desc: "Reject a proposed action" },
            { method: "GET", path: "/api/orchestrateur/tasks", desc: "List task plans and their status" },
            { method: "POST", path: "/api/orchestrateur/trigger/{agent}", desc: "Manually trigger an agent" },
            { method: "GET", path: "/api/orchestrateur/policies", desc: "List governance policies" },
        ]
    }
];

// ===================================================
// ===================================================
// Public Website Modules
// ===================================================
const SITE_MODULES = [
    {
        title: "Home",
        tag: "Public",
        desc: "Mission, research axes, flagship projects, live indicators, partners, and impact stories.",
        items: ["Mission", "Research axes", "Partners"]
    },
    {
        title: "Projects & Conventions",
        tag: "Catalog",
        desc: "Interactive project table with filters by theme, partner, status, funding, and deliverables.",
        items: ["Gantt", "Deliverables", "Partners"]
    },
    {
        title: "Theses & Masters",
        tag: "Training",
        desc: "Timeline of doctoral and master work connected to supervisors, projects, publications, and CVs.",
        items: ["Timeline", "Students", "Supervision"]
    },
    {
        title: "Publications",
        tag: "Bibliometry",
        desc: "Indexed papers, conferences, abstracts, author profiles, and bibliometric indicators.",
        items: ["ORCID", "Scopus", "PDF CV"]
    },
    {
        title: "Scientific Watch",
        tag: "AI Agent",
        desc: "Automated article aggregator with simplified summaries and thematic alerts for researchers.",
        items: ["Alerts", "Summaries", "Tags"]
    },
    {
        title: "Policy Briefs",
        tag: "Impact",
        desc: "Reviewed FR/EN syntheses that translate research outputs into decision-ready recommendations.",
        items: ["FR/EN", "Downloads", "Impact"]
    },
    {
        title: "Training & Events",
        tag: "Community",
        desc: "Training catalog, registrations, congress pages, media galleries, and proceedings.",
        items: ["Programs", "Events", "Media"]
    },
    {
        title: "Open Data Portal",
        tag: "Digital Twins",
        desc: "Datasets, APIs, notebooks, maps, and scenario artifacts exposed when publication rules allow it.",
        items: ["Datasets", "API", "Notebooks"]
    }
];

const PUBLIC_PROJECTS = [
    {
        status: "Flagship",
        title: "Hydraulic network energy optimization",
        desc: "Scenario-based decision support for pressure, losses, leakage detection, and pumping schedules.",
        tags: ["Hydraulic network", "EPANET", "Optimization"],
        progress: 72
    },
    {
        status: "Active",
        title: "Irrigated plot water balance platform",
        desc: "Crop water balance, irrigation scheduling, efficiency indicators, and field data comparison.",
        tags: ["Irrigation", "FAO-56", "Decision support"],
        progress: 54
    },
    {
        status: "Study",
        title: "Watershed risk and planning twin",
        desc: "Rainfall-runoff scenarios, water quality indicators, planning options, and risk visualization.",
        tags: ["Watershed", "SWAT", "HEC-HMS"],
        progress: 31
    }
];

const DIGITAL_TWIN_DOMAINS = [
    {
        title: "Watershed Twin",
        desc: "Rainfall-runoff, water quality, planning scenarios, and climate-risk comparisons.",
        model: "SWAT / HEC-HMS",
        outputs: ["Risk maps", "Hydrographs", "Scenario comparison"]
    },
    {
        title: "Irrigated Plot Twin",
        desc: "Soil-water balance, crop needs, irrigation scheduling, and efficiency tracking.",
        model: "FAO-56 / crop models",
        outputs: ["Water balance", "Irrigation calendar", "Efficiency score"]
    },
    {
        title: "Hydraulic Network Twin",
        desc: "Pressure, flow, leakage, pumping energy, and operational optimization under constraints.",
        model: "EPANET / optimization services",
        outputs: ["Pressure map", "Leak alerts", "Pumping strategy"]
    }
];

const STACK_GROUPS = [
    {
        title: "Prototype now",
        desc: "Keep this HTML/CSS/JS version for demos and architecture explanation.",
        tech: ["Static HTML", "CSS", "Vanilla JS", "Local data.js"]
    },
    {
        title: "Frontend MVP",
        desc: "Move to a component app only when the pages become real and data-driven.",
        tech: ["Current static prototype", "Next.js optional", "React", "Tailwind CSS", "MapLibre/Leaflet", "Chart.js/D3"]
    },
    {
        title: "Backend & MIS",
        desc: "Keep the backend close to your current architecture for APIs, projects, CVs, budgets, equipment, and roles.",
        tech: ["FastAPI", "PostgreSQL", "PostGIS", "pgvector", "SQLAlchemy", "Celery", "Redis"]
    },
    {
        title: "Agents & events",
        desc: "Use the event-driven approach already shown in the architecture and keep orchestration understandable for the MVP.",
        tech: ["Python agents", "Mistral AI", "Redis Streams", "Celery workers", "Human review queue"]
    },
    {
        title: "Security & delivery",
        desc: "Keep strong identity, auditability, deployment, and testing practices without changing the core stack.",
        tech: ["Keycloak", "RBAC", "Audit logs", "Docker", "GitHub Actions", "K6/Locust"]
    }
];

const ROADMAP_PHASES = [
    { phase: "01", title: "Foundation", desc: "Public portal, IAM, database, CI/CD, minimal projects and publications." },
    { phase: "02", title: "Core agents", desc: "Veille, Bibliometry, MIS MVP, CV generation, alerts, and human review queue." },
    { phase: "03", title: "Digital twins", desc: "First scenario explorer, simulation services, calibration logs, maps, and charts." },
    { phase: "04", title: "Optimization", desc: "Recommendations, open data portal, notebooks, and reviewed policy brief drafts." },
    { phase: "05", title: "Industrialization", desc: "Monitoring, load tests, security hardening, backups, and Kubernetes when needed." }
];
// Event Catalog
// ===================================================
const EVENTS = [
    // Veille events
    { name: "article.discovered", producer: "Veille", consumers: ["Bibliométrie", "Qualité", "Orchestrateur"], payload: "{ article_id, title, doi, authors[], source }", trigger: "New article found during scraping cycle" },
    { name: "article.tagged", producer: "Veille", consumers: ["Orchestrateur"], payload: "{ article_id, tags[], confidences[] }", trigger: "Mistral AI completes thematic classification" },
    { name: "article.summarized", producer: "Veille", consumers: ["Orchestrateur"], payload: "{ article_id, summaries: { fr, en } }", trigger: "Summary generation completed" },
    { name: "alert.sent", producer: "Veille", consumers: ["Orchestrateur"], payload: "{ alert_id, user_id, article_id, channel }", trigger: "Notification dispatched to researcher" },
    { name: "veille.cycle.completed", producer: "Veille", consumers: ["Orchestrateur", "Qualité"], payload: "{ cycle_id, articles_found, new_count, duration_s }", trigger: "Scheduled collection cycle finishes" },

    // Bibliométrie events
    { name: "publication.synced", producer: "Bibliométrie", consumers: ["MIS", "Qualité"], payload: "{ researcher_id, source, publications_added, publications_updated }", trigger: "ORCID/Scholar/Scopus sync completes" },
    { name: "publication.new", producer: "Bibliométrie", consumers: ["MIS", "Orchestrateur"], payload: "{ publication_id, researcher_id, title, journal, year }", trigger: "New publication detected during sync" },
    { name: "researcher.indicators.updated", producer: "Bibliométrie", consumers: ["MIS", "Orchestrateur"], payload: "{ researcher_id, h_index, citations_total, i10_index }", trigger: "Indicator recalculation completes" },
    { name: "cv.generated", producer: "Bibliométrie", consumers: ["Orchestrateur"], payload: "{ researcher_id, format (web|pdf), url }", trigger: "CV generation/update completed" },
    { name: "biblio.sync.completed", producer: "Bibliométrie", consumers: ["Orchestrateur"], payload: "{ sync_id, researchers_synced, errors[], duration_s }", trigger: "Full sync cycle completes" },

    // Simulation events
    { name: "simulation.started", producer: "Simulation", consumers: ["Orchestrateur", "MIS"], payload: "{ run_id, scenario_id, model, estimated_duration }", trigger: "Model execution begins" },
    { name: "simulation.completed", producer: "Simulation", consumers: ["Optimisation", "MIS", "Orchestrateur"], payload: "{ run_id, scenario_id, metrics{}, output_path }", trigger: "Model execution succeeds" },
    { name: "simulation.failed", producer: "Simulation", consumers: ["Orchestrateur"], payload: "{ run_id, error, traceback }", trigger: "Model execution errors" },
    { name: "calibration.completed", producer: "Simulation", consumers: ["Orchestrateur"], payload: "{ job_id, model, best_params{}, objective_value }", trigger: "Calibration converges or exhausts iterations" },
    { name: "scenario.created", producer: "Simulation", consumers: ["Orchestrateur"], payload: "{ scenario_id, model, name, parent_id }", trigger: "New scenario registered" },

    // Optimisation events
    { name: "optimisation.completed", producer: "Optimisation", consumers: ["MIS", "Orchestrateur"], payload: "{ run_id, recommendations[], pareto_size }", trigger: "Optimization run completes" },
    { name: "recommendation.generated", producer: "Optimisation", consumers: ["MIS", "Orchestrateur"], payload: "{ rec_id, strategy_name, score, explanation }", trigger: "Strategy ready with explanation" },
    { name: "simulation.request", producer: "Optimisation", consumers: ["Simulation"], payload: "{ correlation_id, model, parameters{} }", trigger: "Optimisation needs new simulation data" },

    // MIS events
    { name: "project.created", producer: "MIS", consumers: ["Qualité", "Orchestrateur"], payload: "{ project_id, title, lead_id, budget }", trigger: "New project registered" },
    { name: "project.updated", producer: "MIS", consumers: ["Qualité", "Orchestrateur", "Bibliométrie"], payload: "{ project_id, changes{} }", trigger: "Project fields modified" },
    { name: "milestone.overdue", producer: "MIS", consumers: ["Orchestrateur"], payload: "{ milestone_id, project_id, due_date, days_overdue }", trigger: "Milestone passes due date uncompleted" },
    { name: "budget.threshold.reached", producer: "MIS", consumers: ["Orchestrateur", "Qualité"], payload: "{ budget_line_id, project_id, spent_pct, threshold }", trigger: "Spending exceeds configured threshold" },
    { name: "equipment.maintenance.due", producer: "MIS", consumers: ["Orchestrateur"], payload: "{ equipment_id, maintenance_type, due_date }", trigger: "Maintenance window approaching" },
    { name: "report.generated", producer: "MIS", consumers: ["Orchestrateur"], payload: "{ report_id, type, period, format }", trigger: "Periodic report generation completed" },

    // Qualité events
    { name: "qualite.inconsistency.found", producer: "Qualité", consumers: ["MIS", "Orchestrateur"], payload: "{ check_id, entity_type, entity_id, issue, severity }", trigger: "Cross-entity validation finds mismatch" },
    { name: "qualite.article.flagged", producer: "Qualité", consumers: ["Veille"], payload: "{ article_id, issues[], recommendation }", trigger: "Article data quality below threshold" },
    { name: "rgpd.consent.updated", producer: "Qualité", consumers: ["Orchestrateur", "Bibliométrie"], payload: "{ user_id, data_type, new_status }", trigger: "Researcher grants/revokes consent" },
    { name: "access.anomaly.detected", producer: "Qualité", consumers: ["Orchestrateur"], payload: "{ user_id, anomaly_type, details, risk_score }", trigger: "Unusual access pattern detected" },

    // Orchestrateur events
    { name: "action.approved", producer: "Orchestrateur", consumers: ["(originating agent)"], payload: "{ action_id, agent, decision, approved_by }", trigger: "Human approves proposed action" },
    { name: "action.rejected", producer: "Orchestrateur", consumers: ["(originating agent)"], payload: "{ action_id, agent, decision, rationale }", trigger: "Human rejects proposed action" },
    { name: "agent.health.alert", producer: "Orchestrateur", consumers: ["(admin)"], payload: "{ agent_name, status, error_count, last_seen }", trigger: "Agent health drops below threshold" },
];

// ===================================================
// Workflow Scenarios
// ===================================================
const WORKFLOWS = {
    discovery: {
        title: "Paper Discovery → CV Update",
        description: "End-to-end flow from discovering a new paper to updating a researcher's CV.",
        steps: [
            { agent: "Veille", agentColor: "#6c5ce7", title: "Collect articles from sources", desc: "Celery task triggers every 6 hours. RSS feeds (arXiv, HAL, PubMed) and CrossRef API are scraped for new articles. Raw articles stored in database.", event: "article.discovered" },
            { agent: "Veille", agentColor: "#6c5ce7", title: "Deduplicate & tag", desc: "Embedding generated via Mistral. pgvector cosine similarity checks for duplicates (threshold: 0.92). Mistral AI classifies article into lab themes (hydrology, irrigation, water quality, etc.).", event: "article.tagged" },
            { agent: "Veille", agentColor: "#6c5ce7", title: "Generate summaries & alerts", desc: "Mistral generates vulgarized summaries in FR + EN. Alert rules checked — if article matches a researcher's interests, notification dispatched.", event: "alert.sent" },
            { agent: "Bibliométrie", agentColor: "#00cec9", title: "Match to lab researchers", desc: "Consumes article.discovered event. Checks if any article author matches a registered lab researcher (by name, ORCID). If match found, publication added to researcher's profile.", event: "publication.new" },
            { agent: "Bibliométrie", agentColor: "#00cec9", title: "Recompute indicators", desc: "h-index, i10-index, total citations recalculated. Diff detected vs. previous values — change proposed for human review if significant.", event: "researcher.indicators.updated" },
            { agent: "Qualité", agentColor: "#00b894", title: "Validate data consistency", desc: "Checks: is the publication already linked? Are author names consistent? Is the DOI valid? Consent status verified for CV auto-update.", event: "qualite.check.completed" },
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Coordinate & approve", desc: "If CV update requires approval (policy check), item added to review queue. Human approves → CV regenerated. Audit log entry created.", event: "action.approved" },
        ]
    },
    simulation: {
        title: "Simulation → Optimization → Recommendation",
        description: "Full pipeline from running a simulation model to generating actionable recommendations.",
        steps: [
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Task plan created", desc: "User or automated trigger creates a multi-step task plan: run simulation → optimize → generate strategy. DAG created with dependencies.", event: "task.plan.created" },
            { agent: "Simulation", agentColor: "#e17055", title: "Execute model run", desc: "Scenario parameters loaded. Model runner (SWAT/EPANET/FAO-56) invoked asynchronously via Celery. Progress tracked. Results stored with output path.", event: "simulation.completed" },
            { agent: "Optimisation", agentColor: "#fdcb6e", title: "Run multi-objective optimization", desc: "Consumes simulation results. NSGA-II optimizer explores solution space under constraints (pressure limits, budget caps, flow requirements). Pareto front computed.", event: "pareto.computed" },
            { agent: "Optimisation", agentColor: "#fdcb6e", title: "Generate recommendations", desc: "Top strategies selected from Pareto front. Mistral AI generates human-readable explanations with trade-off analysis and cost estimates.", event: "recommendation.generated" },
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Review & approve", desc: "Recommendations placed in review queue (Review-level action). Domain expert reviews trade-offs, approves preferred strategy.", event: "action.approved" },
            { agent: "MIS", agentColor: "#74b9ff", title: "Update project records", desc: "Approved strategy linked to project deliverables. Budget impact recorded. Milestone status updated if applicable.", event: "project.updated" },
        ]
    },
    compliance: {
        title: "Compliance Audit Workflow",
        description: "Scheduled compliance checks across all agent data with escalation.",
        steps: [
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Trigger daily audit", desc: "Celery Beat fires daily at 02:00 UTC. Orchestrateur sends trigger to Qualité agent with scope: all entities.", event: "orchestrateur.qualite.trigger" },
            { agent: "Qualité", agentColor: "#00b894", title: "Run consistency checks", desc: "Cross-agent validation: budgets match deliverables, equipment assignments valid, researcher consent records current, publication DOIs resolvable.", event: "qualite.check.completed" },
            { agent: "Qualité", agentColor: "#00b894", title: "Compute quality scores", desc: "Each entity type scored 0-100 based on completeness, consistency, and freshness. Issues categorized by severity (info, warning, critical).", event: "qualite.inconsistency.found" },
            { agent: "Qualité", agentColor: "#00b894", title: "Check access patterns", desc: "Audit log analysis: unusual access times, excessive permission usage, failed auth attempts flagged.", event: "access.anomaly.detected" },
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Escalate critical findings", desc: "Critical issues → immediate notification to admins. Warnings → added to weekly digest. Info → logged for monthly report.", event: "agent.health.alert" },
            { agent: "MIS", agentColor: "#74b9ff", title: "Record & track remediation", desc: "Compliance issues created as tasks in MIS. Assigned to responsible personnel. Tracked to resolution with due dates.", event: "project.updated" },
        ]
    },
    report: {
        title: "Automated Monthly Report",
        description: "AI-generated monthly report aggregating activity across all agents.",
        steps: [
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Monthly trigger fired", desc: "First Monday of each month. Orchestrateur creates task plan: gather data from all agents → aggregate → generate report → review.", event: "orchestrateur.mis.trigger" },
            { agent: "MIS", agentColor: "#74b9ff", title: "Aggregate project metrics", desc: "Queries all projects: milestones completed, budget utilization, equipment usage, personnel workload. Consolidates into summary structures.", event: "report.generated" },
            { agent: "Bibliométrie", agentColor: "#00cec9", title: "Compile publication stats", desc: "Monthly publication count, new citations, indicator changes per researcher. Lab-wide bibliometric summary.", event: "biblio.sync.completed" },
            { agent: "Veille", agentColor: "#6c5ce7", title: "Summarize scientific landscape", desc: "Top themes detected in collected articles, trending topics, notable papers. Mistral generates landscape overview.", event: "veille.cycle.completed" },
            { agent: "MIS", agentColor: "#74b9ff", title: "Generate report with Mistral", desc: "All data aggregated. Mistral AI generates structured monthly report with executive summary, metrics, insights, and recommendations.", event: "report.generated" },
            { agent: "Orchestrateur", agentColor: "#fd79a8", title: "Submit for director review", desc: "Report placed in review queue (Review-level). Scientific director reviews, edits if needed, approves for distribution.", event: "action.approved" },
        ]
    }
};



