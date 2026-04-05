import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const BOOKS = [
  { name: "Lord of the Rings (all 6 books)", words: 576459, emoji: "🧙" },
  { name: "Harry Potter series (all 7 books)", words: 1084170, emoji: "⚡" },
  { name: "War and Peace", words: 587287, emoji: "📖" },
  { name: "Sapiens by Yuval Noah Harari", words: 149000, emoji: "🌍" },
  { name: "The Great Gatsby", words: 47094, emoji: "🥂" },
  { name: "US Constitution", words: 4543, emoji: "📜" },
];

function getSpeedTier(wpm) {
  if (wpm < 150) return { label: "Leisurely Reader", desc: "You savour every word." };
  if (wpm < 250) return { label: "Steady Reader", desc: "Right around the global average." };
  if (wpm < 400) return { label: "Quick Reader", desc: "Faster than most humans on earth." };
  return { label: "Speed Reader", desc: "Your eyes are basically scanners." };
}

function calcDays(words, wpm, hoursPerDay = 3) {
  return Math.ceil((words / wpm / 60) / hoursPerDay);
}

function calcMinutes(words, wpm) {
  return Math.round(words / wpm);
}

/* ═══════════════════════════════════════════
   HOOK: useReadingSpeed
   ═══════════════════════════════════════════ */

export function useReadingSpeed(contentRef, isActive) {
  const [wpm, setWpm] = useState(null);
  const [percentRead, setPercentRead] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [totalWords, setTotalWords] = useState(0);

  const scrollStartTime = useRef(null);
  const hasScrolled = useRef(false);
  const seenParagraphs = useRef(new Set());
  const paragraphWords = useRef([]);
  const totalWordsRef = useRef(0);
  const rafId = useRef(null);
  const observerRef = useRef(null);
  const scrollHandlerRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Reset when article changes
  useEffect(() => {
    if (!isActive) {
      setWpm(null);
      setPercentRead(0);
      setIsReady(false);
      setTotalWords(0);
      scrollStartTime.current = null;
      hasScrolled.current = false;
      seenParagraphs.current = new Set();
      paragraphWords.current = [];
      totalWordsRef.current = 0;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (observerRef.current) observerRef.current.disconnect();
      if (scrollHandlerRef.current) window.removeEventListener("scroll", scrollHandlerRef.current);
      return;
    }

    // Wait a tick for DOM to render
    const initTimer = setTimeout(() => {
      if (!contentRef.current) return;

      const paragraphs = contentRef.current.querySelectorAll("p");
      if (paragraphs.length === 0) return;

      // Count words per paragraph
      const wordCounts = [];
      let total = 0;
      paragraphs.forEach((p) => {
        const count = p.textContent.trim().split(/\s+/).filter(Boolean).length;
        wordCounts.push(count);
        total += count;
      });
      paragraphWords.current = wordCounts;
      totalWordsRef.current = total;
      setTotalWords(total);

      // Intersection Observer for paragraphs
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = Array.from(paragraphs).indexOf(entry.target);
              if (idx !== -1) seenParagraphs.current.add(idx);
            }
          });
        },
        { threshold: 0.6 }
      );
      paragraphs.forEach((p) => observerRef.current.observe(p));

      // First scroll detection
      scrollHandlerRef.current = () => {
        if (!hasScrolled.current) {
          hasScrolled.current = true;
          scrollStartTime.current = Date.now();
        }
      };
      window.addEventListener("scroll", scrollHandlerRef.current, { passive: true });

      // rAF loop for continuous WPM calculation
      const tick = (timestamp) => {
        if (!isActive) return;

        // Throttle to every 500ms
        if (timestamp - lastUpdateRef.current > 500) {
          lastUpdateRef.current = timestamp;

          if (hasScrolled.current && scrollStartTime.current) {
            const elapsed = (Date.now() - scrollStartTime.current) / 60000; // minutes
            if (elapsed > 0.167) {
              // At least 10 seconds
              const wordsRead = Array.from(seenParagraphs.current).reduce(
                (sum, idx) => sum + (paragraphWords.current[idx] || 0),
                0
              );
              const pct = totalWordsRef.current > 0 ? wordsRead / totalWordsRef.current : 0;
              setPercentRead(Math.round(pct * 100));

              if (seenParagraphs.current.size >= 2 && wordsRead > 50) {
                const speed = Math.round(wordsRead / elapsed);
                const clamped = Math.max(50, Math.min(1500, speed));
                setWpm(clamped);
                setIsReady(true);
              }
            }
          }
        }

        rafId.current = requestAnimationFrame(tick);
      };
      rafId.current = requestAnimationFrame(tick);
    }, 300);

    return () => {
      clearTimeout(initTimer);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (observerRef.current) observerRef.current.disconnect();
      if (scrollHandlerRef.current) window.removeEventListener("scroll", scrollHandlerRef.current);
    };
  }, [isActive, contentRef]);

  return { wpm, percentRead, isReady, totalWords };
}

