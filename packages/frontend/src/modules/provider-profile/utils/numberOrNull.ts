const numberOrNull = (value: string): number | null => {
  if (value === "" || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export default numberOrNull;
