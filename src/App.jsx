import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const WRITINGS = [
  {
    id: "systems-outlive-builders",
    date: "7 Mar 2026",
    title: "On building systems that outlive their builders",
    tag: "systems",
    likes: 24,
    body: `Every system I've designed carries an assumption about the future that I can't verify. A tax compliance engine assumes regulations will evolve in certain directions. A document pipeline assumes the shape of human attention will stay roughly constant. An ingestion architecture assumes that the data flowing through it tomorrow will rhyme with the data flowing through it today.

None of these assumptions are safe. And yet — you have to make them. That's the paradox of systems work. You're building for a future you cannot see, using materials forged in a present you only partially understand.

The honest response isn't to pretend you've figured it out. It's to build the seams visible. Make the joints obvious. Document not just what you decided, but what you assumed — so the next person who inherits this thing knows exactly where the load-bearing beliefs are, and where to push when the world shifts beneath them.

I think about this a lot when I watch teams build software. The best systems aren't the cleverest ones. They're the ones that are easiest to be wrong in — where failure is cheap, visible, and instructive. That's a design philosophy, but it's also, I think, a philosophy of living.`,
  },
  {
    id: "gap-knowing-understanding",
    date: "22 Feb 2026",
    title: "The gap between knowing and understanding",
    tag: "ai",
    likes: 41,
    body: `AI can surface every GST filing rule in milliseconds. It can cross-reference a hundred returns, flag discrepancies, generate reports that would take a human team days. I build these systems. I believe in them.

But here's what keeps me honest: understanding why a particular CFO hesitates before signing a compliance report — that's a different kind of intelligence entirely. It lives in context, in history, in the unspoken politics of an organisation. No embedding captures it. No retrieval system fetches it.

I keep returning to this gap because I think it's where the most interesting work in AI actually lives. Not in making models bigger or faster — though that matters — but in designing the seams between what machines know and what humans understand. The interface layer. The translation zone.

When I write a report for a CFO, I'm not just presenting data. I'm constructing a narrative that respects what they already know, fills in what they don't, and — this is the hard part — doesn't make them feel like the machine is smarter than they are. Because it isn't. It's faster. That's different.

The companies that will win in AI aren't the ones with the best models. They're the ones that understand this gap and build bridges across it — with humility, with design, with language that treats the human on the other side as a partner, not a consumer.`,
  },
  {
    id: "small-observations-large-datasets",
    date: "14 Feb 2026",
    title: "Small observations from large datasets",
    tag: "observation",
    likes: 33,
    body: `Spent the morning staring at compliance patterns across two hundred companies. When you look at enough data, something strange happens — the numbers stop being numbers and start being stories.

A missed filing in Q3 is almost never a careless mistake. Trace it back and you'll find a human event: a key person left the team, a system migration ate three weeks, a leadership change reshuffled priorities. The data records the absence, but the absence is always a shadow of something real.

I think this is what people miss about working with data at scale. They think the point is to find patterns. It is — but the interesting patterns are almost never the ones the dashboard surfaces. The interesting patterns are the ones that resist categorisation. The outlier that doesn't fit. The company that's compliant in every dimension except one, and that one exception tells you more about their organisation than everything else combined.

Data doesn't lie, but it omits constantly. And what it omits is usually the thing that matters most. This is why I think the future of analytics isn't more automation — it's better questions. Machines can count. Humans can wonder. The art is in connecting the two without letting either dominate.

Every time I build a report, I try to leave room for the reader's own intelligence. Show enough to orient them, hide nothing, but don't interpret everything for them. Respect the gap.`,
  },
  {
    id: "philosophy-product-decisions",
    date: "3 Jan 2026",
    title: "What philosophy taught me about product decisions",
    tag: "philosophy",
    likes: 57,
    body: `First principles thinking isn't a Silicon Valley invention. It's Aristotle. It's Nagarjuna dismantling assumptions in second-century India. It's every intellectual tradition that dared to ask: what remains when you strip away everything you merely believe?

In product work, I find this question uncomfortable and essential. You sit in a room where everyone agrees on the roadmap, and you ask — but why this feature? Why now? Why for this user? And if you follow the thread honestly, you often end up somewhere simpler and more uncomfortable than where you started.

Most product decisions aren't hard because the options are bad. They're hard because the good options require you to admit something inconvenient — that you don't have enough data, that the user doesn't want what you assumed, that the technically elegant solution isn't the one that ships.

Philosophy taught me to sit with that discomfort instead of rushing past it. To hold two contradictory ideas without forcing a resolution. To trust that clarity comes from patience, not from speed.

I also think there's something deeply philosophical about building products for other people. You're making bets about human behaviour with incomplete information, on a timeline that doesn't forgive hesitation. It's Kierkegaard's leap — but with sprint cycles. And the honest product thinker admits they're leaping, even when the Jira ticket makes it look like a straight line.`,
  },
  {
    id: "honesty-incomplete-things",
    date: "28 Dec 2025",
    title: "The honesty of incomplete things",
    tag: "life",
    likes: 68,
    body: `I used to wait until something was perfect before sharing it. A document had to be airtight. An idea fully formed. A piece of writing polished to the point where no one could find a crack in it.

That instinct comes from a good place — respect for the reader, for the audience, for the craft. But somewhere along the way, I realised it was also a form of hiding. If you only show finished things, no one sees how you think. They see what you've concluded. And conclusions, divorced from the mess that produced them, are oddly lifeless.

Now I try to share things mid-thought. Not carelessly — there's a difference between incomplete and sloppy. An incomplete thing can still be clear about what it knows, honest about what it doesn't, and generous enough to let the reader finish the thought in their own direction.

I think the best writing, the best products, the best conversations all share this quality. They don't close every door. They leave room. Not because the author was lazy, but because they trusted the person on the other end enough to leave the last mile unwalked.

This blog is an exercise in that trust. These pieces are not finished thoughts. They're observations — caught mid-flight, pinned gently to the page, still twitching with possibility. If something here makes you think further than I did, then it worked.`,
  },
];

