export interface CardapioProduct {
  id: string;
  name: string;
  unitLabel: string | null;
  priceCents: number;
  description: string | null;
  imageUrl: string | null;
}

export interface CardapioGroup {
  id: string;
  name: string;
  note: string | null;
  products: CardapioProduct[];
}

export interface CardapioSection {
  id: string;
  name: string;
  note: string | null;
  products: CardapioProduct[];
  groups: CardapioGroup[];
}
