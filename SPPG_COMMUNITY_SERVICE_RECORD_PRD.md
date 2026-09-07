# Product Requirements Document: SPPG Community Service Record

| Document field | Detail |
|---|---|
| Product | SPPG Nigeria Community Service Record |
| Intended release | Production-grade web application |
| Primary audience | SPPG programme leadership, Fellows/Students, FLO, HLE, project mentors, programme operations staff, and delivery developers |
| Product objective | Collect consistent end-of-year evidence of each student’s capstone community-service participation, surface delivery risks early, and provide programme leaders with actionable cohort and project-level insight. |
| Status | Product specification; ready for technical design and delivery planning. |
| Source basis | User-provided requirements and the existing SPPG Community Service Form prototype. |

## 1. Executive Summary

The **SPPG Community Service Record** is a secure, role-based application for recording each student’s capstone community-service experience at the end of the programme year. Students complete a guided record covering attendance, participation, contributions, assigned tasks, mentorship, conflict resolution, and recommended improvements. Programme staff then use an administrative dashboard to monitor submission coverage, evaluate project health, identify students who may need support, and evidence programme outcomes.

The product is not merely a data-capture form. It must be an **operational early-warning system**. When a submitted record indicates low attendance, no recorded engagement, no contribution, no assigned task, or an explicit declaration of non-participation, the application must create a durable alert, send a single consolidated escalation email to the relevant **FLO**, **HLE**, and project **Mentor**, and make the alert visible in the administrative dashboard until it is resolved or formally dismissed.

> **Product principle:** A student record must be stored successfully even if a notification service is temporarily unavailable. Alerts and email delivery are follow-on operational actions, not prerequisites for preserving the student’s submission.

## 2. Problem Statement

Capstone community-service work is collaborative and multi-dimensional. A basic form can collect answers, but it does not reliably show programme leaders where attendance is low, where students report no engagement, which projects lack sufficient participation, or whether risk notifications were acted upon. Free-text responses also become difficult to interpret without structured aggregation, filters, ownership, and resolution tracking.

The product must solve four connected problems. First, it must collect a complete and comparable record for each student. Second, it must distinguish ordinary programme variation from situations requiring staff follow-up. Third, it must notify the correct accountable people without creating duplicate or untraceable emails. Finally, it must give administrators a trusted, exportable dashboard that shows both **programme outcomes** and **operational exceptions**.

## 3. Product Goals and Success Measures

| Goal | Product outcome | Illustrative measure |
|---|---|---|
| Complete evidence collection | Every active student has one validated community-service record for the programme year. | Submission coverage: submitted records ÷ active students. |
| Earlier intervention | Low-engagement cases are visible and escalated promptly. | Time from submission to alert creation; time from alert creation to acknowledgement. |
| Clear accountability | Each operational alert has an owner, status, history, and resolution note. | Percentage of alerts acknowledged and resolved within the programme-defined service level. |
| Programme insight | Leadership can see the distribution of attendance, participation, contribution, task allocation, mentorship, and conflict outcomes by cohort and project. | Dashboard completeness and export availability. |
| Trusted governance | Records are access-controlled, auditable, and retained according to SPPG policy. | Audit-log coverage; access-review completion; export activity. |

The first production release should not attempt to score students, infer intent, or automatically judge the quality of a project. It should provide **factual, traceable evidence** and a structured human follow-up workflow.

## 4. Scope

### 4.1 In scope

The initial production release includes student submission, cohort/project configuration, role-based access, project-to-mentor mapping, server-side validation, notification rules, email delivery tracking, a programme administration dashboard, export, and audit history. It must support the 11 business questions specified below and preserve selected multi-select values as structured data.

The release also includes an alert workflow for low attendance and missing or explicitly absent participation, contributions, or assigned tasks. Alerts are created on new submissions, revised submissions, administrative edits, and approved bulk imports.

### 4.2 Out of scope for the first release

The following should be planned as later enhancements rather than assumed in the first release: automatic sentiment analysis of feedback, automated performance grading, student-to-student comparisons, public leaderboards, WhatsApp/SMS reminders, document uploads, offline mobile synchronisation, and AI-generated intervention recommendations. These features may be useful later but require separate privacy, consent, and operational decisions.

## 5. Users, Roles, and Permissions

