// ===================================================
// App.js — Interactive Architecture Reference
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initNavigation();
    initPublicPortal();
    initPublicProjects();
    initDigitalTwins();
    initStackSection();
    initAgentCards();
    initAgentFilters();
    initModal();
    initDependencyMap();
    initInteractionMatrix();
    initEventsTable();
    initWorkflows();
    initScrollReveal();
    initFooter();
});

// ===================================================
// Background Particles
// ===================================================
function initParticles() {
    const container = document.getElementById("bgParticles");
    if (!container) return;
    const count = 40;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.animationDuration = (8 + Math.random() * 16) + "s";
        p.style.animationDelay = (Math.random() * 10) + "s";
        p.style.width = p.style.height = (1 + Math.random() * 3) + "px";
        const colors = [
            "rgba(108,92,231,0.5)",
            "rgba(0,206,201,0.4)",
            "rgba(253,121,168,0.3)",
            "rgba(253,203,110,0.3)"
        ];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
    }
}

// ===================================================
// Navigation
// ===================================================
function initNavigation() {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    const allLinks = document.querySelectorAll(".nav-link");

    // Scroll effect
    window.addEventListener("scroll", () => {
        nav.classList.toggle("scrolled", window.scrollY > 50);
    });

    // Mobile toggle
    if (toggle) {
        toggle.addEventListener("click", () => {
            links.classList.toggle("open");
        });
    }

    // Active section highlight
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (activeLink) {
                    allLinks.forEach(l => l.classList.remove("active"));
                    activeLink.classList.add("active");
                }
            }
        });
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(s => observer.observe(s));

    // Close mobile nav on link click
    allLinks.forEach(link => {
        link.addEventListener("click", () => {
            links.classList.remove("open");
        });
    });
}

// ===================================================
// Public Platform Sections
// ===================================================
function initPublicPortal() {
    const container = document.getElementById("portalModules");
    if (!container || typeof SITE_MODULES === "undefined") return;

    container.innerHTML = SITE_MODULES.map(module => `
        <article class="portal-card reveal">
            <div class="portal-card-top">
                <span>${module.tag}</span>
                <strong>${module.title}</strong>
            </div>
            <p>${module.desc}</p>
            <div class="portal-card-items">
                ${module.items.map(item => `<span>${item}</span>`).join("")}
            </div>
        </article>
    `).join("");
}

