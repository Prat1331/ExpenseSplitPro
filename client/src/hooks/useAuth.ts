import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5001/api/auth/user", {
        credentials: "include", // crucial for sending cookies/session
      });

      if (!res.ok) {
        throw new Error("Not authenticated");
      }

      return res.json();
    },
    retry: false, // don't retry if unauthenticated
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
