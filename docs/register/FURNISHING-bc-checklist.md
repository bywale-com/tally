# Business Client — Furnishing checklist (100)

**Stage:** Furnishing (non-invasive). **Surface:** Click-through only (`BusinessClientDesk`).  
**Rule:** Do not change Function flows. Densify Campaigns / Meetings / Escrow.

**Implementation:** `apps/tally/src/app/register/wireframes/loFi/bcDesk/` · wired by `BusinessClientDesk.tsx`

Source brainstorm preserved below. Status: **planted in CT** (2026-07-25).

---

---

### Campaigns strip — around the vessel row
1. Quiet “last touched” relative time on each vessel  
2. Tiny booked/N chip on the row (same number Escrow already believes)  
3. Operator name + avatar as a fact, not a story  
4. “Rules locked” lock glyph that opens Details (already there — make it feel permanent)  
5. Soft “awaiting launch” vs “running” vs “paused” as color-dot language, not essays  
6. Collapsed “money at a glance” under the name: Held $X · Released $Y  
7. Hover peek: next upcoming meeting time  
8. Hover peek: days until reclaim window  
9. Multi-vessel sort: Running first, then Held, then Stopped  
10. Pin one vessel as “primary” (local preference only)  
11. Archive / hide reclaimed vessels behind a quiet filter  
12. Empty-but-invited vs empty-never-invited copy variants (same Empty module)  
13. “Request next vessel” becomes a short form that *shows* in a “Requested” tray (still flash-adjacent, but *somewhere*)  
14. Vessel cover: company logo chip from Operator enrich (read-only)  
15. “Prepared by” one-liner from Operator (fixed string, not chat)  
16. Quiet share-read-only link for cofounder (viewer) — tray of who has access  
17. Keyboard: j/k move vessels, Enter opens Meetings for that vessel  

### Campaigns — More / depth doors (still not new flows)
18. Details sheet: printable one-pager layout (facts grid denser)  
19. Details: “What counts” checklist as toggles that are *display-only* (locked)  
20. Details: sample meeting definition with one example packet  
21. Firms sheet: search/filter within list  
22. Firms: competitor / customer / dream-list tags (read-only from Operator + your blocks)  
23. Firms: “blocked by you” vs “blocked by Operator” distinction  
24. Firms: export CSV of current firm list  
25. Talk tracks: copy-to-clipboard on each line  
26. Talk tracks: “last used” stamp (local)  
27. Alerts: channels (email / SMS / Slack webhook) as prefs — even if only one works in CT  
28. Alerts: quiet hours  
29. Alerts: digest vs instant for pending releases  
30. Stop sheet: consequence preview (Held freezes, Worker sees stop) as three fact cells  
31. Pause: “why paused” optional note that appears on Operator glance (read-only for them)  
32. History drawer on a vessel: invite → fund → launch → stop → reclaim timeline  

### Meetings strip — list density
33. Default sort: pending release first (money anxiety first)  
34. Row shows escrow fate chip: Pending / Released / Disputed / Upcoming / Cancelled  
35. Row shows $ at stake  
36. Row shows seniority match vs miss (tiny)  
37. Calendar week strip above the list (dots on days with meetings)  
38. “This week” / “Needs you” smart filters (composition of existing statuses)  
39. Bulk mark-reviewed for released (local checklist)  
40. Sticky count header: Pending N · Disputed M  
41. Empty state per filter with one quiet path (“Clear filter”)  
42. Meeting row favicon / company chip  
43. Relative “in 2h” vs absolute time toggle  
44. Drag to calendar .ics download per row  
45. Soft group headers: Today / Tomorrow / Earlier  

