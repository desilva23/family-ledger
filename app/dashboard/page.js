"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSession, endSession } from "../../lib/auth";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
  computeBalance,
  formatCurrency,
  formatDate,
  getMonthlyTotals,
} from "../../lib/transactions";
import ReportsView from "../../components/ReportsView";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState("overview");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("expense");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!hasSession()) {
      router.replace("/");
      return;
    }
    
    async function loadData() {
      const data = await getTransactions();
      setTransactions(data);
      setReady(true);
    }
    
    loadData();
  }, [router]);

  const balance = useMemo(() => computeBalance(transactions), [transactions]);
  const monthly = useMemo(() => getMonthlyTotals(transactions), [transactions]);
  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  async function handleAdd(e) {
    e.preventDefault();
    setFormError("");

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    if (!description.trim()) {
      setFormError("Add a short description for this entry.");
      return;
    }

    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: Math.round(parsedAmount * 100) / 100,
      description: description.trim(),
      type,
      date: new Date().toISOString(),
    };

    const next = [entry, ...transactions];
    setTransactions(next);
    setAmount("");
    setDescription("");
    
    await addTransaction(entry);
  }

  async function handleDelete(id) {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    if (editingId === id) setEditingId(null);
    await deleteTransaction(id);
  }

  function handleLogout() {
    endSession();
    router.push("/");
  }

  async function handleClearAll() {
    const confirmed = window.confirm("Delete all entries? This can't be undone.");
    if (!confirmed) return;
    setTransactions([]);
    setEditingId(null);
    await clearAllTransactions();
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditAmount(String(t.amount));
    setEditDescription(t.description);
    setEditType(t.type);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function saveEdit(id) {
    const parsedAmount = parseFloat(editAmount);
    if (!editAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setEditError("Enter an amount greater than zero.");
      return;
    }
    if (!editDescription.trim()) {
      setEditError("Add a short description for this entry.");
      return;
    }

    const updates = {
      amount: Math.round(parsedAmount * 100) / 100,
      description: editDescription.trim(),
      type: editType,
    };

    const next = transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTransactions(next);
    setEditingId(null);
    await updateTransaction(id, updates);
  }

  if (!ready) return null;

  const isNegative = balance < 0;

  return (
    <main className="min-h-screen px-5 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[480px] flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-ink font-display italic text-lg">
            <CoinIcon className="w-5 h-5 text-brass" />
            Family Ledger
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-ink-soft hover:text-brick-deep transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-paper-line/40 p-1 rounded-[12px]">
          <button
            onClick={() => setTab("overview")}
            aria-pressed={tab === "overview"}
            className={`rounded-[9px] py-2.5 font-semibold text-[15px] transition-colors ${
              tab === "overview" ? "bg-white text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab("reports")}
            aria-pressed={tab === "reports"}
            className={`rounded-[9px] py-2.5 font-semibold text-[15px] transition-colors ${
              tab === "reports" ? "bg-white text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            Reports
          </button>
        </div>

        {tab === "reports" ? (
          <ReportsView transactions={transactions} />
        ) : (
          <>
            {/* Balance card */}
            <div className="bg-white/70 border border-paper-line rounded-card shadow-card px-7 py-8 text-center">
              <p className="text-ink-soft text-sm font-semibold tracking-wide uppercase">
                Available to spend
              </p>
              <p
                className={`mt-2 font-display text-5xl leading-tight ${
                  isNegative ? "text-brick-deep" : "text-sage-deep"
                }`}
              >
                {formatCurrency(balance)}
              </p>
              {isNegative && (
                <p className="mt-2 text-brick-deep text-sm font-medium">
                  Spending has gone past what&apos;s come in.
                </p>
              )}
            </div>

            {/* Monthly totals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 border border-paper-line rounded-card px-5 py-4">
                <p className="text-ink-soft text-xs font-semibold tracking-wide uppercase">
                  {monthly.label} income
                </p>
                <p className="mt-1 font-display text-2xl text-sage-deep">
                  {formatCurrency(monthly.income)}
                </p>
              </div>
              <div className="bg-white/70 border border-paper-line rounded-card px-5 py-4">
                <p className="text-ink-soft text-xs font-semibold tracking-wide uppercase">
                  {monthly.label} spent
                </p>
                <p className="mt-1 font-display text-2xl text-brick-deep">
                  {formatCurrency(monthly.expense)}
                </p>
              </div>
            </div>

            {/* Add entry form */}
            <div className="bg-white/70 border border-paper-line rounded-card shadow-card px-6 py-6 sm:px-7 sm:py-7">
              <h2 className="font-display italic text-xl text-ink mb-4">Add an entry</h2>

              <form onSubmit={handleAdd} className="flex flex-col gap-4" noValidate>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Entry type">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    aria-pressed={type === "expense"}
                    className={`rounded-[10px] py-3 font-semibold text-[15px] border-2 transition-colors ${
                      type === "expense"
                        ? "bg-brick border-brick text-paper"
                        : "bg-white border-paper-line text-ink-soft"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    aria-pressed={type === "income"}
                    className={`rounded-[10px] py-3 font-semibold text-[15px] border-2 transition-colors ${
                      type === "income"
                        ? "bg-sage border-sage text-paper"
                        : "bg-white border-paper-line text-ink-soft"
                    }`}
                  >
                    Income
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="amount" className="text-sm font-semibold text-ink">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft text-[16px]">
                      &#8377;
                    </span>
                    <input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-[10px] border-2 border-paper-line bg-white pl-9 pr-4 py-3 text-[16px] text-ink focus:border-brass focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-semibold text-ink">
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Vegetables, electricity bill, gift from Priya..."
                    className="w-full rounded-[10px] border-2 border-paper-line bg-white px-4 py-3 text-[16px] text-ink placeholder:text-ink-soft/50 focus:border-brass focus:outline-none transition-colors"
                  />
                </div>

                {formError && (
                  <p className="text-brick-deep text-sm font-medium" aria-live="polite">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-1 rounded-[10px] bg-sage-deep text-paper font-semibold text-[16px] py-3.5 hover:bg-[#324a33] active:scale-[0.99] transition-all"
                >
                  Add entry
                </button>
              </form>
            </div>

            {/* Transaction list */}
            <div className="bg-white/70 border border-paper-line rounded-card shadow-card px-6 py-6 sm:px-7 sm:py-7">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display italic text-xl text-ink">Recent entries</h2>
                {sorted.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-ink-soft/70 hover:text-brick-deep transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {sorted.length === 0 ? (
                <p className="text-ink-soft text-[15px] text-center py-6">
                  No entries yet &mdash; add your first one above.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {sorted.map((t, i) => (
                    <li
                      key={t.id}
                      className={`py-3.5 ${
                        i !== sorted.length - 1 ? "border-b border-paper-line" : ""
                      }`}
                    >
                      {editingId === t.id ? (
                        <div className="flex flex-col gap-3 bg-paper/60 rounded-[12px] p-3.5">
                          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Entry type">
                            <button
                              type="button"
                              onClick={() => setEditType("expense")}
                              aria-pressed={editType === "expense"}
                              className={`rounded-[9px] py-2 font-semibold text-[13px] border-2 transition-colors ${
                                editType === "expense"
                                  ? "bg-brick border-brick text-paper"
                                  : "bg-white border-paper-line text-ink-soft"
                              }`}
                            >
                              Expense
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditType("income")}
                              aria-pressed={editType === "income"}
                              className={`rounded-[9px] py-2 font-semibold text-[13px] border-2 transition-colors ${
                                editType === "income"
                                  ? "bg-sage border-sage text-paper"
                                  : "bg-white border-paper-line text-ink-soft"
                              }`}
                            >
                              Income
                            </button>
                          </div>

                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft text-[14px]">
                              &#8377;
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              aria-label="Amount"
                              className="w-full rounded-[9px] border-2 border-paper-line bg-white pl-8 pr-3 py-2 text-[14px] text-ink focus:border-brass focus:outline-none transition-colors"
                            />
                          </div>

                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            aria-label="Description"
                            className="w-full rounded-[9px] border-2 border-paper-line bg-white px-3 py-2 text-[14px] text-ink focus:border-brass focus:outline-none transition-colors"
                          />

                          {editError && (
                            <p className="text-brick-deep text-xs font-medium">{editError}</p>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(t.id)}
                              className="flex-1 rounded-[9px] bg-sage-deep text-paper font-semibold text-[13px] py-2.5"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 rounded-[9px] border-2 border-paper-line text-ink-soft font-semibold text-[13px] py-2.5"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-ink font-medium text-[15px] truncate">
                              {t.description}
                            </p>
                            <p className="text-ink-soft text-xs mt-0.5">{formatDate(t.date)}</p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className={`font-semibold text-[15px] ${
                                t.type === "income" ? "text-sage-deep" : "text-brick-deep"
                              }`}
                            >
                              {t.type === "income" ? "+" : "\u2212"}
                              {formatCurrency(Math.abs(t.amount)).replace("-", "")}
                            </span>
                            <button
                              onClick={() => startEdit(t)}
                              aria-label={`Edit entry: ${t.description}`}
                              className="text-ink-soft/60 hover:text-brass transition-colors"
                            >
                              <PencilIcon className="w-[17px] h-[17px]" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              aria-label={`Delete entry: ${t.description}`}
                              className="text-ink-soft/60 hover:text-brick-deep transition-colors"
                            >
                              <TrashIcon className="w-[18px] h-[18px]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <p className="text-center text-ink-soft/70 text-xs">
          Entries are securely saved to the cloud and available across devices.
        </p>
      </div>
    </main>
  );
}

function CoinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 8v8M9.5 10c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 1.4-2.5 1.9-2.5.8-2.5 2 1.1 2.1 2.5 2.1 2.5-.9 2.5-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7h16M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14.5 5.5l4 4M6 20l.9-3.6a2 2 0 0 1 .53-.94l9.3-9.3a1.5 1.5 0 0 1 2.12 0l1.98 1.98a1.5 1.5 0 0 1 0 2.12l-9.3 9.3a2 2 0 0 1-.94.53L6 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
