import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useMemes } from "./hooks/useMemes";
import { useLeaderboard } from "./hooks/useLeaderboard";
import LoginScreen from "./components/LoginScreen";

// ─── Constants ───────────────────────────────────────────────────
const STICKERS = ["😂","🔥","💀","🤣","😭","🤯","👀","💯","🫡","🤌","🫠","💸","🚀","👑","🎯","⚡","🧨","🥶","😤","🫶"];
const FONTS = [
  { name: "Impact", label: "IMPACT" },
  { name: "Comic Sans MS", label: "Comic" },
  { name: "Arial Black", label: "Bold" },
  { name: "Courier New", label: "Mono" },
  { name: "Georgia", label: "Serif" },
];
const COLORS = ["#FFFFFF","#FFD700","#FF3366","#00FF88","#FF6B00","#00CFFF","#FF00FF","#FFFF00"];
const BG_IMAGES = [
  { id: 1, url: "https://picsum.photos/seed/meme1/600/400", label: "🌄 נוף" },
  { id: 2, url: "https://picsum.photos/seed/meme2/600/400", label: "🌆 עיר" },
  { id: 3, url: "https://picsum.photos/seed/meme3/600/400", label: "🐕 כלב" },
  { id: 4, url: "https://picsum.photos/seed/meme4/600/400", label: "🌊 ים" },
  { id: 5, url: "https://picsum.photos/seed/meme5/600/400", label: "🏔️ הרים" },
  { id: 6, url: "https://picsum.photos/seed/meme6/600/400", label: "🌃 לילה" },
];
const PROMPTS = [
  "כשאתה מגיע לעבודה אחרי חג ארוך 😅",
  "אמא שמה לחם בקופסת האוכל שוב",
  "כשהבוס שואל למה הפרויקט עדיין לא מוכן",
  "אני בדיאטה vs הפיצה שמסתכלת עליי",
  "כשהחבר אומר 'זה קרוב, 5 דקות נסיעה'",
  "מה שציפיתי vs מה שקיבלתי",
  "כשאתה גולל אינסטגרם בשעה 3 בלילה",
];

function timeAgo(date) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `לפני ${diff} שניות`;
  if (diff < 3600) return `לפני ${Math.floor(diff/60)} דקות`;
  if (diff < 86400) return `לפני ${Math.floor(diff/3600)} שעות`;
  return `לפני ${Math.floor(diff/86400)} ימים`;
}

// ─── MemePreview ─────────────────────────────────────────────────
function MemePreview({ bgUrl, topText, bottomText, stickers, font, topColor, bottomColor, style = {} }) {
  return (
    <div style={{ position:"relative", width:"100%", aspectRatio:"3/2", borderRadius:12, overflow:"hidden", background:"#111", ...style }}>
      {bgUrl && <img src={bgUrl} alt="bg" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.25)" }} />
      {topText && (
        <div style={{ position:"absolute", top:12, left:0, right:0, textAlign:"center", fontFamily:font, fontWeight:900, fontSize:"clamp(16px,4vw,28px)", color:topColor, textShadow:"2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000", padding:"0 12px", lineHeight:1.2 }}>
          {topText}
        </div>
      )}
      {stickers && stickers.map(s => (
        <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, fontSize:32, transform:"translate(-50%,-50%)", userSelect:"none", filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
          {s.emoji}
        </div>
      ))}
      {bottomText && (
        <div style={{ position:"absolute", bottom:12, left:0, right:0, textAlign:"center", fontFamily:font, fontWeight:900, fontSize:"clamp(16px,4vw,28px)", color:bottomColor, textShadow:"2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000", padding:"0 12px", lineHeight:1.2 }}>
          {bottomText}
        </div>
      )}
    </div>
  );
}

