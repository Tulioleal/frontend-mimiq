import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "secondary",
  loading,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <span className={styles.spinner} aria-hidden /> : icon}
      <span>{children}</span>
    </button>
  );
}
