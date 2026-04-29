"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useLogin } from "@/hooks/useApi";
import { useAuthStore } from "@/stores/authStore";
import styles from "./page.module.scss";

export default function LoginPage() {
  const [adminKey, setAdminKey] = useState("");
  const login = useLogin();
  const router = useRouter();
  const sessionExpiredMessage = useAuthStore((state) => state.sessionExpiredMessage);
  const clearAuthUi = useAuthStore((state) => state.clearAuthUi);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(adminKey, {
      onSuccess: () => {
        setAdminKey("");
        clearAuthUi();
        router.replace("/dashboard");
      }
    });
  }

  return (
    <main className={styles.login}>
      <section className={styles.panel}>
        <p className={styles.kicker}>Private Voice Clone</p>
        <h1>Authenticate the console</h1>
        <p className={styles.copy}>
          Enter the backend-issued `X-Admin-Key`. The key is only sent for validation and session continuity relies on
          the backend HttpOnly cookie.
        </p>
        <form onSubmit={onSubmit} className={styles.form}>
          <TextField
            label="X-Admin-Key"
            type="password"
            autoComplete="off"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            error={login.isError ? "Invalid key or authentication service unavailable." : undefined}
            helper={sessionExpiredMessage}
            required
          />
          <Button variant="primary" loading={login.isPending} disabled={!adminKey.trim()}>
            Unlock Workspace
          </Button>
        </form>
      </section>
      <aside className={styles.readout} aria-label="System readout">
        <span>AUTH BUS</span>
        <strong>COOKIE MODE</strong>
        <span>KEY STORAGE</span>
        <strong>DISABLED</strong>
        <span>CONSOLE</span>
        <strong>TACTILE v1</strong>
      </aside>
    </main>
  );
}
