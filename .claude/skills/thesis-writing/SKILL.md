---
name: thesis-writing
description: Writing style + conventions for the EMS Portal pre-thesis/thesis report and similar academic LaTeX reports. Use when drafting or editing prose in docs/thesis/ (or any academic report for this project). Enforces plain concise academic English, a hard no-em-dash rule, honest current-state reporting (built vs planned vs designed), explicit and concrete claims over vague ones, and a LaTeX compile-verify workflow.
---

# Thesis Writing Style

This skill captures the writing style and conventions used for the EMS Portal
pre-thesis report under `docs/thesis/`. Apply it whenever writing or editing
academic report prose for this project.

This style governs the **document prose**, not chat responses. (Chat style is a
separate concern, e.g. the `caveman` skill.)

## Voice and tone

- **Plain, concise, academic English.** Short declarative sentences. Prefer the
  simple word (use "big" not "extensive", "build" not "implement a solution
  for"). Lead with a verb where natural.
- **Redundant wording is fine** when it adds clarity. Clarity beats elegance.
  Do not chase variety at the cost of plainness.
- **Third person, no first person.** Never "I", never "to practice / to exercise
  myself". Convert personal motivation into an academic justification (e.g. "the
  network-engineering focus makes the auth layer an object of study").
- **Lead with what matters.** Put the load-bearing point first, then support it.

## Hard rule: NO em-dash

- **Never use `---` (em-dash) or `–` (en-dash) in rendered prose.** Replace with a
  comma, colon, parentheses, or restructure the sentence.
- **Number ranges**: write "1 to 4", not "1–4" or "1--4".
- Hyphens in compound words are fine (`client-server`, `pre-thesis`,
  `embedded-firmware`).
- The repo's Prettier/linter **reintroduces unicode em-dashes (`—`) on save**, so
  re-sweep after edits. Detection (Bash, not the Grep tool):
  ```bash
  cd docs/thesis
  grep -rn -- "—" chapters/ main.tex | grep -v ':1:%%'   # em-dash in prose (skips %% comment headers)
  grep -rn -- "–" chapters/ main.tex                      # en-dash
  ```
  `%% Chapter X —` comment headers on line 1 are not rendered; leave them.

## Honesty and accuracy (most important)

- **Report the current state truthfully.** Always distinguish **built** vs
  **planned** vs **designed/specified**. Never describe an unbuilt feature as if
  it exists. This is a "report current state" document.
- **Do not over-claim.** Before stating the system "solves" a problem, check it
  actually does. Example from this project: the matching algorithm solves
  *configurability* and *automatic multi-criteria ranking*, but does **not** solve
  *skill vetting* or *rating inflation* (it inherits unverified inputs). Trust gaps
  are *mitigated structurally* (catalogue + proficiency levels, engagement-gated
  ratings, lifecycle), not solved by the math. Say so.
- **Scope honestly.** State what is out of scope (e.g. "fully verifying provider
  credentials is beyond the scope of this work").
- **Do not import unsourced or shaky numbers.** Marketing/market-research figures
  with no citation, or internally inconsistent ones, stay out of the thesis. Use
  the qualitative argument instead. Only cite real, verifiable references; never
  fabricate a citation. If unsure a source exists, flag it for the user.
- **Hedge third-party claims**: competitor/platform claims get "based on publicly
  available descriptions" or similar.

## Be explicit and concrete

- **Name things.** Prefer "Upwork, Toptal, Engre, Tasker" over "mainstream
  platforms". Prefer concrete examples ("CAD/MEP drafting, embedded-firmware
  development, structural analysis") over "engineering work".
- **Make claims checkable.** When asserting "no existing tool does X", back it with
  a comparison table (platform × capability) rather than a bare assertion.
- **Cross-reference** related sections/figures/equations with `\label`/`\ref` so
  claims are traceable. Every `\ref` must resolve (no "undefined reference").

## LaTeX conventions (this template)

- Chapters live in `docs/thesis/chapters/*.tex`, wired from `main.tex`. Do not
  hand-edit generated artifacts.
- Diagrams are **TikZ in-template** (not external PNGs). TikZ libraries already
  loaded in `main.tex`. For multi-line nodes, the node style needs `align=center`.
- Keep `main.tex` free of leftover `%% TODO` scaffolding comments in a submission
  draft.
- Credentials/URLs printed in the PDF are **public and permanent**. Print only
  low-privilege seeded demo accounts (Client/Provider), never admin or anything
  with destructive power.

## Verify: always compile before declaring done

The local TeX install lacks Vietnamese support (`babel-vietnamese` and
`t5enc.def`), so verify against an isolated scratchpad copy that swaps the
`fontenc` encoding (T5 to T1) and the `babel` option, and ASCII-izes the
Vietnamese names (the document itself is left unchanged). This checks **structure
only**; the real T5 + Vietnamese glyph rendering must be confirmed on a machine
that has `babel-vietnamese` installed.

```bash
SRC="docs/thesis"   # use the absolute path in practice
WORK="$SCRATCHPAD/thesisverify"
rm -rf "$WORK"; mkdir -p "$WORK"; cp -R "$SRC"/. "$WORK"/; cd "$WORK"
perl -0pi -e 's/\\usepackage\[T5\]\{fontenc\}/\\usepackage[T1]{fontenc}/' main.tex
perl -0pi -e 's/\\usepackage\[main=english,vietnamese\]\{babel\}/\\usepackage[english]{babel}/' main.tex
perl -0pi -e 's/Phạm Vũ Quang/Pham Vu Quang/g; s/Đinh Đức\s*\n?Anh Vũ/Dinh Duc Anh Vu/g; s/Võ Minh Thạnh/Vo Minh Thanh/g' main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex >/dev/null 2>&1; bibtex main >/dev/null 2>&1
pdflatex -interaction=nonstopmode -halt-on-error main.tex >/dev/null 2>&1
pdflatex -interaction=nonstopmode -halt-on-error main.tex >log.txt 2>&1
echo "exit=$?"; grep -E "Output written|There were undefined" log.txt
```

Pass = `exit=0`, "Output written on main.pdf", and **no** "There were undefined
references". After verifying, re-run the em-dash sweep above (linter may have
reintroduced them).

## Vietnamese glyph rendering

The preamble must load `\usepackage[T5]{fontenc}` and `\usepackage{lmodern}`
**before** `babel`. T5 is the Vietnamese font encoding; without it the
document-default OT1 encoding silently drops composed glyphs (e.g. `ứ` in `Đức`),
especially in English-context text such as the Acknowledgments. Keep these lines.

## Workflow checklist for an edit

1. Read the current file (linter reflows often; match exact text).
2. Make the prose change in this style (plain, honest, explicit, no em-dash).
3. Sweep for `—` / `–` introduced anywhere in the file.
4. Compile the scratchpad copy; confirm `exit=0` and no undefined refs.
5. Report what changed and any honesty/scope caveats the user should know.
