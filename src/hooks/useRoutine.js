import { useCallback, useEffect, useState } from 'react';
import { TASKS } from '../data/tasks';
import { getRoutineDayKey } from '../utils/dayKey';

const STORAGE_PREFIX = 'morning-routine';

function emptyChecks() {
  return TASKS.map(() => false);
}

function loadChecks(dayKey) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${dayKey}`);
    if (!raw) return emptyChecks();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== TASKS.length) {
      return emptyChecks();
    }

    return parsed.map(Boolean);
  } catch {
    return emptyChecks();
  }
}

function saveChecks(dayKey, checks) {
  localStorage.setItem(`${STORAGE_PREFIX}:${dayKey}`, JSON.stringify(checks));
}

export function useRoutine() {
  const [dayKey, setDayKey] = useState(() => getRoutineDayKey());
  const [checks, setChecks] = useState(() => loadChecks(getRoutineDayKey()));

  const refreshDay = useCallback(() => {
    const nextKey = getRoutineDayKey();
    setDayKey((current) => {
      if (current !== nextKey) {
        setChecks(loadChecks(nextKey));
        return nextKey;
      }
      return current;
    });
  }, []);

  useEffect(() => {
    refreshDay();
    const id = setInterval(refreshDay, 30_000);
    return () => clearInterval(id);
  }, [refreshDay]);

  const toggleTask = (index) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      saveChecks(dayKey, next);
      return next;
    });
  };

  const completedCount = checks.filter(Boolean).length;

  return {
    dayKey,
    checks,
    toggleTask,
    completedCount,
    total: TASKS.length,
  };
}
