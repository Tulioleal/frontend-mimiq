"use client";

import { useEffect, useRef, useState } from "react";
import { WaveformBars } from "@/components/audio/WaveformBars";
import { Button } from "@/components/ui/Button";
import { Fader } from "@/components/ui/Fader";
import { TextArea } from "@/components/ui/TextField";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { useGpuStatus, useVoices } from "@/hooks/useApi";
import { getRuntimeConfig } from "@/lib/runtimeConfig";
import { createGenerationClient, type GenerationClient } from "@/lib/websocket/generationClient";
import { useGenerationStore } from "@/stores/generationStore";
import styles from "./page.module.scss";

export default function GeneratePage() {
  const voices = useVoices();
  const gpu = useGpuStatus();
  const state = useGenerationStore();
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [message, setMessage] = useState("Idle");
  const [wave, setWave] = useState<number[]>([]);
  const clientRef = useRef<GenerationClient | null>(null);
  const selectedVoiceId = state.selectedVoiceId;
  const selectedVoice = voices.data?.find((voice) => voice.id === selectedVoiceId);
  const status = gpu.isError
    ? { state: "error" as const, message: "Polling failed" }
    : (gpu.data ?? { state: "stale" as const, message: "Checking GPU" });
  const ready = status.state === "ready";
  const validDraft = Boolean(selectedVoiceId && state.text.trim() && state.stylePrompt.trim());
  const canStart = validDraft && !streaming && status.state !== "booting";
  const generateLabel = ready ? "Generate Audio" : "Start GPU / Generate Audio";

  useEffect(() => () => clientRef.current?.cancel(), []);

  async function start() {
    if (!selectedVoiceId || !canStart) return;
    setStreaming(true);
    setProgress(0);
    setDownloadUrl(undefined);
    setMessage("Opening stream");
    setWave([]);
    let wsBaseUrl: string;

    try {
      wsBaseUrl = (await getRuntimeConfig()).wsBaseUrl;
    } catch (error) {
      setStreaming(false);
      setMessage(error instanceof Error ? error.message : "Runtime config unavailable");
      return;
    }

    const client = createGenerationClient(wsBaseUrl, (event) => {
      if (event.type === "ready") {
        setMessage("Stream ready");
        client.send({
          type: "start_generation",
          voice_id: selectedVoiceId,
          original_text: state.text,
          style_prompt: state.stylePrompt,
          language: "es",
          slider_config: {
            temperature: state.temperature,
            speech_speed: state.speed,
            repetition_penalty: state.repetitionPenalty
          }
        });
      }
      if (event.type === "status") {
        if (event.status === "booting") {
          setMessage(event.detail ?? "XTTS startup workflow dispatched. Wait for Ready, then generate again.");
        } else if (event.status === "offline") {
          setMessage(event.detail ?? "GPU is offline. Startup request was sent.");
        } else if (event.status === "ready") {
          setMessage(event.detail ?? "GPU ready. Generation can start.");
        }
      }
      if (event.type === "accepted") {
        setProgress(10);
        setMessage("Generation accepted");
      }
      if (event.type === "chunk") {
        setMessage("Early Play active");
        setWave((items) => [...items.slice(-42), 20 + Math.random() * 78]);
      }
      if (event.type === "progress") setProgress(event.progress);
      if (event.type === "completed") {
        setStreaming(false);
        setProgress(100);
        setMessage("Generation complete");
        setDownloadUrl(`/api/generations/${encodeURIComponent(event.generation_id)}/audio`);
      }
      if (event.type === "download_ready" || event.type === "complete") {
        setStreaming(false);
        setProgress(100);
        setMessage("Generation complete");
        if (event.url) setDownloadUrl(event.url);
      }
      if (event.type === "gpu_not_ready" || event.type === "error") {
        setStreaming(false);
        setMessage(event.message ?? "Stream failed");
      }
      if (event.type === "closed") {
        setStreaming(false);
      }
    });
    clientRef.current = client;
  }

  return (
    <div className={styles.page}>
      <section className={styles.editor}>
        <header className={styles.header}>
          <p>Generation Canvas</p>
          <h1>Script editor and live stream</h1>
        </header>
        <TextArea
          label="Synthesis text"
          value={state.text}
          onChange={(event) => state.updateDraft({ text: event.target.value })}
          placeholder="Enter unrestricted text for synthesis..."
        />
        <TextArea
          label="Style prompt"
          value={state.stylePrompt}
          onChange={(event) => state.updateDraft({ stylePrompt: event.target.value })}
          placeholder="Example: paced documentary tone, restrained emotion, crisp consonants"
        />
        <div className={styles.wavePanel}>
          <WaveformBars values={wave.length ? wave : undefined} active={streaming} />
          <div className={styles.progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>
      <aside className={styles.controls}>
        <StatusIndicator state={status.state} message={status.message} />
        <div className={styles.voice}>
          <span>Active voice</span>
          <strong>{selectedVoice?.name ?? (selectedVoiceId ? "Selected voice loading" : "Select from dashboard")}</strong>
        </div>
        <Fader
          label="Temperature"
          min={0.1}
          max={1}
          step={0.1}
          value={state.temperature}
          onChange={(temperature) => state.updateDraft({ temperature })}
        />
        <Fader
          label="Speed"
          min={0.5}
          max={2}
          step={0.1}
          value={state.speed}
          unit="x"
          onChange={(speed) => state.updateDraft({ speed })}
        />
        <Fader
          label="Repetition"
          min={1}
          max={10}
          step={0.1}
          value={state.repetitionPenalty}
          onChange={(repetitionPenalty) => state.updateDraft({ repetitionPenalty })}
        />
        {!ready && (
          <p className={styles.notice}>
            {status.state === "booting"
              ? "GPU is booting. Warm-up usually takes 3-5 minutes, then retry generation."
              : status.state === "offline"
                ? "GPU is offline. Generate Audio will request XTTS startup."
                : "GPU status is uncertain. Generate Audio will try to connect or request XTTS startup."}
          </p>
        )}
        <Button variant="primary" loading={streaming} disabled={!canStart} onClick={start}>
          {generateLabel}
        </Button>
        {downloadUrl ? (
          <a className={styles.download} href={downloadUrl}>
            Download Output
          </a>
        ) : (
          <p className={styles.notice}>Download appears after the backend completes generation.</p>
        )}
        <div className={styles.readout}>
          <span>STATE</span>
          <strong>{message}</strong>
          <span>VALUES</span>
          <strong>
            {state.temperature} / {state.speed}x / {state.repetitionPenalty}
          </strong>
        </div>
      </aside>
    </div>
  );
}
