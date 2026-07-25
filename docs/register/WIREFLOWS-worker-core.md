# Worker Core — lo-fi screen wireframes

**How source:** `worker-core-outcome`  
**Sit/outcomes:** [`OUTCOMES-FROM-SITS.md`](./OUTCOMES-FROM-SITS.md)  
**Statement:** Pick up launched campaign; book against locked rules; log meeting packet for escrow + client — so BC gets qualified meetings and release can fire.  
**Style:** Gray boxes. Separate Worker shell.

| Register tab | Job |
|--------------|-----|
| **Strips** | `worker-run` — Available → Claim/Begin → Log meeting → Booked/N |
| **Click-through** | `WorkerPrototypeApp` — `launched ∧ unclaimed` only; no `funded` chrome |

**Choreography:** Available (rules travel with vessel) → Claim/Begin/Release-to-pool → Manage → Log who/role/pain → Pipeline booked/N → Client stop signal.

**Must show:** locked rules, meeting log as pay case, packet not chat, booked/N.  
**Must not:** funded badge, activity vanity, client inbox, create/evaluate/enrich.

**QA:** If it’s in Available, fund+launch already true.
