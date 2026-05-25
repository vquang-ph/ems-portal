#!/usr/bin/env bash
# PreToolUse hook: force parent agents to dispatch `deep-explore` before
# Read/Grep/Glob. Only `deep-explore` itself bypasses the check.
#
# Input (stdin): JSON payload from Claude Code with fields:
#   - tool_name
#   - tool_input  (includes file_path for Read, pattern for Grep/Glob)
#   - transcript_path
#   - agent (subagent type; empty/"main" for root agent)
#   - user_message (latest user prompt)
#
# Exit 0 = allow. Exit 2 = block with stderr message shown to agent.

set -euo pipefail

payload="$(cat)"

tool_name=$(printf '%s' "$payload" | jq -r '.tool_name // ""')
agent_type=$(printf '%s' "$payload" | jq -r '.agent // .subagent_type // ""')
transcript_path=$(printf '%s' "$payload" | jq -r '.transcript_path // ""')
user_message=$(printf '%s' "$payload" | jq -r '.user_message // .prompt // ""')
target_path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only gate these tools. ctx_* intentionally NOT matched (deep-explore uses them;
# matching would cause recursion / self-block).
case "$tool_name" in
  Read|Grep|Glob) ;;
  *) exit 0 ;;
esac

# deep-explore itself always bypasses.
if [[ "$agent_type" == "deep-explore" ]]; then
  exit 0
fi

# Edit-path exemption: user message references the exact target path.
if [[ -n "$target_path" && -n "$user_message" ]]; then
  if printf '%s' "$user_message" | grep -Fq "$target_path"; then
    exit 0
  fi
fi

# Check transcript for a recent deep-explore dispatch within current turn.
if [[ -n "$transcript_path" && -f "$transcript_path" ]]; then
  # Look at last ~200 lines; match any Agent tool call with subagent_type=deep-explore
  if tail -n 200 "$transcript_path" 2>/dev/null | grep -q '"subagent_type"[[:space:]]*:[[:space:]]*"deep-explore"'; then
    exit 0
  fi
fi

cat >&2 <<'MSG'
Blocked: dispatch `deep-explore` agent first (see CLAUDE.md Exploration Protocol).

Use:
  Agent(subagent_type="deep-explore", description="...", prompt="...")

Only `deep-explore` may perform raw Read/Grep/Glob. Parent agents act on its summary.
Exception: if user message contains the exact target file path, direct Read is allowed.
MSG
exit 2
