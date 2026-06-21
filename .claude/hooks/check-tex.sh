#!/usr/bin/env bash
# PostToolUse hook: lightweight LaTeX syntax check for edited thesis files.
#
# Reads the hook JSON on stdin, and if the edited file is a *.tex file under
# docs/thesis/, runs a dependency-free structural lint that catches the most
# common build-breakers:
#   - unbalanced { } braces
#   - mismatched / unclosed \begin{env} ... \end{env}
#   - odd number of unescaped $ (likely unbalanced math mode)
#
# Content inside verbatim-like environments (verbatim, lstlisting, minted,
# comment) is skipped so embedded code does not produce false positives.
#
# Findings are surfaced back to the model via additionalContext. The hook is
# advisory and never blocks an edit (always exits 0).
set -u

input=$(cat)
f=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')

[ -z "$f" ] && exit 0
case "$f" in
  */docs/thesis/*.tex) ;;
  *) exit 0 ;;
esac
[ -f "$f" ] || exit 0

issues=$(awk '
  BEGIN { braces=0; dollars=0; sp=0; vmode=0; venv="" }
  {
    # Strip comments and preserve escaped chars: walk the line, drop from an
    # unescaped % to end of line, keep "\x" pairs intact.
    line=$0; out=""; i=1; n=length(line)
    while (i<=n) {
      c=substr(line,i,1)
      if (c=="\\") { out=out substr(line,i,2); i+=2; continue }
      if (c=="%") break
      out=out c; i++
    }

    # Inside a verbatim-like environment: only look for its closing \end.
    if (vmode) {
      if (match(out, "\\\\end\\{" venv "\\}")) { vmode=0; if (sp>0 && stack[sp]==venv) sp-- }
      next
    }

    # Scan \begin{...} environments (detect entry into verbatim-like blocks).
    tmp=out
    while (match(tmp, /\\begin\{[A-Za-z*]+\}/)) {
      env=substr(tmp, RSTART+7, RLENGTH-8)
      stack[++sp]=env
      if (env=="verbatim"||env=="lstlisting"||env=="minted"||env=="Verbatim"||env=="comment") { vmode=1; venv=env }
      tmp=substr(tmp, RSTART+RLENGTH)
    }

    # Scan \end{...} environments and match against the stack.
    tmp=out
    while (match(tmp, /\\end\{[A-Za-z*]+\}/)) {
      env=substr(tmp, RSTART+5, RLENGTH-6)
      if (sp>0 && stack[sp]==env) { sp-- }
      else { print "Mismatched \\end{" env "} at line " NR }
      if (vmode && env==venv) vmode=0
      tmp=substr(tmp, RSTART+RLENGTH)
    }

    # If a verbatim block opened on this line (and did not close), skip the
    # brace/dollar tally for the remainder of this line.
    if (vmode) next

    # Tally braces and unescaped dollars.
    m=length(out)
    for (j=1;j<=m;j++) {
      ch=substr(out,j,1)
      if (ch=="\\") { j++; continue }
      if (ch=="{") braces++
      else if (ch=="}") braces--
      else if (ch=="$") dollars++
    }
  }
  END {
    if (braces>0) print "Unbalanced braces: " braces " unclosed { "
    else if (braces<0) print "Unbalanced braces: " (-braces) " extra } "
    if (dollars%2==1) print "Odd number of unescaped $ (math mode may be unbalanced)"
    while (sp>0) { print "Unclosed environment: \\begin{" stack[sp] "}"; sp-- }
  }
' "$f")

if [ -n "$issues" ]; then
  printf '%s' "$issues" | jq -Rs --arg file "$f" \
    '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:("LaTeX syntax check flagged " + $file + ":\n" + . + "\nFix these before compiling.")}}'
fi
exit 0
