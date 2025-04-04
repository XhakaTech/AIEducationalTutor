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

*   Node.js
*   Express
*   React
*   TypeScript
*   Tailwind CSS
*   Prisma
*   PostgreSQL

## Development Setup

1.  **Install Dependencies:**
    
    ```bash
    npm install
    ```
    
2.  **Environment Variables:**
    
    Create a `.env` file in the root directory with the following variables:
    
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
    JWT_SECRET="your-secret-key"
    PORT=8080
    ```
    
3.  **Database Setup:**
    
    ```bash
    npm run db:push
    ```
    
4.  **Start Development Server:**
    
    ```bash
    npm run dev
    ```
    
    This command starts the backend server using `tsx`.
    
5.  **Build and Start Production Server:**
    
    ```bash
    npm run build
    npm start
    ```

## Project Structure

*   `client/` - React frontend
*   `server/` - Express backend
*   `shared/` - Shared types and utilities
*   `migrations/` - Database migrations

## API Documentation

The API documentation is available at `/api/docs` when running the development server.

## Deployment

The application is designed to be deployed on Cloud Run. The deployment process is handled by the `deploy-cloud-run.sh` script.

1.  Build the application:
    
    ```bash
    npm run build
    ```
    
2.  Deploy to Cloud Run:
    
    ```bash
    ./deploy-cloud-run.sh
    ```

## Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Commit your changes
4.  Push to the branch
5.  Create a Pull Request 