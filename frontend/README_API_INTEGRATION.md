# API Integration Guide

## How the Frontend Connects to the Backend

- The frontend uses `axios` for all API requests.
- The base URL for API requests is set via the environment variable `REACT_APP_API_URL` (see `.env` file).
- All API endpoints (authentication, voters, candidates, elections, votes) are called relative to this base URL.

## Environment Variable

- The `.env` file in the frontend root should contain:

  REACT_APP_API_URL=http://localhost:5001/elecbackend/us-central1/api

- Change this value if your backend runs on a different host or port.

## Authentication

- If authentication is required, store the token in `localStorage` or `sessionStorage` after login.
- Attach the token to requests using axios interceptors or by setting the `Authorization` header manually.

## Example axios Usage

```
axios.get('/candidates'); // Actually requests `${REACT_APP_API_URL}/candidates`
```

## Running the App

1. Start the backend server and ensure it is accessible at the URL in `.env`.
2. Start the frontend with `npm start`.
3. The frontend will communicate with the backend using the configured base URL.