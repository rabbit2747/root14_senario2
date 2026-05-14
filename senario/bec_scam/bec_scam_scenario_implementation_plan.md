# BEC Scam Scenario and Implementation Plan
# Operation Ledger Mirage — Business Email Compromise Investigation Range

Version: 1.0-training-scope  
Date: 2026-05-07  
Audience: implementation engineer / instructor / AI coding agent  
Source format reference: GOTROOT-style BEC investigative report structure  
Scope: defensive training scenario, safe evidence simulation, no real phishing

---

## 0. Purpose

This document defines a Business Email Compromise (BEC) scam scenario in the
same planning style as the Orion Echo range documents.

The scenario is based on the structure and investigative themes of the sample
GOTROOT BEC report:

```text
Executive Summary
Key Findings
Investigative Process
Events Overview
Analysis of Phishing Emails
PDF / Invoice Analysis
Domain Analysis
Web History / Device Forensics
Microsoft 365 Log Analysis
Firewall / Proxy Log Analysis
Endpoint Review
Recommendations
Conclusion
Appendices
```

The goal is to build a safe, realistic BEC investigation exercise where
students analyze a simulated executive impersonation and invoice redirection
incident. The exercise must train investigation, evidence correlation, and
business-impact reasoning, not phishing execution.

Non-negotiable safety boundary:

```text
No real phishing delivery
No live credential harvesting
No real payment rails
No real bank accounts
No real customer/vendor impersonation
No live lookalike domains
No malware
No external command-and-control
No instructions for running a real BEC scam
```

All domains, emails, people, organizations, logs, and financial records must be
fictional or use reserved domains such as `.example`, `.test`, or `.invalid`.

---

## 1. Scenario Narrative

### 1.1 Story

NorthBridge Trading Ltd. is a fictional mid-sized import/export company with a
regional finance team, an executive office, and multiple vendor relationships.

The company reports a suspected BEC incident after the accounts payable team
processed a high-value invoice payment to a changed beneficiary account. The
payment request appeared to originate from a known vendor and was later
reinforced by email messages impersonating a senior executive.

The investigation team must determine:

```text
- how the fraudulent request entered the organization
- whether any user credentials were exposed
- whether Microsoft 365 accounts were accessed by unauthorized parties
- whether mailbox rules, forwarding, or inbox manipulation occurred
- whether endpoint or browser evidence supports credential-entry activity
- whether firewall/proxy logs show suspicious access
- which payment workflow control failed
- whether the incident was isolated or part of a wider compromise
```

### 1.2 Demonstration Goal

The student must reconstruct the BEC incident from evidence, not execute an
attack.

The intended investigation chain is:

```text
Initial client intake
-> review suspicious emails
-> analyze email headers and sender infrastructure
-> inspect attachment / invoice metadata
-> correlate Microsoft 365 sign-in and audit logs
-> identify suspicious inbox rules and mailbox access
-> review browser history and endpoint findings
-> review DNS / domain registration artifacts
-> review firewall and proxy logs
-> build event timeline
-> identify root cause and control failures
-> produce executive findings and recommendations
```

### 1.3 BEC Core

The center of gravity is the business process compromise:

```text
Vendor invoice thread
-> impersonated payment instruction
-> finance workflow pressure
-> credential exposure or mailbox access
-> fraudulent beneficiary change
-> wire transfer initiation
-> post-incident discovery and containment
```

The scenario should teach that BEC is not only a technical compromise. It is a
combined failure of email trust, identity controls, payment verification,
monitoring, and business process governance.

---

## 2. Authoritative Training Technique Set

Only the following behaviors are intentionally modeled. All offensive behaviors
are represented by static evidence artifacts, logs, and simulator output.

