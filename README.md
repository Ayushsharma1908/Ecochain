<div align="center">

# 🌱 EcoChain Link

### AI-Powered Sustainability Assistant built with React Native & Expo

Scan • Analyze • Act Sustainably ♻️

![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📖 Overview

EcoChain Link is an AI-powered mobile application that helps users make environmentally responsible purchasing decisions through intelligent product analysis.

Simply scan a product barcode and instantly receive:

- 🌱 Sustainability insights
- ♻️ Waste classification
- 🤖 AI-powered recommendations
- 📍 Nearby recycling centers
- 📊 Sustainability score

Built during **HACKHAZARDS'26 | Namespace** under the **Expo Track – Build Mobile Apps with Expo**.

---

# ✨ Features

### 📷 Barcode Scanning

Scan any EAN/UPC product barcode using your device camera.

---

### 🤖 AI Sustainability Advisor

Powered by Google Gemini AI to provide contextual sustainability recommendations.

---

### 📊 Sustainability Score

Custom scoring engine evaluating products based on:

- Packaging
- Eco Labels
- Plastic Usage
- Material Composition
- Waste Type

---

### ♻️ Waste Classification

Automatically classifies products into disposal categories including:

- Plastic
- Paper
- Glass
- Metal
- Organic Waste

---

### 📍 Recycler Discovery

Locate nearby recycling centers using Expo Location.

---

### 📱 Cross Platform

Single codebase supporting both Android and iOS using React Native + Expo.

---

# 🏗 Architecture

```text
                User
                  │
                  ▼
        Barcode Scanner
                  │
                  ▼
        OpenFoodFacts API
                  │
                  ▼
          Product Metadata
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
   Gemini AI   Sustainability  Waste
   Analysis      Scoring    Classification
        │         │          │
        └─────────┼──────────┘
                  ▼
          Recycler Discovery
                  │
                  ▼
          User Recommendations
```

---

# 🛠 Tech Stack

### Mobile

- React Native
- Expo SDK 54
- Expo Router
- TypeScript

### AI

- Google Gemini AI

### APIs

- OpenFoodFacts API

### Native Modules

- Expo Camera
- Expo Location

### State Management

- React Hooks

---

# 📱 Screens

- Splash Screen
- Home
- Barcode Scanner
- Product Details
- Sustainability Analysis
- Recycler Finder
- AI Recommendation
- Settings

---

# 🚀 Getting Started

## Clone

```bash
git clone https://github.com/Ayushsharma1908/Ecochain.git

cd Ecochain
```

---

## Install

```bash
npm install
```

---

## Environment Variables

Create a `.env` file.

```env
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash
```

---

## Start

```bash
npx expo start
```

---

# 📂 Project Structure

```text
src
│
├── app
├── components
├── constants
├── hooks
├── services
├── utils
├── assets
└── types
```

---

# ⚙ Workflow

```text
Scan Barcode
      │
      ▼
Fetch Product Data
      │
      ▼
Generate AI Insights
      │
      ▼
Calculate Sustainability Score
      │
      ▼
Classify Waste
      │
      ▼
Find Nearby Recyclers
      │
      ▼
Display Recommendation
```

---

# 🚧 Challenges

During development we addressed several engineering challenges including:

- Mobile networking reliability
- Cross-platform UI consistency
- Offline handling
- Product data availability
- AI prompt engineering
- Performance optimization

---

# 🚀 Future Roadmap

- 🌍 Carbon Footprint Estimation
- 🧠 Personalized AI Recommendations
- 📷 OCR Product Recognition
- 🏆 Gamified Sustainability Rewards
- 📈 Product Lifecycle Tracking
- 🌐 Multi-source Product Database
- 👥 Community Recycling Contributions

---

# 👥 Team

### Team Texas

**Ayush Kumar Sharma**

Full Stack Developer

**Yanshi Chauhan**

Developer

---

# 🏆 Hackathon

**Event**

HACKHAZARDS'26 | Namespace

**Theme**

Climate & Sustainability Systems

**Track**

Expo Track – Build Mobile Apps with Expo

---

# 🌱 Vision

Our vision is to simplify sustainable living by combining artificial intelligence, mobile technologies, and environmental awareness into one seamless experience.

We believe informed decisions lead to a greener future.

---

# 📜 License

MIT License

---

<div align="center">

### 🌍 Building a Sustainable Future, One Scan at a Time ♻️

Made with ❤️ using React Native, Expo & Google Gemini AI

</div>
