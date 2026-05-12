"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { mapAudioHealthReport, mapGpuStatus, mapVoice } from "@/lib/api/mappers";
import type { GpuStatus, Session, Voice, WsTicket } from "@/lib/api/types";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => apiRequest<Session>("/api/auth/session"),
    retry: false
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminKey: string) =>
      apiRequest<Session>("/api/auth/login", {
        method: "POST",
        headers: { "X-Admin-Key": adminKey },
        body: JSON.stringify({ adminKey })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session"] })
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSettled: () => queryClient.clear()
  });
}

export function createWsTicket() {
  return apiRequest<WsTicket>("/api/auth/ws-ticket", { method: "POST" });
}

export function useGpuStatus() {
  return useQuery<GpuStatus>({
    queryKey: ["gpu-status"],
    queryFn: async () => mapGpuStatus(await apiRequest("/api/status/gpu")),
    refetchInterval: 5000
  });
}

export function useVoices() {
  return useQuery<Voice[]>({
    queryKey: ["voices"],
    queryFn: async () => {
      const payload = await apiRequest<unknown>("/api/voices");
      const list = Array.isArray(payload)
        ? payload
        : typeof payload === "object" && payload && "voices" in payload && Array.isArray(payload.voices)
          ? payload.voices
          : [];
      return list.map((voice) => mapVoice(voice as Record<string, unknown>));
    }
  });
}

export function useDeleteVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/voices/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["voices"] })
  });
}

export function useCloneVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ blob, name }: { blob: Blob; name: string }) => {
      const formData = new FormData();
      const filename = blob instanceof File ? blob.name : `${name || "voice-sample"}.webm`;
      formData.append("name", name);
      formData.append("audio", blob, filename);
      return mapAudioHealthReport(await apiRequest<Record<string, unknown>>("/api/voices", { method: "POST", formData }));
    },
    onSuccess: (report) => {
      if (report.voice) queryClient.invalidateQueries({ queryKey: ["voices"] });
    }
  });
}