// ─── FeedCard ────────────────────────────────────────────────────
function FeedCard({ meme, onLike, onFire }) {
  const [liked, setLiked] = useState(false);
  const [fired, setFired] = useState(false);
  const [boom, setBoom] = useState(false);

  function handleLike() { if (liked) return; setLiked(true); onLike(); }
  function handleFire() {
    if (fired) return;
    setFired(true); setBoom(true);
    setTimeout(() => setBoom(false), 600);
    onFire();
  }

  const initials = meme.authorName?.charAt(0) || "?";

  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, overflow:"hidden", marginBottom:20, position:"relative", animation:"slideUp 0.4s ease" }}>
      {meme.viral && (
        <div style={{ position:"absolute", top:14, right:14, zIndex:2, background:"linear-gradient(135deg,#FF3366,#FF6B00)", color:"#fff", fontWeight:800, fontSize:11, padding:"4px 10px", borderRadius:20, letterSpacing:1, textTransform:"uppercase", boxShadow:"0 0 20px rgba(255,51,102,0.5)" }}>
          🔥 VIRAL
        </div>
      )}

      {/* Author */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px 10px" }}>
        {meme.authorPhoto
          ? <img src={meme.authorPhoto} style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover" }} alt="" />
          : <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#FF3366,#FF6B00)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:16 }}>{initials}</div>
        }
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>@{meme.authorName || "אנונימי"}</div>
          <div style={{ color:"#666", fontSize:11 }}>{timeAgo(meme.createdAt)}</div>
        </div>
      </div>

      {/* Image */}
      <div style={{ position:"relative" }}>
        <img src={meme.bgUrl} alt="meme" style={{ width:"100%", display:"block", maxHeight:280, objectFit:"cover" }} />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.2)" }} />
        {meme.topText && <div style={{ position:"absolute", top:12, left:0, right:0, textAlign:"center", fontFamily:"Impact", fontWeight:900, fontSize:22, color:"#fff", textShadow:"2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000", padding:"0 12px" }}>{meme.topText}</div>}
        {meme.bottomText && <div style={{ position:"absolute", bottom:12, left:0, right:0, textAlign:"center", fontFamily:"Impact", fontWeight:900, fontSize:22, color:"#FFD700", textShadow:"2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000", padding:"0 12px" }}>{meme.bottomText}</div>}
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:8, padding:"12px 16px" }}>
        <button onClick={handleLike} style={{ background:liked?"rgba(255,51,102,0.2)":"rgba(255,255,255,0.06)", border:liked?"1px solid #FF3366":"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", color:liked?"#FF3366":"#aaa", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>
          ❤️ {(meme.likes||0) + (liked?1:0)}
        </button>
        <button onClick={handleFire} style={{ background:fired?"rgba(255,107,0,0.2)":"rgba(255,255,255,0.06)", border:fired?"1px solid #FF6B00":"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", color:fired?"#FF6B00":"#aaa", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s", transform:boom?"scale(1.3)":"scale(1)" }}>
          🔥 {(meme.fire||0) + (fired?1:0)}
        </button>
        <button style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", color:"#aaa", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          💬 {meme.comments||0}
        </button>
      </div>
    </div>
  );
}

// ─── CreatorScreen ────────────────────────────────────────────────
function CreatorScreen({ user, onPublish }) {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [selectedBg, setSelectedBg] = useState(BG_IMAGES[0]);
  const [stickers, setStickers] = useState([]);
  const [font, setFont] = useState("Impact");
  const [topColor, setTopColor] = useState("#FFFFFF");
  const [bottomColor, setBottomColor] = useState("#FFD700");
  const [tab, setTab] = useState("text");
  const [timer, setTimer] = useState(15);
  const [running, setRunning] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Timer
  useState(() => {
    if (!running || timer === 0) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  });

  function addSticker(emoji) {
    setStickers(prev => [...prev, { id: Math.random().toString(36).slice(2), emoji, x: 30 + Math.random()*40, y: 30 + Math.random()*40 }]);
  }

  async function getAiBoost() {
    setAiLoading(true);
    setAiSuggestion("");
    try {
      const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `אתה מחולל מימסים ישראלי מצחיק. תן לי שורה קצרה ומצחיקה לחלק העליון ושורה לתחתון.
הנושא: "${prompt}"
החזר רק JSON בלי שום טקסט נוסף:
{"top": "...", "bottom": "..."}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setTopText(parsed.top || "");
      setBottomText(parsed.bottom || "");
      setAiSuggestion(prompt);
    } catch {
      setAiSuggestion("נסה שוב 🙂");
    }
    setAiLoading(false);
  }

  async function handlePublish() {
    if (!topText && !bottomText) return;
    setPublishing(true);
    await onPublish({
      topText, bottomText,
      bgUrl: selectedBg.url,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      authorUid: user.uid,
    });
    setTopText(""); setBottomText(""); setStickers([]);
    setPublishing(false);
  }

  const timerColor = timer > 8 ? "#00FF88" : timer > 4 ? "#FFD700" : "#FF3366";
  const canPublish = (topText || bottomText) && !publishing;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>✏️ צור מימם</div>
        {running
          ? <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid ${timerColor}`, display:"flex", alignItems:"center", justifyContent:"center", color:timerColor, fontWeight:900, fontSize:18, boxShadow:`0 0 12px ${timerColor}44` }}>{timer}</div>
          : <button onClick={() => { setTimer(15); setRunning(true); }} style={{ background:"linear-gradient(135deg,#00FF88,#00CFFF)", border:"none", borderRadius:20, padding:"8px 16px", color:"#000", fontWeight:800, fontSize:13, cursor:"pointer" }}>⏱ 15 שניות</button>
        }
      </div>

      <button onClick={getAiBoost} disabled={aiLoading} style={{ width:"100%", marginBottom:14, background:aiLoading?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#7B2FBE,#FF3366)", border:"none", borderRadius:14, padding:"12px 0", color:"#fff", fontWeight:800, fontSize:15, cursor:aiLoading?"not-allowed":"pointer", boxShadow:aiLoading?"none":"0 0 24px rgba(255,51,102,0.3)", transition:"all 0.3s" }}>
        {aiLoading ? "⚡ AI חושב..." : "⚡ AI Boost – תן לי רעיון!"}
      </button>
      {aiSuggestion && (
        <div style={{ background:"rgba(123,47,190,0.15)", border:"1px solid rgba(123,47,190,0.3)", borderRadius:10, padding:"8px 12px", marginBottom:12, color:"#C084FC", fontSize:12 }}>
          💡 נושא: {aiSuggestion}
        </div>
      )}

      <MemePreview bgUrl={selectedBg.url} topText={topText} bottomText={bottomText} stickers={stickers} font={font} topColor={topColor} bottomColor={bottomColor} style={{ marginBottom:16, boxShadow:"0 0 30px rgba(0,0,0,0.6)" }} />

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[["text","📝 טקסט"],["stickers","😂 סטיקרים"],["bg","🖼 רקע"],["style","🎨 סטייל"]].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex:1, padding:"8px 4px", background:tab===key?"rgba(255,51,102,0.25)":"rgba(255,255,255,0.05)", border:tab===key?"1px solid #FF3366":"1px solid rgba(255,255,255,0.08)", borderRadius:10, color:tab===key?"#FF3366":"#888", fontWeight:700, fontSize:11, cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "text" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input value={topText} onChange={e => setTopText(e.target.value)} placeholder="טקסט עליון..." maxLength={60} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"12px 14px", color:"#fff", fontFamily:font, fontWeight:700, fontSize:15, outline:"none", direction:"rtl" }} />
          <input value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="טקסט תחתון..." maxLength={60} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"12px 14px", color:"#fff", fontFamily:font, fontWeight:700, fontSize:15, outline:"none", direction:"rtl" }} />
        </div>
      )}

      {tab === "stickers" && (
        <div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
            {STICKERS.map(e => (
              <button key={e} onClick={() => addSticker(e)} style={{ fontSize:28, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, width:50, height:50, cursor:"pointer" }}>{e}</button>
            ))}
          </div>
          {stickers.length > 0 && <button onClick={() => setStickers(p => p.slice(0,-1))} style={{ background:"rgba(255,51,102,0.15)", border:"1px solid rgba(255,51,102,0.3)", borderRadius:8, padding:"6px 14px", color:"#FF3366", fontWeight:700, fontSize:12, cursor:"pointer" }}>↩ הסר אחרון</button>}
        </div>
      )}

      {tab === "bg" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {BG_IMAGES.map(bg => (
            <div key={bg.id} onClick={() => setSelectedBg(bg)} style={{ borderRadius:10, overflow:"hidden", cursor:"pointer", border:selectedBg.id===bg.id?"2px solid #FF3366":"2px solid transparent", boxShadow:selectedBg.id===bg.id?"0 0 14px rgba(255,51,102,0.5)":"none" }}>
              <img src={bg.url} alt={bg.label} style={{ width:"100%", height:70, objectFit:"cover", display:"block" }} />
              <div style={{ background:"#111", textAlign:"center", fontSize:11, color:"#aaa", padding:"4px 0" }}>{bg.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "style" && (
        <div>
          <div style={{ color:"#888", fontSize:12, marginBottom:8 }}>פונט</div>
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {FONTS.map(f => (
              <button key={f.name} onClick={() => setFont(f.name)} style={{ background:font===f.name?"rgba(255,51,102,0.2)":"rgba(255,255,255,0.06)", border:font===f.name?"1px solid #FF3366":"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px", color:font===f.name?"#FF3366":"#aaa", fontFamily:f.name, fontWeight:700, fontSize:13, cursor:"pointer" }}>{f.label}</button>
            ))}
          </div>
          <div style={{ color:"#888", fontSize:12, marginBottom:8 }}>צבע עליון</div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {COLORS.map(c => <div key={c} onClick={() => setTopColor(c)} style={{ width:28, height:28, borderRadius:"50%", background:c, cursor:"pointer", border:topColor===c?"3px solid #fff":"2px solid rgba(255,255,255,0.2)" }} />)}
          </div>
          <div style={{ color:"#888", fontSize:12, marginBottom:8 }}>צבע תחתון</div>
          <div style={{ display:"flex", gap:6 }}>
            {COLORS.map(c => <div key={c} onClick={() => setBottomColor(c)} style={{ width:28, height:28, borderRadius:"50%", background:c, cursor:"pointer", border:bottomColor===c?"3px solid #fff":"2px solid rgba(255,255,255,0.2)" }} />)}
          </div>
        </div>
      )}

      <button onClick={handlePublish} disabled={!canPublish} style={{ width:"100%", marginTop:20, background:canPublish?"linear-gradient(135deg,#FF3366,#FF6B00)":"rgba(255,255,255,0.05)", border:"none", borderRadius:14, padding:"14px 0", color:canPublish?"#fff":"#444", fontWeight:900, fontSize:17, cursor:canPublish?"pointer":"not-allowed", boxShadow:canPublish?"0 0 30px rgba(255,51,102,0.4)":"none", transition:"all 0.3s" }}>
        {publishing ? "מפרסם..." : "🚀 פרסם לפייד הוויראלי"}
      </button>
    </div>
  );
}

// ─── FeedScreen ───────────────────────────────────────────────────
function FeedScreen({ memes, loading, onLike, onFire }) {
  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0", color:"#555" }}>
      <div style={{ fontSize:36, marginBottom:12, animation:"pulse 1s infinite" }}>🔥</div>
      <div style={{ fontSize:14 }}>טוען מימסים...</div>
    </div>
  );
  if (memes.length === 0) return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:"#555" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>😶</div>
      <div style={{ fontSize:16, fontWeight:700 }}>הפייד ריק</div>
      <div style={{ fontSize:13, marginTop:8 }}>היה הראשון לפרסם מימם!</div>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>🔥 פייד ויראלי</div>
        <div style={{ background:"rgba(255,51,102,0.15)", border:"1px solid rgba(255,51,102,0.3)", borderRadius:20, padding:"4px 12px", color:"#FF3366", fontSize:12, fontWeight:700 }}>LIVE ●</div>
      </div>
      {memes.map(m => (
        <FeedCard key={m.id} meme={m} onLike={() => onLike(m.id)} onFire={() => onFire(m.id, m.authorUid)} />
      ))}
    </div>
  );
}

