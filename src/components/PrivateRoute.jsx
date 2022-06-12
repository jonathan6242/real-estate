import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { auth } from "../firebase";
import useAuthStatus from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

function PrivateRoute() {
  const { loggedIn, loading } = useAuthStatus();

  if(loading) {
    return <Spinner />
  }

  return loggedIn ? <Outlet /> : <Navigate to='/signin' />
}

export default PrivateRoute