| Role | Primary need | Core permissions |
|---|---|---|
| Student/Fellow | Submit an accurate record of individual community-service activity. | Create, save draft, submit, and—until the configured deadline—edit only their own record. |
| Mentor | Understand risks within assigned projects and support follow-up. | View alert summary and approved record details only for mapped projects; acknowledge or comment on alerts if granted. |
| FLO | Coordinate operational follow-up for programme or assigned cohort. | View cohort/project data, receive alerts, assign/acknowledge/resolve alerts, export authorised reports. |
| HLE | Provide leadership oversight and escalate unresolved risks. | View all assigned programme data, receive alerts, review resolution performance, export authorised reports. |
| Programme Administrator | Configure the programme and oversee data quality. | Manage cohorts, roster, projects, mentor assignments, deadlines, recipients, form options, and all records. |
| System Administrator | Maintain secure delivery and integrations. | Manage roles, notification provider settings, access logs, retention settings, and technical monitoring; no routine programme editing unless explicitly authorised. |

The implementation must use **role-based access control (RBAC)**. A mentor must never receive a student record from a project to which they are not assigned. FLO and HLE visibility must be configurable by programme, cohort, or project responsibility rather than assumed globally.

## 6. Dependencies and Required Configuration

The form cannot operate as a dependable production system until the following dependencies are configured and validated. Programme data must be maintained through an administration interface or controlled import—not embedded as permanent application source code.

| Dependency | Owner | Required configuration or data | Failure behaviour |
|---|---|---|---|
| Cohort roster | Programme Administrator | Student ID, full name, programme year, cohort, active/inactive status, approved email, optional internal identifier. | Student cannot be matched to a valid roster entry; submission is blocked or routed to an exception queue. |
| Capstone project catalogue | Programme Administrator | Exactly 22 current-year project records, project ID, official name, programme year, status, and optional description. | Project selection is unavailable; new student submission is blocked. |
| Mentor mapping | Programme Administrator | At least one active mentor and email address per project; effective date range. | Risk alert remains open as a configuration failure and is sent to FLO/HLE without Mentor delivery. |
| FLO and HLE recipient mapping | Programme Administrator | Named recipients, email addresses, scope, effective date, and escalation priority. | Alert delivery is blocked for the missing role and a system configuration alert is created. |
| Identity and access provider | System Administrator | Single sign-on or verified email sign-in, role assignment, session controls, and administrative access procedure. | Public or unauthenticated access is denied except where a policy-approved student access method is configured. |
| Relational database | System Administrator | Managed database, encrypted backups, migration process, retention policy, and monitoring. | Submission service fails safely with a clear retry message; no partial response is recorded. |
| Transactional email provider | System Administrator | Provider account, verified sending domain, API key stored server-side, sender identity, reply-to mailbox, and delivery-event integration where available. | Alert is retained in the queue, retries occur, and the dashboard shows an undelivered notification state. |
| Alert-delivery worker or managed queue | System Administrator | Durable queue or job runner, retry schedule, idempotency handling, and dead-letter review process. | Alert remains pending; an operational system alert is raised after configured retry exhaustion. |
| Reporting and export controls | Programme Administrator and System Administrator | Approved export columns, timezone, date format, access permissions, and retention policy. | Exports are disabled for unauthorised roles. |

### 6.1 Notification delivery approaches requiring a product decision

The alert requirement is deterministic and event-triggered by a record submission or later edit. The following two viable delivery patterns should be evaluated before build commencement.

| Approach | Trade-offs | Cost | Setup complexity |
|---|---|---|---|
| Direct transactional email during the submit request | Fastest implementation. However, a slow or failed email provider can delay the student’s form confirmation and makes retry/audit behaviour harder to control. It is acceptable only for a low-risk pilot. | Lower initial cost; provider usage fees still apply. | Lower. |
| Persist alert first, then deliver email through a durable asynchronous notification workflow | Recommended for production planning because the student record and alert are stored before email is attempted. Supports retries, idempotency, delivery status, consolidated messages, and an escalation queue. Requires queue/worker or equivalent managed delivery mechanism. | Moderate setup and provider cost; scales more safely. | Moderate. |

The product owner must select the delivery method before implementation begins. This PRD assumes the **second approach** for its acceptance criteria because it is the only approach that independently tracks alert creation and email delivery. If the first approach is selected for a pilot, the roadmap must include a migration to the durable approach before broad rollout.

## 7. Student Experience and Layout Requirements

### 7.1 Page layout

The student experience must be designed as a focused, mobile-responsive record rather than an administrative dashboard. On desktop, the layout should use a persistent left information rail showing the SPPG Nigeria identity, programme year, draft status, and completion progress. The main content column should present the form in numbered sections with clear labels, concise supporting text, and accessible error messages. On mobile, the rail collapses into a concise top header; all input controls become a single-column flow with touch-friendly spacing.

