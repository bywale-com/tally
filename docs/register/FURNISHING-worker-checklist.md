# Worker — Furnishing checklist (100)

**Stage:** Furnishing (non-invasive). **Surface:** Click-through only (`WorkerPrototypeApp`).  
**Rule:** Do not change Function flows. Densify Available → Begin → Active → Log → Pipeline.

**Implementation:** `apps/tally/src/app/register/wireframes/loFi/workerDesk/` · wired by `WorkerPrototypeApp.tsx`

Source brainstorm preserved below. Status: **planted in CT** (2026-07-25).

---

### Available queue — around the vessel row
1. Quiet "launched" dot — never `funded` as Worker chrome  
2. Per-meeting $ chip on each row (escrow truth, not negotiation)  
3. Booked/N progress chip on row (same number Pipeline believes)  
4. Company logo mark from Operator enrich (read-only)  
5. Operator name + initials as fact  
6. "Prepared by" one-liner from Operator  
7. Hover peek: locked seniority + length rule  
8. Hover peek: meetings remaining on vessel  
9. Hover peek: client entity name (payer, not chat)  
10. Sort: most meetings remaining first, then newest launch  
11. Filter: All / Fresh / Almost full (local composition)  
12. Pin one vessel preference (local)  
13. Empty queue: honest "Nothing available" + when last pick was  
14. Empty queue variant when you hold a claim but pool is dry  
15. Keyboard j/k on queue rows, Enter picks up  
16. Row subtitle: company · sector tag (read-only)  
17. Quiet "claimed by other" rows hidden — never in Available  

### Available — More / depth doors (no new flows)
18. Details sheet: locked rules grid (display-only toggles)  
19. Details: sample packet example (what Client will see)  
20. Details: what counts checklist with green/grey marks  
21. Firms sheet: search/filter within target list  
22. Firms: competitor / customer / dream-list tags (read-only)  
23. Firms: blocked-by Operator vs blocked-by Client distinction  
24. Firms: export CSV of firm list  
25. Talk tracks: copy-to-clipboard on each line  
26. Talk tracks: "last used" stamp (local)  
27. History drawer: invite → fund → launch timeline (read-only)  
28. Alerts prefs: email digest vs instant for client stop (CT local)  
29. Alerts: quiet hours toggle (local)  
30. Peek tray: Operator credibility — prior vessels count  

### Claimed / Begin — pre-work inhabitation
31. Three-cell facts: Per meeting · Who counts · Target  
32. Hold context line: escrow custodian + "pay on release" fact  
33. Locked rules lock glyph opens Details  
34. Begin is lone loud action; Release is quiet peer  
35. Release consequence preview: "Returns to pool unclaimed"  
36. Time-since-pickup relative stamp (local)  
37. Operator note one-liner if present (read-only, not chat)  
38. Client honesty chip: silent / working / ok (read-only)  
39. Brand exclusions honored count on Begin panel  
40. "Your claim expires" timer stub (local CT fiction, dismissible)  
41. Sample firm queue preview: next 3 firms to touch  
42. Talk track quick-copy strip above Begin  

### Active manage — outreach room
43. Booked N of target progress bar (same grammar as Pipeline)  
44. Log a meeting is loud; Pipeline is quiet peer  
45. More menu: Simulate client stop (keep)  
46. More: Open firms list door  
47. More: Open talk tracks door  
48. More: Open details / rules door  
49. More: Export outreach notes CSV (local)  
50. Stopped state: honest copy + Release to pool path  
51. Firm progress strip: touched / queued / meeting counts  
52. Calendar week strip with dots on days you logged  
53. Upcoming booked meetings mini-list (read-only from pipeline)  
54. Last logged meeting peek with who + company  
55. Local "sessions today" counter (CT fiction)  
56. Keyboard L jumps to Log meeting  
57. Keyboard P jumps to Pipeline  
58. Density toggle comfortable / compact on Active  

### Log meeting — packet inhabitation
59. Who · Role · Stated pain fields (keep Function)  
60. Company + size attach-on-submit fact line (keep)  
61. Length + attendance fields as optional expand (local)  
62. Timezone + city peek fields (optional expand)  
63. "Why this counts" locked-rules checklist preview  
64. Packet preview pane: what Client receives (read-only)  
65. Duplicate-contact warning if firm already logged  
66. Talk track used optional one-liner (local)  
67. Submit lands on Pipeline (keep)  
68. Cancel quiet returns to Active  
69. Recent submissions tray (last 3, local)  
70. Copy packet as text before submit  

### Pipeline track — honest progress
71. Progress bar + N of target qualified (keep)  
72. Meeting list grouped: Pending release / Upcoming / Released / Disputed  
73. Row shows escrow fate chip from Worker lens  
74. Row shows $ at stake when pending  
75. Filter: All / Pending / Upcoming / Released  
76. Sticky count: Pending N · Upcoming M  
77. Empty per-filter with clear filter path  
78. Log another loud when not stopped; Active quiet peer  
79. Meeting row click opens packet peek sheet (read-only)  
80. Relative vs absolute time toggle on rows  
81. Soft group headers: This week / Later / Earlier  
82. Disputed row shows evidence one-liner (read-only)  
83. Released row shows receipt id stub  

### Cross-nav / shell furniture (Worker desk as a place)
84. Nav badge on Pipeline: booked count  
85. Nav badge on Active when vessel claimed  
86. Breadcrumb context: Available / {vessel} / Active  
87. Command palette: jump vessel / log / pipeline  
88. Keyboard shortcuts cheat sheet  
89. Notification drawer: client stop, release received, dispute  
90. Role chip: "You book meetings" under Tally mark  
91. Onboarding checklist once: Pick up · Begin · Log awareness  
92. Density toggle in header cluster  
93. EVAL strip hint shows current vessel name when claimed  
94. Sample data: 4+ pool vessels, 8–10 meetings across statuses  
95. Two pool vessels + one claimed path so home isn't orphan  
96. Worker attribution on packets: "Logged by you"  
97. No client chat thread anywhere — packet is the product  
98. No pay-outside-escrow — escrow facts only  
99. Congruence: same Fact / More / Empty grammar as Guest/BC  
100. "Desk is done for today" when target met and nothing pending log  

---

**How to use this without breaking Function**

Prefer ideas that are: **facts, trays, peeks, density, history, prefs, badges, sample richness**. Defer anything that invents a new outcome leaf (client inbox, Worker–Client chat, off-escrow pay, marketplace browsing).
