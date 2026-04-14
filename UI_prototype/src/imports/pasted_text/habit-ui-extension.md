Design a high-fidelity mobile UI extension for an existing habit tracker app.

Important: continue the SAME visual language, component style, spacing, border radius, typography, icon style, button style, and color palette used in the existing app screens. The new screens must feel like part of the same product, not a different app.

The app is a calm, modern, supportive habit-building product inspired by behavioral design. The UI should feel encouraging, light, and realistic, not childish, not overly gamified, and not overly clinical.

Do not create clutter. Use progressive disclosure. Keep analytics readable and emotionally non-judgmental.

Create the following mobile screens and flows:

---

## 1. Habit Detail / Progress Overview Screen

This is the main screen for one habit.

Show:

- habit name
- small habit chunk / smallest version of the habit
- today’s status card
- next reminder context if relevant
- schedule summary
- cue summary
- completion progress summary

Include visual cards for:

- current streak
- strength score
- reminder independence
- recent completion rate
- current reward / XP progress

Include a compact chart or visual trend area for:

- completion history
- streak trend
- strength score over time

Include recent event feed snippets:

- streak increased
- streak broken
- freeze used
- reward earned
- recommendation generated

The layout should feel elegant and easy to understand, not data-heavy.

---

## 2. Completion Logging Bottom Sheet / Modal

Design a bottom sheet or modal that appears when the user logs a habit attempt.

The sheet should support habit completion status:

- Done
- Partial
- Not done

Fields to include:

- status selector
- actual value input
- target achieved indicator
- trigger source display or selector
- completed time
- logged time

If the habit has routine steps, show a compact expandable section:

- list of routine steps
- each step can be marked separately
- show step states clearly
- make this interaction lightweight and fast

The UI should make logging feel easy and low-friction.

---

## 3. Routine Steps Progress UI

Design a component for habits that are broken into small routine steps.

Requirements:

- one habit can have multiple routine steps
- each step has its own completion state
- steps should be visually small, clear, and satisfying to complete
- use check states, progress indicators, or segmented cards
- clearly communicate that the full habit can be partially completed through steps

Examples:

- Drink water
- Put on shoes
- Walk outside
- Walk 5 minutes

This should feel motivating and manageable.

---

## 4. Difficulty Feedback UI

After a completion or failed attempt, the app can ask for difficulty feedback.

Design a lightweight feedback card, modal, or inline component.

Include:

- question like “How difficult did this feel?”
- quick rating options
- optional short note
- supportive microcopy

Visual style:

- fast to answer
- non-judgmental
- emotionally safe
- soft icons or chips

The difficulty feedback should clearly feel useful for personal adaptation, not like a burden.

---

## 5. Reflection / Subjective Benefit UI

After completion, the app can ask for a short positive reflection.

Design a reflection card or bottom sheet with:

- short check-ins for energy, focus, mood, satisfaction
- optional text response
- warm, encouraging tone

This should feel like a quick, rewarding moment, not a survey.

Examples:

- Energy: low to high
- Focus: low to high
- Mood: low to high
- Satisfaction: low to high
- Optional text: “How did this habit help you today?”

Keep it visually calm and pleasant.

---

## 6. Reward / Reinforcement UI

Design positive reinforcement moments after completion.

Reward event types:

- XP gained
- badge unlocked
- celebration milestone
- streak milestone

Create:

- a subtle celebration card
- an XP gain animation moment
- badge unlock component
- milestone achievement banner

Important:

- keep reward styling elegant and supportive
- avoid childish game effects
- use warm accent color sparingly
- celebration should feel satisfying but not overwhelming

The reward UI should reinforce progress immediately after completion.

---

## 7. Recommendation / Adaptation UI

The system can generate smart recommendations when signals show the habit is too difficult or poorly timed.

Signals may include:

- high difficulty
- low completion
- many wrong-time feedback events
- unstable context

Design a recommendation card and detail screen.

Show:

- proposed change
- reason for the recommendation
- accept / dismiss actions
- accepted state if user agrees

Example recommendations:

- simplify the habit
- reduce the chunk size
- move the reminder to a better time window
- change the cue context
- adjust preceding routine

Style requirements:

- recommendations should feel helpful and intelligent
- never make the user feel guilty
- use explanatory but concise text
- visually distinguish “system suggestion” from “user habit data”

---

## 8. Streak and Event History Screen

Design a screen showing schedule-aware streak and important habit events.

Include:

- current streak
- longest streak
- streak changes
- freeze / recovery events
- streak break events
- daily / weekly event timeline

Represent events as a clean event feed or timeline:

- streak increased
- streak broken
- freeze used
- recovery used
- reward event
- recommendation accepted

This screen should feel informative and calm, not stressful.

---

## 9. Strength Score and Insight Screen

Design a screen for habit strength score.

The score is a composite of:

- consistency
- reminder independence
- context stability
- optional self-report

Requirements:

- show a clear overall score
- break down subcomponents visually
- use understandable language
- include trend over time
- provide short insight text

Examples:

- “Your habit is becoming more stable.”
- “You rely less on reminders this week.”
- “This habit is strong in the morning context.”

The visualization should be simple, elegant, and friendly.

---

## 10. Analytics Dashboard Screen

Design a dashboard where users can understand their habit progress.

Show:

- completion history
- streak
- rewards
- strength score
- reminder dependence
- completion distribution
- trend cards
- recent wins

The dashboard should not feel like a business analytics tool.
It should feel personal, supportive, and easy to interpret.

Use:

- clean charts
- summary cards
- progress rings or bars
- clear metric labeling
- calm empty states

Avoid:

- dense tables
- overly technical charts
- excessive colors
- too many numbers at once

---

## 11. Share Achievement UI

Design a shareable achievement flow.

Shareable content types:

- XP milestone
- badge unlock
- streak record
- progress card

Create:

- a share preview card
- elegant social-share-ready achievement card
- visually branded but minimal layout

Requirements:

- keep it tasteful and modern
- make it visually attractive enough to share
- include habit name, milestone, and progress highlights
- use the app brand style consistently

This should feel proud and polished, not flashy.

---

## Interaction Principles

Across all screens:

- keep emotional friction low
- make completion logging fast
- make analytics understandable
- use supportive copywriting
- avoid punishment-focused UI
- avoid red-heavy failure states
- partial completion should still feel meaningful
- recommendations should feel collaborative
- rewards should feel warm and earned

---

## UX Strategy

Structure the experience with progressive disclosure:

- main habit detail screen shows summary
- details expand only when needed
- logging is fast and lightweight
- analytics are digestible
- reflection and difficulty inputs are optional and short

Use consistent reusable components:

- status chips
- metric cards
- chart cards
- event timeline items
- reward banners
- recommendation cards
- bottom sheets
- modal confirmations
- share cards

---

## Output Request

Generate a cohesive set of mobile app screens in one consistent design system for:

- Habit Detail / Progress Overview
- Completion Logging
- Routine Steps
- Difficulty Feedback
- Reflection
- Reward Celebration
- Recommendation Card / Detail
- Streak & Event History
- Strength Score
- Analytics Dashboard
- Share Achievement

Make the result feel polished, emotionally intelligent, practical, and ready for a real habit tracking app.