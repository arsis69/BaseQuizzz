"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";

export default function TestPage() {
  const [mounted, setMounted] = useState(false);
  const [envTest, setEnvTest] = useState("");

  useEffect(() => {
    console.log("[TEST] Component mounted");
    setMounted(true);
    setEnvTest(process.env.NEXT_PUBLIC_URL || "not set");
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <h1 className={styles.title}>Test Page</h1>
          <p className={styles.subtitle}>
            If you can see this with orange gradient text and styles, CSS modules are working!
          </p>
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            border: '2px solid #FF6B35'
          }}>
            <p><strong>Client-side JS:</strong> {mounted ? "✅ Working" : "❌ Not working"}</p>
            <p><strong>Environment vars:</strong> {envTest}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
