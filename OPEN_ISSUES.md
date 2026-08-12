# Open Issues

The repository is now a polished, transparent screening application, but it is not yet a publication-grade kinetic-analysis system. The linked project contains no raw experimental measurements, calibration files, replicate identifiers, polymer characterization, validated rate constants, or reference benchmark.

| Priority | Issue | Consequence | Required next step |
|---|---|---|---|
| Critical | No experimental calibration dataset | Numerical curves cannot be called validated predictions or scientific evidence | Add raw time-resolved conversion data, uncertainty, independent batches, and analytical metadata |
| Critical | Simplified local model | Oxygen inhibition, diffusion limitation, heat transfer, solvent quality, termination modes, and side reactions are omitted | Select and validate mechanistic models against appropriate reference systems |
| Critical | Molecular-weight proxy is not a polymer-property model | Mn, Mw, and Đ are not reliable for a specific chemistry | Add SEC/GPC or equivalent characterization data and a calibrated polymerization model |
| Important | Reactivity ratios are user inputs without identity verification | Values may be mismatched, out of context, or not applicable at the selected temperature/solvent | Link ratios to primary literature and record temperature, solvent, composition, and uncertainty |
| Important | Live chemical lookup is name-based | Salts, isomers, mixtures, trade names, and repeat units may be ambiguous | Add structure-based selection and cheminformatics identity checks |
| Important | Crossref search is metadata discovery only | Returned works are not automatically relevant, accessible, or methodologically adequate | Add a human-reviewed evidence table with search protocol and inclusion rules |
| Important | No safety or regulatory assessment | The app cannot authorize synthesis or environmental use | Keep these decisions outside the tool or add authoritative, jurisdiction-specific modules |
| Minor | Browser demo requires network for enrichment | Metadata may be absent offline | Continue using the local model and visibly record lookup failure status |

Until the critical issues are addressed, do not present the output as an experimental result, validated forecast, toxicity conclusion, regulatory determination, or synthesis instruction.
