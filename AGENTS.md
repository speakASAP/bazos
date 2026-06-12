# Agents: bazos-service

## Required Context

Before implementation, branch orchestration, deployment, or worker delegation for Bazos, read:

```text
AGENTS.md
README.md
BUSINESS.md
SPEC.md
SYSTEM.md
PLAN.md
TASKS.md
docs/BAZOS_COMPLIANCE.md
docs/IMPLEMENTATION_STATE.md
docs/IMPLEMENTATION_ORCHESTRATOR.md
docs/governance/PROJECT_INVARIANTS.md
docs/process/INTENT_PRESERVATION_SYSTEM.md
docs/process/DOCUMENTATION_COMPLETENESS_STANDARD.md
docs/process/OPERATIONAL_GATES.md
docs/process/AGENT_GAP_FILLING_RULES.md
implementation-goals/README.md
```

## Runtime Context

- Remote server alias: `alfares`.
- Remote repository: `/home/ssf/Documents/Github/bazos-service`.
- Production URL: `https://bazos.alfares.cz`.
- Kubernetes namespace: `statex-apps`.
- Deployment command, only after deployment-readiness approval:

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && ./scripts/deploy.sh'
```

## Core Intent

Bazos-service automates compliant Bazos.cz classifieds operations. It must never bypass Bazos verification, rate controls, CAPTCHA, device checks, bans, duplicate controls, category limits, active-ad caps, or content rules.

All implementation must preserve the intent chain:

```text
Bazos business constraints
-> Bazos compliance policy
-> Project invariants
-> Goal impact
-> Execution plan
-> Pre-coding readiness gate
-> Code change
-> Validation report
-> Intent Compliance Report
-> State update
-> Commit or no-commit record
```

## Non-Negotiable Rules

- Bazos has no public posting API; use only compliant browser/form flows with verified sessions.
- Stop automation on SMS, bank/micro-payment, CAPTCHA, device, cookie, session, duplicate, content, ban, or anti-abuse challenges.
- Every Bazos phone identity must be manually authorized and verified before publishing.
- Multiple phone identities must never be used to evade Bazos limits.
- Enforce maximum 50 active non-promoted ads per verified identity.
- Enforce randomized per-identity publish pacing of 60-180 seconds, never below 60 seconds.
- Enforce at most one ad per 24 hours per verified identity per Bazos category.
- Check local and public duplicates before publish.
- Do not log or expose raw cookies, verification codes, passwords, payment details, or secrets.
- Production deployment requires goal scope, validation evidence, and explicit owner intent.

## Orchestrator Duties

1. Select the next goal from `docs/IMPLEMENTATION_STATE.md` and `implementation-goals/README.md`.
2. Create or update a goal impact record before coding.
3. Create or update an execution plan before coding.
4. Run and record the pre-coding readiness gate before editing code.
5. Keep implementation inside the selected goal and documented file ownership.
6. Run relevant tests and validation gates.
7. Update `docs/IMPLEMENTATION_STATE.md`.
8. Commit completed goal changes, or record why no commit was made.

## Active Agents

No autonomous production agents are enabled by this document. Scraping, publishing, queueing, and policy checks must remain rule-based and compliance-gated.
