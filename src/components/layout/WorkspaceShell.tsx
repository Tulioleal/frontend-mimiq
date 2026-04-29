"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGpuStatus, useLogout, useSession } from "@/hooks/useApi";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import styles from "./WorkspaceShell.module.scss";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/capture", label: "Capture" },
  { href: "/generate", label: "Generate" }
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const gpu = useGpuStatus();
  const logout = useLogout();
  const setExpired = useAuthStore((state) => state.setSessionExpired);

  useEffect(() => {
    if (session.isError) {
      setExpired("Session expired. Re-authenticate to continue.");
      router.replace("/login");
    }
  }, [router, session.isError, setExpired]);

  const status = gpu.isError
    ? { state: "error" as const, message: "Polling failed" }
    : (gpu.data ?? { state: "stale" as const, message: "Checking GPU" });

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/dashboard" className={styles.brand}>
          PVC Console
        </Link>
        <nav>
          {nav.map((item) => (
            <Link key={item.href} className={pathname === item.href ? styles.active : ""} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.headerTools}>
          <StatusIndicator state={status.state} message={status.message} compact />
          <Button
            variant="ghost"
            loading={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}
          >
            Logout
          </Button>
        </div>
      </header>
      <aside className={styles.sidebar} aria-label="Workspace controls">
        <div className={styles.engine}>
          <span /> <strong>Voice Engine</strong>
          <small>XTTS v2 / Private</small>
        </div>
        <Link className={styles.cta} href="/capture">
          New Clone
        </Link>
        <div className={styles.console}>
          <span>LATENCY</span>
          <strong>12ms</strong>
          <span>BUFFER</span>
          <strong>512 samples</strong>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
