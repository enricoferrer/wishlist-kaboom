import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistApp from "@/components/wishlist/WishlistApp";
import type { Item } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  return <WishlistApp initialItems={(items ?? []) as Item[]} />;
}
