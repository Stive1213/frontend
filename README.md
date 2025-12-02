# LifeHub Frontend

A modern React frontend for the LifeHub application with Google Sign-In integration.

## Features

- React 19 with Vite
- Google OAuth authentication
- RESTful API integration
- Context-based state management
- Protected routes
- Responsive design with Tailwind CSS

## Environment Variables

Create a `.env` file in the `Frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000
```

If not set, defaults to `http://localhost:5000`.

## Installation

```bash
npm install
```

## Running the Application

```bash
npm run dev
```

The application will run on `http://localhost:5173`.

## Project Structure

```
Frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   │   └── api.js
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
└── package.json
```

## Authentication

The application supports two authentication methods:

1. **Traditional Sign-up/Login**: Email and password authentication
2. **Google Sign-In**: OAuth 2.0 authentication via Google

### Google Sign-In Flow

1. User clicks "Continue with Google" button
2. Redirects to Google OAuth consent screen
3. After authorization, Google redirects back to `/auth/callback`
4. Frontend receives token and stores it in localStorage
5. User is redirected to dashboard

## API Integration

All API calls are made through the centralized `api.js` service layer, which includes:

- Automatic token injection
- Error handling
- Request/response interceptors
- Centralized base URL configuration

## Protected Routes

Routes are protected using the `ProtectedRoute` component, which checks for a valid token in localStorage.