const PORTFOLIO = [
  {
    id: "p1", title: "AI-Powered GST Compliance Reporting", role: "Product Lead", company: "ClearTax", period: "2025 – Present",
    tags: ["AI/ML", "Enterprise", "Compliance"],
    summary: "Designed and shipped an AI-driven compliance reporting system serving enterprise CFOs and tax teams. Built a multi-agent pipeline that generates dual-audience HTML reports — executive summaries free of jargon for CFOs, and granular technical breakdowns for tax practitioners.",
    impact: "Reduced report generation from 3 days to 45 minutes. Adopted by Fortune 500 clients across multiple GSTINs.",
    insight: "The hardest problem wasn't technical — it was designing AI output that respected the reader's intelligence instead of overwhelming them with data.",
  },
  {
    id: "p2", title: "Purchase Ingestion & Document Lifecycle Redesign", role: "Product Architect", company: "ClearTax", period: "2025",
    tags: ["Architecture", "Systems Design", "Enterprise"],
    summary: "Led a from-scratch redesign of ClearTax's purchase document management system. Converged on a 2-ID matching architecture with dual-hash change detection, binary filing locks, and a customer badge system for post-filing modifications.",
    impact: "Eliminated duplicate document conflicts across 200+ enterprise accounts. Reduced filing errors by 40%.",
    insight: "The key decision was choosing visible seams over clever abstractions — making the system's assumptions explicit so teams could debug reality, not just code.",
  },
  {
    id: "p3", title: "Enterprise Customer Health & Renewal Intelligence", role: "Product Manager", company: "ClearTax", period: "2024 – 2025",
    tags: ["Analytics", "Customer Success", "GTM"],
    summary: "Built an analytical layer mapping opt-in status, data availability, and engagement signals across the enterprise customer base. Created actionable dashboards that armed Account Managers and CSMs with renewal intelligence.",
    impact: "Improved renewal conversation quality. Identified at-risk accounts 6 weeks earlier than previous process.",
    insight: "Data only becomes intelligence when it's shaped for the person who needs to act on it. A dashboard nobody opens is just a database with a UI.",
  },
  {
    id: "p4", title: "CFO Narrative Framework for Indian Tax Compliance", role: "Product Strategist", company: "ClearTax", period: "2025",
    tags: ["Strategy", "Content", "Executive Communication"],
    summary: "Authored an intellectual framework reframing GST compliance as a strategic system for Indian Fortune 500 CFOs. Grounded in the full domestic tax ecosystem — GST, Income Tax, TDS, MCA cross-referencing.",
    impact: "Adopted as ClearTax's enterprise positioning narrative. Used in C-suite conversations across 15+ accounts.",
    insight: "CFOs don't want to be told about compliance. They want to be shown how compliance connects to the decisions that keep them up at night.",
  },
];

const TAGS = ["all", "ai", "philosophy", "systems", "observation", "life"];
const THINKING_ABOUT = [
  "whether compliance can be beautiful",
  "the ethics of automated decisions",
  "what Wittgenstein would say about product specs",
  "how silence shapes better systems",
  "the courage in saying 'I don't know'",
  "edges where data ends and intuition begins",
];

const ARTICLE_IDX = Object.fromEntries(WRITINGS.map((w, i) => [w.id, i]));
const TAG_POS = {
  systems:     { x: 0.50, y: 0.18 },
  ai:          { x: 0.20, y: 0.45 },
  observation: { x: 0.60, y: 0.62 },
  philosophy:  { x: 0.82, y: 0.38 },
  life:        { x: 0.35, y: 0.78 },
};
function loadConst() {
  try {
    const r = localStorage.getItem("ck");
    if (!r) return WRITINGS.map(() => 0);
    return r.split(",").map(Number);
  } catch { return WRITINGS.map(() => 0); }
}

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useTypewriter(texts, speed = 55, pause = 3500) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[idx];
    if (!deleting) {
      if (display.length < current.length) {
        const t = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), speed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setDeleting(true), pause);
        return () => clearTimeout(t);
      }
    } else {
      if (display.length > 0) {
        const t = setTimeout(() => setDisplay(display.slice(0, -1)), speed / 2);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setIdx((p) => (p + 1) % texts.length);
      }
    }
  }, [display, idx, deleting]);
  return display;
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setVis(true), delay);
    }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════════
   CONSTELLATION MAP
   ═══════════════════════════════════════════ */

