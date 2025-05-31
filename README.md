
# ElecTrack( Election Management System)

A full-stack CRUD application for managing elections, candidates, voters, and votes. This application uses MongoDB, Express, React, and Node.js (MERN stack).

## Project Structure

The project is organized into two main directories:

- `functions/` - Backend API built with Express.js and MongoDB
- `frontend/` - React.js frontend application

## Features

- User authentication with role-based access control (admin/voter)
- Election management (create, view, edit, delete)
- Candidate management
- Voter registration and management
- Voting system with real-time results
- Responsive UI built with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn



## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Voters
- `GET /voters` - Get all voters
- `POST /voters` - Create a new voter
- `GET /voters/:id` - Get a specific voter
- `PUT /voters/:id` - Update a voter
- `DELETE /voters/:id` - Delete a voter

### Candidates
- `GET /candidates` - Get all candidates
- `POST /candidates` - Create a new candidate
- `GET /candidates/:id` - Get a specific candidate
- `PUT /candidates/:id` - Update a candidate
- `DELETE /candidates/:id` - Delete a candidate

### Elections
- `GET /elections` - Get all elections
- `POST /elections` - Create a new election
- `GET /elections/:id` - Get a specific election
- `PUT /elections/:id` - Update an election
- `DELETE /elections/:id` - Delete an election

### Votes
- `POST /votes` - Cast a vote
- `GET /votes` - Get all votes (admin only)
- `GET /votes/results/:electionId` - Get election results

## Demo Accounts

For testing purposes, you can use the following demo accounts:

- Admin: admin@example.com (password: any)
- Voter: voter@example.com (password: any)

## Integration Details

- The frontend communicates with the backend using Axios
- Authentication is handled via JWT tokens
- The application uses React Router for navigation
- Material-UI is used for the user interface
- MongoDB is used for data persistence

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure HTTP headers



