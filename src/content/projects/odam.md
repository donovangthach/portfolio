---
title: Oral Disease Analysis Model
summary: YOLO11 detector for six oral diseases. I caught and fixed two separate train/test leaks that were inflating its results.
tier: featured
order: 1
tags: [Python, YOLO11, Computer Vision, HPC]
# scope: 5x5
status: In progress
repo: https://github.com/donovangthach/Oral-Disease-Analysis-Model
---

## Problem

ODAM detects six oral diseases in photos of the mouth: caries (cavities), gingivitis, tooth discoloration, ulcers, calculus (tartar), and hypodontia (missing teeth). The goal is to help low-income families without easy access to dental care get an early warning from a phone photo, giving them a head start on improving their oral care and preventing disease. It is meant as a screening aid, not a replacement for a dentist.

## My Role

I built a four-stage data pipeline that combines eight separately labeled datasets into one consistent training set. Each stage is its own script, run in order:

1. Remapping each dataset's labels to the six shared classes, and discarding labels that don't fit, like plaque.
2. Merging all datasets into one folder, keeping only images that have a matching label file.
3. Splitting the merged data into train, validation, and test sets (70/15/15). Every augmented copy of a photo goes to the same split, and a saved manifest locks the test set so every model is evaluated on the same photos.
4. Verifying label formats and class counts, and checking that no photo appears in more than one split.

I also trained and evaluated every model, and wrote the scripts that find and fix problems in the data.

## Approach

I sourced eight datasets, seven from Roboflow and one from Zenodo. One of them is a set of healthy teeth with no diseases, which teaches the model what a healthy mouth looks like. I went through the data to check for duplicates. The Zenodo dataset came without a list of its class names, so I identified its two classes (caries and missing tooth) and mapped them by hand in Stage 1. Stage 1 also converts the outline-style labels from some Roboflow downloads into the bounding boxes YOLO11 trains on.

For class selection, I chose the most common and most visually obvious diseases, so the model wasn't trained on diseases that are hard to see in a photo.

The first version of ODAM used Faster R-CNN with a ResNet-50 backbone, which I built and trained in PyTorch. For version 2, I rebuilt the project around YOLO11, because it comes with built-in data augmentation, exports to a single ONNX file for deployment, and runs about 10 times faster per image. Most of my datasets came from Roboflow, which exports labels in the YOLO format, so YOLO11 could read them without any conversion.

I trained it with the Ultralytics Python package, which handles the training loop, data augmentation, and evaluation metrics. My main configuration is the medium model (YOLO11m), trained for 300 epochs with a batch size of 32 and the AdamW optimizer.

I ran training on Oregon State's High Performance Computing (HPC) cluster through SLURM job scripts. A full run takes around 7 hours.

## Result

My first full run with YOLO11m scored 0.814 mAP50 on the validation set. This number seemed suspicious, since the only changes from my earlier runs were the larger model and training for 300 epochs. At first I thought the model was overfitting, but the real problem was data leakage. Roboflow exports several augmented copies of each photo, and my split had scattered copies of the same photo across train, validation, and test, so the model was being scored on photos it had already seen.

I rewrote the split to keep every copy of a photo in the same set, added a leak check to the verify stage, and wrote an HPC job that scores every model the same way on the test set. Validation dropped from 0.814 to 0.665 mAP50, and the test set scored 0.674, more honest numbers. After that, I saved the split to a manifest that locks the test set, so every later experiment is compared on exactly the same photos.

From there, I found that calculus is the weak class. Only about 233 unique training photos contain calculus, and many teeth with visible tartar have no label, including in the test set. Calculus scores 0.395 AP50, while the other five classes score between 0.53 and 0.86.

To tell real improvements apart from noise, I retrained with only the random seed changed. Single classes moved by up to 0.04 AP50, but the average of the five non-calculus classes moved by only 0.003, so that average is now the number I compare experiments on.

Most recently, I wrote a duplicate finder that compares images by their content instead of their file names. It found that 319 of the 928 test photos (34%) have a near-identical copy in the training set under a different dataset or file name, because several of the Roboflow datasets share the same photos. This means my current numbers are still inflated. I removed the 788 duplicate photos from the training set, and my next step is retraining a clean baseline that will replace these results.

| Run | Validation mAP50 | Test mAP50 | What was wrong |
| --- | --- | --- | --- |
| First run | 0.814 | Not recorded | Copies of the same photo in more than one split |
| Grouped split | 0.665 | 0.674 | Same photos shared across datasets (found later) |
| Plaque removed (current) | 0.674 | 0.666 | Same photos shared across datasets (found later) |
| Clean baseline | In progress | In progress | |

## What I'd Do Differently

I would check for duplicate photos by their content from the start, not by file name. Both leaks came from the same photo showing up under a different name, and catching that on day one would have saved several training runs.

I would also get expert-labeled data, especially for calculus. I considered relabeling the test photos myself, but without dental training, my labels could add new errors.

Next, I want to build a live demo so the model can detect diseases in real time.

I also learned that training a model doesn't take weeks like I thought. A training run takes hours. Most of the time goes into reading papers, finding the right model and training methods, and solving data problems I didn't know existed.
