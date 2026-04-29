"use client";

import { useState } from "react";
import type { Voice } from "@/lib/api/types";
import { WaveformBars } from "@/components/audio/WaveformBars";
import { Button } from "@/components/ui/Button";
import styles from "./VoiceCard.module.scss";

type Props = { voice: Voice; selected?: boolean; onSelect: () => void; onDelete: () => void };

export function VoiceCard({ voice, selected, onSelect, onDelete }: Props) {
  const [playing, setPlaying] = useState(false);
  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(voice.createdAt));
  const duration = `${Math.floor(voice.duration / 60)}:${String(Math.round(voice.duration % 60)).padStart(2, "0")}`;

  return (
    <article className={`${styles.card} ${selected ? styles.selected : ""}`}>
      <header className={styles.header}>
        <button className={styles.identity} onClick={onSelect} aria-pressed={selected}>
          <span className={styles.avatar} aria-hidden>
            VC
          </span>
          <span>
            <strong>{voice.name}</strong>
            <small>{created}</small>
          </span>
        </button>
        <Button variant="ghost" onClick={onDelete}>
          Delete
        </Button>
      </header>
      <WaveformBars values={voice.waveform} active={playing} />
      <footer className={styles.footer}>
        <span>{duration}</span>
        <span>48kHz</span>
        <Button variant="secondary" onClick={() => setPlaying((value) => !value)}>
          {playing ? "Pause" : "Play"}
        </Button>
      </footer>
      {voice.previewUrl && <audio src={voice.previewUrl} preload="none" aria-label={`${voice.name} preview`} />}
    </article>
  );
}
