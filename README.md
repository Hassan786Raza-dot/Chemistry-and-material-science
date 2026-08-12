# Polymer Kinetics Atlas

Polymer Kinetics Atlas is a researcher-facing workbench for transparent **screening estimates** of polymerization kinetics. It replaces opaque generative output with a bounded local model, explicit assumptions, reproducible exports, and optional live metadata enrichment from PubChem and Crossref.

The application is deliberately conservative. It does not claim to predict a specific polymerization, establish a mechanism, fit experimental data, assess toxicity, certify safety, or prove a result suitable for publication. Numerical output is labeled `deterministic-estimate` until it has been calibrated and validated against independent experimental data.

## Quick start

```bash
npm install
npm run typecheck
npm run test
npm run demo
npm run dev
```

Open the local URL printed by Vite and select **Run demo**. The demo runs without an API key. The browser attempts optional PubChem and Crossref lookups using short timeouts; if the network is unavailable, the local screening model still remains usable and the UI reports the missing live metadata rather than inventing replacements. To move beyond screening, use the **Fit measured conversion data** evidence gate with a CSV containing at least six observations.

## What the model does

For the current free-radical screening mode, the app generates a monotonic conversion curve using a temperature- and initiator-scaled pseudo-first-order term. Copolymer conversion is apportioned using the supplied reactivity-ratio values as a transparent heuristic. Mn, Mw, and dispersity are bounded proxies derived from conversion and a simplified chain-length relation. Every assumption is rendered in the results panel and stored in the exported record.

This is useful for interface validation, scenario comparison, and planning what measurements should be collected. It is not a substitute for a mechanistic kinetic model, quantum chemistry, molecular simulation, calorimetry, NMR, SEC/GPC, or independent validation. The measured-data gate fits a one-parameter conversion model and reports RMSE, R², residuals, a temporal holdout, and an approximate 95% interval; it still cannot establish external validity or reaction mechanism.

## Live resources and provenance

Compound names can be sent to the [PubChem PUG REST API](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial) for formula, molecular weight, and canonical-SMILES metadata. The app stores the request URL, retrieval time, and live/cached status. A Crossref metadata search can return DOI links, titles, authors, years, and journals for the selected reaction and monomers. Metadata discovery is not a literature review and must be manually checked before citation.

Both integrations use request timeouts and graceful failure. No API key is stored in the browser, and no AI model is required for the local result.

## Reproducibility

`npm run demo` writes `demo-output.json`, which contains the input record, generated points, diagnostics, assumptions, and creation timestamp. Record the Git commit, Node version, input values, live-source URLs, and retrieval times in any research notebook. The output is not deterministic byte-for-byte because the timestamp is intentionally retained for provenance; the numeric model itself is deterministic for fixed inputs.

## Repository map

| Path | Purpose |
|---|---|
| `App.tsx` | Product shell, demo workflow, live enrichment, and error handling |
| `components/KineticsForm.tsx` | Guided input form and visible validation |
| `components/ResultsDisplay.tsx` | Evidence status, diagnostics, sources, table, and export |
| `services/kineticsModel.ts` | Deterministic bounded screening model |
| `services/validation.ts` | Input ranges and scope warnings |
| `services/pubchemService.ts` | Optional chemical metadata lookup |
| `services/literatureService.ts` | Optional Crossref metadata search |
| `services/measuredFit.ts` | CSV parsing and auditable measured-data fit |
| `components/MeasuredDataPanel.tsx` | Evidence gate for measured data and diagnostics |
| `tests/validation.test.ts` | Regression tests, model invariants, and fit checks |
| `scripts/run-demo.ts` | End-to-end local smoke test |

## Limitations and evidence requirements

The repository contains no experimental measurements, calibration files, replicate identifiers, polymer characterization, or validated parameter set. Therefore, the default output cannot be used as scientific evidence. To support a publishable analysis, add raw data and metadata, pre-register cleaning and exclusion rules, distinguish independent batches from technical replicates, propagate measurement uncertainty, compare residuals across mechanistic alternatives, report parameter confidence intervals, and evaluate predictions on held-out experiments.

Do not infer toxicity, environmental fate, regulatory compliance, synthesis safety, or treatment performance from this application. Those require separate authoritative sources, jurisdiction-specific review, and experimental evidence.

## Citation and use

When using the software, cite the repository commit and state that the local model is an exploratory deterministic screening model. Cite the original papers or databases used to establish any experimental parameters. Do not cite the app as evidence that a proposed chemistry works unless the output has been independently validated and the validation protocol is reported.

See [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md), [`LIMITATION_REGISTER.md`](LIMITATION_REGISTER.md), [`ROADMAP.md`](ROADMAP.md), and [`OPEN_ISSUES.md`](OPEN_ISSUES.md) for operational guidance, residual-risk controls, and future work.
