import styles from "./Fader.module.scss";

type FaderProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function Fader({ label, min, max, step, value, unit, onChange }: FaderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={styles.fader}>
      <span className={styles.row}>
        <span>{label}</span>
        <output>
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </output>
      </span>
      <span className={styles.trackWrap}>
        <span className={styles.track}>
          <span style={{ width: `${pct}%` }} />
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
        />
      </span>
    </label>
  );
}
