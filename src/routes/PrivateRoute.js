import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { hasModulePermission, getAuthHeader, logout } from "../helpers/Authorization";

// Different role has different home page
const RoleHomePage = {
  executive: "/dashboard",
  operator: "/dashboard",
  manager: "/dashboard",
  admin: "/dashboard",
};

const PrivateRoute = ({ component: Component, module, ...rest }) => {
  const { initDataLoaded } = useSelector((state) => state.apiCallData);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!!!getAuthHeader() || !initDataLoaded) {
          // not logged in so redirect to login page with the return url
          logout();
        }
        // authorised so return component
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
