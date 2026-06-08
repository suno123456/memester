import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth";
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, updateDoc, increment, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase/config";

const CANDIES = ['🍓','🍊','⭐','🍀','💎','🍇'];
const CANDY_BG = ['#FF4D6D','#FF9500','#FFE600','#4ADE80','#00D4FF','#B44FFF'];
const COLS = 6, ROWS = 3;
const AVATARS = ['🦁','🐯','🦊','🐺','🦄','🐸','🤖','👾','🦸','🧠','🔥','⚡'];

const QS = [
  {q:'מי שר "Blinding Lights"?',s:'פופ עולמי',o:['Drake','The Weeknd','Bieber','Post Malone'],c:1,d:'קל'},
  {q:'באיזה שנה קמה מדינת ישראל?',s:'היסטוריה',o:['1946','1947','1948','1949'],c:2,d:'קל'},
  {q:'כמה עונות יש ל-Friends?',s:'סדרות',o:['8','9','10','11'],c:2,d:'קל'},
  {q:'מי יצרה את ChatGPT?',s:'טכנולוגיה',o:['Google','Meta','OpenAI','Apple'],c:2,d:'קל'},
  {q:'מה הכינוי של תל אביב?',s:'ישראל',o:['עיר הנמל','עיר הלבנה','עיר ללא הפסקה','עיר הגנים'],c:2,d:'קל'},
  {q:'איזו ארץ המציאה סושי?',s:'אוכל',o:['סין','קוריאה','יפן','תאילנד'],c:2,d:'קל'},
  {q:'מי שר "Despacito"?',s:'מוזיקה',o:['Shakira','Bad Bunny','Luis Fonsi','J Balvin'],c:2,d:'קל'},
  {q:'כמה שחקנים בכדורגל?',s:'ספורט',o:['9','10','11','12'],c:2,d:'קל'},
  {q:'מי המציא את הטלפון?',s:'היסטוריה',o:['אדיסון','גרהם בל','טסלה','מרקוני'],c:1,d:'בינוני'},
  {q:'כמה מדינות ב-NBA?',s:'ספורט',o:['1','2','3','4'],c:1,d:'בינוני'},
  {q:'מה הפרי הלאומי של ישראל?',s:'תרבות',o:['תפוז','תמר','זית','רימון'],c:1,d:'בינוני'},
  {q:'מאיזה ארץ נטפליקס?',s:'טכנולוגיה',o:['בריטניה','קנדה','ארה"ב','אוסטרליה'],c:2,d:'קל'},
  {q:'מי כתב "הארי פוטר"?',s:'ספרות',o:['רולד דאל','J.K. Rowling','סטיבן קינג','טולקין'],c:1,d:'קל'},
  {q:'כמה עצמות יש בגוף האדם?',s:'ביולוגיה',o:['156','186','206','226'],c:2,d:'בינוני'},
  {q:'מי ניצח במונדיאל 2022?',s:'כדורגל',o:['ברזיל','צרפת','ארגנטינה','גרמניה'],c:2,d:'קל'},
  {q:'מי מסי לפי אזרחות?',s:'כדורגל',o:['ברזילאי','ארגנטינאי','פורטוגלי','ספרדי'],c:1,d:'קל'},
  {q:'מה שם הנהר הארוך בישראל?',s:'גאוגרפיה',o:['ירקון','ירדן','קישון','אלכסנדר'],c:1,d:'בינוני'},
  {q:'מי המציא הדיסק-און-קי?',s:'ישראל טק',o:['דב מורן','עמוס גל','יצחק לבנה','שי אגסי'],c:0,d:'בינוני'},
  {q:'כמה שחקנים בכדורסל?',s:'ספורט',o:['4','5','6','7'],c:1,d:'קל'},
  {q:'מאיזה שנה אינסטגרם?',s:'טכנולוגיה',o:['2008','2009','2010','2011'],c:2,d:'בינוני'},
];

