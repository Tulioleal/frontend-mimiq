import styles from "./WaveformBars.module.scss";

const fallback = [
  18, 35, 62, 44, 82, 96, 58, 38, 72, 86, 31, 22, 54, 92, 71, 42, 66, 83, 55, 36, 49, 61, 74, 43, 81, 94, 52, 34, 69,
  88, 47, 26
];

export function WaveformBars({ values = fallback, active = false }: { values?: number[]; active?: boolean }) {
  return (
    <div className={`${styles.waveform} ${active ? styles.active : ""}`} aria-label="Audio waveform preview">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${Math.max(8, Math.min(100, value))}%` }} />
      ))}
      prensa
    </div>
  );
}
