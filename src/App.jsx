import { useState } from "react";

const PINS = { staff: "1111", toyota: "2222", aws: "3333", admin: "4444" };
const STORES = { toyota: "Toyota Sta Rosa", aws: "AWS" };
const DEFAULT_PRODUCTS = [
  { name: "Reg pandesal", price: 55 },
  { name: "Wheat pandesal", price: 65 },
  { name: "Malunggai pandesal", price: 65 },
  { name: "Shokupan", price: 140 },
  { name: "Brioche", price: 160 },
  { name: "Muesli (S)", price: 95 },
  { name: "Sourdough loaf", price: 175 },
  { name: "Milk Bread", price: 95 },
  { name: "Ciabatta", price: 80 },
  { name: "Curry bread", price: 60 },
  { name: "Ham & Cheese", price: 60 },
  { name: "Tuna onion", price: 50 },
  { name: "Garlic tomato roll", price: 55 },
  { name: "Melonpan Choco chips", price: 50 },
  { name: "Red bean", price: 50 },
  { name: "Napoli Cheese", price: 55 },
  { name: "Honey Toast", price: 45 },
  { name: "Coffee", price: 65 },
  { name: "Matcha", price: 65 },
  { name: "J. Cheesecake", price: 220 },
  { name: "Banana bread", price: 135 },
];

let _db = { products: DEFAULT_PRODUCTS, dailyLists: [], salesRecords: [] };
const db = {
  getProducts: () => _db.products,
  setProducts: (p) => { _db.products = p; },
  addList: (l) => { _db.dailyLists.push(l); },
  getLists: () => _db.dailyLists,
  addRecord: (r) => { _db.salesRecords.push(r); },
  updateRecord: (id, patch) => { _db.salesRecords = _db.salesRecords.map(r => r.id === id ? { ...r, ...patch } : r); },
  deleteRecord: (id) => { _db.salesRecords = _db.salesRecords.filter(r => r.id !== id); },
  getRecords: () => _db.salesRecords,
  getRecordsByStore: (store) => _db.salesRecords.filter(r => r.store === store),
  getRecordsByMonth: (y, m) => _db.salesRecords.filter(r => { const d = new Date(r.date); return d.getFullYear() === y && d.getMonth() + 1 === m; }),
  getPendingCount: () => _db.salesRecords.filter(r => r.status === "submitted").length,
};

const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const currency = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

const calcLO = (item) => Math.max(0, (item.qty || 0) - (item.soldFull || 0) - (item.sold5 || 0));
const calcWaste = (item) => Math.max(0, (item.stock50 || 0) - (item.sold50 || 0));
const calcItemTotal = (item, isToyota) =>
  (item.soldFull || 0) * item.price +
  (isToyota ? (item.sold5 || 0) * item.price * 0.95 : 0) +
  (isToyota ? (item.sold50 || 0) * item.price * 0.50 : 0);
