import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./TextField.module.scss";

type Shared = { label: string; helper?: string; error?: string };

export function TextField({ label, helper, error, id, ...props }: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? props.name ?? label;
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input id={inputId} className={styles.control} aria-invalid={Boolean(error)} {...props} />
      {(error || helper) && <span className={error ? styles.error : styles.helper}>{error || helper}</span>}
    </label>
  );
}

export function TextArea({ label, helper, error, id, ...props }: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? props.name ?? label;
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <textarea
        id={inputId}
        className={`${styles.control} ${styles.textarea}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {(error || helper) && <span className={error ? styles.error : styles.helper}>{error || helper}</span>}
    </label>
  );
}
