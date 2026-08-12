# Implementation Report

## Result

The repository was refactored from an AI-generated polymerization simulator into **Polymer Kinetics Atlas**, a deterministic, evidence-aware screening workbench. The browser no longer requires a Gemini key, exposes no browser-side model secret, or presents generated prose as scientific evidence.

## Scientific changes

The local workflow now uses a bounded pseudo-first-order conversion screen for free-radical polymerization. The code explicitly records the model name, assumptions, warnings, and parameter summary. Copolymer composition uses supplied reactivity ratios as a transparent heuristic. Mn, Mw, and dispersity are bounded proxies and are labeled as such. Input validation checks required names, positive concentrations, temperature range, reactivity-ratio range, CTA consistency, and unsupported reaction types.

The implementation deliberately does not fabricate experimental measurements, fit adsorption or kinetic data, infer toxicity, certify safety, or claim mechanism validity. The README and `OPEN_ISSUES.md` specify what raw measurements and expert review are required before scientific use.

## Product and UX changes

The UI now provides a demo button, guided form sections, inline explanations, visible warnings, a prominent exploratory-status banner, a responsive Plotly chart, a scrollable data table, CSV export, assumption inspection, and source provenance cards. The results view distinguishes local model assumptions from live metadata sources and handles integration failure without replacing missing facts with guesses.

## Live integrations

PubChem PUG REST is used for optional compound metadata lookup. Crossref is used for optional literature metadata discovery. Both calls use short timeouts and return explicit warnings on failure. The app works without either service and without any API key.

## Validation

| Check | Result |
|---|---|
| `npm run test` | Passed model and validation invariants |
| `npm run typecheck` | Passed |
| `npm run demo` | Passed; wrote 25-point local output |
| `npm run build` | Passed; Vite production bundle created |
| Obsolete Gemini/API-key scan | No matches |

Vite still reports a large Plotly bundle warning. The production build remains successful; further code-splitting should be handled separately because an attempted manual chunk configuration exceeded the sandbox resource limit.

## Remaining scientific limitation

The repository contains no experimental dataset, calibration metadata, independent batches, polymer characterization, or validated parameter set. Accordingly, the default output is not suitable as scientific evidence. `ROADMAP.md`, `OPEN_ISSUES.md`, and `docs/USER_GUIDE.md` define the path toward experimental fitting, uncertainty analysis, literature evidence capture, cheminformatics identity checks, and expert-reviewed validation.
