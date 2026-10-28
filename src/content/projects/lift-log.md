---
title: Lift Log
summary: Workout tracker for logging sets and reps, reviewing history, and tracking personal records.
tier: secondary
order: 14
tags: [React, TypeScript, Express, MongoDB]
status: Course project
---

## Overview

Lift Log lets lifters log their sets and reps, look back through their workout history, and track personal records. It was built for our software engineering course with React, TypeScript, Express, and MongoDB.

## My Role

I built the login and authentication. Passwords are hashed with bcrypt before they're stored, so the database never holds a real password. Logging in returns a JWT that expires after a set time, so a stolen token stops working on its own.
