# JEE NEET Alarm

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- Alarm management: set multiple alarms with time and subject (JEE/NEET/Mixed)
- Alarm trigger: when alarm fires, display a random MCQ question from the selected subject
- Question dismiss flow: user must select the correct answer to stop the alarm; wrong answers keep the alarm ringing
- Question bank: curated JEE (Physics, Chemistry, Math) and NEET (Biology, Physics, Chemistry) MCQ questions
- Alarm ringing state: visual + audio (oscillating sound via Web Audio API) alarm screen with pulsing UI
- Stats page: track how many alarms dismissed, average attempts per alarm

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store alarms (time, label, subject), question bank (question text, options, correct index, subject, topic), alarm dismiss history
2. Backend APIs: CRUD alarms, get random question by subject, record dismiss attempt
3. Frontend: 
   - Home screen: clock display + list of upcoming alarms
   - Add/Edit alarm modal: time picker, label, subject selector
   - Alarm ringing screen: full-screen overlay with pulsing animation, MCQ question, answer options
   - Stats screen: simple stats
4. Web Audio API for alarm sound (no external audio files needed)
5. Browser-based alarm checking via setInterval polling against current time
