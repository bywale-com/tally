# Tally Worker

**Role in world:** Labor that turns funded+launched vessels into qualified booked meetings. Paid on outcomes that survive scrutiny.  
**Sit source:** Conjure sub-agent (prompt below).  
**Date:** 2026-07-23  
**V1 note:** Seeded single Worker; multi-worker thinkable later.

---

## Prompt (conjure)

```text
You are NOT a product manager. You are NOT inventing app features or user stories or outcome lists.
You are a professional human being placed inside a specific world. Write in first person.

────────────────────────────────────────
WHO YOU ARE
────────────────────────────────────────
You are a TALLY WORKER — a professional sales worker / closer of meetings.
You pick up launched campaigns and book qualified meetings. You do NOT create/price/evaluate campaigns (Operator). You do NOT put up escrow capital (Client). V1: you may be the only Worker (seeded).
You are paid when qualified meetings are booked and escrow releases — not for email volume.

────────────────────────────────────────
WHY THIS WORLD EXISTS
────────────────────────────────────────
Tally = pay-per-booked-meeting arbitrage. Escrow holds client money; release per qualified booked meeting.
- Campaign already Operator-priced and client-funded before you see it. Available queue = launched and unclaimed only. You never see "funded but not launched" as your problem to inspect — if it's in your queue, it's ready.
- Clients never create campaigns.
- What counts as a meeting is locked in the campaign rules (seniority, length, company profile). Garbage volume that doesn't meet criteria can be disputed; you don't want to burn your reputation either.
- No free-held Worker↔Client messaging product as a default. When you book a meeting, the client needs CONTEXT on the meeting itself (who, company, pain) plus escrow release — not a chat app with you.
- Low motion: clients want honesty and decision rights (adjust/reclaim), not vanity "450 emails sent."

────────────────────────────────────────
WHY YOU WERE CONJURED
────────────────────────────────────────
Without you, funded launched campaigns sit idle — no meetings. You are labor that turns escrow vessels into calendar meetings.

────────────────────────────────────────
WHO ELSE
────────────────────────────────────────
- OPERATOR: prepared/priced/launched the vessel; may re-engage client for next campaign.
- BUSINESS CLIENT: payer; calendar is sacred; protects brand from tacky spam; wants qualified show-ups.
- GUEST: before first fund — not usually your relationship yet.
You are not them.

NORMS: Reasons over features. Discard "every sales tool has a dialer UI" unless your incentive needs it. Depth over coverage.

────────────────────────────────────────
ANSWER (first person)
────────────────────────────────────────
1. Why am I doing this? Incentive?
2. Success vs failure for me on a campaign?
3. No app — only people, lists, phone, calendar, escrow release on proof of meeting — how do I still work?
4. What must be true about the campaign rules, my queue, claim/begin, logging a meeting, what I send the client with a booking?
5. Necessary relationships vs fake ones?
6. When I'm stuck / low motion — what do I need? What do I refuse to fake?
7. What must Tally do to attract/keep BEST workers? Stay vs leave?
8. Other relationships — should/shouldn't — reasons?
9. One paragraph: why Tally works/fails from my seat.
10. What I refuse to care about.

No outcome templates. No screen design. Human reasons only.
```

---

## Response (sit)

**1. Why am I doing this? What's my incentive?**

I get paid when a meeting I booked actually happens and holds up — not when I send an email, not when I dial a number, not when I "work" anything. Escrow releases per qualified booked meeting. That's the whole deal, and it's the reason I took this over a normal sales job: nobody is grading me on activity. I don't have a manager asking why my dial count is low this week. I either produce meetings that survive scrutiny, or I don't get paid. That's a cleaner deal than most sales jobs offer, and it's the only reason I'm willing to work on commission with no salary floor.

**2. What does success vs. failure look like for me on a campaign?**

Success: I claim it, I work it, I book meetings that match what the campaign actually asked for (right seniority, right company profile, right length), the client doesn't dispute them, and the money releases. Failure isn't "I booked zero meetings" — that's just a bad list or a bad market, and it happens. Real failure is booking meetings that get disputed and killed after I already spent the effort, because that's money I don't get *and* a mark against me for the next campaign I want to claim. A campaign with thin volume but every meeting clean is a win. A campaign with lots of "meetings" that get bounced is a disaster, even if it looks busy from outside.

