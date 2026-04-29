"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { VoiceCard } from "@/components/dashboard/VoiceCard";
import { useDeleteVoice, useGpuStatus, useVoices } from "@/hooks/useApi";
import { useGenerationStore } from "@/stores/generationStore";
import styles from "./page.module.scss";

export default function DashboardPage() {
  const voices = useVoices();
  const gpu = useGpuStatus();
  const deleteVoice = useDeleteVoice();
  const selectedVoiceId = useGenerationStore((state) => state.selectedVoiceId);
  const setSelectedVoice = useGenerationStore((state) => state.setSelectedVoice);
  const [deleteId, setDeleteId] = useState<string>();
  const status = gpu.isError
    ? { state: "error" as const, message: "Status unavailable" }
    : (gpu.data ?? { state: "stale" as const, message: "Polling backend" });

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p>Voice Vault</p>
          <h1>Project Dashboard</h1>
        </div>
        <StatusIndicator state={status.state} message={status.message} />
      </header>
      <section className={styles.stats} aria-label="Workspace stats">
        <div>
          <span>Total Voices</span>
          <strong>{voices.data?.length ?? "--"}</strong>
        </div>
        <div>
          <span>GPU Poll</span>
          <strong>{gpu.isFetching ? "SYNC" : "IDLE"}</strong>
        </div>
        <div>
          <span>Selected</span>
          <strong>{selectedVoiceId ? "LOCKED" : "NONE"}</strong>
        </div>
      </section>
      <section className={styles.vault}>
        <div className={styles.sectionHead}>
          <h2>Cloned voices</h2>
          <Button variant="primary" onClick={() => location.assign("/capture")}>
            Record Sample
          </Button>
        </div>
        {voices.isLoading && <p className={styles.empty}>Loading voice metadata from the backend.</p>}
        {voices.isError && <p className={styles.empty}>Voice Vault unavailable. Check backend connectivity.</p>}
        {voices.data?.length === 0 && (
          <p className={styles.empty}>No cloned voices yet. Record a minimum 60 second sample to unlock generation.</p>
        )}
        <div className={styles.grid}>
          {voices.data?.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              selected={voice.id === selectedVoiceId}
              onSelect={() => setSelectedVoice(voice.id)}
              onDelete={() => setDeleteId(voice.id)}
            />
          ))}
        </div>
      </section>
      <ConfirmationDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(undefined)}
        title="Delete voice clone?"
        description="This removes the selected voice from the vault. Generation drafts that reference it will need a new voice selection."
        confirmLabel="Delete"
        pending={deleteVoice.isPending}
        onConfirm={() => deleteId && deleteVoice.mutate(deleteId, { onSuccess: () => setDeleteId(undefined) })}
      />
    </div>
  );
}
