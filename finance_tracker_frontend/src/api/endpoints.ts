import { apiFetch } from "./client";

export interface BackendExpense {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description?: string | null;
  payment_method: string;
  created_at: string;
}

export interface BackendProfile {
  id: string;
  user_id: number;
  name: string;
  monthlyincome: number;
  goal?: number | null;
  createdAt: string;
}

export async function registerUser(username: string, password: string) {
  return apiFetch<{ message: string; username: string }>("/auth/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
    auth: false,
  });
}

export async function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  return apiFetch<{ access_token: string; token_type: string }>("/auth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    auth: false,
  });
}

export async function getMe() {
  return apiFetch<{ User: { username: string; id: number } }>("/");
}

export async function getProfile(): Promise<BackendProfile | null> {
  const profiles = await apiFetch<BackendProfile[]>("/profile");
  return profiles?.[0] ?? null;
}

export async function createProfile(data: {
  name: string;
  monthlyincome: number;
  goal?: number | null;
}) {
  return apiFetch<BackendProfile>("/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateProfile(data: {
  name?: string;
  monthlyincome?: number;
  goal?: number | null;
}) {
  return apiFetch<BackendProfile>("/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function listExpenses() {
  return apiFetch<BackendExpense[]>("/expenses/");
}

export async function createExpense(data: {
  amount: number;
  category: string;
  description?: string;
  payment_method: string;
}) {
  return apiFetch<BackendExpense>("/expenses/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateExpense(
  expenseId: number,
  data: {
    amount?: number;
    category?: string;
    description?: string;
    payment_method?: string;
  }
) {
  return apiFetch<BackendExpense>(`/expenses/${expenseId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(expenseId: number) {
  return apiFetch<void>(`/expenses/${expenseId}`, { method: "DELETE" });
}

export async function chat(message: string) {
  return apiFetch<{ reply: string }>("/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export async function voiceToText(blob: Blob) {
  const fd = new FormData();
  fd.append("file", blob, "voice.webm");
  return apiFetch<{ text: string }>("/voice-to-text", {
    method: "POST",
    body: fd,
    auth: false,
  });
}

export interface OnlineProduct {
  title: string;
  price: string;
  source: string;
  rating: string | number;
  reviews: string | number;
}

export interface AnalyzePurchaseResponse {
  product: string;
  offline_price: number;
  online_results: OnlineProduct[];
  ai_decision: string;
}

export async function analyzePurchase(item_name: string, offline_price: number) {
  return apiFetch<AnalyzePurchaseResponse>("/ai/analyze-purchase", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ item_name, offline_price }),
  });
}



