# EduShare Hub - Study Resource Sharing Platform

A production-level full-stack MERN application for sharing study resources.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, Framer Motion, React Toastify, React Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, bcryptjs
- **Database**: MongoDB (Local)

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

### Backend Setup
```bash
cd backend
npm install
npm run dev   # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev   # Runs on http://localhost:5173
```

## Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edusharehub
JWT_SECRET=edushare_secret_key_2024_secure
NODE_ENV=development
```

## API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/update` - Update profile
- `GET /api/resources` - Browse resources
- `GET /api/resources/:id` - Get resource
- `POST /api/resources/upload` - Upload resource
- `POST /api/resources/:id/like` - Like resource
- `POST /api/resources/:id/bookmark` - Bookmark resource
- `POST /api/resources/:id/comment` - Add comment
- `POST /api/resources/:id/rate` - Rate resource
- `GET /api/admin/analytics` - Admin analytics
- `GET /api/admin/users` - Manage users

## Features
- JWT Authentication & Role-based Authorization
- File Upload (PDF, DOC, PPT, Images) via Multer
- Search & Advanced Filtering
- Like, Bookmark, Comment, Rate system
- Admin Dashboard with Analytics
- Dark Mode UI with Glassmorphism
- Framer Motion Animations
- Responsive Design
- Toast Notifications
- Pagination
