export const gotrootTutorialMeta = {
  id: "gotroot-orion-echo",
  title: "Operation Orion Echo",
  subtitle: "GOTROOT enterprise APT range",
  sourcePath: "data/gotroot-scenario",
  premise:
    "A student reconstructs a vendor-to-customer trusted update path across public, DMZ, control, corporate, DevOps, release, and ANRC customer zones.",
};

export const gotrootTutorialNodes = [
  { id: "outside", label: "Student", zone: "Outside", x: 5, y: 52, color: "#111827" },
  { id: "edge-proxy", label: "Edge Proxy", zone: "Public", x: 15, y: 31, color: "#0ea5e9" },
  { id: "public-site", label: "Public Site", zone: "DMZ", x: 27, y: 21, color: "#38bdf8" },
  { id: "public-docs", label: "Public Docs", zone: "DMZ", x: 27, y: 36, color: "#38bdf8" },
  { id: "vendor-portal", label: "Vendor Portal", zone: "DMZ", x: 29, y: 48, color: "#38bdf8" },
  { id: "support-portal", label: "Support Portal", zone: "DMZ", x: 28, y: 60, color: "#38bdf8" },
  { id: "session-agent", label: "Session Agent", zone: "Control", x: 39, y: 72, color: "#8b5cf6" },
  { id: "c2-emulator", label: "C2 Emulator", zone: "Control", x: 47, y: 47, color: "#8b5cf6" },
  { id: "flag-service", label: "Flag Service", zone: "Control", x: 57, y: 73, color: "#8b5cf6" },
  { id: "lab-controller", label: "Lab Controller", zone: "Control", x: 60, y: 86, color: "#8b5cf6" },
  { id: "audit-log", label: "Audit Log", zone: "Control", x: 63, y: 62, color: "#8b5cf6" },
  { id: "corp-sso", label: "Corp SSO", zone: "Corp", x: 42, y: 35, color: "#f59e0b" },
  { id: "intranet", label: "Intranet", zone: "Corp", x: 43, y: 22, color: "#f59e0b" },
  { id: "hr-directory", label: "HR Directory", zone: "Corp", x: 49, y: 12, color: "#f59e0b" },
  { id: "wiki", label: "Wiki", zone: "Corp", x: 53, y: 18, color: "#f59e0b" },
  { id: "ticket-service", label: "Tickets", zone: "Corp", x: 53, y: 37, color: "#f59e0b" },
  { id: "mail-web", label: "Mail Web", zone: "Corp", x: 60, y: 30, color: "#f59e0b" },
  { id: "doc-portal", label: "Doc Portal", zone: "Corp", x: 59, y: 48, color: "#f59e0b" },
  { id: "corp-db", label: "Corp DB", zone: "Corp", x: 47, y: 51, color: "#f59e0b" },
  { id: "source-repo", label: "Source Repo", zone: "DevOps", x: 64, y: 19, color: "#10b981" },
  { id: "package-registry", label: "Registry", zone: "DevOps", x: 66, y: 34, color: "#10b981" },
  { id: "build-server", label: "Build Server", zone: "DevOps", x: 71, y: 42, color: "#10b981" },
  { id: "ci-runner", label: "CI Runner", zone: "DevOps", x: 74, y: 24, color: "#10b981" },
  { id: "signing-service", label: "Signing", zone: "Release", x: 81, y: 29, color: "#eab308" },
  { id: "release-db", label: "Release DB", zone: "Release", x: 83, y: 43, color: "#eab308" },
  { id: "update-server", label: "Update Server", zone: "Release", x: 87, y: 53, color: "#eab308" },
  { id: "monitoring", label: "Monitoring", zone: "ANRC", x: 80, y: 63, color: "#fb7185" },
  { id: "customer-app", label: "EchoAgent", zone: "ANRC", x: 76, y: 75, color: "#fb7185" },
  { id: "customer-api", label: "Customer API", zone: "ANRC", x: 88, y: 77, color: "#fb7185" },
  { id: "object-store", label: "Object Store", zone: "ANRC", x: 96, y: 59, color: "#fb7185" },
];

