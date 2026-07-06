"use client";

import { useMemo, useState } from "react";
import {
  formatCurrency,
  getMonthlyTotals,
  getExpenseBreakdown,
  getEarliestDate,
} from "../lib/transactions";

export default function ReportsView({ transactions }) {
  const now = new Date();
  const [cursor, setCursor] = useState({
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  const earliest = useMemo(() => getEarliestDate(transactions), [transactions]);

  const canGoBack = earliest
    ? cursor.year > earliest.getFullYear() ||
      (cursor.year === earliest.getFullYear() && cursor.month > earliest.getMonth())
    : false;

  const canGoForward =
    cursor.year < now.getFullYear() ||
    (cursor.year === now.getFullYear() && cursor.month < now.getMonth());

  function goPrev() {
    if (!canGoBack) return;
    setCursor((c) => {
      const month = c.month === 0 ? 11 : c.month - 1;
      const year = c.month === 0 ? c.year - 1 : c.year;
      return { month, year };
    });
  }

  function goNext() {
    if (!canGoForward) return;
    setCursor((c) => {
      const month = c.month === 11 ? 0 : c.month + 1;
      const year = c.month === 11 ? c.year + 1 : c.year;
      return { month, year };
    });
  }

  const totals = useMemo(
    () => getMonthlyTotals(transactions, cursor.month, cursor.year),
    [transactions, cursor]
  );
  const breakdown = useMemo(
    () => getExpenseBreakdown(transactions, cursor.month, cursor.year),
    [transactions, cursor]
  );

  let cumulative = 0;
  const gradientStops = breakdown.segments
    .map((seg) => {
      const start = cumulative;
      cumulative += seg.percent;
      return `${seg.color} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col gap-5">
      {/* Month navigator */}
      <div className="bg-white/70 border border-paper-line rounded-card px-5 py-3.5 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-soft disabled:opacity-30 hover:bg-paper-line/40 transition-colors"
        >
          <ChevronIcon direction="left" className="w-5 h-5" />
        </button>
        <p className="font-display italic text-lg text-ink">{totals.label}</p>
        <button
          onClick={goNext}
          disabled={!canGoForward}
          aria-label="Next month"
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-soft disabled:opacity-30 hover:bg-paper-line/40 transition-colors"
        >
          <ChevronIcon direction="right" className="w-5 h-5" />
        </button>
      </div>

      {/* Totals for the month */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 border border-paper-line rounded-card px-5 py-4">
          <p className="text-ink-soft text-xs font-semibold tracking-wide uppercase">
            Income
          </p>
          <p className="mt-1 font-display text-2xl text-sage-deep">
            {formatCurrency(totals.income)}
          </p>
        </div>
        <div className="bg-white/70 border border-paper-line rounded-card px-5 py-4">
          <p className="text-ink-soft text-xs font-semibold tracking-wide uppercase">
            Spent
          </p>
          <p className="mt-1 font-display text-2xl text-brick-deep">
            {formatCurrency(totals.expense)}
          </p>
        </div>
      </div>

      {/* Pie chart of where money went */}
      <div className="bg-white/70 border border-paper-line rounded-card shadow-card px-6 py-7 sm:px-7">
        <h2 className="font-display italic text-xl text-ink mb-5">
          Where it went
        </h2>

        {breakdown.segments.length === 0 ? (
          <p className="text-ink-soft text-[15px] text-center py-8">
            No expenses recorded for {totals.label} yet.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-7">
            <div className="relative w-40 h-40 shrink-0">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(${gradientStops})` }}
              />
              <div className="absolute inset-[19%] rounded-full bg-paper flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-ink-soft font-semibold uppercase tracking-wide">
                  Spent
                </span>
                <span className="font-display text-base text-ink leading-tight">
                  {formatCurrency(breakdown.total)}
                </span>
              </div>
            </div>

            <ul className="flex-1 w-full flex flex-col gap-2.5">
              {breakdown.segments.map((seg) => (
                <li key={seg.label} className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden="true"
                  />
                  <span className="text-ink text-[14px] truncate flex-1">
                    {seg.label}
                  </span>
                  <span className="text-ink-soft text-[13px] shrink-0">
                    {seg.percent}%
                  </span>
                  <span className="text-ink font-semibold text-[14px] shrink-0 w-20 text-right">
                    {formatCurrency(seg.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronIcon({ direction, className }) {
  const d = direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
