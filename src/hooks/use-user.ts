import { useEffect, useState } from "react";
import { getUser, type User } from "@/lib/services/userService";

export function useUser(): User {
  const [user, setUser] = useState<User>(() => getUser());
  useEffect(() => {
    const handler = () => setUser(getUser());
    window.addEventListener("hn-user-updated", handler);
    window.addEventListener("storage", handler);
    setUser(getUser());
    return () => {
      window.removeEventListener("hn-user-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}