const calcTotals = (record) => {
  const isToyota = record.store === "toyota";
  const totalSales = (record.items || []).reduce((s, i) => s + calcItemTotal(i, isToyota), 0);
  const onlineTotal = (record.onlinePayments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const endingCash = (record.startingCash || 0) + totalSales - (record.expenses || 0) - onlineTotal;
  return { totalSales, onlineTotal, endingCash };
};

const P = {
  bg: "#0f0e11", surface: "#1a1820", card: "#221f2a", border: "#2e2a38",
  accent: "#f5a623", text: "#f0eaf8", muted: "#7a7189",
  green: "#4ade80", red: "#f87171", blue: "#60a5fa",
  orange: "#fb923c", purple: "#a78bfa", toyota: "#e74c3c", aws: "#f39c12",
};
const S = {
  app: { minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  hdr: { background: P.surface, borderBottom: `1px solid ${P.border}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  sec: { padding: "14px 14px 40px" },
  card: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: "16px" },
  inp: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, padding: "9px 12px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none" },
  lbl: { fontSize: 11, color: P.muted, fontWeight: 700, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  col: { flex: 1, minWidth: 0 },
  tw: { overflowX: "auto" },
  th: { background: P.surface, color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "7px 8px", textAlign: "center", whiteSpace: "nowrap" },
  td: { padding: "6px 8px", borderBottom: `1px solid ${P.border}`, fontSize: 13, textAlign: "center" },
  sb: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: "12px 14px", marginTop: 10 },
  pill: (c) => ({ background: c + "22", color: c, border: `1px solid ${c}44`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, display: "inline-block" }),
  btn: (v = "primary") => ({
    background: v === "primary" ? P.accent : v === "danger" ? P.red : v === "success" ? P.green : v === "ghost" ? "transparent" : P.card,
    color: v === "primary" || v === "success" ? "#111" : v === "danger" ? "#fff" : P.text,
    border: v === "ghost" ? `1px solid ${P.border}` : "none",
    borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer",
  }),
};

function Stepper({ value, onChange, min = 0, max, color = P.accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
      <button onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 30, height: 30, borderRadius: 6, background: P.surface, border: `1px solid ${P.border}`, color: P.text, fontSize: 18, cursor: "pointer" }}>−</button>
      <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700, color, fontSize: 14 }}>{value}</span>
      <button onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        style={{ width: 30, height: 30, borderRadius: 6, background: P.surface, border: `1px solid ${P.border}`, color: P.text, fontSize: 18, cursor: "pointer" }}>+</button>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = { draft: [P.muted, "Draft"], submitted: [P.orange, "⏳ Submitted"], confirmed: [P.green, "✓ Confirmed"] };
  const [c, label] = cfg[status] || cfg.draft;
  return <span style={S.pill(c)}>{label}</span>;
}

// ── PIN Screen ────────────────────────────────────────────────────────────────
function PinScreen({ onLogin, pendingCount }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const tryLogin = (p) => {
    const found = Object.entries(PINS).find(([, v]) => v === p);
    if (found) { setError(false); onLogin(found[0]); }
    else { setError(true); setPin(""); }
  };
  const press = (k) => {
    if (pin.length < 3) { setPin(p => p + k); }
    else { const full = pin + k; setPin(full); tryLogin(full); }
  };
  const del = () => setPin(p => p.slice(0, -1));

  const roles = [
    { label: "Main Store Staff", role: "staff", hint: "Prepare daily list" },
    { label: "Toyota Sales", role: "toyota", hint: "Record Toyota sales" },
    { label: "AWS Sales", role: "aws", hint: "Record AWS sales" },
    { label: "Admin", role: "admin", hint: "View reports & export" },
  ];

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 36 }}>🍞</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: P.accent }}>Bread Sales Record</div>
        <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>Enter your PIN to continue</div>
      </div>
      <div style={{ ...S.card, width: 272, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18 }}>
          {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: pin.length > i ? P.accent : P.border, transition: "background 0.2s" }} />)}
        </div>
        {error && <div style={{ color: P.red, fontSize: 13, marginBottom: 10 }}>Incorrect PIN. Try again.</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
            <button key={i} onClick={() => k === "⌫" ? del() : k !== "" ? press(String(k)) : null}
              style={{ background: k === "" ? "transparent" : P.surface, border: `1px solid ${k === "" ? "transparent" : P.border}`, borderRadius: 10, color: P.text, fontSize: 20, fontWeight: 600, padding: "13px 0", cursor: k === "" ? "default" : "pointer" }}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8, width: 272 }}>
        {roles.map(r => (
          <div key={r.role} style={{ ...S.card, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: P.muted }}>{r.hint}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {r.role === "admin" && pendingCount > 0 && <span style={{ background: P.red, color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Staff View ────────────────────────────────────────────────────────────────
function StaffView() {
  const [tab, setTab] = useState("create");
  const [tick, setTick] = useState(0);
  const prods = db.getProducts();

  const [date, setDate] = useState(todayStr());
  const [target, setTarget] = useState("toyota");
  const [items, setItems] = useState(prods.map(p => ({ ...p, qty: 0, selected: false })));
  const [sent, setSent] = useState(false);

  // Product management state
  const [products, setProducts] = useState([...prods]);
  const [editIdx, setEditIdx] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  const refreshItemsFromProducts = () => {
    const latest = db.getProducts();
    setItems(latest.map(p => ({ ...p, qty: 0, selected: false })));
  };

  const toggle = (i) => setItems(prev => prev.map((x, j) => j === i ? { ...x, selected: !x.selected } : x));
  const setQty = (i, v) => setItems(prev => prev.map((x, j) => j === i ? { ...x, qty: Math.max(0, v) } : x));
  const handleSend = () => {
    const sel = items.filter(x => x.selected && x.qty > 0);
    if (!sel.length) return;
    db.addList({ id: uid(), date, store: target, items: sel.map(({ name, price, qty }) => ({ name, price, qty })), createdAt: new Date().toISOString() });
    setSent(true);
  };

  const savePrice = (i) => {
    const u = products.map((p, j) => j === i ? { ...p, price: Number(editPrice) } : p);
    setProducts(u); db.setProducts(u); setEditIdx(null);
    refreshItemsFromProducts();
  };
  const addProduct = () => {
    if (!newName || !newPrice) return;
    const u = [...products, { name: newName, price: Number(newPrice) }];
    setProducts(u); db.setProducts(u);
    setNewName(""); setNewPrice("");
    refreshItemsFromProducts();
  };
  const deleteProduct = (i) => {
    const u = products.filter((_, j) => j !== i);
    setProducts(u); db.setProducts(u);
    setConfirmDeleteIdx(null);
    refreshItemsFromProducts();
  };

  if (sent) return (
    <div style={{ ...S.sec, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: P.green }}>List Sent to {STORES[target]}!</div>
      <button style={{ ...S.btn(), marginTop: 24 }} onClick={() => { setSent(false); refreshItemsFromProducts(); }}>Create Another</button>
    </div>
  );

  const tabs = [
    { id: "create", label: "📋 Create List" },
    { id: "manage", label: "🏷️ Manage Products" },
  ];

  return (
    <div style={S.sec}>
      <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Main Store</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.btn(tab === t.id ? "primary" : "ghost"), padding: "8px 14px", fontSize: 13 }}>{t.label}</button>
        ))}
      </div>

      {tab === "create" && (
        <>
          <div style={{ ...S.row, marginBottom: 14 }}>
            <div style={S.col}><label style={S.lbl}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={S.inp} /></div>
            <div style={S.col}><label style={S.lbl}>Send to</label>
              <select value={target} onChange={e => setTarget(e.target.value)} style={S.inp}>
                <option value="toyota">Toyota Sta Rosa</option>
                <option value="aws">AWS</option>
              </select>
            </div>
          </div>
          <div style={S.tw}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...S.th, textAlign: "left" }}>Item</th>
                <th style={S.th}>Price</th>
                <th style={S.th}>Include</th>
                <th style={S.th}>Qty to Send</th>
              </tr></thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ background: item.selected ? "#2a2060" : "transparent" }}>
                    <td style={{ ...S.td, textAlign: "left" }}>{item.name}</td>
                    <td style={S.td}>{currency(item.price)}</td>
                    <td style={S.td}><input type="checkbox" checked={item.selected} onChange={() => toggle(i)} style={{ accentColor: P.accent, width: 16, height: 16 }} /></td>
                    <td style={S.td}>{item.selected && <Stepper value={item.qty} onChange={v => setQty(i, v)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: P.muted, fontSize: 12, marginTop: 10 }}>Need a new product or price change? Use the "Manage Products" tab above.</p>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSend} style={S.btn()}>Send to {STORES[target]} →</button>
          </div>
        </>
      )}

      {tab === "manage" && (
        <div>
          <p style={{ color: P.muted, fontSize: 13, marginTop: 0 }}>Add new products, remove discontinued ones, or update prices. Changes apply to future lists.</p>

          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: P.accent }}>+ Add New Product</div>
            <div style={S.row}>
              <div style={{ flex: 2 }}><input placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)} style={S.inp} /></div>
              <div style={{ flex: 1 }}><input placeholder="Price" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={S.inp} /></div>
              <button onClick={addProduct} style={S.btn()}>Add</button>
            </div>
          </div>

          {products.map((p, i) => (
            <div key={i} style={{ ...S.card, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{p.name}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {editIdx === i
                  ? <>
                    <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ ...S.inp, width: 80, padding: "5px 8px" }} autoFocus />
                    <button onClick={() => savePrice(i)} style={{ ...S.btn(), padding: "6px 12px", fontSize: 12 }}>Save</button>
                    <button onClick={() => setEditIdx(null)} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 12 }}>Cancel</button>
                  </>
                  : <button onClick={() => { setEditIdx(i); setEditPrice(p.price); }} style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 8, color: P.accent, padding: "5px 12px", cursor: "pointer", fontWeight: 700 }}>{currency(p.price)}</button>
                }
                {confirmDeleteIdx === i
                  ? <>
                    <span style={{ fontSize: 11, color: P.red }}>Delete?</span>
                    <button onClick={() => deleteProduct(i)} style={{ ...S.btn("danger"), padding: "5px 10px", fontSize: 11 }}>Yes</button>
                    <button onClick={() => setConfirmDeleteIdx(null)} style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: 11 }}>No</button>
                  </>
                  : <button onClick={() => setConfirmDeleteIdx(i)} style={{ background: "none", border: `1px solid ${P.red}44`, borderRadius: 7, color: P.red, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>🗑</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Seller View ───────────────────────────────────────────────────────────────
function SellerView({ role, onRecordChange }) {
  const isToyota = role === "toyota";
  const storeColor = role === "toyota" ? P.toyota : P.aws;
  const allProds = db.getProducts();

  // ALL hooks at top level
  const [view, setView] = useState("menu");
  const [selectedList, setSelectedList] = useState(null);
  const [step, setStep] = useState("selectList");
  const [items, setItems] = useState([]);
  const [stock50Items, setStock50Items] = useState(allProds.map(p => ({ name: p.name, price: p.price, stock50: 0 })));
  const [payments, setPayments] = useState([{ ref: "", amount: "" }]);
  const [startingCash, setStartingCash] = useState("");
  const [expenses, setExpenses] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [submitDone, setSubmitDone] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const myRecords = db.getRecordsByStore(role);
  const myLists = db.getLists().filter(l => l.store === role);

  const resetAll = () => {
    setView("menu"); setSelectedList(null); setStep("selectList");
    setItems([]); setStock50Items(allProds.map(p => ({ name: p.name, price: p.price, stock50: 0 })));
    setPayments([{ ref: "", amount: "" }]); setStartingCash(""); setExpenses("");
    setSavedId(null); setSubmitDone(false); setConfirmDeleteId(null);
  };

  const selectList = (list) => {
    setSelectedList(list);
    if (isToyota) { setStep("stock50"); }
    else { setItems(list.items.map(i => ({ ...i, soldFull: 0 }))); setStep("sales"); }
  };

  const goToSalesFromStock50 = () => {
    const merged = selectedList.items.map(i => ({
      ...i, soldFull: 0, sold5: 0, sold50: 0,
      stock50: stock50Items.find(s => s.name === i.name)?.stock50 || 0,
    }));
    stock50Items.forEach(s => {
      if (s.stock50 > 0 && !merged.find(m => m.name === s.name)) {
        merged.push({ name: s.name, price: s.price, qty: 0, soldFull: 0, sold5: 0, stock50: s.stock50, sold50: 0 });
      }
    });
    setItems(merged);
    setStep("sales");
  };

  const updateItem = (i, field, val) =>
    setItems(prev => prev.map((x, j) => j === i ? { ...x, [field]: Math.max(0, val) } : x));
  const updateStock50 = (i, val) =>
    setStock50Items(prev => prev.map((x, j) => j === i ? { ...x, stock50: Math.max(0, val) } : x));
  const addPayment = () => setPayments(p => [...p, { ref: "", amount: "" }]);
  const updPayment = (i, f, v) => setPayments(p => p.map((x, j) => j === i ? { ...x, [f]: v } : x));
  const removePayment = (i) => setPayments(p => p.filter((_, j) => j !== i));

  const handleSave = () => {
    const newId = uid();
    db.addRecord({
      id: newId, listId: selectedList.id, store: role, date: selectedList.date,
      items, onlinePayments: payments.filter(p => p.ref || p.amount),
      startingCash: Number(startingCash) || 0, expenses: Number(expenses) || 0,
      status: "draft", submittedAt: null, confirmedAt: null,
    });
    setSavedId(newId); onRecordChange();
  };

  const handleSubmit = () => {
    db.updateRecord(savedId, { status: "submitted", submittedAt: new Date().toISOString() });
    setSubmitDone(true); onRecordChange();
  };

  const handleDeleteRecord = (id) => {
    db.deleteRecord(id); setConfirmDeleteId(null); onRecordChange();
  };

  const totals = items.length
    ? calcTotals({ store: role, items, onlinePayments: payments, startingCash: Number(startingCash) || 0, expenses: Number(expenses) || 0 })
    : { totalSales: 0, onlineTotal: 0, endingCash: 0 };

  // ── MENU ──
  if (view === "menu") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sales Entry</h2>
        <span style={S.pill(storeColor)}>{STORES[role]}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div onClick={() => { setView("entry"); setStep("selectList"); }} style={{ ...S.card, border: `1px solid ${P.accent}44`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontWeight: 700, color: P.accent }}>📝 New Sales Record</div><div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>Enter today's sales</div></div>
          <span style={{ color: P.accent, fontSize: 20 }}>→</span>
        </div>
        <div onClick={() => setView("history")} style={{ ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontWeight: 700 }}>📂 My Records</div><div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>{myRecords.length} records</div></div>
          <span style={{ color: P.muted, fontSize: 20 }}>→</span>
        </div>
      </div>
    </div>
  );

  // ── HISTORY ──
  if (view === "history") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => { setView("menu"); setConfirmDeleteId(null); }} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>My Records</h2>
      </div>
      {myRecords.length === 0 && <div style={{ ...S.card, textAlign: "center", padding: 40, color: P.muted }}>No records yet.</div>}
      {[...myRecords].reverse().map(r => {
        const t = calcTotals(r);
        const canDelete = r.status === "draft" || r.status === "confirmed";
        return (
          <div key={r.id} style={{ ...S.card, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 700 }}>{fmtDate(r.date)}</span>
              <StatusBadge status={r.status} />
            </div>
            <div style={{ fontSize: 13, color: P.muted }}>Total: <span style={{ color: P.green, fontWeight: 600 }}>{currency(t.totalSales)}</span></div>
            {r.submittedAt && <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Submitted {fmtTime(r.submittedAt)}</div>}
            {r.confirmedAt && <div style={{ fontSize: 11, color: P.green, marginTop: 2 }}>✓ Confirmed {fmtTime(r.confirmedAt)}</div>}
            {r.status === "submitted" && <div style={{ fontSize: 11, color: P.muted, marginTop: 6, fontStyle: "italic" }}>Cannot delete — pending admin review.</div>}
            {canDelete && (
              confirmDeleteId === r.id
                ? <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: P.red, flex: 1 }}>Delete this record?</span>
                  <button onClick={() => handleDeleteRecord(r.id)} style={{ ...S.btn("danger"), padding: "5px 12px", fontSize: 12 }}>Delete</button>
                  <button onClick={() => setConfirmDeleteId(null)} style={{ ...S.btn("ghost"), padding: "5px 12px", fontSize: 12 }}>Cancel</button>
                </div>
                : <button onClick={() => setConfirmDeleteId(r.id)} style={{ background: "none", border: `1px solid ${P.red}44`, borderRadius: 7, color: P.red, padding: "5px 10px", fontSize: 11, marginTop: 8, cursor: "pointer" }}>🗑 Delete</button>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── SUBMIT DONE ──
  if (submitDone) return (
    <div style={{ ...S.sec, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📨</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: P.orange }}>Submitted to Admin!</div>
      <div style={{ color: P.muted, marginTop: 8, fontSize: 13 }}>The admin will review and confirm your record.</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <button style={S.btn("ghost")} onClick={() => { setView("history"); setSubmitDone(false); }}>View My Records</button>
        <button style={S.btn()} onClick={resetAll}>Done</button>
      </div>
    </div>
  );

  // ── SAVED → SUBMIT ──
  if (savedId) {
    const rec = db.getRecords().find(r => r.id === savedId);
    const t = rec ? calcTotals(rec) : { totalSales: 0 };
    return (
      <div style={S.sec}>
        <div style={{ ...S.card, marginBottom: 14, textAlign: "center", borderColor: P.green + "44" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: P.green }}>Record Saved</div>
          <div style={{ color: P.muted, fontSize: 13, marginTop: 4 }}>Total Sales: <strong style={{ color: P.green }}>{currency(t.totalSales)}</strong></div>
        </div>
        <div style={{ ...S.card, marginBottom: 18, borderColor: P.orange + "44" }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: P.orange }}>📨 Submit to Admin</div>
          <div style={{ fontSize: 13, color: P.muted, marginBottom: 14 }}>When you're done for the day, submit this record for review.</div>
          <button onClick={handleSubmit} style={{ ...S.btn("primary"), width: "100%", fontSize: 15, padding: "13px" }}>Submit to Admin →</button>
        </div>
        <button onClick={resetAll} style={{ ...S.btn("ghost"), width: "100%" }}>Back to Menu</button>
      </div>
    );
  }

  // ── ENTRY: SELECT LIST ──
  if (view === "entry" && step === "selectList") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setView("menu")} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Select Today's List</h2>
      </div>
      {myLists.length === 0 && <div style={{ ...S.card, textAlign: "center", padding: 32, color: P.muted }}>No lists available. Ask main store staff to prepare one.</div>}
      {myLists.map(l => (
        <div key={l.id} onClick={() => selectList(l)} style={{ ...S.card, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontWeight: 700 }}>{fmtDate(l.date)}</div><div style={{ fontSize: 12, color: P.muted }}>{l.items.length} items · {l.items.reduce((s, i) => s + i.qty, 0)} pcs</div></div>
          <span style={{ color: P.accent, fontSize: 20 }}>→</span>
        </div>
      ))}
    </div>
  );

  // ── ENTRY: STOCK50 (Toyota only) ──
  if (view === "entry" && step === "stock50") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button onClick={() => setStep("selectList")} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>50% off Stock Entry</h2>
        <span style={S.pill(P.red)}>STEP 1</span>
      </div>
      <p style={{ color: P.muted, fontSize: 13, marginTop: 4, marginBottom: 14 }}>Enter yesterday's leftovers as today's 50% off stock. All products listed.</p>
      <div style={S.tw}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ ...S.th, textAlign: "left" }}>Item</th>
            <th style={S.th}>Today's Stock</th>
            <th style={{ ...S.th, color: P.red }}>50% Stock</th>
          </tr></thead>
          <tbody>
            {allProds.map((prod, i) => {
              const inList = selectedList?.items.find(x => x.name === prod.name);
              return (
                <tr key={i} style={{ background: stock50Items[i]?.stock50 > 0 ? "#2a1520" : "transparent" }}>
                  <td style={{ ...S.td, textAlign: "left", fontSize: 12 }}>{prod.name}</td>
                  <td style={{ ...S.td, color: P.muted }}>{inList ? inList.qty : "—"}</td>
                  <td style={S.td}><Stepper value={stock50Items[i]?.stock50 || 0} onChange={v => updateStock50(i, v)} color={P.red} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={goToSalesFromStock50} style={S.btn()}>Next: Sales Entry →</button>
      </div>
    </div>
  );

  // ── ENTRY: SALES ──
  const colsToyota = ["Item", "Price", "Stock", "Full Price", "5% off", "50% Stock", "50% Sales", "L/O", "Waste", "Total"];
  const colsAWS = ["Item", "Price", "Stock", "Full Price", "L/O", "Total"];
  const cols = isToyota ? colsToyota : colsAWS;
  const colColor = (h) => h === "L/O" ? P.muted : h === "Waste" ? P.red : h === "50% Sales" ? P.red : h === "5% off" ? P.purple : h === "Total" ? P.green : P.muted;

  return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {isToyota
          ? <button onClick={() => setStep("stock50")} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← 50% Stock</button>
          : <button onClick={() => setStep("selectList")} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>}
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Sales Entry</h2>
        <span style={S.pill(storeColor)}>{STORES[role]}</span>
        {isToyota && <span style={S.pill(P.green)}>STEP 2</span>}
      </div>
      <div style={S.tw}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {cols.map((h, i) => <th key={i} style={{ ...S.th, textAlign: i === 0 ? "left" : "center", color: colColor(h) }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map((item, i) => {
              const lo = calcLO(item), waste = calcWaste(item), total = calcItemTotal(item, isToyota);
              return (
                <tr key={i}>
                  <td style={{ ...S.td, textAlign: "left", fontWeight: 500, fontSize: 12 }}>{item.name}</td>
                  <td style={{ ...S.td, color: P.muted, fontSize: 12 }}>{currency(item.price)}</td>
                  <td style={{ ...S.td, color: P.muted }}>{item.qty}{isToyota && item.stock50 > 0 && <span style={{ color: P.red, fontSize: 10 }}> +{item.stock50}</span>}</td>
                  <td style={S.td}><Stepper value={item.soldFull || 0} onChange={v => updateItem(i, "soldFull", v)} color={P.accent} /></td>
                  {isToyota && <td style={S.td}><Stepper value={item.sold5 || 0} onChange={v => updateItem(i, "sold5", v)} color={P.purple} /></td>}
                  {isToyota && <td style={{ ...S.td, color: P.red }}>{item.stock50 || 0}</td>}
                  {isToyota && <td style={S.td}><Stepper value={item.sold50 || 0} onChange={v => updateItem(i, "sold50", Math.min(item.stock50 || 0, v))} color={P.red} /></td>}
                  <td style={{ ...S.td, color: lo > 0 ? P.orange : P.muted, fontWeight: 600 }}>{lo}</td>
                  {isToyota && <td style={{ ...S.td, color: waste > 0 ? P.red : P.muted, fontWeight: 600 }}>{waste}</td>}
                  <td style={{ ...S.td, color: P.green, fontWeight: 700 }}>{currency(total)}</td>
                </tr>
              );
            })}
            <tr style={{ background: P.surface, fontWeight: 700 }}>
              <td colSpan={isToyota ? 9 : 5} style={{ ...S.td, textAlign: "right", color: P.muted }}>Total Sales</td>
              <td style={{ ...S.td, color: P.green }}>{currency(totals.totalSales)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ ...S.card, margin: "14px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: P.accent }}>💰 Cash Summary</div>
        <div style={S.row}>
          <div style={S.col}><label style={S.lbl}>Starting Cash</label><input type="number" value={startingCash} onChange={e => setStartingCash(e.target.value)} style={S.inp} placeholder="0" /></div>
          <div style={S.col}><label style={S.lbl}>Expenses</label><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} style={S.inp} placeholder="0" /></div>
        </div>
        <div style={S.sb}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}><span style={{ color: P.muted }}>Total Sales</span><span style={{ color: P.green, fontWeight: 600 }}>{currency(totals.totalSales)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}><span style={{ color: P.muted }}>Online Payment</span><span style={{ color: P.blue }}>{currency(totals.onlineTotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}><span style={{ color: P.muted }}>Expenses</span><span style={{ color: P.red }}>−{currency(expenses)}</span></div>
          <div style={{ borderTop: `1px solid ${P.border}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}><span>Ending Cash</span><span style={{ color: P.accent }}>{currency(totals.endingCash)}</span></div>
        </div>
      </div>
      <div style={{ ...S.card, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: P.accent }}>📱 Online Payments (Gcash / BPI)</div>
        {payments.map((p, i) => (
          <div key={i} style={{ ...S.row, marginBottom: 8 }}>
            <div style={{ flex: 2 }}><input placeholder="Ref No." value={p.ref} onChange={e => updPayment(i, "ref", e.target.value)} style={S.inp} /></div>
            <div style={{ flex: 1 }}><input placeholder="Amount" type="number" value={p.amount} onChange={e => updPayment(i, "amount", e.target.value)} style={S.inp} /></div>
            {payments.length > 1 && <button onClick={() => removePayment(i)} style={{ ...S.btn("danger"), padding: "9px 12px" }}>✕</button>}
          </div>
        ))}
        <button onClick={addPayment} style={{ ...S.btn("ghost"), fontSize: 13 }}>+ Add Payment</button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSave} style={S.btn()}>Save Record ✓</button>
      </div>
    </div>
  );
}

