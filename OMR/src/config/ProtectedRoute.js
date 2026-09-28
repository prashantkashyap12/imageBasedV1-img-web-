// import { Navigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/auth/login" replace />;
//   }

//   try {
//     const decoded = jwtDecode(token);

//     // 3. Role Check → Prevent access to wrong module
//     if (!allowedRoles.includes(decoded.Role)) {
//       if (decoded.Role === "Admin") return <Navigate to="/admin/index" replace />;
//       if (decoded.Role === "Operator") return <Navigate to="/operator/index" replace />;
//       if (decoded.Role === "Moderator") return <Navigate to="/moderator/index" replace />;
//     }

//     // All OK
//     return children;

//   } catch (err) {
//     console.error("Invalid token", err);
//     localStorage.clear();
//     return <Navigate to="/auth/login" replace />;
//   }
// };

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  // Only redirect if NO tokens exist at all
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  try {
    // If token exists, decode it to verify role
    if (token) {
      const decoded = jwtDecode(token);

      // Role Check
      if (!allowedRoles.includes(decoded.Role)) {
        if (decoded.Role === "Admin") return <Navigate to="/admin/index" replace />;
        if (decoded.Role === "Operator") return <Navigate to="/operator/index" replace />;
        if (decoded.Role === "Moderator") return <Navigate to="/moderator/index" replace />;
      }
    }

    return children;
  } catch (err) {
    console.error("Invalid token format", err);
    if (!token) {
      localStorage.clear();
      return <Navigate to="/auth/login" replace />;
    }
    return children;
  }
};

export default ProtectedRoute;