function ConstellationOverlay({ data, visible, nameRect }) {
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { if (visible) setAnimKey(k => k + 1); }, [visible]);

  const stars = WRITINGS.map((w, i) => {
    const s = data[i] || 0;
    if (s < 3) return null;
    const p = TAG_POS[w.tag] || { x: 0.5, y: 0.5 };
    const t = Math.min(1, (s - 3) / 57);
    return { id: w.id, left: p.x * 100, top: p.y * 100, r: 3 + t * 5, op: 0.35 + t * 0.65, glow: 5 + t * 12, glowOp: 0.25 + t * 0.45 };
  }).filter(Boolean);

  if (!stars.length) return null;
  const textDelay = `${0.3 + stars.length * 0.45}s`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(16,20,21,0.96)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.9s ease",
      pointerEvents: "none",
    }}>
      {/* Name — pixel-perfect overlay of the real nav element */}
      {nameRect && (
        <div style={{
          position: "fixed",
          top: nameRect.top, left: nameRect.left,
          width: nameRect.width, height: nameRect.height,
          display: "flex", alignItems: "center",
          fontFamily: "var(--serif)", fontSize: 15, fontWeight: 400,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(244,245,240,0.9)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}>
          Yatin Kumar
        </div>
      )}

      {/* Stars — time-lapse stagger */}
      {stars.map((star, idx) => (
        <div key={`${star.id}-${animKey}`} style={{
          position: "absolute",
          left: `${star.left}%`, top: `${star.top}%`,
          transform: "translate(-50%, -50%)",
          animation: `starAppear 0.9s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + idx * 0.45}s both`,
        }}>
          <div style={{
            width: star.r * 2, height: star.r * 2,
            borderRadius: "50%",
            background: "#3D6B5E",
            opacity: star.op,
            boxShadow: `0 0 ${star.glow}px rgba(61,107,94,${star.glowOp})`,
          }} />
        </div>
      ))}

      {/* Explanation — appears after last star */}
      <div style={{
        position: "absolute", bottom: 56, left: 0, right: 0, textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.8s ease ${textDelay}`,
      }}>
        <p style={{
          fontFamily: "var(--serif)", fontSize: 16, fontStyle: "italic",
          color: "rgba(244,245,240,0.88)", letterSpacing: "0.02em", lineHeight: 1.9,
          margin: "0 auto",
        }}>
          Each star is a blog you read.
        </p>
        <p style={{
          fontFamily: "var(--body)", fontSize: 13.5, fontWeight: 300,
          color: "rgba(244,245,240,0.58)", letterSpacing: "0.02em", lineHeight: 1.9,
          margin: "10px auto 0", maxWidth: 400,
        }}>
          Its direction in the sky is its field —<br/>
          ai left, philosophy right, systems high, life low.<br/>
          Its brightness is how long you stayed.
        </p>
        <p style={{
          fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.09em",
          color: "rgba(244,245,240,0.3)", textTransform: "lowercase", marginTop: 16,
        }}>
          you made this without meaning to
        </p>
      </div>

      {/* Footer in the sky */}
      <div style={{
        position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.9s ease 0.3s",
      }}>
        <span style={{
          fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic",
          color: "rgba(244,245,240,0.45)", letterSpacing: "0.02em",
        }}>
          Still observing
          <span style={{ display: "inline-block", width: 3, height: 3, borderRadius: "50%", background: "rgba(61,107,94,0.9)", margin: "0 12px", verticalAlign: "middle" }}/>
          Still learning
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */

const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

/* ═══════════════════════════════════════════
   ANIMATED HEART
   ═══════════════════════════════════════════ */

function AnimatedHeart({ isLiked, size = 16 }) {
  const [animPhase, setAnimPhase] = useState("idle"); // idle | filling | bursting | done
  const prevLiked = useRef(isLiked);

  useEffect(() => {
    if (isLiked && !prevLiked.current) {
      setAnimPhase("filling");
      const t1 = setTimeout(() => setAnimPhase("bursting"), 500);
      const t2 = setTimeout(() => setAnimPhase("done"), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (!isLiked && prevLiked.current) {
      setAnimPhase("idle");
    }
    prevLiked.current = isLiked;
  }, [isLiked]);

  const fillColor = (animPhase === "filling" || animPhase === "bursting" || animPhase === "done" || (isLiked && animPhase === "idle"))
    ? "#D94F4F" : "none";
  const strokeColor = (animPhase === "filling" || animPhase === "bursting" || animPhase === "done" || (isLiked && animPhase === "idle"))
    ? "#D94F4F" : "currentColor";

  let scale = 1;
  if (animPhase === "bursting") scale = 1.3;

  return (
    <span style={{
      display: "inline-flex", position: "relative",
      transform: `scale(${scale})`,
      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}>
      <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        style={{ overflow: "visible" }}>
        <defs>
          <clipPath id={`heartClip-${size}`}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </clipPath>
        </defs>

        {/* Outline */}
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="none" stroke={strokeColor}
          style={{ transition: "stroke 0.4s ease" }}/>

        {/* Fill rising from bottom */}
        <g clipPath={`url(#heartClip-${size})`}>
          <rect x="0"
            y={isLiked ? "0" : "24"}
            width="24" height="24"
            fill="#D94F4F"
            style={{
              transition: isLiked ? "y 0.5s cubic-bezier(0.22, 1, 0.36, 1)" : "y 0.3s ease",
            }}/>
        </g>
      </svg>

      {/* Burst particles */}
      {animPhase === "bursting" && (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <span key={deg} style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 3, height: 3,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#D94F4F" : "#F2A6A6",
              transform: `rotate(${deg}deg) translateY(-${size * 0.9}px)`,
              opacity: 0,
              animation: `burstParticle 0.5s ease-out forwards`,
              animationDelay: `${i * 25}ms`,
            }}/>
          ))}
        </>
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SHARE HELPERS
   ═══════════════════════════════════════════ */

function shareOnTwitter(w) {
  const text = `"${w.title}" — a quiet observation worth reading.`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`https://yatinkumar.blog/#${w.id}`)}`, "_blank");
}
function shareOnLinkedIn(w) {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://yatinkumar.blog/#${w.id}`)}`, "_blank");
}
function copyLink(w, setCopiedId) {
  navigator.clipboard?.writeText(`https://yatinkumar.blog/#${w.id}`);
  setCopiedId(w.id);
  setTimeout(() => setCopiedId(null), 1500);
}