### Meeting sheet — packet inhabitation
46. Packet sections: Who · Company · Role · Pain · Length · Attendance  
47. “Why this counted” locked-rules checklist with green/grey marks  
48. Map pin / timezone for the meeting  
49. Recording stub: “No recording (by design)” as a fact, not a feature tease  
50. Forward packet: recent recipients chips  
51. Forward: “sent” toast + entry in a tiny Sent log on the sheet  
52. Dispute: invite-before-form (keep) + evidence file chip (even if fake upload)  
53. Dispute: timeline of status changes  
54. Accept release: confirmation with $ and meeting #  
55. Cancel booking: consequence line (“No release. Slot freed.”)  
56. Brand-flag path: lands on Firms with that firm pre-highlighted  
57. “Talk track used” optional one-liner (Worker-attributed, read-only)  
58. Print / PDF packet  
59. Deep link copy (“Open this meeting”)  
60. Side-by-side: locked rule vs what Worker logged  

### Escrow strip — money room furniture
61. Big Held / Released / Remaining meetings as a three-cell dashboard  
62. Statement as a real scrollable ledger (hold, releases, reclaim) — even if Download is still CT  
63. Ledger row click → same Meeting sheet  
64. Sparkline of Held over time (dumb, aesthetic)  
65. Custodian badge (Escrow.com stand-in) with “not ops spend” one line  
66. Reclaim: timer beside disabled button (you already named this rule)  
67. Reclaim: preview settlement window “1–3 days” as fact  
68. Currency + tax disclaimer footer (one line)  
69. “Prove it’s not ops”: show zero line-items for retainers/fees  
70. Low-motion banner: only when N days silent *and* Running — quiet, dismissible  
71. Request Operator: Dialog options stay; add a **Requests** tray that stores them  
72. Requests tray: status Noted / Seen / Closed (even if Operator side is stub)  
73. Split: money actions vs Operator actions (vertical stack, not one loud row)  
74. Export statement CSV  
75. Escrow FAQ sheet (3 questions max) behind quiet “How money works”  
76. Multi-vessel escrow rollup when >1 vessel (capital across)  

### Cross-nav / shell furniture (BC desk as a place)
77. Vessel context switcher in header when Meetings/Escrow are scoped to active vessel  
78. Breadcrumb: Campaigns / Northwind / Meetings  
79. Unread “needs you” badge on Meetings nav (pending count)  
80. Unread on Escrow only if reclaim unlocked or Operator replied  
81. Command palette: jump vessel / meeting / escrow  
82. Keyboard shortcuts cheat sheet  
83. Local “saved views” for Meetings filters  
84. Soft onboarding checklist once (dismissible): Fund · Meet · Reclaim awareness — not a tutorial product  
85. “You’re the payer” role chip under Tally mark (identity furniture)  
86. Theme already exists — add density toggle (comfortable / compact)  
87. Notification center drawer: meeting pending, reclaim available, Operator note  
88. Email digest preview (what Monday morning looks like)  
89. Mobile-width strip sketch: bottom nav Campaigns / Meetings / Escrow  
90. Empty desk after reclaim: “Vessel closed” memorial card (one, then archive)  

### Ambient “world is real” (no new critical path)
91. Sample data density: 8–12 meetings across statuses so filters *feel* used  
92. Two vessels always: one Running, one Invited (or Held) so home isn’t a single orphan  
93. Operator credibility strip: “3 prior vessels with this Operator” (seed)  
94. Worker attribution on packets: “Logged by Worker” — never a chat thread  
95. Silent running vs not-started distinction as a fact on Campaigns (even if Operator also wants this)  
96. “Brand exclusions honored” count: N firms blocked  
97. Trust furniture: last escrow release receipt ID  
98. Clock furniture: hold clock started date  
99. Congruence furniture: same Fact cell / More / Empty grammar as Guest — denser *content*, same modules  
100. “Desk is done for today” quiet end-state when Pending=0 and no reclaim — a lived-in close, not a dead empty  

---

**How to use this without breaking Function**

Prefer ideas that are: **facts, trays, peeks, density, history, prefs, exports, badges, sample richness**. Defer anything that invents a new outcome leaf (marketplace, Worker chat, client-created campaigns, activity vanity).

If you want a second pass next: take this list and tag each idea **strip / step / door / ambient**, then pick a 12-item “furnish BC v1” set that never adds a screen — only densifies Campaigns, Meetings, Escrow.