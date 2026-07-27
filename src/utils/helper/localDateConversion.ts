// Date-only values ("YYYY-MM-DD") must be built and parsed from LOCAL date
// parts: `new Date("2026-07-27")` is parsed as UTC midnight per the spec, which
// shifts the day for users west of UTC when read back with local getters.

export const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseIsoDateAsLocal = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};