function mkBoard() {
  return Array.from({length:ROWS}, () =>
    Array.from({length:COLS}, () => Math.floor(Math.random()*CANDIES.length))
  );
}

// ─── Leaderboard helpers ───
function useLeaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "buzzit_scores"), orderBy("score", "desc"), limit(10));
    return onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map((d, i) => ({ id: d.id, rank: i+1, ...d.data() })));
    });
  }, []);

  async function saveScore(uid, name, emoji, score) {
    const ref = doc(db, "buzzit_scores", uid);
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().score || 0) : 0;
    if (score > current) {
      await setDoc(ref, { uid, name, emoji, score, updatedAt: serverTimestamp() });
    }
  }

  return { players, saveScore };
}

// ─── Login Screen ───
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(AVATARS[0]);
  const [step, setStep] = useState(1);

  function handleStart() {
    if (!name.trim()) return;
    onLogin(name.trim(), selectedEmoji);
  }

  return (
    <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',fontFamily:"'Heebo',sans-serif",direction:'rtl'}}>
      <div style={{fontSize:56,fontWeight:900,color:'#fff',letterSpacing:-3,lineHeight:1,marginBottom:4,textAlign:'center'}}>
        BUZZ<span style={{color:'#FFE600'}}>IT</span>
      </div>
      <div style={{color:'#444',fontSize:11,letterSpacing:3,marginBottom:32,textAlign:'center'}}>CANDY MODE</div>

      {step === 1 && (
        <>
          <div style={{fontSize:14,color:'#888',marginBottom:16,fontWeight:800}}>בחר אווטאר</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:28,width:'100%',maxWidth:320}}>
            {AVATARS.map(e => (
              <button key={e} onClick={() => setSelectedEmoji(e)} style={{
                fontSize:28,background:selectedEmoji===e?'rgba(255,230,0,0.15)':'#161616',
                border:`2px solid ${selectedEmoji===e?'#FFE600':'#222'}`,
                borderRadius:12,aspectRatio:'1',cursor:'pointer',transition:'all 0.15s'
              }}>{e}</button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{width:'100%',maxWidth:320,background:'#FFE600',border:'none',borderRadius:14,padding:16,fontSize:18,fontWeight:900,color:'#0D0D0D',cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>
            המשך ←
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{fontSize:48,marginBottom:16}}>{selectedEmoji}</div>
          <div style={{fontSize:14,color:'#888',marginBottom:12,fontWeight:800}}>איך קוראים לך?</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="הכינוי שלך..."
            maxLength={16}
            autoFocus
            style={{
              width:'100%',maxWidth:320,background:'#161616',border:'2px solid #333',
              borderRadius:12,padding:'14px 16px',fontSize:18,fontWeight:800,
              color:'#fff',textAlign:'center',outline:'none',
              fontFamily:"'Heebo',sans-serif",direction:'rtl',marginBottom:16
            }}
          />
          <button
            onClick={handleStart}
            disabled={!name.trim()}
            style={{
              width:'100%',maxWidth:320,
              background:name.trim()?'#FFE600':'#222',
              border:'none',borderRadius:14,padding:16,fontSize:18,fontWeight:900,
              color:name.trim()?'#0D0D0D':'#555',cursor:name.trim()?'pointer':'not-allowed',
              fontFamily:"'Heebo',sans-serif",transition:'all 0.2s'
            }}>
            בואנו! 🎮
          </button>
          <button onClick={() => setStep(1)} style={{marginTop:12,background:'none',border:'none',color:'#555',fontSize:13,cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>
            ← חזור
          </button>
        </>
      )}
    </div>
  );
}

// ─── Board ───
function Board({ board, blasting }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},1fr)`,gap:4,background:'#161616',borderRadius:14,padding:10,marginBottom:12}}>
      {board.map((row,r) => row.map((ci,c) => (
        <div key={`${r}-${c}`} style={{
          width:'100%',aspectRatio:'1',borderRadius:10,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'clamp(14px,4vw,22px)',
          background: CANDY_BG[ci],
          transform: blasting===r ? 'scale(0)' : 'scale(1)',
          opacity: blasting===r ? 0 : 1,
          transition: blasting===r ? 'transform 0.25s,opacity 0.25s' : 'transform 0.2s',
        }}>
          {CANDIES[ci]}
        </div>
      )))}
    </div>
  );
}

// ─── Game Screen ───
function GameScreen({ user, onEnd }) {
  const [board, setBoard] = useState(mkBoard());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [hearts, setHearts] = useState(3);
  const [qi, setQi] = useState(0);
  const [questions] = useState([...QS].sort(() => Math.random() - 0.5));
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [blasting, setBlasting] = useState(null);
  const [results, setResults] = useState([]);
  const [answered, setAnswered] = useState(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(1);
  const heartsRef = useRef(3);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const resultsRef = useRef([]);

  const q = questions[qi];
  const total = Math.min(questions.length, 20);

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [qi]);

  function startTimer() {
    setTimeLeft(8);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 0.1;
      });
    }, 100);
  }

  function handleTimeout() {
    if (locked) return;
    setLocked(true);
    setAnswered({ idx: -1, correct: q.c });
    heartsRef.current = Math.max(0, heartsRef.current - 1);
    setHearts(heartsRef.current);
    comboRef.current = 1; setCombo(1);
    wrongRef.current++; setWrong(w => w+1);
    resultsRef.current.push(false); setResults(r => [...r, false]);
    setFeedback('⏱ פג הזמן!');
    if (heartsRef.current === 0) { setTimeout(() => onEnd({ score: scoreRef.current, correct: correctRef.current, wrong: wrongRef.current, maxCombo: maxCombo, results: resultsRef.current }), 800); return; }
    setTimeout(goNext, 1200);
  }

  function answer(idx) {
    if (locked) return;
    setLocked(true);
    clearInterval(timerRef.current);
    setAnswered({ idx, correct: q.c });

    if (idx === q.c) {
      const bonus = Math.round((timeLeft / 8) * 30);
      const pts = (100 + bonus) * comboRef.current;
      scoreRef.current += pts;
      comboRef.current = Math.min(comboRef.current + 1, 4);
      correctRef.current++;
      const newMax = Math.max(comboRef.current, maxCombo);
      setScore(scoreRef.current); setCombo(comboRef.current); setMaxCombo(newMax); setCorrect(correctRef.current);
      const row = qi % ROWS;
      setBlasting(row);
      setTimeout(() => {
        setBoard(b => { const nb = b.map(r=>[...r]); nb[row] = Array.from({length:COLS},()=>Math.floor(Math.random()*CANDIES.length)); return nb; });
        setBlasting(null);
      }, 300);
      resultsRef.current.push(true); setResults(r => [...r, true]);
      setFeedback(`+${pts}${comboRef.current > 1 ? ` COMBO x${comboRef.current} 🔥` : ' ✓'}`);
    } else {
      heartsRef.current = Math.max(0, heartsRef.current - 1);
      setHearts(heartsRef.current);
      comboRef.current = 1; setCombo(1);
      wrongRef.current++; setWrong(w => w+1);
      resultsRef.current.push(false); setResults(r => [...r, false]);
      setFeedback('טעות! 💔');
      if (heartsRef.current === 0) { setTimeout(() => onEnd({ score: scoreRef.current, correct: correctRef.current, wrong: wrongRef.current, maxCombo, results: resultsRef.current }), 800); return; }
    }
    setTimeout(goNext, 1100);
  }

  function goNext() {
    const nextQi = qi + 1;
    if (nextQi >= total) { onEnd({ score: scoreRef.current, correct: correctRef.current, wrong: wrongRef.current, maxCombo, results: resultsRef.current }); return; }
    setQi(nextQi); setLocked(false); setAnswered(null); setFeedback('');
  }

  const diffC = {קל:'#4ADE80',בינוני:'#FFE600',קשה:'#FF4444'};
  const heartIcons = ['💔','❤️','❤️❤️','❤️❤️❤️'][hearts] || '💔';
  const pct = Math.max(0, timeLeft / 8 * 100);
  const timerColor = pct > 50 ? '#FFE600' : pct > 25 ? '#FF9500' : '#FF4444';

  return (
    <div style={{padding:'14px 16px',maxWidth:480,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:20}}>{heartIcons}</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:24,fontWeight:900,color:'#FFE600',lineHeight:1}}>{score.toLocaleString()}</div>
          <div style={{color:'#444',fontSize:10}}>pts</div>
        </div>
        <div style={{background:'#161616',border:'1px solid #222',borderRadius:20,padding:'4px 12px'}}>
          <span style={{color:'#FFE600',fontSize:15,fontWeight:900}}>x{combo}</span>
        </div>
      </div>

      <div style={{height:5,background:'#1A1A1A',borderRadius:3,marginBottom:12,overflow:'hidden'}}>
        <div style={{height:'100%',background:timerColor,width:`${pct}%`,transition:'width 0.1s linear',borderRadius:3}} />
      </div>

      <Board board={board} blasting={blasting} />

      <div style={{display:'flex',gap:3,justifyContent:'center',marginBottom:12}}>
        {Array.from({length:total},(_,i) => (
          <div key={i} style={{width:14,height:14,borderRadius:3,background: i < qi ? (resultsRef.current[i] ? '#FFE600' : '#FF4444') : '#222'}} />
        ))}
      </div>

      <div style={{background:'#161616',border:'2px solid #222',borderRadius:14,padding:16,textAlign:'center',minHeight:80,display:'flex',flexDirection:'column',justifyContent:'center',marginBottom:12,position:'relative'}}>
        <div style={{position:'absolute',top:10,right:10,fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:20,background:(diffC[q.d]||'#555')+'22',color:diffC[q.d]||'#555'}}>{q.d}</div>
        <div style={{fontSize:q.q.length > 24 ? 14 : q.q.length > 16 ? 16 : 18,fontWeight:900,color:'#fff',lineHeight:1.4,padding:'0 8px'}}>{q.q}</div>
        <div style={{fontSize:11,color:'#555',marginTop:4}}>{q.s}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {q.o.map((opt,i) => {
          let bg='#1E1E1E', border='#333', color='#ccc';
          if (answered) {
            if (i === q.c) { bg='rgba(74,222,128,0.2)'; border='#4ADE80'; color='#4ADE80'; }
            else if (i === answered.idx) { bg='rgba(255,68,68,0.2)'; border='#FF4444'; color='#FF4444'; }
          }
          return (
            <button key={i} onClick={() => answer(i)} disabled={!!answered} style={{background:bg,border:`2px solid ${border}`,borderRadius:12,padding:'12px 8px',fontSize:14,fontWeight:800,color,cursor:answered?'default':'pointer',fontFamily:"'Heebo',sans-serif",transition:'all 0.15s',minHeight:48}}>
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{textAlign:'center',height:24,fontSize:13,marginTop:8,color:feedback.includes('✓')||feedback.includes('🔥')?'#4ADE80':'#FF4444',fontWeight:900}}>
        {feedback}
      </div>
    </div>
  );
}

// ─── Result Screen ───
function ResultScreen({ result, user, onReplay }) {
  const { players, saveScore } = useLeaderboard();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) {
      saveScore(user.uid, user.displayName, user.emoji, result.score);
      setSaved(true);
    }
  }, []);

  const pct = result.correct / Math.max(1, result.correct + result.wrong);
  const emojis = ['😬','😅','😎','🏆'];
  const labels = ['תנסו שוב!','לא רע!','מדהים! 🔥','אלופים! שתפו!'];
  const li = pct < 0.4 ? 0 : pct < 0.65 ? 1 : pct < 0.85 ? 2 : 3;
  const sq = result.results.map(r => r ? '🟨' : '⬛').join('');
  const shareText = `🍬 BUZZIT CANDY 🍬\nניקוד: ${result.score.toLocaleString()}\nנכון: ${result.correct} | מכפיל מקס: x${result.maxCombo}\n${sq}\n\nתשברו את השיא שלי? 🔥\nbuzzit-game.vercel.app`;

  return (
    <div style={{padding:'24px 16px',maxWidth:480,margin:'0 auto',textAlign:'center',fontFamily:"'Heebo',sans-serif",direction:'rtl'}}>
      <div style={{fontSize:52,marginBottom:8}}>{emojis[li]}</div>
      <div style={{fontSize:56,fontWeight:900,color:'#FFE600',letterSpacing:-3,lineHeight:1,marginBottom:4}}>{result.score.toLocaleString()}</div>
      <div style={{color:'#666',fontSize:14,marginBottom:18}}>{labels[li]}</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        <div style={{background:'#161616',border:'1px solid #222',borderRadius:12,padding:12}}><div style={{color:'#4ADE80',fontSize:20,fontWeight:900}}>{result.correct}</div><div style={{color:'#444',fontSize:10,fontWeight:800}}>נכון</div></div>
        <div style={{background:'#161616',border:'1px solid #222',borderRadius:12,padding:12}}><div style={{color:'#FF4444',fontSize:20,fontWeight:900}}>{result.wrong}</div><div style={{color:'#444',fontSize:10,fontWeight:800}}>טעות</div></div>
        <div style={{background:'#161616',border:'1px solid #222',borderRadius:12,padding:12}}><div style={{color:'#FFE600',fontSize:20,fontWeight:900}}>x{result.maxCombo}</div><div style={{color:'#444',fontSize:10,fontWeight:800}}>מכפיל מקס</div></div>
      </div>

      <div style={{background:'#161616',border:'1px solid #222',borderRadius:14,padding:14,fontSize:12,color:'#555',fontFamily:'monospace',lineHeight:2,textAlign:'right',marginBottom:14,whiteSpace:'pre'}}>
        {shareText}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
        <button onClick={() => {
          // Safari-safe copy
          try {
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(shareText);
            } else {
              const ta = document.createElement('textarea');
              ta.value = shareText;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.focus(); ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
            }
          } catch {}
        }} style={{background:'#FFE600',border:'none',borderRadius:12,padding:14,fontSize:13,fontWeight:900,color:'#0D0D0D',cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>העתק לטיקטוק</button>
        <button onClick={onReplay} style={{background:'#161616',border:'2px solid #222',borderRadius:12,padding:14,fontSize:13,fontWeight:900,color:'#fff',cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>שחק שוב</button>
      </div>

      <div style={{color:'#444',fontSize:11,fontWeight:800,marginBottom:10,textAlign:'right'}}>לידר בורד עולמי 🌍</div>
      {players.map((p,i) => {
        const isMe = p.uid === user.uid;
        return (
          <div key={p.id||i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'#161616',border:`1px solid ${isMe?'#FFE60033':'#1E1E1E'}`,borderRadius:10,marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{color:'#444',fontSize:12,fontWeight:800}}>{['🥇','🥈','🥉'][i]||`#${i+1}`}</span>
              <span style={{fontSize:20}}>{p.emoji||'🎮'}</span>
              <span style={{color:isMe?'#FFE600':'#888',fontSize:13,fontWeight:800}}>{isMe?`⭐ ${p.name}`:p.name}</span>
            </div>
            <span style={{color:'#FFE600',fontWeight:900,fontSize:14}}>{(p.score||0).toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Home Screen ───
function HomeScreen({ user, onPlay, onLogout }) {
  const { players } = useLeaderboard();
  const myRank = players.findIndex(p => p.uid === user.uid) + 1;
  const myBest = players.find(p => p.uid === user.uid)?.score || 0;

  return (
    <div style={{padding:'24px 16px',maxWidth:480,margin:'0 auto',textAlign:'center',fontFamily:"'Heebo',sans-serif",direction:'rtl'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:28}}>{user.emoji||'🎮'}</span>
          <span style={{color:'#888',fontSize:13,fontWeight:800}}>{user.displayName}</span>
        </div>
        <button onClick={onLogout} style={{background:'#161616',border:'1px solid #222',borderRadius:20,padding:'4px 12px',color:'#555',fontSize:12,cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>החלף שם</button>
      </div>

      <div style={{fontSize:52,fontWeight:900,color:'#fff',letterSpacing:-3,lineHeight:1,marginBottom:2}}>BUZZ<span style={{color:'#FFE600'}}>IT</span></div>
      <div style={{color:'#444',fontSize:11,letterSpacing:3,marginBottom:20}}>CANDY MODE</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,background:'#161616',borderRadius:14,padding:10,marginBottom:20}}>
        {Array.from({length:18},(_,i) => {
          const ci = i % CANDIES.length;
          return <div key={i} style={{aspectRatio:'1',borderRadius:8,background:CANDY_BG[ci],display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{CANDIES[ci]}</div>;
        })}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
        <div style={{background:'#161616',border:'1px solid #222',borderRadius:14,padding:14}}>
          <div style={{color:'#FFE600',fontSize:22,fontWeight:900}}>{myBest.toLocaleString()}</div>
          <div style={{color:'#444',fontSize:11,fontWeight:800}}>השיא שלי</div>
        </div>
        <div style={{background:'#161616',border:'1px solid #222',borderRadius:14,padding:14}}>
          <div style={{color:'#fff',fontSize:22,fontWeight:900}}>{myRank > 0 ? `#${myRank}` : '-'}</div>
          <div style={{color:'#444',fontSize:11,fontWeight:800}}>דירוג עולמי</div>
        </div>
      </div>

      <button onClick={onPlay} style={{width:'100%',background:'#FFE600',border:'none',borderRadius:14,padding:18,fontSize:20,fontWeight:900,color:'#0D0D0D',cursor:'pointer',fontFamily:"'Heebo',sans-serif",marginBottom:16}}>
        PLAY NOW ▶
      </button>

      <div style={{color:'#444',fontSize:11,fontWeight:800,marginBottom:10,textAlign:'right'}}>לידר בורד עולמי 🌍</div>
      {players.slice(0,5).map((p,i) => {
        const isMe = p.uid === user.uid;
        return (
          <div key={p.id||i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'#161616',border:`1px solid ${isMe?'#FFE60033':'#1E1E1E'}`,borderRadius:10,marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{color:'#444',fontSize:12,fontWeight:800}}>{['🥇','🥈','🥉'][i]||`#${i+1}`}</span>
              <span style={{fontSize:20}}>{p.emoji||'🎮'}</span>
              <span style={{color:isMe?'#FFE600':'#888',fontSize:13,fontWeight:800}}>{isMe?`⭐ ${p.name}`:p.name}</span>
            </div>
            <span style={{color:'#FFE600',fontWeight:900}}>{(p.score||0).toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── App Root ───
export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [screen, setScreen] = useState('home');
  const [lastResult, setLastResult] = useState(null);

  if (loading) return <div style={{minHeight:'100vh',background:'#0D0D0D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>🍬</div>;
  if (!user) return <LoginScreen onLogin={login} />;

  return (
    <div style={{minHeight:'100vh',background:'#0D0D0D'}}>
      {screen === 'home' && <HomeScreen user={user} onPlay={() => setScreen('game')} onLogout={logout} />}
      {screen === 'game' && <GameScreen user={user} onEnd={(r) => { setLastResult(r); setScreen('result'); }} />}
      {screen === 'result' && <ResultScreen result={lastResult} user={user} onReplay={() => setScreen('game')} />}
    </div>
  );
}
