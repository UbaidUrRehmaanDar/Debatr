// Server component – renders static layout and lazily loads the client form
import Link from "next/link";
import dynamic from "next/dynamic";

const NewDebateForm = dynamic(() => import("@/components/NewDebateForm"), {
  loading: () => (
    <div style={{ 
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "var(--muted-foreground)",
      fontSize: "14px"
    }}>
      Loading form...
    </div>
  ),
});

export default function NewDebatePage() {
  return (
    <main className="page-content-narrow page-enter" style={{ display: "flex", flexDirection: "column" }}>
      {/* Back link + title */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/debates"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            color: "var(--muted-foreground)",
            marginBottom: 16,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Debates
        </Link>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "var(--foreground)",
          }}
        >
          New Debate
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--muted-foreground)",
            marginTop: 4,
          }}
        >
          Set up the parameters for your debate session.
        </p>
      </div>
      {/* Lazy‑loaded client form */}
      <NewDebateForm />
    </main>
  );
}
