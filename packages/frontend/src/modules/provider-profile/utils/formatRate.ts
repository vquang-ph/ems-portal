const formatRate = (min: number | null, max: number | null): string => {
  if (min === null && max === null) return "Rate not set";
  if (min !== null && max !== null) return `$${min} – $${max} / hr`;
  if (min !== null) return `From $${min} / hr`;
  return `Up to $${max} / hr`;
};

export default formatRate;
