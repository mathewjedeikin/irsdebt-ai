"use client";
import { useMemo, useState } from "react";

export default function AssistedSubmit(){
  const [goal, setGoal] = useState("payment_plan"); // 'payment_plan' | 'oic'
  const [data, setData] = useState({
    firstName: "", lastName: "",
    email: "", phone: "",
    address: "", city: "", state: "CA", zip: "",
    balance: "16000", years: "2023",
    filingStatus: "single",
    monthlyIncome: "", monthlyExpenses: "",
    planMonths: "60", draftDay: "15",
    // OIC fields
    householdSize: "1",
    assetsCash: "",
    assetsInvestments: "",
    assetsHomeEquity: "",
    assetsVehicleEquity: "",
    assetsOther: "",
    oicOfferType: "periodic", // 'lump' | 'periodic'
    notes: ""
  });

  // --- Shared: simple payment plan estimate ---
  const estMonthly = useMemo(()=>{
    const bal = Number(data.balance||0);
    const months = Math.max(3, Math.min(72, Number(data.planMonths||60)));
    const apr = 0.06; // placeholder demo estimate
    const interest = bal * apr * (months/12);
    return ((bal + interest) / months).toFixed(2);
  },[data.balance,data.planMonths]);

  // --- OIC: rough demo estimate (NOT official) ---
  const oic = useMemo(()=>{
    const income = Number(data.monthlyIncome||0);
    const expenses = Number(data.monthlyExpenses||0);
    const cash = Number(data.assetsCash||0);
    const invest = Number(data.assetsInvestments||0);
    const home = Number(data.assetsHomeEquity||0);
    const vehicle = Number(data.assetsVehicleEquity||0);
    const other = Number(data.assetsOther||0);
    const household = Math.max(1, Number(data.householdSize||1));

    // Disposable income (very rough): income - expenses
    const disposable = Math.max(0, income - expenses);

    // Quick asset equity (very rough): sum of reported equities/cash/investments
    const assetsTotal = cash + invest + home + vehicle + other;

    // Reasonable Collection Potential (RCP) demo (NOT official):
    // assets + multiplier * disposable monthly
    // IRS guidance is more nuanced; we use a simple placeholder:
    const multiplier = 12; // demo: 12 months
    const rcp = assetsTotal + (disposable * multiplier);

    // Suggest an offer equal to RCP, capped by balance, minimum $50
    const balance = Number(data.balance||0);
    const suggestedOffer = Math.max(50, Math.min(balance, Math.round(rcp)));

    // Payment structure suggestion (very rough)
    const offerType = data.oicOfferType || "periodic";
    let paymentStructure = "";
    if (offerType === "lump") {
      paymentStructure = "Lump Sum: 20% down with application, remaining in 5 or fewer payments within 5 months of acceptance.";
    } else {
      paymentStructure = "Periodic: Initial payment with application, then monthly payments within 6–24 months after acceptance.";
    }

    return {
      household,
      disposable,
      assetsTotal,
      rcp,
      suggestedOffer,
      offerType,
      paymentStructure,
    };
  },[data.monthlyIncome, data.monthlyExpenses, data.assetsCash, data.assetsInvestments, data.assetsHomeEquity, data.assetsVehicleEquity, data.assetsOther, data.oicOfferType, data.householdSize, data.balance]);

  function update(field, value){
    setData(d => ({...d, [field]: value}));
  }

  async function generatePDF(){
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt" });
    let y = 56, L = 40;

    doc.setFontSize(18); 
    doc.text(goal === "oic" ? "Offer in Compromise Prep Packet" : "IRS Payment Plan Prep Packet", L, y); 
    y+=24;
    doc.setFontSize(11);
    doc.text("This summary helps you finish your application in your IRS Online Account. Keep for your records.", L, y, {maxWidth:520}); 
    y+=20;

    section("Taxpayer");
    line(`${data.firstName} ${data.lastName}`);
    line(`${data.address}`);
    line(`${data.city}, ${data.state} ${data.zip}`);
    line(`Email: ${data.email}  Phone: ${data.phone||"—"}`);

    section("Balance & Taxes");
    line(`Estimated balance: $${Number(data.balance||0).toLocaleString()}`);
    line(`Tax year(s): ${data.years}`);
    line(`Filing status: ${labelStatus(data.filingStatus)}`);

    if (goal === "payment_plan") {
      section("Proposed Payment Plan");
      line(`Term: ${data.planMonths} months`);
      line(`Draft day: ${data.draftDay} of each month`);
      line(`Estimated monthly: ~$${estMonthly} (interest not final)`);
    } else {
      section("Offer in Compromise (OIC) — Demo Worksheet");
      line(`Household size: ${oic.household}`);
      line(`Monthly income: ${data.monthlyIncome ? "$"+Number(data.monthlyIncome).toLocaleString() : "—"}`);
      line(`Monthly expenses: ${data.monthlyExpenses ? "$"+Number(data.monthlyExpenses).toLocaleString() : "—"}`);
      line(`Disposable income (demo): ${oic.disposable ? "$"+oic.disposable.toLocaleString() : "—"}`);
      line(`Assets (cash+investments+equity) (demo): ${oic.assetsTotal ? "$"+oic.assetsTotal.toLocaleString() : "—"}`);
      line(`Demo RCP (assets + 12×disposable): ${oic.rcp ? "$"+oic.rcp.toLocaleString() : "—"}`);
      line(`Suggested offer (demo): ${oic.suggestedOffer ? "$"+oic.suggestedOffer.toLocaleString() : "—"}`);
      line(`Offer type: ${oic.offerType} — ${oic.paymentStructure}`);
      y += 8;
      small("Important: This is a very rough, informational estimate only. The IRS uses more detailed rules, forms, and documentation to calculate offers.");
      y += 8;
      small("Helpful: OIC main page — https://www.irs.gov/offer-in-compromise");
      y += 12;
    }

    if (data.monthlyIncome || data.monthlyExpenses){
      section("Income & Expenses (self-reported)");
      line(`Monthly income: ${data.monthlyIncome ? "$"+Number(data.monthlyIncome).toLocaleString() : "—"}`);
      line(`Monthly expenses: ${data.monthlyExpenses ? "$"+Number(data.monthlyExpenses).toLocaleString() : "—"}`);
    }

    if (goal === "oic") {
      section("Assets (self-reported)");
      line(`Cash: ${fmtDollar(data.assetsCash)}`);
      line(`Investments: ${fmtDollar(data.assetsInvestments)}`);
      line(`Home equity: ${fmtDollar(data.assetsHomeEquity)}`);
      line(`Vehicle equity: ${fmtDollar(data.assetsVehicleEquity)}`);
      line(`Other assets: ${fmtDollar(data.assetsOther)}`);
    }

    if (data.notes){
      section("Notes");
      const lines = doc.splitTextToSize(data.notes, 520);
      doc.text(lines, L, y); y += 16*lines.length;
    }

    section("Submission Checklist");
    if (goal === "payment_plan") {
      [
        "Create/Sign in to your IRS Online Account (via Login.gov)",
        "Go to: Payments → Apply for a Payment Plan",
        "Choose Long-term plan (Installment Agreement, up to 72 months)",
        "Enter your proposed monthly amount and draft date",
        "Select Direct Debit if possible (lower setup fee)",
        "Review, agree to terms, and submit",
        "Save your confirmation number and plan terms"
      ].forEach((item,i)=>{ line(`${i+1}. ${item}`); });
    } else {
      [
        "Review the OIC booklet (Form 656-B) and instructions",
        "Use the IRS OIC Pre-Qualifier Tool to check basic eligibility",
        "Gather documentation: proof of income, expenses, and asset equity",
        "Choose Lump Sum or Periodic Payment option",
        "Complete and submit Form 656 with application fee/initial payment",
        "Await IRS review; respond to any information requests promptly"
      ].forEach((item,i)=>{ line(`${i+1}. ${item}`); });
    }

    y+=8; doc.setFontSize(9);
    doc.text("Friendly note: Information only, not legal or tax advice. Don’t share SSNs or IRS/Login.gov credentials here.", L, y);

    function section(title){ y+=18; doc.setFontSize(12); doc.setFont(undefined, "bold"); doc.text(title, L, y); doc.setFont(undefined, "normal"); y+=12; }
    function line(t){ doc.text(t, L, y); y+=16; }
    function labelStatus(v){ return ({single:"Single",mfj:"Married Filing Jointly",mfs:"Married Filing Separately",hoh:"Head of Household"}[v]||v); }
    function fmtDollar(v){ const n = Number(v||0); return n ? "$"+n.toLocaleString() : "—"; }

    doc.save(`${goal === "oic" ? "OIC-Prep" : "IRS-Payment-Plan-Prep"}-${data.lastName||"Taxpayer"}.pdf`);
  }

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Assisted Submit</h2>
      <p className="muted">We’ll gather your info, estimate next steps, and generate a helpful PDF checklist so you can finish in your IRS Online Account. Don’t worry—we’ll do this together.</p>

      <div className="row" style={{gap:16, alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <GoalTabs goal={goal} setGoal={setGoal} />
          <FormGrid goal={goal} data={data} update={update} />
          <div className="row" style={{marginTop:12, justifyContent:'space-between'}}>
            <button className="btn brand" onClick={generatePDF}>Generate My {goal === "oic" ? "OIC Prep" : "Plan"} Packet (PDF)</button>
            {goal === "oic" ? (
              <a className="btn secondary" href="https://irs.treasury.gov/oic_pre_qualifier/" target="_blank" rel="noreferrer">Open OIC Pre‑Qualifier Tool</a>
            ) : (
              <a className="btn secondary" href="https://www.irs.gov/payments/online-payment-agreement-application" target="_blank" rel="noreferrer">Open IRS Payment Plan Page</a>
            )}
          </div>
          <div className="muted" style={{marginTop:8}}>Information only, not legal or tax advice.</div>
        </div>
        <aside className="right-rail">
          {goal === "payment_plan" ? (
            <div>
              <b>Estimated monthly (demo):</b>
              <div style={{fontSize:28, fontWeight:700, color:'#065f46', margin:'6px 0'}}>${estMonthly}</div>
              <div className="muted">This is a quick estimate. The IRS calculates the final amount during application.</div>
              <div style={{marginTop:12}}>
                <b>Tips</b>
                <ul>
                  <li>Pick a draft day after payday.</li>
                  <li>Direct Debit has the lowest setup fee.</li>
                  <li>You can make extra payments anytime.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <b>OIC demo estimator</b>
              <div className="muted">Very rough, informational only.</div>
              <div style={{marginTop:6}}><b>Assets (demo):</b> {oic.assetsTotal ? "$"+oic.assetsTotal.toLocaleString() : "—"}</div>
              <div><b>Disposable (demo):</b> {oic.disposable ? "$"+oic.disposable.toLocaleString() : "—"}/mo</div>
              <div><b>Demo RCP:</b> {oic.rcp ? "$"+oic.rcp.toLocaleString() : "—"}</div>
              <div><b>Suggested offer (demo):</b> {oic.suggestedOffer ? "$"+oic.suggestedOffer.toLocaleString() : "—"}</div>
              <div style={{marginTop:12}} className="muted">
                Learn more: <a href="https://www.irs.gov/offer-in-compromise" target="_blank" rel="noreferrer">OIC overview</a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function GoalTabs({ goal, setGoal }){
  return (
    <div className="row" style={{marginBottom:12}}>
      <button
        className={"btn " + (goal === "payment_plan" ? "brand" : "secondary")}
        onClick={()=>setGoal("payment_plan")}
        type="button"
      >
        Payment Plan
      </button>
      <button
        className={"btn " + (goal === "oic" ? "brand" : "secondary")}
        onClick={()=>setGoal("oic")}
        type="button"
      >
        Offer in Compromise (OIC)
      </button>
    </div>
  );
}

function FormGrid({ goal, data, update }){
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
      <Input label="First name" value={data.firstName} onChange={v=>update('firstName', v)} />
      <Input label="Last name" value={data.lastName} onChange={v=>update('lastName', v)} />
      <Input label="Email" value={data.email} onChange={v=>update('email', v)} />
      <Input label="Phone" value={data.phone} onChange={v=>update('phone', v)} />
      <Input label="Address" className="full" value={data.address} onChange={v=>update('address', v)} />
      <Input label="City" value={data.city} onChange={v=>update('city', v)} />
      <Input label="State" value={data.state} onChange={v=>update('state', v)} />
      <Input label="ZIP" value={data.zip} onChange={v=>update('zip', v)} />

      <Input label="Estimated balance ($)" value={data.balance} onChange={v=>update('balance', v.replace(/[^0-9]/g,''))} />
      <Input label="Tax year(s)" value={data.years} onChange={v=>update('years', v)} />
      <Select label="Filing status" value={data.filingStatus} onChange={v=>update('filingStatus', v)}
        options={[['single','Single'],['mfj','Married Filing Jointly'],['mfs','Married Filing Separately'],['hoh','Head of Household']]} />

      {goal === "payment_plan" && (
        <>
          <Input label="Plan months (3–72)" value={data.planMonths} onChange={v=>update('planMonths', v.replace(/[^0-9]/g,''))} />
          <Input label="Draft day (1–28)" value={data.draftDay} onChange={v=>update('draftDay', v.replace(/[^0-9]/g,''))} />
        </>
      )}

      <Input label="Monthly income ($)" value={data.monthlyIncome} onChange={v=>update('monthlyIncome', v.replace(/[^0-9]/g,''))} />
      <Input label="Monthly expenses ($)" value={data.monthlyExpenses} onChange={v=>update('monthlyExpenses', v.replace(/[^0-9]/g,''))} />

      {goal === "oic" && (
        <>
          <Input label="Household size" value={data.householdSize} onChange={v=>update('householdSize', v.replace(/[^0-9]/g,''))} />
          <Input label="Cash on hand ($)" value={data.assetsCash} onChange={v=>update('assetsCash', v.replace(/[^0-9]/g,''))} />
          <Input label="Investments ($)" value={data.assetsInvestments} onChange={v=>update('assetsInvestments', v.replace(/[^0-9]/g,''))} />
          <Input label="Home equity ($)" value={data.assetsHomeEquity} onChange={v=>update('assetsHomeEquity', v.replace(/[^0-9]/g,''))} />
          <Input label="Vehicle equity ($)" value={data.assetsVehicleEquity} onChange={v=>update('assetsVehicleEquity', v.replace(/[^0-9]/g,''))} />
          <Input label="Other assets ($)" value={data.assetsOther} onChange={v=>update('assetsOther', v.replace(/[^0-9]/g,''))} />
          <Select label="Offer type" value={data.oicOfferType} onChange={v=>update('oicOfferType', v)} options={[['lump','Lump Sum'],['periodic','Periodic Payments']]} />
        </>
      )}

      <Textarea label="Notes (optional)" className="full" value={data.notes} onChange={v=>update('notes', v)} />
      <style jsx>{`
        .full{gridColumn:'1 / span 2'}
      `}</style>
      {goal === "oic" && (
        <div className="muted full">
          This OIC tool is a friendly **demo** only. The IRS uses more detailed rules and forms. Start with the official OIC Pre‑Qualifier Tool and Form 656‑B.
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, className }){
  return (
    <label className={className||""}>
      <div className="muted" style={{marginBottom:4}}>{label}</div>
      <input className="input" value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  );
}

function Textarea({ label, value, onChange, className }){
  return (
    <label className={className||""}>
      <div className="muted" style={{marginBottom:4}}>{label}</div>
      <textarea className="input" rows={4} value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }){
  return (
    <label>
      <div className="muted" style={{marginBottom:4}}>{label}</div>
      <select className="input" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(([val,lab])=> <option key={val} value={val}>{lab}</option>)}
      </select>
    </label>
  );
}
