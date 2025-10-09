"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [mode, setMode] = useState("MOCK"); // MOCK | LIVE
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! I’m IRS Debt AI. How can I help you today?" },
  ]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, streaming]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || streaming) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");

    if (mode === "MOCK") {
      setStreaming(true);
      const reply = generateMockReply(text);
      try {
        await streamFakeTokens(reply, (delta) => {
          setMessages((m) => {
            const last = m[m.length - 1];
            if (last && last.role === "assistant-draft") {
              last.content += delta;
              return [...m.slice(0, -1), last];
            }
            return [...m, { role: "assistant-draft", content: delta }];
          });
        }, { chunkBy: "word", delay: 30 });
      } finally {
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last && last.role === "assistant-draft") {
            return [...m.slice(0, -1), { role: "assistant", content: last.content }];
          }
          return m;
        });
        setStreaming(false);
      }
      return;
    }

    // LIVE mode: call our API
    try {
      setStreaming(true);
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({
            role: role === "assistant-draft" ? "assistant" : role,
            content,
          })),
        }),
      });

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5));
          if (payload.delta) {
            setMessages((m) => {
              const last = m[m.length - 1];
              if (last && last.role === "assistant-draft") {
                last.content += payload.delta;
                return [...m.slice(0, -1), last];
              }
              return [...m, { role: "assistant-draft", content: payload.delta }];
            });
          }
          if (payload.done) {
            setMessages((m) => {
              const last = m[m.length - 1];
              if (last && last.role === "assistant-draft") {
                return [...m.slice(0, -1), { role: "assistant", content: last.content }];
              }
              return m;
            });
          }
        }
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry—there was a connection issue. Please try again." }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div>
      <div className="card" style={{display:'flex', gap:16}}>
        <div style={{flex:1}}>
          <div className="row" style={{alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div>
              <h2 style={{margin:'6px 0'}}>Chat with IRS Debt AI</h2>
              <div className="muted">Positive, uplifting guidance. Toggle to LIVE for real AI answers.</div>
            </div>
            <div className="row" style={{gap:8, alignItems:'center'}}>
              <span className="badge">{mode} mode</span>
              <button className="btn secondary" onClick={() => setMode(mode === "MOCK" ? "LIVE" : "MOCK")}>Toggle</button>
            </div>
          </div>

          <div ref={logRef} className="log">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "row-end" : "row-start"}>
                <div className={"bubble " + (m.role === "user" ? "user" : "assistant")}>
                  {m.content}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="row-start">
                <div className="bubble assistant">…</div>
              </div>
            )}
          </div>
          <form onSubmit={handleSend} className="row" style={{marginTop:12}}>
            <input className="input" value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Describe your IRS letter, notice, lien, or wage garnishment…" disabled={streaming} />
            <button className="btn brand" disabled={streaming || !draft.trim()}>Send</button>
          </form>
          <div className="muted" style={{marginTop:6}}>Information only, not legal or tax advice. Don’t share SSNs or IRS/Login.gov credentials.</div>
        </div>
        <div className="right-rail">
          <div style={{fontSize:14, fontWeight:600, marginBottom:6}}>Try one</div>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={()=>setDraft(s)} className="input" style={{marginBottom:8, textAlign:'left', cursor:'pointer'}}>{s}</button>
          ))}
          <div className="muted" style={{marginTop:8}}>Need step‑by‑step help? <Link href="/assisted-submit">Start Assisted Submit »</Link></div>
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "I received a CP14 notice saying I owe $16,000. Can I get a payment plan?",
  "My wages were just garnished. What can I do right now?",
  "How do I stop a bank levy while I set up an installment agreement?",
  "Can the IRS put a lien on my house?",
  "Do I qualify for an Offer in Compromise (OIC)?",
  "What is the difference between a short-term and long-term plan?",
];

