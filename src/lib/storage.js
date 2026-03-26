// ═══════════════════════════════════════════
// AI COUNCIL — Session Storage (localStorage)
// ═══════════════════════════════════════════

const STORAGE_KEY = 'ai-council-sessions';

function getStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStorage(sessions) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

// ── Public API ───────────────────────────────

export function saveSession(session) {
  const sessions = getStorage();
  const existing = sessions.findIndex((s) => s.id === session.id);

  const sessionData = {
    ...session,
    updatedAt: new Date().toISOString(),
    createdAt: session.createdAt || new Date().toISOString(),
  };

  if (existing >= 0) {
    sessions[existing] = sessionData;
  } else {
    sessions.unshift(sessionData);
  }

  // Keep max 50 sessions
  if (sessions.length > 50) sessions.length = 50;

  setStorage(sessions);
  return sessionData;
}

export function getSessions() {
  return getStorage().sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );
}

export function getSession(id) {
  return getStorage().find((s) => s.id === id) || null;
}

export function deleteSession(id) {
  const sessions = getStorage().filter((s) => s.id !== id);
  setStorage(sessions);
  return sessions;
}

export function clearAllSessions() {
  setStorage([]);
}

// ── Utilities ────────────────────────────────

export function generateId() {
  return `council-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
