"use client";

import { useState } from "react";

export interface ItemFormValues {
  url: string;
  title: string;
  image_url: string;
  price: string;
  currency: string;
}

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800";

export default function ItemForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
}: {
  initialValues: ItemFormValues;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [isSaving, setSaving] = useState(false);

  function update<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {values.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={values.image_url}
          alt=""
          className="h-40 w-full rounded-lg bg-zinc-50 object-contain dark:bg-zinc-800"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        Link do produto
        <input
          type="url"
          required
          value={values.url}
          onChange={(e) => update("url", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Nome do produto"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Imagem (URL)
        <input
          type="url"
          value={values.image_url}
          onChange={(e) => update("image_url", e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Preço
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </label>
        <label className="flex w-24 flex-col gap-1 text-sm">
          Moeda
          <input
            type="text"
            value={values.currency}
            onChange={(e) => update("currency", e.target.value.toUpperCase())}
            maxLength={3}
            className={`${inputClass} uppercase`}
          />
        </label>
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isSaving ? "Salvando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
