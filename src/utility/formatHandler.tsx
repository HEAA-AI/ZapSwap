export const handleDecimalCount = (value: string) => {
  // Allow only numbers and one decimal point
  if (!/^\d*\.?\d*$/.test(value)) return value.slice(0, -1);

  // Prevent more than 6 decimals
  const parts = value.split(".");
  if (parts.length === 2 && parts[1].length > 6) {
    return `${parts[0]}.${parts[1].slice(0, 6)}`; // Trim extra decimals
  }

  return value;
};