The form must include a visible progress indicator based on completed sections, not merely page scroll. It must state that draft data is saved and distinguish **Saved draft**, **Ready to submit**, **Submitting**, and **Submitted** states. The submit action must remain unavailable until all required questions have a valid response and the configured student/project lists have been loaded.

### 7.2 Student flow

| Step | Student action | System behaviour | Completion criterion |
|---|---|---|---|
| 1. Access | Student opens the record link and authenticates where required. | Confirms active roster membership and opens their current programme-year record or new draft. | Student is matched to the correct cohort. |
| 2. Identify project | Student confirms name and selects the capstone project. | Loads project-specific mentor mapping in the background; records configuration version. | Valid roster and project values selected. |
| 3. Complete record | Student responds to all sections and may save a draft. | Validates input inline and server-side; persists draft without generating alerts. | Required fields have valid values. |
| 4. Review and submit | Student submits final record. | Creates immutable submission version, evaluates alert rules, persists resulting alerts, and returns a confirmation. | Final record is stored and receives a reference number. |
| 5. Follow-up | Student may edit before the configured deadline if policy permits. | A revision creates a new version and re-evaluates alerts without deleting prior audit history. | Revision is traceable; alert status is updated appropriately. |

### 7.3 Form behaviour and validation principles

All required validations must run on the client for usability and again on the server for data integrity. Labels must be visible, keyboard navigation must be supported, input errors must be announced to assistive technologies, and every colour-based status must include text or an icon. A date must use a standard calendar picker and be stored in ISO format (`YYYY-MM-DD`) with a displayed timezone convention defined by SPPG.

Multi-select sections must show selected choices clearly. They must include an explicit **none** option where a student has no activity to report; that option must be mutually exclusive with all positive options. This prevents ambiguity between an intentionally reported absence and an unfinished form.

## 8. Detailed Form Requirements

| ID | Section and field | Input control | Required behaviour | Validation and data rule |
|---|---|---|---|---|
| F-01 | **Name** | Searchable single-select dropdown populated from active cohort roster. | Student selects their own name; authenticated deployments should prefill and lock this field. | Must match an active student record for the selected programme year. |
| F-02 | **Project Name** | Searchable single-select dropdown populated with the 22 active capstone projects. | Student selects the project served. | Must match an active project; project must have an assigned mentor or create a configuration exception. |
| F-03 | **Date** | Native or accessible calendar picker. | Captures the record date or programme-defined completion date. | Required valid ISO date; cannot be later than the submission date unless administrators permit future-dated planning records. |
| F-04 | **Attendance at group meetings** | Single-select dropdown. | Choices: `0–50%`, `50–80%`, and `80–100% of group meetings`. | Required. Selecting `0–50%` creates a low-attendance alert on final submission. |
| F-05 | **Participation in group** | Multi-select checkbox group. | Positive options: Online seminar; Town Hall; Debates; Interviews; Trainings; Discussions; Podcasts; Physical group meetings; Site visits; Physical town halls; Physical seminars; Physical trainings; Hosted events. Add `I did not participate in any listed activity`. | Required. The explicit no-participation option is mutually exclusive. No positive selection or explicit no-participation causes a participation-risk alert. |
| F-06 | **Contributions** | Multi-select checkbox group. | Positive options: Personally contributed financially; Enabled donation by a third party; Provided use of property/car/staff/other asset; Contributed via personal network. Add `I did not make a contribution`. | Required. Explicit no-contribution is mutually exclusive. No positive selection or explicit no-contribution causes a contribution-risk alert. |
| F-07 | **Did you complete assigned task?** | Single-select Yes/No radio group. | Captures self-reported task completion. | Required. `No` must appear in dashboard filters; whether it sends an alert is an SPPG policy configuration for a later decision. |
| F-08 | **Mentors** | Single-select dropdown. | Choices: `The project mentor performed well`; `The project mentor was not efficient`. | Required. A poor mentor assessment is reported in dashboard metrics and may be configured as an operational alert in a future policy version. |
| F-09 | **Improvement feedback** | Long-form text area. | Student identifies areas for programme or project improvement. | Required; minimum 10 meaningful characters; maximum 2,000 characters; content is retained in original form and never altered by the system. |
| F-10 | **Conflict resolution** | Single-select dropdown. | Choices: No conflict involvement; aided conflict resolution; conflict resolved; conflict not resolved. | Required. Unresolved conflict must be visualised in the dashboard; optional alerting is a future policy decision. |
| F-11 | **Assigned tasks** | Multi-select checkbox group. | Positive options: Writing final report; Project Management; Team Lead; Deputy Team Lead; Accounting; I.T.-related; Research; Other tasks. Add `No assigned task`. | Required. Explicit no-assigned-task is mutually exclusive. No positive selection or explicit no-assigned-task causes a task-assignment risk alert. |

