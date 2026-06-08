import { useState } from "react";

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await onLogin();
    } catch (e) {
      setError("משהו השתבש, נסה שוב");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Heebo', sans-serif",
      direction: "rtl",
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(255,51,102,0.4); }
          50% { box-shadow: 0 0 60px rgba(255,107,0,0.6); }
        }
      `}</style>

      {/* Logo */}
      <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 32 }}>
        <div style={{
          width: 90, height: 90, borderRadius: 24,
          background: "linear-gradient(135deg, #FF3366, #FF6B00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, animation: "glow 2s ease-in-out infinite",
        }}>
          🔥
        </div>
      </div>

      <h1 style={{
        color: "#fff", fontSize: 42, fontWeight: 900,
        letterSpacing: -1, marginBottom: 8,
        background: "linear-gradient(135deg, #FF3366, #FF6B00)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        MEMESTER
      </h1>

      <p style={{ color: "#666", fontSize: 16, marginBottom: 12, textAlign: "center" }}>
        צור מימסים. השתלט על הפייד. 🏆
      </p>

      <div style={{
        display: "flex", gap: 8, marginBottom: 48,
        flexWrap: "wrap", justifyContent: "center",
      }}>
        {["😂 צחק", "🔥 שרוף", "👑 נצח"].map(tag => (
          <span key={tag} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: "4px 14px",
            color: "#888", fontSize: 13, fontWeight: 700,
          }}>{tag}</span>
        ))}
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%", maxWidth: 340,
          background: loading ? "rgba(255,255,255,0.05)" : "#fff",
          border: "none", borderRadius: 16, padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s",
          transform: loading ? "none" : "scale(1)",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {!loading && (
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.6-2.9-11.3-7L6.1 34c3.3 6.5 10 11 17.9 11z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.9 35.7 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
        )}
        <span style={{
          color: loading ? "#555" : "#111",
          fontWeight: 800, fontSize: 16,
          fontFamily: "'Heebo', sans-serif",
        }}>
          {loading ? "מתחבר..." : "כניסה עם Google"}
        </span>
      </button>

      {error && (
        <p style={{ color: "#FF3366", fontSize: 13, marginTop: 12 }}>{error}</p>
      )}

      <p style={{ color: "#333", fontSize: 11, marginTop: 32, textAlign: "center", maxWidth: 280 }}>
        בכניסה אתה מסכים לתנאי השימוש. הנתונים שלך מאובטחים ב-Firebase.
      </p>
    </div>
  );
}
