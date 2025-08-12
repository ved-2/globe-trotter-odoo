# GlobeTrotter - AI Travel Planner

Welcome to **GlobeTrotter**, a modern, AI-powered web application designed to make travel planning seamless, personalized, and enjoyable. Generate detailed itineraries, manage your plans with an interactive interface, and get real-time assistance from an AI copilot.

## TeamMates
Vedant Kolte
Krish Mali

---

## Demo Link
--> https://drive.google.com/file/d/1W0gFeExP-jsXp5SSgYtL5IMrjQoGOfhw/view

## Key Features

GlobeTrotter is packed with features to enhance your travel planning experience from start to finish:

- **AI-Powered Trip Generation**  
  Simply provide your destination, duration, budget, and travel style, and let our AI (powered by Google's Gemini) generate a comprehensive, day-by-day itinerary for you.

- **Interactive Itinerary Dashboard**  
  View your trip on a rich, interactive dashboard. Use drag-and-drop to easily reorder activities and customize your schedule.

- **AI Chat Copilot**  
  Need to make a change? Just ask! Our in-app AI assistant can add activities, suggest hotels, or modify your itinerary based on natural language commands.

- **Personalized User Dashboard**  
  A central hub for all your travels. View your upcoming and past trips, manage a "Dream List" of future destinations, and see a heatmap of your visited locations.

- **Community & Social Sharing**  
  Get inspired by the community! Browse travel reviews and plans shared by other users, and post your own experiences.

- **PDF Export**  
  Download a beautifully formatted PDF of your complete travel plan to take with you on the go, accessible anytime, anywhere.

- **Secure Authentication**  
  User accounts and data are kept secure with modern authentication provided by Clerk.

---

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Shadcn/ui, Framer Motion  
- **Backend:** Next.js API Routes  
- **Database:** MongoDB with Mongoose  
- **Authentication:** Clerk  
- **AI & Machine Learning:** Google Gemini API, CopilotKit  
- **PDF Generation:** Puppeteer  
- **Drag & Drop:** Dnd-kit  


##  Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.0 or later)
*   npm or yarn
*   MongoDB account and a connection string.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/globetrotter.git
    cd globetrotter
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add the following variables.

    ```env
    # MongoDB Connection String
    MONGODB_URI=your_mongodb_connection_string

    # Clerk Authentication Keys (https://dashboard.clerk.com)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

    # Google Gemini API Key (https://ai.google.dev/)
    GEMINI_API_KEY=your_gemini_api_key

    # Base URL for your application
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open http://localhost:3000 with your browser to see the result!

##  Project Structure

The project follows a standard Next.js App Router structure.

```
.
├── app/
│   ├── (auth)/             # Authentication pages (sign-in, sign-up)
│   ├── (dashboard)/        # Main application pages (dashboard, create-trip)
│   ├── api/                # API routes for backend logic
│   ├── travel-plan/[id]/   # Dynamic page for viewing a single trip
│   └── ...
├── components/
│   ├── shared/             # Reusable components across the app
│   └── ui/                 # UI primitives from Shadcn/ui
├── lib/
│   ├── actions/            # Server actions
│   ├── database/           # MongoDB connection and utility functions
│   └── utils.js            # General utility functions
├── models/                 # Mongoose schemas for database models
├── public/                 # Static assets (images, fonts)
└── ...

