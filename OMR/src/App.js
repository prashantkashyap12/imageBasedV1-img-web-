import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./config/ProtectedRoute";
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import routes from "./config/routes";

  const App = () => {
    const role = JSON.parse(localStorage.getItem("userData"))?.role;
    console.log(role);

    return (
      <>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          <Route path="/auth/*" element={<AuthLayout />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />

          {/* Standalone Routes */}
          {routes
            .filter((route) => route.layout === "standalone")
            .map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.component />}
              />
            ))}
        </Routes>

      </>
    );
  };

export default App;
