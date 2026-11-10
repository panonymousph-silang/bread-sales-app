<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>RichAnn Farm Orders</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Zen+Maru+Gothic:wght@700&display=swap">
<style>
/* Layout: single column, white sheet; three role tabs; every list is a light-blue table. Single light theme by request. */
:root{
  --bg:#ffffff;
  --ink:#16323d;
  --muted:#5c7480;
  --line:#b9dcea;
  --sky:#e3f4fb;
  --sky-head:#bfe6f5;
  --sky-deep:#1d7fa6;
  --leaf:#2f8a4e;
  --warn:#c0562b;
  --font-body:"Zen Kaku Gothic New",system-ui,-apple-system,"Segoe UI",sans-serif;
  --font-display:"Zen Maru Gothic","Zen Kaku Gothic New",system-ui,sans-serif;
  color-scheme:light;
}
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:15px;line-height:1.6}
.wrap{max-width:980px;margin:0 auto;padding-block:20px 60px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:18px}
header{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px}
h1{font-family:var(--font-display);font-size:1.6rem;margin:0;letter-spacing:.01em;text-wrap:balance}
h1 small{display:block;font-family:var(--font-body);font-size:.75rem;font-weight:700;color:var(--leaf);letter-spacing:.12em}
h2{font-family:var(--font-display);font-size:1.15rem;margin:0}
.sub{color:var(--muted);font-size:.85rem;margin:0}
nav{display:flex;gap:6px;border-bottom:2px solid var(--line)}
nav a{padding:8px 16px;border-radius:10px 10px 0 0;text-decoration:none;color:var(--muted);font-weight:700;border:2px solid transparent;border-bottom:none;margin-bottom:-2px}
nav a[aria-current="page"]{color:var(--sky-deep);background:var(--bg);border-color:var(--line)}
nav a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--sky-deep);outline-offset:2px}
section.panel,.panel{display:flex;flex-direction:column;gap:16px}
.row{display:flex;flex-wrap:wrap;gap:10px;align-items:end}
label.f{display:flex;flex-direction:column;gap:4px;font-size:.78rem;font-weight:700;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}
input,select,textarea{font:inherit;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;text-transform:none;letter-spacing:normal}
textarea{width:100%;min-height:150px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85rem;box-sizing:border-box}
input.name{min-width:0;width:min(320px,100%);font-size:1rem}
input.num{width:84px;text-align:right;font-variant-numeric:tabular-nums}
button{font:inherit;font-weight:700;border-radius:8px;border:1.5px solid var(--sky-deep);background:var(--bg);color:var(--sky-deep);padding:6px 14px;cursor:pointer}
button.primary{background:var(--sky-deep);color:#fff}
button.done{background:var(--leaf);border-color:var(--leaf);color:#fff}
button.danger{border-color:var(--warn);color:var(--warn)}
button.link{border:none;padding:0;color:var(--muted);font-weight:500;text-decoration:underline}
button:disabled{opacity:.45;cursor:not-allowed}
button.big{padding:12px 28px;font-size:1.05rem}
.tbl{overflow-x:auto;border-radius:10px;border:1.5px solid var(--line)}
table{border-collapse:collapse;width:100%;background:var(--sky);font-variant-numeric:tabular-nums}
th{background:var(--sky-head);text-align:left;font-size:.78rem;letter-spacing:.04em;text-transform:uppercase;padding:8px 10px;white-space:nowrap}
td{padding:7px 10px;border-top:1px solid var(--line);vertical-align:middle}
td.n,th.n{text-align:right;white-space:nowrap}
tfoot td{background:var(--sky-head);font-weight:700}
tr.out td{color:var(--muted)}
tr.packed td{background:#d9f0e1}
.pill{display:inline-block;font-size:.75rem;font-weight:700;padding:1px 9px;border-radius:99px;border:1.5px solid currentColor;white-space:nowrap}
.pill.ok{color:var(--leaf)}.pill.wait{color:var(--muted)}.pill.low{color:var(--warn)}
.cust{font-weight:700}
.detail{font-size:.78rem;color:var(--muted);font-weight:400}
.card{border:1.5px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px}
.cardhead{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px}
.lock{max-width:360px;margin:24px auto;text-align:center;align-items:center}
.lock input{width:100%;box-sizing:border-box;text-align:center;font-size:1.05rem}
.msg{padding:10px 14px;border-radius:10px;background:var(--sky);border:1.5px solid var(--line)}
.msg.err{border-color:var(--warn);color:var(--warn);background:#fff3ee}
.msg.ok{border-color:var(--leaf);color:var(--leaf);background:#eef8f1}
.total{font-size:1.25rem;font-weight:700;font-variant-numeric:tabular-nums}
.manual{display:inline-flex;align-items:center;gap:4px;margin-left:6px}
.hint{font-size:.8rem;color:var(--muted);margin:0}
.empty{padding:28px;text-align:center;color:var(--muted)}
.inv-list{display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.inv{width:100%;max-width:380px;border:1.5px solid var(--line);border-radius:10px;padding:12px;background:var(--bg);font-size:12px;line-height:1.4;display:flex;flex-direction:column;gap:8px}
.inv-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.inv-farm{font-family:var(--font-display);font-size:14px;color:var(--leaf)}
.inv-to{font-size:13px}
.inv-right{text-align:right;color:var(--muted);font-size:11px}
.inv-word{font-weight:700;letter-spacing:.14em;color:var(--sky-deep);font-size:12px}
.inv-t{table-layout:auto;border-radius:6px;overflow:hidden;border:1px solid var(--line)}
.inv-t th{font-size:10px;padding:4px 6px}
.inv-t td{padding:3px 6px;font-size:12px}
.inv-t tfoot td{background:var(--sky);font-weight:500}
.inv-t tr.inv-due td{background:var(--sky-head);font-weight:700;font-size:13px}
.inv-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.inv-note{font-size:10.5px;color:var(--warn)}

@media (max-width:560px){h1{font-size:1.3rem}nav a{padding:8px 10px}td,th{padding:6px 7px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1><small>RICHANN VEGETABLE FARM</small>Vegetable Orders</h1>
    <p class="sub" id="roundLabel">Loading…</p>
  </header>
  <nav>
    <a href="#order" data-tab="order">Order</a>
    <a href="#farmer" data-tab="farmer">Farmer</a>
    <a href="#admin" data-tab="admin">Admin</a>
  </nav>
  <div id="status" class="msg" hidden></div>

  <!-- ORDER -->
  <section class="panel" id="p-order">
    <div id="orderDone" class="panel" hidden></div>
    <form id="orderForm" class="panel" novalidate>
      <label class="f" for="custName">Your name
        <input id="custName" class="name" autocomplete="name" placeholder="e.g. Maria Santos">
      </label>
      <div class="tbl"><table>
        <thead><tr><th>Vegetable</th><th class="n">Price</th><th class="n">Available</th><th>Quantity</th><th class="n">Subtotal</th></tr></thead>
        <tbody id="orderBody"></tbody>
        <tfoot><tr><td colspan="4">Total</td><td class="n" id="orderTotal">₱0</td></tr></tfoot>
      </table></div>
      <p class="hint">For more than 2 kg, choose "Over 2 kg (type amount)". Herbs priced per 100 g have a 100 g minimum.</p>
      <div id="orderErr" class="msg err" hidden></div>
      <div><button type="submit" class="primary big" id="orderBtn">Confirm order</button></div>
    </form>
    <div class="card" id="mySec" hidden>
      <h2>Check or change my order</h2>
      <label class="f" for="myName">Your name<select id="myName"></select></label>
      <div id="myView" class="panel"></div>
    </div>
  </section>

  <!-- LOCK (shared by Farmer and Admin) -->
  <section class="panel" id="p-lock" hidden>
    <form id="lockForm" class="card lock" novalidate>
      <h2 id="lockTitle">Farmer access</h2>
      <p class="hint">Enter the password to continue.</p>
      <label class="f" for="lockPw" style="width:100%">Password<input id="lockPw" type="password" autocomplete="current-password"></label>
      <div id="lockErr" class="msg err" hidden></div>
      <button type="submit" class="primary">Unlock</button>
    </form>
  </section>

  <!-- FARMER -->
  <section class="panel" id="p-farmer" hidden>
    <div class="row">
      <label class="f" for="farmRound">Delivery<select id="farmRound" class="roundSel"></select></label>
      <p class="sub" id="farmProgress"></p>
      <button type="button" class="link" data-lockout="farmer">Lock</button>
    </div>
    <h2>Totals by vegetable</h2>
    <div class="tbl"><table>
      <thead><tr><th>Vegetable</th><th class="n">Stock</th><th class="n">Ordered</th><th class="n">Packed</th><th class="n">Remaining</th></tr></thead>
      <tbody id="farmSum"></tbody>
    </table></div>
    <h2>Bill to admin</h2>
    <div class="tbl"><table>
      <thead><tr><th>Vegetable</th><th class="n">Qty sold</th><th class="n">Price</th><th class="n">Subtotal</th></tr></thead>
      <tbody id="farmBill"></tbody>
      <tfoot>
        <tr><td colspan="3">Subtotal</td><td class="n" id="farmSub">₱0</td></tr>
        <tr><td colspan="3"><label for="farmFee">Delivery fee</label></td><td class="n">₱<input type="number" class="num" id="farmFee" min="0" step="1" value="0"></td></tr>
        <tr><td colspan="3">Total incl. delivery</td><td class="n total" id="farmGrand">₱0</td></tr>
      </tfoot>
    </table></div>
    <p class="hint">Qty sold uses the actual packed amount once an item is marked packed.</p>
    <h2>Orders</h2>
    <div id="farmOrders" class="panel"></div>
  </section>

  <!-- ADMIN -->
  <section class="panel" id="p-admin" hidden>
    <div class="row">
      <label class="f" for="adminRound">Delivery<select id="adminRound" class="roundSel"></select></label>
      <button type="button" id="toggleOpen"></button>
      <button type="button" id="makeLive" class="primary">Show this form to customers</button>
      <button type="button" id="editRound">Edit this form</button>
      <button type="button" id="delRound" class="danger">Delete this form</button>
      <button type="button" class="link" data-lockout="admin">Lock</button>
    </div>
    <p class="hint" id="liveNote"></p>
    <h2>Deliveries &amp; billing</h2>
    <p class="hint" id="feeNote"></p>
    <div class="tbl"><table>
      <thead><tr><th>Customer</th><th class="n">Amount due</th><th>Payment</th><th></th></tr></thead>
      <tbody id="billBody"></tbody>
      <tfoot id="billFoot"></tfoot>
    </table></div>
    <div id="invHead" class="panel" hidden>
      <h2>Invoices</h2>
      <p class="hint">One box per customer. Take one screenshot of a box and send it to that customer.</p>
    </div>
    <div id="invoices" class="inv-list"></div>

    <div class="card" id="editorCard">
      <div class="cardhead"><h2 id="editTitle">Create a new order form</h2>
        <button type="button" id="copyCurrent">Load current list</button></div>
      <div id="pasteArea" class="panel">
        <p class="hint">One item per line: "quantity kg name price/kg" or "name price/100g". A quantity sets the stock limit; items without one are unlimited.</p>
        <textarea id="listText" placeholder="20 kg bokchoy   120/kg&#10;Thai Basil   50/100g"></textarea>
        <div class="row"><button type="button" id="parseBtn">Load into table</button></div>
      </div>
      <p class="hint" id="editHint" hidden>Fix names, prices, stock or the delivery date, then press "Save changes". New names and prices also update the orders already placed and their invoices.</p>
      <div class="tbl"><table>
        <thead><tr><th>Vegetable</th><th class="n">Stock (kg)</th><th class="n">Price (₱)</th><th>Unit</th><th></th></tr></thead>
        <tbody id="editBody"></tbody>
      </table></div>
      <div class="row">
        <button type="button" id="addRow">+ Add row</button>
        <label class="f" for="newDate">Delivery date<input type="date" id="newDate"></label>
        <button type="button" class="primary" id="publishRound">Publish this order form</button>
        <button type="button" id="cancelEdit" hidden>Cancel editing</button>
      </div>
      <div id="editMsg" hidden></div>
    </div>

    <div class="card" id="pwCard" hidden>
      <h2>Passwords</h2>
      <p class="hint">Leave a field blank to keep its current password.</p>
      <div class="row">
        <label class="f" for="newFarmerPw">New farmer password<input id="newFarmerPw" type="text" autocomplete="off"></label>
        <label class="f" for="newAdminPw">New admin password<input id="newAdminPw" type="text" autocomplete="off"></label>
        <button type="button" class="primary" id="savePw">Save passwords</button>
      </div>
      <div id="pwMsg" hidden></div>
    </div>
  </section>
</div>

<script>
/* ===== Supabase connection: paste your project's values here ===== */
const SUPABASE_URL = "https://vwrlhmblnxlqqbrjajzc.supabase.co";
const SUPABASE_KEY = "sb_publishable_WP8YJQVJLZqyK_y0DyaRHg_bQQLhUkK";
/* ================================================================= */
(() => {
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const peso = n => "₱" + (Math.round(n*100)/100).toLocaleString("en-PH",{minimumFractionDigits:0,maximumFractionDigits:2});
const r3 = n => Math.round(n*1000)/1000;
const OPTS_KG = [[2,"2 kg"],[1.5,"1.5 kg"],[1,"1 kg"],[0.75,"3/4 kg"],[0.5,"1/2 kg"],[0.25,"1/4 kg"]];
const OPTS_G  = [[0.1,"100 g"],[0.2,"200 g"],[0.3,"300 g"],[0.5,"500 g"]];
const fmtDate = d => { try{ return new Date(d+"T00:00:00").toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric",year:"numeric"}); }catch{ return d; } };
const qtyText = (unit, kg) => kg == null ? "—" : (unit === "100g" || kg < 1) ? Math.round(kg*1000) + " g" : r3(kg) + " kg";
const priceText = it => peso(it.price) + (it.unit === "100g" ? "/100g" : "/kg");
const lineAmt = (unit, price, kg) => unit === "100g" ? price * kg * 10 : price * kg;
const effKg = l => (l.packed && l.actualKg != null) ? +l.actualKg : +l.qtyKg;

const configured = /^https:\/\//.test(SUPABASE_URL) && !/PASTE_/.test(SUPABASE_KEY);
async function rpc(fn, args){
  const res = await fetch(`${SUPABASE_URL.replace(/\/$/,"")}/rest/v1/rpc/${fn}`, {
    method:"POST", headers:{"apikey":SUPABASE_KEY, "Content-Type":"application/json"}, body:JSON.stringify(args||{})
  });
  const text = await res.text();
  let data = null; try{ data = text ? JSON.parse(text) : null; }catch{ data = text; }
  if(!res.ok){ const e = new Error(data?.message || res.statusText || "Request failed"); e.wrongPw = data?.message === "wrong_password"; throw e; }
  return data;
}
function showStatus(t, err){ const s=$("status"); if(!t){s.hidden=true;return;} s.textContent=t; s.className="msg"+(err?" err":""); s.hidden=false; }

/* ---------- state ---------- */
let form = {round:null, used:{}};          // customer view
let rounds = {}, currentId = null, orders = []; // staff view
let staffLoaded = false, viewRoundId = null, builtFormFor = undefined;

/* ---------- passwords (kept only for this browser tab) ---------- */
let pw = {farmer:"", admin:""};
try{ pw = Object.assign(pw, JSON.parse(sessionStorage.getItem("richann-pw")||"{}")); }catch{}
const savePw = () => { try{ sessionStorage.setItem("richann-pw", JSON.stringify(pw)); }catch{} };
const isUnlocked = role => role==="admin" ? !!pw.admin : !!(pw.farmer || pw.admin);
const staffPw = () => pw.admin || pw.farmer;
function lockAll(){ pw = {farmer:"", admin:""}; savePw(); staffLoaded=false; showTab(); }

$("lockForm").addEventListener("submit", async e => {
  e.preventDefault();
  const role = tab(), p = $("lockPw").value, err = $("lockErr");
  err.hidden = true;
  if(!p){ err.textContent="Enter the password."; err.hidden=false; return; }
  try{
    const ok = await rpc("check_password", {p_role:role, p_pw:p});
    if(!ok){ err.textContent = "That password is not correct."; err.hidden=false; $("lockPw").select(); return; }
    pw[role] = p; savePw(); $("lockPw").value=""; showTab(); loadStaff();
  }catch(x){ err.textContent = "Could not check the password: " + x.message; err.hidden=false; }
});
document.querySelectorAll("[data-lockout]").forEach(b => b.addEventListener("click", () => {
  if(b.dataset.lockout==="admin") pw = {farmer:"", admin:""}; else pw.farmer = "";
  savePw(); showTab();
}));

/* ---------- tabs ---------- */
function tab(){ const t=(location.hash||"#order").slice(1); return ["order","farmer","admin"].includes(t) ? t : "order"; }
function showTab(){
  const t=tab();
  document.querySelectorAll("nav a").forEach(a=>a.setAttribute("aria-current", a.dataset.tab===t?"page":"false"));
  const locked = t!=="order" && !isUnlocked(t);
  $("p-order").hidden = t!=="order";
  $("p-farmer").hidden = t!=="farmer" || locked;
  $("p-admin").hidden = t!=="admin" || locked;
  $("p-lock").hidden = !locked;
  if(locked){ $("lockTitle").textContent = t==="admin" ? "Admin access" : "Farmer access"; $("lockErr").hidden=true; setTimeout(()=>$("lockPw").focus(),0); }
  if(t==="order") loadForm(); else if(!locked) loadStaff();
  renderAll();
}
window.addEventListener("hashchange", showTab);

/* ---------- loading ---------- */
async function loadForm(){
  if(!configured) return;
  try{ form = await rpc("get_form"); if(!form.used) form.used = {}; showStatus(""); renderAll(); }
  catch(e){ showStatus("Can't load the order form: " + e.message, true); }
}
async function loadStaff(){
  if(!configured || !staffPw()) return;
  try{
    const d = await rpc("staff_data", {p_pw: staffPw()});
    rounds = {}; (d.rounds||[]).forEach(r => rounds[r.id] = r);
    currentId = d.current; orders = d.orders || []; staffLoaded = true; showStatus(""); renderAll();
  }catch(e){ if(e.wrongPw){ lockAll(); } else showStatus("Can't load orders: " + e.message, true); }
}
async function act(fn, args){
  try{ await rpc(fn, Object.assign({p_pw: fn.startsWith("admin_") ? pw.admin : staffPw()}, args)); }
  catch(e){ if(e.wrongPw){ lockAll(); return; } showStatus("Could not save: " + e.message, true); }
  loadStaff();
}

/* ---------- helpers ---------- */
const roundOrders = rid => orders.filter(o => o.roundId === rid);
function usedKg(rid, itemId){ let s=0; for(const o of roundOrders(rid)) for(const l of o.lines||[]) if(l.itemId===itemId) s+=effKg(l); return r3(s); }
function availKg(rid, it){ return it.limitKg == null ? null : r3(Math.max(0, it.limitKg - usedKg(rid, it.id))); }
function formAvail(it){ return it.limitKg == null ? null : r3(Math.max(0, it.limitKg - (+form.used[it.id] || 0))); }
function orderSub(o){ return (o.lines||[]).reduce((s,l)=>s+lineAmt(l.unit,l.price,effKg(l)),0); }
const custKey = o => String(o.customer||"").trim().toLowerCase();
function customerGroups(rid){
  const m = new Map();
  for(const o of roundOrders(rid)){ const k=custKey(o); if(!m.has(k)) m.set(k,{key:k, name:o.customer.trim(), orders:[]}); m.get(k).orders.push(o); }
  return [...m.values()];
}
const roundFee = rid => +(rounds[rid]?.deliveryFee || 0);
function feeShare(rid){ const n=customerGroups(rid).length; return n ? Math.round(roundFee(rid)/n*100)/100 : 0; }

/* ---------- quantity table (used by the order form and "my order" edit) ---------- */
function mountQty(tbody, items, prefix, getAvail, isOpen, onTotal){
  const vals = {};
  tbody.innerHTML = items.map(it => {
    const opts = (it.unit==="100g"?OPTS_G:OPTS_KG).map(([v,l])=>`<option value="${v}">${l}</option>`).join("");
    const manual = it.unit==="100g" ? `Other (type grams)` : `Over 2 kg (type amount)`;
    const mUnit = it.unit==="100g" ? "g" : "kg";
    const mAttr = it.unit==="100g" ? `min="100" step="50"` : `min="2" step="0.25"`;
    return `<tr data-id="${esc(it.id)}">
      <td><b>${esc(it.name)}</b></td>
      <td class="n">${priceText(it)}</td>
      <td class="n" data-avail></td>
      <td><select id="${prefix}q-${esc(it.id)}" aria-label="${esc(it.name)} quantity"><option value="">—</option>${opts}<option value="manual">${manual}</option></select>
        <span class="manual" hidden><input type="number" id="${prefix}m-${esc(it.id)}" class="num" ${mAttr} aria-label="${esc(it.name)} amount">${mUnit}</span></td>
      <td class="n" data-sub>—</td></tr>`;
  }).join("");
  const rows = {};
  tbody.querySelectorAll("tr[data-id]").forEach(tr => {
    const id = tr.dataset.id, it = items.find(i=>i.id===id);
    const sel = tr.querySelector("select"), man = tr.querySelector(".manual"), inp = man.querySelector("input");
    rows[id] = {tr, it, sel, man, inp};
    const read = () => {
      let kg = null;
      if(sel.value==="manual"){ const v=parseFloat(inp.value); if(v>0) kg = it.unit==="100g" ? v/1000 : v; }
      else if(sel.value) kg = parseFloat(sel.value);
      if(kg) vals[id]=r3(kg); else delete vals[id];
      refresh();
    };
    sel.addEventListener("change", () => { man.hidden = sel.value!=="manual"; if(sel.value==="manual") inp.focus(); read(); });
    inp.addEventListener("input", read);
  });
  function refresh(){
    let total = 0;
    for(const {tr, it, sel} of Object.values(rows)){
      const av = getAvail(it), q = vals[it.id];
      const cell = tr.querySelector("[data-avail]");
      if(av==null) cell.innerHTML = `<span class="pill wait">In stock</span>`;
      else if(av<=0) cell.innerHTML = `<span class="pill low">Sold out</span>`;
      else cell.innerHTML = `<span class="${av<=1?"pill low":""}">${qtyText(it.unit,av)}</span>`;
      tr.classList.toggle("out", av!=null && av<=0 && !q);
      sel.disabled = ((av!=null && av<=0) && !q) || !isOpen();
      sel.querySelectorAll("option").forEach(o => { const v=parseFloat(o.value); if(!isNaN(v)) o.disabled = av!=null && v>av+1e-9; });
      const sub = q ? lineAmt(it.unit,it.price,q) : 0; total += sub;
      tr.querySelector("[data-sub]").textContent = q ? peso(sub) : "—";
    }
    onTotal(total);
  }
  function set(id, kg){
    const row = rows[id]; if(!row || !kg) return;
    const opt = [...row.sel.options].find(o => Math.abs(parseFloat(o.value) - kg) < 1e-6);
    if(opt){ row.sel.value = opt.value; row.man.hidden = true; }
    else { row.sel.value = "manual"; row.man.hidden = false; row.inp.value = row.it.unit==="100g" ? Math.round(kg*1000) : r3(kg); }
    vals[id] = r3(kg);
  }
  function lines(err){
    const out = [];
    for(const {it} of Object.values(rows)){
      const q = vals[it.id]; if(!q) continue;
      if(it.unit==="100g" && q < 0.1){ err(`${it.name}: the minimum order is 100 g.`); return null; }
      const av = getAvail(it);
      if(av!=null && q > av+1e-9){ err(`${it.name}: only ${qtyText(it.unit,av)} left. Please lower the quantity.`); return null; }
      out.push({itemId:it.id, qtyKg:q});
    }
    return out;
  }
  refresh();
  return {vals, set, refresh, lines};
}

/* ---------- ORDER FORM ---------- */
let orderQty = null;
function buildOrderForm(){
  const r = form.round; builtFormFor = r ? r.id : null; orderQty = null;
  if(!r){ $("orderBody").innerHTML = `<tr><td colspan="5" class="empty">No order form yet. The farm will post this week's vegetables soon.</td></tr>`; $("mySec").hidden = true; return; }
  orderQty = mountQty($("orderBody"), r.items, "o", formAvail, () => !!form.round?.open, t => $("orderTotal").textContent = peso(t));
  updateOrderForm();
}
function updateOrderForm(){
  const r = form.round; if(!r) return;
  orderQty?.refresh();
  $("orderBtn").disabled = !r.open;
  if(!r.open) showOrderErr("Orders for this delivery are closed.");
  renderMy();
}
function showOrderErr(t){ const e=$("orderErr"); e.textContent=t||""; e.hidden=!t; }

$("orderForm").addEventListener("submit", async ev => {
  ev.preventDefault(); showOrderErr("");
  const r = form.round;
  if(!r || !r.open){ showOrderErr("Orders are closed right now."); return; }
  const name = $("custName").value.trim();
  if(!name){ showOrderErr("Please enter your name."); $("custName").focus(); return; }
  const lines = orderQty.lines(showOrderErr); if(!lines) return;
  if(!lines.length){ showOrderErr("Please choose at least one vegetable."); return; }
  $("orderBtn").disabled = true;
  try{
    const res = await rpc("place_order", {p_customer:name, p_lines:lines});
    const tot = res.lines.reduce((s,l)=>s+lineAmt(l.unit,l.price,+l.qtyKg),0);
    $("orderDone").innerHTML = `<div class="msg ok"><b>Thank you, ${esc(name)}! Your order is in.</b><br>${res.lines.map(l=>`${esc(l.name)} ${qtyText(l.unit,+l.qtyKg)}`).join(", ")}<br>Total ${peso(tot)} (delivery fee not included)<br>You can check or change it any time under "Check or change my order".</div><div><button type="button" id="again">Place another order</button></div>`;
    $("orderDone").hidden=false; $("orderForm").hidden=true;
    $("again").onclick = () => { $("orderDone").hidden=true; $("orderForm").hidden=false; $("custName").value=""; builtFormFor=undefined; loadForm(); };
    myName = name; my = null; myMode = "view";
    await loadForm(); loadMy();
  }catch(e){ showOrderErr(e.message); loadForm(); }
  finally{ $("orderBtn").disabled = false; }
});

/* ---------- CHECK OR CHANGE MY ORDER ---------- */
let myName = "", my = null, myMode = "view", myEdit = null, myConfirmCancel = false, myFlash = "";
const sameName = (a,b) => String(a||"").trim().toLowerCase() === String(b||"").trim().toLowerCase();
function fillMyNames(){
  const s = $("myName"), names = form.names || [];
  $("mySec").hidden = !form.round;
  if(document.activeElement === s) return;
  const cur = names.find(n => sameName(n, myName)) || "";
  s.innerHTML = `<option value="">${names.length ? "Choose your name" : "No orders yet"}</option>` + names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
  s.value = cur;
  if(!cur && myName && my){ my = null; myName = ""; }
}
$("myName").addEventListener("change", () => { myFlash = ""; myName = $("myName").value; my = null; myMode = "view"; myConfirmCancel = false; renderMy(); loadMy(); });
async function loadMy(){
  if(!myName) return;
  try{ my = await rpc("customer_order", {p_name: myName}); }
  catch(e){ my = {error: e.message}; }
  renderMy();
}
function myMine(){ const m = {}; for(const l of my?.lines||[]) m[l.itemId] = +l.qtyKg; return m; }
function renderMy(){
  fillMyNames();
  const v = $("myView");
  if(!myName){ v.innerHTML = myFlash ? `<div class="msg ok">${esc(myFlash)}</div>` : `<p class="hint">Pick your name to see what you ordered.</p>`; return; }
  if(!my){ v.innerHTML = `<p class="hint">Loading…</p>`; return; }
  if(my.error){ v.innerHTML = `<div class="msg err">${esc(my.error)}</div>`; return; }
  if(!my.lines?.length){ v.innerHTML = `<p class="hint">No order found for this name.</p>`; return; }
  if(myMode === "edit") return; // the edit table is already on screen
  let tot = 0;
  const rows = my.lines.map(l => { const kg = l.packed ? +l.actualKg : +l.qtyKg; const a = lineAmt(l.unit,l.price,kg); tot += a;
    return `<tr><td>${esc(l.name)}</td><td class="n">${qtyText(l.unit,kg)}</td><td class="n">${priceText(l)}</td><td class="n">${peso(a)}</td></tr>`; }).join("");
  const canEdit = !my.locked && form.round?.open;
  v.innerHTML = `<div class="msg ok"><b>We have your order, ${esc(my.customer)}.</b></div>
    <div class="tbl"><table><thead><tr><th>Vegetable</th><th class="n">Qty</th><th class="n">Price</th><th class="n">Subtotal</th></tr></thead>
    <tbody>${rows}</tbody><tfoot><tr><td colspan="3">Total (delivery fee not included)</td><td class="n">${peso(tot)}</td></tr></tfoot></table></div>
    ${canEdit ? `<div class="row"><button type="button" class="primary" id="myEditBtn">Change my order</button>
      <button type="button" class="danger" id="myCancelBtn">${myConfirmCancel ? "Confirm: cancel my whole order" : "Cancel my order"}</button></div>`
      : `<p class="hint">${my.locked ? "The farm has started packing your order, so it can't be changed here. Please message the farm." : "Orders are closed, so changes aren't possible here."}</p>`}
    <div id="myMsg" hidden></div>`;
  if(canEdit){
    $("myEditBtn").onclick = startEdit;
    $("myCancelBtn").onclick = async () => {
      if(!myConfirmCancel){ myConfirmCancel = true; renderMy(); return; }
      myConfirmCancel = false; await saveMy([]);
    };
  }
}
function startEdit(){
  myMode = "edit"; const mine = myMine();
  $("myView").innerHTML = `<p class="hint">Change the quantities, then press Save. Choose "—" to remove an item.</p>
    <div class="tbl"><table><thead><tr><th>Vegetable</th><th class="n">Price</th><th class="n">Available</th><th>Quantity</th><th class="n">Subtotal</th></tr></thead>
    <tbody id="myBody"></tbody><tfoot><tr><td colspan="4">Total</td><td class="n" id="myTotal">₱0</td></tr></tfoot></table></div>
    <div id="myErr" class="msg err" hidden></div>
    <div class="row"><button type="button" class="primary" id="mySave">Save changes</button><button type="button" id="myBack">Back</button></div>`;
  const avail = it => it.limitKg==null ? null : r3(formAvail(it) + (mine[it.id]||0));
  myEdit = mountQty($("myBody"), form.round.items, "e", avail, () => !!form.round?.open, t => $("myTotal").textContent = peso(t));
  for(const [id,kg] of Object.entries(mine)) myEdit.set(id, kg);
  myEdit.refresh();
  const err = t => { const e=$("myErr"); e.textContent=t; e.hidden=!t; };
  $("myBack").onclick = () => { myMode = "view"; renderMy(); };
  $("mySave").onclick = async () => {
    err("");
    const lines = myEdit.lines(err); if(!lines) return;
    if(!lines.length){ err("Choose at least one vegetable, or go back and use \"Cancel my order\"."); return; }
    await saveMy(lines, err);
  };
}
async function saveMy(lines, err){
  try{
    const res = await rpc("customer_update", {p_name: myName, p_lines: lines});
    myMode = "view";
    if(res?.cancelled){ myName = ""; my = null; myFlash = "Your order was cancelled.";
      if(!$("orderDone").hidden){ $("orderDone").hidden = true; $("orderForm").hidden = false; $("custName").value = ""; builtFormFor = undefined; }
      await loadForm(); return; }
    await loadForm(); await loadMy();
    const m = $("myMsg"); if(m){ m.className = "msg ok"; m.textContent = "Your changes are saved."; m.hidden = false; }
  }catch(e){ if(err) err(e.message); else { await loadMy(); const m=$("myMsg"); if(m){ m.className="msg err"; m.textContent=e.message; m.hidden=false; } } }
}

/* ---------- FARMER ---------- */
function fillRoundSelects(){
  const ids = Object.keys(rounds).sort((a,b)=>(rounds[b].date||b).localeCompare(rounds[a].date||a) || b.localeCompare(a));
  if(!viewRoundId || !rounds[viewRoundId]) viewRoundId = currentId || ids[0] || null;
  document.querySelectorAll(".roundSel").forEach(s => {
    if(s.contains(document.activeElement)) return;
    s.innerHTML = ids.map(id=>`<option value="${esc(id)}">${esc(fmtDate(rounds[id].date||id))}${id===currentId?" (live)":""}</option>`).join("") || `<option>—</option>`;
    s.value = viewRoundId || "";
  });
}
document.querySelectorAll(".roundSel").forEach(s => s.addEventListener("change", () => { viewRoundId = s.value; renderAll(); }));

function renderFarmer(){
  const r = rounds[viewRoundId], list = roundOrders(viewRoundId);
  if(!r){ $("farmSum").innerHTML = `<tr><td colspan="5" class="empty">${staffLoaded?"No order form yet.":"Loading…"}</td></tr>`; $("farmOrders").innerHTML=""; $("farmBill").innerHTML=""; $("farmSub").textContent=peso(0); $("farmGrand").textContent=peso(0); $("farmProgress").textContent=""; return; }
  $("farmSum").innerHTML = r.items.map(it => {
    let ord=0, pk=0; for(const o of list) for(const l of o.lines||[]) if(l.itemId===it.id){ ord+=+l.qtyKg; if(l.packed) pk+=effKg(l); }
    const av = availKg(viewRoundId,it);
    return `<tr><td>${esc(it.name)}</td><td class="n">${it.limitKg==null?"—":qtyText(it.unit,it.limitKg)}</td><td class="n">${ord?qtyText(it.unit,r3(ord)):"—"}</td><td class="n">${pk?qtyText(it.unit,r3(pk)):"—"}</td><td class="n">${av==null?"—":qtyText(it.unit,av)}</td></tr>`;
  }).join("");
  let billSub=0;
  const billRows = r.items.map(it => {
    let q=0; for(const o of list) for(const l of o.lines||[]) if(l.itemId===it.id) q+=effKg(l);
    if(!q) return "";
    const amt = lineAmt(it.unit,it.price,q); billSub += amt;
    return `<tr><td>${esc(it.name)}</td><td class="n">${qtyText(it.unit,r3(q))}</td><td class="n">${priceText(it)}</td><td class="n">${peso(amt)}</td></tr>`;
  }).join("");
  $("farmBill").innerHTML = billRows || `<tr><td colspan="4" class="empty">Nothing sold yet.</td></tr>`;
  const fee = roundFee(viewRoundId);
  $("farmSub").textContent = peso(billSub);
  if(document.activeElement !== $("farmFee")) $("farmFee").value = fee;
  $("farmGrand").textContent = peso(billSub + fee);
  let nL=0,nP=0;
  $("farmOrders").innerHTML = list.length ? list.map(o => {
    const sub = orderSub(o);
    const rows = (o.lines||[]).map((l,i) => { nL++; if(l.packed) nP++;
      const g = l.unit==="100g";
      const actualVal = l.actualKg!=null ? +l.actualKg : +l.qtyKg;
      return `<tr class="${l.packed?"packed":""}">
        <td>${esc(l.name)}</td><td class="n">${qtyText(l.unit,+l.qtyKg)}</td>
        <td class="n"><input type="number" class="num" id="a-${esc(o.id)}-${i}" data-o="${esc(o.id)}" data-i="${i}" value="${g?Math.round(actualVal*1000):r3(actualVal)}" min="0" step="${g?10:0.01}" aria-label="${esc(l.name)} actual amount"> ${g?"g":"kg"}</td>
        <td class="n">${priceText(l)}</td><td class="n">${peso(lineAmt(l.unit,l.price,effKg(l)))}</td>
        <td><button type="button" class="${l.packed?"done":""}" data-pack="${esc(o.id)}" data-i="${i}">${l.packed?"✓ Packed":"Mark packed"}</button></td></tr>`;
    }).join("");
    return `<div class="card"><div class="cardhead"><span class="cust">${esc(o.customer)}</span><span class="sub">Ordered ${new Date(o.createdAt).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</span></div>
      <div class="tbl"><table><thead><tr><th>Vegetable</th><th class="n">Ordered</th><th class="n">Actual</th><th class="n">Price</th><th class="n">Subtotal</th><th>Check</th></tr></thead>
      <tbody>${rows}</tbody><tfoot><tr><td colspan="4">Total</td><td class="n">${peso(sub)}</td><td></td></tr></tfoot></table></div></div>`;
  }).join("") : `<div class="tbl"><table><tbody><tr><td class="empty">No orders for this delivery yet.</td></tr></tbody></table></div>`;
  $("farmProgress").textContent = nL ? `Packed ${nP} of ${nL} items` : "";
}
function setLine(oid, i, packed, actualKg){
  const o = orders.find(x=>x.id===oid); if(!o) return;
  o.lines[i] = {...o.lines[i], packed, actualKg}; renderAll();
  act("farmer_update_line", {p_order:oid, p_index:i, p_packed:packed, p_actual:actualKg});
}
$("farmOrders").addEventListener("click", e => {
  const b = e.target.closest("button[data-pack]"); if(!b) return;
  const oid=b.dataset.pack, i=+b.dataset.i, o=orders.find(x=>x.id===oid), l=o.lines[i];
  const v = parseFloat($(`a-${oid}-${i}`).value);
  const kg = isNaN(v) ? +l.qtyKg : r3(l.unit==="100g" ? v/1000 : v);
  setLine(oid, i, !l.packed, kg);
});
$("farmOrders").addEventListener("change", e => {
  const inp = e.target.closest("input[data-o]"); if(!inp) return;
  const o = orders.find(x=>x.id===inp.dataset.o), i=+inp.dataset.i, l=o.lines[i];
  const v = parseFloat(inp.value); if(isNaN(v)||v<0) return;
  setLine(o.id, i, !!l.packed, r3(l.unit==="100g" ? v/1000 : v));
});
$("farmFee").addEventListener("change", () => {
  const r = rounds[viewRoundId]; const v = parseFloat($("farmFee").value);
  if(!r || isNaN(v) || v<0) return;
  r.deliveryFee = v; renderAll();
  act("farmer_set_fee", {p_round:viewRoundId, p_fee:v});
});

/* ---------- ADMIN ---------- */
let confirmDel = null;
function renderAdmin(){
  const r = rounds[viewRoundId];
  const tb = $("toggleOpen");
  tb.hidden = !r;
  if(r){ tb.textContent = r.open ? "Close orders" : "Reopen orders"; tb.className = r.open ? "" : "primary"; }
  $("makeLive").hidden = !r || viewRoundId === currentId;
  $("delRound").hidden = !r; $("editRound").hidden = !r;
  const nOrd = roundOrders(viewRoundId).length;
  $("delRound").textContent = confirmRoundDel === viewRoundId
    ? (nOrd ? `Confirm: delete form and its ${nOrd} order${nOrd>1?"s":""}` : "Confirm delete")
    : "Delete this form";
  $("liveNote").textContent = !r ? "" : viewRoundId === currentId
    ? "Customers see this form now."
    : "Customers do not see this form. Press \"Show this form to customers\" to switch.";
  $("pwCard").hidden = false;
  const groups = customerGroups(viewRoundId), share = feeShare(viewRoundId), fee = roundFee(viewRoundId);
  $("feeNote").textContent = groups.length ? `Delivery fee from farmer ${peso(fee)} ÷ ${groups.length} customer${groups.length>1?"s":""} = ${peso(share)} each.` : "";
  let T=0,U=0; const inv=[];
  $("billBody").innerHTML = groups.length ? groups.map(g => {
    const sub=g.orders.reduce((x,o)=>x+orderSub(o),0), tot=sub+share, paid=g.orders.every(o=>o.paid);
    T+=tot; if(!paid) U+=tot;
    const lines=g.orders.flatMap(o=>o.lines||[]), n=lines.length, p=lines.filter(l=>l.packed).length;
    const k=esc(g.key);
    inv.push(`<article class="inv">
      <div class="inv-top"><div><div class="inv-farm">RichAnn Vegetable Farm</div><div class="inv-to">Bill to <b>${esc(g.name)}</b></div></div>
        <div class="inv-right"><div class="inv-word">INVOICE</div><div>Delivery ${esc(fmtDate(r.date))}</div></div></div>
      <table class="inv-t"><thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Price</th><th class="n">Amount</th></tr></thead><tbody>
      ${lines.map(l=>`<tr><td>${esc(l.name)}</td><td class="n">${qtyText(l.unit,effKg(l))}</td><td class="n">${priceText(l)}</td><td class="n">${peso(lineAmt(l.unit,l.price,effKg(l)))}</td></tr>`).join("")}
      </tbody><tfoot>
        <tr><td colspan="3">Subtotal</td><td class="n">${peso(sub)}</td></tr>
        <tr><td colspan="3">Delivery fee (${peso(fee)}/${groups.length} customer${groups.length>1?"s":""})</td><td class="n">${peso(share)}</td></tr>
        <tr class="inv-due"><td colspan="3">Total due</td><td class="n">${peso(tot)}</td></tr>
      </tfoot></table>
      <div class="inv-foot"><span class="pill ${paid?"ok":"low"}">${paid?"PAID":"PAYMENT DUE"}</span>${p<n?`<span class="inv-note">Packing ${p}/${n}: amounts may change</span>`:""}</div>
    </article>`);
    return `<tr><td><div class="cust">${esc(g.name)}</div><div class="detail">${p===n?"Packed":`Packing ${p}/${n}`}${g.orders.length>1?` · ${g.orders.length} orders`:""}</div></td>
      <td class="n"><b>${peso(tot)}</b></td>
      <td><button type="button" class="${paid?"done":""}" data-paid="${k}">${paid?"✓ Paid":"Mark paid"}</button></td>
      <td><button type="button" class="danger" data-del="${k}" aria-label="Delete ${esc(g.name)}'s order">${confirmDel===g.key?"Delete?":"✕"}</button></td></tr>`;
  }).join("") : `<tr><td colspan="4" class="empty">${staffLoaded?"No orders for this delivery yet.":"Loading…"}</td></tr>`;
  $("billFoot").innerHTML = groups.length ? `<tr><td>Total · ${groups.length} customers</td><td class="n">${peso(T)}</td><td colspan="2">Unpaid ${peso(U)}</td></tr>` : "";
  $("invoices").innerHTML = inv.join("");
  $("invHead").hidden = !inv.length;
}
$("billBody").addEventListener("click", e => {
  const p = e.target.closest("button[data-paid]");
  if(p){ const g=customerGroups(viewRoundId).find(x=>x.key===p.dataset.paid); if(!g) return;
    const v=!g.orders.every(o=>o.paid); g.orders.forEach(o=>o.paid=v); renderAll();
    act("admin_set_paid", {p_ids:g.orders.map(o=>o.id), p_paid:v}); return; }
  const d = e.target.closest("button[data-del]");
  if(d){ const k=d.dataset.del; if(confirmDel!==k){ confirmDel=k; renderAdmin(); return; }
    confirmDel=null; const g=customerGroups(viewRoundId).find(x=>x.key===k); if(!g) return;
    const ids=g.orders.map(o=>o.id); orders=orders.filter(x=>!ids.includes(x.id)); renderAll();
    act("admin_delete_orders", {p_ids:ids}); }
});
let confirmRoundDel = null;
$("makeLive").addEventListener("click", async () => {
  const rid = viewRoundId; if(!rounds[rid]) return;
  currentId = rid; renderAll();
  await act("admin_set_current", {p_round:rid});
});
$("delRound").addEventListener("click", async () => {
  const rid = viewRoundId; if(!rounds[rid]) return;
  if(confirmRoundDel !== rid){ confirmRoundDel = rid; renderAdmin(); return; }
  confirmRoundDel = null;
  delete rounds[rid]; orders = orders.filter(o => o.roundId !== rid); viewRoundId = null; renderAll();
  await act("admin_delete_round", {p_round:rid});
});
document.querySelectorAll(".roundSel").forEach(s => s.addEventListener("change", () => { confirmRoundDel = null; }));
$("toggleOpen").addEventListener("click", () => {
  const r=rounds[viewRoundId]; if(!r) return; r.open=!r.open; renderAll();
  act("admin_set_open", {p_round:viewRoundId, p_open:r.open});
});

/* list editor */
let editRows = [], editingId = null;
function setEditMode(){
  const ed = !!editingId;
  $("editTitle").textContent = ed ? `Edit order form · ${fmtDate(rounds[editingId]?.date || "")}` : "Create a new order form";
  $("pasteArea").hidden = ed; $("copyCurrent").hidden = ed; $("editHint").hidden = !ed; $("cancelEdit").hidden = !ed;
  $("publishRound").textContent = ed ? "Save changes" : "Publish this order form";
}
$("editRound").addEventListener("click", () => {
  const r = rounds[viewRoundId]; if(!r) return;
  editingId = viewRoundId;
  editRows = r.items.map(it => ({id:it.id, name:it.name, limitKg: it.limitKg ?? "", price: it.price, unit: it.unit}));
  $("newDate").value = r.date; $("editMsg").hidden = true;
  setEditMode(); renderEdit();
  $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
});
$("cancelEdit").addEventListener("click", () => { editingId = null; editRows = []; $("newDate").value = new Date(Date.now()+8*3600e3).toISOString().slice(0,10); setEditMode(); renderEdit(); });
function parseList(text){
  const out=[];
  for(const raw of text.split(/\n/)){
    const line = raw.trim(); if(!line) continue;
    const m = line.match(/^(?:(\d+(?:\.\d+)?)\s*kg\s+)?(.+?)\s+(\d+(?:\.\d+)?)\s*\/\s*(100\s*g|kg)\s*$/i);
    if(!m){ out.push({name:line, limitKg:"", price:"", unit:"kg", bad:true}); continue; }
    out.push({name:m[2].trim(), limitKg:m[1]||"", price:m[3], unit:/100/.test(m[4])?"100g":"kg"});
  }
  return out;
}
function renderEdit(){
  $("editBody").innerHTML = editRows.length ? editRows.map((r,i)=>`<tr${r.bad?' class="out"':""}>
    <td><input id="en-${i}" data-k="name" data-i="${i}" value="${esc(r.name)}" aria-label="Vegetable name"></td>
    <td class="n"><input id="el-${i}" class="num" type="number" min="0" step="0.5" data-k="limitKg" data-i="${i}" value="${esc(r.limitKg)}" placeholder="none" aria-label="Stock limit"></td>
    <td class="n"><input id="ep-${i}" class="num" type="number" min="0" data-k="price" data-i="${i}" value="${esc(r.price)}" aria-label="Price"></td>
    <td><select id="eu-${i}" data-k="unit" data-i="${i}" aria-label="Unit"><option value="kg"${r.unit==="kg"?" selected":""}>/kg</option><option value="100g"${r.unit==="100g"?" selected":""}>/100g</option></select></td>
    <td><button type="button" class="danger" data-rm="${i}" aria-label="Remove row">✕</button></td></tr>`).join("")
    : `<tr><td colspan="5" class="empty">Paste a list above and press "Load into table".</td></tr>`;
}
$("editBody").addEventListener("input", e => { const t=e.target; if(t.dataset.k){ editRows[+t.dataset.i][t.dataset.k]=t.value; editRows[+t.dataset.i].bad=false; } });
$("editBody").addEventListener("click", e => { const b=e.target.closest("[data-rm]"); if(b){ editRows.splice(+b.dataset.rm,1); renderEdit(); } });
$("parseBtn").onclick = () => { editRows = parseList($("listText").value); renderEdit(); };
$("addRow").onclick = () => { editRows.push({name:"",limitKg:"",price:"",unit:"kg"}); renderEdit(); };
$("copyCurrent").onclick = () => {
  const r = rounds[currentId]; if(!r) return;
  $("listText").value = r.items.map(it => `${it.limitKg!=null?it.limitKg+" kg ":""}${it.name}   ${it.price}/${it.unit}`).join("\n");
  editRows = parseList($("listText").value); renderEdit();
};
$("newDate").value = new Date(Date.now()+8*3600e3).toISOString().slice(0,10);
$("publishRound").onclick = async () => {
  const msg=$("editMsg"), say=(t,ok)=>{msg.textContent=t;msg.className="msg "+(ok?"ok":"err");msg.hidden=false;};
  const items=[], seen={};
  editRows.forEach(r => { if(r.id) seen[r.id]=1; });
  for(const r of editRows){
    const name=String(r.name).trim(), price=parseFloat(r.price);
    if(!name) continue;
    if(!(price>0)) return say(`Enter a price for ${name}.`);
    let id=r.id;
    if(!id){ id=name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"item"; while(seen[id]) id+="-2"; seen[id]=1; }
    const lim=parseFloat(r.limitKg);
    items.push({id,name,price,unit:r.unit==="100g"?"100g":"kg",limitKg: lim>0?lim:null});
  }
  if(!items.length) return say("Add at least one vegetable.");
  const date=$("newDate").value || new Date().toISOString().slice(0,10);
  $("publishRound").disabled = true;
  if(editingId){
    try{
      await rpc("admin_update_round", {p_pw:pw.admin, p_round:editingId, p_date:date, p_items:items});
      viewRoundId = editingId; editingId = null; editRows = []; setEditMode(); renderEdit(); await loadStaff();
      say("Changes saved. Customers see the new names, prices and date now.", true);
    }catch(e){ if(e.wrongPw) lockAll(); else say("Could not save: " + e.message); }
    finally{ $("publishRound").disabled = false; }
    return;
  }
  try{
    const rid = await rpc("admin_create_round", {p_pw:pw.admin, p_date:date, p_items:items});
    viewRoundId = rid; await loadStaff();
    say(`Order form for ${fmtDate(date)} is live (${items.length} items). The previous delivery is now closed.`, true);
  }catch(e){ if(e.wrongPw) lockAll(); else say("Could not publish: " + e.message); }
  finally{ $("publishRound").disabled = false; }
};

$("savePw").onclick = async () => {
  const msg=$("pwMsg"), say=(t,ok)=>{msg.textContent=t;msg.className="msg "+(ok?"ok":"err");msg.hidden=false;};
  const f=$("newFarmerPw").value.trim(), a=$("newAdminPw").value.trim();
  if(!f && !a) return say("Type a new password first.");
  if((f && f.length<4) || (a && a.length<4)) return say("Use at least 4 characters.");
  try{
    await rpc("admin_set_passwords", {p_pw:pw.admin, p_farmer:f, p_admin:a});
    if(a){ pw.admin = a; savePw(); }
    $("newFarmerPw").value=""; $("newAdminPw").value=""; say("Passwords saved.", true);
  }catch(e){ if(e.wrongPw) lockAll(); else say("Could not save: " + e.message); }
};

/* ---------- render ---------- */
function renderAll(){
  const t = tab(), a = document.activeElement;
  const r = t==="order" ? form.round : rounds[currentId];
  $("roundLabel").textContent = !configured ? "Setup needed" : r ? `Delivery ${fmtDate(r.date)} · ${r.open?"Taking orders":"Orders closed"}` : "No order form yet";
  if(t==="order"){ if(builtFormFor !== (form.round ? form.round.id : null)) buildOrderForm(); else updateOrderForm(); return; }
  fillRoundSelects();
  if(t==="farmer" && isUnlocked("farmer") && !(a && $("farmOrders").contains(a) && a.tagName==="INPUT")) renderFarmer();
  if(t==="admin" && isUnlocked("admin") && !(a && $("billBody").contains(a) && a.tagName==="INPUT")) renderAdmin();
}
document.addEventListener("focusout", () => setTimeout(renderAll, 0));

if(!configured){
  showStatus("Setup needed: paste the Supabase project URL and key at the top of the script in index.html.", true);
}
renderEdit(); showTab();
// refresh every 20 seconds so stock and orders stay current
setInterval(() => { if(document.hidden) return; if(tab()==="order") loadForm(); else if(isUnlocked(tab())) loadStaff(); }, 20000);
})();
</script>
</body>
</html>
