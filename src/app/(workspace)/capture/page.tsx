"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DecibelMeter } from "@/components/audio/DecibelMeter";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAnalyzeVoice } from "@/hooks/useApi";
import type { AudioHealthItem } from "@/lib/api/types";
import { useGenerationStore } from "@/stores/generationStore";
import { useRecordingStore } from "@/stores/recordingStore";
import styles from "./page.module.scss";

const MIN_SECONDS = 60;

function getHealthItemText(item: AudioHealthItem) {
  if (typeof item === "string") return item;

  const message = item.message?.trim();
  const code = item.code?.trim();
  const severity = item.severity?.trim();
  const text = message || code || "Analyzer feedback unavailable";

  return severity ? `${severity}: ${text}` : text;
}

function getHealthItemKey(section: string, item: AudioHealthItem, index: number) {
  if (typeof item === "string") return `${section}-${item}-${index}`;

  return `${section}-${item.code ?? item.message ?? "item"}-${index}`;
}

export default function CapturePage() {
  const [name, setName] = useState("");
  const [permissionError, setPermissionError] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(-60);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const elapsed = useRecordingStore((state) => state.elapsed);
  const blob = useRecordingStore((state) => state.blob);
  const previewUrl = useRecordingStore((state) => state.previewUrl);
  const report = useRecordingStore((state) => state.report);
  const setElapsed = useRecordingStore((state) => state.setElapsed);
  const setBlob = useRecordingStore((state) => state.setBlob);
  const setReport = useRecordingStore((state) => state.setReport);
  const reset = useRecordingStore((state) => state.reset);
  const setSelectedVoice = useGenerationStore((state) => state.setSelectedVoice);
  const router = useRouter();
  const analyze = useAnalyzeVoice();

  async function startRecording() {
    try {
      setPermissionError(undefined);
      setFileError(undefined);
      reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recorderRef.current = new MediaRecorder(stream);
      recorderRef.current.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorderRef.current.onstop = () =>
        setBlob(new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || "audio/webm" }));
      recorderRef.current.start();
      setRecording(true);
      const started = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - started) / 1000));
        setLevel(-52 + Math.random() * 42);
      }, 500);
    } catch {
      setPermissionError(
        "Microphone permission was denied or no input device is available. Enable browser microphone access and retry."
      );
    }
  }

  function stopTracks() {
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
    stopTracks();
  }

  function handleReset() {
    reset();
    setPermissionError(undefined);
    setFileError(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      stopTracks();
    }

    setPermissionError(undefined);
    setFileError(undefined);
    setReport(undefined);
    setBlob(file);

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      setElapsed(Number.isFinite(audio.duration) ? Math.floor(audio.duration) : 0);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setElapsed(0);
      setBlob(undefined);
      setFileError("Unable to read this audio file. Choose a valid audio file and try again.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    audio.src = objectUrl;
  }

  function useVoiceClone() {
    if (!report?.voice) return;

    setSelectedVoice(report.voice.id);
    router.push("/generate");
  }

  useEffect(() => () => stopTracks(), []);

  const remaining = Math.max(0, MIN_SECONDS - elapsed);
  const canSubmit = Boolean(blob && elapsed >= MIN_SECONDS && name.trim());

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p>Capture Wizard</p>
        <h1>Record or upload a validated voice sample</h1>
      </header>
      <section className={styles.grid}>
        <div className={styles.panel}>
          <TextField
            label="Voice name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Narrator internal 01"
          />
          <div className={styles.transport}>
            {!recording ? (
              <Button variant="primary" onClick={startRecording}>
                Start Recording
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording}>
                Stop Recording
              </Button>
            )}
            <label className={styles.uploadButton}>
              Upload audio file
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} />
            </label>
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          </div>
          {permissionError && <p className={styles.error}>{permissionError}</p>}
          {fileError && <p className={styles.error}>{fileError}</p>}
          <div className={styles.timer}>
            <span>Elapsed</span>
            <strong>
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            </strong>
            <small>
              {remaining > 0 ? `${remaining}s remaining before upload is enabled` : "Minimum duration satisfied"}
            </small>
          </div>
        </div>
        <div className={styles.panel}>
          <DecibelMeter level={level} clipping={level > -4} tooLow={level < -45 && recording} />
        </div>
        <div className={styles.panelWide}>
          <h2>Preview and analyzer</h2>
          {previewUrl ? (
            <audio controls src={previewUrl} className={styles.audio} />
          ) : (
            <p className={styles.muted}>Stop a recording or upload an audio file to preview before backend submission.</p>
          )}
          <Button
            variant="primary"
            loading={analyze.isPending}
            disabled={!canSubmit}
            onClick={() => blob && analyze.mutate({ blob, name }, { onSuccess: setReport })}
          >
            Analyze and Clone
          </Button>
          {elapsed > 0 && elapsed < MIN_SECONDS && (
            <p className={styles.error}>Audio sample too short. Provide at least 60 seconds.</p>
          )}
          {report && (
            <div className={report.accepted ? styles.reportOk : styles.reportBad}>
              <strong>{report.accepted ? "Accepted" : "Quality warnings found"}</strong>
              {report.voice && (
                <span>
                  Voice clone created. You can use it, but quality warnings may affect generation output.
                </span>
              )}
              {!report.voice && !report.accepted && (
                <span>Health checks returned warnings, but no voice clone was returned by the backend.</span>
              )}
              <span>Duration: {Math.round(report.duration)}s</span>
              {report.issues.map((issue, index) => (
                <span key={getHealthItemKey("issue", issue, index)}>{getHealthItemText(issue)}</span>
              ))}
              {report.recommendations.map((item, index) => (
                <span key={getHealthItemKey("recommendation", item, index)}>{getHealthItemText(item)}</span>
              ))}
              <div className={styles.nextActions}>
                {report.voice ? (
                  <Button variant="primary" onClick={useVoiceClone}>
                    Use This Voice
                  </Button>
                ) : (
                  !report.accepted && (
                    <Button
                      variant="primary"
                      loading={analyze.isPending}
                      disabled={!blob || !name.trim()}
                      onClick={() => blob && analyze.mutate({ blob, force: true, name }, { onSuccess: setReport })}
                    >
                      Clone Anyway
                    </Button>
                  )
                )}
                <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
          {analyze.isError && (
            <p className={styles.error}>
              Analyzer failed. Preserve the recording and retry when the backend is reachable.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
