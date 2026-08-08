"use client";

import Modal from "./Modal";
import ItemForm, { type ItemFormValues } from "./ItemForm";
import { updateItem } from "@/app/actions";
import type { Item } from "@/lib/types";

export default function EditItemDialog({
  item,
  onClose,
  onSaved,
}: {
  item: Item;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialValues: ItemFormValues = {
    url: item.url,
    title: item.title ?? "",
    image_url: item.image_url ?? "",
    price: item.price != null ? String(item.price) : "",
    currency: item.currency,
  };

  async function handleSubmit(values: ItemFormValues) {
    await updateItem(item.id, {
      url: values.url,
      title: values.title || null,
      image_url: values.image_url || null,
      price: values.price ? Number(values.price) : null,
      currency: values.currency || "BRL",
    });
    onSaved();
  }

  return (
    <Modal title="Editar item" onClose={onClose}>
      <ItemForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Salvar"
      />
    </Modal>
  );
}