// ── Admin View ────────────────────────────────────────────────────────────────
function AdminView({ onRecordChange }) {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const [tab, setTab] = useState("inbox");
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [filterStore, setFilterStore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = () => { setTick(t => t + 1); onRecordChange(); };

  const submitted = db.getRecords().filter(r => r.status === "submitted");
  const records = db.getRecordsByMonth(viewYear, viewMonth)
    .filter(r => (filterStore === "all" || r.store === filterStore) && (filterStatus === "all" || r.status === filterStatus))
    .sort((a, b) => a.date.localeCompare(b.date));
  const grandTotal = records.reduce((s, r) => s + calcTotals(r).totalSales, 0);

  const confirmRecord = (id) => { db.updateRecord(id, { status: "confirmed", confirmedAt: new Date().toISOString() }); refresh(); };
  const deleteRecord = (id) => { db.deleteRecord(id); setConfirmDeleteId(null); refresh(); };

  const exportCSV = () => {
    const rows = [["Date","Store","Item","Stock","Full Price Sales","5% Sales","50% Stock","50% Sales","L/O","Waste","Total","Status"]];
    records.forEach(r => {
      const isToyota = r.store === "toyota";
      r.items.forEach(item => rows.push([r.date, STORES[r.store], item.name, item.qty, item.soldFull, isToyota ? item.sold5 : "", isToyota ? item.stock50 : "", isToyota ? item.sold50 : "", calcLO(item), isToyota ? calcWaste(item) : "", calcItemTotal(item, isToyota).toFixed(2), r.status]));
      rows.push([r.date, STORES[r.store], "--- TOTAL ---", "", "", "", "", "", "", "", calcTotals(r).totalSales.toFixed(2), r.status]);
      rows.push([]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = `sales_${viewYear}_${String(viewMonth).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const RecordCard = ({ r, showConfirm }) => {
    const isToyota = r.store === "toyota";
    const t = calcTotals(r);
    return (
      <div style={{ ...S.card, marginBottom: 12, borderColor: showConfirm ? P.orange + "55" : P.border }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700 }}>{fmtDate(r.date)}</span>
            <span style={S.pill(r.store === "toyota" ? P.toyota : P.aws)}>{STORES[r.store]}</span>
            <StatusBadge status={r.status} />
          </div>
          <span style={{ color: P.green, fontWeight: 700 }}>{currency(t.totalSales)}</span>
        </div>
        {r.submittedAt && <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>Submitted: {fmtTime(r.submittedAt)}</div>}
        {r.confirmedAt && <div style={{ fontSize: 11, color: P.green, marginBottom: 6 }}>✓ Confirmed {fmtTime(r.confirmedAt)}</div>}
        <div style={S.tw}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ ...S.th, textAlign: "left" }}>Item</th>
              <th style={S.th}>Stock</th>
              <th style={S.th}>Full</th>
              {isToyota && <th style={{ ...S.th, color: P.purple }}>5%</th>}
              {isToyota && <th style={{ ...S.th, color: P.red }}>50% Stk</th>}
              {isToyota && <th style={{ ...S.th, color: P.red }}>50% Sls</th>}
              <th style={{ ...S.th, color: P.orange }}>L/O</th>
              {isToyota && <th style={{ ...S.th, color: P.red }}>Waste</th>}
              <th style={{ ...S.th, color: P.green }}>Total</th>
            </tr></thead>
            <tbody>
              {r.items.map((item, i) => {
                const lo = calcLO(item), waste = calcWaste(item), total = calcItemTotal(item, isToyota);
                return (
                  <tr key={i}>
                    <td style={{ ...S.td, textAlign: "left", fontSize: 11 }}>{item.name}</td>
                    <td style={S.td}>{item.qty}</td>
                    <td style={S.td}>{item.soldFull}</td>
                    {isToyota && <td style={{ ...S.td, color: P.purple }}>{item.sold5 || "-"}</td>}
                    {isToyota && <td style={{ ...S.td, color: P.red }}>{item.stock50 || "-"}</td>}
                    {isToyota && <td style={{ ...S.td, color: P.red }}>{item.sold50 || "-"}</td>}
                    <td style={{ ...S.td, color: lo > 0 ? P.orange : P.muted, fontWeight: 600 }}>{lo}</td>
                    {isToyota && <td style={{ ...S.td, color: waste > 0 ? P.red : P.muted, fontWeight: 600 }}>{waste}</td>}
                    <td style={{ ...S.td, color: P.green, fontWeight: 700 }}>{currency(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12, color: P.muted }}>Cash: {currency(r.startingCash)} → {currency(t.endingCash)} | Online: {currency(t.onlineTotal)} | Exp: {currency(r.expenses)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {showConfirm && <button onClick={() => confirmRecord(r.id)} style={{ ...S.btn("success"), padding: "7px 16px", fontSize: 13 }}>✓ Confirm</button>}
            {confirmDeleteId === r.id
              ? <>
                <span style={{ fontSize: 12, color: P.red }}>Delete?</span>
                <button onClick={() => deleteRecord(r.id)} style={{ ...S.btn("danger"), padding: "5px 10px", fontSize: 12 }}>Yes</button>
                <button onClick={() => setConfirmDeleteId(null)} style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: 12 }}>No</button>
              </>
              : <button onClick={() => setConfirmDeleteId(r.id)} style={{ background: "none", border: `1px solid ${P.red}44`, borderRadius: 7, color: P.red, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>🗑</button>
            }
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "inbox", label: "📨 Inbox", badge: submitted.length },
    { id: "records", label: "📊 Records" },
  ];

  return (
    <div style={S.sec}>
      <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setConfirmDeleteId(null); }} style={{ ...S.btn(tab === t.id ? "primary" : "ghost"), padding: "8px 14px", fontSize: 13, position: "relative" }}>
            {t.label}
            {t.badge > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: P.red, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div>
          {submitted.length === 0 && <div style={{ ...S.card, textAlign: "center", padding: 40, color: P.muted }}><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>No pending submissions.</div>}
          {submitted.map(r => <RecordCard key={r.id} r={r} showConfirm={true} />)}
        </div>
      )}

      {tab === "records" && (
        <>
          <div style={{ ...S.row, marginBottom: 14 }}>
            <div style={S.col}><label style={S.lbl}>Year</label><select value={viewYear} onChange={e => setViewYear(Number(e.target.value))} style={S.inp}>{[2024,2025,2026].map(y => <option key={y}>{y}</option>)}</select></div>
            <div style={S.col}><label style={S.lbl}>Month</label><select value={viewMonth} onChange={e => setViewMonth(Number(e.target.value))} style={S.inp}>{months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></div>
            <div style={S.col}><label style={S.lbl}>Store</label><select value={filterStore} onChange={e => setFilterStore(e.target.value)} style={S.inp}><option value="all">All</option><option value="toyota">Toyota</option><option value="aws">AWS</option></select></div>
            <div style={S.col}><label style={S.lbl}>Status</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={S.inp}><option value="all">All</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="confirmed">Confirmed</option></select></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ ...S.card, flex: 1, minWidth: 90, textAlign: "center" }}><div style={{ color: P.muted, fontSize: 11, textTransform: "uppercase" }}>Days</div><div style={{ fontSize: 22, fontWeight: 700, color: P.accent }}>{records.length}</div></div>
            <div style={{ ...S.card, flex: 1, minWidth: 90, textAlign: "center" }}><div style={{ color: P.muted, fontSize: 11, textTransform: "uppercase" }}>Total</div><div style={{ fontSize: 22, fontWeight: 700, color: P.green }}>{currency(grandTotal)}</div></div>
            <div style={{ ...S.card, flex: 1, minWidth: 90, textAlign: "center" }}><div style={{ color: P.muted, fontSize: 11, textTransform: "uppercase" }}>Avg/Day</div><div style={{ fontSize: 22, fontWeight: 700, color: P.blue }}>{currency(records.length ? grandTotal / records.length : 0)}</div></div>
          </div>
          {records.length === 0 && <div style={{ ...S.card, textAlign: "center", padding: 40, color: P.muted }}>No records for {months[viewMonth - 1]} {viewYear}</div>}
          {records.map(r => <RecordCard key={r.id} r={r} showConfirm={false} />)}
          {records.length > 0 && <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}><button onClick={exportCSV} style={S.btn()}>⬇ Export CSV ({months[viewMonth - 1]} {viewYear})</button></div>}
        </>
      )}

    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const refreshPending = () => setPendingCount(db.getPendingCount());

  const roleConfig = {
    staff:  { label: "Main Store", color: P.green, icon: "🏠" },
    toyota: { label: "Toyota Sta Rosa", color: P.toyota, icon: "🏪" },
    aws:    { label: "AWS", color: P.aws, icon: "🏪" },
    admin:  { label: "Admin", color: P.accent, icon: "👩‍💼" },
  };

  if (!role) return <PinScreen onLogin={setRole} pendingCount={pendingCount} />;
  const cfg = roleConfig[role];

  return (
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{cfg.icon}</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: P.accent }}>🍞 Bread Sales</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {role === "admin" && pendingCount > 0 && <span style={{ background: P.red, color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{pendingCount} pending</span>}
          <span style={S.pill(cfg.color)}>{cfg.label}</span>
          <button onClick={() => setRole(null)} style={{ ...S.btn("ghost"), padding: "6px 10px", fontSize: 12 }}>Logout</button>
        </div>
      </div>
      {role === "staff" && <StaffView />}
      {(role === "toyota" || role === "aws") && <SellerView role={role} onRecordChange={refreshPending} />}
      {role === "admin" && <AdminView onRecordChange={refreshPending} />}
    </div>
  );
}