// ─── LeaderboardScreen ────────────────────────────────────────────
function LeaderboardScreen({ players, loading, currentUid }) {
  const badges = ["🥇","🥈","🥉"];
  if (loading) return <div style={{ color:"#555", textAlign:"center", padding:40 }}>טוען...</div>;
  return (
    <div>
      <div style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:16 }}>🏆 לוח המובילים</div>
      {players.map(p => {
        const isMe = p.uid === currentUid;
        return (
          <div key={p.uid} style={{ display:"flex", alignItems:"center", gap:12, background:isMe?"rgba(255,51,102,0.1)":"rgba(255,255,255,0.03)", border:isMe?"1px solid rgba(255,51,102,0.3)":"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 14px", marginBottom:8 }}>
            <div style={{ width:28, textAlign:"center", fontWeight:900, color:p.rank<=3?"#FFD700":"#666", fontSize:p.rank<=3?18:14 }}>
              {badges[p.rank-1] || `#${p.rank}`}
            </div>
            {p.photoURL
              ? <img src={p.photoURL} style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover" }} alt="" />
              : <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#FF3366,#FF6B00)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff" }}>{p.displayName?.charAt(0)||"?"}</div>
            }
            <div style={{ flex:1 }}>
              <div style={{ color:isMe?"#FF3366":"#fff", fontWeight:700, fontSize:14 }}>
                {isMe ? `⭐ ${p.displayName} (אתה)` : p.displayName || "אנונימי"}
              </div>
              <div style={{ color:"#555", fontSize:11 }}>{p.memesCreated||0} מימסים</div>
            </div>
            <div style={{ color:"#FFD700", fontWeight:800, fontSize:14 }}>{(p.score||0).toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { memes, loading: memesLoading, publishMeme, likeMeme, fireMeme } = useMemes();
  const { players, loading: lbLoading } = useLeaderboard();
  const [tab, setTab] = useState("feed");
  const [showBoom, setShowBoom] = useState(false);

  async function handlePublish(data) {
    await publishMeme(data);
    setTab("feed");
    setShowBoom(true);
    setTimeout(() => setShowBoom(false), 2500);
  }

  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#FF3366", fontSize:32, animation:"pulse 1s infinite" }}>🔥</div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={loginWithGoogle} />;

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", fontFamily:"'Heebo', sans-serif", direction:"rtl" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes boomIn { 0% { opacity:0; transform:translate(-50%,-50%) scale(0.5); } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.1); } 80% { opacity:1; transform:translate(-50%,-50%) scale(1); } 100% { opacity:0; transform:translate(-50%,-50%) scale(0.8); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        * { box-sizing:border-box; }
        input::placeholder { color:#555; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#111; }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
      `}</style>

      {showBoom && (
        <div style={{ position:"fixed", top:"40%", left:"50%", transform:"translate(-50%,-50%)", zIndex:9999, pointerEvents:"none", animation:"boomIn 2.5s ease forwards", textAlign:"center" }}>
          <div style={{ fontSize:72 }}>💥</div>
          <div style={{ color:"#FF3366", fontWeight:900, fontSize:28, textShadow:"0 0 30px rgba(255,51,102,0.8)", whiteSpace:"nowrap" }}>המימם עלה לאוויר!</div>
        </div>
      )}

      {/* Top Bar */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ background:"linear-gradient(135deg,#FF3366,#FF6B00)", borderRadius:10, padding:"4px 10px", color:"#fff", fontWeight:900, fontSize:18, letterSpacing:-1 }}>M</div>
          <div style={{ color:"#fff", fontWeight:900, fontSize:20, letterSpacing:-0.5 }}>MEMESTER</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user.photoURL
            ? <img src={user.photoURL} style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", cursor:"pointer" }} alt="" onClick={logout} title="יציאה" />
            : <div onClick={logout} title="יציאה" style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FF3366,#FF6B00)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontWeight:900, color:"#fff" }}>{user.displayName?.charAt(0)}</div>
          }
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 100px" }}>
        {tab === "feed" && <FeedScreen memes={memes} loading={memesLoading} onLike={likeMeme} onFire={fireMeme} />}
        {tab === "create" && <CreatorScreen user={user} onPublish={handlePublish} />}
        {tab === "leaderboard" && <LeaderboardScreen players={players} loading={lbLoading} currentUid={user.uid} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(10,10,10,0.97)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", padding:"0 8px 8px", zIndex:100 }}>
        {[["feed","🏠","פייד"],["create","➕","צור"],["leaderboard","🏆","דירוג"]].map(([key,icon,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex:1, padding:"10px 0", background:key==="create"?"linear-gradient(135deg,#FF3366,#FF6B00)":"transparent", border:"none", borderRadius:key==="create"?14:0, margin:key==="create"?"6px 10px 0":0, color:tab===key?(key==="create"?"#fff":"#FF3366"):"#555", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"all 0.2s" }}>
            <span style={{ fontSize:key==="create"?22:20 }}>{icon}</span>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:0.5 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
