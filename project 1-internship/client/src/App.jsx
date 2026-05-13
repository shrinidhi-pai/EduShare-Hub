import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/ProtectedRoute/AdminRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const BrowseResources = lazy(() => import('./pages/BrowseResources/BrowseResources'));
const ResourceDetails = lazy(() => import('./pages/ResourceDetails/ResourceDetails'));
const Upload = lazy(() => import('./pages/Upload/Upload'));
const AdminPanel = lazy(() => import('./pages/AdminPanel/AdminPanel'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Bookmarks = lazy(() => import('./pages/Bookmarks/Bookmarks'));
const About = lazy(() => import('./pages/About/About'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Suspense fallback={<Loader fullPage />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/browse" element={<BrowseResources />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route path="/about" element={<About />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/*" element={<AdminPanel />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
