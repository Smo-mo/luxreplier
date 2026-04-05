import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   LuxReplier - Full Business App
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
  { value: "restaurant", label: "🍽️ Restaurant / Café",
    hints: "Describe your cuisine, specialties, average meal price, seating capacity, terrace, dietary options (vegetarian, vegan, gluten-free), parking, WiFi, dress code, and any special events you host.",
    faqTemplates: [
      { q: "Wéi eng Platen hutt Dir?", a: "" },
      { q: "Hutt Dir eng Terrasse?", a: "" },
      { q: "Akzeptéiert Dir Reservatiounen?", a: "" },
      { q: "Hutt Dir vegetaresch Optiounen?", a: "" },
      { q: "Wou kann ee parken?", a: "" },
    ],
    extraFields: [
      { key: "cuisine", label: "Cuisine Type", placeholder: "e.g. French, Italian, Luxembourgish, International" },
      { key: "avgPrice", label: "Average Meal Price", placeholder: "e.g. €15-25 per person" },
      { key: "capacity", label: "Seating Capacity", placeholder: "e.g. 40 inside, 20 terrace" },
      { key: "dietary", label: "Dietary Options", placeholder: "e.g. Vegetarian, Vegan, Gluten-free, Halal" },
      { key: "reservation", label: "Reservation Policy", placeholder: "e.g. Reservations recommended for evenings, walk-ins welcome at lunch" },
      { key: "parking", label: "Parking Info", placeholder: "e.g. Free parking behind our building on Rue du Fort" },
    ]
  },
  { value: "realestate", label: "🏠 Real Estate Agency",
    hints: "Describe areas you cover, property types (rental, sale, commercial), average price ranges, viewing process, required documents for clients, and commission structure.",
    faqTemplates: [
      { q: "Wéi eng Wunnengen hutt Dir zu Kierchbierg?", a: "" },
      { q: "Wéi leeft eng Visitéierung of?", a: "" },
      { q: "Wéi eng Dokumenter brauch ech?", a: "" },
      { q: "Wéi héich ass d'Provisioun?", a: "" },
      { q: "Akzeptéiert Dir Haustéieren?", a: "" },
    ],
    extraFields: [
      { key: "areas", label: "Areas Covered", placeholder: "e.g. Luxembourg-Ville, Kirchberg, Gasperich, Esch-sur-Alzette" },
      { key: "propTypes", label: "Property Types", placeholder: "e.g. Apartments for rent and sale, Commercial, New construction" },
      { key: "priceRange", label: "Price Range", placeholder: "e.g. Rentals €1,200-4,500/mo, Sales from €400,000" },
      { key: "viewingProcess", label: "Viewing Process", placeholder: "e.g. Contact us to schedule, viewings Monday-Saturday" },
      { key: "commission", label: "Commission Structure", placeholder: "e.g. 1 month rent for rentals, 3% for sales" },
      { key: "docsRequired", label: "Required Documents", placeholder: "e.g. 3 payslips, ID, bank statements for rental applications" },
    ]
  },
  { value: "salon", label: "💇 Hair & Beauty Salon",
    hints: "Describe your services (cuts, coloring, styling, nails, facials), price ranges, brands you use, walk-ins vs appointments only, and any specialties like bridal hair.",
    faqTemplates: [
      { q: "Wéi vill kascht en Coupe?", a: "" },
      { q: "Brauch ech en Termin?", a: "" },
      { q: "Wéi eng Produkter benotzt Dir?", a: "" },
      { q: "Maacht Dir och Bräutzäitsfrisueren?", a: "" },
      { q: "Wéi eng Bezuelméiglechkeete hutt Dir?", a: "" },
    ],
    extraFields: [
      { key: "services", label: "Services Offered", placeholder: "e.g. Cuts, Coloring, Highlights, Extensions, Nails, Waxing, Bridal" },
      { key: "priceRange", label: "Price Range", placeholder: "e.g. Cuts from €25, Color from €65, Highlights from €85" },
      { key: "brands", label: "Brands Used", placeholder: "e.g. L'Oréal Professionnel, Kérastase, Wella" },
      { key: "booking", label: "Booking Policy", placeholder: "e.g. Appointment preferred, walk-ins welcome when available" },
      { key: "specialties", label: "Specialties", placeholder: "e.g. Balayage, Bridal hair, Color correction" },
    ]
  },
  { value: "dental", label: "🦷 Dental / Medical Clinic",
    hints: "Describe treatments offered, insurance accepted (CNS, private), emergency availability, average wait times for appointments, and any specialties.",
    faqTemplates: [
      { q: "Hëlt Dir nei Patienten un?", a: "" },
      { q: "Akzeptéiert Dir CNS?", a: "" },
      { q: "Wat kascht eng Kontroll?", a: "" },
      { q: "Hutt Dir Noutdéngscht?", a: "" },
      { q: "Wéi laang muss ech waarden op en Termin?", a: "" },
    ],
    extraFields: [
      { key: "treatments", label: "Treatments Offered", placeholder: "e.g. Check-ups, Cleanings, Fillings, Root canals, Implants, Whitening, Orthodontics" },
      { key: "insurance", label: "Insurance Accepted", placeholder: "e.g. CNS, DKV, Foyer, Lalux, all major private insurances" },
      { key: "newPatients", label: "New Patients", placeholder: "e.g. Yes, we currently accept new patients" },
      { key: "emergency", label: "Emergency Availability", placeholder: "e.g. Emergency slots available same day, call before coming" },
      { key: "waitTime", label: "Average Wait Time", placeholder: "e.g. Routine check-up: 1-2 weeks, urgent: same day" },
    ]
  },
  { value: "accounting", label: "📊 Accounting / Fiduciary",
    hints: "Describe services (tax returns, bookkeeping, company formation, payroll), client types, industries you specialize in, and your pricing model.",
    faqTemplates: [
      { q: "Wéi vill kascht eng Steiererklärung?", a: "" },
      { q: "Maacht Dir och Firmegrënnung?", a: "" },
      { q: "Hutt Dir eng gratis Erstberodung?", a: "" },
      { q: "A wéi enge Sproochen schafft Dir?", a: "" },
      { q: "Wéi laang dauert eng Steiererklärung?", a: "" },
    ],
    extraFields: [
      { key: "services", label: "Services Offered", placeholder: "e.g. Tax returns, Bookkeeping, Company formation, Payroll, VAT, Annual accounts" },
      { key: "clientTypes", label: "Client Types", placeholder: "e.g. Individuals, Self-employed, SMEs, Startups" },
      { key: "pricing", label: "Pricing Range", placeholder: "e.g. Tax return from €450, Bookkeeping from €200/month" },
      { key: "consultation", label: "Free Consultation", placeholder: "e.g. Free 30-minute initial consultation by appointment" },
      { key: "languages", label: "Working Languages", placeholder: "e.g. French, German, English, Luxembourgish" },
    ]
  },
  { value: "retail", label: "🛍️ Retail / Shop",
    hints: "Describe what you sell, brands carried, price ranges, online ordering availability, return policy, and delivery options.",
    faqTemplates: [
      { q: "Hutt Dir [Produkt] op Lager?", a: "" },
      { q: "Wéi ass Är Retour-Politik?", a: "" },
      { q: "Liwwert Dir?", a: "" },
      { q: "Akzeptéiert Dir Kreditkaarten?", a: "" },
      { q: "Hutt Dir eng Online-Boutique?", a: "" },
    ],
    extraFields: [
      { key: "products", label: "What You Sell", placeholder: "e.g. Clothing, Electronics, Sports gear, Jewelry" },
      { key: "brands", label: "Brands Carried", placeholder: "e.g. Nike, Samsung, local designers" },
      { key: "priceRange", label: "Price Range", placeholder: "e.g. Items from €10 to €500" },
      { key: "delivery", label: "Delivery Options", placeholder: "e.g. In-store pickup, Local delivery, Nationwide shipping" },
      { key: "returns", label: "Return Policy", placeholder: "e.g. 14-day returns, exchange or refund, receipt required" },
    ]
  },
  { value: "plumber", label: "🔧 Plumbing / Trades",
    hints: "Describe services offered, service area, emergency availability, average response time, certifications, and price ranges for common jobs.",
    faqTemplates: [
      { q: "Kënnt Dir haut nach kommen?", a: "" },
      { q: "Wéi vill kascht en [Service]?", a: "" },
      { q: "A wéi enger Regioun schafft Dir?", a: "" },
      { q: "Gëtt Dir Devis?", a: "" },
      { q: "Hutt Dir Zertifikatiounen?", a: "" },
    ],
    extraFields: [
      { key: "services", label: "Services Offered", placeholder: "e.g. Installation, Repair, Maintenance, Emergency, Renovation" },
      { key: "area", label: "Service Area", placeholder: "e.g. Luxembourg-Ville, Esch-sur-Alzette, all Luxembourg" },
      { key: "emergency", label: "Emergency Availability", placeholder: "e.g. 24/7 emergency service available, response within 2 hours" },
      { key: "responseTime", label: "Response Time", placeholder: "e.g. Emergency: 2 hours, Non-urgent: same day or next day" },
      { key: "certifications", label: "Certifications", placeholder: "e.g. Licensed plumber, Gas certification, 10+ years experience" },
    ]
  },
  { value: "other", label: "📌 Other",
    hints: "Describe your services, target customers, pricing, location details, and what makes your business unique.",
    faqTemplates: [
      { q: "What services do you offer?", a: "" },
      { q: "What are your prices?", a: "" },
      { q: "How can I contact you?", a: "" },
      { q: "What are your opening hours?", a: "" },
      { q: "Where are you located?", a: "" },
    ],
    extraFields: [
      { key: "services", label: "Services / Products", placeholder: "Describe what you offer" },
      { key: "priceRange", label: "Price Range", placeholder: "Give an idea of your pricing" },
      { key: "targetClients", label: "Target Clients", placeholder: "Who is your typical customer?" },
    ]
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STRIPE_LINKS = {
  starter: "https://buy.stripe.com/dRm14meDCaAPfy38oK0Ny09",
  business: "https://buy.stripe.com/dRm3cu9jicIX71xeN80Ny0a",
  premium: "https://buy.stripe.com/8x2aEWbrqbETetZ7kG0Ny0b",
};

// ── Plan limits ───────────────────────────────────────────
const PLAN_CONFIG = {
  starter:  { label: "Starter",  price: 99,  maxDocs: 50,  maxLangs: 1,  widget: false, multiLocation: false, apiAccess: false, faq: true,  googleReview: false, bookingEmail: false, vipRecognition: false },
  business: { label: "Business", price: 199, maxDocs: null, maxLangs: 4, widget: true,  multiLocation: false, apiAccess: false, faq: true,  googleReview: true,  bookingEmail: true,  vipRecognition: false },
  premium:  { label: "Premium",  price: 299, maxDocs: null, maxLangs: 5, widget: true,  multiLocation: true,  apiAccess: true,  faq: true,  googleReview: true,  bookingEmail: true,  vipRecognition: true  },
};

// Supabase config (anon key is public by design - protected by RLS policies)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cbuycpifxhavefkmnvcb.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_u0OB9PstjroQRCyAolEk_w_AahiSrsN";

export default function LuxReplier() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(1);
  const [section, setSection] = useState("chat");
  const [lang, setLang] = useState("en");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [industryTab, setIndustryTab] = useState("restaurant");
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [userPlan, setUserPlan] = useState("business"); // set when user clicks a plan

  const [signup, setSignup] = useState({ name: "", email: "", password: "", card: "" });

  const [setup, setSetup] = useState({
    bizName: "", bizType: "restaurant", address: "", phone: "", website: "",
    ownerEmail: "", googleReviewLink: "",
    langs: { fr: true, de: true, en: true, lu: false },
    hours: Object.fromEntries(DAYS.map(d => [d, { open: "09:00", close: "18:00", closed: false }])),
    description: "", menu: null,
    faqItems: [{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }],
    industryFields: {},
  });
  const [vipCustomers, setVipCustomers] = useState([]); // Premium: stores {name, details}
  const [bookingNotif, setBookingNotif] = useState("")
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lx_convs") || "[]"); } catch { return []; }
  });
  const [selectedConv, setSelectedConv] = useState(null);; // shows booking email notification

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
  const [docDetails, setDocDetails] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    items: [{ desc: "", qty: "1", price: "" }, { desc: "", qty: "1", price: "" }, { desc: "", qty: "1", price: "" }],
    emailType: "confirmation", emailSubject: "", emailRecipient: "", emailBody: "",
    invoiceNumber: "", notes: "",
  });
  const plan = PLAN_CONFIG[userPlan] || PLAN_CONFIG.business;

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const saveConversation = (messages, customerName = null) => {
    if (!messages || messages.length < 2) return;
    const conv = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      messages,
      customerName: customerName || "Anonymous",
      hasBooking: messages.some(m => m.content && m.content.includes("BOOKING_CONFIRMED")),
      msgCount: messages.filter(m => m.role === "user").length,
    };
    setConversations(prev => {
      const updated = [conv, ...prev].slice(0, 50);
      try { localStorage.setItem("lx_convs", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const token = params.get("access_token");
      if (token) {
        setResetToken(token);
        setResetMode(true);
        setView("login");
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  // Session check on mount
  useEffect(() => {
    const token = localStorage.getItem("lx_token");
    if (!token) { setAuthLoading(false); return; }
    fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (data.id) {
        setAuthUser(data);
        return fetch(`${SUPABASE_URL}/rest/v1/businesses?user_id=eq.${data.id}&select=*`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, Accept: "application/json" }
        }).then(r => r.json()).then(rows => {
          if (rows && rows[0]) {
            const b = rows[0];
            setSetup(prev => ({ ...prev,
              bizName: b.biz_name || "", bizType: b.biz_type || "restaurant",
              address: b.address || "", phone: b.phone || "", website: b.website || "",
              description: b.description || "", hours: b.hours || prev.hours,
              langs: b.langs || prev.langs, faqItems: b.faq_items || prev.faqItems,
              googleReviewLink: b.google_review_link || "", ownerEmail: b.owner_email || "",
              industryFields: b.industry_fields || {},
            }));
            if (b.plan) setUserPlan(b.plan);
            setView("app");
          } else {
            setView("setup");
          }
        });
      } else {
        localStorage.removeItem("lx_token");
      }
    }).catch(() => localStorage.removeItem("lx_token"))
    .finally(() => setAuthLoading(false));
  }, []);

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
      const faqStr = activeFaqs.length > 0 ? "\n\nFREQUENTLY ASKED QUESTIONS (answer these precisely):\n" + activeFaqs.map((f, i) => "Q" + (i+1) + ": " + f.q + "\nA" + (i+1) + ": " + f.a).join("\n") : "";

      // VIP customers string (Premium)
      const vipStr = plan.vipRecognition && vipCustomers.length > 0 ? "\n\nVIP RETURNING CUSTOMERS (greet them personally if they identify themselves):\n" + vipCustomers.map(v => "- " + v.name + ": " + v.details).join("\n") : "";

      // Google review instruction (Business & Premium)
      const reviewStr = plan.googleReview && setup.googleReviewLink ? "\n\n9. GOOGLE REVIEW: At the end of every completed reservation or inquiry, always add a review invite with the link: " + setup.googleReviewLink : "";

      // Booking email instruction (Business & Premium)
      const bookingEmailStr = plan.bookingEmail && setup.ownerEmail ? "\n\n10. BOOKING CONFIRMATION: When you confirm a reservation, always end your message with this exact line: BOOKING_CONFIRMED:[customer name],[number of people],[date and time],[phone number] - this triggers an automatic email to the owner." : "";

      const sys = `You are the AI assistant for "${setup.bizName}", a ${selectedType.label} in Luxembourg.
Address: ${setup.address || "Luxembourg City"}
Phone: ${setup.phone || "N/A"}
Opening hours: ${hoursStr}
About: ${setup.description || "A local business in Luxembourg."}
Languages spoken: ${activeLangs}${faqStr}${vipStr}

CRITICAL RULES:
1. DETECT the language of the user's message and ALWAYS reply in that SAME language.
2. Keep responses concise (2-4 sentences) and warm.
3. Use positive, friendly emojis naturally but not too many - 1-2 per message max.
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
          bookingEmail: plan.bookingEmail && setup.ownerEmail ? setup.ownerEmail : null,
          bizName: setup.bizName || "Your Business",
        }),
      });
      const data = await res.json();
      let text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "Sorry, something went wrong. Please try again.";
      // Detect booking confirmation and send real email
      if (plan.bookingEmail && setup.ownerEmail && text.includes("BOOKING_CONFIRMED:")) {
        const match = text.match(/BOOKING_CONFIRMED:([^\n]+)/);
        if (match) {
          const details = match[1];
          text = text.replace(/BOOKING_CONFIRMED:[^\n]+\n?/, "").trim();
          // Send real email via Resend
          try {
            await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingEmail: setup.ownerEmail,
                bookingDetails: details,
                bizName: setup.bizName,
                messages: [],
              }),
            });
          } catch(e) {}
          setBookingNotif("📧 Booking email sent to " + setup.ownerEmail + ": " + details);
          setTimeout(() => setBookingNotif(""), 6000);
          if (plan.vipRecognition) {
            const custName = details.split(",")[0].trim();
            if (custName && !vipCustomers.find(v => v.name.toLowerCase() === custName.toLowerCase())) {
              setVipCustomers(prev => [...prev, { name: custName, details: "Previously booked: " + details }]);
            }
          }
        }
      }
      setMsgs(p => [...p, { role: "assistant", content: text }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", content: "Connection issue - please try again in a moment! 😊" }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, loading, msgs, setup, selectedType, hoursStr, activeLangs]);

  const genDoc = useCallback(async () => {
    setDocLoading(true); setDocResult(null);
    const langNames = { en: "English", fr: "French", de: "German", lu: "Luxembourgish" };
    const today = new Date().toLocaleDateString("fr-LU", { day: "2-digit", month: "long", year: "numeric" });
    const invoiceNum = docDetails.invoiceNumber || ("INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random()*9000)+1000));
    const filledItems = docDetails.items.filter(it => it.desc.trim());
    const itemsStr = filledItems.length > 0
      ? filledItems.map(it => it.desc + (it.qty !== "1" ? " (x" + it.qty + ")" : "") + (it.price ? " - €" + it.price : "")).join(", ")
      : "services provided";
    const subtotal = filledItems.reduce((sum, it) => sum + (parseFloat(it.price) * parseFloat(it.qty || 1) || 0), 0);

    const bizContext = "Business: " + setup.bizName + " | Type: " + selectedType.label + " | Address: " + (setup.address || "Luxembourg") + " | Phone: " + (setup.phone || "N/A") + " | Website: " + (setup.website || "N/A") + " | About: " + (setup.description || "Professional business in Luxembourg");

    const prompts = {
      invoice: "Generate a PROFESSIONAL invoice in " + langNames[docLang] + ". Use ONLY the real data below - no sample data.\n\n" +
        bizContext + "\n\nCLIENT: " + (docDetails.clientName || "Client") + (docDetails.clientEmail ? " | Email: " + docDetails.clientEmail : "") + (docDetails.clientPhone ? " | Phone: " + docDetails.clientPhone : "") + "\nINVOICE NUMBER: " + invoiceNum + "\nDATE: " + today + "\nITEMS: " + (filledItems.length > 0 ? filledItems.map(it => it.desc + " | Qty: " + (it.qty||1) + " | Price: EUR" + (it.price||"0")).join(" | ") : "Please fill in items") + (docDetails.notes ? "\nNOTES: " + docDetails.notes : "") + "\n\nFormat as professional invoice: header (business name, address, phone, website), invoice number, date, client details, itemized table with qty/unit price/total, subtotal, TVA 17%, TOTAL in bold, payment terms 30 days. Do NOT invent any data.",

      quote: "Generate a PROFESSIONAL quote in " + langNames[docLang] + ". Use ONLY the real data below.\n\n" +
        bizContext + "\n\nCLIENT: " + (docDetails.clientName || "Client") + (docDetails.clientEmail ? " | Email: " + docDetails.clientEmail : "") + (docDetails.clientPhone ? " | Phone: " + docDetails.clientPhone : "") + "\nSERVICES: " + (filledItems.length > 0 ? filledItems.map(it => it.desc + " | Qty: " + (it.qty||1) + " | Price: EUR" + (it.price||"TBD")).join(" | ") : "services to be quoted") + (docDetails.notes ? "\nNOTES: " + docDetails.notes : "") + "\n\nFormat as professional quote: header, quote number, date, validity 30 days, client details, itemized services table, subtotal, TVA 17%, TOTAL, signature line. Do NOT invent any data.",

      email: "Write a professional business email in " + langNames[docLang] + ". Use ONLY the real data below.\n\n" +
        bizContext + "\n\nTO: " + (docDetails.emailRecipient || docDetails.clientName || "Customer") + (docDetails.clientEmail ? " (" + docDetails.clientEmail + ")" : "") + "\nEMAIL TYPE: " + docDetails.emailType + "\nKEY INFO: " + (docDetails.emailBody || itemsStr) + (docDetails.notes ? "\nNOTES: " + docDetails.notes : "") + "\n\nWrite warm professional email for a " + selectedType.label + ". Concise (3-4 paragraphs), 1-2 emojis, sign off with business name and contact. Do NOT invent any data.",
    };
  }, [docType, docLang, setup, selectedType, docDetails]);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  // ── Supabase auth helpers ──────────────────────────────────
  const sbHeaders = (token) => ({
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });

  const doSignup = async () => {
    setAuthError("");
    if (!signup.name || !signup.email || signup.password.length < 8) {
      setAuthError("Please fill in all fields. Password must be at least 8 characters.");
      return;
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ email: signup.email, password: signup.password, data: { full_name: signup.name } })
      });
      const data = await res.json();
      if (data.error || data.error_description) { setAuthError(data.error_description || data.msg || "Signup failed. Please try again."); return; }
      if (data.access_token) {
        localStorage.setItem("lx_token", data.access_token);
        setAuthUser(data.user);
        setView("setup");
      } else {
        setAuthError("Account created! Please check your email to confirm, then log in.");
      }
    } catch(e) { setAuthError("Connection error. Please try again."); }
  };

  const doLogin = async () => {
    setAuthError("");
    if (!loginForm.email || !loginForm.password) { setAuthError("Please enter your email and password."); return; }
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      });
      const data = await res.json();
      if (data.error || data.error_code) { setAuthError(data.error_description || "Invalid email or password."); return; }
      if (data.access_token) {
        localStorage.setItem("lx_token", data.access_token);
        setAuthUser(data.user);
        const rows = await fetch(`${SUPABASE_URL}/rest/v1/businesses?user_id=eq.${data.user.id}&select=*`, {
          headers: { ...sbHeaders(data.access_token), Accept: "application/json" }
        }).then(r => r.json());
        if (rows && rows[0]) {
          const b = rows[0];
          setSetup(prev => ({ ...prev,
            bizName: b.biz_name || "", bizType: b.biz_type || "restaurant",
            address: b.address || "", phone: b.phone || "", website: b.website || "",
            description: b.description || "", hours: b.hours || prev.hours,
            langs: b.langs || prev.langs, faqItems: b.faq_items || prev.faqItems,
            googleReviewLink: b.google_review_link || "", ownerEmail: b.owner_email || "",
            industryFields: b.industry_fields || {},
          }));
          if (b.plan) setUserPlan(b.plan);
          setView("app");
        } else {
          setView("setup");
        }
      }
    } catch(e) { setAuthError("Connection error. Please try again."); }
  };

  const doLogout = () => {
    const token = localStorage.getItem("lx_token");
    if (token) fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: sbHeaders(token) });
    localStorage.removeItem("lx_token");
    setAuthUser(null);
    setAuthError("");
    setSetup(prev => ({ ...prev, bizName: "", description: "", ownerEmail: "", googleReviewLink: "" }));
    setView("home");
  };

  const doForgotPassword = async () => {
    if (!forgotEmail) { setAuthError("Please enter your email address."); return; }
    setForgotLoading(true); setAuthError("");
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ email: forgotEmail, redirect_to: "https://luxreplier.com" })
      });
      setForgotSent(true);
    } catch(e) { setAuthError("Connection error. Please try again."); }
    setForgotLoading(false);
  };

  const doResetPassword = async () => {
    if (!resetPass || resetPass.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
    if (resetPass !== resetConfirm) { setAuthError("Passwords do not match."); return; }
    setAuthError("");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: { ...sbHeaders(resetToken), "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPass })
      });
      const data = await res.json();
      if (data.error) { setAuthError(data.message || "Reset failed. Link may have expired."); return; }
      setResetDone(true);
      setTimeout(() => { setResetMode(false); setResetToken(""); setView("login"); }, 2500);
    } catch(e) { setAuthError("Connection error. Please try again."); }
  };

  // Trial: 14 days from account creation using Supabase created_at
  const getTrialDaysLeft = () => {
    if (!authUser || !authUser.created_at) return 14;
    const created = new Date(authUser.created_at);
    const now = new Date();
    const daysPassed = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return Math.max(0, 14 - daysPassed);
  };

  const saveBusinessData = async () => {
    const token = localStorage.getItem("lx_token");
    if (!token || !authUser) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/businesses`, {
        method: "POST",
        headers: { ...sbHeaders(token), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: authUser.id, biz_name: setup.bizName, biz_type: setup.bizType,
          address: setup.address, phone: setup.phone, website: setup.website,
          description: setup.description, hours: setup.hours, langs: setup.langs,
          faq_items: setup.faqItems, google_review_link: setup.googleReviewLink || "",
          owner_email: setup.ownerEmail || "", plan: userPlan,
          industry_fields: setup.industryFields || {},
        })
      });
    } catch(e) { console.error("Save failed:", e); }
  };
  const langFlags = { en: "🇬🇧", lb: "🇱🇺", fr: "🇫🇷", de: "🇩🇪", pt: "🇵🇹" };
  const texts = {
    en: { badge: "🎁 14-Day Free Trial. No Credit Card Required.", h1: ["Your business.", "Every language.", "Zero effort."], sub: "AI that answers your customers in French, German, English & Luxembourgish. Creates invoices, quotes, and emails - automatically.", cta: "Start Free Trial - 14 Days", cta2: "See Features", ft: "Everything your business needs", fs: "Simple AI tools that save you hours every day", pt: "Start free. Pay only when ready.", ps: "14-day free trial on all plans. No credit card required.", fin: "Ready to save 15+ hours a week?", fb: "Start Your Free 14-Day Trial" },
    fr: { badge: "🎁 14 jours gratuits. Sans carte bancaire.", h1: ["Votre entreprise.", "Toutes les langues.", "Zéro effort."], sub: "L'IA qui répond à vos clients en français, allemand, anglais et luxembourgeois. Factures, devis et emails - automatiquement.", cta: "Essai Gratuit 14 Jours", cta2: "Fonctionnalités", ft: "Tout ce dont votre entreprise a besoin", fs: "Des outils IA simples qui vous font gagner des heures", pt: "Essayez gratuitement. Payez quand vous voulez.", ps: "14 jours d'essai gratuit. Sans carte bancaire requise.", fin: "Prêt à gagner 15h+ par semaine ?", fb: "Commencer l'Essai Gratuit de 14 Jours" },
    de: { badge: "🎁 14 Tage kostenlos. Keine Kreditkarte.", h1: ["Ihr Geschäft.", "Jede Sprache.", "Null Aufwand."], sub: "KI die Ihren Kunden auf Französisch, Deutsch, Englisch und Luxemburgisch antwortet. Rechnungen und E-Mails - automatisch.", cta: "14 Tage Kostenlos Testen", cta2: "Funktionen", ft: "Alles was Ihr Unternehmen braucht", fs: "Einfache KI-Tools die Stunden sparen", pt: "Kostenlos starten. Zahlen wenn bereit.", ps: "14 Tage kostenlos. Keine Kreditkarte erforderlich.", fin: "Bereit, 15+ Stunden pro Woche zu sparen?", fb: "14 Tage Gratis Testen" },
    lb: { badge: "🎁 14 Deeg gratis. Keng Kreditkaart néideg.", h1: ["Iert Geschäft.", "All Sproochen.", "Null Effort."], sub: "KI dee mat Iere Clienten op Lëtzebuergesch, Franséisch, Däitsch an Englesch schwätzt. Fakturen, Offerten an E-Mailen - automatesch.", cta: "14 Deeg Gratis Testen", cta2: "Features gesinn", ft: "Alles wat Iert Geschäft brauch", fs: "Einfach KI-Tools dei Stonne spueren", pt: "Gratis ufänken. Bezuelen wann prett.", ps: "14 Deeg gratis op alle Pläng. Keng Kreditkaart néideg.", fin: "Prett fir 15+ Stonne d'Woch ze spueren?", fb: "14 Deeg Gratis Testen" },
  };
  const tx = texts[lang] || texts.en;
  const feats = [
    { icon: "💬", color: "#EBF0FF", iconBg: "#2D5BFF", t: "Smart Customer Chat", d: "AI replies in the customer's language in under 3 seconds - French, German, English or Luxembourgish. Available 24/7, even at 2am on Sunday.", stat: "< 3s response time", statIcon: "⚡" },
    { icon: "📄", color: "#EEFBF3", iconBg: "#2EAF65", t: "Instant Documents", d: "Generate professional invoices, quotes and emails in any language with one click. No more 30-minute formatting sessions.", stat: "Save 2h+ per day", statIcon: "⏱️" },
    { icon: "📅", color: "#FBF5EB", iconBg: "#C5963A", t: "Smart Booking Assistant", d: "AI handles reservations end-to-end - checks availability, confirms bookings, collects customer details and notifies you instantly by email.", stat: "Zero missed bookings", statIcon: "✅" },
    { icon: "❓", color: "#F3EBFF", iconBg: "#7C3AED", t: "Smart FAQ Memory", d: "Add your 5 most common questions once. Your AI answers them perfectly every time - prices, parking, menu, dietary options and more.", stat: "100% accurate answers", statIcon: "🎯" },
    { icon: "⭐", color: "#FFF8EB", iconBg: "#F59E0B", t: "Auto Google Reviews", d: "After every interaction, your AI automatically invites satisfied customers to leave a Google review. More 5-star reviews = more new clients.", stat: "More 5★ reviews", statIcon: "📈" },
    { icon: "🔌", color: "#EBF0FF", iconBg: "#2D5BFF", t: "Website Widget & Link", d: "Add AI chat to your website with one line of code. No website? Share a direct link on Google Maps, Instagram or WhatsApp.", stat: "Works everywhere", statIcon: "🌍" },
  ];
  const plans = [
    { n: "Starter", p: "99", f: ["1 language", "AI customer chat", "50 documents/mo", "Smart FAQ (5 Q&As)", "Email support"], link: STRIPE_LINKS.starter },
    { n: "Business", p: "199", f: ["4 languages", "AI chat + documents", "Unlimited documents", "Smart FAQ (5 Q&As)", "📧 Instant booking alerts", "⭐ Auto Google reviews", "Website widget", "Priority support"], pop: true, label: "Best value", link: STRIPE_LINKS.business },
    { n: "Premium", p: "299", f: ["Everything in Business +", "👑 VIP: AI remembers every customer by name", "🎯 Custom AI trained on your exact menu/services", "📍 Multi-location (manage all branches in one place)", "📞 Dedicated account manager - real human support", "🔗 API access - connect to any system", "🏆 First to get every new feature"], link: STRIPE_LINKS.premium },
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

          {/* Desktop nav - hidden on mobile */}
          <div className="hide-m" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="btn btn-g" onClick={() => scrollTo("features")}>Features</button>
            <button className="btn btn-g" onClick={() => scrollTo("showcase")}>Demo</button>
            <button className="btn btn-g" onClick={() => scrollTo("pricing")}>Pricing</button>
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
            {Object.entries(langFlags).map(([c, f]) => (
              <button key={c} onClick={() => setLang(c)} style={{ padding: "5px 8px", border: "none", background: lang === c ? "var(--accent-soft)" : "transparent", borderRadius: 6, cursor: "pointer", fontSize: 15, opacity: lang === c ? 1 : 0.5, transition: "all .2s" }}>{f}</button>
            ))}
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
            <button className="btn btn-g" onClick={() => { setAuthError(""); setView("login"); }}>Login</button>
            <button className="btn btn-p" style={{ padding: "8px 18px" }} onClick={() => { setAuthError(""); setView("signup"); }}>Get Started</button>
            <button className="btn btn-p" onClick={() => { setAuthError(""); setView("signup"); }} style={{ padding: "9px 18px" }}>{tx.cta}</button>
          </div>

          {/* ✅ FIX: Hamburger button uses className="show-m" - no broken ref */}
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
              <button className="btn btn-o" style={{ width: "100%", fontSize: 15 }} onClick={() => { setAuthError(""); setView("login"); setMobileMenu(false); }}>🔑 Login</button>
              <button className="btn btn-o" style={{ width: "100%", fontSize: 15 }} onClick={() => { setView("signup"); setMobileMenu(false); }}>🎬 Demo</button>
              <button className="btn btn-p" style={{ width: "100%", fontSize: 15 }} onClick={() => { setAuthError(""); setView("signup"); setMobileMenu(false); }}>{tx.cta}</button>
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
          <button className="btn btn-p m-full" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => { setAuthError(""); setView("signup"); }}>{tx.cta} →</button>
          <button className="btn btn-o m-full" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => scrollTo("features")}>{tx.cta2}</button>
        </div>
        <div className="fu" style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>
          ✅ No credit card required &nbsp;·&nbsp; ✅ Cancel anytime &nbsp;·&nbsp; ✅ Full access for 14 days
        </div>
      </section>

      {/* Stats */}
      <section className="fu fu4" style={{ maxWidth: 680, margin: "0 auto 56px", padding: "0 24px" }}>
        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[{ n: "5", l: "Languages" }, { n: "24/7", l: "Always On" }, { n: "14", l: "Days Free Trial" }, { n: "5 min", l: "Setup Time" }].map((s, i) => (
            <div key={i} className="card" style={{ padding: "20px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--display)" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Simple Setup</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>Live in 5 minutes</h2>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>No technical knowledge needed. Set up your AI assistant faster than making a coffee.</p>
        </div>
        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, position: "relative" }}>
          {[
            { step: "1", icon: "📝", t: "Sign Up", d: "Create your account in 30 seconds. No credit card needed to start." },
            { step: "2", icon: "🧠", t: "Train Your AI", d: "Enter your business info, FAQ, and opening hours. Takes 3 minutes." },
            { step: "3", icon: "🔗", t: "Add to Your Site", d: "Copy one line of code to your website or share a direct link." },
            { step: "4", icon: "🚀", t: "Go Live", d: "Your AI answers customers 24/7 in 5 languages. You relax." },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "24px 20px", textAlign: "center", boxShadow: "var(--shadow)", position: "relative" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "white", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{s.step}</div>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, background: "var(--green-soft)", color: "var(--green)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>✨ Professional AI - Zero Setup Complexity</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>{tx.ft}</h2>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>{tx.fs}</p>
        </div>

        {/* Trust bar */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 48, padding: "20px 24px", background: "white", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          {[{ n: "5 Languages", d: "FR · DE · EN · LU · PT", icon: "🌍" }, { n: "< 3 seconds", d: "Average response", icon: "⚡" }, { n: "24/7", d: "Always available", icon: "🕐" }, { n: "Free 14 days", d: "No credit card needed", icon: "🎁" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {feats.map((f, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "24px 22px", boxShadow: "var(--shadow)", transition: "all .2s", position: "relative", overflow: "hidden" }}>
              {/* Color accent top bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.iconBg, borderRadius: "16px 16px 0 0" }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>{f.t}</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{f.d}</p>
                </div>
              </div>
              {/* Stat badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: f.color, fontSize: 11, fontWeight: 700, color: f.iconBg }}>
                <span>{f.statIcon}</span>{f.stat}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div style={{ marginTop: 40, padding: "24px 28px", background: "linear-gradient(135deg, var(--navy), #2A4470)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>🇱🇺 Built for Multilingual Markets - Starting from Luxembourg</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Launched in Luxembourg - the heart of multilingual Europe. Built to serve businesses in French, German, English and Lëtzebuergesch, and expanding across borders.</div>
          </div>
          <button className="btn" style={{ background: "white", color: "var(--navy)", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }} onClick={() => scrollTo("pricing")}>See Pricing →</button>
        </div>
      </section>

      {/* Why Luxembourg Section - replaces testimonials until real clients exist */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, background: "var(--gold-soft)", color: "var(--gold)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Built for Luxembourg</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>Why Luxembourg businesses choose LuxReplier</h2>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>The only AI assistant built specifically for the multilingual Luxembourg market.</p>
        </div>
        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "🇱🇺", title: "Only platform supporting Letzebuergesch", desc: "No other AI assistant platform in the world supports native Letzebuergesch. Your Luxembourg customers can chat in their language for the first time.", tag: "Unique advantage" },
            { icon: "🇪🇺", title: "Built in Europe, for Europe", desc: "LuxReplier is hosted on European infrastructure. Designed with privacy in mind for businesses operating in the EU and Luxembourg market.", tag: "EU infrastructure" },
            { icon: "⚡", title: "Live in under 5 minutes", desc: "No developer needed. Fill in your business details, and your AI assistant is live and answering customers immediately. No technical skills required.", tag: "Instant setup" },
          ].map((c, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "28px 22px", boxShadow: "var(--shadow)", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>{c.tag}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 10, lineHeight: 1.4 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: "20px 28px", background: "var(--accent-soft)", borderRadius: 14, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--accent)", fontWeight: 600, margin: 0 }}>
            Be among the first Luxembourg businesses to use AI in Letzebuergesch. Early adopters get priority support and influence upcoming features.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════
           INDUSTRY SHOWCASE  -  SEE YOUR AI IN ACTION
         ════════════════════════════════════ */}
      <section id="showcase" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Live Demo</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>See your AI in action</h2>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>Click your industry to see exactly what your customers will experience  -  in their language, 24/7.</p>
        </div>

        {/* Industry tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
          {[
            { id: "restaurant", label: "Restaurant", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg> },
            { id: "realestate", label: "Real Estate", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
            { id: "salon", label: "Salon", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
            { id: "dental", label: "Dental", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 2 6 5 6 8c0 2 .5 4 1 6 .5 2 1 5 2 6 .5 1 1.5 1 2 0 .5-1 1-3 1-3s.5 2 1 3c.5 1 1.5 1 2 0 1-1 1.5-4 2-6 .5-2 1-4 1-6 0-3-2-6-6-6z"/></svg> },
            { id: "accounting", label: "Accounting", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
            { id: "retail", label: "Retail", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { id: "plumber", label: "Trades", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setIndustryTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `2px solid ${industryTab === tab.id ? "var(--accent)" : "var(--border)"}`, background: industryTab === tab.id ? "var(--accent-soft)" : "white", color: industryTab === tab.id ? "var(--accent)" : "var(--muted)", fontSize: 13, fontWeight: industryTab === tab.id ? 700 : 500, cursor: "pointer", transition: "all .15s" }}>
              <span style={{ color: industryTab === tab.id ? "var(--accent)" : "var(--muted)" }}>{tab.svg}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversation demo card */}
        {(() => {
          const demos = {
            restaurant: {
              lang: "🇫🇷 French",
              title: "Restaurant  -  Table Reservation",
              badge: "📧 Owner receives instant booking email",
              msgs: [
                { role: "user", text: "Bonjour, est-ce que vous avez une table pour 4 ce soir à 20h?" },
                { role: "ai", text: "Bonsoir. Nous avons de la disponibilité ce soir à 20h pour 4 personnes. Pour confirmer la réservation, puis-je avoir votre nom ?" },
                { role: "user", text: "Au nom de Dupont, 621 123 456" },
                { role: "ai", text: "Très bien. Votre table pour 4 personnes est confirmée ce soir à 20h00 au nom de Dupont. Nous vous attendons." },
              ]
            },
            realestate: {
              lang: "🇬🇧 English",
              title: "Real Estate  -  Property Search",
              badge: "📧 Agent receives viewing request with client details",
              msgs: [
                { role: "user", text: "Do you have 2-bedroom apartments in Kirchberg under €2,000/month?" },
                { role: "ai", text: "Yes! We have 3 apartments in Kirchberg matching your criteria:\n1) 2-bed, 75m2, Rue Erasme - 1,850/month\n2) 2-bed, 82m2, Avenue JF Kennedy - 1,950/month\n3) 2-bed with terrace, 90m2, Rue Alphonse Weicker - 1,990/month\nWould you like to schedule a viewing?" },
                { role: "user", text: "The third one sounds great, can I visit this Saturday?" },
                { role: "ai", text: "Certainly. May I take your name and a preferred time on Saturday? Our agent will confirm the appointment." },
              ]
            },
            salon: {
              lang: "🇱🇺 Lëtzebuergesch",
              title: "Hair Salon  -  Appointment Booking",
              badge: "📧 Salon owner gets appointment notification",
              msgs: [
                { role: "user", text: "Moien, wéi vill kascht eng Faarf mat Coupe?" },
                { role: "ai", text: "Moien. Bei eis kascht eng komplett Faarf mat Coupe tëschent 85€ an 120€, jee no Haarlängt. Mir schaffen mat L'Oréal Professionnel. Wëllt Dir en Termin maachen?" },
                { role: "user", text: "Jo, hätt Dir Samschdes moies eppes fräi?" },
                { role: "ai", text: "Dëse Samschdes hu mir nach eng Plaz ëm 10:00 Auer fräi. Darf ech Ären Numm notéieren?" },
              ]
            },
            dental: {
              lang: "🇩🇪 Deutsch",
              title: "Dental Clinic  -  New Patient Inquiry",
              badge: "📧 Clinic receives appointment with patient info",
              msgs: [
                { role: "user", text: "Nehmen Sie neue Patienten auf? Was kostet eine Kontrolle?" },
                { role: "ai", text: "Ja, wir nehmen derzeit neue Patienten auf. Eine Standardkontrolle kostet 65 EUR und wird von der CNS anteilig erstattet. Wir akzeptieren auch Privatversicherungen. Darf ich Ihnen einen Termin vorschlagen?" },
                { role: "user", text: "Ja, möglichst bald bitte." },
                { role: "ai", text: "Der nächste verfügbare Termin ist Donnerstag, 23. April um 14:30 Uhr. Würde Ihnen das passen? Darf ich zunächst Ihren Namen erfahren?" },
              ]
            },
            accounting: {
              lang: "🇫🇷 Français",
              title: "Accounting  -  Tax Return Quote",
              badge: "📧 Accountant receives consultation request",
              msgs: [
                { role: "user", text: "Combien coûte une déclaration fiscale pour un indépendant?" },
                { role: "ai", text: "Pour un indépendant, notre forfait déclaration fiscale est de 450€ HT. Cela inclut la préparation complète, l'optimisation fiscale et le dépôt auprès de l'ACD. Nous proposons également une première consultation gratuite de 30 minutes. Souhaitez-vous prendre rendez-vous?" },
                { role: "user", text: "Oui, la consultation gratuite m'intéresse." },
                { role: "ai", text: "Je vous propose le mardi 8 avril à 10h ou le jeudi 10 avril à 14h. Quel créneau vous convient le mieux ?" },
              ]
            },
            retail: {
              lang: "🇬🇧 English",
              title: "Retail Shop  -  Stock Check",
              badge: "📧 Shop owner gets reservation alert",
              msgs: [
                { role: "user", text: "Do you have the Nike Air Max 90 in size 43?" },
                { role: "ai", text: "Let me check! Yes, we have the Nike Air Max 90 in size 43 in two colors:\n- White/Grey: 139.95 EUR (in stock)\n- Black/Red: 144.95 EUR (in stock)\nWould you like to reserve a pair? We hold reservations for 48 hours at no charge." },
                { role: "user", text: "Yes please, the white ones!" },
                { role: "ai", text: "Done! The Nike Air Max 90 White/Grey in size 43 is reserved for you for 48 hours. Can I get your name and phone number so we can confirm your reservation?" },
              ]
            },
            plumber: {
              lang: "🇱🇺 Lëtzebuergesch",
              title: "Trades  -  Emergency Call",
              badge: "📧 Plumber receives emergency call details",
              msgs: [
                { role: "user", text: "Moien, ech hunn en Waasserschued am Keller, kënnt Dir haut nach kommen?" },
                { role: "ai", text: "Mir hunn en Notdéngscht 7 Deeg d'Woch. En Techniker ka bannent 2 Stonnen bei Iech sinn. D'Deplacement kascht 85€, d'Aarbecht gëtt no Opwand ofgerechent. Wéi ass Är Adress?" },
                { role: "user", text: "14 Rue de Hollerich, Lëtzebuerg-Stad" },
                { role: "ai", text: "Verstanen. Ech schécken en Techniker op 14 Rue de Hollerich. Darf ech Är Telefonnummer notéieren?" },
              ]
            },
          };
          const demo = demos[industryTab] || demos.restaurant;
          return (
            <div className="card" style={{ overflow: "hidden", maxWidth: 680, margin: "0 auto" }}>
              {/* Demo header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{demo.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Conversation in {demo.lang}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 0 2px var(--green-soft)" }} />
                  <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>AI Online</span>
                </div>
              </div>
              {/* Messages */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12, background: "var(--bg)", minHeight: 220 }}>
                {demo.msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
                    {m.role === "ai" && (
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
                    )}
                    <div style={{ maxWidth: "72%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: m.role === "user" ? "var(--accent)" : "white", color: m.role === "user" ? "white" : "var(--text)", fontSize: 13, lineHeight: 1.55, border: m.role === "user" ? "none" : "1px solid var(--border)", whiteSpace: "pre-wrap" }}>{m.text}</div>
                    {m.role === "user" && (
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E8E6E1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--navy)", flexShrink: 0 }}>C</div>
                    )}
                  </div>
                ))}
              </div>
              {/* Result badge */}
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--green-soft)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{demo.badge}</span>
                <button className="btn btn-p" style={{ fontSize: 12, padding: "6px 16px" }} onClick={() => { setAuthError(""); setView("signup"); }}>Try with your business →</button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 56px" }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--navy)", textAlign: "center", marginBottom: 6 }}>{tx.pt}</h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 15, marginBottom: 8 }}>{tx.ps}</p>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 20, background: "var(--green-soft)", color: "var(--green)", fontSize: 13, fontWeight: 700, border: "1px solid var(--green)" }}>
            🎁 All plans include a 14-day free trial. No credit card required.
          </span>
        </div>
        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {plans.map((p, i) => (
            <div key={i} style={{ background: "white", borderRadius: "var(--r)", border: p.pop ? "2px solid var(--accent)" : "1px solid var(--border)", padding: "28px 22px", position: "relative", boxShadow: p.pop ? "var(--shadow-lg)" : "var(--shadow)" }}>
              {p.pop && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "white", padding: "3px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>POPULAR</div>}
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>{p.n}</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 40, fontWeight: 800, color: "var(--navy)", fontFamily: "var(--display)" }}>€{p.p}</span><span style={{ fontSize: 14, color: "var(--muted)" }}>/mo</span></div>
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, marginBottom: p.label ? 4 : 14 }}>14 days free - then €{p.p}/mo</div>
              {p.label ? <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginBottom: 14 }}>{p.label}</div> : null}
              {p.f.map((f, j) => (<div key={j} style={{ fontSize: 13, padding: "5px 0", display: "flex", gap: 8 }}><span style={{ color: "var(--green)" }}>✓</span>{f}</div>))}
              <button className={`btn ${p.pop ? "btn-p" : "btn-o"}`} style={{ width: "100%", marginTop: 18 }} onClick={() => { setUserPlan(p.n.toLowerCase()); setAuthError(""); setView("signup"); }}>Start Free Trial →</button>
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--muted)" }}>No credit card required</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Frequently Asked Questions</h2>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>Everything you need to know before getting started.</p>
        </div>
        {[
          { q: "Do I need technical skills to set up LuxReplier?", a: "No. Setup takes under 5 minutes. You fill in your business details, add your FAQ, and your AI assistant is live immediately. No code, no developer needed." },
          { q: "Does it really support Luxembourgish (Letzebuergesch)?", a: "Yes - LuxReplier is the only AI assistant platform in the world with native Letzebuergesch support. Your customers can chat in Luxembourgish and the AI replies fluently." },
          { q: "What happens if I cancel my subscription?", a: "You can cancel anytime with no penalty. Your AI keeps working until the end of your billing period. Your data is kept for 30 days after cancellation so you can export it." },
          { q: "Can I try before I pay?", a: "Yes. All plans come with a 14-day free trial. No credit card required to start. You only pay if you decide to continue after your trial." },
          { q: "Which types of businesses use LuxReplier?", a: "Restaurants, hair salons, retail shops, medical clinics, real estate agencies, accounting firms, and any Luxembourg business that communicates with multilingual customers." },
          { q: "Is my customer data safe?", a: "Yes. All data is stored on European infrastructure. We never sell your data or use it to train AI models. Read our Privacy Policy for full details." },
        ].map((faq, i) => (
          <details key={i} style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 8, boxShadow: "var(--shadow)" }}>
            <summary style={{ padding: "16px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--navy)", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {faq.q}<span style={{ color: "var(--accent)", fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
            </summary>
            <div style={{ padding: "0 20px 16px", fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{faq.a}</div>
          </details>
        ))}
      </section>

      {/* Owner Access  -  hidden bypass */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "transparent", cursor: "default", userSelect: "none" }}
          onClick={() => { const c = prompt("Code:"); if (c === "LUXOWNER2026") { setAuthUser({ id: "owner", email: "owner@luxreplier.com", created_at: new Date(Date.now()-2*86400000).toISOString() }); localStorage.setItem("lx_token","owner-token"); setView("app"); } }}>·</span>
      </div>

      {/* CTA */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ background: "linear-gradient(135deg, var(--navy), #2A4470)", borderRadius: 18, padding: "48px 32px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, color: "white", fontWeight: 700, marginBottom: 10 }}>{tx.fin}</h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, marginBottom: 24 }}>Built for Luxembourg businesses  -  set up in under 5 minutes</p>
          <button className="btn" style={{ background: "white", color: "var(--navy)", padding: "14px 32px", fontSize: 15, fontWeight: 700 }} onClick={() => { setAuthError(""); setView("signup"); }}>{tx.fb}</button>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 12, marginBottom: 0 }}>No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--navy)", padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, var(--accent), #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>L</div>
                <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>LuxReplier</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: 16, maxWidth: 240 }}>The only AI assistant with native Letzebuergesch support. Built for Luxembourg, expanding across the Greater Region.</p>
              <a href="mailto:contact@luxreplier.com" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>📧 contact@luxreplier.com</a>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Product</div>
              {["Features", "Pricing", "Demo"].map((l, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <button onClick={() => scrollTo(i === 0 ? "features" : i === 1 ? "pricing" : "features")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: 13, cursor: "pointer", padding: 0, textAlign: "left" }}>{l}</button>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Languages</div>
              {["🇱🇺 Letzebuergesch", "🇫🇷 Francais", "🇩🇪 Deutsch", "🇬🇧 English", "🇵🇹 Portugues"].map((l, i) => (
                <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Legal</div>
              {[
                { label: "Privacy Policy", href: "/legal.html#privacy" },
                { label: "Terms of Service", href: "/legal.html#terms" },
                { label: "Impressum", href: "/legal.html#impressum" },
              ].map((l, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <a href={l.href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textDecoration: "none" }}>{l.label}</a>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>© 2026 LuxReplier. All rights reserved. Made with love in Luxembourg 🇱🇺</div>
            <div style={{ display: "flex", gap: 12 }}>
              {["🇱🇺", "🇫🇷", "🇩🇪", "🇬🇧", "🇵🇹"].map((f, i) => <span key={i} style={{ fontSize: 18, opacity: 0.6 }}>{f}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // ═══════════════════════════════════
  //  LOGIN VIEW
  // ═══════════════════════════════════
  if (view === "login") return (
    <div style={{ fontFamily: "var(--font)", minHeight: "100vh", display: "flex" }}>
      <style>{css}</style>

      {/* Left panel - branding */}
      <div className="hide-m" style={{ width: "45%", background: "linear-gradient(160deg, var(--navy) 0%, #2A3F6F 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(45,91,255,0.15)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, fontFamily: "var(--display)" }}>L</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>LuxReplier</span>
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 34, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 16 }}>Your AI assistant is waiting for you</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 40 }}>Sign in to manage your AI assistant, view conversations, and update your business settings.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "🇱🇺", text: "Only platform with native Letzebuergesch" },
              { icon: "💬", text: "AI available 24/7 for your customers" },
              { icon: "📧", text: "Instant booking alerts to your inbox" },
              { icon: "📊", text: "Real-time dashboard and analytics" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Made with love in Luxembourg 🇱🇺</p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ flex: 1, background: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px" }}>
        <div style={{ maxWidth: 400, width: "100%" }}>

          {/* Mobile logo only */}
          <div className="show-m" style={{ display: "none", textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22, fontFamily: "var(--display)", marginBottom: 10 }}>L</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>LuxReplier</div>
          </div>

          <div className="fu" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: "var(--muted)", fontSize: 15 }}>Sign in to your account to continue</p>
          </div>

          {authError && (
            <div className="fu" style={{ background: "var(--red-soft)", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>{authError}</span>
            </div>
          )}

          <div className="card fu fu1" style={{ padding: 28, marginBottom: 16 }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Email Address</label>
              <input type="email" placeholder="your@business.lu" value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                onKeyDown={e => e.key === "Enter" && doLogin()}
                style={{ fontSize: 15 }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="Enter your password" value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && doLogin()}
                style={{ fontSize: 15 }} />
            </div>
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
            </div>
            <button className="btn btn-p" style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 12 }}
              disabled={!loginForm.email || !loginForm.password}
              onClick={doLogin}>
              Sign In to Dashboard →
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setAuthError(""); setForgotEmail(""); setForgotSent(false); setView("forgot"); }}>
              Forgot password?
            </span>
            {" · "}
            Don't have an account?{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}
              onClick={() => { setAuthError(""); setView("signup"); }}>
              Create account
            </span>
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button className="btn btn-g" onClick={() => { setAuthError(""); setView("home"); }} style={{ fontSize: 13, color: "var(--muted)" }}>← Back to website</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════
  //  SIGNUP FLOW
  // ═══════════════════════════════════
  if (view === "forgot") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Reset your password</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Enter your email and we will send you a reset link</div>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {forgotSent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Check your email!</div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>We sent a reset link to <strong>{forgotEmail}</strong>. Click it to set a new password.</div>
              <button className="btn btn-o" style={{ width: "100%" }} onClick={() => { setView("login"); setForgotSent(false); }}>Back to login</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label>Email address</label>
                <input type="email" placeholder="your@email.com" value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doForgotPassword()} />
              </div>
              {authError && <div style={{ fontSize: 13, color: "var(--red)", background: "var(--red-soft)", padding: "10px 14px", borderRadius: 8 }}>{authError}</div>}
              <button className="btn btn-p" style={{ width: "100%", padding: 13 }}
                disabled={forgotLoading || !forgotEmail} onClick={doForgotPassword}>
                {forgotLoading ? "Sending..." : "Send reset link"}
              </button>
              <div style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
                <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => { setAuthError(""); setView("login"); }}>Back to login</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (view === "login" && resetMode) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Set new password</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Choose a strong password for your account</div>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {resetDone ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Password updated!</div>
              <div style={{ fontSize: 14, color: "var(--muted)" }}>Redirecting you to login...</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label>New password</label>
                <input type="password" placeholder="Minimum 8 characters" value={resetPass} onChange={e => setResetPass(e.target.value)} />
              </div>
              <div>
                <label>Confirm new password</label>
                <input type="password" placeholder="Repeat your new password" value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doResetPassword()} />
              </div>
              {authError && <div style={{ fontSize: 13, color: "var(--red)", background: "var(--red-soft)", padding: "10px 14px", borderRadius: 8 }}>{authError}</div>}
              <button className="btn btn-p" style={{ width: "100%", padding: 13 }}
                disabled={!resetPass || !resetConfirm} onClick={doResetPassword}>
                Update password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (view === "signup") return (
    <div style={{ fontFamily: "var(--font)", minHeight: "100vh", display: "flex" }}>
      <style>{css}</style>

      {/* Left panel - branding */}
      <div className="hide-m" style={{ width: "45%", background: "linear-gradient(160deg, #1A2744 0%, var(--accent) 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,0,0,0.15)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, fontFamily: "var(--display)" }}>L</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>LuxReplier</span>
          </div>
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(255,255,255,0.15)", color: "white", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Free for 14 days</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1.25, marginBottom: 16 }}>Join Luxembourg businesses using AI</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 40 }}>Set up your multilingual AI assistant in 5 minutes. No credit card required to start.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "✅", text: "Free 14-day trial - no credit card needed" },
              { icon: "🇱🇺", text: "Supports Letzebuergesch + 4 other languages" },
              { icon: "⚡", text: "Live and answering customers in 5 minutes" },
              { icon: "📧", text: "Instant email alerts for every booking" },
              { icon: "🔒", text: "Your data stays in Europe at all times" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16, width: 24, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: "16px 20px", background: "rgba(255,255,255,0.1)", borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.5 }}>
              "The only AI platform that actually speaks Letzebuergesch." - Made in Luxembourg 🇱🇺
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ flex: 1, background: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px", overflowY: "auto" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>

          {/* Mobile logo */}
          <div className="show-m" style={{ display: "none", textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22, fontFamily: "var(--display)", marginBottom: 10 }}>L</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>LuxReplier</div>
          </div>

          {step === 1 && (
            <div className="fu">
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>Create your account</h1>
                <p style={{ color: "var(--muted)", fontSize: 15 }}>14 days free. No credit card required.</p>
              </div>

              {authError && (
                <div style={{ background: "var(--red-soft)", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>{authError}</span>
                </div>
              )}

              <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Full Name</label>
                  <input placeholder="Jean Dupont" value={signup.name} onChange={e => setSignup({ ...signup, name: e.target.value })} style={{ fontSize: 15 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input type="email" placeholder="jean@monentreprise.lu" value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} style={{ fontSize: 15 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Password</label>
                  <input type="password" placeholder="At least 8 characters" value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} style={{ fontSize: 15 }} />
                  {signup.password.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: signup.password.length >= n * 2 ? (signup.password.length >= 8 ? "var(--green)" : "#F59E0B") : "var(--border)", transition: "all .2s" }} />
                      ))}
                    </div>
                  )}
                </div>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button className="btn btn-g" onClick={() => setView("home")} style={{ fontSize: 13, color: "var(--muted)" }}>← Back to website</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fu" style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>🎉</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>Account created!</h2>
              <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 32 }}>Your account is ready. Choose a plan to unlock all features, or explore the platform first.</p>
              <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Choose your plan</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn btn-o" style={{ width: "100%", padding: "12px 16px", justifyContent: "space-between", fontSize: 14 }}
                    onClick={() => window.open(STRIPE_LINKS.starter, "_blank")}>
                    <span>Starter</span><span style={{ fontWeight: 800, color: "var(--navy)" }}>€99/mo</span>
                  </button>
                  <button className="btn btn-p" style={{ width: "100%", padding: "12px 16px", justifyContent: "space-between", fontSize: 14, position: "relative" }}
                    onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>
                    <span>Business <span style={{ fontSize: 11, background: "rgba(255,255,255,0.3)", padding: "2px 6px", borderRadius: 4 }}>POPULAR</span></span>
                    <span style={{ fontWeight: 800 }}>€199/mo</span>
                  </button>
                  <button className="btn btn-o" style={{ width: "100%", padding: "12px 16px", justifyContent: "space-between", fontSize: 14 }}
                    onClick={() => window.open(STRIPE_LINKS.premium, "_blank")}>
                    <span>Premium</span><span style={{ fontWeight: 800, color: "var(--navy)" }}>€299/mo</span>
                  </button>
                </div>
              </div>
              <button className="btn btn-g" style={{ width: "100%", fontSize: 14, padding: "12px" }} onClick={() => setView("setup")}>
                Explore first, choose plan later →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════
  //  ONBOARDING WIZARD
  // ═══════════════════════════════════
  if (view === "setup") {
    const WIZARD_STEPS = 6;
    const wizardTitles = [
      { icon: "👋", title: "Welcome! Let's get started", sub: "Tell us your business name and type" },
      { icon: "📍", title: "Contact details", sub: "How can customers find and reach you?" },
      { icon: "🌍", title: "Choose your languages", sub: "Which languages do your customers speak?" },
      { icon: "🕐", title: "Opening hours", sub: "When is your business open?" },
      { icon: "🤖", title: "Train your AI", sub: "Tell your AI about your business and FAQ" },
      { icon: "🚀", title: "Almost ready!", sub: "Final settings and activation" },
    ];
    const currentWizard = wizardTitles[wizardStep - 1];
    const canNext1 = setup.bizName.trim().length > 0;
    const canActivate = setup.bizName.trim().length > 0;

    const handleActivate = () => {
      setMsgs([{ role: "assistant", content: setup.langs.fr ? `Bonjour ! Je suis l'assistant IA de ${setup.bizName}. Comment puis-je vous aider aujourd'hui ? 😊` : setup.langs.de ? `Hallo! Ich bin der KI-Assistent von ${setup.bizName}. Wie kann ich Ihnen helfen? 😊` : `Hi! I'm the AI assistant for ${setup.bizName}. How can I help you today? 😊` }]);
      saveBusinessData();
      setView("app");
    };

    return (
      <div style={{ fontFamily: "var(--font)", background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <style>{css}</style>

        {/* Top bar */}
        <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>L</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--navy)" }}>LuxReplier</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Step {wizardStep} of {WIZARD_STEPS}</span>
            <button className="btn btn-g" style={{ fontSize: 12 }} onClick={() => setView("home")}>Save & exit</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "var(--border)", flexShrink: 0 }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), #7C3AED)", width: `${(wizardStep / WIZARD_STEPS) * 100}%`, transition: "width .4s ease", borderRadius: "0 2px 2px 0" }} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px 20px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>

            {/* Step header */}
            <div className="fu" style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{currentWizard.icon}</div>
              <h1 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>{currentWizard.title}</h1>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>{currentWizard.sub}</p>
            </div>

            {/* ── STEP 1: Business basics ── */}
            {wizardStep === 1 && (
              <div className="card fu fu1" style={{ padding: 28 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>Business Name *</label>
                  <input placeholder="e.g. Bella Pasta" value={setup.bizName} onChange={e => setSetup({ ...setup, bizName: e.target.value })} style={{ fontSize: 16 }} autoFocus />
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>This is how your AI will introduce itself to customers.</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>Business Type *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {BUSINESS_TYPES.slice(0, 9).map(b => (
                      <button key={b.value} className="btn" onClick={() => setSetup({ ...setup, bizType: b.value })}
                        style={{ padding: "10px 8px", fontSize: 12, textAlign: "center", justifyContent: "center",
                          background: setup.bizType === b.value ? "var(--accent-soft)" : "white",
                          color: setup.bizType === b.value ? "var(--accent)" : "var(--text)",
                          border: `1.5px solid ${setup.bizType === b.value ? "var(--accent)" : "var(--border)"}`,
                          fontWeight: setup.bizType === b.value ? 700 : 500 }}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                  <select value={setup.bizType} onChange={e => setSetup({ ...setup, bizType: e.target.value })}
                    style={{ marginTop: 8, fontSize: 13, appearance: "auto", color: "var(--muted)" }}>
                    <option value="">Or select from full list...</option>
                    {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── STEP 2: Contact details ── */}
            {wizardStep === 2 && (
              <div className="card fu fu1" style={{ padding: 28 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>📍 Address</label>
                  <input placeholder="12 Rue du Fort, Luxembourg City" value={setup.address} onChange={e => setSetup({ ...setup, address: e.target.value })} />
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Customers will ask your AI for directions and location.</div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>📞 Phone Number</label>
                  <input placeholder="+352 26 12 34 56" value={setup.phone} onChange={e => setSetup({ ...setup, phone: e.target.value })} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>🌐 Website (optional)</label>
                  <input placeholder="https://www.yourbusiness.lu" value={setup.website} onChange={e => setSetup({ ...setup, website: e.target.value })} />
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>We'll help you add the AI chat widget to your website later.</div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Languages ── */}
            {wizardStep === 3 && (
              <div className="fu fu1">
                <div style={{ background: "var(--accent-soft)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
                  💡 LuxReplier is the only AI assistant that speaks native Lëtzebuergesch. Select all languages your customers use.
                </div>
                {plan.maxLangs === 1 && (
                  <div style={{ background: "#FFF3CD", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#856404" }}>
                    ⚠️ Starter plan: 1 language only. <span style={{ cursor: "pointer", textDecoration: "underline", fontWeight: 600 }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>Upgrade to Business for all 5.</span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { k: "fr", f: "🇫🇷", l: "Français", d: "Most common - Luxembourg is 55% Francophone" },
                    { k: "lu", f: "🇱🇺", l: "Lëtzebuergesch", d: "Unique advantage - no other AI platform supports this" },
                    { k: "de", f: "🇩🇪", l: "Deutsch", d: "Essential for German-speaking clients and cross-border" },
                    { k: "en", f: "🇬🇧", l: "English", d: "International clients and expats" },
                  ].map((lng) => {
                    const activeLangCount = Object.values(setup.langs).filter(Boolean).length;
                    const isLocked = plan.maxLangs === 1 && !setup.langs[lng.k] && activeLangCount >= 1;
                    const isActive = setup.langs[lng.k];
                    return (
                      <div key={lng.k}
                        onClick={() => { if (isLocked) { window.open(STRIPE_LINKS.business, "_blank"); return; } setSetup({ ...setup, langs: { ...setup.langs, [lng.k]: !setup.langs[lng.k] } }); }}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `2px solid ${isActive ? "var(--accent)" : "var(--border)"}`, background: isActive ? "var(--accent-soft)" : "white", cursor: isLocked ? "not-allowed" : "pointer", transition: "all .15s", opacity: isLocked ? 0.5 : 1 }}>
                        <span style={{ fontSize: 24 }}>{lng.f}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? "var(--accent)" : "var(--navy)" }}>{lng.l} {isLocked ? "🔒" : ""}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{lng.d}</div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isActive ? "var(--accent)" : "var(--border)"}`, background: isActive ? "var(--accent)" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 800, flexShrink: 0 }}>{isActive ? "✓" : ""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 4: Opening hours ── */}
            {wizardStep === 4 && (
              <div className="card fu fu1" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Tap Open/Closed to toggle each day, then set your times.</div>
                {DAYS.map(day => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 90, fontSize: 13, fontWeight: 600, color: "var(--text)", flexShrink: 0 }}>{day}</div>
                    <button className="btn" style={{ padding: "5px 12px", fontSize: 11, flexShrink: 0, minWidth: 64,
                      background: setup.hours[day].closed ? "var(--red-soft)" : "var(--green-soft)",
                      color: setup.hours[day].closed ? "var(--red)" : "var(--green)", border: "none" }}
                      onClick={() => setSetup({ ...setup, hours: { ...setup.hours, [day]: { ...setup.hours[day], closed: !setup.hours[day].closed } } })}>
                      {setup.hours[day].closed ? "Closed" : "Open"}
                    </button>
                    {!setup.hours[day].closed && (
                      <>
                        <input type="time" value={setup.hours[day].open} style={{ flex: 1, padding: "5px 8px", fontSize: 12 }}
                          onChange={e => setSetup({ ...setup, hours: { ...setup.hours, [day]: { ...setup.hours[day], open: e.target.value } } })} />
                        <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}>to</span>
                        <input type="time" value={setup.hours[day].close} style={{ flex: 1, padding: "5px 8px", fontSize: 12 }}
                          onChange={e => setSetup({ ...setup, hours: { ...setup.hours, [day]: { ...setup.hours[day], close: e.target.value } } })} />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 5: AI Training  -  Industry Specific ── */}
            {wizardStep === 5 && (
              <div className="fu fu1">
                {/* Business description */}
                <div className="card" style={{ padding: 24, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>📝 Describe your business</h3>
                  <div style={{ background: "var(--gold-soft)", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 4 }}>💡 What to include for a {selectedType.label}:</div>
                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>{selectedType.hints}</div>
                  </div>
                  <textarea placeholder="Describe your business here  -  specialities, atmosphere, team, what makes you unique..." rows={4}
                    value={setup.description} onChange={e => setSetup({ ...setup, description: e.target.value })}
                    style={{ minHeight: 100, fontSize: 13 }} />
                </div>

                {/* Industry-specific extra fields */}
                {selectedType.extraFields && selectedType.extraFields.length > 0 && (
                  <div className="card" style={{ padding: 24, marginBottom: 14, border: "2px solid var(--accent-soft)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>🎯 {selectedType.label}  -  Specific Details</h3>
                      <span style={{ fontSize: 10, padding: "2px 8px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 6, fontWeight: 700 }}>Improves AI accuracy</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>These details help your AI give precise answers for YOUR business type.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {selectedType.extraFields.map((field, fi) => (
                        <div key={fi}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 5 }}>{field.label}</label>
                          <input placeholder={field.placeholder}
                            value={(setup.industryFields || {})[field.key] || ""}
                            onChange={e => setSetup({ ...setup, industryFields: { ...(setup.industryFields || {}), [field.key]: e.target.value } })}
                            style={{ fontSize: 13 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ  -  pre-filled with industry Lëtzebuergesch templates */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>❓ FAQ in Lëtzebuergesch</h3>
                    {selectedType.faqTemplates && setup.faqItems.every(f => !f.q) && (
                      <button className="btn btn-g" style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}
                        onClick={() => {
                          const templates = selectedType.faqTemplates || [];
                          const newFaqs = setup.faqItems.map((f, i) => templates[i] ? { q: templates[i].q, a: f.a } : f);
                          setSetup({ ...setup, faqItems: newFaqs });
                        }}>
                        Load {selectedType.label} questions →
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>Pre-filled in Lëtzebuergesch  -  add your answers. You can edit anytime in the dashboard.</p>
                  {setup.faqItems.slice(0, 5).map((faq, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: 12, background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Question {i + 1}</div>
                      <input
                        placeholder={selectedType.faqTemplates?.[i]?.q || "e.g. What are your prices?"}
                        value={faq.q}
                        onChange={e => { const f = [...setup.faqItems]; f[i] = { ...f[i], q: e.target.value }; setSetup({ ...setup, faqItems: f }); }}
                        style={{ marginBottom: 6, fontSize: 13 }} />
                      <textarea
                        placeholder="Type your answer here  -  be as detailed as possible for best AI responses..."
                        value={faq.a} rows={2}
                        onChange={e => { const f = [...setup.faqItems]; f[i] = { ...f[i], a: e.target.value }; setSetup({ ...setup, faqItems: f }); }}
                        style={{ minHeight: 56, fontSize: 12 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 6: Final settings + Activate ── */}
            {wizardStep === 6 && (
              <div className="fu fu1">
                {plan.bookingEmail && (
                  <div className="card" style={{ padding: 24, marginBottom: 14, border: "2px solid var(--accent)" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>📧 Instant Booking Alerts</h3>
                      <span style={{ fontSize: 10, padding: "2px 8px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 6, fontWeight: 700 }}>{plan.label}</span>
                    </div>
                    <input type="email" placeholder="your@email.com" value={setup.ownerEmail}
                      onChange={e => setSetup({ ...setup, ownerEmail: e.target.value })}
                      style={{ marginBottom: 6, fontSize: 14 }} />
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Every customer booking sends you an instant email with their name, date, time and phone. Never miss a reservation.</div>
                  </div>
                )}
                {plan.bookingEmail && (
                  <div className="card" style={{ padding: 24, marginBottom: 14 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>⭐ Google Reviews (optional)</h3>
                    <input placeholder="https://g.page/your-business/review" value={setup.googleReviewLink}
                      onChange={e => setSetup({ ...setup, googleReviewLink: e.target.value })}
                      style={{ fontSize: 13 }} />
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>After every conversation, your AI invites satisfied customers to leave a Google review automatically.</div>
                  </div>
                )}
                <div className="card" style={{ padding: 24, marginBottom: 20, background: "linear-gradient(135deg, var(--navy), #2A4470)", border: "none" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>Your AI is ready to go live!</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 20, lineHeight: 1.6 }}>
                      <strong style={{ color: "white" }}>{setup.bizName || "Your business"}</strong> will have a 24/7 AI assistant speaking {Object.entries(setup.langs).filter(([,v])=>v).length} language{Object.entries(setup.langs).filter(([,v])=>v).length > 1 ? "s" : ""}.
                    </p>
                    <button className="btn" style={{ background: "white", color: "var(--navy)", padding: "14px 32px", fontSize: 15, fontWeight: 800, borderRadius: 12, width: "100%" }}
                      disabled={!canActivate} onClick={handleActivate}>
                      Activate AI Assistant ✨
                    </button>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>You can update any setting anytime from the dashboard.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 20, marginBottom: 40 }}>
              {wizardStep > 1 && (
                <button className="btn btn-g" style={{ flex: 1, padding: 13, fontSize: 14 }} onClick={() => setWizardStep(s => s - 1)}>
                  ← Back
                </button>
              )}
              {wizardStep < WIZARD_STEPS && (
                <button className="btn btn-p" style={{ flex: 2, padding: 13, fontSize: 14, fontWeight: 700 }}
                  disabled={wizardStep === 1 && !canNext1}
                  onClick={() => setWizardStep(s => s + 1)}>
                  Continue →
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }



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
    { id: "contacts", icon: "👥", label: "Contacts" },
    { id: "docs", icon: "📄", label: "Docs" },
    { id: "widget", icon: "🔌", label: "Install", locked: !plan.widget },
    { id: "dash", icon: "📊", label: "Dashboard" },
  ];

  return (
    <div style={{ fontFamily: "var(--font)", background: "var(--bg)", height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      {authUser && getTrialDaysLeft() > 0 && getTrialDaysLeft() <= 14 && !userPlan.includes("paid") && (
        <div style={{ background: getTrialDaysLeft() <= 3 ? "var(--red-soft)" : "var(--green-soft)", borderBottom: "1px solid var(--border)", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: getTrialDaysLeft() <= 3 ? "var(--red)" : "var(--green)", fontWeight: 600 }}>
            {getTrialDaysLeft() <= 3 ? "⚠️" : "🎁"} {getTrialDaysLeft()} day{getTrialDaysLeft() !== 1 ? "s" : ""} remaining in your free trial
          </span>
          <button className="btn btn-p" style={{ fontSize: 11, padding: "4px 12px" }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>Upgrade now →</button>
        </div>
      )}
      {authUser && getTrialDaysLeft() === 0 && (
        <div style={{ background: "#FFF3CD", borderBottom: "1px solid #FFC107", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: "#856404", fontWeight: 600 }}>⏰ Your 14-day free trial has ended. Upgrade to keep all features.</span>
          <button className="btn btn-p" style={{ fontSize: 11, padding: "4px 12px" }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>Choose a plan →</button>
        </div>
      )}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, var(--accent), var(--navy))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800, fontFamily: "var(--display)" }}>L</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--navy)" }}>{setup.bizName || "LuxReplier"}</span>
          <span className="tag tag-g" style={{ fontSize: 10 }}>🟢 Active</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700 }}>{plan.label}</span>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
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
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }} />
          <button className="btn btn-g" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => { if (window.confirm("Sign out of LuxReplier?")) doLogout(); }}>Sign out</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {section === "chat" && (
          <>
            <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 6px" }}>
              <div style={{ maxWidth: 580, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 10, padding: "8px 12px", background: "var(--gold-soft)", borderRadius: 10, fontSize: 12, color: "var(--gold)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>💡 Simulate how customers chat with your AI. Try French, German, Luxembourgish!</span>
                  {msgs.length > 1 && <button className="btn btn-g" style={{ fontSize: 11, padding: "3px 10px", marginLeft: 8, flexShrink: 0 }} onClick={() => { saveConversation(msgs); setMsgs([{ role: "assistant", content: setup.langs.fr ? `Bonjour ! Je suis l'assistant IA de ${setup.bizName}. Comment puis-je vous aider ? 😊` : `Hi! I'm the AI assistant for ${setup.bizName}. How can I help? 😊` }]); }}>New chat ↺</button>}
                </div>
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
        {section === "contacts" && (
          <div style={{ flex: 1, overflow: "auto", padding: "18px 14px" }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>

              {selectedConv ? (
                // ── Conversation detail view ──
                <div>
                  <button className="btn btn-g" style={{ marginBottom: 16, fontSize: 13 }} onClick={() => setSelectedConv(null)}>← Back to contacts</button>
                  <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{selectedConv.customerName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                          {new Date(selectedConv.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {selectedConv.msgCount} message{selectedConv.msgCount !== 1 ? "s" : ""}
                          {selectedConv.hasBooking && <span style={{ marginLeft: 8, color: "var(--green)", fontWeight: 700 }}>✅ Booking</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "14px", maxHeight: 420, overflow: "auto" }}>
                      {selectedConv.messages.map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                          {m.role === "assistant" && <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginRight: 6, flexShrink: 0, marginTop: 2 }}>🤖</div>}
                          <div style={{ maxWidth: "75%", padding: "9px 13px", borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", background: m.role === "user" ? "var(--accent)" : "white", color: m.role === "user" ? "white" : "var(--text)", fontSize: 13, lineHeight: 1.5, border: m.role === "user" ? "none" : "1px solid var(--border)", whiteSpace: "pre-wrap" }}>{m.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // ── Contacts list view ──
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 2 }}>👥 Contacts</h3>
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""} recorded</p>
                    </div>
                    {conversations.length > 0 && (
                      <button className="btn btn-g" style={{ fontSize: 12 }} onClick={() => { if (window.confirm("Clear all conversation history?")) { setConversations([]); localStorage.removeItem("lx_convs"); } }}>Clear history</button>
                    )}
                  </div>

                  {/* VIP customers section */}
                  {vipCustomers.length > 0 && (
                    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: "0 0 12px" }}>👑 VIP Customers  -  {vipCustomers.length} repeat client{vipCustomers.length !== 1 ? "s" : ""}</h4>
                      {vipCustomers.map((v, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < vipCustomers.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👑</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{v.name}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{v.details}</div>
                          </div>
                          <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--gold-soft)", color: "var(--gold)", borderRadius: 6, fontWeight: 700 }}>VIP</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conversation history */}
                  {conversations.length === 0 ? (
                    <div className="card" style={{ padding: 40, textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>No conversations yet</h4>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>When customers chat with your AI, their conversations will appear here. Start by testing your AI in the Chat tab.</p>
                      <button className="btn btn-p" style={{ fontSize: 13 }} onClick={() => setSection("chat")}>Go to Chat tab →</button>
                    </div>
                  ) : (
                    <div className="card" style={{ overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", justifyContent: "space-between" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: 0 }}>Recent Conversations</h4>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{conversations.length} total</span>
                      </div>
                      {conversations.map((conv, i) => (
                        <div key={conv.id} onClick={() => setSelectedConv(conv)}
                          style={{ padding: "12px 16px", borderBottom: i < conversations.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background .15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                          onMouseLeave={e => e.currentTarget.style.background = "white"}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: conv.hasBooking ? "var(--green-soft)" : "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                            {conv.hasBooking ? "📅" : "💬"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{conv.customerName}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {conv.messages[conv.messages.length - 1]?.content?.substring(0, 60)}...
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{new Date(conv.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: conv.hasBooking ? "var(--green)" : "var(--muted)" }}>{conv.hasBooking ? "✅ Booked" : `${conv.msgCount} msgs`}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {section === "docs" && (
          <div style={{ flex: 1, overflow: "auto", padding: "18px 14px" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>

              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--display)", fontSize: 22, color: "var(--navy)", marginBottom: 4 }}>📄 Document Generator</h3>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>Fill in your client details below - the AI generates a perfect professional document using your real information. No invented data.</p>
              </div>

              {/* Step 1 - Document Type & Language */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Step 1 - What do you need?</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[{ id: "invoice", l: "🧾 Invoice", d: "Bill a client for work done" }, { id: "quote", l: "📋 Quote", d: "Price offer before the job" }, { id: "email", l: "✉️ Email", d: "Professional email to a client" }].map(d => (
                    <button key={d.id} onClick={() => { setDocType(d.id); setDocResult(null); }}
                      style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: docType === d.id ? "2px solid var(--accent)" : "1.5px solid var(--border)", background: docType === d.id ? "var(--accent-soft)" : "white", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: docType === d.id ? "var(--accent)" : "var(--navy)" }}>{d.l}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{d.d}</div>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Language of the document:</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ c: "fr", f: "🇫🇷", l: "Français" }, { c: "de", f: "🇩🇪", l: "Deutsch" }, { c: "en", f: "🇬🇧", l: "English" }, { c: "lu", f: "🇱🇺", l: "Lëtzebuergesch" }].map(l => (
                    <button key={l.c} onClick={() => setDocLang(l.c)}
                      style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: docLang === l.c ? "2px solid var(--accent)" : "1.5px solid var(--border)", background: docLang === l.c ? "var(--accent-soft)" : "white", cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: docLang === l.c ? 700 : 500, color: docLang === l.c ? "var(--accent)" : "var(--muted)" }}>
                      <div style={{ fontSize: 18 }}>{l.f}</div>{l.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 - Your Business Info (auto-filled from setup) */}
              <div className="card" style={{ padding: 20, marginBottom: 14, background: "var(--green-soft)", border: "1px solid var(--green)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>✅ Step 2 - Your Business (auto-filled from your setup)</div>
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>
                  <strong>{setup.bizName || "Your Business Name"}</strong> · {selectedType.label}<br/>
                  📍 {setup.address || "Your address"} · 📞 {setup.phone || "Your phone"}{setup.website ? " · 🌐 " + setup.website : ""}
                </div>
                <div style={{ fontSize: 11, color: "var(--green)", marginTop: 6 }}>💡 This info is automatically used in your document - no need to re-enter it.</div>
              </div>

              {/* Step 3 - Client Details */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Step 3 - Client Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label>{docType === "email" ? "👤 Recipient Name *" : "👤 Client Name *"}</label>
                    <input placeholder={docType === "invoice" ? "e.g. Pierre Dupont" : docType === "quote" ? "e.g. Hans Weber GmbH" : "e.g. Sarah Johnson"} value={docDetails.clientName} onChange={e => setDocDetails({ ...docDetails, clientName: e.target.value })} />
                  </div>
                  <div>
                    <label>📧 Client Email</label>
                    <input type="email" placeholder="client@email.com" value={docDetails.clientEmail} onChange={e => setDocDetails({ ...docDetails, clientEmail: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label>📞 Client Phone</label>
                    <input placeholder="+352 621 234 567" value={docDetails.clientPhone} onChange={e => setDocDetails({ ...docDetails, clientPhone: e.target.value })} />
                  </div>
                  {(docType === "invoice") && (
                    <div>
                      <label>🔢 Invoice Number (optional)</label>
                      <input placeholder="e.g. INV-2026-001 (auto if empty)" value={docDetails.invoiceNumber} onChange={e => setDocDetails({ ...docDetails, invoiceNumber: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4 - Items (Invoice & Quote) or Email content */}
              {(docType === "invoice" || docType === "quote") && (
                <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Step 4 - {docType === "invoice" ? "Services / Items Billed" : "Services to Quote"}</div>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
                    {docType === "invoice"
                      ? "Enter what you did for the client and the price. The AI will calculate subtotal + 17% VAT automatically."
                      : "Enter the services you're proposing and your prices. Leave price empty if still to be confirmed."}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Description</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", width: 50, textAlign: "center" }}>Qty</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", width: 80, textAlign: "center" }}>Price €</div>
                  </div>
                  {docDetails.items.map((item, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 8 }}>
                      <input placeholder={
                        selectedType.value === "restaurant" ? ["Private dinner menu", "Wine selection", "Service charge"][i] || "Additional service"
                        : selectedType.value === "salon" ? ["Haircut & styling", "Colouring treatment", "Nail care"][i] || "Additional service"
                        : selectedType.value === "plumber" ? ["Pipe repair labour", "Materials & parts", "Emergency call-out"][i] || "Additional service"
                        : selectedType.value === "dental" ? ["Consultation fee", "Treatment procedure", "X-ray imaging"][i] || "Additional service"
                        : selectedType.value === "accounting" ? ["Tax return preparation", "Bookkeeping (monthly)", "Company formation"][i] || "Additional service"
                        : selectedType.value === "realestate" ? ["Agency commission", "Administrative fees", "Property valuation"][i] || "Additional service"
                        : ["Service description", "Additional service", "Other charges"][i] || "Service"
                      } value={item.desc} onChange={e => { const its = [...docDetails.items]; its[i] = { ...its[i], desc: e.target.value }; setDocDetails({ ...docDetails, items: its }); }} />
                      <input placeholder="1" value={item.qty} onChange={e => { const its = [...docDetails.items]; its[i] = { ...its[i], qty: e.target.value }; setDocDetails({ ...docDetails, items: its }); }} style={{ width: 50, textAlign: "center" }} />
                      <input placeholder="0.00" value={item.price} onChange={e => { const its = [...docDetails.items]; its[i] = { ...its[i], price: e.target.value }; setDocDetails({ ...docDetails, items: its }); }} style={{ width: 80, textAlign: "right" }} />
                    </div>
                  ))}
                  {/* Live total preview */}
                  {docDetails.items.some(it => it.price) && (() => {
                    const sub = docDetails.items.reduce((s, it) => s + (parseFloat(it.price) * parseFloat(it.qty||1) || 0), 0);
                    const vat = parseFloat((sub * 0.17).toFixed(2));
                    const total = parseFloat((sub + vat).toFixed(2));
                    return (
                      <div style={{ marginTop: 12, padding: 12, background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", marginBottom: 4 }}>
                          <span>Subtotal</span><span>€{sub.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", marginBottom: 4 }}>
                          <span>TVA 17%</span><span>€{vat.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "var(--navy)", fontSize: 15, borderTop: "1px solid var(--border)", paddingTop: 6 }}>
                          <span>TOTAL</span><span>€{total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Email specific fields */}
              {docType === "email" && (
                <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Step 4 - Email Details</div>
                  <div style={{ marginBottom: 12 }}>
                    <label>📨 Email Type</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { id: "confirmation", l: "✅ Booking Confirmation" },
                        { id: "reminder", l: "🔔 Appointment Reminder" },
                        { id: "followup", l: "💬 Follow-up" },
                        { id: "quote", l: "📋 Quote Sending" },
                        { id: "thankyou", l: "🙏 Thank You" },
                        { id: "custom", l: "✏️ Custom" },
                      ].map(t => (
                        <button key={t.id} onClick={() => setDocDetails({ ...docDetails, emailType: t.id })}
                          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: docDetails.emailType === t.id ? "2px solid var(--accent)" : "1.5px solid var(--border)", background: docDetails.emailType === t.id ? "var(--accent-soft)" : "white", color: docDetails.emailType === t.id ? "var(--accent)" : "var(--muted)", cursor: "pointer" }}>
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>📝 Key information to include in the email</label>
                    <textarea placeholder={
                      docDetails.emailType === "confirmation" ? "e.g. Reservation for 4 people, Saturday 15 March at 8pm. Table on the terrace as requested."
                      : docDetails.emailType === "reminder" ? "e.g. Appointment on Monday 18 March at 10am. Please arrive 5 minutes early."
                      : docDetails.emailType === "followup" ? "e.g. Following up on our meeting last week regarding the renovation quote."
                      : docDetails.emailType === "quote" ? "e.g. Quote for kitchen renovation - total €4,500 including labour and materials."
                      : docDetails.emailType === "thankyou" ? "e.g. Thank you for dining with us last night. We hope you enjoyed the tasting menu."
                      : "Describe what the email should say..."
                    } rows={3} value={docDetails.emailBody} onChange={e => setDocDetails({ ...docDetails, emailBody: e.target.value })} style={{ minHeight: 80 }} />
                  </div>
                </div>
              )}

              {/* Notes field */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Step 5 - Additional Notes (optional)</div>
                <input placeholder={
                  docType === "invoice" ? "e.g. Payment due within 30 days. Bank transfer preferred."
                  : docType === "quote" ? "e.g. Quote valid for 30 days. 50% deposit required to confirm."
                  : "e.g. Any specific details to mention in the email..."
                } value={docDetails.notes} onChange={e => setDocDetails({ ...docDetails, notes: e.target.value })} />
              </div>

              {/* Generate Button */}
              {plan.maxDocs && docCount >= plan.maxDocs ? (
                <div className="card" style={{ padding: 20, textAlign: "center", background: "var(--red-soft)", border: "1px solid var(--red)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>📄 Document limit reached ({plan.maxDocs}/mo)</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Upgrade to Business for unlimited documents.</div>
                  <button className="btn btn-p" style={{ fontSize: 13 }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>Upgrade to Business →</button>
                </div>
              ) : (
                <button className="btn btn-p" style={{ width: "100%", padding: 16, fontSize: 16, marginBottom: 20 }}
                  onClick={() => { genDoc(); if(plan.maxDocs) setDocCount(c => c+1); }}
                  disabled={docLoading || !docDetails.clientName}>
                  {docLoading ? "Generating your document..." : !docDetails.clientName ? "Enter client name to generate →" : `Generate ${docType === "invoice" ? "Invoice" : docType === "quote" ? "Quote" : "Email"} → ${plan.maxDocs ? "("+docCount+"/"+plan.maxDocs+")" : "Unlimited"}`}
                </button>
              )}

              {docLoading && (
                <div style={{ textAlign: "center", padding: 28, background: "white", borderRadius: 14, marginBottom: 14 }}>
                  <div style={{ marginBottom: 8 }}><span className="dot" style={{ marginRight: 5 }} /><span className="dot" style={{ marginRight: 5 }} /><span className="dot" /></div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>AI is generating your professional document...</div>
                </div>
              )}

              {docResult && !docLoading && (
                <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--green-soft)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✅ Document Ready - Copy and use it!</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" style={{ padding: "4px 12px", fontSize: 12, background: "var(--accent-soft)", color: "var(--accent)", border: "none" }} onClick={() => copyText(docResult, "doc")}>{copied === "doc" ? "Copied! ✓" : "📋 Copy"}</button>
                      <button className="btn" style={{ padding: "4px 12px", fontSize: 12, background: "var(--green-soft)", color: "var(--green)", border: "none" }} onClick={() => { setDocResult(null); setDocDetails({ ...docDetails, clientName: "", clientEmail: "", clientPhone: "", items: [{ desc: "", qty: "1", price: "" }, { desc: "", qty: "1", price: "" }, { desc: "", qty: "1", price: "" }], emailBody: "", notes: "" }); }}>🔄 New</button>
                    </div>
                  </div>
                  <pre style={{ padding: 16, margin: 0, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "monospace", background: "var(--bg)", maxHeight: 400, overflow: "auto" }}>{docResult}</pre>
                  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--muted)" }}>
                    💡 Copy this document → paste into Word, Google Docs or your email client. Adjust any final details before sending.
                  </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--green-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔗</div><div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Direct Chat Link</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Share a link - no website needed</div></div><span className="tag tag-g" style={{ marginLeft: "auto" }}>Ready</span></div>
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 13, color: "var(--accent)", position: "relative", border: "1px solid var(--border)" }}>{`https://chat.luxreplier.lu/${widgetId}`}<button className="btn" style={{ position: "absolute", top: 6, right: 6, padding: "3px 10px", fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", border: "none" }} onClick={() => copyText(`https://chat.luxreplier.lu/${widgetId}`, "link")}>{copied === "link" ? "Copied! ✓" : "Copy"}</button></div>
              </div>
              </PlanLock>
            </div>
          </div>
        )}
        {section === "dash" && (
          <div style={{ flex: 1, overflow: "auto", padding: "18px 14px" }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>

              {/* Welcome header */}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 2 }}>
                  {setup.bizName ? `${setup.bizName}` : "Your Dashboard"}
                </h2>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  {selectedType.label} · {Object.entries(setup.langs).filter(([,v])=>v).length} language{Object.entries(setup.langs).filter(([,v])=>v).length !== 1 ? "s" : ""} active · {plan.label} plan
                </p>
              </div>

              {/* Real stats - based on actual session data */}
              <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { icon: "💬", label: "Messages", value: Math.max(0, msgs.length - 1), note: msgs.length > 1 ? "This session" : "Start chatting!" },
                  { icon: "🌍", label: "Languages", value: Object.entries(setup.langs).filter(([,v])=>v).length, note: Object.entries(setup.langs).filter(([,v])=>v).map(([k])=>({fr:"🇫🇷",de:"🇩🇪",en:"🇬🇧",lu:"🇱🇺"})[k]).join(" ") || "Not set" },
                  { icon: "👑", label: "VIP Clients", value: vipCustomers.length, note: vipCustomers.length > 0 ? vipCustomers[0].name : "Will appear after bookings" },
                  { icon: "📅", label: "Trial Days", value: getTrialDaysLeft(), note: getTrialDaysLeft() > 0 ? "days remaining" : "Trial ended" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "14px 12px", borderLeft: i === 3 && getTrialDaysLeft() <= 3 ? "3px solid var(--red)" : i === 3 ? "3px solid var(--green)" : "3px solid var(--accent)" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{s.icon} {s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)", fontFamily: "var(--display)", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: i === 3 && getTrialDaysLeft() <= 3 ? "var(--red)" : "var(--muted)", fontWeight: 600, marginTop: 4 }}>{s.note}</div>
                  </div>
                ))}
              </div>

              {/* Setup completion checklist */}
              {(() => {
                const checks = [
                  { label: "Business name", done: !!setup.bizName },
                  { label: "Address & phone", done: !!(setup.address && setup.phone) },
                  { label: "Languages selected", done: Object.values(setup.langs).some(Boolean) },
                  { label: "Business description", done: setup.description.length > 20 },
                  { label: "FAQ questions", done: setup.faqItems && setup.faqItems.some(f => f.q && f.a) },
                  { label: "Booking email set", done: !!setup.ownerEmail },
                ];
                const doneCount = checks.filter(c => c.done).length;
                const pct = Math.round((doneCount / checks.length) * 100);
                if (pct === 100) return null;
                return (
                  <div className="card" style={{ padding: 20, marginBottom: 16, border: "2px solid var(--accent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: 0 }}>⚡ Complete your setup  -  {pct}% done</h4>
                      <button className="btn btn-p" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => { setWizardStep(1); setView("setup"); }}>Continue setup →</button>
                    </div>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 4, marginBottom: 14, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), #7C3AED)", borderRadius: 4, transition: "width .5s" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {checks.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.done ? "var(--green-soft)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: c.done ? "var(--green)" : "var(--muted)", flexShrink: 0, fontWeight: 700 }}>{c.done ? "✓" : "○"}</div>
                          <span style={{ color: c.done ? "var(--text)" : "var(--muted)", fontWeight: c.done ? 500 : 400 }}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Quick actions */}
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, margin: "0 0 14px" }}>🚀 Quick Actions</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "💬", label: "Test Your AI", desc: "Chat with your assistant", action: () => setSection("chat"), color: "var(--accent-soft)", textColor: "var(--accent)" },
                    { icon: "🧾", label: "Create Invoice", desc: "Generate a professional doc", action: () => setSection("docs"), color: "var(--green-soft)", textColor: "var(--green)" },
                    { icon: "⚙️", label: "Update Settings", desc: "Edit your business info", action: () => { setWizardStep(1); setView("setup"); }, color: "var(--gold-soft)", textColor: "var(--gold)" },
                    { icon: "🔌", label: "Add to Website", desc: "Get your chat widget code", action: () => setSection("widget"), color: "#F3E8FF", textColor: "#7C3AED" },
                  ].map((a, i) => (
                    <button key={i} className="btn" onClick={a.action}
                      style={{ padding: "14px", textAlign: "left", background: a.color, border: "none", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <div style={{ fontSize: 22 }}>{a.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: a.textColor }}>{a.label}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{a.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP customers (only if any) */}
              {vipCustomers.length > 0 && (
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12, margin: "0 0 12px" }}>👑 VIP Customers ({vipCustomers.length})</h4>
                  {vipCustomers.map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < vipCustomers.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👑</div>
                      <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{v.name}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{v.details}</div></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Account info */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: "0 0 14px" }}>🔑 Account</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "var(--muted)" }}>Email</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{authUser?.email || "Not signed in"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "var(--muted)" }}>Plan</span>
                    <span style={{ fontWeight: 700, color: "var(--accent)", padding: "2px 10px", background: "var(--accent-soft)", borderRadius: 6 }}>{plan.label}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "var(--muted)" }}>Trial</span>
                    <span style={{ fontWeight: 600, color: getTrialDaysLeft() <= 3 ? "var(--red)" : "var(--green)" }}>{getTrialDaysLeft() > 0 ? `${getTrialDaysLeft()} days remaining` : "Expired"}</span>
                  </div>
                  {getTrialDaysLeft() <= 7 && (
                    <button className="btn btn-p" style={{ width: "100%", padding: "10px", fontSize: 13, marginTop: 4 }} onClick={() => window.open(STRIPE_LINKS.business, "_blank")}>
                      Upgrade to Business Plan →
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}