/* ═══════════════════════════════════════════
   COMPONENT: ReadingInsightsNudge
   ═══════════════════════════════════════════ */

export function ReadingInsightsNudge({ wpm, isReady, onTellMeMore }) {
  if (!isReady || wpm === null) return null;

  return (
    <div
      style={{
        marginTop: 32,
        paddingTop: 20,
        borderTop: "1px dashed var(--border-light)",
        opacity: 1,
        animation: "fadeInUp 0.7s ease both",
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.06em",
          color: "var(--text-tertiary)",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        reading speed
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 24,
          fontWeight: 400,
          color: "var(--text)",
          marginBottom: 6,
        }}
      >
        ~{wpm} <span style={{ fontSize: 14, color: "var(--text-tertiary)" }}>words/minute</span>
      </div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 13,
          color: "var(--text-tertiary)",
          fontWeight: 300,
          fontStyle: "italic",
          marginBottom: 14,
        }}
      >
        {getSpeedTier(wpm).desc}
      </div>
      <button
        onClick={onTellMeMore}
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.04em",
          color: "var(--accent)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          transition: "opacity 0.3s",
        }}
      >
        Tell me more →
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENT: InsightsPanel
   ═══════════════════════════════════════════ */

export function InsightsPanel({ wpm, isOpen, onClose, onShare }) {
  if (!wpm) return null;

  const tier = getSpeedTier(wpm);
  const avgDiff = Math.round(((wpm - 238) / 238) * 100);
  const avgText =
    avgDiff > 0
      ? `${avgDiff}% faster than the average adult (238 wpm)`
      : avgDiff < 0
        ? `${Math.abs(avgDiff)}% slower than the average adult (238 wpm) — and that's okay`
        : `Right at the global average (238 wpm)`;

  return (
    <div
      style={{
        maxHeight: isOpen ? 800 : 0,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.6s ease, opacity 0.5s ease",
        marginTop: isOpen ? 20 : 0,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 10,
          padding: "28px 28px 24px",
          border: "1px solid var(--border-light)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            {tier.label}
          </div>
          <button
            onClick={onClose}
            style={{
              fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-tertiary)",
              background: "none", border: "none", cursor: "pointer", letterSpacing: "0.04em",
            }}
          >
            close
          </button>
        </div>

        {/* Average comparison */}
        <p style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, marginBottom: 24, fontStyle: "italic" }}>
          {avgText}
        </p>

        {/* Book facts */}
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 14 }}>
          At your pace, reading 3 hours/day
        </div>

        {BOOKS.map((book) => {
          const days = calcDays(book.words, wpm);
          const mins = calcMinutes(book.words, wpm);
          const display = days > 1 ? `${days} days` : `${mins} min`;
          return (
            <div
              key={book.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <span style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--text-secondary)", fontWeight: 300 }}>
                {book.emoji} {book.name}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", fontWeight: 400, whiteSpace: "nowrap", marginLeft: 16 }}>
                {display}
              </span>
            </div>
          );
        })}

        {/* Share button */}
        <button
          onClick={onShare}
          style={{
            marginTop: 24,
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.04em",
            color: "var(--accent)",
            padding: "10px 24px",
            border: "1px solid var(--accent)",
            borderRadius: 100,
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.3s",
            display: "block",
            width: "100%",
          }}
        >
          Share your reading speed
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENT: ShareCardModal
   ═══════════════════════════════════════════ */

