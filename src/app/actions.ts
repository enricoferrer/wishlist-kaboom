"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/types";

export interface ItemInput {
  url: string;
  title: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
}

async function requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return user;
}

async function getDefaultListId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("lists")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("Default list not found");
  }

  return data.id as string;
}

export async function addItem(input: ItemInput) {
  const supabase = await createClient();
  const user = await requireUser(supabase);
  const listId = await getDefaultListId(supabase, user.id);

  const { error } = await supabase.from("items").insert({
    list_id: listId,
    user_id: user.id,
    url: input.url,
    title: input.title,
    image_url: input.image_url,
    price: input.price,
    currency: input.currency,
  });

  if (error) throw error;
  revalidatePath("/");
}

export async function updateItem(id: string, input: ItemInput) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { error } = await supabase
    .from("items")
    .update({
      url: input.url,
      title: input.title,
      image_url: input.image_url,
      price: input.price,
      currency: input.currency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/");
}

export async function setItemStatus(id: string, status: ItemStatus) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { error } = await supabase
    .from("items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/");
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { error } = await supabase.from("items").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
