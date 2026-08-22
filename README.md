# Dayflow

Every workday, perfectly aligned.

Dayflow is a frontend-only human resource management system demo for employees
and HR officers. It includes a warm editorial landing page, simulated
authentication, role-based dashboards, attendance, leave requests, profiles,
and payroll visibility. Data is seeded locally and persisted in the browser.

## VS Code setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Visual Studio Code

### Run the project

1. Unzip the project folder.
2. Open Visual Studio Code.
3. Choose **File → Open Folder** and select the unzipped `dayflow` folder.
4. Open the integrated terminal with **Terminal → New Terminal**.
5. Install dependencies:

   ```bash
   npm install
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the local URL printed in the terminal.

### Recommended VS Code extensions

- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter

## Project structure

```text
dayflow/
├── public/                 Static favicon and robots file
├── src/
│   ├── components/         Shared UI pieces and error handling
│   ├── context/            Auth, theme, and application state
│   ├── data/               Seed employees, attendance, leave, and payroll
│   ├── hooks/              Reusable React hooks
│   ├── pages/              Page-level routing and views
│   ├── App.tsx             Application shell and route definitions
│   ├── index.css           Dayflow design tokens and global styles
│   └── main.tsx            React entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Demo access

You can create an account from **Get started**. The seeded demo also accepts
the employee email `maya.chen@dayflow.co` and the HR email
`oliver.grant@dayflow.co`; any password with at least eight characters works
for the demo sign-in flow.

## Production build

Create an optimized production build with:

```bash
npm run build
```

To preview that build locally:

```bash
npm run serve
```

## Notes

This project intentionally has no backend or external API calls. Authentication
and application data are simulated with localStorage so the experience can be
run entirely from VS Code.