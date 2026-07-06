"use client";

import { useEffect } from "react";

// global-error replaces the root layout when a top-level render fails, so it must
// render its own <html>/<body> and cannot rely on Tailwind/global CSS being present.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "6rem 1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f7f4ed",
          color: "#1b1f1e"
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#0C120F", margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "28rem", color: "rgba(27,31,30,0.7)", margin: 0 }}>
          A critical error occurred. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "9999px",
            background: "#A14653",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