| ID | Technique / Concept | Training meaning |
|---|---|---|
| T1566.002 | Phishing: Spearphishing Link | Student analyzes a safe sample email that links to a fictional login page |
| T1583.001 | Acquire Infrastructure: Domains | Student reviews simulated domain registration and DNS evidence |
| T1585 | Establish Accounts | Student reviews fictional sender identities and mailbox artifacts |
| T1078 | Valid Accounts | Student identifies suspicious Microsoft 365 sign-in activity |
| T1114 | Email Collection | Student infers mailbox access from audit logs and message reads |
| T1098.002 | Account Manipulation: Email Forwarding Rule | Student finds simulated mailbox forwarding / delete rules |
| T1027 | Obfuscated Files or Information | Student inspects a disguised invoice PDF or renamed attachment |
| T1204.002 | User Execution: Malicious File | Modeled only as user opening a benign training attachment |
| T1656 | Impersonation | Student analyzes executive/vendor impersonation language |
| BEC Process | Payment redirection | Student maps evidence to a fraudulent beneficiary-change workflow |

Notes:

- The exercise does not include live phishing infrastructure.
- The fake login page is represented by screenshots, static HTML, or log
  artifacts only.
- Attachment analysis uses benign sample documents with no macros and no
  executable payload.
- Payment evidence uses fictional bank and account data.

---

## 3. Stage-to-Investigation Mapping

### Stage 0 — Intake and Scope

Student action:

```text
Read the client intake note, identify affected business units, and define the
investigation scope.
```

Evidence:

```text
intake_summary.md
engagement_scope.pdf
affected_users.csv
payment_exception_notice.pdf
```

Completion:

```text
Identify the suspected payment, vendor, affected mailbox, and investigation
date range.
```

Flag / checkpoint:

```text
flag_0_scope_defined
```

Teaching point:

```text
BEC investigations must start with business process scope, not only malware
triage.
```

---

### Stage 1 — Suspicious Email Triage

Student action:

```text
Review reported emails and identify the messages that initiated the suspicious
payment workflow.
```

Evidence:

```text
mailbox_exports/ap_team_reported_messages/
email_headers/initial_vendor_notice.txt
email_headers/executive_followup.txt
email_renderings/*.png
```

Completion:

```text
Identify the initial fraudulent vendor message and the follow-up executive
impersonation message.
```

Flag / checkpoint:

```text
flag_1_suspicious_email_identified
```

Safety:

```text
Emails are stored as sanitized .eml or rendered screenshots. Links point only
to reserved domains.
```

---

### Stage 2 — Email Header and Sender Infrastructure Analysis

Student action:

```text
Analyze headers, SPF/DKIM/DMARC results, relay path, reply-to mismatch, and
sender display-name deception.
```

Evidence:

```text
email_headers/*.txt
message_trace.csv
spf_dkim_dmarc_results.json
sender_reputation_notes.md
```

Completion:

```text
Determine whether the message came from a compromised mailbox, spoofed sender,
lookalike domain, or external relay.
```

Flag / checkpoint:

```text
flag_2_sender_infrastructure
```

Teaching point:

```text
Display name trust is weak. Header authentication, reply-to behavior, and
message trace data must be correlated.
```

---

### Stage 3 — Attachment and Invoice Analysis

Student action:

```text
Inspect the invoice, PDF metadata, file naming, beneficiary details, and
differences from prior legitimate invoices.
```

Evidence:

```text
attachments/fake_invoice_2026-04.pdf
attachments/legitimate_invoice_baseline.pdf
invoice_metadata.json
vendor_master_change_form.pdf
```

Completion:

```text
Identify altered beneficiary information and explain why the invoice should
have triggered out-of-band verification.
```

Flag / checkpoint:

```text
flag_3_invoice_redirection
```

Safety:

```text
All documents are benign and contain fictional account data.
```

---

### Stage 4 — Microsoft 365 Sign-in and Audit Log Analysis

Student action:

```text
Review sign-in logs, user agents, source IPs, MFA results, mailbox actions,
and audit events for affected accounts.
```

Evidence:

