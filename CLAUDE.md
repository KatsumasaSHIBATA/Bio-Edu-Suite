# Bio-Edu Suite - Claude Code Execution Rules

## 1. Project Overview & Architecture
Bio-Edu Suite is an educational bioinformatics web application suite for Japanese high schools.
- Single Source of Truth: `docs/guideline.md`
- Master Workflow: `docs/workflow.md`

## 2. Absolute Guardrails (Zero-Modification)
- **Zero-Modification**: NEVER refactor, modernize, or clean up existing HTML structure, CSS layout, or D3.js visualization logic unless explicitly commanded. Apply strict, minimal diff patches only.
- **No Educational Mocking**: Never replace biological/mathematical models with hardcoded fake data or simplified mock formulas.

## 3. Strict Biological Terminology (SCJ 2025 Standard)
Strictly enforce the Science Council of Japan (2025) high school biology terminology:
- Use **顕性 (dominant)** and **潜性 (recessive)**. NEVER use "優性" or "劣性".
- Distinguish **突然変異 (mutation: process)** and **変異 (variation: diversity)**.
- Specify targets: Use **DNA**, **mRNA**, **タンパク質** (avoid ambiguous "核酸" where specific). Use **塩基配列** and **アミノ酸配列** (never "1D配列" or "Sequence" in UI).
- Use Hiragana for non-Joyo kanji: **血しょう**, **かく乱**, **胚のう**.
- Use **アーキア** (never "古細菌").

## 4. Token & Context Protection Rules
- **No Full File Reads**: For files exceeding 100 lines, NEVER read the full file. Always inspect specific line offsets/ranges or use git diff/AST outlines.
- **Batch Processing Standard**: NEVER edit all 14 apps directly via LLM. Multi-file/cross-app updates MUST be performed by writing an idempotent Python script under `scripts/` and executing it in the terminal (`python3 scripts/XXXX.py`).
- **One-Shot Task Focus**: Focus strictly on the single assigned file/scope. Do not touch adjacent files.