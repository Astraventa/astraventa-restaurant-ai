import { useEffect, useState } from "react";

const STORAGE_KEY = "astraventa_client_id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useClientId(): string {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        setId(existing);
        return;
      }
      const created = generateId();
      localStorage.setItem(STORAGE_KEY, created);
      setId(created);
    } catch {
      setId(generateId());
    }
  }, []);

  return id;
}


