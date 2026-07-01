export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "640px",
        margin: "80px auto",
        padding: "0 24px",
        color: "#111",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>
        RACR
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "40px" }}>
        Service is running.
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#888",
            marginBottom: "12px",
          }}
        >
          API Endpoints
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {[
            { path: "/api/health", label: "Health check" },
            { path: "/api/auth/request-code", label: "Auth — request code" },
            { path: "/api/auth/verify-code", label: "Auth — verify code" },
            { path: "/api/events", label: "Events" },
            { path: "/api/groups", label: "Groups" },
            { path: "/api/posts", label: "Posts" },
          ].map(({ path, label }) => (
            <li
              key={path}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                fontSize: "0.95rem",
              }}
            >
              <code
                style={{
                  background: "#f4f4f5",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.85rem",
                  color: "#0070f3",
                  minWidth: "260px",
                }}
              >
                {path}
              </code>
              <span style={{ color: "#555" }}>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
