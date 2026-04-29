"use client";

import { useEffect, useRef, useState } from "react";
import { DecibelMeter } from "@/components/audio/DecibelMeter";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAnalyzeVoice } from "@/hooks/useApi";
import { useRecordingStore } from "@/stores/recordingStore";
import styles from "./page.module.scss";

const MIN_SECONDS = 60;

export default function CapturePage() {
  const [name, setName] = useState("");
  const [permissionError, setPermissionError] = useState<string>();
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(-60);
  const recorderRef = useRef<MediaRecorder | null>(null);
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
  const analyze = useAnalyzeVoice();

  async function startRecording() {
    try {
      setPermissionError(undefined);
      reset();
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

  useEffect(() => () => stopTracks(), []);

  const remaining = Math.max(0, MIN_SECONDS - elapsed);
  const canSubmit = Boolean(blob && elapsed >= MIN_SECONDS && name.trim());

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p>Capture Wizard</p>
        <h1>Record a validated voice sample</h1>
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
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          </div>
          {permissionError && <p className={styles.error}>{permissionError}</p>}
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
            <p className={styles.muted}>Stop a recording to create a local preview before backend submission.</p>
          )}
          <Button
            variant="primary"
            loading={analyze.isPending}
            disabled={!canSubmit}
            onClick={() => blob && analyze.mutate({ blob, name }, { onSuccess: setReport })}
          >
            Submit for Health Report
          </Button>
          {elapsed > 0 && elapsed < MIN_SECONDS && (
            <p className={styles.error}>Recording too short. Capture at least 60 seconds.</p>
          )}
          {report && (
            <div className={report.accepted ? styles.reportOk : styles.reportBad}>
              <strong>{report.accepted ? "Accepted" : "Retry required"}</strong>
              <span>Duration: {Math.round(report.duration)}s</span>
              {report.issues.map((issue) => (
                <span key={issue}>{issue}</span>
              ))}
              {report.recommendations.map((item) => (
                <span key={item}>{item}</span>
              ))}
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
