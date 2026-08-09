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
  "rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary";

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
          className="h-40 w-full rounded-xl bg-surface-2 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Link do produto
        <input
          type="url"
          required
          value={values.url}
          onChange={(e) => update("url", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Nome
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Nome do produto"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
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
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
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
        <label className="flex w-24 flex-col gap-1 text-sm font-medium">
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
          className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-gradient-cta px-4 py-2 text-sm font-semibold text-primary-fg shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSaving ? "Salvando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
