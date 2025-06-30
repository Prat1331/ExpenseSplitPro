import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await fetch("https://expensesplitpro-production.up.railway.app/api/auth/user", {
        credentials: "include", // send cookies
      });
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json();
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
