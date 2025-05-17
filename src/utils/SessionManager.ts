let timeoutRef: ReturnType<typeof setTimeout> | null = null;

export const isAuthenticated = (): boolean => {
  const data = localStorage.getItem("userData");
  try {
    const user: { role?: string; name?: string } = JSON.parse(data || '{}');
    return !!user?.role && !!user?.name;
  } catch {
    return false;
  }
};

const logoutUser = (navigate?: (path: string) => void): void => {
  localStorage.removeItem("userData");
  if (navigate) navigate("/auth/login");
};

export const startInactivityTimer = (
  navigate?: (path: string) => void,
  duration: number = 30 * 60 * 1000
): void => {
  if (timeoutRef) clearTimeout(timeoutRef);
  timeoutRef = setTimeout(() => {
    logoutUser(navigate);
  }, duration);
};

export const clearInactivityTimer = (): void => {
  if (timeoutRef) clearTimeout(timeoutRef);
};

export const handleVisibilityChange = (navigate?: (path: string) => void): void => {
  if (document.hidden) {
    startInactivityTimer(navigate);
  } else {
    clearInactivityTimer();
  }
};
