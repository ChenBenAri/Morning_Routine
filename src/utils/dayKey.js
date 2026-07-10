const ISRAEL_TZ = 'Asia/Jerusalem';

function getIsraelParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? 0 : parts.hour),
  };
}

/** Routine day starts at 3:00 AM Israel time. */
export function getRoutineDayKey(date = new Date()) {
  const { year, month, day, hour } = getIsraelParts(date);
  const routineDate = new Date(year, month - 1, day);

  if (hour < 3) {
    routineDate.setDate(routineDate.getDate() - 1);
  }

  const y = routineDate.getFullYear();
  const m = String(routineDate.getMonth() + 1).padStart(2, '0');
  const d = String(routineDate.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}
