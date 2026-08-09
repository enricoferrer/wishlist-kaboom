"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
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
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-muted">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${step === "url" ? "bg-gradient-cta text-primary-fg" : "bg-success text-white"}`}>
          1
        </span>
        <span className={step === "url" ? "text-foreground" : ""}>Link</span>
        <span className="h-px flex-1 bg-border" />
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${step === "form" ? "bg-gradient-cta text-primary-fg" : "bg-surface-2"}`}>
          2
        </span>
        <span className={step === "form" ? "text-foreground" : ""}>Detalhes</span>
      </div>

      {step === "url" ? (
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Cole o link do produto
            <input
              type="url"
              required
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </label>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-gradient-cta px-4 py-2 text-sm font-semibold text-primary-fg shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
