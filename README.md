
# 🚀 Jira Ticket Generator AI


An intelligent assistant to help users create well-structured Jira tickets (Bugs, Stories, Epics, Tasks) from natural language requirements using the Gemini API.

---

## ✨ Features

- **Generate Jira Tickets**: Create Jira tickets from natural language requirements.
- **Multiple Ticket Types**: Support for Bug, Story, Epic, and Task tickets.
- **Image Upload**: Attach screenshots for Bug tickets.
- **Refine Tickets**: Improve generated tickets with additional instructions.
- **Export Options**: Export tickets as Markdown or JSON.
- **History Tracking**: Keep track of generated tickets.
- **Responsive UI**: User-friendly and responsive interface.

---

## 🛠 Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- A Google Gemini API key

---

## 📦 Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/yourusername/jira-ticket-generator-ai.git
    cd jira-ticket-generator-ai
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Set the `GEMINI_API_KEY` in `.env.local`:**

    ```sh
    echo "GEMINI_API_KEY=your_api_key_here" > .env.local
    ```

---

## 🏃 Running the App

To start the development server, run:

```sh
npm run dev
```


---

## 🏗 Building for Production

To create a production build, run:

```sh
npm run build
```

This will create an optimized build of the app in the `dist` directory.

---

## 📂 Project Structure

```plaintext
├── public/
├── src/
│   ├── components/
│   │   ├── AnimatedBackground.tsx
│   │   ├── ErrorCard.tsx
│   │   ├── ExportMenu.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── Loader.tsx
│   │   ├── RequirementInput.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── StreamingOutput.tsx
│   │   ├── TicketOutput.tsx
│   │   ├── TicketTypeSelector.tsx
│   │   ├── Tooltip.tsx
│   │   └── icons/
│   ├── services/
│   │   └── geminiService.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── constants.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── index.tsx
│   └── vite.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 📦 Dependencies

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Google GenAI
- React Hot Toast
