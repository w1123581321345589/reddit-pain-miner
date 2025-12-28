import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useOpportunities() {
  return useQuery({
    queryKey: [api.opportunities.list.path],
    queryFn: async () => {
      const res = await fetch(api.opportunities.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return api.opportunities.list.responses[200].parse(await res.json());
    },
  });
}