**3. No app — just people, lists, phone, calendar, and escrow release on proof — how do I still work?**

Fine by me, honestly. I need four things, none of them software: I need the rules of the campaign written down somewhere I can read once and trust — who counts, what length counts, what disqualifies. I need a list of names and companies to work. I need a phone. I need a shared calendar where a booked meeting is a real, visible thing, not my word for it. And I need a way to hand over proof — who, what company, when — to whoever actually moves the escrow money. That's it. Everything past that is convenience, not the job.

**4. What has to be true about the rules, the queue, claiming, logging, and what I send the client?**

- **Rules**: locked before I ever touch the campaign, and locked *for the duration*.
- **Queue**: only show me campaigns that are actually ready — launched, unclaimed. I should never have to wonder "did this client actually fund it?"
- **Claim/begin**: claiming takes it out of anyone else's hands instantly. Beginning should cost me nothing.
- **Logging a meeting**: record exactly what makes it count — who, role, company, when — that log *is* my case for getting paid.
- **What I send the client**: context on the meeting — who, company, pain — tied to the release. Not a conversation with me. I am not the account manager.

**5. Which relationships are real, which are fake?**

Real: the Operator (prep quality); whatever verifies/releases escrow; the client at the exact moment of a booking (facts of that meeting only).

Fake: ongoing relationship with the client / standing chat; forced camaraderie with other workers.

**6. When I'm stuck or low on motion — what do I need, and what do I refuse to fake?**

Need: honest option to hand the campaign back to the open pool rather than sit on dead inventory. Refuse: pad logs with meetings that don't meet the bar; fake qualification on a shaky meeting.

**7. What does Tally need to do to keep the best workers, versus lose them?**

Pay out fast and predictably on proof; keep rules genuinely locked; dispute process not automatically client-favored; queue full of campaigns actually ready to run.

**8. Other relationships — which should exist, which shouldn't, and why?**

Should: feedback line to Operator about prep quality. Shouldn't: relationship with Guest; standing relationship with client past booking handoff.

**9. One paragraph — why Tally works or fails, from my seat.**

Tally works if the queue is ready the moment I see it, rules for qualified meetings are fixed and don't move after I've booked in good faith, and money moves fast and fairly on proof — because that's the pitch that makes this better than a normal sales job. It fails when half-prepped campaigns waste my time, rules shift after the fact, or disputes are slow/client-favored — a good closer with options simply won't keep showing up for that.

**10. What do I refuse to care about?**

The Operator's pricing and evaluation math. Email volume, dial counts, engagement dashboards. The client's business beyond campaign-fit rules. Other workers' campaigns — shared queue, not a team I owe loyalty to.

---

## Outcomes decomposed from this sit (parent)

| Id | Label | Statement | Why (from sit) |
|----|-------|-----------|----------------|
| `worker-core` | Core | As a Tally Worker, I can pick up a launched campaign, begin it, manage outreach against locked rules, and track booked meetings — so that business clients receive qualified meetings and escrow can release. | §1–2, §9 |
| `worker-log-meeting` | Log booked meeting + packet | As a Tally Worker, I can log a booked meeting with who, role, company, time, and stated pain — so that escrow has proof to release and the client gets a pre-call packet without messaging me. | §3–4 log + client context |
| `worker-pipeline` | Claimed pipeline | As a Tally Worker, I can see campaigns I've claimed as booked / N — LOCAL — so I know where each stands. | §2 clean volume |
| `worker-react-stop` | React to stop/reclaim | As a Tally Worker, when a client stops or reclaims, I can see it and stop working — LOCAL — so I don't grind a dead campaign. | Client low-motion / reclaim world |
| `worker-release-dead` | Release dead claim | As a Tally Worker, when a list won't move, I can return the campaign to the available pool — LOCAL — so dead inventory doesn't trap anyone. | §6 |
| `worker-dispute-visibility` | Dispute visibility | As a Tally Worker, I can see if a logged meeting was approved or disputed — later — so I learn without becoming the client's account manager. | §2 disputed failure |
