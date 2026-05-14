# ROOT14 Ledger Mirage Curriculum Map

Source scenario:
- `senario/bec_scam/bec_scam_scenario_implementation_plan.md`

Platform scenario:
- Scenario ID: `operation-ledger-mirage`
- Slug: `ledger-mirage`
- Title: `Operation Ledger Mirage`
- Type: Business Email Compromise investigation curriculum

Local entry routes on port 5173:
- TOC: `http://127.0.0.1:5173/apt/ledger-mirage`
- Mission Briefing: `http://127.0.0.1:5173/apt/ledger-mirage/intro`
- Evidence Overview: `http://127.0.0.1:5173/apt/ledger-mirage/legacy-3d`
- Concept Class: `http://127.0.0.1:5173/apt/ledger-mirage/concepts`
- Practical Evidence Topology: `http://127.0.0.1:5173/apt/ledger-mirage-practical`
- Hands-on Investigation Lab Runbook: `http://127.0.0.1:5173/apt/ledger-mirage/lab`

Practical 3D service:
- Local service: `http://127.0.0.1:3000/three/ledger_mirage`
- Service folder: `senario/09_platform/mvp`
- View model: `senario/09_platform/mvp/data/practical-3d/ledger-mirage.ts`

App implementation files:
- `src/pages/apt/ledger-mirage/data/ledger-mirage-curriculum.js`
- `src/pages/apt/ledger-mirage/data/ledger-mirage-practical.json`
- `src/pages/apt/ledger-mirage/data/ledger-mirage-course.js`
- `src/pages/apt/ledger-mirage/*.jsx`

Curriculum shape:
1. Mission Briefing
2. Legacy-style Evidence Overview
3. Concept Class
4. Practical Case Review / Evidence Topology
5. Hands-on Investigation Lab Runbook
6. Final Findings and Recommendations

Canonical investigation stages:
0. Intake and Scope
1. Suspicious Email Triage
2. Header and Sender Infrastructure Analysis
3. Attachment and Invoice Analysis
4. Microsoft 365 Sign-in and Audit Log Correlation
5. Mailbox Rule and Email Manipulation Review
6. Device and Browser History Review
7. Domain, DNS, and Hosting Analysis
8. Firewall and Proxy Log Correlation
9. Payment Workflow and Impact Assessment
10. Final Findings and Recommendations

Current lab status:
- The web curriculum and investigation runbook are connected in the 5173 app.
- The Practical 3D service is connected as a separate Next.js app on port 3000.
- A dedicated Docker evidence portal is not implemented yet.
- The current lab page treats this folder as the scenario source package and reserves a future Docker lab path: `hands-on lab/ledger-mirage-investigation-lab`.
