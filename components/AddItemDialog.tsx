"use client";

import { useState } from "react";
import Modal from "./Modal";
import ItemForm, { type ItemFormValues } from "./ItemForm";
import { addItem } from "@/app/actions";

type Step = "url" | "form";

const emptyValues: ItemFormValues = {
  url: "",
  title: "",
  image_url: "",
  price: "",
  currency: "BRL",
};

export default function AddItemDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<ItemFormValues>(emptyValues);

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setFormValues({
        url,
        title: data.title ?? "",
        image_url: data.image ?? "",
        price: data.price != null ? String(data.price) : "",
        currency: data.currency ?? "BRL",
      });
    } catch {
      setFormValues({ ...emptyValues, url });
    } finally {
      setStep("form");
      setLoading(false);
    }
  }

  async function handleFormSubmit(values: ItemFormValues) {
    await addItem({
      url: values.url,
      title: values.title || null,
      image_url: values.image_url || null,
      price: values.price ? Number(values.price) : null,
      currency: values.currency || "BRL",
    });
    onSaved();
  }

  return (
    <Modal title="Adicionar item" onClose={onClose}>
      {step === "url" ? (
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Cole o link do produto
            <input
              type="url"
              required
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isLoading ? "Buscando…" : "Buscar informações"}
            </button>
          </div>
        </form>
      ) : (
        <ItemForm
          initialValues={formValues}
          onSubmit={handleFormSubmit}
          onCancel={onClose}
          submitLabel="Adicionar"
        />
      )}
    </Modal>
  );
}