function initPublicProjects() {
    const container = document.getElementById("publicProjects");
    if (!container || typeof PUBLIC_PROJECTS === "undefined") return;

    container.innerHTML = PUBLIC_PROJECTS.map(project => `
        <article class="project-card reveal">
            <div class="project-card-header">
                <span class="project-status">${project.status}</span>
                <h3>${project.title}</h3>
            </div>
            <p>${project.desc}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span>${tag}</span>`).join("")}
            </div>
            <div class="project-progress" aria-label="Project progress ${project.progress}%">
                <span style="width:${project.progress}%"></span>
            </div>
        </article>
    `).join("");
}

function initDigitalTwins() {
    const container = document.getElementById("twinDomains");
    if (!container || typeof DIGITAL_TWIN_DOMAINS === "undefined") return;

    container.innerHTML = DIGITAL_TWIN_DOMAINS.map(domain => `
        <article class="twin-card reveal">
            <div class="twin-card-model">${domain.model}</div>
            <h3>${domain.title}</h3>
            <p>${domain.desc}</p>
            <div class="twin-outputs">
                ${domain.outputs.map(output => `<span>${output}</span>`).join("")}
            </div>
        </article>
    `).join("");
}

function initStackSection() {
    const stack = document.getElementById("stackGrid");
    const roadmap = document.getElementById("roadmap");

    if (stack && typeof STACK_GROUPS !== "undefined") {
        stack.innerHTML = STACK_GROUPS.map(group => `
            <article class="stack-card reveal">
                <h3>${group.title}</h3>
                <p>${group.desc}</p>
                <div class="stack-tech">
                    ${group.tech.map(item => `<span>${item}</span>`).join("")}
                </div>
            </article>
        `).join("");
    }

    if (roadmap && typeof ROADMAP_PHASES !== "undefined") {
        roadmap.innerHTML = ROADMAP_PHASES.map(step => `
            <div class="roadmap-step reveal">
                <span class="roadmap-phase">${step.phase}</span>
                <div>
                    <h3>${step.title}</h3>
                    <p>${step.desc}</p>
                </div>
            </div>
        `).join("");
    }
}
// ===================================================
// Agent Cards
// ===================================================
function initAgentCards() {
    const grid = document.getElementById("agentsGrid");
    if (!grid) return;

    AGENTS.forEach(agent => {
        const card = document.createElement("div");
        card.className = "agent-card reveal";
        card.dataset.category = agent.category;
        card.dataset.agentId = agent.id;
        card.style.setProperty("--agent-color", agent.color);

        card.innerHTML = `
            <div class="agent-card-header">
                <div class="agent-card-icon" style="background: ${agent.color}15; border-color: ${agent.color}40;">
                    ${agent.icon}
                </div>
                <div>
                    <div class="agent-card-title">${agent.name}</div>
                    <div class="agent-card-subtitle">${agent.subtitle}</div>
                </div>
            </div>
            <div class="agent-card-desc">${agent.description.substring(0, 150)}${agent.description.length > 150 ? '...' : ''}</div>
            <div class="agent-card-meta">
                <div class="agent-meta-item">
                    <span class="agent-meta-value">${agent.tools.length}</span>
                    <span class="agent-meta-label">Tools</span>
                </div>
                <div class="agent-meta-item">
                    <span class="agent-meta-value">${agent.eventsEmitted.length}</span>
                    <span class="agent-meta-label">Events Out</span>
                </div>
                <div class="agent-meta-item">
                    <span class="agent-meta-value">${agent.eventsConsumed.length}</span>
                    <span class="agent-meta-label">Events In</span>
                </div>
                <div class="agent-meta-item">
                    <span class="agent-meta-value">${agent.models.length}</span>
                    <span class="agent-meta-label">Models</span>
                </div>
            </div>
        `;

        card.addEventListener("click", () => openModal(agent));
        grid.appendChild(card);
    });
}

// ===================================================
// Agent Filters
// ===================================================
function initAgentFilters() {
    const filters = document.querySelectorAll(".agent-filter");
    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            filters.forEach(f => f.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            const cards = document.querySelectorAll(".agent-card");
            cards.forEach(card => {
                if (filter === "all" || card.dataset.category === filter) {
                    card.style.display = "";
                    card.style.opacity = "1";
                    card.style.transform = "translateY(0)";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

// ===================================================
// Modal
// ===================================================
let currentAgent = null;

function initModal() {
    const overlay = document.getElementById("agentModal");
    const closeBtn = document.getElementById("modalClose");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    // Modal tab clicks
    document.querySelectorAll(".modal-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            if (currentAgent) renderModalTab(tab.dataset.tab, currentAgent);
        });
    });
}

function openModal(agent) {
    currentAgent = agent;
    const overlay = document.getElementById("agentModal");
    const icon = document.getElementById("modalIcon");
    const title = document.getElementById("modalTitle");
    const subtitle = document.getElementById("modalSubtitle");

    icon.textContent = agent.icon;
    icon.style.borderColor = agent.color + "40";
    icon.style.background = agent.color + "15";
    title.textContent = agent.name;
    subtitle.textContent = agent.subtitle + " · Autonomy: " + agent.autonomyLevel + " · Schedule: " + agent.schedule;

    // Reset to overview tab
    document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
    document.querySelector('.modal-tab[data-tab="overview"]').classList.add("active");

    renderModalTab("overview", agent);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const overlay = document.getElementById("agentModal");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    currentAgent = null;
}

function renderModalTab(tab, agent) {
    const body = document.getElementById("modalBody");

    switch (tab) {
        case "overview":
            body.innerHTML = `
                <h4>Description</h4>
                <p>${agent.description}</p>
                <h4>Key Characteristics</h4>
                <ul>
                    <li><strong>Autonomy Level:</strong> ${agent.autonomyLevel} — ${getAutonomyDesc(agent.autonomyLevel)}</li>
                    <li><strong>Schedule:</strong> ${agent.schedule}</li>
                    <li><strong>Category:</strong> ${capitalize(agent.category)} Agent</li>
                    <li><strong>Tools:</strong> ${agent.tools.length} specialized capabilities</li>
                    <li><strong>Events Emitted:</strong> ${agent.eventsEmitted.length} event types</li>
                    <li><strong>Events Consumed:</strong> ${agent.eventsConsumed.length} event types</li>
                    <li><strong>Data Models:</strong> ${agent.models.length} database tables</li>
                </ul>
                <h4>Role in the System</h4>
                <p>${getRoleDescription(agent.id)}</p>
            `;
            break;

        case "tools":
            body.innerHTML = `
                <h4>Tools & Capabilities (${agent.tools.length})</h4>
                <p>Each tool is a discrete capability the agent can invoke. Tools are typed by their primary interaction pattern.</p>
                <div class="tool-grid">
                    ${agent.tools.map(t => `
                        <div class="tool-card">
                            <div class="tool-card-name">${t.name}</div>
                            <div class="tool-card-desc">${t.desc}</div>
                            <span class="tool-card-type tool-type-${t.type}">${getToolTypeLabel(t.type)}</span>
                        </div>
                    `).join("")}
                </div>
            `;
            break;

        case "events":
            body.innerHTML = `
                <h4>Events Emitted (${agent.eventsEmitted.length})</h4>
                <p>Events this agent publishes to the Redis Streams event bus.</p>
                <div style="margin-bottom:var(--space-lg)">
                    ${agent.eventsEmitted.map(e => `<span class="event-chip event-chip-emit">📤 ${e}</span>`).join("")}
                </div>
                <h4>Events Consumed (${agent.eventsConsumed.length})</h4>
                <p>Events this agent subscribes to and processes.</p>
                <div>
                    ${agent.eventsConsumed.map(e => `<span class="event-chip event-chip-consume">📥 ${e}</span>`).join("")}
                </div>
            `;
            break;

        case "dependencies":
            const fromDeps = agent.dependencies.from || [];
            const toDeps = agent.dependencies.to || [];
            body.innerHTML = `
                <h4>Receives Data From (${fromDeps.length})</h4>
                <p>Agents that send events consumed by ${agent.name}.</p>
                ${fromDeps.map(d => `
                    <div class="dep-item">
                        <span class="dep-direction dep-from">FROM</span>
                        <strong style="min-width:110px">${d.agent}</strong>
                        <span class="dep-desc">${d.reason}</span>
                    </div>
                `).join("")}
                <h4 style="margin-top:var(--space-xl)">Sends Data To (${toDeps.length})</h4>
                <p>Agents that consume events emitted by ${agent.name}.</p>
                ${toDeps.map(d => `
                    <div class="dep-item">
                        <span class="dep-direction dep-to">TO</span>
                        <strong style="min-width:110px">${d.agent}</strong>
                        <span class="dep-desc">${d.reason}</span>
                    </div>
                `).join("")}
            `;
            break;

        case "models":
            body.innerHTML = `
                <h4>Database Models (${agent.models.length})</h4>
                <p>PostgreSQL tables managed by this agent. All models inherit <code>id</code>, <code>created_at</code>, <code>updated_at</code> from BaseModel.</p>
                <table class="model-table">
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Fields</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agent.models.map(m => `
                            <tr>
                                <td>${m.name}</td>
                                <td>${m.fields}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
            break;

        case "api":
            const endpoints = agent.endpoints || [];
            body.innerHTML = `
                <h4>REST API Endpoints (${endpoints.length})</h4>
                <p>FastAPI routes exposed by this agent. All endpoints require JWT authentication and return JSON responses.</p>
                ${endpoints.length > 0 ? `
                <div class="endpoint-list">
                    ${endpoints.map(ep => `
                        <div class="endpoint-item">
                            <span class="endpoint-method method-${ep.method}">${ep.method}</span>
                            <span class="endpoint-path">${ep.path}</span>
                            <span class="endpoint-desc">${ep.desc}</span>
                        </div>
                    `).join("")}
                </div>
                ` : '<p style="color:var(--text-muted)">No endpoints defined yet.</p>'}
            `;
            break;
    }
}

function getAutonomyDesc(level) {
    const descs = {
        "Auto": "Executes without any approval needed",
        "Notify": "Executes then notifies humans of actions taken",
        "Review": "Proposes actions, waits for human approval before executing",
        "Auto / Review": "Auto for checks, Review for remediation actions",
        "Auto (meta-level)": "Auto for coordination, enforces Review policies on other agents"
    };
    return descs[level] || level;
}

function getToolTypeLabel(type) {
    const labels = { llm: "AI/LLM", api: "External API", db: "Database", compute: "Compute", internal: "Internal" };
    return labels[type] || type;
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function getRoleDescription(id) {
    const roles = {
        veille: "The Veille agent is the system's eyes on the scientific world. It feeds fresh, deduplicated, and tagged content into the ecosystem, enabling researchers to stay current without manual effort. Its output directly drives the Bibliométrie agent's publication matching and the alert system that keeps researchers informed.",
        bibliometrie: "The Bibliométrie agent is the single source of truth for researcher profiles and publication records. By synchronizing with authoritative sources (ORCID, Scopus), it ensures CVs are always current. Its indicator calculations provide the quantitative foundation for research assessment and reporting.",
        simulation: "The Simulation agent is the computational engine of the platform. It abstracts away the complexity of running domain-specific models (hydrology, hydraulics, agronomy) behind a unified interface. Its scenario management and calibration capabilities enable reproducible, traceable scientific computing.",
        optimisation: "The Optimisation agent transforms raw simulation outputs into actionable operational strategies. By applying multi-objective optimization under real-world constraints, it bridges the gap between scientific models and practical decision-making. Its AI-powered explanations make complex trade-offs understandable.",
        mis: "The MIS agent is the operational backbone, tracking everything that keeps the lab running: projects, people, equipment, and budgets. Its AI-powered insights detect issues before they become problems, and its automated reporting saves hours of manual work every month.",
        qualite: "The Qualité agent is the system's immune system — constantly scanning for data inconsistencies, compliance violations, and security anomalies. It ensures that as agents operate autonomously, the data they produce remains trustworthy, compliant, and consistent across the entire platform.",
        orchestrateur: "The Orchestrateur is the conductor of the agent orchestra. It doesn't do domain work itself — instead, it coordinates multi-agent workflows, enforces governance policies, monitors system health, and manages the critical human-in-the-loop review process that keeps autonomous agents safe and accountable."
    };
    return roles[id] || "";
}

// ===================================================
// Dependency Map (Canvas)
// ===================================================
function initDependencyMap() {
    const container = document.getElementById("dependencyMap");
    const canvas = document.getElementById("depCanvas");
    const nodesContainer = document.getElementById("depNodes");
    if (!container || !canvas || !nodesContainer) return;

    const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
    };

    resizeCanvas();

    // Position agents in a circle
    const agentPositions = {};
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    const radiusX = Math.min(container.offsetWidth * 0.36, 320);
    const radiusY = Math.min(container.offsetHeight * 0.34, 180);

    // Place orchestrateur in center, rest in circle
    const circleAgents = AGENTS.filter(a => a.id !== "orchestrateur");
    const orchAgent = AGENTS.find(a => a.id === "orchestrateur");

    circleAgents.forEach((agent, i) => {
        const angle = (i / circleAgents.length) * Math.PI * 2 - Math.PI / 2;
        agentPositions[agent.id] = {
            x: centerX + radiusX * Math.cos(angle),
            y: centerY + radiusY * Math.sin(angle),
            agent
        };
    });

    if (orchAgent) {
        agentPositions[orchAgent.id] = {
            x: centerX,
            y: centerY,
            agent: orchAgent
        };
    }

    // Render nodes
    nodesContainer.innerHTML = "";
    Object.entries(agentPositions).forEach(([id, pos]) => {
        const node = document.createElement("div");
        node.className = "dep-node";
        node.style.left = (pos.x - 60) + "px";
        node.style.top = (pos.y - 18) + "px";
        node.style.background = pos.agent.color + "20";
        node.style.borderColor = pos.agent.color;
        node.style.color = pos.agent.color;
        node.textContent = pos.agent.icon + " " + pos.agent.name.replace("Agent ", "");

        node.addEventListener("click", () => openModal(pos.agent));
        node.addEventListener("mouseenter", () => {
            highlightConnections(id, true);
        });
        node.addEventListener("mouseleave", () => {
            highlightConnections(id, false);
        });

        nodesContainer.appendChild(node);
    });

    // Draw connections
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio;

    function drawConnections(highlightAgent = null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        // Build connection list from dependencies
        const connections = [];
        AGENTS.forEach(agent => {
            if (!agent.dependencies || !agent.dependencies.to) return;
            agent.dependencies.to.forEach(dep => {
                // Find target agent ID by name
                const targetAgent = AGENTS.find(a =>
                    a.name.includes(dep.agent) || dep.agent === "All Agents"
                );
                if (!targetAgent || dep.agent === "All Agents") return;
                connections.push({
                    from: agent.id,
                    to: targetAgent.id,
                    reason: dep.reason
                });
            });
        });

        connections.forEach(conn => {
            const from = agentPositions[conn.from];
            const to = agentPositions[conn.to];
            if (!from || !to) return;

            const isHighlighted = highlightAgent && (conn.from === highlightAgent || conn.to === highlightAgent);
            const isActive = !highlightAgent || isHighlighted;

            ctx.beginPath();

            // Calculate control point for curved line
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const curvature = dist * 0.15;
            const cpX = midX + (dy / dist) * curvature;
            const cpY = midY - (dx / dist) * curvature;

            ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);

            const fromAgent = AGENTS.find(a => a.id === conn.from);
            const alpha = isActive ? 0.6 : 0.08;
            ctx.strokeStyle = (fromAgent ? fromAgent.color : "#6c5ce7") +
                Math.round(alpha * 255).toString(16).padStart(2, "0");
            ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
            ctx.stroke();

            // Draw arrowhead
            if (isActive) {
                const arrowSize = isHighlighted ? 8 : 5;
                const t = 0.85;
                const ax = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x;
                const ay = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y;
                const t2 = 0.86;
                const bx = (1 - t2) * (1 - t2) * from.x + 2 * (1 - t2) * t2 * cpX + t2 * t2 * to.x;
                const by = (1 - t2) * (1 - t2) * from.y + 2 * (1 - t2) * t2 * cpY + t2 * t2 * to.y;
                const angle = Math.atan2(by - ay, bx - ax);

                ctx.beginPath();
                ctx.moveTo(
                    ax - arrowSize * Math.cos(angle - Math.PI / 6),
                    ay - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(ax, ay);
                ctx.lineTo(
                    ax - arrowSize * Math.cos(angle + Math.PI / 6),
                    ay - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill();
            }
        });

        // Draw Orchestrateur connections to all agents (dashed)
        if (orchAgent) {
            const orchPos = agentPositions["orchestrateur"];
            circleAgents.forEach(agent => {
                const pos = agentPositions[agent.id];
                if (!pos) return;

                const isHighlighted = highlightAgent && (agent.id === highlightAgent || highlightAgent === "orchestrateur");
                const isActive = !highlightAgent || isHighlighted;

                ctx.beginPath();
                ctx.setLineDash([4, 6]);
                ctx.moveTo(orchPos.x, orchPos.y);
                ctx.lineTo(pos.x, pos.y);
                const alpha = isActive ? 0.2 : 0.04;
                ctx.strokeStyle = orchAgent.color +
                    Math.round(alpha * 255).toString(16).padStart(2, "0");
                ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
                ctx.stroke();
                ctx.setLineDash([]);
            });
        }

        ctx.restore();
    }

    // Initial draw
    drawConnections();

    // Store for highlighting
    window._depMapDraw = drawConnections;

    // Resize handler
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            // Recalculate positions
            const newCenterX = container.offsetWidth / 2;
            const newCenterY = container.offsetHeight / 2;
            const newRadiusX = Math.min(container.offsetWidth * 0.36, 320);
            const newRadiusY = Math.min(container.offsetHeight * 0.34, 180);

            circleAgents.forEach((agent, i) => {
                const angle = (i / circleAgents.length) * Math.PI * 2 - Math.PI / 2;
                agentPositions[agent.id].x = newCenterX + newRadiusX * Math.cos(angle);
                agentPositions[agent.id].y = newCenterY + newRadiusY * Math.sin(angle);
            });

            if (orchAgent) {
                agentPositions["orchestrateur"].x = newCenterX;
                agentPositions["orchestrateur"].y = newCenterY;
            }

            // Reposition DOM nodes
            Object.entries(agentPositions).forEach(([id, pos]) => {
                const nodes = nodesContainer.querySelectorAll(".dep-node");
                nodes.forEach(n => {
                    const label = pos.agent.icon + " " + pos.agent.name.replace("Agent ", "");
                    if (n.textContent === label) {
                        n.style.left = (pos.x - 60) + "px";
                        n.style.top = (pos.y - 18) + "px";
                    }
                });
            });

            drawConnections();
        }, 150);
    });
}

function highlightConnections(agentId, highlight) {
    if (window._depMapDraw) {
        window._depMapDraw(highlight ? agentId : null);
    }
}

// ===================================================
// Interaction Matrix
// ===================================================
function initInteractionMatrix() {
    const container = document.getElementById("interactionMatrix");
    if (!container) return;

    // Build a map of agent short names
    const agentNames = AGENTS.map(a => ({
        id: a.id,
        short: a.name.replace("Agent ", ""),
        icon: a.icon,
        emitted: a.eventsEmitted,
        consumed: a.eventsConsumed
    }));

    // For each producer → consumer pair, count how many event types flow
    // An event "flows" from A to B if A emits it AND B consumes it
    const matrix = {};
    agentNames.forEach(from => {
        matrix[from.id] = {};
        agentNames.forEach(to => {
            if (from.id === to.id) {
                matrix[from.id][to.id] = { count: 0, events: [] };
                return;
            }
            const shared = from.emitted.filter(e => to.consumed.includes(e));
            matrix[from.id][to.id] = { count: shared.length, events: shared };
        });
    });

    // Build HTML table
    let html = '<table class="interaction-matrix"><thead><tr><th>From \ To</th>';
    agentNames.forEach(a => {
        html += `<th>${a.icon} ${a.short}</th>`;
    });
    html += '</tr></thead><tbody>';

    agentNames.forEach(from => {
        html += `<tr><td>${from.icon} ${from.short}</td>`;
        agentNames.forEach(to => {
            const cell = matrix[from.id][to.id];
            if (from.id === to.id) {
                html += '<td class="matrix-self">—</td>';
            } else if (cell.count === 0) {
                html += '<td style="color:var(--text-muted)">·</td>';
            } else {
                const cls = cell.count >= 3 ? 'matrix-hot' : 'matrix-active';
                const tooltip = cell.events.slice(0, 3).join(', ') + (cell.events.length > 3 ? '…' : '');
                html += `<td class="${cls}" title="${tooltip}">${cell.count}<span class="matrix-cell-tooltip">${cell.count === 1 ? 'event' : 'events'}</span></td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===================================================
// Events Table
// ===================================================
function initEventsTable() {
    const tbody = document.getElementById("eventsTableBody");
    const searchInput = document.getElementById("eventSearch");
    if (!tbody) return;

    function renderEvents(filter = "") {
        const filtered = EVENTS.filter(e => {
            if (!filter) return true;
            const q = filter.toLowerCase();
            return e.name.toLowerCase().includes(q) ||
                   e.producer.toLowerCase().includes(q) ||
                   e.consumers.join(" ").toLowerCase().includes(q) ||
                   e.trigger.toLowerCase().includes(q);
        });

        tbody.innerHTML = filtered.map(e => `
            <tr>
                <td>${e.name}</td>
                <td><span class="event-producer">${e.producer}</span></td>
                <td>${e.consumers.map(c => `<span class="event-consumer">${c}</span>`).join(" ")}</td>
                <td><code style="font-size:0.75rem;background:rgba(255,255,255,0.04);color:var(--text-tertiary)">${e.payload}</code></td>
                <td style="font-size:0.82rem">${e.trigger}</td>
            </tr>
        `).join("");

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:var(--space-2xl)">No events matching "${filter}"</td></tr>`;
        }
    }

    renderEvents();

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderEvents(e.target.value);
        });
    }
}