```text
m365/signin_logs.csv
m365/audit_logs.csv
m365/unified_audit_log.jsonl
m365/mfa_events.csv
m365/mailbox_audit_summary.md
```

Completion:

```text
Identify suspicious sign-ins and mailbox access patterns around the time of
the invoice change.
```

Flag / checkpoint:

```text
flag_4_o365_log_correlation
```

Teaching point:

```text
The same event may look benign in isolation. Timing, source, user agent, and
mailbox actions make the pattern.
```

---

### Stage 5 — Mailbox Rule and Email Manipulation Review

Student action:

```text
Find suspicious inbox rules, forwarding behavior, deleted messages, and
conversation thread manipulation.
```

Evidence:

```text
m365/inbox_rules_export.csv
m365/mailbox_folder_activity.csv
m365/deleted_items_index.csv
mailbox_exports/thread_reconstruction/
```

Completion:

```text
Identify the rule or mailbox action that hid replies, moved vendor messages,
or forwarded payment-related messages.
```

Flag / checkpoint:

```text
flag_5_mailbox_manipulation
```

Safety:

```text
Rules are simulated artifacts. The lab does not connect to any real Microsoft
tenant.
```

---

### Stage 6 — Device and Browser History Review

Student action:

```text
Review endpoint triage notes, browser history, downloaded files, and EDR/AV
results for the affected users.
```

Evidence:

```text
endpoint/browser_history_user_ap01.csv
endpoint/downloads_listing_user_ap01.csv
endpoint/defender_scan_results.pdf
endpoint/edr_alert_summary.json
endpoint/device_collection_notes.md
```

Completion:

```text
Determine whether the affected user browsed to the suspicious site and whether
malware execution is supported by evidence.
```

Flag / checkpoint:

```text
flag_6_device_web_history
```

Teaching point:

```text
Absence of malware does not mean absence of compromise. Many BEC cases rely on
credential abuse and business process manipulation.
```

---

### Stage 7 — Domain, DNS, and Hosting Analysis

Student action:

```text
Review domain records, DNS resolution, hosting notes, certificate metadata,
and registration timing for the suspicious infrastructure.
```

Evidence:

```text
domain/whois_suspicious_domain.txt
domain/dns_history.csv
domain/certificate_transparency.json
domain/hosting_provider_notes.md
domain/screenshot_fake_login.png
```

Completion:

```text
Identify the lookalike domain pattern, registration timing, and hosting
indicators connected to the fraudulent email.
```

Flag / checkpoint:

```text
flag_7_domain_analysis
```

Safety:

```text
No live lookalike domain is registered. All infrastructure evidence is static.
```

---

### Stage 8 — Firewall and Proxy Log Analysis

Student action:

```text
Correlate user web activity, proxy requests, DNS lookups, and firewall
connections with the phishing and payment timeline.
```

Evidence:

```text
network/proxy_logs.csv
network/firewall_egress_logs.csv
network/dns_query_logs.csv
network/suspicious_ip_enrichment.csv
```

Completion:

```text
Identify which internal device or user account contacted the suspicious
domain and when.
```

Flag / checkpoint:

```text
flag_8_network_correlation
```

Teaching point:

```text
Network logs often validate or refute claims made by email and endpoint
evidence.
```

---

### Stage 9 — Payment Workflow and Impact Assessment

Student action:

```text
Review payment approval records, vendor master changes, call-back evidence,
and finance team communications.
```

Evidence:

```text
finance/wire_transfer_record.pdf
finance/vendor_master_change_log.csv
finance/payment_approval_chain.csv
finance/callback_verification_notes.md
finance/bank_recall_status.md
```

Completion:

```text
Determine the financial impact, failed control, and whether funds were
recovered, pending, or unrecoverable in the scenario.
```

Flag / checkpoint:

```text
flag_9_business_impact
```

Teaching point:

```text
BEC impact analysis requires both technical and finance-process evidence.
```

