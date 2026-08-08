"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Item, ItemStatus } from "@/lib/types";
import ItemCard from "./ItemCard";
import AddItemDialog from "./AddItemDialog";
import EditItemDialog from "./EditItemDialog";
import { deleteItem, setItemStatus, signOut } from "@/app/actions";

const TABS: { key: ItemStatus; label: string }[] = [
  { key: "active", label: "Ativos" },
  { key: "purchased", label: "Comprados" },
];

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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold sm:text-2xl">Minha Wishlist</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Adicionar item
          </button>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "border-black text-black dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          {tab === "active"
            ? "Nenhum item ainda. Adicione um link para começar."
            : "Nenhum item comprado ainda."}
        </p>
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
  );
}
