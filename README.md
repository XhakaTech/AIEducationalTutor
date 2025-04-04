# AI Educational Tutor

This project is a full-stack AI-powered educational tutoring application.

## Functionality

The application aims to provide an interactive learning experience using AI. Based on the project structure and dependencies, the potential features include:

*   **User Authentication:** Secure login and registration using Passport.js.
*   **AI Integration:** Utilizes Google's Generative AI (`@google/generative-ai`) for potential features like:
    *   AI-driven explanations and feedback.
    *   Personalized learning paths.
    *   Automated grading or assistance.
*   **Interactive UI:** Built with React, Shadcn UI components, and potentially real-time features using WebSockets (`ws`).
*   **Course/Content Management:** Likely involves creating, managing, and delivering educational content (structure needs further exploration).
*   **Data Persistence:** Uses Drizzle ORM with a PostgreSQL-compatible database (like NeonDB) to store user data, course progress, etc.

*(Note: This is an inferred description based on the project structure and dependencies. Specific features might vary based on the actual implementation within the `controllers`, `services`, `pages`, and `components`.)*

## Tech Stack

*   **Frontend:**
    *   React
    *   Vite
    *   TypeScript
    *   Wouter (Routing)
    *   Tailwind CSS
    *   Shadcn UI (Component Library)
    *   TanStack Query (Data Fetching)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   TypeScript
    *   Drizzle ORM
    *   Passport.js (Authentication)
    *   `@google/generative-ai`
    *   `ws` (WebSockets - potential)
*   **Database:**
    *   PostgreSQL-compatible (e.g., NeonDB)
*   **Development Tools:**
    *   `tsx` (TypeScript execution)
    *   `esbuild` (Bundling)
    *   `drizzle-kit` (ORM tooling)

## Local Development Setup

1.  **Prerequisites:**
    *   Node.js (v20 or later recommended)
    *   npm (or pnpm/yarn)
    *   Access to a PostgreSQL database (e.g., local instance or a cloud service like NeonDB).

2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Environment Variables:**
    *   Create a `.env` file in the `server` directory.
    *   Add necessary environment variables, including:
        *   `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database?sslmode=require`).
        *   `SESSION_SECRET`: A secret string for session management.
        *   `GOOGLE_API_KEY`: Your API key for Google Generative AI (if used).
        *   *(Potentially others based on `server/config.ts` or similar)*

5.  **Database Setup:**
    *   Ensure your PostgreSQL database is running.
    *   Apply database migrations:
        ```bash
        npm run db:push
        ```
        *(This command uses `drizzle-kit` to synchronize your database schema based on definitions likely in the `shared` or `server/db` directory.)*

6.  **Run the development server:**
    *   This command typically starts both the backend server (using `tsx`) and the frontend development server (using Vite) concurrently. Check the `dev` script in `package.json`. If it only starts the backend:
        ```bash
        npm run dev
        ```
    *   You might need separate commands if `npm run dev` doesn't start both:
        *   **Start Backend:** `npm run dev` (or specific script if `dev` is for frontend)
        *   **Start Frontend:** Navigate to the `client` directory (`cd client`) and run `npm run dev` (assuming a standard Vite setup within the client). *However, the root `package.json` seems to handle the client build via Vite.* The `server/vite.ts` suggests the Express server handles serving the client in development.

## Deployment

Deploying this application typically involves building the frontend and backend assets and running the server in a production environment.

**1. Build the Application:**

```bash
npm run build
```

*   This command should:
    *   Build the React frontend using Vite (`vite build`).
    *   Build the Express backend using `esbuild` (`esbuild server/index.ts ...`).
    *   Place the output in a `dist` directory (check `vite.config.ts` and the `build` script in `package.json`).

**2. Deployment Environment:**

*   Choose a hosting provider (e.g., Vercel, Netlify, Render, Fly.io, AWS, Google Cloud).
*   Ensure the environment has Node.js installed.
*   Set up a production PostgreSQL database and configure the `DATABASE_URL` environment variable in your deployment environment.
*   Set all other required environment variables (`SESSION_SECRET`, `GOOGLE_API_KEY`, etc.) in the deployment environment.

**3. Run the Application:**

*   Upload the contents of the `dist` directory and the `node_modules` (or run `npm install --production` on the server).
*   Start the server using the production start script:
    ```bash
    npm start
    ```
    *(This executes `NODE_ENV=production node dist/index.js`)*

**Best Way to Deploy Locally (for Testing/Development):**

The easiest way to *run* it locally for development is using the `npm run dev` command after completing the setup steps (installing dependencies, setting up the `.env` file, and running `npm run db:push`). This usually provides hot-reloading for both frontend and backend, making development faster.

If you want to test the *production build* locally:

1.  Run `npm run build`.
2.  Ensure your `.env` file is correctly configured in the `server` directory (or set environment variables globally in your terminal).
3.  Run `npm start`.
4.  Access the application via the port specified in your server code (likely `localhost:3000` or similar).

This simulates the production environment more closely than `npm run dev`. 