export function ShareCardModal({ wpm, w, isOpen, onClose }) {
  const canvasRef = useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!isOpen || !wpm || !canvasRef.current) { setDrawn(false); return; }

    const draw = async () => {
      await document.fonts.ready;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const W = 1200, H = 630;
      canvas.width = W;
      canvas.height = H;

      // Background
      ctx.fillStyle = "#F4F5F0";
      ctx.fillRect(0, 0, W, H);

      // Accent bar left
      ctx.fillStyle = "#3D6B5E";
      ctx.fillRect(0, 0, 8, H);

      // Speed tier
      const tier = getSpeedTier(wpm);

      // Large WPM
      ctx.fillStyle = "#1B2021";
      ctx.font = "300 72px 'Cormorant Garamond', Georgia, serif";
      ctx.fillText(`~${wpm}`, 72, 180);

      ctx.fillStyle = "#8A8E82";
      ctx.font = "300 28px 'Source Serif 4', Georgia, serif";
      ctx.fillText("words per minute", 72, 225);

      // Tier label
      ctx.fillStyle = "#3D6B5E";
      ctx.font = "400 18px 'IBM Plex Mono', monospace";
      ctx.fillText(tier.label.toUpperCase(), 72, 290);

      // Fun fact
      const lotrDays = calcDays(576459, wpm);
      ctx.fillStyle = "#4A5043";
      ctx.font = "300 22px 'Source Serif 4', Georgia, serif";
      const factText = `At this pace, I'd finish Lord of the Rings in ${lotrDays} days`;
      ctx.fillText(factText, 72, 370);
      ctx.fillText("reading just 3 hours a day.", 72, 405);

      // Divider
      ctx.strokeStyle = "#D4D6CE";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(72, 470);
      ctx.lineTo(W - 72, 470);
      ctx.stroke();

      // Footer
      ctx.fillStyle = "#8A8E82";
      ctx.font = "400 16px 'IBM Plex Mono', monospace";
      ctx.fillText("Check yours at", 72, 530);
      ctx.fillStyle = "#3D6B5E";
      ctx.font = "400 18px 'IBM Plex Mono', monospace";
      ctx.fillText("yatinkch.com", 72, 560);

      setDrawn(true);
    };

    draw();
  }, [isOpen, wpm, w]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reading-speed-${wpm}wpm.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise((r) => canvasRef.current.toBlob(r));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch {}
  };

  const handleShareTwitter = () => {
    const tier = getSpeedTier(wpm);
    const lotrDays = calcDays(576459, wpm);
    const text = `I read at ~${wpm} words/minute (${tier.label}).\n\nAt this pace, I'd finish all of Lord of the Rings in ${lotrDays} days reading 3hrs/day.\n\nCheck yours at`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent("https://yatinkch.com")}`,
      "_blank"
    );
  };

  const handleShareLinkedIn = () => {
    const tier = getSpeedTier(wpm);
    const lotrDays = calcDays(576459, wpm);
    const text = `I read at ~${wpm} words/minute (${tier.label}).\n\nAt this pace, I'd finish all of Lord of the Rings in ${lotrDays} days reading 3hrs/day.\n\nCheck yours at yatinkch.com`;
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(27, 32, 33, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {/* Close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            Your reading card
          </span>
          <button onClick={onClose} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}>
            close
          </button>
        </div>

        {/* Canvas preview */}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 8,
            border: "1px solid var(--border-light)",
            marginBottom: 20,
          }}
        />

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Download", onClick: handleDownload },
            { label: "Copy image", onClick: handleCopyImage },
            { label: "Share on X", onClick: handleShareTwitter },
            { label: "Share on LinkedIn", onClick: handleShareLinkedIn },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              style={{
                flex: 1,
                minWidth: 120,
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--accent)",
                padding: "10px 16px",
                border: "1px solid var(--accent)",
                borderRadius: 100,
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOOK: useAutoScroll
   ═══════════════════════════════════════════ */

export function useAutoScroll(contentRef, isEnabled) {
  const state = useRef("idle"); // idle | armed | active | paused
  const rafId = useRef(null);
  const isProgrammatic = useRef(false);
  const lastUserScroll = useRef(0);
  const userScrollHandler = useRef(null);
  const lastTickRef = useRef(0);
  const firstScrollDone = useRef(false);

  useEffect(() => {
    if (!isEnabled) {
      state.current = "idle";
      firstScrollDone.current = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (userScrollHandler.current) window.removeEventListener("scroll", userScrollHandler.current);
      return;
    }

    state.current = "armed";
    firstScrollDone.current = false;

    // Detect user scrolls vs programmatic
    userScrollHandler.current = () => {
      if (isProgrammatic.current) return;
      lastUserScroll.current = Date.now();

      if (!firstScrollDone.current) {
        firstScrollDone.current = true;
        state.current = "active";
      } else if (state.current === "active") {
        state.current = "paused";
      }
    };
    window.addEventListener("scroll", userScrollHandler.current, { passive: true });

    // rAF loop
    const tick = (timestamp) => {
      if (!isEnabled) return;

      // Throttle to every 200ms
      if (timestamp - lastTickRef.current < 200) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      lastTickRef.current = timestamp;

      // Resume from paused after 2s of no user scroll
      if (state.current === "paused" && Date.now() - lastUserScroll.current > 2000) {
        state.current = "active";
      }

      if (state.current === "active" && contentRef.current) {
        const paragraphs = contentRef.current.querySelectorAll("p");
        if (paragraphs.length === 0) {
          rafId.current = requestAnimationFrame(tick);
          return;
        }

        const viewportBottom = window.scrollY + window.innerHeight;
        const lineHeight = 16.5 * 1.85; // matches blog body styling
        const threshold = lineHeight * 3; // ~91px, 3 lines

        // Find last paragraph in content
        const lastP = paragraphs[paragraphs.length - 1];
        const lastPRect = lastP.getBoundingClientRect();
        const contentBottom = lastPRect.bottom + window.scrollY;

        const remaining = contentBottom - viewportBottom;

        // Only scroll if user hasn't scrolled recently (1.5s)
        if (remaining > 10 && remaining < threshold && Date.now() - lastUserScroll.current > 1500) {
          // Find the paragraph closest to viewport bottom
          let targetP = null;
          for (const p of paragraphs) {
            const rect = p.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - threshold && rect.top < window.innerHeight) {
              targetP = p;
              break;
            }
          }

          if (targetP) {
            const targetTop = targetP.getBoundingClientRect().top + window.scrollY - 40; // 40px padding from top
            isProgrammatic.current = true;
            window.scrollTo({ top: targetTop, behavior: "smooth" });
            setTimeout(() => { isProgrammatic.current = false; }, 600);
          }
        }
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (userScrollHandler.current) window.removeEventListener("scroll", userScrollHandler.current);
    };
  }, [isEnabled, contentRef]);
}

/* ═══════════════════════════════════════════
   COMPONENT: AutoScrollToggle
   ═══════════════════════════════════════════ */

export function AutoScrollToggle({ contentRef, isArticleOpen }) {
  const [enabled, setEnabled] = useState(false);

  // Reset when article closes
  useEffect(() => {
    if (!isArticleOpen) setEnabled(false);
  }, [isArticleOpen]);

  useAutoScroll(contentRef, enabled && isArticleOpen);

  if (!isArticleOpen) return null;

  return (
    <button
      onClick={() => setEnabled((e) => !e)}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 900,
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.04em",
        color: enabled ? "#F4F5F0" : "var(--text-tertiary)",
        background: enabled ? "var(--accent)" : "var(--bg-card)",
        border: `1px solid ${enabled ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 100,
        padding: "10px 20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
      {enabled ? "Auto-scroll ON" : "Auto-scroll"}
    </button>
  );
}
