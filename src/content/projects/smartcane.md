---
title: NavigAid - AI Smart Cane
summary: Smart cane that steers blind users away from obstacles using computer vision and onboard sensors. 2nd place, BeaverHacks 2026 hardware track.
tier: featured
order: 2
tags: [C++, Arduino, Raspberry Pi, Python, YOLOv8, MiDaS]
# scope: 4x4
status: Prototyped
repo: https://github.com/donovangthach/NavigAid
---

## Problem

A white cane only tells its user about what it touches, usually at ground level and about a step ahead. Many smart cane attachments add beeps or vibrations to warn about obstacles, but the user still has to interpret every one of those signals while walking, and we thought that constant stream of alerts could wear a person out. NavigAid takes a different approach: instead of warning the user, the cane physically steers itself away from obstacles, so the user only has to follow it.

## My Role

NavigAid was built by a team of three in 24 hours at BeaverHacks 2026. I owned the hardware. I wrote all of the Arduino firmware in C++, wired the sensors and motors, and built the steering on the cane. My teammates built the computer vision and the decision logic on the Raspberry Pi, and I worked with them on how the Pi turns sensor readings into steering commands.

Late in the hackathon, the laser distance sensor and the tilt sensor still weren't working, and my teammates wanted to cut them. The problems were in the hardware: the sensor pins didn't fit our sensor shield, and we had battery problems on top of that. I kept working through the wiring and power problems, and we got both sensors working in time for the final cane.

## Approach

The cane is a PVC pipe with two small motors and wheels at the tip, plus a 3D-printed mount we made to hold a phone. Each wheel is driven separately, so the firmware turns the cane by driving the wheels in opposite directions, which pulls the user's hand left or right. When we first tested it, the cane turned the wrong way, so I flipped the motor directions in the firmware.

An Arduino Uno reads four sensors: two ultrasonic sensors facing left and right, a laser time-of-flight sensor facing forward, and an accelerometer that measures the cane's tilt. It sends their readings to the Raspberry Pi about ten times a second, and drives the motors based on single-letter commands it gets back: forward, left, right, or stop.

The phone streams video to a laptop, which runs YOLOv8 to detect objects and MiDaS to estimate depth from a single camera image. The depth map tells the cane how far away objects are, and also reveals drop-offs like downward stairs and curbs. The laptop sends what it finds to the Raspberry Pi over WiFi.

The Pi combines everything with one safety rule: the physical sensors always override the camera. The tilt sensor works as fall detection: the motors stop if the cane falls or isn't held at a walking angle. The cane turns away from anything the ultrasonic sensors see within 80 cm, and picks the clearer side when the laser sees something within a meter. The camera only steers when the close-range sensors are clear, and if the WiFi connection drops, the cane keeps working on its physical sensors alone.

To test it, we tied shirts around our heads as blindfolds and walked with the cane.

## Result

We won 2nd place in the BeaverHacks 2026 hardware track. The live demo didn't go as planned. The room was too crowded for the cane to find a clear path, and the venue WiFi was too unreliable for the laptop to keep sending camera data to the Pi. The judges still rewarded the idea and the build itself.

<iframe
  src="https://www.youtube-nocookie.com/embed/hiUjq3JyF58"
  title="NavigAid demo video"
  loading="lazy"
  allow="encrypted-media; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
  style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 0.75rem;"
></iframe>

## What I'd Do Differently

I would test with blind and low-vision users. Blindfolding ourselves showed us whether the steering worked, but sighted people with a blindfold don't walk like experienced cane users, so we couldn't tell whether the steering would actually help the people it's for.

I would also test code before putting it on the hardware. We flashed new code onto the boards for every fix, so each small change meant another slow upload and another round of testing on the cane. Running the decision logic on a laptop with recorded sensor readings first would have caught most bugs much faster.

I would also move the computer vision onto the cane itself. Depending on a laptop and venue WiFi meant the camera cut out exactly when we needed it most, during the demo.

Finally, I would check that every part fits together before the event. Our sensor pins didn't fit the sensor shield, which cost us time we needed for testing.