---

### Stage 10 — Final Findings and Recommendations

Student action:

```text
Produce a concise executive finding set, root-cause statement, and remediation
plan.
```

Evidence:

```text
all prior artifacts
report_template.md
recommendation_matrix.xlsx
```

Completion:

```text
Submit a final report that identifies initial vector, affected accounts,
fraudulent payment path, impact, containment steps, and recommendations.
```

Flag / checkpoint:

```text
flag_10_final_report
```

Teaching point:

```text
The best investigation result is a defensible narrative supported by evidence,
not a pile of disconnected indicators.
```

---

## 4. Report Output Structure

The student-facing final report should follow the sample report's structure,
adapted for this fictional case.

```text
1.0 Executive Summary
  1.1 Key Findings
2.0 Investigative Process
3.0 Events Overview
4.0 Analysis of Phishing Emails
  4.1 Initial Vendor Impersonation Email
  4.2 Executive Follow-up Email
  4.3 Attachment / Invoice Analysis
  4.4 Domain Analysis
5.0 Data and Device Forensics
6.0 Analysis of Microsoft 365 Logs
7.0 Analysis of Firewall and Proxy Logs
8.0 Endpoint Analysis
9.0 Recommendations
  9.1 BEC-Specific Recommendations
  9.2 Strategic Recommendations
10.0 Conclusion
Appendix A: Anatomy of the Simulated BEC Attack
Appendix B: Evidence Index
Appendix C: Timeline of Events
```

### 4.1 Required Key Findings

The final report must include findings in this pattern:

```text
Key finding #1: The suspicious vendor email initiated the payment change
workflow.

Key finding #2: The sender identity relied on display-name deception and a
reply-to mismatch.

Key finding #3: The invoice contained altered beneficiary details compared to
the legitimate baseline.

Key finding #4: Microsoft 365 logs show suspicious access to the affected
mailbox.

Key finding #5: A mailbox rule or folder action reduced the visibility of
payment-related replies.

Key finding #6: Endpoint review supports browser access to the suspicious
domain but does not support malware execution.

Key finding #7: Network logs correlate the suspicious domain access with the
affected user's workstation.

Key finding #8: The payment workflow lacked independent callback verification
for beneficiary changes.

Key finding #9: The incident appears limited to the identified business
process unless additional evidence is discovered.

Key finding #10: Remediation should focus on identity controls, mailbox
monitoring, vendor-change governance, and finance approval process controls.
```

---

## 5. Evidence Package Layout

The implementation should seed a deterministic evidence directory.

```text
bec-ledger-mirage/
├── 00_intake/
│   ├── intake_summary.md
│   ├── engagement_scope.pdf
│   └── affected_users.csv
├── 01_email/
│   ├── reported_messages/
│   ├── headers/
│   ├── renderings/
│   └── message_trace.csv
├── 02_attachments/
│   ├── fake_invoice_2026-04.pdf
│   ├── legitimate_invoice_baseline.pdf
│   └── invoice_metadata.json
├── 03_m365/
│   ├── signin_logs.csv
│   ├── audit_logs.csv
│   ├── unified_audit_log.jsonl
│   ├── inbox_rules_export.csv
│   └── mfa_events.csv
├── 04_endpoint/
│   ├── browser_history_user_ap01.csv
│   ├── downloads_listing_user_ap01.csv
│   ├── defender_scan_results.pdf
│   └── edr_alert_summary.json
├── 05_domain/
│   ├── whois_suspicious_domain.txt
│   ├── dns_history.csv
│   ├── certificate_transparency.json
│   └── screenshot_fake_login.png
├── 06_network/
│   ├── proxy_logs.csv
│   ├── firewall_egress_logs.csv
│   ├── dns_query_logs.csv
│   └── suspicious_ip_enrichment.csv
├── 07_finance/
│   ├── wire_transfer_record.pdf
│   ├── vendor_master_change_log.csv
│   ├── payment_approval_chain.csv
│   └── bank_recall_status.md
├── 08_report/
│   ├── report_template.md
│   └── recommendation_matrix.xlsx
└── 09_flags/
    └── stage_flags.json
```

