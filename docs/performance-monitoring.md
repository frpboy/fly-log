# Performance monitoring

## Repeatable Lighthouse baseline

The `Lighthouse baseline` workflow audits the built production output on pull
requests to `development`, pushes to `development`, and manual dispatches.
It performs three runs and saves the reports as GitHub Actions artifacts; it
does not upload reports to temporary public storage. This makes it possible to
compare the same production build path without relying on one run from a hosted
preview.

Start with the median across the three runs for Performance, Accessibility, Best
Practices, SEO, and PWA. Inspect the underlying failing audits, LCP, CLS,
interaction latency, image transfer sizes, JavaScript bundle size, and layout
shift details before changing code. Do not attribute a score to a particular
pull request unless its before/after runs are comparable.

The Lighthouse numbers mentioned in the PR discussion (Performance 61,
Accessibility 86, Best Practices 100, SEO 92, PWA 90) are a useful investigation
lead, not a current reproducible baseline or proof of cause. Record the commit,
workflow run, URLs audited, run results, and whether mobile or desktop settings
were used when comparing reports.

## Real-user measurements

The app currently loads Google Analytics from `index.html`, but this repository
does not yet contain an explicit Core Web Vitals reporter. Lighthouse is
lab data, not a substitute for field measurements. Before adding a real-user
reporter, agree on the analytics property, consent/privacy expectations, metric
names, sampling policy, and retention. If enabled, collect only aggregate
performance metrics such as LCP, CLS, and INP; do not attach flight details,
airport codes, account identifiers, or other user-provided data to telemetry.

## Safe optimization workflow

1. Capture three Lighthouse runs before a change and keep the artifacts.
2. Identify the same repeatable failing audits across runs.
3. Fix one cause at a time and keep the change scoped to the finding.
4. Compare medians and inspect the exact audit traces after the change.
5. Add thresholds only after the repository has a stable baseline; avoid
   blocking PRs on noisy single-run scores.
