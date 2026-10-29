---
title: Lift Log
summary: Workout tracker for logging sets and reps, reviewing history, and tracking personal records.
tier: secondary
order: 14
tags: [React, TypeScript, Express, MongoDB]
status: Course project
---

Lift Log is a workout tracker where you log your sets and reps, look back through your history, and track personal records. We built it as a team of seven for our software engineering course, working in one- to two-week sprints, and it got the top score in the class.

I built the login and authentication. Passwords get hashed with bcrypt before they're stored, so the database never holds a real password. Logging in sets a JWT in a cookie that expires after a set time, so a stolen token stops working on its own. Route-guard middleware keeps logged-out users away from private pages, and an account locks after 5 failed login attempts. I also wrote the team's user acceptance tests.
