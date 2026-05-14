# Operation Ledger Mirage Canonical Scenario

## One Sentence Summary

Operation Ledger Mirage is a defensive BEC investigation scenario where the
learner reconstructs how a fraudulent vendor payment request entered a company,
how mailbox and identity evidence supports the incident, and which finance
workflow control failed.

## Scenario Identity

| Field | Value |
| --- | --- |
| Scenario ID | `operation-ledger-mirage` |
| Scenario type | Business Email Compromise investigation |
| Company | NorthBridge Trading Ltd. |
| Vendor | Meridian Office Supply LLC |
| Affected user | `ap.lead@northbridge.example` |
| Executive impersonated | `ceo.office@northbridge.example` |
| Suspicious sender | `billing-meridian@example.invalid` |
| Suspicious domain | `northbridge-secure-login.example` |
| Payment amount | `482,750 USD` |
| Incident window | `2026-04-07` to `2026-04-18` |

## Core Story

NorthBridge Trading Ltd. processes a high-value invoice payment after a vendor
payment instruction appears to change. The request is reinforced by emails that
impersonate a senior executive. The investigation team must determine whether
the message was spoofed, whether a mailbox was accessed, whether inbox rules or
forwarding hid replies, whether endpoint and network evidence supports user
interaction with a suspicious site, and which payment verification control
failed.

The scenario teaches that BEC is not only a technical compromise. It is a
combined failure of email trust, identity controls, payment verification,
monitoring, and business-process governance.

## Curriculum Flow

```text
Mission Briefing
-> Concept Class
-> Practical Case Review
-> Evidence Topology Review
-> Hands-on Investigation Lab
-> Final Findings and Recommendations
```

## Learning Sessions

| Order | Session | Purpose |
| --- | --- | --- |
| 1 | Mission Briefing | Establish the case, affected organization, suspected payment, learner role, and safety scope. |
| 2 | Concept Class | Teach BEC, display-name deception, email authentication, M365 audit evidence, mailbox rules, and payment-control failure. |
| 3 | Practical Case Review | Reconnect concepts to the NorthBridge incident and define the evidence plan. |
| 4 | Evidence Topology Review | Show how email, identity, endpoint, network, domain, and finance evidence relate. |
| 5 | Hands-on Investigation Lab | Let the learner inspect static evidence and logs, build a timeline, and answer stage checkpoints. |
| 6 | Final Report | Submit executive findings, root cause, impact, containment, and recommendations. |

## Investigation Stages

| Stage | Name | Learner action | Evidence focus | Checkpoint |
| --- | --- | --- | --- | --- |
| 0 | Intake and Scope | Define affected user, vendor, amount, and date range. | intake summary, affected users, payment notice | `flag_0_scope_defined` |
| 1 | Suspicious Email Triage | Identify the initial vendor message and executive follow-up. | reported messages, headers, renderings | `flag_1_suspicious_email_identified` |
| 2 | Header and Sender Infrastructure | Analyze SPF/DKIM/DMARC, reply-to mismatch, relay path, and sender identity. | headers, message trace, authentication results | `flag_2_sender_infrastructure` |
| 3 | Attachment and Invoice Analysis | Compare fake invoice details with legitimate baseline. | invoice PDFs, metadata, vendor change form | `flag_3_invoice_redirection` |
| 4 | Microsoft 365 Log Correlation | Review sign-ins, MFA, user agents, source IPs, and mailbox audit events. | M365 sign-in logs, audit logs, MFA events | `flag_4_o365_log_correlation` |
| 5 | Mailbox Manipulation Review | Identify suspicious rules, forwarding, folder movement, or deleted messages. | inbox rules, folder activity, deleted items | `flag_5_mailbox_manipulation` |
| 6 | Device and Browser History | Determine whether the user visited the suspicious site and whether malware evidence exists. | browser history, downloads, EDR, AV results | `flag_6_device_web_history` |
| 7 | Domain, DNS, and Hosting | Identify lookalike domain pattern, registration timing, and hosting indicators. | WHOIS, DNS history, certificate transparency | `flag_7_domain_analysis` |
| 8 | Firewall and Proxy Correlation | Correlate user device, DNS, proxy, and firewall activity with the timeline. | proxy logs, DNS logs, firewall egress | `flag_8_network_correlation` |
| 9 | Payment Workflow and Impact | Determine financial impact, recovery status, and failed payment-control step. | wire record, vendor master log, approval chain | `flag_9_business_impact` |
| 10 | Final Findings | Produce executive findings, root cause, and remediation plan. | all prior artifacts, report template | `flag_10_final_report` |

## Required Concept Class Topics

| Concept | Scenario meaning |
| --- | --- |
| Business Email Compromise | Fraud path that combines identity trust, email deception, and payment workflow failure. |
| Display Name and Reply-To Deception | Why email appearance alone is weak evidence of sender authenticity. |
| SPF, DKIM, and DMARC | How sender authentication helps classify spoofing, relay, or compromised-mailbox possibilities. |
| Microsoft 365 Sign-in Evidence | How source IP, user agent, MFA result, and timing reveal suspicious access. |
| Mailbox Rules and Forwarding | How inbox manipulation can hide replies or redirect payment-related communications. |
| Invoice and Beneficiary Change Review | How business-process evidence confirms the fraud path. |
| Endpoint and Browser Correlation | How browser history and downloads validate or refute credential-entry activity. |
| Network and DNS Correlation | How proxy, DNS, and firewall logs validate the timeline. |
| Executive Reporting | How to separate facts, likely conclusions, open questions, and recommendations. |

## Safety Boundary

This scenario must never teach how to run BEC. It only teaches how to
investigate one. All artifacts are fictional, static, sanitized, or lab-local.

## Final Report Structure

```text
1.0 Executive Summary
2.0 Investigative Process
3.0 Events Overview
4.0 Analysis of Phishing Emails
5.0 Attachment / Invoice Analysis
6.0 Microsoft 365 Log Analysis
7.0 Endpoint, Domain, and Network Analysis
8.0 Payment Workflow Impact
9.0 Recommendations
10.0 Conclusion
Appendix A: Evidence Index
Appendix B: Timeline
```