// ===================================================
// Workflows
// ===================================================
function initWorkflows() {
    const tabs = document.querySelectorAll(".workflow-tab");
    const content = document.getElementById("workflowContent");
    if (!content) return;

    function renderWorkflow(key) {
        const wf = WORKFLOWS[key];
        if (!wf) return;

        content.innerHTML = `
            <div style="margin-bottom:var(--space-xl)">
                <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:var(--space-sm)">${wf.title}</h3>
                <p style="color:var(--text-secondary);font-size:0.9rem">${wf.description}</p>
            </div>
            ${wf.steps.map((step, i) => `
                <div class="workflow-step">
                    <div class="workflow-step-number" style="background:${step.agentColor}">${i + 1}</div>
                    <div class="workflow-step-content">
                        <span class="workflow-step-agent" style="background:${step.agentColor}20;color:${step.agentColor}">${step.agent}</span>
                        <div class="workflow-step-title">${step.title}</div>
                        <div class="workflow-step-desc">${step.desc}</div>
                        <span class="workflow-step-event">📡 ${step.event}</span>
                    </div>
                </div>
            `).join("")}
        `;
    }

    // Initial render
    renderWorkflow("discovery");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderWorkflow(tab.dataset.workflow);
        });
    });
}

// ===================================================
// Scroll Reveal
// ===================================================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    // Observe static elements
    document.querySelectorAll(
        ".layer, .comm-pattern, .framework-card, .governance-card, .team-card, .portal-feature, .portal-card, .project-card, .publication-panel, .twin-map, .twin-card, .stack-card, .roadmap-step, .quickstart-card, .error-pattern-card"
    ).forEach(el => {
        el.classList.add("reveal");
        observer.observe(el);
    });

    // Observe agent cards (already have .reveal class)
    document.querySelectorAll(".agent-card").forEach(el => {
        observer.observe(el);
    });

    // Stagger delay for grids
    document.querySelectorAll(".portal-modules .portal-card, .research-list .project-card, .twin-domains .twin-card, .stack-grid .stack-card, .agents-grid .agent-card, .framework-grid .framework-card, .governance-grid .governance-card, .team-grid .team-card").forEach((el, i) => {
        el.style.transitionDelay = (i * 80) + "ms";
    });

    document.querySelectorAll(".layers-diagram .layer").forEach((el, i) => {
        el.style.transitionDelay = (i * 120) + "ms";
    });

    // Stagger quickstart and error cards
    document.querySelectorAll(".quickstart-grid .quickstart-card").forEach((el, i) => {
        el.style.transitionDelay = (i * 100) + "ms";
    });
    document.querySelectorAll(".error-patterns .error-pattern-card").forEach((el, i) => {
        el.style.transitionDelay = (i * 80) + "ms";
    });
}

// ===================================================
// Footer
// ===================================================
function initFooter() {
    const el = document.getElementById("lastUpdated");
    if (el) {
        el.textContent = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