### 8.1 Explicit negative-response rules

The product must not interpret an empty field as a reliable statement. Therefore, the standard student interface requires a response for Participation, Contributions, and Assigned Tasks. If a student has nothing to report, they must select the explicit negative choice specified in the table above. The system then treats this as a purposeful response and raises the corresponding alert.

An empty selection should be prevented by standard form validation. However, the server must still detect empty values arriving from a bulk import, legacy record, administrative edit, integration, or client-side bypass. In those cases, the system creates a **data-quality-and-engagement alert** rather than silently accepting incomplete evidence.

## 9. Alerting and Email Notification Requirements

### 9.1 Alert principles

Alerts must be created at the time a submission becomes final, or whenever an already-final record is changed by an authorised user. The system must create an alert record before attempting to send email. It must consolidate multiple conditions from the same submission into one operational case and one recipient email, preventing a student with several issues from causing four separate messages.

Each alert must have a stable identifier, the student, cohort, project, mentor, triggering rule(s), timestamp, submission version, severity, owner, delivery status, acknowledgement state, notes, and resolution state. Notification events must be idempotent: reprocessing the same submission version must not send duplicate alerts unless an authorised user explicitly chooses **Resend notification**.

### 9.2 Required alert matrix

| Alert code | Trigger condition on final submission or revision | Severity | Required recipients | Required action |
|---|---|---|---|---|
| ALT-ATT-LOW | Attendance is `0–50% of group meetings`. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; add to dashboard queue. |
| ALT-PART-NONE | Participation contains `I did not participate in any listed activity`. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; add to dashboard queue. |
| ALT-PART-MISSING | Participation has no positive selection or no explicit response after server-side validation/import. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; identify data quality issue. |
| ALT-CONT-NONE | Contributions contains `I did not make a contribution`. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; add to dashboard queue. |
| ALT-CONT-MISSING | Contributions has no positive selection or no explicit response after server-side validation/import. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; identify data quality issue. |
| ALT-TASK-NONE | Assigned Tasks contains `No assigned task`. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; add to dashboard queue. |
| ALT-TASK-MISSING | Assigned Tasks has no positive selection or no explicit response after server-side validation/import. | High | FLO, HLE, and the project Mentor. | Create/merge alert; send consolidated email; identify data quality issue. |
| ALT-RECIPIENT-CONFIG | Mentor, FLO, or HLE recipient configuration is missing or invalid for a triggered alert. | Critical configuration | Programme Administrator and System Administrator. | Do not discard the operational alert; mark recipient delivery incomplete and show configuration failure. |
| ALT-DELIVERY-FAILED | An alert email exhausts configured delivery retries. | High operational | Programme Administrator and System Administrator. | Mark notification failed and require manual resend or correction. |

**Important:** When more than one trigger applies, such as `0–50% attendance` plus `No assigned task`, the system must create one parent alert with multiple reason codes. One email is sent to the recipient set, listing all reasons. The dashboard counts both the parent alert and the individual reasons for analytics.

### 9.3 Event sequence and triggers

| Sequence | Trigger | System action | User-visible outcome |
|---|---|---|---|
| A | Student selects `0–50%` attendance while completing the form. | Show non-judgmental inline guidance: “Your programme support team may follow up after submission.” Do not send email yet. | Student understands the implication without being interrupted. |
| B | Student chooses a negative engagement answer or leaves a multi-select empty. | Show required validation for empty fields; if explicit negative answer is selected, show an inline neutral confirmation. | Student must either provide activity or explicitly report none. |
| C | Student submits a valid final record. | Store submission version; evaluate rules; create one consolidated alert where required; enqueue notification. | Student sees a successful submission reference without waiting for email delivery. |
| D | Notification worker processes alert. | Resolve recipients from current configuration; render email; send; store provider message ID and delivery status. | FLO, HLE, and Mentor receive one email with a secure link to the alert detail. |
| E | Recipient opens the alert link. | Authorise role; show contextual record summary and action controls; log access. | Recipient can acknowledge, add follow-up notes, assign owner, or resolve. |
| F | Record is revised. | Create new response version; re-evaluate alert conditions; close superseded alert reasons only when the new evidence resolves them; log all transitions. | Dashboard shows both current status and history. |

