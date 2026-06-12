# Bazos Agent Gap-Filling Rules

```yaml
id: BAZOS-AGENT-GAP-FILLING-RULES
status: approved
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Agents May Infer

- command sequencing for documented validation;
- branch names following `codex/bazos-goal-*`;
- report filenames under `reports/validation/`;
- "not applicable" for contract or replay sections only when justified by inspected files and goal scope.

## Agents Must Not Infer

- permission to deploy production;
- permission to weaken Bazos compliance policy;
- permission to bypass verification, CAPTCHA, device checks, cookies, bans, rate limits, active-ad caps, duplicate checks, category cadence, or content rules;
- credentials, secrets, cookies, verification codes, payment details, or private configuration;
- acceptance of unresolved execution-critical `[MISSING: ...]` or `[UNKNOWN: ...]` markers.

## Fail-Closed Conditions

Stop and ask the owner, or mark the goal blocked, when:

- requested work conflicts with `docs/BAZOS_COMPLIANCE.md`;
- remote state contradicts local state and source of truth cannot be determined;
- validation cannot run and no defensible substitute exists;
- deployment approval is required but absent;
- a coding task lacks goal impact, execution plan, or pre-coding readiness gate evidence.
