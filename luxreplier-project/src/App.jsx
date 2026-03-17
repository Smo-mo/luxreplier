import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   LuxReplier — Full Business App
   Signup → Setup → Chat Widget → Dashboard
   ═══════════════════════════════════════════════════════ */

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Playfair+Display:wght@600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#FAFAF7;--card:#FFF;--navy:#1A2744;--accent:#2D5BFF;--accent-soft:#EBF0FF;
  --gold:#C5963A;--gold-soft:#FBF5EB;--text:#2D3748;--muted:#8492A6;--border:#E8E6E1;
  --green:#2EAF65;--green-soft:#EEFBF3;--red:#E53E3E;--red-soft:#FFF5F5;
  --r:14px;--shadow:0 1px 3px rgba(26,39,68,0.06),0 8px 24px rgba(26,39,68,0.04);
  --shadow-lg:0 4px 12px rgba(26,39,68,0.08),0 20px 48px rgba(26,39,68,0.06);
  --font:'DM Sans',sans-serif;--display:'Playfair Display',Georgia,serif;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes dotPulse{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-5px);opacity:1}}
.fu{animation:fadeUp .45s ease both}
.fu1{animation-delay:.06s}.fu2{animation-delay:.13s}.fu3{animation-delay:.2s}
.dot{width:6px;height:6px;border-radius:50%;background:var(--accent);display:inline-block}
.dot:nth-child(1){animation:dotPulse 1.2s ease 0s infinite}
.dot:nth-child(2){animation:dotPulse 1.2s ease .15s infinite}
.dot:nth-child(3){animation:dotPulse 1.2s ease .3s infinite}
input,textarea,select{font-family:var(--font);font-size:14px;color:var(--text);
  padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;outline:none;
  width:100%;transition:border .2s;background:white}
input:focus,textarea:focus,select:focus{border-color:var(--accent)}
textarea{resize:vertical;min-height:80px}
label{font-size:12px;font-weight:600;color:var(--muted);display:block;margin-bottom:5px}
.hint{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.4}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:11px 22px;border-radius:10px;border:none;font-family:var(--font);
  font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;text-decoration:none}
.btn:active{transform:scale(.97)}
.btn-p{background:var(--accent);color:white;box-shadow:0 2px 8px rgba(45,91,255,.25)}
.btn-p:hover{box-shadow:0 4px 16px rgba(45,91,255,.35)}
.btn-p:disabled{opacity:.5;cursor:not-allowed}
.btn-o{background:white;color:var(--navy);border:1.5px solid var(--border)}
.btn-o:hover{border-color:var(--accent);color:var(--accent)}
.btn-g{background:transparent;color:var(--muted);border:none}
.btn-g:hover{color:var(--accent)}
.tag{display:inline-block;padding:2px 10px;border-radius:6px;font-size:11px;font-weight:600}
.tag-g{background:var(--green-soft);color:var(--green)}
.tag-b{background:var(--accent-soft);color:var(--accent)}
.tag-w{background:var(--gold-soft);color:var(--gold)}
.card{background:white;border-radius:var(--r);border:1px solid var(--border);box-shadow:var(--shadow)}
@media(max-width:640px){
  .hide-m{display:none!important}.m-full{width:100%!important}
  .m-col{flex-direction:column!important}.m-stack{grid-template-columns:1fr!important}
  .m-2col{grid-template-columns:1fr 1fr!important}
  .m-sm h1{font-size:28px!important}.m-p{padding:16px!important}.show-m{display:block!important}
}
`;

const BUSINESS_TYPES = [
  { value: "restaurant", label: "🍽️ Restaurant / Café", hints: "Describe your cuisine, specialties, average meal price, seating capacity, terrace, dietary options (vegetarian, vegan, gluten-free), parking, WiFi, dress code, and any special events you host." },
  { value: "salon", label: "💇 Hair & Beauty Salon", hints: "Describe your services (cuts, coloring, styling, nails, facials), price ranges, brands you use, walk-ins vs appointments only, and any specialties." },
  { value: "plumber", label: "🔧 Plumbing / Trades", hints: "Describe services offered, service area, emergency availability, average response time, certifications, and price ranges for common jobs." },
  { value: "accounting", label: "📊 Accounting / Fiduciary", hints: "Describe services (tax returns, bookkeeping, company formation, payroll), which languages you serve clients in, industries you specialize in, and hourly/fixed rates." },
  { value: "dental", label: "🦷 Dental / Medical Clinic", hints: "Describe treatments offered, insurance accepted (CNS, private), emergency slots, average wait times, and any specialties (orthodontics, cosmetic)." },
  { value: "retail", label: "🛍️ Retail / Shop", hints: "Describe what you sell, brands carried, price ranges, online ordering availability, return policy, and delivery options." },
  { value: "realestate", label: "🏠 Real Estate Agency", hints: "Describe areas you cover, property types (rental, sale, commercial), average price ranges, and your process for viewings and contracts." },
  { value: "other", label: "📌 Other", hints: "Describe your services, target customers, pricing, location details, and what makes your business unique." },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STRIPE_LINKS = {
  starter: "https://buy.stripe.com/eVq3cubrqaAPadJgVg0Ny06",
  business: "https://buy.stripe.com/fZu7sKcvuaAPclR34q0Ny07",
  premium: "https://buy.stripe.com/8x2fZg1QQ24jetZ0Wi0Ny08",
};

// ── Plan limits ───────────────────────────────────────────
const PLAN_CONFIG = {
  starter:  { label: "Starter",  price: 99,  maxDocs: 50,  maxLangs: 1,  widget: false, multiLocation: false, apiAccess: false, faq: true,  googleReview: false, bookingEmail: false, vipRecognition: false },
  business: { label: "Business", price: 199, maxDocs: null, maxLangs: 4, widget: true,  multiLocation: false, apiAccess: false, faq: true,  googleReview: true,  bookingEmail: true,  vipRecognition: false },
  premium:  { label: "Premium",  price: 299, maxDocs: null, maxLangs: 4, widget: true,  multiLocation: true,  apiAccess: true,  faq: true,  googleReview: true,  bookingEmail: true,  vipRecognition: true  },
};

export default function LuxReplier() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(1);
  const [section, setSection] = useState("chat");
  const [lang, setLang] = useState("en");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userPlan, setUserPlan] = useState("business"); // set when user clicks a plan

  const [signup, setSignup] = useState({ name: "", email: "", password: "", card: "" });

  const [setup, setSetup] = useState({
    bizName: "", bizType: "restaurant", address: "", phone: "", website: "",
    ownerEmail: "", googleReviewLink: "",
    langs: { fr: true, de: true, en: true, lu: false },
    hours: Object.fromEntries(DAYS.map(d => [d, { open: "09:00", close: "18:00", closed: false }])),
    description: "", menu: null,
    faqItems: [{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }],
  });
  const [vipCustomers, setVipCustomers] = useState([]); // Premium: stores {name, details}
  const [bookingNotif, setBookingNotif] = useState(""); // shows booking email notification

  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  const [docType, setDocType] = useState("invoice");
  const [docLang, setDocLang] = useState("fr");
  const [docResult, setDocResult] = useState(null);
  const [docLoading, setDocLoading] = useState(false);

  const [copied, setCopied] = useState("");
  const [docCount, setDocCount] = useState(0);
  const plan = PLAN_CONFIG[userPlan] || PLAN_CONFIG.business;

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const selectedType = BUSINESS_TYPES.find(b => b.value === setup.bizType) || BUSINESS_TYPES[0];

  const widgetId = setup.bizName ? setup.bizName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Math.random().toString(36).slice(2, 8) : "my-business-abc123";

  const copyText = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const hoursStr = DAYS.map(d => {
    const h = setup.hours[d];
    return h.closed ? `${d}: Closed` : `${d}: ${h.open}–${h.close}`;
  }).join("; ");

  const activeLangs = Object.entries(setup.langs).filter(([, v]) => v).map(([k]) =>
    ({ fr: "French", de: "German", en: "English", lu: "Luxembourgish" }[k])).join(", ");

  const sendMsg = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", content: userText }]);
    setLoading(true);
    try {
      // Build FAQ string for AI
      const activeFaqs = setup.faqItems.filter(f => f.q.trim() && f.a.trim());
      const faqStr = activeFaqs.length > 0 ? `

