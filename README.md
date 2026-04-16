# AI Translator Pro — Translation Dashboard

AI Translator Pro is a modern, fully responsive browser-based translation dashboard built with HTML, CSS, and JavaScript and integrated with the Microsoft Azure Translator API.

It combines translation, voice input, OCR, translation history, and a floating assistant into a single user-friendly interface. The project is designed as a static frontend application and can be deployed on GitHub Pages.

---

## Live Demo

[View Live Demo](https://ananyasrivastavaa9.github.io/Translator-Pro/)

---

## Overview

AI Translator Pro is a frontend-only web application that allows users to translate text in real time using Microsoft Azure Translator services.

The app supports multiple input methods including typing, speech recognition, and image-based text extraction. It is designed to be practical, responsive, and easy to use on both desktop and mobile devices.

---

## Features

### Translation
- Real-time text translation using Microsoft Azure Translator API
- Auto language detection
- Language swap option

### Input Methods
- Manual text input
- Voice-to-text input using the Web Speech API
- Image-to-text extraction using Tesseract.js

### Utilities
- Copy translated output
- Text-to-speech for translated text
- Translation history with search
- Clear input and history controls
- Floating assistant popup for quick help

### Data Persistence
- Azure endpoint and key saved in localStorage
- Translation history saved in localStorage

### Interface
- Clean, modern dashboard layout
- Fully responsive design
- Smooth hover tilt effect
- Collapsible camera section

---

## Tech Stack

| Technology | Purpose |
|------------|--------|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript (ES6) | Application logic |
| Microsoft Azure Translator API | Translation and language detection |
| Web Speech API | Voice input |
| Tesseract.js | OCR text extraction |
| localStorage | Persistent browser storage |
| GitHub Pages | Static deployment |

---

## Project Structure

```text
Translator-Pro/
├─ index.html
├─ styles.css
├─ script.js
└─ README.md
```

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/ananyasrivastavaa9/Translator-Pro.git
cd Translator-Pro
```

### 2. Open the project
Open `index.html` in your browser or deploy it using GitHub Pages.

### 3. Add Azure credentials
Enter:
- Azure Translator Endpoint
- Azure Translator Key

Then click **Save API**.

### 4. Use the app
- Type text into the input box, or use voice input
- Upload or capture an image to extract text with OCR
- Select a target language
- Click Translate
- Use the assistant popup for help
- View previous translations in the history panel

---

## GitHub Pages Deployment

To publish the project live on GitHub Pages:

1. Push the project files to a GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings** → **Pages**.
4. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Save the settings.
6. Your live site will be available at:

```bash
https://ananyasrivastavaa9.github.io/Translator-Pro/
```

---

## Azure Configuration

This application requires:
- Azure Translator endpoint
- Azure Translator key

The values are stored in the browser using `localStorage` for convenience and reused on future visits.

---

## Browser Support

- Voice input depends on browser support for `SpeechRecognition`.
- OCR works in the browser through Tesseract.js.
- Best experience is on modern Chromium-based browsers.

---

## Notes

- This is a static frontend project.
- No backend is required.
- The app is suitable for portfolio, learning, and productivity use cases.

---

## License

This project is intended for personal, educational, and portfolio use.