/* ═══════════════════════════════════════════
   WRITING CARD — expand-in-place
   ═══════════════════════════════════════════ */

function WritingCard({ w, isExpanded, onToggle, likeCounts, likedSet, onLike, copiedId, setCopiedId }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);
  const isLiked = likedSet.has(w.id);
  const count = likeCounts[w.id] || w.likes;
  const preview = w.body.split("\n\n")[0].slice(0, 130) + "…";

  useEffect(() => {
    if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
  }, [isExpanded, w]);

  return (
    <div style={{ padding: "40px 0", borderBottom: "1px solid var(--border)" }}>
      {/* Meta */}
      <div style={{
        fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-tertiary)",
        letterSpacing: "0.05em", marginBottom: 14, display: "flex", alignItems: "center", gap: 10,
      }}>
        {w.date}
        <span style={{
          fontSize: 10, padding: "2px 10px", borderRadius: 100,
          background: "var(--tag-bg)", color: "var(--accent)", letterSpacing: "0.02em",
        }}>{w.tag}</span>
      </div>

      {/* Title — clickable to expand */}
      <h3 className="writing-title-hover" onClick={onToggle} style={{
        fontFamily: "var(--serif)", fontSize: 27, fontWeight: 400, lineHeight: 1.3,
        color: "var(--text)", marginBottom: isExpanded ? 24 : 10,
        letterSpacing: "-0.005em", transition: "color 0.3s, margin 0.3s", cursor: "pointer",
      }}>{w.title}</h3>

      {/* Preview when collapsed */}
      {!isExpanded && (
        <p onClick={onToggle} style={{
          fontFamily: "var(--body)", fontSize: 15, lineHeight: 1.7,
          color: "var(--text-tertiary)", fontStyle: "italic", fontWeight: 300,
          marginBottom: 18, cursor: "pointer",
        }}>{preview}</p>
      )}

      {/* Expanded body */}
      <div style={{
        maxHeight: isExpanded ? height + 80 : 0, opacity: isExpanded ? 1 : 0,
        overflow: "hidden", transition: "max-height 0.6s ease, opacity 0.5s ease",
      }}>
        <div ref={bodyRef} style={{
          fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.85,
          color: "var(--text-secondary)", fontWeight: 300,
        }}>
          {w.body.split("\n\n").map((p, i) => (
            <p key={i} style={{ marginBottom: 20 }}>{p}</p>
          ))}
        </div>
        <div onClick={onToggle} style={{
          marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--border-light)",
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-tertiary)",
          letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
        }}>
          <span style={{ display: "inline-block", width: 14, height: 1, background: "var(--accent)", opacity: 0.4 }}/>
          collapse
        </div>
      </div>

      {/* Reactions bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        marginTop: isExpanded ? 20 : 0,
        transition: "margin 0.3s ease",
      }}>
        <button onClick={(e) => { e.stopPropagation(); onLike(w.id); }}
          className="react-btn" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
            borderRadius: 100, border: "1px solid var(--border-light)",
            background: isLiked ? "rgba(217,79,79,0.06)" : "transparent",
            cursor: "pointer", transition: "all 0.3s",
            color: isLiked ? "#D94F4F" : "var(--text-tertiary)",
          }}>
          <AnimatedHeart isLiked={isLiked} size={15}/>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.02em",
            transition: "color 0.4s", color: isLiked ? "#D94F4F" : "var(--text-tertiary)",
          }}>{count}</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); shareOnTwitter(w); }}
          className="react-btn" title="Share on X"
          style={{ display: "flex", alignItems: "center", padding: "6px 9px", borderRadius: 100, border: "1px solid var(--border-light)", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", transition: "all 0.3s" }}>
          <TwitterIcon/>
        </button>
        <button onClick={(e) => { e.stopPropagation(); shareOnLinkedIn(w); }}
          className="react-btn" title="Share on LinkedIn"
          style={{ display: "flex", alignItems: "center", padding: "6px 9px", borderRadius: 100, border: "1px solid var(--border-light)", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", transition: "all 0.3s" }}>
          <LinkedInIcon/>
        </button>
        <button onClick={(e) => { e.stopPropagation(); copyLink(w, setCopiedId); }}
          className="react-btn" title="Copy link"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 9px", borderRadius: 100, border: "1px solid var(--border-light)", background: "transparent", cursor: "pointer", color: copiedId === w.id ? "var(--accent)" : "var(--text-tertiary)", transition: "all 0.3s" }}>
          <LinkIcon/>
          {copiedId === w.id && <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>copied</span>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ARTICLE VIEW — only for deep-links
   ═══════════════════════════════════════════ */

function ArticleView({ w, recommendations, likeCounts, likedSet, onLike, onOpenArticle, onBack, copiedId, setCopiedId }) {
  const isLiked = likedSet.has(w.id);
  const count = likeCounts[w.id] || w.likes;

  return (
    <div>
      <button onClick={onBack} className="back-btn" style={{
        display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)",
        fontSize: 11.5, color: "var(--text-tertiary)", letterSpacing: "0.04em",
        border: "none", background: "none", cursor: "pointer", padding: "0 0 40px", transition: "color 0.3s",
      }}>
        <ArrowLeft/> all writings
      </button>

      <div style={{
        fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-tertiary)",
        letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
      }}>
        {w.date}
        <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 100, background: "var(--tag-bg)", color: "var(--accent)" }}>{w.tag}</span>
      </div>

      <h1 style={{
        fontFamily: "var(--serif)", fontSize: 38, fontWeight: 400, lineHeight: 1.22,
        color: "var(--text)", marginBottom: 36, letterSpacing: "-0.01em",
      }}>{w.title}</h1>

      <div style={{ fontFamily: "var(--body)", fontSize: 17, lineHeight: 1.9, color: "var(--text-secondary)", fontWeight: 300 }}>
        {w.body.split("\n\n").map((p, i) => (
          <p key={i} style={{ marginBottom: 22 }}>{p}</p>
        ))}
      </div>

      {/* Reactions */}
      <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onLike(w.id)} className="react-btn" style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100,
          border: "1px solid var(--border-light)", background: isLiked ? "rgba(217,79,79,0.06)" : "transparent",
          cursor: "pointer", transition: "all 0.3s", color: isLiked ? "#D94F4F" : "var(--text-tertiary)",
        }}>
          <AnimatedHeart isLiked={isLiked} size={16}/>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: isLiked ? "#D94F4F" : "var(--text-tertiary)", transition: "color 0.4s" }}>{count}</span>
        </button>
        <button onClick={() => shareOnTwitter(w)} className="react-btn" style={{ display: "flex", alignItems: "center", padding: "8px 11px", borderRadius: 100, border: "1px solid var(--border-light)", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", transition: "all 0.3s" }}>
          <TwitterIcon/>
        </button>
        <button onClick={() => shareOnLinkedIn(w)} className="react-btn" style={{ display: "flex", alignItems: "center", padding: "8px 11px", borderRadius: 100, border: "1px solid var(--border-light)", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", transition: "all 0.3s" }}>
          <LinkedInIcon/>
        </button>
        <button onClick={() => copyLink(w, setCopiedId)} className="react-btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 11px", borderRadius: 100, border: "1px solid var(--border-light)", background: "transparent", cursor: "pointer", color: copiedId === w.id ? "var(--accent)" : "var(--text-tertiary)", transition: "all 0.3s" }}>
          <LinkIcon/>
          {copiedId === w.id && <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>copied</span>}
        </button>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 24 }}>
            More from the margins
          </div>
          {recommendations.map(r => (
            <div key={r.id} onClick={() => onOpenArticle(r.id)} style={{ padding: "20px 0", borderTop: "1px solid var(--border-light)", cursor: "pointer" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                {r.date}
                <span style={{ fontSize: 9, padding: "1px 8px", borderRadius: 100, background: "var(--tag-bg)", color: "var(--accent)" }}>{r.tag}</span>
              </div>
              <h4 className="writing-title-hover" style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400, color: "var(--text)", lineHeight: 1.35, transition: "color 0.3s" }}>{r.title}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PORTFOLIO PAGE
   ═══════════════════════════════════════════ */

function PortfolioPage() {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div>
      <FadeIn>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 42, fontWeight: 300, lineHeight: 1.2, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.01em" }}>
          Things I've <em style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 300 }}>built</em>
        </h1>
      </FadeIn>
      <FadeIn delay={150}>
        <p style={{ fontFamily: "var(--body)", fontSize: 17, lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 300, maxWidth: 540, marginBottom: 20 }}>
          A selection of product work — systems designed, problems reframed, things shipped. Each one taught me something I couldn't have learned by reading about it.
        </p>
        <p style={{ fontFamily: "var(--body)", fontSize: 15, lineHeight: 1.75, color: "var(--text-tertiary)", fontWeight: 300, fontStyle: "italic", maxWidth: 540, marginBottom: 56 }}>
          I'm most proud not of the outcomes, but of the thinking that got there.
        </p>
      </FadeIn>

      {PORTFOLIO.map((p, i) => {
        const isOpen = expandedId === p.id;
        return (
          <FadeIn key={p.id} delay={250 + i * 100}>
            <div onClick={() => setExpandedId(isOpen ? null : p.id)} style={{
              padding: "36px 0", borderTop: i === 0 ? "1px solid var(--border)" : "none",
              borderBottom: "1px solid var(--border)", cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.04em" }}>
                <span>{p.company}</span><span style={{ opacity: 0.3 }}>·</span>
                <span>{p.role}</span><span style={{ opacity: 0.3 }}>·</span><span>{p.period}</span>
              </div>
              <h3 className="writing-title-hover" style={{ fontFamily: "var(--serif)", fontSize: 25, fontWeight: 400, lineHeight: 1.3, color: "var(--text)", marginBottom: 12, transition: "color 0.3s" }}>{p.title}</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: isOpen ? 20 : 0 }}>
                {p.tags.map(t => (
                  <span key={t} style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "3px 10px", borderRadius: 100, background: "var(--tag-bg)", color: "var(--accent)", letterSpacing: "0.02em" }}>{t}</span>
                ))}
              </div>
              <div style={{ maxHeight: isOpen ? 600 : 0, opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "max-height 0.6s ease, opacity 0.5s ease" }}>
                <div style={{ fontFamily: "var(--body)", fontSize: 15.5, lineHeight: 1.85, color: "var(--text-secondary)", fontWeight: 300, marginTop: 8 }}>
                  <p style={{ marginBottom: 18 }}>{p.summary}</p>
                  <div style={{ background: "var(--bg-card)", borderRadius: 8, padding: "18px 22px", marginBottom: 18, border: "1px solid var(--border-light)" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>Impact</div>
                    <p style={{ fontSize: 15, color: "var(--text)", fontWeight: 400 }}>{p.impact}</p>
                  </div>
                  <div style={{ paddingLeft: 16, borderLeft: "2px solid var(--accent)", marginTop: 16 }}>
                    <p style={{ fontFamily: "var(--body)", fontSize: 15, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.75 }}>{p.insight}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        );
      })}

      <FadeIn delay={700}>
        <div style={{ marginTop: 64, padding: 32, background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border-light)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400, color: "var(--text)", marginBottom: 10 }}>Want to work together?</p>
          <p style={{ fontFamily: "var(--body)", fontSize: 14.5, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 20 }}>I'm always open to conversations about product, systems, or ideas worth exploring.</p>
          <a href="mailto:yatin.kumar@clear.in" className="react-btn" style={{
            fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", textDecoration: "none",
            letterSpacing: "0.04em", padding: "10px 24px", border: "1px solid var(--accent)",
            borderRadius: 100, display: "inline-block",
          }}>say hello</a>
        </div>
      </FadeIn>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */

export default function Blog() {
  const [page, setPage] = useState("writings");
  const [activeTag, setActiveTag] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [deepLinkArticle, setDeepLinkArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [likedSet, setLikedSet] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const thinkingText = useTypewriter(THINKING_ABOUT, 55, 3500);
  const [constData, setConstData] = useState(() => loadConst());
  const [nameHov, setNameHov] = useState(false);
  const [nameRect, setNameRect] = useState(null);
  const nameRef = useRef(null);
  const trackRef = useRef({ id: null, start: null });

  useEffect(() => {
    if (nameHov && nameRef.current) {
      setNameRect(nameRef.current.getBoundingClientRect());
    }
  }, [nameHov]);

  const activeId = deepLinkArticle || expandedId;
  useEffect(() => {
    const prev = trackRef.current;
    if (prev.id && prev.id !== activeId && prev.start) {
      const secs = Math.round((Date.now() - prev.start) / 1000);
      if (secs >= 3) {
        const idx = ARTICLE_IDX[prev.id];
        if (idx !== undefined) {
          setConstData(d => {
            const next = [...d];
            next[idx] = Math.min(255, (next[idx] || 0) + secs);
            try { localStorage.setItem("ck", next.join(",")); } catch {}
            return next;
          });
        }
      }
    }
    trackRef.current = { id: activeId || null, start: activeId ? Date.now() : null };
  }, [activeId]);

  useEffect(() => {
    const flush = () => {
      const { id, start } = trackRef.current;
      if (!id || !start) return;
      const secs = Math.round((Date.now() - start) / 1000);
      if (secs < 3) return;
      const idx = ARTICLE_IDX[id];
      if (idx === undefined) return;
      const d = loadConst();
      d[idx] = Math.min(255, (d[idx] || 0) + secs);
      try { localStorage.setItem("ck", d.join(",")); } catch {}
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, []);

  useEffect(() => {
    const init = {};
    WRITINGS.forEach(w => { init[w.id] = w.likes; });
    setLikeCounts(init);
  }, []);

  // Deep-link: only set on initial load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && WRITINGS.find(w => w.id === hash)) {
      setDeepLinkArticle(hash);
      setPage("writings");
    }
  }, []);

  const handleLike = useCallback((id) => {
    setLikedSet(prev => {
      const next = new Set(prev);
      const wasLiked = next.has(id);
      if (wasLiked) next.delete(id); else next.add(id);
      setLikeCounts(lc => ({ ...lc, [id]: lc[id] + (wasLiked ? -1 : 1) }));
      return next;
    });
  }, []);

  const filtered = WRITINGS.filter(w => {
    const matchTag = activeTag === "all" || w.tag === activeTag;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || w.title.toLowerCase().includes(q) || w.body.toLowerCase().includes(q) || w.tag.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  const deepArticle = deepLinkArticle ? WRITINGS.find(w => w.id === deepLinkArticle) : null;
  const recommendations = deepArticle ? WRITINGS.filter(w => w.id !== deepArticle.id).slice(0, 3) : [];

  const goHome = () => { setPage("writings"); setDeepLinkArticle(null); };

  return (
    <>
      <ConstellationOverlay data={constData} visible={nameHov} nameRect={nameRect} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400&family=IBM+Plex+Mono:wght@300;400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #F4F5F0; --bg-card: #EAECE5; --text: #1B2021;
          --text-secondary: #4A5043; --text-tertiary: #8A8E82;
          --accent: #3D6B5E; --tag-bg: rgba(61,107,94,0.09);
          --border: #D4D6CE; --border-light: #E2E3DC; --search-bg: #EAEBE5;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --body: 'Source Serif 4', Georgia, serif;
          --mono: 'IBM Plex Mono', monospace;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--body); -webkit-font-smoothing: antialiased; }
        ::selection { background: var(--tag-bg); color: var(--accent); }
        .writing-title-hover:hover { color: var(--accent) !important; }
        .search-input::placeholder { color: var(--text-tertiary); opacity: 0.6; }
        .search-input:focus { outline: none; border-color: var(--accent); background: var(--bg); }
        .tag-btn { font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em; padding: 6px 14px; border-radius: 100px; border: 1px solid var(--border); background: transparent; color: var(--text-tertiary); cursor: pointer; transition: all 0.3s; }
        .tag-btn:hover { color: var(--text-secondary); border-color: var(--text-tertiary); }
        .tag-btn.active { background: var(--accent); color: #F4F5F0; border-color: var(--accent); }
        .nav-link { font-family: var(--mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-tertiary); cursor: pointer; border: none; background: none; padding: 4px 0; transition: color 0.3s; text-decoration: none; border-bottom: 1.5px solid transparent; }
        .nav-link:hover { color: var(--text-secondary); }
        .nav-link.active-nav { color: var(--text); border-bottom-color: var(--accent); }
        .react-btn:hover { border-color: var(--text-tertiary) !important; color: var(--accent) !important; }
        .back-btn:hover { color: var(--accent) !important; }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes starAppear {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(0); }
          65% { transform: translate(-50%,-50%) scale(1.35); }
          100% { transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes burstParticle {
          0% { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(0px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-18px) scale(0); }
        }
        @media (max-width: 600px) {
          .outer { padding: 40px 20px !important; }
          .hero { font-size: 32px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div className="outer" style={{ maxWidth: 660, margin: "0 auto", padding: "64px 24px 80px" }}>

          {/* NAV */}
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 64 }}>
              <div
                ref={nameRef}
                onMouseEnter={() => setNameHov(true)}
                onMouseLeave={() => setNameHov(false)}
                onClick={() => { setNameHov(false); goHome(); }}
                style={{ fontFamily: "var(--serif)", fontSize: 15, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: nameHov ? "transparent" : "var(--text-tertiary)", cursor: "pointer", userSelect: "none", transition: "color 0.2s ease" }}
              >Yatin Kumar</div>
              <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <button className={`nav-link ${page === "writings" && !deepLinkArticle ? "active-nav" : ""}`}
                  onClick={goHome}>writings</button>
                <button className={`nav-link ${page === "portfolio" ? "active-nav" : ""}`}
                  onClick={() => { setPage("portfolio"); setDeepLinkArticle(null); }}>portfolio</button>
                <button className="nav-link" style={{ color: showAbout ? "var(--accent)" : undefined }}
                  onClick={() => setShowAbout(!showAbout)}>{showAbout ? "close" : "about"}</button>
              </nav>
            </div>
          </FadeIn>

          {/* ABOUT */}
          <div style={{
            maxHeight: showAbout ? 600 : 0, opacity: showAbout ? 1 : 0,
            overflow: "hidden", transition: "max-height 0.6s ease, opacity 0.5s ease",
            marginBottom: showAbout ? 56 : 0,
          }}>
            <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "40px 36px", border: "1px solid var(--border-light)" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, marginBottom: 20, color: "var(--text)" }}>Hello.</h2>
              <div style={{ fontFamily: "var(--body)", fontSize: 15.5, lineHeight: 1.85, color: "var(--text-secondary)", fontWeight: 300 }}>
                <p style={{ marginBottom: 16 }}>I'm a product manager in India, building AI-powered compliance systems at ClearTax. My days live at the intersection of messy real-world data, enterprise software, and the humans who have to make sense of it all.</p>
                <p style={{ marginBottom: 16 }}>Before product, I cared about philosophy. I still do. The best systems thinking borrows from people who've asked hard questions for millennia — Aristotle, Nagarjuna, Wittgenstein, and the long lineage of minds who refused the obvious answer.</p>
                <p>This is where I think out loud. Observations, not conclusions.</p>
              </div>
              <div style={{ marginTop: 28, display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.04em" }}>
                {["twitter", "linkedin", "email"].map(l => (
                  <a key={l} href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>{l}</a>
                ))}
              </div>
            </div>
          </div>

          {/* PORTFOLIO */}
          {page === "portfolio" && <PortfolioPage/>}

          {/* DEEP-LINK ARTICLE */}
          {page === "writings" && deepLinkArticle && deepArticle && (
            <ArticleView w={deepArticle} recommendations={recommendations}
              likeCounts={likeCounts} likedSet={likedSet} onLike={handleLike}
              onOpenArticle={(id) => { setDeepLinkArticle(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              onBack={goHome} copiedId={copiedId} setCopiedId={setCopiedId}/>
          )}

          {/* WRITINGS LIST — expand in place */}
          {page === "writings" && !deepLinkArticle && (
            <>
              <FadeIn delay={100}>
                <h1 className="hero" style={{
                  fontFamily: "var(--serif)", fontSize: 42, fontWeight: 300, lineHeight: 1.2,
                  color: "var(--text)", marginBottom: 28, letterSpacing: "-0.01em",
                }}>
                  Observations from the{" "}
                  <em style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 300 }}>margins</em>{" "}
                  of building things
                </h1>
              </FadeIn>

              <FadeIn delay={250}>
                <p style={{ fontFamily: "var(--body)", fontSize: 17, lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 300, maxWidth: 540, marginBottom: 44 }}>
                  Short writings on AI, philosophy, systems, and the quiet patterns hiding in plain sight. Not claiming to have answers — just paying close attention.
                </p>
              </FadeIn>

              <FadeIn delay={400}>
                <div style={{ marginBottom: 52 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>currently thinking about</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 21, fontWeight: 300, fontStyle: "italic", color: "var(--accent)", minHeight: 32 }}>
                    {thinkingText}
                    <span style={{ display: "inline-block", width: 1.5, height: 21, background: "var(--accent)", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }}/>
                  </div>
                </div>
              </FadeIn>

              <hr style={{ border: "none", height: 1, background: "var(--border)", marginBottom: 36 }}/>

              <FadeIn delay={500}>
                <div style={{ marginBottom: 20, position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", opacity: 0.5 }}><SearchIcon/></div>
                  <input className="search-input" type="text" placeholder="Search writings…"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px 12px 42px", fontFamily: "var(--body)", fontSize: 14.5, fontWeight: 300, background: "var(--search-bg)", border: "1px solid var(--border-light)", borderRadius: 8, color: "var(--text)", transition: "all 0.3s" }}/>
                </div>
              </FadeIn>

              <FadeIn delay={550}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {TAGS.map(tag => (
                    <button key={tag} className={`tag-btn ${activeTag === tag ? "active" : ""}`}
                      onClick={() => setActiveTag(tag)}>{tag}</button>
                  ))}
                </div>
              </FadeIn>

              <div>
                {filtered.length === 0 && (
                  <div style={{ padding: "64px 0", textAlign: "center", fontFamily: "var(--body)", fontSize: 15, color: "var(--text-tertiary)", fontStyle: "italic" }}>
                    Nothing here yet. Try a different search or tag.
                  </div>
                )}
                {filtered.map((w, i) => (
                  <FadeIn key={w.id} delay={650 + i * 70}>
                    <WritingCard w={w}
                      isExpanded={expandedId === w.id}
                      onToggle={() => setExpandedId(expandedId === w.id ? null : w.id)}
                      likeCounts={likeCounts} likedSet={likedSet} onLike={handleLike}
                      copiedId={copiedId} setCopiedId={setCopiedId}/>
                  </FadeIn>
                ))}
              </div>
            </>
          )}

          {/* FOOTER */}
          <FadeIn>
            <footer style={{ marginTop: 80, textAlign: "center", paddingBottom: 20 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 14, fontStyle: "italic", color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
                Still observing
                <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", margin: "0 14px", verticalAlign: "middle" }}/>
                Still learning
              </div>
            </footer>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
