import styles from "./DecibelMeter.module.scss";

export function DecibelMeter({ level, clipping, tooLow }: { level: number; clipping?: boolean; tooLow?: boolean }) {
  const pct = Math.max(0, Math.min(100, ((level + 60) / 60) * 100));
  const label = clipping ? "Clipping" : tooLow ? "Too low" : "Signal safe";
  return (
    <div
      className={styles.meter}
      role="meter"
      aria-valuemin={-60}
      aria-valuemax={0}
      aria-valuenow={Math.round(level)}
      aria-label={`Input level ${Math.round(level)} decibels, ${label}`}
    >
      <div className={styles.track}>
        <span style={{ height: `${pct}%` }} />
      </div>
      <div className={styles.readout}>
        <strong>{Math.round(level)} dB</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