### 9.4 Email content and delivery rules

The product must send one concise, secure email per alert event. The email must not include the entire free-text improvement response by default. It should include only the minimum operational context required for follow-up and a signed, authenticated link to view the record.

| Email component | Requirement |
|---|---|
| Subject | `Action required: SPPG community-service record flag — {Student Name} / {Project Name}` |
| Recipients | FLO, HLE, and assigned Mentor. Use role-address mapping and remove duplicate email addresses before sending. |
| Alert summary | Plain-language list of triggered reasons, for example: `Attendance recorded as 0–50%` and `No assigned task reported`. |
| Context | Student, cohort, programme year, project, mentor, submission date/time, and alert reference. |
| Call to action | Secure `Review alert` link opening the authorised dashboard detail; no unauthenticated record data in URL. |
| Reply handling | Configurable reply-to programme mailbox. Replies are not treated as alert resolution unless imported or recorded by an authorised administrator. |
| Delivery record | Store recipient, provider message ID, queued/sent/delivered/failed status, timestamps, retry count, and error summary. |

## 10. Administrative Dashboard Requirements

### 10.1 Dashboard purpose

The dashboard must answer two questions immediately: **“What is the state of community-service participation across the programme?”** and **“Who needs follow-up now?”** It must support programme oversight without requiring staff to manually inspect every individual record.

The dashboard should open on an executive overview with cohort/programme filters and a visible unresolved-alert count. It must never substitute charts for action: every risk visualisation must connect to a filterable record list or alert queue.

### 10.2 Dashboard navigation and layout

| Area | Layout requirement | Primary user task |
|---|---|---|
| Overview | Header filters, KPI row, trend/segment charts, urgent alert preview. | Assess programme health at a glance. |
| Alert Queue | Filterable, sortable operational table with bulk-safe actions. | Acknowledge, assign, investigate, and resolve exceptions. |
| Submissions | Searchable records table with detail drawer or detail page. | Review individual evidence and export authorised results. |
| Project Health | Project-level cards/table and risk matrix. | Compare attendance, engagement, alerts, and mentor feedback by project. |
| Mentor View | Mentor-level aggregated view scoped by permissions. | Identify projects requiring support and mentor-performance patterns. |
| Feedback & Conflict | Structured distributions plus permissioned review of feedback. | Identify recurring improvement themes and unresolved conflict cases. |
| Programme Setup | Cohort roster, project list, mappings, deadline, recipient and form-option configuration. | Keep programme configuration current and auditable. |
| Audit & Exports | Activity history, email delivery status, and export controls. | Provide oversight and controlled reporting. |

### 10.3 Required dashboard outcomes and visualisations

| Outcome to visualise | Primary visual | Required interaction | Management decision supported |
|---|---|---|---|
| Submission coverage | KPI card plus completion trend by day/week. | Filter by cohort, project, and deadline status; drill to non-submitters. | Whether reminders or deadline intervention are required. |
| Attendance distribution | Segmented bar chart for `0–50%`, `50–80%`, and `80–100%`. | Click segment to open affected student list. | Where group-meeting participation is weak. |
| Low-attendance risk | Prominent high-severity KPI and project-by-project heatmap. | Drill to unresolved low-attendance alerts and assignee. | Which projects need immediate FLO/HLE/Mentor follow-up. |
| Participation activity | Horizontal multi-select aggregation chart showing count and percentage for each activity. | Filter by project, cohort, attendance band, and submitted date. | Whether engagement is broad or concentrated in only one type of activity. |
| No-participation risk | KPI plus alert trend chart. | Drill to students with explicit none or missing participation. | Whether students are disengaged or whether data quality is weak. |
| Contribution types | Horizontal multi-select aggregation chart with no-contribution segment. | Filter by project/cohort; export underlying counts. | Whether projects are receiving diversified support. |
| Assigned-task distribution | Stacked bar chart by project for task responsibilities, including no-task cases. | Drill to individual records; compare task allocation across projects. | Whether projects distribute meaningful roles and leadership opportunities. |
| Alert workload | Status funnel: New → Emailed → Acknowledged → In progress → Resolved/Dismissed. | Filter by reason, severity, owner, project, and ageing band. | Whether operations are resolving risks promptly. |
| Alert ageing | Table and ageing buckets: `<24h`, `1–3 days`, `4–7 days`, `>7 days`. | Sort by age; bulk assign only where policy permits. | Which alerts are overdue. |
| Mentor assessment | Bar chart for performed-well vs not-efficient, displayed by project and mentor where sample-size policy permits. | Drill to anonymised aggregate first; limit individual response viewing by role. | Where mentor support may require improvement. |
| Conflict resolution | Distribution chart showing no conflict, aided, resolved, and unresolved. | Drill to unresolved-conflict records. | Whether conflict follow-up or mediation is required. |
| Improvement feedback | Searchable, permissioned text table with manual tags and export. | Filter by programme/project/tag; show tag frequency only after staff review. | What programme design improvements recur. |

