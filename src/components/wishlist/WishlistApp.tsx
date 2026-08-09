"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Item, ItemStatus } from "@/lib/types";
import ItemCard from "./ItemCard";
import AddItemDialog from "./AddItemDialog";
import EditItemDialog from "./EditItemDialog";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { deleteItem, setItemStatus, signOut } from "@/app/actions";

const TABS: { key: ItemStatus; label: string }[] = [
  { key: "active", label: "Ativos" },
  { key: "purchased", label: "Comprados" },
];

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="M19 15l.9 2.6L22.5 18.5 19.9 19.4 19 22l-.9-2.6L15.5 18.5 18.1 17.6 19 15Z" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9" aria-hidden="true">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3a2 2 0 0 1-2 4h-1M7 5H4a2 2 0 0 0 2 4h1" />
    </svg>
  );
}

export default function WishlistApp({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<ItemStatus>("active");
  const [isAddOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [, startTransition] = useTransition();

  const filteredItems = useMemo(
    () => initialItems.filter((item) => item.status === tab),
    [initialItems, tab]
  );

  const total = initialItems.length;
  const purchasedCount = useMemo(
    () => initialItems.filter((item) => item.status === "purchased").length,
    [initialItems]
  );
  const progressPct = total > 0 ? Math.round((purchasedCount / total) * 100) : 0;

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este item?")) return;
    await deleteItem(id);
    refresh();
  }

  async function handleTogglePurchased(item: Item) {
    await setItemStatus(item.id, item.status === "active" ? "purchased" : "active");
    refresh();
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="blob animate-blob -left-24 -top-24 h-72 w-72" />
      <div className="blob animate-blob right-0 top-40 h-64 w-64" style={{ animationDelay: "-6s" }} />

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-cta text-primary-fg shadow-glow">
              <IconSparkles />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-gradient sm:text-2xl">
              Wishlist Kaboom
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-cta px-4 py-2 text-sm font-semibold text-primary-fg shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
            >
              <IconPlus />
              <span className="hidden sm:inline">Adicionar item</span>
            </button>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sair"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-danger"
              >
                <IconLogout />
              </button>
            </form>
          </div>
        </header>

        {total > 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                {purchasedCount} de {total} comprados
              </span>
              <span className="font-bold text-primary">{progressPct}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-progress transition-all duration-500 ease-out"
                style={{ width: `${Math.max(progressPct, purchasedCount > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-gradient-cta text-primary-fg shadow-glow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-primary">
              <IconTrophy />
            </span>
            <p className="max-w-xs text-sm text-muted">
              {tab === "active"
                ? "Nenhum item ainda. Cole o link de um produto que você quer e comece sua lista dos sonhos."
                : "Nenhum item comprado ainda. Quando marcar algo como comprado, ele aparece aqui."}
            </p>
            {tab === "active" ? (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-cta px-4 py-2 text-sm font-semibold text-primary-fg shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
              >
                <IconPlus />
                Adicionar primeiro item
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDelete(item.id)}
                onTogglePurchased={() => handleTogglePurchased(item)}
              />
            ))}
          </ul>
        )}

        {isAddOpen ? (
          <AddItemDialog
            onClose={() => setAddOpen(false)}
            onSaved={() => {
              setAddOpen(false);
              refresh();
            }}
          />
        ) : null}

        {editingItem ? (
          <EditItemDialog
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSaved={() => {
              setEditingItem(null);
              refresh();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
