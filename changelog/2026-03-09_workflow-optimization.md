# 2026-03-09 Workflow optimization

## Summary

Added a standardized core GitHub Actions CI workflow for this repository.

## Changes

- Added `.github/workflows/ci.yml`
- Standardized triggers for `push`, `pull_request`, and `workflow_dispatch`
- Added Node.js validation job covering `lint`, `typecheck`, `test`, and `build`
- Preserved the existing Pages deployment workflow
