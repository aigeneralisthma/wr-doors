/**
 * Root-level not-found. Lives outside [locale]/ so Next.js can find it
 * for paths that don't match any locale. The locale-specific 404 page
 * (with brand chrome and translations) will live at app/[locale]/not-found.tsx
 * once the layout system is in place (Prompt 2).
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a1f44",
          color: "#f8f5ee",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#f5b800", fontSize: "0.875rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            404
          </p>
          <h1 style={{ fontSize: "3rem", margin: "1rem 0", fontWeight: 700 }}>
            Page not found
          </h1>
          <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
            The page you are looking for does not exist.
          </p>
          {/* Plain anchor on purpose — this is the root not-found and
              lives outside the [locale] tree where next/link router is
              available. Hard navigation is the correct behavior here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/en"
            style={{
              display: "inline-block",
              background: "#f5b800",
              color: "#0a1f44",
              padding: "0.875rem 2rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Return home
          </a>
        </div>
      </body>
    </html>
  );
}
