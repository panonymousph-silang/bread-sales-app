import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tmgzdlwldsnibpuxhiht.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ3pkbHdsZHNuaWJwdXhoaWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNjU1NDIsImV4cCI6MjEwMTc0MTU0Mn0.pHo-t8k5mEYkzGhaUHh7bV28PIxetJJ3JmOVNlQIels";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PINS = { staff: "1111", toyota: "2222", aws: "3333", admin: "4444" };
const STORES = { toyota: "Toyota Sta Rosa", aws: "AWS" };

// ── Supabase helpers ──────────────────────────────────────────────────────────
const api = {
  getProducts: async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    return data || [];
  },
  updateProductPrice: async (id, price) => {
    await supabase.from("products").update({ price }).eq("id", id);
  },
  addProduct: async (name, price) => {
    const { data } = await supabase.from("products").insert({ name, price }).select().single();
    return data;
  },
  deleteProduct: async (id) => {
    await supabase.from("products").delete().eq("id", id);
  },
  addList: async (date, store, items) => {
    const { data } = await supabase.from("daily_lists").insert({ date, store, items }).select().single();
    return data;
  },
  getLists: async (store) => {
    // Use Philippines timezone (UTC+8)
    const now = new Date();
    const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const today = phTime.toISOString().split("T")[0];
    // Get today's lists that are NOT yet used (no sales record, even deleted ones)
    // We track used lists by checking the list's "used" flag
    const { data: lists } = await supabase.from("daily_lists").select("*")
      .eq("store", store).eq("date", today).eq("used", false)
      .order("created_at", { ascending: false });
    return lists || [];
  },
  addRecord: async (r) => {
    const { data, error } = await supabase.from("sales_records").insert({
      list_id: r.listId, store: r.store, date: r.date,
      items: r.items, online_payments: r.onlinePayments,
      starting_cash: r.startingCash, expenses: r.expenses, status: "draft",
      recorder_name: r.recorderName || null,
    }).select().single();
    if (error) { console.error("addRecord error:", error); throw error; }
    await supabase.from("daily_lists").update({ used: true }).eq("id", r.listId);
    return data;
  },
  updateRecord: async (id, patch) => {
    const mapped = {};
    if (patch.status !== undefined) mapped.status = patch.status;
    if (patch.submittedAt !== undefined) mapped.submitted_at = patch.submittedAt;
    if (patch.confirmedAt !== undefined) mapped.confirmed_at = patch.confirmedAt;
    await supabase.from("sales_records").update(mapped).eq("id", id);
  },
  autoSaveRecord: async (id, items, onlinePayments, startingCash, expenses, recorderName) => {
    const { error } = await supabase.from("sales_records").update({
      items, online_payments: onlinePayments,
      starting_cash: startingCash, expenses,
      recorder_name: recorderName || null,
    }).eq("id", id);
    if (error) console.error("autoSaveRecord error:", error);
    else console.log("autoSaveRecord OK:", id, "items:", items?.length, "cash:", startingCash);
  },

  deleteRecord: async (id) => {
    await supabase.from("sales_records").delete().eq("id", id);
  },
  getRecordsByStore: async (store) => {
    const { data } = await supabase.from("sales_records").select("*").eq("store", store).order("date", { ascending: false });
    return (data || []).map(mapRecord);
  },
  getRecordsByMonth: async (year, month) => {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-31`;
    const { data } = await supabase.from("sales_records").select("*").gte("date", start).lte("date", end).order("date");
    return (data || []).map(mapRecord);
  },
  getSubmitted: async () => {
    const { data } = await supabase.from("sales_records").select("*").eq("status", "submitted").order("submitted_at");
    return (data || []).map(mapRecord);
  },
  getTodayDraft: async (store) => {
    const phNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const today = phNow.toISOString().split("T")[0];
    const { data } = await supabase.from("sales_records")
      .select("*, daily_lists(*)")
      .eq("store", store)
      .eq("status", "draft")
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    // If draft has no valid list, still return it so user can submit
    return { ...mapRecord(data), list: data.daily_lists };
  },
  getPendingCount: async () => {
    const { count } = await supabase.from("sales_records").select("*", { count: "exact", head: true }).eq("status", "submitted");
    return count || 0;
  },
  // Staff
  getStaff: async (store) => {
    const { data } = await supabase.from("staff").select("*").eq("store", store).order("name");
    return data || [];
  },
  addStaff: async (name, store) => {
    const { data } = await supabase.from("staff").insert({ name, store }).select().single();
    return data;
  },
  deleteStaff: async (id) => {
    await supabase.from("staff").delete().eq("id", id);
  },
};

const mapRecord = (r) => ({
  ...r, listId: r.list_id, onlinePayments: r.online_payments || [],
  startingCash: r.starting_cash, submittedAt: r.submitted_at, confirmedAt: r.confirmed_at,
  recorderName: r.recorder_name,
});

// ── Calc helpers ──────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Manila"
  });
};
const currency = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
const calcLO = (item) => {
  // L/O = today's stock - full price sales - 5% sales - same-day 50% sales (day-off mode only)
  return Math.max(0, (item.qty || 0) - (item.soldFull || 0) - (item.sold5 || 0) - (item.soldToday50 || 0));
};
const calcWaste = (item) => Math.max(0, (item.stock50 || 0) - (item.sold50 || 0));
// stock50 already = yesterday + today in day-off mode, so waste formula stays the same
const calcItemTotal = (item, isToyota) =>
  (item.soldFull || 0) * item.price +
  (isToyota ? (item.sold5 || 0) * item.price * 0.95 : 0) +
  (isToyota ? (item.sold50 || 0) * item.price * 0.50 : 0) +
  (isToyota ? (item.soldToday50 || 0) * item.price * 0.50 : 0);
const calcTotals = (record) => {
  const isToyota = record.store === "toyota";
  const totalSales = (record.items || []).reduce((s, i) => s + calcItemTotal(i, isToyota), 0);
  const onlineTotal = (record.onlinePayments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const endingCash = (record.startingCash || 0) + totalSales - (record.expenses || 0) - onlineTotal;
  return { totalSales, onlineTotal, endingCash };
};

// ── Styles ────────────────────────────────────────────────────────────────────
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

// ── Loading spinner ───────────────────────────────────────────────────────────
function Spinner() {
  return <div style={{ textAlign: "center", padding: 40, color: P.muted, fontSize: 14 }}>Loading...</div>;
}

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
            {r.role === "admin" && pendingCount > 0 && (
              <span style={{ background: P.red, color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Staff View ────────────────────────────────────────────────────────────────
function StaffView() {
  const [tab, setTab] = useState("create");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayStr());
  const [target, setTarget] = useState("toyota");
  const [items, setItems] = useState([]);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const prods = await api.getProducts();
    setProducts(prods);
    setItems(prods.map(p => ({ ...p, qty: 0, selected: false })));
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const toggle = (i) => setItems(prev => prev.map((x, j) => j === i ? { ...x, selected: !x.selected } : x));
  const setQty = (i, v) => setItems(prev => prev.map((x, j) => j === i ? { ...x, qty: Math.max(0, v) } : x));

  const handleSend = async () => {
    const sel = items.filter(x => x.selected && x.qty > 0);
    if (!sel.length) return;
    setSending(true);
    await api.addList(date, target, sel.map(({ name, price, qty }) => ({ name, price, qty })));
    setSending(false);
    setSent(true);
  };

  const savePrice = async (id) => {
    await api.updateProductPrice(id, Number(editPrice));
    setEditId(null);
    loadProducts();
  };

  const handleAddProduct = async () => {
    if (!newName || !newPrice) return;
    await api.addProduct(newName, Number(newPrice));
    setNewName(""); setNewPrice("");
    loadProducts();
  };

  const handleDeleteProduct = async (id) => {
    await api.deleteProduct(id);
    setConfirmDeleteId(null);
    loadProducts();
  };

  if (sent) return (
    <div style={{ ...S.sec, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: P.green }}>List Sent to {STORES[target]}!</div>
      <button style={{ ...S.btn(), marginTop: 24 }} onClick={() => { setSent(false); loadProducts(); }}>Create Another</button>
    </div>
  );

  return (
    <div style={S.sec}>
      <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Main Store</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["create","📋 Create List"],["manage","🏷️ Manage Products"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ ...S.btn(tab === id ? "primary" : "ghost"), padding: "8px 14px", fontSize: 13 }}>{label}</button>
        ))}
      </div>

      {tab === "create" && (
        loading ? <Spinner /> : <>
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
                  <tr key={item.id} style={{ background: item.selected ? "#2a2060" : "transparent" }}>
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
            <button onClick={handleSend} disabled={sending} style={{ ...S.btn(), opacity: sending ? 0.6 : 1 }}>
              {sending ? "Sending..." : `Send to ${STORES[target]} →`}
            </button>
          </div>
        </>
      )}

      {tab === "manage" && (
        loading ? <Spinner /> : <div>
          <p style={{ color: P.muted, fontSize: 13, marginTop: 0 }}>Add, remove, or update prices. Changes apply to future lists.</p>
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: P.accent }}>+ Add New Product</div>
            <div style={S.row}>
              <div style={{ flex: 2 }}><input placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)} style={S.inp} /></div>
              <div style={{ flex: 1 }}><input placeholder="Price" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={S.inp} /></div>
              <button onClick={handleAddProduct} style={S.btn()}>Add</button>
            </div>
          </div>
          {products.map((p) => (
            <div key={p.id} style={{ ...S.card, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{p.name}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {editId === p.id
                  ? <>
                    <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ ...S.inp, width: 80, padding: "5px 8px" }} autoFocus />
                    <button onClick={() => savePrice(p.id)} style={{ ...S.btn(), padding: "6px 12px", fontSize: 12 }}>Save</button>
                    <button onClick={() => setEditId(null)} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 12 }}>Cancel</button>
                  </>
                  : <button onClick={() => { setEditId(p.id); setEditPrice(p.price); }} style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 8, color: P.accent, padding: "5px 12px", cursor: "pointer", fontWeight: 700 }}>{currency(p.price)}</button>
                }
                {confirmDeleteId === p.id
                  ? <>
                    <span style={{ fontSize: 11, color: P.red }}>Delete?</span>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ ...S.btn("danger"), padding: "5px 10px", fontSize: 11 }}>Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: 11 }}>No</button>
                  </>
                  : <button onClick={() => setConfirmDeleteId(p.id)} style={{ background: "none", border: `1px solid ${P.red}44`, borderRadius: 7, color: P.red, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>🗑</button>
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

  const [view, setView] = useState("menu");
  const [selectedList, setSelectedList] = useState(null);
  const [step, setStep] = useState("selectList");
  const [items, setItems] = useState([]);
  const [allProds, setAllProds] = useState([]);
  const [stock50Items, setStock50Items] = useState([]);
  const [payments, setPayments] = useState([{ ref: "", amount: "" }]);
  const [startingCash, setStartingCash] = useState("");
  const [expenses, setExpenses] = useState("");
  const [draftId, setDraftId] = useState(null);
  const [dayOffMode, setDayOffMode] = useState(false); // tomorrow is a day off
  const [savedTotals, setSavedTotals] = useState({ totalSales: 0, onlineTotal: 0, endingCash: 0 });
  const [submitDone, setSubmitDone] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [myLists, setMyLists] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [recorderName, setRecorderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const autoSaveTimer = { current: null };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [lists, records, prods, staff] = await Promise.all([
      api.getLists(role), api.getRecordsByStore(role), api.getProducts(), api.getStaff(role)
    ]);
    setMyLists(lists);
    setMyRecords(records);
    setAllProds(prods);
    setStaffList(staff);
    setStock50Items(prods.map(p => ({ ...p, stock50: 0 })));
    setLoading(false);
  }, [role]);

  useEffect(() => {
    loadData();
    // Check for today's draft to resume
    api.getTodayDraft(role).then(draft => {
      if (!draft) return;
      // Load draft data even if list is missing
      if (draft.list) setSelectedList(draft.list);
      setItems(draft.items || []);
      setPayments(draft.onlinePayments?.length ? draft.onlinePayments : [{ ref: "", amount: "" }]);
      setStartingCash(String(draft.startingCash || ""));
      setExpenses(String(draft.expenses || ""));
      setRecorderName(draft.recorderName || "");
      setDraftId(draft.id);
      // Don't auto-navigate - just set draftId so "Resume" button appears in menu
    }).catch(() => {});
  }, [loadData, role]);

  // Save on demand only
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [saveError, setSaveError] = useState("");

  const resetAll = () => {
    setView("menu"); setSelectedList(null); setStep("selectList");
    setItems([]); setPayments([{ ref: "", amount: "" }]);
    setStartingCash(""); setExpenses("");
    setDraftId(null); setSubmitDone(false); setConfirmDeleteId(null);
    setAutoSaveStatus(""); setRecorderName(""); setDayOffMode(false); setHasUserEdited(false);
    setStock50Items(allProds.map(p => ({ ...p, stock50: 0 })));
    loadData();
  };

  const selectList = async (list) => {
    setSelectedList(list);
    if (isToyota) {
      setStep("stock50");
    } else {
      const initItems = list.items.map(i => ({ ...i, soldFull: 0 }));
      setItems(initItems);
      // Create draft record immediately
      try {
        const rec = await api.addRecord({
          listId: list.id, store: role, date: list.date,
          items: initItems, onlinePayments: [],
          startingCash: 0, expenses: 0,
        });
        setDraftId(rec.id);
      } catch(e) { console.error("Draft create error:", e); }
      setStep("sales");
    }
  };

  const goToSalesFromStock50 = async () => {
    const merged = selectedList.items.map(i => ({
      ...i, soldFull: 0, sold5: 0, sold50: 0, soldToday50: 0,
      stock50: stock50Items.find(s => s.name === i.name)?.stock50 || 0,
      dayOff: dayOffMode,
    }));
    stock50Items.forEach(s => {
      if (s.stock50 > 0 && !merged.find(m => m.name === s.name)) {
        merged.push({ name: s.name, price: s.price, qty: 0, soldFull: 0, sold5: 0, sold50: 0, soldToday50: 0, stock50: s.stock50, dayOff: dayOffMode });
      }
    });
    setItems(merged);
    try {
      const rec = await api.addRecord({
        listId: selectedList.id, store: role, date: selectedList.date,
        items: merged, onlinePayments: [],
        startingCash: 0, expenses: 0,
      });
      setDraftId(rec.id);
    } catch(e) { console.error("Draft create error:", e); }
    setStep("sales");
  };

  const updateItem = (i, field, val) => {
    setHasUserEdited(true);
    setItems(prev => prev.map((x, j) => j === i ? { ...x, [field]: Math.max(0, val) } : x));
  };
  const updateSoldToday50 = (i, val) => {
    setHasUserEdited(true);
    setItems(prev => prev.map((x, j) => j === i ? { ...x, soldToday50: Math.max(0, val) } : x));
  };
  const updateStock50 = (i, val) =>
    setStock50Items(prev => prev.map((x, j) => j === i ? { ...x, stock50: Math.max(0, val) } : x));
  const addPayment = () => setPayments(p => [...p, { ref: "", amount: "" }]);
  const updPayment = (i, f, v) => { setHasUserEdited(true); setPayments(p => p.map((x, j) => j === i ? { ...x, [f]: v } : x)); };
  const removePayment = (i) => setPayments(p => p.filter((_, j) => j !== i));

  const handleSave = async () => {
    if (!selectedList) return;
    setSaving(true);
    const snapItems = [...items];
    const snapPayments = [...payments];
    const snapCash = startingCash;
    const snapExpenses = expenses;
    const snapName = recorderName;
    const currentTotals = calcTotals({
      store: role, items: snapItems, onlinePayments: snapPayments,
      startingCash: Number(snapCash) || 0,
      expenses: Number(snapExpenses) || 0,
    });
    if (draftId) {
      // Update existing draft
      await supabase.from("sales_records").update({
        items: snapItems,
        online_payments: snapPayments.filter(p => p.ref || p.amount),
        starting_cash: Number(snapCash) || 0,
        expenses: Number(snapExpenses) || 0,
        recorder_name: snapName || null,
      }).eq("id", draftId);
    }
    setSavedTotals(currentTotals);
    setSaving(false);
    onRecordChange();
    loadData();
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError("");
    const snapItems = [...items];
    const snapPayments = [...payments];
    const snapCash = startingCash;
    const snapExpenses = expenses;
    const snapName = recorderName;
    const phNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const phIso = phNow.toISOString().replace("Z", "+08:00");
    const snapDate = selectedList?.date || phNow.toISOString().split("T")[0];
    const snapListId = selectedList?.id || null;
    const snapDraftId = draftId;

    try {
      if (snapDraftId) {
        const { error } = await supabase.from("sales_records").update({
          items: snapItems,
          online_payments: snapPayments.filter(p => p.ref || p.amount),
          starting_cash: Number(snapCash) || 0,
          expenses: Number(snapExpenses) || 0,
          recorder_name: snapName || null,
          status: "submitted",
          submitted_at: phIso,
        }).eq("id", snapDraftId);
        if (error) throw error;
      } else {
        if (!snapListId) throw new Error("No list selected. Please go back and select a list.");
        const { error } = await supabase.from("sales_records").insert({
          list_id: snapListId,
          store: role,
          date: snapDate,
          items: snapItems,
          online_payments: snapPayments.filter(p => p.ref || p.amount),
          starting_cash: Number(snapCash) || 0,
          expenses: Number(snapExpenses) || 0,
          recorder_name: snapName || null,
          status: "submitted",
          submitted_at: phIso,
        });
        if (error) throw error;
      }
      setDraftId(null);
      setSubmitDone(true);
      onRecordChange();
      loadData();
    } catch (err) {
      setSaveError("Submit failed: " + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    await api.deleteRecord(id);
    setConfirmDeleteId(null);
    onRecordChange();
    loadData();
  };

  const totals = items.length
    ? calcTotals({ store: role, items, onlinePayments: payments, startingCash: Number(startingCash) || 0, expenses: Number(expenses) || 0 })
    : { totalSales: 0, onlineTotal: 0, endingCash: 0 };

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

  if (view === "history") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => { setView("menu"); setConfirmDeleteId(null); loadData(); }} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>My Records</h2>
      </div>
      {loading ? <Spinner /> : myRecords.length === 0
        ? <div style={{ ...S.card, textAlign: "center", padding: 40, color: P.muted }}>No records yet.</div>
        : myRecords.map(r => {
          const t = calcTotals(r);
          const canDelete = r.status === "draft" || r.status === "confirmed";
          return (
            <div key={r.id} style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{fmtDate(r.date)}</span>
                <StatusBadge status={r.status} />
              </div>
              {r.recorderName && <div style={{ fontSize: 12, color: P.muted, marginBottom: 2 }}>👤 {r.recorderName}</div>}
              <div style={{ fontSize: 13, color: P.muted }}>Total Sales: <span style={{ color: P.green, fontWeight: 600 }}>{currency(t.totalSales)}</span></div>
              <div style={{ fontSize: 13, color: P.muted }}>Ending Cash: <span style={{ color: P.accent, fontWeight: 600 }}>{currency(t.endingCash)}</span></div>
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
        })
      }
    </div>
  );

  if (submitDone) return (
    <div style={{ ...S.sec, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📨</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: P.orange }}>Submitted to Admin!</div>
      <div style={{ color: P.muted, marginTop: 8, fontSize: 13 }}>The admin will review and confirm your record.</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <button style={S.btn("ghost")} onClick={() => { setView("history"); setSubmitDone(false); loadData(); }}>View My Records</button>
        <button style={S.btn()} onClick={resetAll}>Done</button>
      </div>
    </div>
  );



  if (view === "entry" && step === "selectList") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setView("menu")} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Select Today's List</h2>
      </div>
      {loading ? <Spinner /> : myLists.length === 0
        ? <div style={{ ...S.card, textAlign: "center", padding: 32, color: P.muted }}>No lists available. Ask main store staff to prepare one.</div>
        : myLists.map(l => (
          <div key={l.id} onClick={() => selectList(l)} style={{ ...S.card, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700 }}>{fmtDate(l.date)}</div><div style={{ fontSize: 12, color: P.muted }}>{l.items.length} items · {l.items.reduce((s, i) => s + i.qty, 0)} pcs</div></div>
            <span style={{ color: P.accent, fontSize: 20 }}>→</span>
          </div>
        ))
      }
    </div>
  );

  if (view === "entry" && step === "stock50") return (
    <div style={S.sec}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button onClick={() => setStep("selectList")} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 13 }}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>50% off Stock Entry</h2>
        <span style={S.pill(P.red)}>STEP 1</span>
      </div>

      {/* Day-off toggle */}
      <div style={{ ...S.card, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>🗓 Tomorrow is a day off</div>
        </div>
        <div onClick={() => setDayOffMode(m => !m)}
          style={{ width: 48, height: 26, borderRadius: 13, background: dayOffMode ? P.accent : P.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dayOffMode ? 25 : 3, transition: "left 0.2s" }} />
        </div>
      </div>

      <p style={{ color: P.muted, fontSize: 13, marginTop: 0, marginBottom: 14 }}>
        Enter yesterday's leftovers as today's 50% off stock.
      </p>
      <div style={S.tw}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ ...S.th, textAlign: "left" }}>Item</th>
            <th style={S.th}>Today's Stock</th>
            <th style={{ ...S.th, color: P.red }}>50% Stock (L/O)</th>
          </tr></thead>
          <tbody>
            {allProds.map((prod, i) => {
              const inList = selectedList?.items.find(x => x.name === prod.name);
              const todayQty = inList ? inList.qty : 0;
              // In day-off mode: max = no limit (yesterday's L/O + today's full stock)
              // In normal mode: max = no strict limit (yesterday's L/O, unknown)
              return (
                <tr key={prod.id} style={{ background: stock50Items[i]?.stock50 > 0 ? "#2a1520" : "transparent" }}>
                  <td style={{ ...S.td, textAlign: "left", fontSize: 12 }}>{prod.name}</td>
                  <td style={{ ...S.td, color: P.muted }}>{todayQty > 0 ? todayQty : "—"}</td>
                  <td style={S.td}>
                    <Stepper value={stock50Items[i]?.stock50 || 0} onChange={v => updateStock50(i, v)} color={P.red} />
                  </td>
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

  const dayOff = items.length > 0 && items[0].dayOff;
  const cols = isToyota
    ? dayOff
      ? ["Item","Price","Stock","Full Price","5% off","Today 50%","50% Stock","50% Sales","L/O","Waste","Total"]
      : ["Item","Price","Stock","Full Price","5% off","50% Stock","50% Sales","L/O","Waste","Total"]
    : ["Item","Price","Stock","Full Price","L/O","Total"];
  const colColor = (h) => h==="L/O"?P.muted:h==="Waste"?P.red:h==="50% Sales"?P.red:h==="5% off"?P.purple:h==="Today 50%"?"#fb923c":h==="Total"?P.green:P.muted;

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
          <thead><tr>{cols.map((h, i) => <th key={i} style={{ ...S.th, textAlign: i===0?"left":"center", color: colColor(h), ...(i===0?{position:"sticky",left:0,zIndex:2,background:P.surface}:{}) }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((item, i) => {
              const lo = calcLO(item), waste = calcWaste(item), total = calcItemTotal(item, isToyota);
              return (
                <tr key={i}>
                  <td style={{ ...S.td, textAlign: "left", fontWeight: 500, fontSize: 12, position: "sticky", left: 0, background: P.card, zIndex: 1, minWidth: 90 }}>{item.name}</td>
                  <td style={{ ...S.td, color: P.muted, fontSize: 12 }}>{currency(item.price)}</td>
                  <td style={{ ...S.td, color: P.muted }}>{item.qty}{isToyota && item.stock50 > 0 && <span style={{ color: P.red, fontSize: 10 }}> +{item.stock50}</span>}</td>
                  <td style={S.td}><Stepper value={item.soldFull||0} onChange={v=>updateItem(i,"soldFull",v)} color={P.accent}/></td>
                  {isToyota&&<td style={S.td}><Stepper value={item.sold5||0} onChange={v=>updateItem(i,"sold5",v)} color={P.purple}/></td>}
                  {isToyota&&dayOff&&<td style={S.td}><Stepper value={item.soldToday50||0} onChange={v=>updateSoldToday50(i,v)} color={P.orange}/></td>}
                  {isToyota&&<td style={{...S.td,color:P.red}}>{item.stock50||0}</td>}
                  {isToyota&&<td style={S.td}><Stepper value={item.sold50||0} onChange={v=>updateItem(i,"sold50",Math.min(item.stock50||0,v))} color={P.red}/></td>}
                  <td style={{...S.td,color:lo>0?P.orange:P.muted,fontWeight:600}}>{lo}</td>
                  {isToyota&&<td style={{...S.td,color:waste>0?P.red:P.muted,fontWeight:600}}>{waste}</td>}
                  <td style={{...S.td,color:P.green,fontWeight:700}}>{currency(total)}</td>
                </tr>
              );
            })}
            <tr style={{ background: P.surface, fontWeight: 700 }}>
              <td colSpan={isToyota?(dayOff?10:9):5} style={{...S.td,textAlign:"right",color:P.muted}}>Total Sales</td>
              <td style={{...S.td,color:P.green}}>{currency(totals.totalSales)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Recorder name */}
      <div style={{ ...S.card, margin: "14px 0 10px" }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: P.accent }}>👤 Recorder</div>
        <select value={recorderName} onChange={e => setRecorderName(e.target.value)} style={S.inp}>
          <option value="">-- Select your name --</option>
          {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      <div style={{ ...S.card, margin: "14px 0" }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: P.accent }}>💰 Cash Summary</div>
        <div style={S.row}>
          <div style={S.col}><label style={S.lbl}>Starting Cash</label><input type="number" value={startingCash} onChange={e=>{setHasUserEdited(true);setStartingCash(e.target.value)}} style={S.inp} placeholder="0"/></div>
          <div style={S.col}><label style={S.lbl}>Expenses</label><input type="number" value={expenses} onChange={e=>{setHasUserEdited(true);setExpenses(e.target.value)}} style={S.inp} placeholder="0"/></div>
        </div>
        <div style={S.sb}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}><span style={{color:P.muted}}>Total Sales</span><span style={{color:P.green,fontWeight:600}}>{currency(totals.totalSales)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}><span style={{color:P.muted}}>Online Payment</span><span style={{color:P.blue}}>{currency(totals.onlineTotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}><span style={{color:P.muted}}>Expenses</span><span style={{color:P.red}}>−{currency(expenses)}</span></div>
          <div style={{borderTop:`1px solid ${P.border}`,marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700}}><span>Ending Cash</span><span style={{color:P.accent}}>{currency(totals.endingCash)}</span></div>
        </div>
      </div>
      <div style={{ ...S.card, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: P.accent }}>📱 Online Payments (Gcash / BPI)</div>
        {payments.map((p, i) => (
          <div key={i} style={{ ...S.row, marginBottom: 8 }}>
            <div style={{flex:2}}><input placeholder="Ref No." value={p.ref} onChange={e=>updPayment(i,"ref",e.target.value)} style={S.inp}/></div>
            <div style={{flex:1}}><input placeholder="Amount" type="number" value={p.amount} onChange={e=>updPayment(i,"amount",e.target.value)} style={S.inp}/></div>
            {payments.length>1&&<button onClick={()=>removePayment(i)} style={{...S.btn("danger"),padding:"9px 12px"}}>✕</button>}
          </div>
        ))}
        <button onClick={addPayment} style={{...S.btn("ghost"),fontSize:13}}>+ Add Payment</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Save status */}
        <div style={{ textAlign: "right", fontSize: 11, minHeight: 16 }}>
          {saveError && <div style={{ color: P.red, marginBottom: 6 }}>{saveError}</div>}
          {!saveError && draftId && <span style={{ color: P.muted }}>{`💡 Ready to submit · Total: ${currency(totals.totalSales)}`}</span>}
          {!saveError && !draftId && <span style={{ color: P.orange }}>⚠️ No draft — go back and select a list</span>}
        </div>
        {/* Submit to Admin button (shown when draft exists) */}
        {draftId && (
          <div style={{ ...S.card, borderColor: P.orange + "44" }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: P.orange, fontSize: 13 }}>📨 Done for the day?</div>
            <div style={{ fontSize: 12, color: P.muted, marginBottom: 10 }}>Save your final record and submit to admin for review.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} disabled={saving} style={{ ...S.btn("ghost"), flex: 1, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "💾 Save Only"}
              </button>
              <button onClick={handleSubmit} disabled={saving} style={{ ...S.btn(), flex: 2, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Submit to Admin →"}
              </button>
            </div>
          </div>
        )}
        {!draftId && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSave} disabled={saving} style={{ ...S.btn(), opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Save Record ✓"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin View ────────────────────────────────────────────────────────────────
function AdminView({ onRecordChange }) {
  const phNowInit = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [tab, setTab] = useState("inbox");
  const [viewYear, setViewYear] = useState(phNowInit.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(phNowInit.getUTCMonth()+1);
  const [filterStore, setFilterStore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitted, setSubmitted] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  // Staff management
  const [allStaff, setAllStaff] = useState([]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffStore, setNewStaffStore] = useState("toyota");
  const [confirmDeleteStaffId, setConfirmDeleteStaffId] = useState(null);

  const loadStaff = useCallback(async () => {
    const [t, a] = await Promise.all([api.getStaff("toyota"), api.getStaff("aws")]);
    setAllStaff([...t, ...a]);
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) return;
    await api.addStaff(newStaffName.trim(), newStaffStore);
    setNewStaffName("");
    loadStaff();
  };

  const handleDeleteStaff = async (id) => {
    await api.deleteStaff(id);
    setConfirmDeleteStaffId(null);
    loadStaff();
  };

  const loadInbox = useCallback(async () => {
    setLoading(true);
    const data = await api.getSubmitted();
    setSubmitted(data);
    setLoading(false);
  }, []);

  const loadRecords = useCallback(async (y, m) => {
    setLoading(true);
    const data = await api.getRecordsByMonth(y || viewYear, m || viewMonth);
    setRecords(data);
    setLoading(false);
  }, [viewYear, viewMonth]);

  useEffect(() => { loadInbox(); }, [loadInbox]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const filteredRecords = records.filter(r =>
    (filterStore === "all" || r.store === filterStore) &&
    (filterStatus === "all" || r.status === filterStatus)
  ).sort((a, b) => a.date.localeCompare(b.date));

  const grandTotal = filteredRecords.reduce((s, r) => s + calcTotals(r).totalSales, 0);

  const confirmRecord = async (id) => {
    const phNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const phIso = phNow.toISOString().replace("Z", "+08:00");
    await api.updateRecord(id, { status: "confirmed", confirmedAt: phIso });
    onRecordChange();
    loadInbox();
  };

  const deleteRecord = async (id) => {
    await api.deleteRecord(id);
    setConfirmDeleteId(null);
    onRecordChange();
    if (tab === "inbox") loadInbox(); else loadRecords();
  };

  const exportCSV = () => {
    const rows = [["Date","Store","Item","Stock","Full Price Sales","5% Sales","50% Stock","50% Sales","L/O","Waste","Total","Status"]];
    filteredRecords.forEach(r => {
      const isToyota = r.store === "toyota";
      r.items.forEach(item => rows.push([r.date,STORES[r.store],item.name,item.qty,item.soldFull,isToyota?item.sold5:"",isToyota?item.stock50:"",isToyota?item.sold50:"",calcLO(item),isToyota?calcWaste(item):"",calcItemTotal(item,isToyota).toFixed(2),r.status]));
      rows.push([r.date,STORES[r.store],"--- TOTAL ---","","","","","","","",calcTotals(r).totalSales.toFixed(2),r.status]);
      rows.push([]);
    });
    const csv = rows.map(r=>r.join(",")).join("\n");
    const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = `sales_${viewYear}_${String(viewMonth).padStart(2,"0")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const RecordCard = ({ r, showConfirm }) => {
    const isToyota = r.store === "toyota";
    const t = calcTotals(r);
    return (
      <div style={{ ...S.card, marginBottom: 12, borderColor: showConfirm ? P.orange+"55" : P.border }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700 }}>{fmtDate(r.date)}</span>
            <span style={S.pill(r.store==="toyota"?P.toyota:P.aws)}>{STORES[r.store]}</span>
            <StatusBadge status={r.status}/>
          </div>
          <span style={{ color: P.green, fontWeight: 700 }}>{currency(t.totalSales)}</span>
        </div>
        {r.recorderName&&<div style={{fontSize:12,color:P.muted,marginBottom:4}}>👤 {r.recorderName}</div>}
        {r.submittedAt&&<div style={{fontSize:11,color:P.muted,marginBottom:6}}>Submitted: {fmtTime(r.submittedAt)}</div>}
        {r.confirmedAt&&<div style={{fontSize:11,color:P.green,marginBottom:6}}>✓ Confirmed {fmtTime(r.confirmedAt)}</div>}
        <div style={S.tw}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{...S.th,textAlign:"left"}}>Item</th>
              <th style={S.th}>Stock</th><th style={S.th}>Full</th>
              {isToyota&&<th style={{...S.th,color:P.purple}}>5%</th>}
              {isToyota&&<th style={{...S.th,color:P.red}}>50%Stk</th>}
              {isToyota&&<th style={{...S.th,color:P.red}}>50%Sls</th>}
              <th style={{...S.th,color:P.orange}}>L/O</th>
              {isToyota&&<th style={{...S.th,color:P.red}}>Waste</th>}
              <th style={{...S.th,color:P.green}}>Total</th>
            </tr></thead>
            <tbody>
              {r.items.map((item,i)=>{
                const lo=calcLO(item),waste=calcWaste(item),total=calcItemTotal(item,isToyota);
                return (
                  <tr key={i}>
                    <td style={{...S.td,textAlign:"left",fontSize:11}}>{item.name}</td>
                    <td style={S.td}>{item.qty}</td>
                    <td style={S.td}>{item.soldFull}</td>
                    {isToyota&&<td style={{...S.td,color:P.purple}}>{item.sold5||"-"}</td>}
                    {isToyota&&<td style={{...S.td,color:P.red}}>{item.stock50||"-"}</td>}
                    {isToyota&&<td style={{...S.td,color:P.red}}>{item.sold50||"-"}</td>}
                    <td style={{...S.td,color:lo>0?P.orange:P.muted,fontWeight:600}}>{lo}</td>
                    {isToyota&&<td style={{...S.td,color:waste>0?P.red:P.muted,fontWeight:600}}>{waste}</td>}
                    <td style={{...S.td,color:P.green,fontWeight:700}}>{currency(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12, color: P.muted }}>Start: {currency(r.startingCash)} | End: <span style={{color: P.accent, fontWeight: 600}}>{currency(t.endingCash)}</span> | Online: {currency(t.onlineTotal)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {showConfirm && <button onClick={()=>confirmRecord(r.id)} style={{...S.btn("success"),padding:"7px 16px",fontSize:13}}>✓ Confirm</button>}
            {confirmDeleteId===r.id
              ? <>
                  <span style={{fontSize:12,color:P.red}}>Delete?</span>
                  <button onClick={()=>deleteRecord(r.id)} style={{...S.btn("danger"),padding:"5px 10px",fontSize:12}}>Yes</button>
                  <button onClick={()=>setConfirmDeleteId(null)} style={{...S.btn("ghost"),padding:"5px 10px",fontSize:12}}>No</button>
                </>
              : <button onClick={()=>setConfirmDeleteId(r.id)} style={{background:"none",border:`1px solid ${P.red}44`,borderRadius:7,color:P.red,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>🗑</button>
            }
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "inbox", label: "📨 Inbox", badge: submitted.length },
    { id: "records", label: "📊 Records" },
    { id: "staff", label: "👥 Staff" },
  ];

  return (
    <div style={S.sec}>
      <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setConfirmDeleteId(null); }} style={{ ...S.btn(tab===t.id?"primary":"ghost"), padding: "8px 14px", fontSize: 13, position: "relative" }}>
            {t.label}
            {t.badge>0&&<span style={{position:"absolute",top:-6,right:-6,background:P.red,color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab==="inbox"&&(
        loading ? <Spinner /> : submitted.length===0
          ? <div style={{...S.card,textAlign:"center",padding:40,color:P.muted}}><div style={{fontSize:32,marginBottom:8}}>📭</div>No pending submissions.</div>
          : submitted.map(r=><RecordCard key={r.id} r={r} showConfirm={true}/>)
      )}

      {tab==="records"&&(
        <>
          <div style={{...S.row,marginBottom:14}}>
            <div style={S.col}><label style={S.lbl}>Year</label><select value={viewYear} onChange={e=>{const y=Number(e.target.value); setViewYear(y); loadRecords(y, viewMonth);}} style={S.inp}>{[2024,2025,2026].map(y=><option key={y}>{y}</option>)}</select></div>
            <div style={S.col}><label style={S.lbl}>Month</label><select value={viewMonth} onChange={e=>{const m=Number(e.target.value); setViewMonth(m); loadRecords(viewYear, m);}} style={S.inp}>{months.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
            <div style={S.col}><label style={S.lbl}>Store</label><select value={filterStore} onChange={e=>setFilterStore(e.target.value)} style={S.inp}><option value="all">All</option><option value="toyota">Toyota</option><option value="aws">AWS</option></select></div>
            <div style={S.col}><label style={S.lbl}>Status</label><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={S.inp}><option value="all">All</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="confirmed">Confirmed</option></select></div>
          </div>
          <button onClick={loadRecords} style={{...S.btn("ghost"),marginBottom:14,fontSize:13}}>🔄 Refresh</button>
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
            <div style={{...S.card,flex:1,minWidth:90,textAlign:"center"}}><div style={{color:P.muted,fontSize:11,textTransform:"uppercase"}}>Days</div><div style={{fontSize:22,fontWeight:700,color:P.accent}}>{filteredRecords.length}</div></div>
            <div style={{...S.card,flex:1,minWidth:90,textAlign:"center"}}><div style={{color:P.muted,fontSize:11,textTransform:"uppercase"}}>Total</div><div style={{fontSize:22,fontWeight:700,color:P.green}}>{currency(grandTotal)}</div></div>
            <div style={{...S.card,flex:1,minWidth:90,textAlign:"center"}}><div style={{color:P.muted,fontSize:11,textTransform:"uppercase"}}>Avg/Day</div><div style={{fontSize:22,fontWeight:700,color:P.blue}}>{currency(filteredRecords.length?grandTotal/filteredRecords.length:0)}</div></div>
          </div>
          {loading ? <Spinner /> : filteredRecords.length===0
            ? <div style={{...S.card,textAlign:"center",padding:40,color:P.muted}}>No records for {months[viewMonth-1]} {viewYear}</div>
            : filteredRecords.map(r=><RecordCard key={r.id} r={r} showConfirm={false}/>)
          }
          {filteredRecords.length>0&&<div style={{marginTop:14,display:"flex",justifyContent:"flex-end"}}><button onClick={exportCSV} style={S.btn()}>⬇ Export CSV ({months[viewMonth-1]} {viewYear})</button></div>}
        </>
      )}
      {tab === "staff" && (
        <div>
          <p style={{ color: P.muted, fontSize: 13, marginTop: 0 }}>Manage staff for each store. Changes apply to the recorder dropdown immediately.</p>
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: P.accent }}>+ Add New Staff</div>
            <div style={S.row}>
              <div style={{ flex: 2 }}><input placeholder="Name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} style={S.inp} /></div>
              <div style={{ flex: 1 }}>
                <select value={newStaffStore} onChange={e => setNewStaffStore(e.target.value)} style={S.inp}>
                  <option value="toyota">Toyota</option>
                  <option value="aws">AWS</option>
                </select>
              </div>
              <button onClick={handleAddStaff} style={S.btn()}>Add</button>
            </div>
          </div>
          {["toyota","aws"].map(store => (
            <div key={store} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: store === "toyota" ? P.toyota : P.aws, fontSize: 14 }}>
                {STORES[store]}
              </div>
              {allStaff.filter(s => s.store === store).map(s => (
                <div key={s.id} style={{ ...S.card, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                  {confirmDeleteStaffId === s.id
                    ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: P.red }}>Remove?</span>
                        <button onClick={() => handleDeleteStaff(s.id)} style={{ ...S.btn("danger"), padding: "5px 10px", fontSize: 12 }}>Yes</button>
                        <button onClick={() => setConfirmDeleteStaffId(null)} style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: 12 }}>No</button>
                      </div>
                    : <button onClick={() => setConfirmDeleteStaffId(s.id)} style={{ background: "none", border: `1px solid ${P.red}44`, borderRadius: 7, color: P.red, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>🗑 Remove</button>
                  }
                </div>
              ))}
              {allStaff.filter(s => s.store === store).length === 0 && (
                <div style={{ color: P.muted, fontSize: 13, padding: "10px 0" }}>No staff added yet.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    const count = await api.getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => { refreshPending(); }, [refreshPending]);

  const roleConfig = {
    staff:  { label: "Main Store",      color: P.green,  icon: "🏠" },
    toyota: { label: "Toyota Sta Rosa", color: P.toyota, icon: "🏪" },
    aws:    { label: "AWS",             color: P.aws,    icon: "🏪" },
    admin:  { label: "Admin",           color: P.accent, icon: "👩‍💼" },
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
          {role === "admin" && pendingCount > 0 && (
            <span style={{ background: P.red, color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{pendingCount} pending</span>
          )}
          <span style={S.pill(cfg.color)}>{cfg.label}</span>
          <button onClick={() => setRole(null)} style={{ ...S.btn("ghost"), padding: "6px 10px", fontSize: 12 }}>Logout</button>
        </div>
      </div>
      {role === "staff"  && <StaffView />}
      {(role === "toyota" || role === "aws") && <SellerView role={role} onRecordChange={refreshPending} />}
      {role === "admin"  && <AdminView onRecordChange={refreshPending} />}
    </div>
  );
}
