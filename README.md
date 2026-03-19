# Job Tracker — AI-Powered Job Application Manager

A full-stack web application that helps students track their job applications during campus placements, with AI-powered interview tips for each company.

## Live Demo
🔗 [Live App](https://job-tracker-kvf5.vercel.app/)

## Screenshots
![Dashboard](screenshot-url)

## Features
- Register and login with JWT authentication
- Add, edit, delete job applications
- Track application status — Applied, Interview Scheduled, Offer Received, Rejected
- AI-powered interview tips for each company using OpenRouter API
- Pie chart showing application breakdown
- Search jobs by company or role
- Deadline alerts for upcoming interviews in next 3 days
- Fully responsive UI

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- OpenRouter AI API

## Installation

### Backend Setup
```bash
cd backend
npm install
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the backend folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key
PORT=5000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/jobs | Get all jobs |
| POST | /api/jobs | Add new job |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |
| POST | /api/tips | Get AI interview tips |

## Developer
**Pratik Vairagade**
- GitHub: [@Pratik00017](https://github.com/Pratik00017)