---

## 6. Optional Lab Architecture

For a hands-on investigation range, implement these containers or services.

### 6.1 Required Services

```text
case-portal
evidence-store
mail-viewer
log-viewer
finance-portal
timeline-builder
flag-service
audit-log
```

### 6.2 Optional Services for Realism

```text
fake-m365-dashboard
fake-edr-console
fake-firewall-console
fake-ticketing-system
report-submission-portal
instructor-console
```

### 6.3 Networks

For a simple local training lab:

```text
public_net
evidence_net
analysis_net
control_net
```

Students should access only `case-portal`. Other services should be reached
through links and permissions granted by the case workflow.

---

## 7. Implementation Phases

### Phase 1 — Scenario Skeleton

Deliverables:

```text
case description
fictional company profile
affected users
payment timeline
evidence directory skeleton
flag/checkpoint list
```

Validation:

```text
Instructor can explain the case in under 5 minutes.
No artifact references a real victim, real bank account, or live phishing
domain.
```

### Phase 2 — Email and Invoice Evidence

Deliverables:

```text
sanitized .eml files or rendered email screenshots
email headers
message trace CSV
fake invoice PDF
legitimate invoice baseline
invoice metadata JSON
```

Validation:

```text
Student can identify the suspicious sender, reply-to mismatch, and altered
beneficiary detail.
```

### Phase 3 — Identity and Mailbox Logs

Deliverables:

```text
Microsoft 365 sign-in logs
unified audit logs
mailbox audit summary
inbox rule export
MFA event records
```

Validation:

```text
Student can identify suspicious login activity and mailbox manipulation.
```

### Phase 4 — Endpoint, Domain, and Network Evidence

Deliverables:

```text
browser history
download listing
EDR/AV results
WHOIS/DNS/certificate artifacts
proxy/firewall/DNS logs
```

Validation:

```text
Student can correlate user activity, suspicious domain access, and network
egress timing.
```

### Phase 5 — Finance Workflow Evidence

Deliverables:

```text
wire record
vendor master change log
approval chain
callback verification notes
bank recall status
```

Validation:

```text
Student can state the impact and identify the failed business control.
```

### Phase 6 — Instructor and Report Polish

Deliverables:

```text
walkthrough guide
answer key
report template
scoring rubric
hint catalog
recommendation matrix
```

Validation:

```text
One clean student walkthrough completes in 60-120 minutes.
One instructor solution walkthrough completes in under 15 minutes.
```

---

## 8. Stage Completion Rules

| Stage | Completion rule | Checkpoint |
|---|---|---|
| 0 | Identify affected user, vendor, amount, and date range | `flag_0_scope_defined` |
| 1 | Identify initial suspicious message and follow-up impersonation | `flag_1_suspicious_email_identified` |
| 2 | Identify header anomaly and sender infrastructure pattern | `flag_2_sender_infrastructure` |
| 3 | Identify altered invoice / beneficiary details | `flag_3_invoice_redirection` |
| 4 | Identify suspicious Microsoft 365 sign-in and audit events | `flag_4_o365_log_correlation` |
| 5 | Identify suspicious mailbox rule or message manipulation | `flag_5_mailbox_manipulation` |
| 6 | Correlate browser history and endpoint results | `flag_6_device_web_history` |
| 7 | Identify suspicious domain and DNS/hosting indicators | `flag_7_domain_analysis` |
| 8 | Correlate firewall/proxy/DNS logs with user activity | `flag_8_network_correlation` |
| 9 | Determine financial impact and failed payment control | `flag_9_business_impact` |
| 10 | Submit final report with findings and recommendations | `flag_10_final_report` |

---

## 9. Detection and Teaching Notes