function generateMockReply(text) {
  const t = text.toLowerCase();
  const POSITIVE_PREFIX = "You're not alone — don't worry. We can tackle this together. I'll give you clear next steps now.\n\n";
  const POSITIVE_SUFFIX = "\n\nWe’ve got this — we’ll solve your back taxes together!";
  const LINKS = {
    account: "https://www.irs.gov/payments/your-online-account",
    opa: "https://www.irs.gov/payments/online-payment-agreement-application",
    levy: "https://www.irs.gov/businesses/small-businesses-self-employed/levy",
    lien: "https://www.irs.gov/businesses/small-businesses-self-employed/understanding-a-federal-tax-lien",
    cnc: "https://www.irs.gov/businesses/small-businesses-self-employed/what-is-currently-not-collectible",
    fta: "https://www.irs.gov/businesses/small-businesses-self-employed/penalty-relief-due-to-first-time-penalty-abatement-or-other-administrative-waiver",
    idverify: "https://www.irs.gov/identity-theft-fraud-scams/get-an-identity-protection-pin",
    transcripts: "https://www.irs.gov/individuals/get-transcript",
    oic: "https://www.irs.gov/offer-in-compromise",
    oic_tool: "https://irs.treasury.gov/oic_pre_qualifier/"
  };
  const humanize = (id) => ({
    account: "IRS Online Account",
    opa: "Apply for a Payment Plan (OPA)",
    levy: "About IRS Levies",
    lien: "About Federal Tax Liens",
    cnc: "Currently Not Collectible (CNC)",
    fta: "First-Time Penalty Abatement",
    idverify: "Identity Verification & IP PIN",
    transcripts: "Get Transcript",
    oic: "Offer in Compromise (OIC)",
    oic_tool: "OIC Pre-Qualifier Tool",
  }[id] || id);
  const linkList = (ids=[]) => ids.length ? "\n\nHelpful links:\n" + ids.map(id=>`• ${humanize(id)}: ${LINKS[id]}`).join("\n") : "";

  if (t.includes("cp14") || t.includes("payment plan") || t.includes("installment")) {
    const body = `You can usually set up a monthly **installment agreement** online if your total balance is under $50,000 and your required returns are filed.\n\nNext steps:\n1) Sign in to your IRS Online Account.\n2) Go to Payments → Apply for a Payment Plan.\n3) Choose a Long-term plan (up to 72 months).\n4) Pick a draft day and—if possible—Direct Debit for a lower setup fee.\n\nTip: You can propose an amount that pays the balance within the term, then make extra payments anytime to reduce interest.`;
    return POSITIVE_PREFIX + body + linkList(['account','opa']) + POSITIVE_SUFFIX;
  }
  if (t.includes("garnish") || t.includes("garnishment") || t.includes("wage")) {
    const body = `A wage garnishment (continuous levy) keeps pulling from paychecks until your debt is resolved. You can often release it by:\n\n• Setting up an installment agreement or qualifying for Currently Not Collectible (CNC) if finances are tight.\n• Asking your employer for the levy release after the IRS issues it.\n• If there’s hardship, call the IRS at the number on your notice to request an expedited review.\n\nHave your latest pay stubs and monthly expense info handy.`;
    return POSITIVE_PREFIX + body + linkList(['opa','cnc','levy']) + POSITIVE_SUFFIX;
  }
  if (t.includes("levy") || t.includes("bank levy")) {
    const body = `A bank levy pulls funds from your account once per levy event. To prevent future levies, act quickly: apply for a payment plan, request a release if it causes hardship, or seek CNC status. If a levy already hit, contact the IRS immediately with proof of hardship (rent, utilities, childcare, medical).`;
    return POSITIVE_PREFIX + body + linkList(['opa','cnc','levy']) + POSITIVE_SUFFIX;
  }
  if (t.includes("lien")) {
    const body = `A federal tax lien is a public claim on your property—not a levy. Paying the balance or entering certain agreements can lead to lien release after full payment, or withdrawal in limited cases. If you qualify for a Direct Debit installment agreement and owe $25k or less, you may request lien withdrawal after several successful payments.`;
    return POSITIVE_PREFIX + body + linkList(['lien','opa']) + POSITIVE_SUFFIX;
  }
  if (t.includes("offer in compromise") || t.includes("oic")) {
    const body = `An Offer in Compromise (OIC) can settle your tax debt for less than the full amount if paying in full would create serious financial hardship.\n\nEligibility basics:\n• Be current with filing all required returns.\n• The IRS reviews your income, necessary living expenses, and equity in assets.\n• There’s a non-refundable application fee and initial payment.\n\nHow to explore it: Use the IRS OIC Pre-Qualifier Tool first, then review Form 656-B (OIC booklet) for documentation and payment options.`;
    return POSITIVE_PREFIX + body + linkList(['oic','oic_tool']) + POSITIVE_SUFFIX;
  }
  if (t.includes("penalty") || t.includes("abatement") || t.includes("fta")) {
    const body = `You may qualify for First-Time Penalty Abatement (FTA) if you’ve filed and paid on time for the prior 3 years (and filed the current return). It can remove failure-to-file/failure-to-pay penalties once. \n\nHow to try it: Call the IRS (number on your notice) and request FTA, or write a short letter citing your clean compliance history.`;
    return POSITIVE_PREFIX + body + linkList(['fta']) + POSITIVE_SUFFIX;
  }
  if (t.includes("id verify") || t.includes("identity") || t.includes("id.me") || t.includes("login.gov")) {
    const body = `If the IRS asked you to verify identity, complete that step first—then payment plan options open up. Consider getting an IP PIN for added protection going forward.`;
    return POSITIVE_PREFIX + body + linkList(['idverify','account']) + POSITIVE_SUFFIX;
  }
  if (t.includes("transcript") || t.includes("transcripts")) {
    const body = `You can pull your tax transcripts online to confirm balances, notices, and filing history. That helps decide between short-term payment, long-term installment, or hardship options.`;
    return POSITIVE_PREFIX + body + linkList(['transcripts','account']) + POSITIVE_SUFFIX;
  }
  if (t.includes("cp501") || t.includes("cp503") || t.includes("cp504")) {
    const body = `Those are reminder/urgent notices about an unpaid balance. A CP504 warns of intent to levy. Act now: apply for a payment plan, request hardship review, or pay the balance to stop enforced collection.`;
    return POSITIVE_PREFIX + body + linkList(['opa','account']) + POSITIVE_SUFFIX;
  }
  const generic = `I can help with notices, payment plans, levies, liens, penalties, OIC, and transcripts. Tell me the notice (e.g., CP14, CP501), how much you owe, and whether you’ve filed all returns. I’ll outline fast, manageable next steps.`;
  return POSITIVE_PREFIX + generic + linkList(['account','opa']) + POSITIVE_SUFFIX;
}

async function streamFakeTokens(text, onDelta, opts = {}) {
  const { chunkBy = "word", delay = 25, signal } = opts;
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  let tokens;
  if (chunkBy === "char") {
    tokens = Array.from(text);
  } else {
    tokens = text.match(/\S+|\s+/g) || [text];
  }
  for (const tok of tokens) {
    if (signal?.aborted) {
      const err = new DOMException("Aborted", "AbortError");
      throw err;
    }
    onDelta(tok);
    if (delay > 0) await sleep(delay);
  }
}
