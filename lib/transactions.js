const STORAGE_KEY = "ledger_transactions";

export function getTransactions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
}

export function computeBalance(transactions) {
  return transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
}

export function formatCurrency(amount) {
  const hasDecimal = Math.abs(amount % 1) > 0.001;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function getMonthlyTotals(transactions, month, year) {
  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();

  const inMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  const income = inMonth.reduce(
    (sum, t) => (t.type === "income" ? sum + t.amount : sum),
    0
  );
  const expense = inMonth.reduce(
    (sum, t) => (t.type === "expense" ? sum + t.amount : sum),
    0
  );

  const label = new Date(targetYear, targetMonth, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return { income, expense, label, month: targetMonth, year: targetYear };
}

export const CHART_COLORS = ["#AC4B36", "#B8863B", "#5C7A5E", "#4A6FA5", "#7B6A8F"];
const OTHER_COLOR = "#9C9A8C";

export function getExpenseBreakdown(transactions, month, year) {
  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();

  const expenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === "expense" &&
      d.getMonth() === targetMonth &&
      d.getFullYear() === targetYear
    );
  });

  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  if (total === 0) return { total: 0, segments: [] };

  const grouped = {};
  expenses.forEach((t) => {
    const key = t.description.trim().toLowerCase();
    if (!grouped[key]) grouped[key] = { label: t.description.trim(), amount: 0 };
    grouped[key].amount += t.amount;
  });

  const sorted = Object.values(grouped).sort((a, b) => b.amount - a.amount);

  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const restTotal = rest.reduce((sum, g) => sum + g.amount, 0);

  const segments = top.map((g, i) => ({
    label: g.label,
    amount: g.amount,
    percent: Math.round((g.amount / total) * 1000) / 10,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  if (restTotal > 0) {
    segments.push({
      label: "Other",
      amount: restTotal,
      percent: Math.round((restTotal / total) * 1000) / 10,
      color: OTHER_COLOR,
    });
  }

  return { total, segments };
}

export function getEarliestDate(transactions) {
  if (transactions.length === 0) return null;
  return transactions.reduce((min, t) => {
    const d = new Date(t.date);
    return !min || d < min ? d : min;
  }, null);
}
