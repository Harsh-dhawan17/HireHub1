import React from "react";
import { Routes, Route } from "react-router-dom";
import { RootLayout } from "../components/layout/RootLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { RoleRoute } from "../components/layout/RoleRoute";

// Pages
import { HomePage } from "../pages/HomePage";
import { JobsPage } from "../pages/JobsPage";
import { JobDetailPage } from "../pages/JobDetailPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ProfilePage } from "../pages/ProfilePage";

// Student Pages
import { MyApplicationsPage } from "../pages/student/MyApplicationsPage";
import { ResumeParserPage } from "../pages/student/ResumeParserPage";

// Recruiter Pages
import { RecruiterJobsPage } from "../pages/recruiter/RecruiterJobsPage";
import { CreateJobPage } from "../pages/recruiter/CreateJobPage";
import { EditJobPage } from "../pages/recruiter/EditJobPage";
import { RecruiterApplicationsPage } from "../pages/recruiter/RecruiterApplicationsPage";

import { NotFoundPage } from "../pages/NotFoundPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Protected Routes */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Student Specific Routes */}
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="student">
                <MyApplicationsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resume-parser"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="student">
                <ResumeParserPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Recruiter Specific Routes */}
        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="recruiter">
                <RecruiterJobsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/create"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="recruiter">
                <CreateJobPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/edit/:id"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="recruiter">
                <EditJobPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/applications"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="recruiter">
                <RecruiterApplicationsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
