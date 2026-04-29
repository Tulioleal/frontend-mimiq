import type { GpuState } from "@/lib/api/types";
import styles from "./StatusIndicator.module.scss";

const labels: Record<GpuState, string> = {
  offline: "Offline",
  booting: "Booting",
  ready: "Ready",
  stale: "Stale",
  error: "Unavailable"
};

export function StatusIndicator({
  state,
  message,
  compact = false
}: {
  state: GpuState;
  message?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`${styles.status} ${styles[state]} ${compact ? styles.compact : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden />
      <span>{labels[state]}</span>
      {!compact && message && <small>{message}</small>}
    </div>
  );
}
