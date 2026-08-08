export type ItemStatus = "active" | "purchased";

export interface Item {
  id: string;
  list_id: string;
  user_id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}
