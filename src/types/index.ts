export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
  calories: number;
  protein: string;
  packagingImages?: string[];
  // Translation fields
  nameEn: string;
  descriptionEn: string;
  tagsEn: string[];
}

export interface Order {
  id: string;
  customerName: string;
  details: string;
  time: string;
  address: string;
  total: string;
  status: "pending" | "confirmed" | "dispatched";
  createdAt?: string;
}

export interface AccountingData {
  initialCash: string;
  expenses: string;
  manualIncome: string;
}

export interface CustomerFrequency {
  name: string;
  orders: number;
  tag: string;
}