Each stage should produce at least one instructor-observable action.

| Investigation area | Required audit event |
|---|---|
| Email triage | `email.message.viewed` |
| Header analysis | `email.header.reviewed` |
| Invoice review | `invoice.metadata.reviewed` |
| Microsoft 365 logs | `m365.signin.filtered`, `m365.audit.filtered` |
| Mailbox rules | `mailbox.rules.reviewed` |
| Endpoint review | `endpoint.browser_history.viewed` |
| Domain analysis | `domain.whois.viewed`, `domain.dns.reviewed` |
| Network logs | `network.proxy.filtered`, `network.dns.filtered` |
| Finance workflow | `finance.approval_chain.reviewed` |
| Final report | `report.submitted` |

Instructor explanation should emphasize:

```text
BEC is a fraud and identity-control problem as much as a technical problem.
Email evidence must be correlated with identity, endpoint, network, and
finance workflow evidence.
No single artifact proves the whole case.
The final report must separate confirmed facts, likely conclusions, and open
questions.
```

---

## 10. Explicit Out-of-Scope Content

Do not implement or include:

| Content | Reason |
|---|---|
| Real phishing kits | Unsafe and unnecessary |
| Real credential collection forms | Unsafe and unnecessary |
| Live lookalike domains | Could enable misuse |
| Real bank names or account numbers | Privacy and misuse risk |
| Malware attachments | Not needed for BEC investigation training |
| Macros or executable payloads | Unsafe and outside scope |
| Instructions to bypass MFA | Unsafe and outside scope |
| Guidance for conducting fraud | Not part of defensive training |

---

## 11. Success Criteria

The scenario is complete when:

1. The case can be run entirely with fictional, static, or lab-contained data.
2. The student can reconstruct the BEC timeline from evidence.
3. The student can identify the suspicious email, invoice alteration, mailbox
   activity, and failed payment control.
4. Microsoft 365, endpoint, domain, network, and finance evidence all support
   the same incident narrative.
5. The final report follows the GOTROOT-style investigative structure.
6. No artifact can be reused as a real phishing email, real fraud instruction,
   or live credential-harvesting workflow.
7. The instructor has an answer key, timeline, and recommendation matrix.
8. The exercise teaches both technical investigation and business-process
   remediation.

---

## 12. Recommended Report Recommendations

The final student report should recommend controls in two groups.

### 12.1 BEC-Specific Recommendations

```text
- Require out-of-band verification for vendor bank-account changes.
- Require dual approval for high-value payments and beneficiary changes.
- Maintain vendor master-data change logs and independent callback evidence.
- Add finance-team BEC simulation and reporting drills.
- Alert on suspicious inbox rules, forwarding, and mass message deletion.
- Review display-name spoofing and external sender banner controls.
- Enforce DMARC, DKIM, and SPF monitoring for owned domains.
```

### 12.2 Strategic Recommendations

```text
- Enforce phishing-resistant MFA for privileged and finance users.
- Improve conditional access policies for unusual geolocation and device risk.
- Centralize Microsoft 365 audit logging and retention.
- Integrate identity, endpoint, DNS, proxy, and finance workflow alerts.
- Run periodic tabletop exercises for payment fraud response.
- Maintain an evidence collection playbook for BEC incidents.
- Define legal, finance, insurance, and banking escalation paths before an
  incident occurs.
```

---

## 13. Reference Implementation Notes

Suggested fictional identifiers:

```text
Company: NorthBridge Trading Ltd.
Vendor: Meridian Office Supply LLC
Affected user: ap.lead@northbridge.example
Executive impersonated: ceo.office@northbridge.example
Suspicious sender: billing-meridian@example.invalid
Suspicious domain: northbridge-secure-login.example
Payment amount: 482,750 USD
Incident date range: 2026-04-07 to 2026-04-18
```

All values are fictional and should be rotated per cohort if the exercise is
used repeatedly.