### 10.4 Required KPI definitions

| KPI | Definition | Calculation | Default display |
|---|---|---|---|
| Submission coverage | Portion of active roster with a final record. | Final unique student submissions ÷ active students in filtered scope. | Percentage and numerator/denominator. |
| On-time submission rate | Portion of final records submitted by the configured deadline. | Final on-time records ÷ final records. | Percentage. |
| Unresolved alerts | Parent alerts whose status is New, Emailed, Acknowledged, or In Progress. | Count in filtered scope. | Count with severity breakdown. |
| Low-attendance cases | Students with a current record selecting `0–50%`. | Distinct student count. | Count and percentage of final records. |
| No-engagement cases | Students with one or more current none/missing participation, contribution, or task reason. | Distinct student count. | Count; drill to reasons. |
| Alert acknowledgement time | Operational responsiveness. | Median and 90th percentile of acknowledged-at minus created-at. | Hours/days. |
| Alert resolution time | Time to close operational risk. | Median and 90th percentile of resolved-at minus created-at. | Hours/days. |
| Project health indicator | Transparent operational indicator, not a student score. | Configurable combination of coverage, low-attendance rate, no-engagement rate, unresolved alert ageing, and missing mentor mapping. | Green/amber/red with reason list; never display without explanatory detail. |

### 10.5 Alert queue actions and state model

| Alert status | Meaning | Permitted next actions |
|---|---|---|
| New | Alert was created but notification processing has not completed. | View; correct recipient configuration; retry notification. |
| Emailed | Recipient email was sent or accepted by provider. | Acknowledge; assign owner; add note; mark In Progress; resend where authorised. |
| Acknowledged | A designated role has seen the alert. | Assign owner; add note; mark In Progress; resolve; dismiss with reason. |
| In Progress | Follow-up is underway. | Add note; change owner; resolve; dismiss with reason. |
| Resolved | Follow-up is complete or later record evidence resolved the trigger. | Reopen with reason; view full history. |
| Dismissed | Alert was reviewed and deemed not requiring intervention. | Reopen with reason; view dismissal rationale. |
| Delivery Failed | Email could not be delivered after configured retries. | Correct recipient; resend; assign manual contact action. |

Every state transition must record the actor, timestamp, previous/new status, optional note, and selected resolution or dismissal code. Deleting alerts is not permitted through the standard interface.

## 11. Data Model and Data Lifecycle

The developer should use a relational data model with explicit versioning rather than a single opaque form-response record. Multi-select selections may be stored in normalised join tables or structured JSON with indexed reporting projections; the chosen approach must still support accurate aggregation and export.

| Entity | Required fields | Relationship / purpose |
|---|---|---|
| ProgrammeYear | ID, display name, start/end dates, form deadline, timezone, status. | Parent for cohorts, projects, form configuration, and records. |
| Cohort | ID, programme year, name, active status. | Groups students and operational recipients. |
| Student | ID, roster ID, full name, approved email, cohort ID, active status. | Has one current record per programme year and historical versions. |
| CapstoneProject | ID, programme year, official name, status, description. | Has members, mentor assignment(s), and aggregated health metrics. |
| ProjectMentorAssignment | Project ID, mentor ID, start/end date, active status. | Determines Mentor alert recipients at the time of trigger. |
| OperationalRecipientAssignment | Role (FLO/HLE), scope, email, start/end date, active status. | Determines FLO/HLE recipients by programme/cohort/project scope. |
| CommunityServiceRecord | ID, student, project, programme year, current version ID, submitted status, timestamps. | Stable parent for revisions and audit trail. |
| CommunityServiceRecordVersion | Record ID, version number, all submitted responses, submitted by, submission timestamp, configuration version. | Immutable evidence snapshot. |
| Alert | ID, record version, parent status, severity, owner, opened/acknowledged/resolved timestamps. | Parent operational case; one per record version event where one or more triggers apply. |
| AlertReason | Alert ID, rule code, reason state, evidence value. | Stores each trigger reason in consolidated alert. |
| NotificationDelivery | Alert ID, recipient role/email, provider ID, status, retry count, sent/delivered/failed timestamps. | Records email delivery and retries. |
| AlertActivity | Alert ID, actor, action, note, previous/new values, timestamp. | Full operational audit trail. |
| AuditLog | Actor, entity, action, before/after summary, timestamp, source. | Security and data-governance record. |