FREQUENTLY ASKED QUESTIONS (answer these precisely):
${activeFaqs.map((f, i) => `Q${i+1}: ${f.q}
A${i+1}: ${f.a}`).join("
")}` : "";

      // VIP customers string (Premium)
      const vipStr = plan.vipRecognition && vipCustomers.length > 0
        ? `

VIP RETURNING CUSTOMERS (greet them personally if they identify themselves):
${vipCustomers.map(v => `- ${v.name}: ${v.details}`).join("
")}`
        : "";

      // Google review instruction (Business & Premium)
      const reviewStr = plan.googleReview && setup.googleReviewLink
        ? `

9. GOOGLE REVIEW: At the end of every completed reservation or inquiry, always add: "Thank you! We hope to see you soon 😊 We'd love your feedback: ${setup.googleReviewLink}"`
        : "";

      // Booking email instruction (Business & Premium)
      const bookingEmailStr = plan.bookingEmail && setup.ownerEmail
        ? `

10. BOOKING CONFIRMATION: When you confirm a reservation, always end your message with exactly this line on its own: "BOOKING_CONFIRMED:[customer name],[people],[date/time],[phone]" — this triggers an automatic email to the owner.`
        : "";

      const sys = `You are the AI assistant for "${setup.bizName}", a ${selectedType.label} in Luxembourg.
Address: ${setup.address || "Luxembourg City"}
Phone: ${setup.phone || "N/A"}
Opening hours: ${hoursStr}
About: ${setup.description || "A local business in Luxembourg."}
Languages spoken: ${activeLangs}${faqStr}${vipStr}

CRITICAL RULES:
1. DETECT the language of the user's message and ALWAYS reply in that SAME language.
2. Keep responses concise (2-4 sentences) and warm.
3. Use positive, friendly emojis naturally but not too many — 1-2 per message max.
4. For RESERVATIONS: Always check against the opening hours above. If closed, suggest nearest available time. Always ask for: number of people, preferred date/time, name, and phone number.
5. For QUESTIONS about menu/services/prices: Answer FIRST from the FAQ above if relevant, then from the business description.
6. For DIRECTIONS: Give helpful info about the address and suggest they check Google Maps.
7. NEVER be negative. Always offer alternatives.
8. Luxembourgish: If someone writes in Luxembourgish, reply in Luxembourgish.${reviewStr}${bookingEmailStr}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 600, system: sys,
          messages: [...msgs.slice(-8), { role: "user", content: userText }].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      let text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "Sorry, something went wrong. Please try again! 😊";
      // Detect booking confirmation and extract details
      if (plan.bookingEmail && setup.ownerEmail && text.includes("BOOKING_CONFIRMED:")) {
        const match = text.match(/BOOKING_CONFIRMED:([^\n]+)/);
        if (match) {
          const details = match[1];
          text = text.replace(/BOOKING_CONFIRMED:[^\n]+\n?/, "").trim();
          // Show booking notification to owner
          setBookingNotif(`📧 Booking summary sent to ${setup.ownerEmail}: ${details}`);
          setTimeout(() => setBookingNotif(""), 6000);
          // VIP: save customer name for Premium
          if (plan.vipRecognition) {
            const custName = details.split(",")[0].trim();
            if (custName && !vipCustomers.find(v => v.name.toLowerCase() === custName.toLowerCase())) {
              setVipCustomers(prev => [...prev, { name: custName, details: `Previously booked: ${details}` }]);
            }
          }
        }
      }
      setMsgs(p => [...p, { role: "assistant", content: text }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", content: "Connection issue — please try again in a moment! 😊" }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, loading, msgs, setup, selectedType, hoursStr, activeLangs]);

  const genDoc = useCallback(async () => {
    setDocLoading(true); setDocResult(null);
    const langNames = { en: "English", fr: "French", de: "German", lu: "Luxembourgish" };
    const prompts = {
      invoice: `Generate a professional invoice in ${langNames[docLang]} for "${setup.bizName}" (${selectedType.label} at ${setup.address || "Luxembourg City"}). Include: business header with Luxembourg address and phone ${setup.phone}, invoice #2026-0042, today's date, a sample client name, 3 realistic line items with EUR prices, subtotal, 17% TVA/VAT, total. Use clean plain-text formatting.`,
      quote: `Generate a professional quote/devis in ${langNames[docLang]} for "${setup.bizName}" (${selectedType.label} in Luxembourg). Include: business header, quote number, date, sample client, 3-4 service items with EUR prices, 30-day validity, payment terms.`,
      email: `Write a professional business email in ${langNames[docLang]} from "${setup.bizName}" (${selectedType.label}) to a client confirming their appointment/order/reservation. Be warm, professional, include a friendly emoji or two.`,
    };
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, messages: [{ role: "user", content: prompts[docType] }] }),
      });
      const data = await res.json();
      setDocResult(data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "Error generating document.");
    } catch { setDocResult("Connection error. Please try again."); }
    setDocLoading(false);
  }, [docType, docLang, setup, selectedType]);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };
  const langFlags = { en: "🇬🇧", fr: "🇫🇷", de: "🇩🇪" };
  const texts = {
    en: { badge: "🇱🇺 Made for Luxembourg Small Businesses", h1: ["Your business.", "Every language.", "Zero effort."], sub: "AI that answers your customers in French, German, English & Luxembourgish. Creates invoices, quotes, and emails — automatically.", cta: "Start Free Trial", cta2: "See Features", ft: "Everything your business needs", fs: "Simple AI tools that save you hours every day", pt: "Simple, transparent pricing", ps: "14-day free trial on all plans. No hidden fees.", fin: "Ready to save 15+ hours a week?", fb: "Start Your 14-Day Free Trial" },
    fr: { badge: "🇱🇺 Conçu pour les PME luxembourgeoises", h1: ["Votre entreprise.", "Toutes les langues.", "Zéro effort."], sub: "L'IA qui répond à vos clients en français, allemand, anglais et luxembourgeois. Factures, devis et emails — automatiquement.", cta: "Essai Gratuit", cta2: "Fonctionnalités", ft: "Tout ce dont votre entreprise a besoin", fs: "Des outils IA simples qui vous font gagner des heures", pt: "Tarifs simples et transparents", ps: "14 jours d'essai gratuit. Sans frais cachés.", fin: "Prêt à gagner 15h+ par semaine ?", fb: "Essai Gratuit de 14 Jours" },
    de: { badge: "🇱🇺 Für Luxemburger Kleinunternehmen", h1: ["Ihr Geschäft.", "Jede Sprache.", "Null Aufwand."], sub: "KI die Ihren Kunden auf Französisch, Deutsch, Englisch und Luxemburgisch antwortet. Rechnungen und E-Mails — automatisch.", cta: "Kostenlos Testen", cta2: "Funktionen", ft: "Alles was Ihr Unternehmen braucht", fs: "Einfache KI-Tools die Stunden sparen", pt: "Einfache, transparente Preise", ps: "14 Tage kostenlos. Keine versteckten Kosten.", fin: "Bereit, 15+ Stunden pro Woche zu sparen?", fb: "14 Tage Kostenlos Testen" },
  };
  const tx = texts[lang] || texts.en;
  const feats = [
    { icon: "💬", t: "Smart Customer Chat", d: "AI answers in the customer's language — 24/7 on your website." },
    { icon: "📄", t: "Instant Documents", d: "Invoices, quotes, and emails in any language with one click." },
    { icon: "📅", t: "Booking Assistant", d: "Handles reservations, confirmations, and reminders automatically." },
    { icon: "📊", t: "Business Dashboard", d: "All conversations, bookings, and documents in one place." },
    { icon: "🔌", t: "Website Widget", d: "One line of code adds AI chat to any website." },
    { icon: "🔗", t: "Shareable Link", d: "No website? Share a direct chat link anywhere." },
  ];
  const plans = [
    { n: "Starter", p: "99", f: ["1 language", "AI customer chat", "50 documents/mo", "Smart FAQ (5 Q&As)", "Email support"], link: STRIPE_LINKS.starter },
    { n: "Business", p: "199", f: ["4 languages", "AI chat + documents", "Unlimited documents", "Smart FAQ (5 Q&As)", "📧 Instant booking alerts", "⭐ Auto Google reviews", "Website widget", "Priority support"], pop: true, label: "Best value", link: STRIPE_LINKS.business },
    { n: "Premium", p: "299", f: ["Everything in Business", "👑 VIP customer recognition", "Custom AI training", "Multi-location", "Dedicated manager", "API access"], link: STRIPE_LINKS.premium },
  ];

  // ═══════════════════════════════════
  //  🏠 LANDING PAGE
  // ═══════════════════════════════════
  if (view === "home") return (
    <div style={{ fontFamily: "var(--font)", background: "var(--bg)", minHeight: "100vh" }}>
      <style>{css}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,247,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 15, fontFamily: "var(--display)" }}>L</div>
            <span style={{ fontWeight: 700, fontSize: 19, color: "var(--navy)" }}>LuxReplier</span>
          </div>

          {/* Desktop nav — hidden on mobile */}
          <div className="hide-m" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="btn btn-g" onClick={() => scrollTo("features")}>Features</button>
            <button className="btn btn-g" onClick={() => scrollTo("pricing")}>Pricing</button>
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
            {Object.entries(langFlags).map(([c, f]) => (
              <button key={c} onClick={() => setLang(c)} style={{ padding: "5px 8px", border: "none", background: lang === c ? "var(--accent-soft)" : "transparent", borderRadius: 6, cursor: "pointer", fontSize: 15, opacity: lang === c ? 1 : 0.5, transition: "all .2s" }}>{f}</button>
            ))}
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
            <button className="btn btn-g" onClick={() => setView("signup")}>Demo</button>
            <button className="btn btn-p" onClick={() => window.open(STRIPE_LINKS.business, "_blank")} style={{ padding: "9px 18px" }}>{tx.cta}</button>
          </div>

          {/* ✅ FIX: Hamburger button uses className="show-m" — no broken ref */}
          <button
            className="show-m"
            onClick={() => setMobileMenu(!mobileMenu)}
            style={{ display: "none", background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--navy)", padding: "4px 8px", lineHeight: 1 }}
          >
            {mobileMenu ? "✕" : "☰"}
          </button>
        </div>

        {/* ✅ Mobile dropdown menu with language flags + Demo */}
        {mobileMenu && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", background: "rgba(250,250,247,0.97)", display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn btn-g" style={{ justifyContent: "flex-start", fontSize: 15 }} onClick={() => scrollTo("features")}>Features</button>
            <button className="btn btn-g" style={{ justifyContent: "flex-start", fontSize: 15 }} onClick={() => scrollTo("pricing")}>Pricing</button>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Language</div>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.entries(langFlags).map(([c, f]) => (
                  <button key={c} onClick={() => { setLang(c); setMobileMenu(false); }}
                    style={{ flex: 1, padding: "8px", border: "none", background: lang === c ? "var(--accent-soft)" : "var(--bg)", borderRadius: 8, cursor: "pointer", fontSize: 20, opacity: lang === c ? 1 : 0.5, transition: "all .2s" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-o" style={{ width: "100%", fontSize: 15 }} onClick={() => { setView("signup"); setMobileMenu(false); }}>🎬 Demo</button>
              <button className="btn btn-p" style={{ width: "100%", fontSize: 15 }} onClick={() => { window.open(STRIPE_LINKS.business, "_blank"); setMobileMenu(false); }}>{tx.cta}</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 48px", textAlign: "center" }}>
        <div className="fu" style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13, fontWeight: 600, marginBottom: 24 }}>{tx.badge}</div>
        <h1 className="fu fu1 m-sm" style={{ fontFamily: "var(--display)", fontSize: 52, fontWeight: 800, color: "var(--navy)", lineHeight: 1.1, marginBottom: 20 }}>
          {tx.h1[0]}<br /><span style={{ background: "linear-gradient(135deg, var(--accent), var(--gold))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{tx.h1[1]}</span><br />{tx.h1[2]}
        </h1>
        <p className="fu fu2" style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 32px" }}>{tx.sub}</p>
        <div className="fu fu3 m-col" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-p m-full" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>{tx.cta} →</button>
          <button className="btn btn-o m-full" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => scrollTo("features")}>{tx.cta2}</button>
        </div>
      </section>

      {/* Stats */}
      <section className="fu fu4" style={{ maxWidth: 680, margin: "0 auto 56px", padding: "0 24px" }}>
        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[{ n: "4", l: "Languages" }, { n: "24/7", l: "Always On" }, { n: "95%", l: "Satisfaction" }, { n: "30s", l: "Setup" }].map((s, i) => (
            <div key={i} className="card" style={{ padding: "20px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--display)" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 56px" }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--navy)", textAlign: "center", marginBottom: 6 }}>{tx.ft}</h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 15, marginBottom: 32 }}>{tx.fs}</p>
        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {feats.map((f, i) => (
            <div key={i} className="card" style={{ padding: "22px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{f.t}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 56px" }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--navy)", textAlign: "center", marginBottom: 6 }}>{tx.pt}</h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 15, marginBottom: 32 }}>{tx.ps}</p>
        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {plans.map((p, i) => (
            <div key={i} style={{ background: "white", borderRadius: "var(--r)", border: p.pop ? "2px solid var(--accent)" : "1px solid var(--border)", padding: "28px 22px", position: "relative", boxShadow: p.pop ? "var(--shadow-lg)" : "var(--shadow)" }}>
              {p.pop && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "white", padding: "3px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>POPULAR</div>}
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>{p.n}</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 40, fontWeight: 800, color: "var(--navy)", fontFamily: "var(--display)" }}>€{p.p}</span><span style={{ fontSize: 14, color: "var(--muted)" }}>/mo</span></div>
              {p.label ? <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginBottom: 18 }}>{p.label}</div> : <div style={{ marginBottom: 18 }} />}
              {p.f.map((f, j) => (<div key={j} style={{ fontSize: 13, padding: "5px 0", display: "flex", gap: 8 }}><span style={{ color: "var(--green)" }}>✓</span>{f}</div>))}
              <button className={`btn ${p.pop ? "btn-p" : "btn-o"}`} style={{ width: "100%", marginTop: 18 }} onClick={() => { setUserPlan(p.n.toLowerCase()); window.open(p.link, "_blank"); }}>{tx.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ background: "linear-gradient(135deg, var(--navy), #2A4470)", borderRadius: 18, padding: "48px 32px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, color: "white", fontWeight: 700, marginBottom: 10 }}>{tx.fin}</h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, marginBottom: 24 }}>Join Luxembourg businesses already using LuxReplier</p>
          <button className="btn" style={{ background: "white", color: "var(--navy)", padding: "14px 32px", fontSize: 15, fontWeight: 700 }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>{tx.fb}</button>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Made in Luxembourg 🇱🇺</div>
        <div style={{ marginBottom: 12 }}>
          <a href="mailto:contact@luxreplier.com" style={{ fontSize: 14, color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            📧 contact@luxreplier.com
          </a>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>© 2026 LuxReplier. All rights reserved.</div>
      </footer>
    </div>
  );

  // ═══════════════════════════════════
  //  SIGNUP FLOW
  // ═══════════════════════════════════
  if (view === "signup") return (
    <div style={{ fontFamily: "var(--font)", background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{css}</style>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }} className="fu">
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22, fontFamily: "var(--display)", marginBottom: 12 }}>L</div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 28, color: "var(--navy)", marginBottom: 6 }}>Start your free trial</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>14 days free · Cancel anytime · All features included</p>
        </div>
        <div className="card fu fu1" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["Account", "Payment"].map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 3, borderRadius: 2, background: step > i ? "var(--accent)" : "var(--border)", transition: "all .3s" }} />
                <div style={{ fontSize: 11, color: step > i ? "var(--accent)" : "var(--muted)", fontWeight: 600, marginTop: 4 }}>Step {i + 1}: {s}</div>
              </div>
            ))}
          </div>
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 14 }}><label>👤 Full Name</label><input placeholder="Marco Rossi" value={signup.name} onChange={e => setSignup({ ...signup, name: e.target.value })} /></div>
              <div style={{ marginBottom: 14 }}><label>📧 Email Address</label><input type="email" placeholder="marco@bellapasta.lu" value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} /></div>
              <div style={{ marginBottom: 20 }}><label>🔒 Password</label><input type="password" placeholder="At least 8 characters" value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} /></div>
              <button className="btn btn-p" style={{ width: "100%", padding: 14, fontSize: 15 }} disabled={!signup.name || !signup.email || signup.password.length < 8} onClick={() => setStep(2)}>Continue →</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ background: "var(--accent-soft)", borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>🛡️ Secure Payment</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>You won't be charged during your 14-day trial. Cancel anytime before it ends and pay nothing.</div>
              </div>
              <div style={{ marginBottom: 14 }}><label>💳 Card Number</label><input placeholder="4242 4242 4242 4242" value={signup.card} onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 16); v = v.replace(/(\d{4})(?=\d)/g, "$1 "); setSignup({ ...signup, card: v }); }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div><label>📅 Expiry</label><input placeholder="MM / YY" /></div>
                <div><label>🔐 CVC</label><input placeholder="123" /></div>
              </div>
              <button className="btn btn-p" style={{ width: "100%", padding: 14, fontSize: 15 }} disabled={signup.card.replace(/\s/g, "").length < 16} onClick={() => { setView("setup"); }}>Start Free Trial →</button>
              <button className="btn btn-g" style={{ width: "100%", marginTop: 8 }} onClick={() => setStep(1)}>← Back</button>
            </div>
          )}
          <div style={{ marginTop: 18, textAlign: "center", fontSize: 11, color: "var(--muted)" }}>🔒 Secured by Stripe · 256-bit encryption · GDPR compliant</div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>Already have an account? <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>Log in</span></div>
        <div style={{ textAlign: "center", marginTop: 8 }}><button className="btn btn-g" onClick={() => setView("home")} style={{ fontSize: 13 }}>← Back to website</button></div>
      </div>
    </div>
  );

  // ═══════════════════════════════════
  //  BUSINESS SETUP WIZARD
  // ═══════════════════════════════════
  if (view === "setup") return (
    <div style={{ fontFamily: "var(--font)", background: "var(--bg)", minHeight: "100vh", padding: "32px 20px" }}>
      <style>{css}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="fu" style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 26, color: "var(--navy)", marginBottom: 6 }}>Set up your AI assistant ✨</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>This takes about 5 minutes. Your AI will be ready immediately after.</p>
        </div>
        <div className="card fu fu1" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>🏪 Business Information</h3>
          <div style={{ marginBottom: 14 }}><label>Business Name *</label><input placeholder="e.g. Bella Pasta" value={setup.bizName} onChange={e => setSetup({ ...setup, bizName: e.target.value })} /></div>
          <div style={{ marginBottom: 14 }}><label>Business Type *</label><select value={setup.bizType} onChange={e => setSetup({ ...setup, bizType: e.target.value })} style={{ appearance: "auto" }}>{BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}</select></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div><label>📍 Address</label><input placeholder="12 Rue du Fort, Luxembourg" value={setup.address} onChange={e => setSetup({ ...setup, address: e.target.value })} /></div>
            <div><label>📞 Phone</label><input placeholder="+352 26 12 34 56" value={setup.phone} onChange={e => setSetup({ ...setup, phone: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label>🌐 Website (optional)</label><input placeholder="https://www.bellapasta.lu" value={setup.website} onChange={e => setSetup({ ...setup, website: e.target.value })} /><div className="hint">If you have one, we'll help you add the AI chat widget to it.</div></div>
        </div>
        <div className="card fu fu2" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>🌍 Languages</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Which languages do your customers speak?{plan.maxLangs === 1 && <span style={{ color: "var(--red)", fontWeight: 700 }}> Starter plan: 1 language only. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>Upgrade for all 4.</span></span>}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ k: "fr", f: "🇫🇷", l: "Français" }, { k: "de", f: "🇩🇪", l: "Deutsch" }, { k: "en", f: "🇬🇧", l: "English" }, { k: "lu", f: "🇱🇺", l: "Lëtzebuergesch" }].map((lng, idx) => {
              const activeLangCount = Object.values(setup.langs).filter(Boolean).length;
              const isLocked = plan.maxLangs === 1 && !setup.langs[lng.k] && activeLangCount >= 1;
              return (
                <button key={lng.k} className="btn"
                  onClick={() => { if (isLocked) { window.open(STRIPE_LINKS.business, "_blank"); return; } setSetup({ ...setup, langs: { ...setup.langs, [lng.k]: !setup.langs[lng.k] } }); }}
                  style={{ flex: 1, minWidth: 100, padding: "10px 12px", fontSize: 13,
                    background: setup.langs[lng.k] ? "var(--accent-soft)" : isLocked ? "var(--bg)" : "white",
                    color: setup.langs[lng.k] ? "var(--accent)" : isLocked ? "var(--border)" : "var(--muted)",
                    border: `1.5px solid ${setup.langs[lng.k] ? "var(--accent)" : isLocked ? "var(--border)" : "var(--border)"}`,
                    fontWeight: setup.langs[lng.k] ? 700 : 500,
                    cursor: isLocked ? "not-allowed" : "pointer" }}>
                  {lng.f} {lng.l}{isLocked ? " 🔒" : ""}
                </button>
              );
            })}
          </div>
        </div>
        <div className="card fu fu2" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>🕐 Opening Hours</h3>
          {DAYS.map(day => (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 85, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{day.slice(0, 3)}</div>
              <button className="btn" style={{ padding: "4px 10px", fontSize: 11, background: setup.hours[day].closed ? "var(--red-soft)" : "var(--green-soft)", color: setup.hours[day].closed ? "var(--red)" : "var(--green)", border: "none", minWidth: 60 }} onClick={() => setSetup({ ...setup, hours: { ...setup.hours, [day]: { ...setup.hours[day], closed: !setup.hours[day].closed } } })}>{setup.hours[day].closed ? "Closed" : "Open"}</button>
              {!setup.hours[day].closed && (<><input type="time" value={setup.hours[day].open} style={{ width: "auto", padding: "4px 8px", fontSize: 12 }} onChange={e => setSetup({ ...setup, hours: { ...setup.hours, [day]: { ...setup.hours[day], open: e.target.value } } })} /><span style={{ fontSize: 12, color: "var(--muted)" }}>to</span><input type="time" value={setup.hours[day].close} style={{ width: "auto", padding: "4px 8px", fontSize: 12 }} onChange={e => setSetup({ ...setup, hours: { ...setup.hours, [day]: { ...setup.hours[day], close: e.target.value } } })} /></>)}
            </div>
          ))}
        </div>
        <div className="card fu fu3" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>📝 Tell the AI about your business</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>The more detail you provide, the better your AI assistant will answer customers.</p>
          <div style={{ background: "var(--gold-soft)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 4 }}>💡 What to include for a {selectedType.label}:</div>
            <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>{selectedType.hints}</div>
          </div>
          <textarea placeholder="Write about your business here..." rows={5} value={setup.description} onChange={e => setSetup({ ...setup, description: e.target.value })} style={{ minHeight: 120 }} />
          <div className="hint">💡 Tip: Write in the language you think in — the AI will translate for customers automatically.</div>
        </div>
        {/* ── FAQ Section (All Plans) ── */}
        <div className="card fu fu3" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>❓ Frequently Asked Questions</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Add your most common Q&As. Your AI will answer these perfectly every time.</p>
          <div style={{ background: "var(--accent-soft)", borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 11, color: "var(--accent)" }}>
            💡 Examples: "What are your prices?", "Do you have parking?", "Is there a terrace?", "Do you accept credit cards?"
          </div>
          {setup.faqItems.map((item, i) => (
            <div key={i} style={{ marginBottom: 12, padding: 12, background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Question {i + 1}</div>
              <input placeholder={`e.g. Do you have vegetarian options?`} value={item.q}
                onChange={e => { const f = [...setup.faqItems]; f[i] = { ...f[i], q: e.target.value }; setSetup({ ...setup, faqItems: f }); }}
                style={{ marginBottom: 6 }} />
              <textarea placeholder={`e.g. Yes! We have a full vegetarian menu including pasta, salads and our famous mushroom risotto.`}
                value={item.a} rows={2}
                onChange={e => { const f = [...setup.faqItems]; f[i] = { ...f[i], a: e.target.value }; setSetup({ ...setup, faqItems: f }); }}
                style={{ minHeight: 60, fontSize: 13 }} />
            </div>
          ))}
          <div className="hint">✅ Leave empty any questions you don't need — only filled ones are used by the AI.</div>
        </div>

        {/* ── Business & Premium: Owner Email + Google Review ── */}
        {plan.bookingEmail && (
          <div className="card fu fu3" style={{ padding: 24, marginBottom: 16, border: "2px solid var(--accent)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>⭐ Smart Features</h3>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700 }}>{plan.label} Plan</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>📧 Your Email (for instant booking alerts)</label>
              <input type="email" placeholder="your@email.com" value={setup.ownerEmail}
                onChange={e => setSetup({ ...setup, ownerEmail: e.target.value })} />
              <div className="hint">Every time a customer books, you receive an instant email with their name, date, time and phone number. Never miss a reservation.</div>
            </div>

            <div style={{ marginBottom: 4 }}>
              <label>⭐ Google Review Link (optional)</label>
              <input placeholder="https://g.page/your-business/review" value={setup.googleReviewLink}
                onChange={e => setSetup({ ...setup, googleReviewLink: e.target.value })} />
              <div className="hint">After every conversation, your AI automatically invites the customer to leave a Google review. More reviews = more clients.</div>
            </div>
          </div>
        )}

        {/* ── Premium: VIP Recognition info ── */}
        {plan.vipRecognition && (
          <div className="card fu fu3" style={{ padding: 24, marginBottom: 16, border: "2px solid var(--gold)", background: "var(--gold-soft)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>👑 VIP Customer Recognition — Active</h3>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
              Your AI automatically remembers every customer who books. Next time they chat, it greets them personally:
              <em style={{ color: "var(--gold)", display: "block", marginTop: 6 }}>"Welcome back Marie! Last time you booked for 4 people — shall I reserve your usual spot?"</em>
            </p>
            <div className="hint" style={{ marginTop: 8 }}>No action needed — this activates automatically from your first booking. 🎉</div>
            {vipCustomers.length > 0 && (
              <div style={{ marginTop: 12, padding: 10, background: "white", borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>👑 VIP Customers ({vipCustomers.length}):</div>
                {vipCustomers.map((v, i) => <div key={i} style={{ color: "var(--text)", padding: "2px 0" }}>• {v.name}</div>)}
              </div>
            )}
          </div>
        )}

        <button className="btn btn-p fu fu3" style={{ width: "100%", padding: 16, fontSize: 16 }} disabled={!setup.bizName}
          onClick={() => { setMsgs([{ role: "assistant", content: setup.langs.fr ? `Bonjour ! Je suis l'assistant IA de ${setup.bizName}. Comment puis-je vous aider aujourd'hui ? 😊` : setup.langs.de ? `Hallo! Ich bin der KI-Assistent von ${setup.bizName}. Wie kann ich Ihnen helfen? 😊` : `Hi! I'm the AI assistant for ${setup.bizName}. How can I help you today? 😊` }]); setView("app"); }}>
          Activate AI Assistant ✨
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════
  //  MAIN APP
  // ═══════════════════════════════════
  // ── Plan lock helper ─────────────────────────────────────
  const PlanLock = ({ feature, requiredPlan, children }) => {
    const locked = (feature === "widget" && !plan.widget) ||
                   (feature === "multiLocation" && !plan.multiLocation) ||
                   (feature === "apiAccess" && !plan.apiAccess);
    if (!locked) return children;
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h3 style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--navy)", marginBottom: 8 }}>
          {requiredPlan} Plan Required
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
          This feature is not included in your <strong>{plan.label}</strong> plan.
          Upgrade to unlock it.
        </p>
        <button className="btn btn-p" onClick={() => window.open(STRIPE_LINKS[requiredPlan.toLowerCase()], "_blank")}>
          Upgrade to {requiredPlan} →
        </button>
      </div>
    );
  };

  const tabs = [
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "docs", icon: "📄", label: "Documents" },
    { id: "widget", icon: "🔌", label: "Install", locked: !plan.widget },
    { id: "dash", icon: "📊", label: "Dashboard" },
  ];

  return (
    <div style={{ fontFamily: "var(--font)", background: "var(--bg)", height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800, fontFamily: "var(--display)" }}>L</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--navy)" }}>{setup.bizName || "LuxReplier"}</span>
          <span className="tag tag-g" style={{ fontSize: 10 }}>🟢 Active</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700 }}>{plan.label}</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab.id} className="btn" onClick={() => setSection(tab.id)}
              style={{ padding: "5px 10px", fontSize: 12, background: section === tab.id ? "var(--accent-soft)" : "transparent",
                color: section === tab.id ? "var(--accent)" : tab.locked ? "var(--border)" : "var(--muted)",
                border: "none", borderRadius: 8, fontWeight: section === tab.id ? 700 : 500,
                position: "relative" }}>
              {tab.icon} <span className="hide-m">{tab.label}</span>
              {tab.locked && <span style={{ fontSize: 9, marginLeft: 2 }}>🔒</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {section === "chat" && (
          <>
            <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 6px" }}>
              <div style={{ maxWidth: 580, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 16, padding: 12, background: "var(--gold-soft)", borderRadius: 10, fontSize: 12, color: "var(--gold)" }}>💡 This is how your customers will chat with your AI. Try typing in French, German, English, or Luxembourgish!</div>
                {bookingNotif && <div style={{ textAlign: "center", marginBottom: 12, padding: "10px 16px", background: "var(--green-soft)", borderRadius: 10, fontSize: 13, color: "var(--green)", fontWeight: 600, animation: "fadeUp .3s ease" }}>{bookingNotif}</div>}
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                    {m.role === "assistant" && <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2 }}>🤖</div>}
                    <div style={{ maxWidth: "75%", padding: "11px 15px", borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: m.role === "user" ? "var(--accent)" : "white", color: m.role === "user" ? "white" : "var(--text)", fontSize: 14, lineHeight: 1.55, border: m.role === "user" ? "none" : "1px solid var(--border)", whiteSpace: "pre-wrap" }}>{m.content}</div>
                  </div>
                ))}
                {loading && (<div style={{ display: "flex", marginBottom: 10 }}><div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8 }}>🤖</div><div style={{ padding: "14px 18px", borderRadius: "14px 14px 14px 3px", background: "white", border: "1px solid var(--border)", display: "flex", gap: 5 }}><span className="dot" /><span className="dot" /><span className="dot" /></div></div>)}
                <div ref={chatEnd} />
              </div>
            </div>
            <div style={{ padding: "8px 14px 12px", background: "white", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ maxWidth: 580, margin: "0 auto", display: "flex", gap: 8 }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message in any language..." style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "2px solid var(--border)", outline: "none", transition: "border .2s" }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
                <button className="btn btn-p" onClick={sendMsg} disabled={loading || !input.trim()} style={{ padding: "11px 18px" }}>Send</button>
              </div>
              <div style={{ maxWidth: 580, margin: "5px auto 0", textAlign: "center", fontSize: 11, color: "var(--muted)" }}>Try: "Bonjour, une table pour 2 ce soir ?" · "Moien, sidd dir op?" · "Was kostet ein Termin?"</div>
            </div>
          </>
        )}
        {section === "docs" && (
          <div style={{ flex: 1, overflow: "auto", padding: "18px 14px" }}>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--navy)", marginBottom: 14 }}>📄 Generate Documents</h3>
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <label>Document Type</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{[{ id: "invoice", l: "🧾 Invoice" }, { id: "quote", l: "📋 Quote" }, { id: "email", l: "✉️ Email" }].map(d => (<button key={d.id} className={`btn ${docType === d.id ? "btn-p" : "btn-o"}`} onClick={() => setDocType(d.id)} style={{ flex: 1, fontSize: 13, padding: "9px 10px" }}>{d.l}</button>))}</div>
                <label>Language</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{[{ c: "fr", f: "🇫🇷" }, { c: "de", f: "🇩🇪" }, { c: "en", f: "🇬🇧" }, { c: "lu", f: "🇱🇺" }].map(l => (<button key={l.c} className={`btn ${docLang === l.c ? "btn-p" : "btn-o"}`} onClick={() => setDocLang(l.c)} style={{ flex: 1, fontSize: 15, padding: "9px 8px" }}>{l.f}</button>))}</div>
                {plan.maxDocs && docCount >= plan.maxDocs ? (
                  <div style={{ background: "var(--red-soft)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>
                      📄 Document limit reached ({plan.maxDocs}/mo)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Upgrade to Business for unlimited documents.</div>
                    <button className="btn btn-p" style={{ fontSize: 13 }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>Upgrade to Business →</button>
                  </div>
                ) : (
                  <button className="btn btn-p" style={{ width: "100%", padding: 13, fontSize: 15 }} onClick={() => { genDoc(); if(plan.maxDocs) setDocCount(c => c+1); }} disabled={docLoading}>{docLoading ? "Generating..." : `Generate → ${plan.maxDocs ? `(${docCount}/${plan.maxDocs})` : "Unlimited"}`}</button>
                )}
              </div>
              {docLoading && <div style={{ textAlign: "center", padding: 28 }}><span className="dot" style={{ marginRight: 5 }} /><span className="dot" style={{ marginRight: 5 }} /><span className="dot" /></div>}
              {docResult && !docLoading && (
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>✅ Document Ready</span>
                    <button className="btn" style={{ padding: "4px 12px", fontSize: 12, background: "var(--accent-soft)", color: "var(--accent)", border: "none" }} onClick={() => copyText(docResult, "doc")}>{copied === "doc" ? "Copied! ✓" : "Copy"}</button>
                  </div>
                  <pre style={{ padding: 16, margin: 0, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "'DM Sans',monospace", background: "var(--bg)", maxHeight: 320, overflow: "auto" }}>{docResult}</pre>
                </div>
              )}
            </div>
          </div>
        )}
        {section === "widget" && (
          <div style={{ flex: 1, overflow: "auto", padding: "18px 14px" }}>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              <PlanLock feature="widget" requiredPlan="Business">
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--navy)", marginBottom: 4 }}>🔌 Add AI Chat to Your Business</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Choose how your customers will reach your AI assistant.</p>
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌐</div><div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Website Chat Widget</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Add a chat bubble to your existing website</div></div><span className="tag tag-g" style={{ marginLeft: "auto" }}>Ready</span></div>
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12, color: "var(--text)", position: "relative", border: "1px solid var(--border)" }}>{`<script src="https://luxreplier.lu/widget/${widgetId}.js"></script>`}<button className="btn" style={{ position: "absolute", top: 6, right: 6, padding: "3px 10px", fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", border: "none" }} onClick={() => copyText(`<script src="https://luxreplier.lu/widget/${widgetId}.js"></script>`, "widget")}>{copied === "widget" ? "Copied! ✓" : "Copy"}</button></div>
              </div>
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--green-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔗</div><div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Direct Chat Link</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Share a link — no website needed</div></div><span className="tag tag-g" style={{ marginLeft: "auto" }}>Ready</span></div>
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 13, color: "var(--accent)", position: "relative", border: "1px solid var(--border)" }}>{`https://chat.luxreplier.lu/${widgetId}`}<button className="btn" style={{ position: "absolute", top: 6, right: 6, padding: "3px 10px", fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", border: "none" }} onClick={() => copyText(`https://chat.luxreplier.lu/${widgetId}`, "link")}>{copied === "link" ? "Copied! ✓" : "Copy"}</button></div>
              </div>
              </PlanLock>
            </div>
          </div>
        )}
        {section === "dash" && (
          <div style={{ flex: 1, overflow: "auto", padding: "18px 14px" }}>
            <div style={{ maxWidth: 580, margin: "0 auto" }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--navy)", marginBottom: 14 }}>📊 Dashboard</h3>
              <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
                {[{ icon: "💬", l: "Chats Today", v: "12", c: "↑ 3 more than yesterday" }, { icon: "📄", l: "Docs Created", v: "8", c: "↑ 2 more than yesterday" }, { icon: "🌍", l: "Languages Used", v: "3", c: "🇫🇷 🇩🇪 🇬🇧" }, { icon: "⚡", l: "Avg Response", v: "<3s", c: "Faster than 95%" }].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "14px 12px" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.icon} {s.l}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)", fontFamily: "var(--display)", margin: "4px 0 2px" }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 600 }}>{s.c}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ marginBottom: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: 0 }}>📅 Today's Reservations</h4><span className="tag tag-g">3 bookings</span></div>
                {[{ time: "12:30", name: "Pierre Dupont", people: 2, lang: "🇫🇷", status: "✅ Confirmed" }, { time: "19:00", name: "Hans Weber", people: 4, lang: "🇩🇪", status: "✅ Confirmed" }, { time: "20:30", name: "Sarah Johnson", people: 3, lang: "🇬🇧", status: "🕐 Pending" }].map((r, i) => (
                  <div key={i} style={{ padding: "10px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "var(--accent-soft)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "var(--accent)", minWidth: 50, textAlign: "center" }}>{r.time}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.name}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{r.people} people · {r.lang}</div></div>
                    <div style={{ fontSize: 12 }}>{r.status}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: 0 }}>📋 Recent Activity</h4></div>
                {[{ t: "2 min ago", icon: "💬", e: "Customer inquiry answered", l: "🇫🇷 French", s: "✅" }, { t: "15 min ago", icon: "📅", e: "Reservation confirmed — Pierre, 2 people, 12:30", l: "🇫🇷 French", s: "✅" }, { t: "45 min ago", icon: "📄", e: "Invoice #2026-0041 generated", l: "🇩🇪 German", s: "✅" }, { t: "1h ago", icon: "💬", e: "Menu questions answered (3 messages)", l: "🇬🇧 English", s: "✅" }, { t: "2h ago", icon: "📍", e: "Directions & parking info provided", l: "🇱🇺 Lëtzeb.", s: "✅" }, { t: "3h ago", icon: "📋", e: "Quote for private event sent", l: "🇫🇷 French", s: "✅" }].map((a, i) => (
                  <div key={i} style={{ padding: "10px 16px", borderBottom: i < 5 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 16 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.e}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{a.t} · {a.l}</div></div>
                    <div style={{ fontSize: 13 }}>{a.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
