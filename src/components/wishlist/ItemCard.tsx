"use client";

import type { Item } from "@/lib/types";

function formatPrice(price: number | null, currency: string) {
  if (price == null) return null;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
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
  const price = formatPrice(item.price, item.currency);

  return (
    <li className="flex gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-800">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="h-full w-full object-contain" />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium">{item.title || "Sem nome"}</p>
        {price ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{price}</p> : null}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Ver no site original
        </a>

        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <button
            onClick={onTogglePurchased}
            className="font-medium text-zinc-600 hover:underline dark:text-zinc-300"
          >
            {item.status === "active" ? "Marcar como comprado" : "Marcar como ativo"}
          </button>
          <button
            onClick={onEdit}
            className="font-medium text-zinc-600 hover:underline dark:text-zinc-300"
          >
            Editar
          </button>
          <button onClick={onDelete} className="font-medium text-red-600 hover:underline">
            Excluir
          </button>
        </div>
      </div>
    </li>
  );
}
