"use client";

import { useState } from "react";
import type { Item } from "@/lib/types";

const CONFETTI_COLORS = ["#7c3aed", "#ec4899", "#fb923c", "#10b981", "#a78bfa"];

interface ConfettiPiece {
  id: number;
  left: number;
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: 40 + Math.random() * 20,
    x: (Math.random() - 0.5) * 160,
    y: 100 + Math.random() * 80,
    r: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 120,
  }));
}

function formatPrice(price: number | null, currency: string) {
  if (price == null) return null;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-6.7L3 9" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M12 8v13M3 12h18" />
      <path d="M12 8c-2 0-3.5-1.3-3.5-3S9 2 10 2s2 2 2 6c0-4 1-6 2-6s3.5.7 3.5 3S14 8 12 8Z" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export default function ItemCard({
  item,
  onEdit,
  onDelete,
  onTogglePurchased,
}: {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePurchased: () => void;
}) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const price = formatPrice(item.price, item.currency);
  const purchased = item.status === "purchased";

  function handleToggle() {
    if (!purchased) {
      const pieces = makeConfetti();
      setConfetti(pieces);
      window.setTimeout(() => setConfetti([]), 1000);
    }
    onTogglePurchased();
  }

  return (
    <li className="group relative animate-pop-in overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-glow">
      {confetti.length > 0 ? (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
          {confetti.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={
                {
                  left: `${p.left}%`,
                  backgroundColor: p.color,
                  animationDelay: `${p.delay}ms`,
                  "--confetti-x": `${p.x}px`,
                  "--confetti-y": `${p.y}px`,
                  "--confetti-r": `${p.r}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt=""
              className={`h-full w-full object-contain transition-all ${purchased ? "opacity-50 grayscale" : ""}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary/40">
              <IconGift />
            </div>
          )}
          {purchased ? (
            <div className="absolute inset-0 flex items-center justify-center bg-success/20">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-white shadow-sm">
                <IconCheck />
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className={`truncate text-sm font-semibold ${purchased ? "text-muted line-through" : "text-foreground"}`}>
            {item.title || "Sem nome"}
          </p>
          {price ? (
            <span
              className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                purchased ? "bg-surface-2 text-muted" : "bg-gradient-cta text-primary-fg"
              }`}
            >
              {price}
            </span>
          ) : null}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 truncate text-xs text-muted transition-colors hover:text-primary"
          >
            Ver no site original
            <IconExternal />
          </a>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggle}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                purchased
                  ? "bg-surface-2 text-muted hover:text-foreground"
                  : "bg-success-bg text-success-fg hover:brightness-95"
              }`}
            >
              {purchased ? <IconUndo /> : <IconCheck />}
              {purchased ? "Voltar para ativos" : "Marcar como comprado"}
            </button>
            <button
              onClick={onEdit}
              aria-label="Editar item"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-primary"
            >
              <IconEdit />
            </button>
            <button
              onClick={onDelete}
              aria-label="Excluir item"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-bg hover:text-danger"
            >
              <IconTrash />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
