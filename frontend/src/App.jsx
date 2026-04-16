import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from "./components/common/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import UserList from "./pages/admin/UserList";
import UserDetail from "./pages/admin/UserDetail";
import UserForm from "./pages/admin/UserForm";
import MyProfile from "./pages/user/MyProfile";

function App() {
  return (
    <Routes>
      
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected — any logged in user */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin + Manager only */}
      <Route
        path="/users"
        element={
          <RoleRoute roles={["admin", "manager"]}>
            <UserList />
          </RoleRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/users/new"
        element={
          <RoleRoute roles={["admin", "manager"]}>
            <UserForm />
          </RoleRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <RoleRoute roles={["admin", "manager"]}>
            <UserDetail />
          </RoleRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <RoleRoute roles={["admin", "manager"]}>
            <UserForm />
          </RoleRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
