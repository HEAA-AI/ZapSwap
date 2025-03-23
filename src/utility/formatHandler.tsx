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

export const handleDecimalCountWithRange = (value: string) => {
  // Allow only numbers and one decimal point
  if (!/^\d*\.?\d*$/.test(value)) return value.slice(0, -1);

  // Prevent more than 2 decimal places
  const parts = value.split(".");
  if (parts.length === 2 && parts[1].length > 2) {
    value = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }

  // Convert to number
  const numValue = parseFloat(value);

  // If value is greater than 100, don't allow further input
  if (numValue > 100) return value.slice(0, -1);

  return value;
};

export const handleSolanaPriceFormat = (
  price: number,
  locale: string = "en-US"
) => {
  try {
    if (!price || isNaN(price)) {
      throw new Error("Invalid price value.");
    }

    return price.toLocaleString(locale, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  } catch (error) {
    console.error("Error formatting Solana price:", error);
    return "0.00"; // Fallback value
  }
};