export const gotrootTutorialZones = [
  { id: "outside", label: "Outside", x: 4 },
  { id: "public", label: "Public", x: 15 },
  { id: "dmz", label: "DMZ", x: 28 },
  { id: "control", label: "Control", x: 47 },
  { id: "corp", label: "Corp", x: 53 },
  { id: "devops", label: "DevOps", x: 69 },
  { id: "release", label: "Release", x: 84 },
  { id: "anrc", label: "ANRC", x: 91 },
];

export const gotrootTutorialStages = [
  {
    id: "recon",
    number: "00",
    title: "External Recon",
    shortTitle: "Recon Context",
    category: "Recon",
    location: "Public / DMZ",
    color: "#0ea5e9",
    sourceHook: "stage_gating.md 3.1",
    objective: "Fetch at least three public routes and confirm /service/build-info metadata.",
    narrative: "The attacker starts with public signals: product pages, support paths, release notes, and build metadata.",
    gate: {
      mode: "Passive",
      owner: "edge-proxy + session-agent",
      condition: "Three distinct public route hits within five minutes, then build-info response is inspected.",
      flag: "flag_0_recon_context",
    },
    mitre: [
      "T1591 Gather Victim Org Information",
      "T1592.002 Gather Victim Host Information: Software",
    ],
    activeNodes: ["outside", "edge-proxy", "public-site", "public-docs", "vendor-portal", "support-portal", "session-agent"],
    activeLinks: [
      ["outside", "edge-proxy"],
      ["edge-proxy", "public-site"],
      ["edge-proxy", "public-docs"],
      ["edge-proxy", "vendor-portal"],
      ["edge-proxy", "support-portal"],
      ["edge-proxy", "session-agent"],
    ],
    evidence: ["/", "/portal/", "/docs/", "/support/", "/releases/public", "/service/build-info"],
    code: {
      title: "Public metadata contract",
      language: "http",
      body: "GET /service/build-info\n200 { git_sha, built_at, service_account, channel }",
    },
  },
  {
    id: "initial",
    number: "01",
    title: "Initial Access",
    shortTitle: "Support Entry",
    category: "Foothold",
    location: "DMZ / Support Portal",
    color: "#38bdf8",
    sourceHook: "stage_gating.md 3.2 and 6.1",
    objective: "Use the lab-controlled support preview weakness to read the post-exploit marker.",
    narrative: "A support ticket preview boundary becomes the first entry point, but the range only exposes a safe marker path.",
    gate: {
      mode: "Active",
      owner: "support-portal",
      condition: "Post-exploit marker file is obtained through the guarded preview path.",
      flag: "flag_1_initial_access",
    },
    mitre: ["T1190 Exploit Public-Facing Application", "T1059.004 Unix Shell"],
    activeNodes: ["outside", "edge-proxy", "support-portal", "session-agent", "c2-emulator"],
    activeLinks: [
      ["outside", "edge-proxy"],
      ["edge-proxy", "support-portal"],
      ["support-portal", "session-agent"],
      ["support-portal", "c2-emulator"],
    ],
    evidence: ["POST /preview", "/var/lib/support-portal/.post_exploit_marker", "session_id", "c2-emulator hint"],
    code: {
      title: "Vulnerable render boundary, principle only",
      language: "python",
      body:
        "jinja_env = Environment(autoescape=False)\n" +
        "template = jinja_env.from_string(body)\n" +
        "return template.render(env=training_env)\n\n" +
        "# Exact payload text is intentionally outside this UI.",
    },
  },
  {
    id: "foothold",
    number: "02",
    title: "Foothold Orientation",
    shortTitle: "Bounded Probes",
    category: "Discovery",
    location: "DMZ / Audit Hook",
    color: "#60a5fa",
    sourceHook: "stage_gating.md 3.3",
    objective: "Run three allowlisted orientation probes and read /tmp/orion_stage2.txt.",
    narrative: "The first foothold is not victory. The learner stabilizes context using small, logged probes.",
    gate: {
      mode: "Passive",
      owner: "support-portal post-exploit shim",
      condition: "Three approved probes are recorded by audit-log.",
      flag: "flag_2_foothold_execution",
    },
    mitre: ["T1082 System Information Discovery", "T1083 File and Directory Discovery"],
    activeNodes: ["support-portal", "session-agent", "audit-log", "flag-service"],
    activeLinks: [
      ["support-portal", "session-agent"],
      ["support-portal", "audit-log"],
      ["session-agent", "flag-service"],
    ],
    evidence: ["/etc/hostname", "id", "/proc/self/environ names", "list /opt/support-portal", "/tmp/orion_stage2.txt"],
    code: {
      title: "Probe allowlist",
      language: "json",
      body:
        "[\"id\"]\n" +
        "[\"hostname\"]\n" +
        "[\"ls\", \"/opt/support-portal\"]\n" +
        "[\"cat\", \"/tmp/orion_stage2.txt\"]",
    },
  },
  {
    id: "c2",
    number: "03",
    title: "Safe C2 Emulation",
    shortTitle: "Beacon Register",
    category: "Control",
    location: "Control Net",
    color: "#8b5cf6",
    sourceHook: "api_contracts.md 12 and stage_gating.md 2",
    objective: "Register a bounded beacon through c2-emulator and inspect the closed action loop.",
    narrative: "The platform teaches operator flow without malware, shell execution, arbitrary egress, or persistence.",
    gate: {
      mode: "Passive",
      owner: "c2-emulator",
      condition: "First valid POST /beacon/register for the session.",
      flag: "flag_3_persistence_c2",
    },
    mitre: ["T1071.001 Web Protocols"],
    activeNodes: ["support-portal", "c2-emulator", "session-agent", "audit-log", "flag-service"],
    activeLinks: [
      ["support-portal", "c2-emulator"],
      ["c2-emulator", "session-agent"],
      ["c2-emulator", "audit-log"],
      ["c2-emulator", "flag-service"],
    ],
    evidence: ["/beacon/register", "implant_id", "discover_services", "closed action enum"],
    code: {
      title: "Beacon registration schema",
      language: "json",
      body:
        "{\n" +
        "  \"session_id\": \"s_3kQ9xv7\",\n" +
        "  \"implant_id\": \"<random-32hex>\",\n" +
        "  \"host\": \"support-portal\",\n" +
        "  \"reachable_targets\": [\"corp-sso\", \"intranet\", \"wiki\"]\n" +
        "}",
    },
  },
  {
    id: "internal",
    number: "04",
    title: "Internal Discovery",
    shortTitle: "Corp Signals",
    category: "Discovery",
    location: "Corp Net",
    color: "#f59e0b",
    sourceHook: "stage_gating.md 3.5",
    objective: "Discover four internal services and connect wiki/tickets to the release path.",
    narrative: "Corporate knowledge sources explain how the trusted update process actually works.",
    gate: {
      mode: "Passive + confirmation",
      owner: "c2-emulator + corp-services audit",
      condition: "Four distinct internal service hits are observed.",
      flag: "flag_4_internal_discovery",
    },
    mitre: ["T1046 Network Service Discovery", "T1213 Data from Information Repositories", "T1213.003 Code Repositories"],
    activeNodes: ["c2-emulator", "corp-sso", "intranet", "wiki", "ticket-service", "hr-directory", "mail-web", "doc-portal", "source-repo", "audit-log"],
    activeLinks: [
      ["c2-emulator", "corp-sso"],
      ["c2-emulator", "intranet"],
      ["intranet", "wiki"],
      ["intranet", "ticket-service"],
      ["intranet", "hr-directory"],
      ["ticket-service", "mail-web"],
      ["wiki", "source-repo"],
      ["doc-portal", "audit-log"],
    ],
    evidence: ["corp-sso", "wiki", "ticket-service", "hr-directory", "mail-web", "doc-portal", "release-pipeline repo"],
    code: {
      title: "Allowed emulator actions",
      language: "text",
      body:
        "discover_services\n" +
        "list_env_var_names\n" +
        "read_known_file_marker\n" +
        "collect_predefined_artifact\n" +
        "report_progress",
    },
  },
  {
    id: "credential",
    number: "05",
    title: "Credential Material",
    shortTitle: "Token Reasoning",
    category: "Credential",
    location: "Corp / DevOps Bridge",
    color: "#f97316",
    sourceHook: "stage_gating.md 4.1",
    objective: "Find the one valid BUILD_TRIGGER_TOKEN among partial clues and decoys.",
    narrative: "The student must reason about current runbooks, stale tickets, and invalid legacy values.",
    gate: {
      mode: "Active",
      owner: "build-server",
      condition: "POST /api/jobs succeeds with HTTP 202 using the per-session token.",
      flag: "flag_5_credential_material",
    },
    mitre: ["T1552 Unsecured Credentials", "T1550.001 Application Access Token"],
    activeNodes: ["wiki", "ticket-service", "mail-web", "doc-portal", "source-repo", "build-server"],
    activeLinks: [
      ["ticket-service", "wiki"],
      ["mail-web", "wiki"],
      ["doc-portal", "wiki"],
      ["wiki", "source-repo"],
      ["wiki", "build-server"],
    ],
    evidence: ["Release Engineering Runbook", "BUILD_TRIGGER_TOKEN", "expired token decoys", "HTTP 202"],
    code: {
      title: "Valid placement",
      language: "env",
      body:
        "# Release Engineering Runbook - Build Trigger\n" +
        "BUILD_TRIGGER_TOKEN=<per-session value>\n\n" +
        "# Decoy sample\n" +
        "BUILD_TRIGGER_TOKEN=replace-me",
    },
  },
  {
    id: "devops",
    number: "06",
    title: "Build Artifact",
    shortTitle: "Artifact Path",
    category: "DevOps",
    location: "DevOps",
    color: "#10b981",
    sourceHook: "api_contracts.md 7",
    objective: "Trigger a benign EchoAgent build and inspect the LAB_BUILD_MARKER artifact.",
    narrative: "Trust begins to become software when a build job creates a signed candidate artifact.",
    gate: {
      mode: "Active",
      owner: "build-server",
      condition: "Artifact marker equals ORION_ECHO_BUILD_MARKER=s_<sid>.",
      flag: "flag_6_devops_lateral_movement",
    },
    mitre: ["T1059.004 Unix Shell", "T1608 Stage Capabilities"],
    activeNodes: ["source-repo", "package-registry", "build-server", "ci-runner", "release-db"],
    activeLinks: [
      ["source-repo", "build-server"],
      ["build-server", "ci-runner"],
      ["build-server", "package-registry"],
      ["build-server", "release-db"],
    ],
    evidence: ["build job", "EchoAgent tarball", "LAB_BUILD_MARKER", "artifact_id"],
    code: {
      title: "Build job request",
      language: "json",
      body:
        "{\n" +
        "  \"repo\": \"orionecho/echo-agent\",\n" +
        "  \"ref\": \"refs/heads/release/2.6.4\",\n" +
        "  \"channel\": \"anrc\",\n" +
        "  \"trigger_token\": \"BUILD_TRIGGER_TOKEN_VALUE\"\n" +
        "}",
    },
  },
  {
    id: "supply",
    number: "07",
    title: "Supply Chain Publish",
    shortTitle: "Signed Manifest",
    category: "Release",
    location: "Release",
    color: "#eab308",
    sourceHook: "api_contracts.md 8 and 9",
    objective: "Sign and publish an ANRC manifest whose metadata carries the lab marker.",
    narrative: "The update succeeds because the customer sees a normal signed channel event.",
    gate: {
      mode: "Active",
      owner: "update-server",
      condition: "channel=anrc manifest includes metadata.lab_marker and metadata.flag.",
      flag: "flag_7_supply_chain_stage",
    },
    mitre: ["T1195.002 Compromise Software Supply Chain", "T1072 Software Deployment Tools", "T1550.001 Application Access Token"],
    activeNodes: ["build-server", "signing-service", "update-server", "release-db", "customer-app"],
    activeLinks: [
      ["build-server", "signing-service"],
      ["signing-service", "update-server"],
      ["update-server", "release-db"],
      ["update-server", "customer-app"],
    ],
    evidence: ["signature.valid=true", "channel=anrc", "manifest metadata.flag", "version 2.6.4"],
    code: {
      title: "ANRC manifest core",
      language: "json",
      body:
        "{\n" +
        "  \"product\": \"EchoAgent\",\n" +
        "  \"channel\": \"anrc\",\n" +
        "  \"version\": \"2.6.4\",\n" +
        "  \"metadata\": {\n" +
        "    \"customer\": \"anrc\",\n" +
        "    \"lab_marker\": \"ORION_ECHO_BUILD_MARKER=s_<sid>\",\n" +
        "    \"flag\": \"orion{...}\"\n" +
        "  }\n" +
        "}",
    },
  },
  {
    id: "customer_reach",
    number: "08",
    title: "Trusted Customer Reach",
    shortTitle: "Update Applied",
    category: "Customer",
    location: "ANRC Customer Net",
    color: "#fb7185",
    sourceHook: "api_contracts.md 10",
    objective: "Observe EchoAgent polling and customer-api update-applied telemetry.",
    narrative: "The customer agent follows the vendor channel, crossing the boundary through trust rather than direct access.",
    gate: {
      mode: "Passive",
      owner: "customer-app + customer-api",
      condition: "customer-api records the first update-applied event for the new build.",
      flag: "flag_8_customer_reach",
    },
    mitre: ["T1072 Software Deployment Tools", "T1570 Lateral Tool Transfer", "T1105 Ingress Tool Transfer"],
    activeNodes: ["update-server", "customer-app", "signing-service", "customer-api", "monitoring"],
    activeLinks: [
      ["update-server", "customer-app"],
      ["customer-app", "signing-service"],
      ["customer-app", "customer-api"],
      ["customer-api", "monitoring"],
    ],
    evidence: ["EchoAgent polling", "signature verify", "artifact download", "update-applied", "recent_event_flag"],
    code: {
      title: "Customer polling request",
      language: "http",
      body:
        "GET /channels/anrc/manifest.json\n" +
        "X-EchoAgent-Version: 2.6.3\n" +
        "X-EchoAgent-Customer: anrc\n" +
        "Authorization: Bearer <CUSTOMER_ANRC_CHANNEL_TOKEN>",
    },
  },
  {
    id: "customer_discovery",
    number: "09",
    title: "Customer Discovery",
    shortTitle: "Export Key",
    category: "Customer",
    location: "ANRC API",
    color: "#fb923c",
    sourceHook: "data_schema.md 11 and api_contracts.md 11",
    objective: "Enumerate ANRC API endpoints and identify the Q2 audit export object key.",
    narrative: "The student narrows many plausible customer records down to one useful export prefix.",
    gate: {
      mode: "Active",
      owner: "customer-api + audit-log",
      condition: "At least five endpoint paths, including a Q2 export, are fetched.",
      flag: "flag_9_customer_discovery",
    },
    mitre: ["T1046 Network Service Discovery", "T1213 Data from Information Repositories"],
    activeNodes: ["customer-app", "customer-api", "monitoring", "audit-log", "object-store"],
    activeLinks: [
      ["customer-app", "customer-api"],
      ["customer-api", "monitoring"],
      ["customer-api", "audit-log"],
      ["customer-api", "object-store"],
    ],
    evidence: ["GET /metadata", "/facilities", "/audits", "/exports", "anrc-audit-exports/2026/Q2"],
    code: {
      title: "Export record shape",
      language: "json",
      body:
        "{\n" +
        "  \"id\": \"exp-2026-Q2-007\",\n" +
        "  \"object_key\": \"anrc-audit-exports/2026/Q2/project-orion-echo-final.txt\",\n" +
        "  \"presigned_url\": \"http://object-store:9000/...\"\n" +
        "}",
    },
  },
  {
    id: "collection",
    number: "10",
    title: "Final Collection",
    shortTitle: "Object Store",
    category: "Collection",
    location: "MinIO Object Store",
    color: "#22c55e",
    sourceHook: "stage_gating.md 3.11 and data_schema.md 11",
    objective: "Retrieve project-orion-echo-final.txt through a customer-api presigned URL.",
    narrative: "The final file closes the story and proves the entire trusted update chain was reconstructed.",
    gate: {
      mode: "Active",
      owner: "object-store",
      condition: "Specific ANRC Q2 object is retrieved under the session.",
      flag: "flag_10_final_objective",
    },
    mitre: ["T1530 Data from Cloud Storage"],
    activeNodes: ["customer-api", "object-store", "audit-log", "flag-service"],
    activeLinks: [
      ["customer-api", "object-store"],
      ["object-store", "audit-log"],
      ["object-store", "flag-service"],
    ],
    evidence: ["presigned_url", "project-orion-echo-final.txt", "final_flag", "facility-risk-summary.pdf decoy"],
    code: {
      title: "Final object content",
      language: "text",
      body:
        "Operation Orion Echo - End of Range\n" +
        "session: s_<sid>\n" +
        "final_flag: orion{...}\n\n" +
        "Return to CTFd to submit this flag.",
    },
  },
];

