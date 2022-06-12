import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react";
import { auth } from "../firebase"


function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user) {
        setLoggedIn(true);
      }
      setLoading(false);
    })
  }, [])

  return { loggedIn, loading }
}

export default useAuthStatus