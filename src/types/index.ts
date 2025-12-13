export interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  original_price: number;
  affiliate_url: string;
  category: string;
  temperature: number;
  hot_votes: number;
  cold_votes: number;
  comments_count: number;
  store: string;
  created_at: string;
  specs?: Record<string, string>;
  coupon_code?: string | null;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  product_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  product_id: string;
  vote_type: 'hot' | 'cold';
  created_at: string;
}

// Category type - aceita qualquer string para suportar categorias dinâmicas do banco
export type Category = string;

export type SortOption = 'hottest' | 'newest' | 'commented';