export const gotrootTutorialExampleGroups = [
  {
    id: "entry",
    title: "Entry path",
    label: "Recon + DMZ",
    stageIds: ["recon", "initial", "foothold"],
    prompt: "Where does the first reliable evidence appear before internal access exists?",
  },
  {
    id: "control",
    title: "Control path",
    label: "C2 + Corp",
    stageIds: ["c2", "internal", "credential"],
    prompt: "How does the safe emulator convert a foothold into internal discovery?",
  },
  {
    id: "release",
    title: "Release path",
    label: "DevOps + Signing",
    stageIds: ["devops", "supply"],
    prompt: "Which artifact marker makes the trusted update publish acceptable?",
  },
  {
    id: "customer",
    title: "Customer path",
    label: "ANRC + Object store",
    stageIds: ["customer_reach", "customer_discovery", "collection"],
    prompt: "What proves the vendor update relationship reached the ANRC objective?",
  },
];

export const gotrootTutorialSubsteps = {
  open: [
    {
      id: "student-query",
      title: "Student selects a stage",
      body: "The selected stage becomes the current evidence atom.",
    },
    {
      id: "scenario-engine",
      title: "Scenario engine maps route",
      body: "Network nodes, active links, evidence, and source hooks are highlighted.",
    },
    {
      id: "artifact-read",
      title: "Artifact is inspected",
      body: "The learner sees the code contract or artifact format for this stage.",
    },
    {
      id: "unguided-result",
      title: "Unguided result",
      body: "Without guardrails, decoys and unsafe implementation details can look equally important.",
    },
    {
      id: "summary",
      title: "Stage summary",
      body: "The stage objective, gate owner, flag condition, and ATT&CK lens are summarized.",
    },
  ],
  guarded: [
    {
      id: "student-query",
      title: "Student selects a stage",
      body: "The selected stage becomes the current evidence atom.",
    },
    {
      id: "scenario-engine",
      title: "Scenario engine maps route",
      body: "Network nodes, active links, evidence, and source hooks are highlighted.",
    },
    {
      id: "safety-gate",
      title: "Range safety gate",
      body: "The UI marks lab-controlled emulation and hides real exploit payload text.",
    },
    {
      id: "guard-scan",
      title: "Analyst guard scans",
      body: "MITRE technique, gate mode, decoy notes, and allowed artifacts are cross-checked.",
    },
    {
      id: "guarded-output",
      title: "Guided stage output",
      body: "The learner gets the useful next signal without unsafe or off-path implementation detail.",
    },
    {
      id: "summary",
      title: "Stage summary",
      body: "The stage objective, gate owner, flag condition, and ATT&CK lens are summarized.",
    },
  ],
};

export function getGotrootStageById(stageId) {
  return gotrootTutorialStages.find((stage) => stage.id === stageId) || gotrootTutorialStages[0];
}
