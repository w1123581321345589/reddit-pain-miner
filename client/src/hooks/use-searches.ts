import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSearch, type SearchWithResults } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSearches() {
  return useQuery({
    queryKey: [api.searches.list.path],
    queryFn: async () => {
      const res = await fetch(api.searches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch searches");
      return api.searches.list.responses[200].parse(await res.json());
    },
  });
}

export function useSearch(id: number) {
  return useQuery({
    queryKey: [api.searches.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.searches.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch search details");
      return api.searches.get.responses[200].parse(await res.json());
    },
    // Poll while pending every 5 seconds
    refetchInterval: (data) => 
      data?.state.data?.status === "pending" ? 5000 : false,
  });
}

export function useCreateSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSearch) => {
      const res = await fetch(api.searches.create.path, {
        method: api.searches.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.searches.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create search");
      }
      return api.searches.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.searches.list.path] });
      toast({
        title: "Search Started",
        description: "We're mining Reddit for pain points. This may take a moment.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
