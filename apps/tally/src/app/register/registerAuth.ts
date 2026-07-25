const UNLOCK_KEY = "tally.register.unlocked";

export function isRegisterRouteEnabled(): boolean {
  return import.meta.env.VITE_REGISTER_ENABLED !== "false";
}

export async function isRegisterUnlocked(): Promise<boolean> {
  if (!isRegisterRouteEnabled()) return false;
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export async function unlockRegister(password: string): Promise<boolean> {
  const expected = import.meta.env.VITE_REGISTER_PASSWORD ?? "register";
  if (password !== expected) return false;
  sessionStorage.setItem(UNLOCK_KEY, "1");
  return true;
}

export async function lockRegister(): Promise<void> {
  sessionStorage.removeItem(UNLOCK_KEY);
}
