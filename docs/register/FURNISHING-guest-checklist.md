# Guest / Non-business Client — Furnishing checklist (100)

**Stage:** Furnishing (non-invasive). **Surface:** Click-through only (`GuestVessel`).  
**Rule:** Do not change Function flows. Accept invite → Review terms → Fund N → become Business Client. No create-campaign for guests.

**Implementation:** `apps/tally/src/app/register/wireframes/loFi/guestDesk/` · wired by `GuestVessel.tsx`

Source brainstorm preserved below. Status: **planted in CT** (2026-07-25).

---

### Invite / Campaigns inspect — vessel row furniture
1. "You're invited" role chip under Tally mark (not payer yet)  
2. Invite expiry date as a fact, not a countdown essay  
3. Operator name + initials avatar chip  
4. "Rules locked" lock glyph that opens Terms  
5. Invited state dot (muted) — distinct from funded Held  
6. Money at a glance under name: Hold $X · $Y per meeting · N-day reclaim  
7. Hover peek: days until invite expires  
8. "Prepared by Operator" one-liner (read-only, not chat)  
9. Company logo chip from Operator enrich (read-only)  
10. Quiet "Operator touched" relative time  
11. Save-for-later lands in a **Saved** tray (local)  
12. Share viewer list tray (who has access / pending)  
13. Operator credibility: N prior vessels with this Operator  
14. Brand exclusions honored count  
15. What-counts checklist as display-only locked toggles  
16. Sample meeting packet in Inspect → Samples tab  
17. Firm list with competitor / customer tags  
18. Block firm + request must-have logo  
19. Firms search within list  
20. Export firms CSV  

### Terms / details doors (still not new flows)
21. Terms sheet: denser facts grid above prose  
22. Terms: custodian badge (Escrow stand-in)  
23. Terms: compared-to-agency retainer one line  
24. Terms: no Worker chat as a fact  
25. Why this price: ACV band + meeting target grid  
26. Why this price: Operator attribution line  
27. Details: one example meeting definition  
28. Details: reclaim window preview (N days)  
29. History drawer: invite-only timeline (pre-fund)  
30. FAQ sheet: "How money works" (3 questions max)  
31. Export terms for lawyer (More + Fund)  
32. Terms frozen until expiry caption  
33. Share with cofounder — viewer on terms only  
34. Request Operator dialog + **Requests** tray (Noted / Seen / Closed)  
35. Decline dialog with lapsed memorial path  

### Fund escrow — payer threshold furniture
36. Meeting count picker 1–N with live hold recalc  
37. Payment method cycle (checking / wire / card)  
38. Hold total as big number  
39. Per-meeting + custodian fact cells  
40. Fund preview: what unlocks (hold placed, launch next)  
41. Calendar email pref on converted beat (carried from fund context)  
42. Export for lawyer on Fund More  
43. Full terms door from Fund  
44. Fund consequence preview (3 fact cells)  
45. Remaining meetings count after selection  
46. Tax / currency disclaimer footer (one line)  
47. "Not ops spend" zero line-items stub  
48. Payment confirmation flash (CT)  
49. Back to invite without losing picker state  
50. `fundN` typed as `number` (fix literal-4 TS)  

### Converted handoff — receipt without full BC desk
51. Business Client receipt panel with hold total  
52. Operator name fact  
53. Next: Launch fact (Worker runs outreach)  
54. Calendar input pref  
55. **My campaigns** → `onOpenDesk` when present  
56. Replay invite quiet path  
57. Escrow tab shows Held / Released after convert  
58. Hold clock started date (ambient)  
59. Launch checklist (dismissible): Fund ✓ · Calendar · Launch  
60. Last release receipt ID placeholder (sample in inspect)  

### Empty Meetings / Escrow pre-fund honesty
61. Meetings Empty: bookings after fund + launch  
62. Meetings Empty: muted sample packet ghost (not clickable path)  
63. Escrow Empty: fund invite to place hold  
64. Escrow pre-fund caption: proposed hold $X  
65. Escrow empty: custodian explainer one line  
66. No nav badge on Meetings pre-fund  
67. Escrow nav quiet hint when no hold  
68. Same Empty module grammar as BC  
69. Meetings "Needs you" filter stub disabled until funded  
70. Escrow FAQ link in empty state  

### Shell identity — Guest desk as a place
71. Guest role chip: "You're invited" / post-fund "Funded · not launched"  
72. Breadcrumb: Campaigns / campaign name / stage  
73. EVAL strip: Invite · Fund · Receipt (CT only)  
74. Command palette: jump Invite / Fund / Meetings / Escrow  
75. Keyboard shortcuts cheat sheet  
76. Notification center: expiry soon, Operator note, saved invite  
77. Digest preview (Monday inbox before fund)  
78. Mobile bottom nav Campaigns / Meetings / Escrow  
79. Density toggle (comfortable / compact)  
80. Onboarding checklist: Review terms · Fund · Calendar  
81. Lapsed invite memorial + reset  
82. Flash note toast for Operator requests  
83. Congruence: Fact / More / Empty same as BC — sparser content  
84. Trust: invite reference ID  
85. Client entity name in campaign header  

### Ambient "world is real" (no new critical path)
86. Operator prior vessels strip  
87. Invite sent date on history  
88. ICP seniority + length locked on row  
89. Hold days reclaim rule visible on invite  
90. No create-campaign control (honest absence)  
91. Worker attribution read-only ("runs outreach after launch")  
92. Sample release receipt in inspect Samples  
93. Requests tray stores challenge price / ICP / swap  
94. Saved viewers: cofounder pending chip  
95. Firm count on inspect header  
96. Timezone fact for proposed meetings  
97. Invite ID / reference number in ambient strip  
98. "Vessel before payer" copy discipline throughout  
99. Post-fund quiet banner: Funded. Awaiting launch.  
100. Same Fact cell / More / Empty grammar as BC — guest-appropriate density  

---

**How to use this without breaking Function**

Prefer ideas that are: **facts, trays, peeks, density, history, prefs, exports, badges, sample richness**. Defer anything that invents a new outcome leaf (marketplace, Worker chat, client-created campaigns, activity vanity).

**Coverage v1 (planted):** items marked implemented in `guestDesk/` — shell chip + trays, densified invite row, fund picker fix, doors (terms/details/inspect/share/history/faq), requests tray, empty Meetings/Escrow honesty, converted handoff, ambient trust strip, command palette + shortcuts + digest + onboarding.
