# Agent notify channel (scanner SMTP)

**Not** full inbox watch. Agents must not read all of `BATCH_NOTIFY_EMAIL` traffic.

## Outbound (agent → you)

Same path as batch jobs: `scanner/tally_scanner/batch_notify.py` + `scanner/.env` (`BATCH_NOTIFY_EMAIL`, `SMTP_*`).

Subject prefix (required):

```text
[Tally Agent] <short topic>
```

## Inbound (you → agent)

**V1 (now):** Confirm in the Cursor chat (“received”, “go”, revision notes). No IMAP.

**V2 (optional later):** Dedicated alias e.g. `tally-agent+ops@…` **or** IMAP poll that only matches:

- `To:` that alias, and/or  
- `Subject:` starts with `[Tally Agent]`  

Never open the personal inbox without that filter.

## Closure emails

Long Register ops should send:

1. **Gate** — “confirm to begin” (wait for chat ack)  
2. **Done** — summary + files touched  

Use: `python -c` with `send_email(...)` from `scanner/` cwd, or a thin `scripts/agent_gate_email.py` if added.
