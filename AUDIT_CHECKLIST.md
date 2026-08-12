# Limitation-Complete Release Audit

This checklist is the acceptance test for the repository's claim that no known limitation is left unaddressed.

| Check | Verification method | Release status |
|---|---|---|
| Scientific scope is explicit | Inspect model diagnostics and README | Pass: exploratory model is named and bounded |
| Unsupported reaction types are flagged | Select a non-free-radical type or inspect validation tests | Pass: warning is shown |
| No fabricated experimental values | Search services and output labels | Pass: local model is deterministic and labeled |
| Measured data have a separate evidence path | Run the measured-fit panel with demo CSV | Pass: measured-fit tier, residuals, holdout, and interval are shown |
| Malformed data cannot silently pass | Run parser tests with missing columns, invalid values, duplicates, and too few rows | Pass: parser rejects them |
| Uncertainty is visible | Inspect fit diagnostics | Pass: RMSE, R², parameter interval, and residuals are shown |
| External validity is not overstated | Inspect fit warnings and limitation register | Pass: independent validation is required |
| Live integrations fail safely | Disable network or inspect timeout fallbacks | Pass: warnings are returned without invented facts |
| Provenance is reproducible | Inspect record version and input hash | Pass: identifiers are visible in results |
| API secrets are absent | Search source for Gemini/API-key patterns | Pass: no model secret is required |
| Install and demo are practical | Run npm install, test, typecheck, demo, build | Pass: all commands succeed |
| Product risks are documented | Inspect LIMITATION_REGISTER.md | Pass: each known limitation has mitigation and residual next step |

A passing checklist does not imply that the chemistry is valid. It verifies that the software does not conceal known uncertainty and that users have an actionable path from screening to evidence.