### 11.1 Retention and export

Retention duration, export restrictions, and deletion procedures must be approved by SPPG before go-live. The system should retain immutable audit evidence for the approved period, allow only authorised users to export personal data, and generate an audit event for every export. Student free-text feedback must not be included in broad aggregate exports by default; a separate permission is required.

## 12. Functional Requirements by Area

| Requirement ID | Requirement |
|---|---|
| FR-01 | The system shall allow an authorised administrator to create a programme year, configure a form deadline, assign cohort-level FLO/HLE recipients, and activate/deactivate form collection. |
| FR-02 | The system shall allow administrators to import or manage the active cohort roster and the 22 capstone projects with validation and error reporting. |
| FR-03 | The system shall require an active mentor mapping for each project and show configuration exceptions before form launch. |
| FR-04 | The system shall present the 11 required question areas using the control types and options defined in Section 8. |
| FR-05 | The system shall provide local or server-side draft saving with an explicit user-visible save state and must not generate alerts for drafts. |
| FR-06 | The system shall validate all final submissions on the server and preserve an immutable version of every final response. |
| FR-07 | The system shall apply all alert rules in Section 9 to every final submission, authorised revision, and supported administrative import. |
| FR-08 | The system shall consolidate multiple alert reasons from the same submission into one parent alert and one recipient email event. |
| FR-09 | The system shall send alert email to FLO, HLE, and the project Mentor for all low-attendance and no-engagement triggers, subject to configured recipient mappings. |
| FR-10 | The system shall record email delivery status and allow authorised users to resend after correcting recipient data. |
| FR-11 | The system shall expose the visualisations, filters, drill-downs, and alert queue described in Section 10. |
| FR-12 | The system shall provide CSV/XLSX export for authorised aggregate and record-level views, with the filtered scope, export actor, and timestamp recorded. |
| FR-13 | The system shall enforce role and scope permissions for every record, alert, dashboard filter, export, and configuration action. |
| FR-14 | The system shall provide audit history for submissions, revisions, alert transitions, recipient changes, configuration edits, and exports. |

## 13. Non-Functional Requirements

| Category | Production requirement |
|---|---|
| Security | Encrypt data in transit and at rest; store email-provider credentials only in server-side secret management; use RBAC; protect against unauthorised record access, cross-project access, and insecure direct-object references. |
| Privacy | Collect only fields needed for the programme purpose; define retention and access policy; restrict free-text feedback; make export permissions explicit. |
| Reliability | A final submission and its alert decision must be committed transactionally. Email failure must not erase or invalidate a submission. Notification processing must be retryable and idempotent. |
| Availability | Students must receive a clear error state and retry path if the service is temporarily unavailable. Administrative actions must not create duplicate records or alerts on refresh/retry. |
| Performance | Normal form load and save interactions should feel immediate under expected cohort load. Dashboard filters should return usable results without requiring full-data downloads. |
| Accessibility | Meet WCAG 2.2 AA intent: labels, keyboard access, focus visibility, error announcements, contrast, non-colour status indicators, and responsive touch targets.[1] |
| Observability | Capture structured logs, alert-processing metrics, email-delivery failures, application errors, database latency, and audit events. Provide technical monitoring separately from programme alerts. |
| Data quality | Enforce controlled vocabularies, valid roster/project references, mutually exclusive none options, and server-side rules for required fields. |

## 14. Acceptance Criteria

The following scenarios define the minimum production acceptance standard.

| Scenario | Given | When | Then |
|---|---|---|---|
| Valid standard submission | An active student and project are configured. | Student completes every required field with positive/normal responses. | A final record version is stored, no engagement alert is created, and student sees a confirmation reference. |
| Low-attendance escalation | An active student selects `0–50%` attendance. | Student submits the final record. | The system creates a high-severity alert, sends one consolidated email to FLO/HLE/Mentor, records delivery state, and displays the alert in the queue. |
| Explicit no participation | Student selects `I did not participate in any listed activity`. | Student submits. | The system raises `ALT-PART-NONE`; the parent alert and email clearly include the participation reason. |
| Explicit no contribution | Student selects `I did not make a contribution`. | Student submits. | The system raises `ALT-CONT-NONE` and follows the required email workflow. |
| Explicit no assigned task | Student selects `No assigned task`. | Student submits. | The system raises `ALT-TASK-NONE` and follows the required email workflow. |
| Multiple risk flags | A record has `0–50%` attendance, no participation, and no assigned task. | Student submits. | Exactly one parent alert and one email event are created with three reason codes. |
| Empty multi-select protection | A student attempts to submit without a Participation, Contributions, or Assigned Tasks response. | Student selects Submit. | Client and server reject the final submission with accessible field errors; no partial record or alert is created. |
| Import/data bypass protection | An administrative import or API sends a final response with an empty engagement array. | Server processes the record. | The system records the data-quality alert reason and routes it through the same operational workflow. |
| Missing mentor configuration | A triggered alert is associated with a project with no active mentor email. | Notification processing begins. | FLO/HLE are still notified; a recipient-configuration alert appears; delivery failure is traceable. |
| Email failure | Email provider is unavailable after record submission. | Notification retries are exhausted. | The final record and alert remain stored; delivery status is Failed; authorised staff can correct recipient details and resend. |
| Alert resolution | FLO reviews a sent alert and documents a follow-up action. | FLO selects Resolve and enters a resolution note. | Alert status, actor, timestamp, note, and audit history are updated; dashboard KPI and ageing views refresh. |
| Permission boundary | Mentor assigned to Project A accesses a Project B alert link. | Mentor opens the link. | The system denies access, records the denied attempt, and shows no Project B data. |

## 15. Delivery Phases

| Phase | Scope | Exit criteria |
|---|---|---|
| Phase 0: Programme readiness | Confirm roster, 22 project list, role definitions, FLO/HLE/Mentor recipient mappings, deadline, policy decisions, privacy/retention, and email sender. | All dependencies in Section 6 pass configuration validation. |
| Phase 1: Core record | Student authentication, roster/project configuration, 11-question form, drafts, final submission, data versioning, and confirmation. | UAT confirms complete data capture and export of a test cohort. |
| Phase 2: Risk workflow | Alert rules, consolidated parent alerts, email delivery, retries, notification audit, and alert queue. | Test cases for all required alert rules and delivery failures pass. |
| Phase 3: Insight dashboard | KPIs, filters, drill-downs, project health, feedback/conflict views, exports, and role-scoped access. | Programme leadership validates dashboard numbers against test data. |
| Phase 4: Controlled launch | Pilot cohort, monitored deployment, staff playbook, support channel, training, and post-pilot review. | No unresolved critical configuration issues; agreed operational SLAs are met. |

## 16. Open Decisions for SPPG

| Decision | Why it matters | Required owner |
|---|---|---|
| Confirm the exact full names and operational scope of FLO and HLE. | Determines role labels, permissions, and recipient mappings. | Programme Leadership. |
| Provide the active cohort roster and official 22 project names. | Required to launch valid dropdowns and report coverage accurately. | Programme Administration. |
| Confirm whether `Did not complete assigned task`, poor mentor assessment, and unresolved conflict should create alerts in the first release. | These conditions are visible in the dashboard now, but email escalation changes operational workload. | Programme Leadership. |
| Set alert acknowledgement and resolution service levels. | Needed for queue ageing labels, dashboards, and escalation policy. | FLO/HLE leadership. |
| Select email delivery architecture and provider. | Determines reliability, retry behaviour, sender domain, and operational cost. | System Administrator with Programme Leadership. |
| Define edit deadline and post-submission correction policy. | Determines whether students can revise records and how superseded alerts resolve. | Programme Administration. |
| Approve retention, export, privacy notice, and data-access policy. | Required before collecting personal and free-text programme feedback at scale. | SPPG Governance / Legal / Data Protection owner. |

## 17. Developer Handoff Checklist

The delivery team should begin implementation only after the programme configuration and open decisions above are resolved. The technical design should include database migrations, role/scope authorisation tests, server-side validation tests, alert rule unit tests, email failure/retry tests, dashboard aggregation tests, audit-log tests, and accessibility testing for the student form.

The handoff is complete when the team can demonstrate the low-attendance, no-participation, no-contribution, and no-assigned-task scenarios end to end: final submission, one consolidated alert, FLO/HLE/Mentor notification, dashboard appearance, acknowledgement, resolution, export, and audit history.

## References

[1]: https://www.w3.org/TR/WCAG22/ "Web Content Accessibility Guidelines (WCAG) 2.2 — W3C"
