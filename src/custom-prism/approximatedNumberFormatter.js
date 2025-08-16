/**
 * Formats a number according to a DecimalFormat-like pattern.
 *
 * @param {number} value The number to format
 * @param {string} pattern The DecimalFormat pattern, e.g. "#,##0.00 ¤"
 * @param {string|null} locale The BCP47 locale, e.g. "de-DE" or "en-US"
 * @param {string|null} roundingMode One of "UP", "DOWN", "HALF_UP"
 * @param {string|null} currency ISO 4217 code like "EUR" (needed if ¤ present)
 */
const formatNumber = (value, pattern, locale, roundingMode, currency) => {
  locale = locale || undefined;

  // Detect special tokens
  const isPercent = pattern.includes("%");
  const isCurrency = pattern.includes("¤");

  // Extract prefix/suffix (everything not part of number pattern)
  const match = pattern.match(/([^0#,\.¤%]*)([0#,\.¤%]+)([^0#,\.¤%]*)/);
  if (!match) return String(value);
  const [, prefix, numberPattern, suffix] = match;

  // Split integer/frac
  const core = numberPattern.replace(/[%¤]/g, "");
  const [intPart, fracPart = ""] = core.split(".");

  const minIntDigits = (intPart.match(/0/g) || []).length;
  const minFracDigits = (fracPart.match(/0/g) || []).length;
  const maxFracDigits = fracPart.length;

  let scaled = value;
  if (isPercent) scaled *= 100;

  if (roundingMode && maxFracDigits > 0) {
    scaled = applyRounding(scaled, maxFracDigits, roundingMode);
  }

  const options = {
    minimumIntegerDigits: minIntDigits || 1,
    minimumFractionDigits: minFracDigits,
    maximumFractionDigits: maxFracDigits,
    useGrouping: intPart.includes(","),
  };

  if (isCurrency) {
    options.style = "currency";
    options.currency = currency || "USD";
  } else if (isPercent) {
    options.style = "percent";
  } else {
    options.style = "decimal";
  }

  const nf = new Intl.NumberFormat(locale, options);
  let formatted = nf.format(scaled);

  // Percent style in Intl already appends "%", but if we used scaling manually:
  if (isPercent && options.style !== "percent") {
    formatted += "%";
  }

  return prefix + formatted + suffix;
}

const applyRounding = (value, fractionDigits, mode) => {
  const factor = Math.pow(10, fractionDigits);
  const scaled = value * factor;

  switch (mode) {
    case "UP":
      return (scaled > 0 ? Math.ceil(scaled) : Math.floor(scaled)) / factor;
    case "DOWN":
      return (scaled > 0 ? Math.floor(scaled) : Math.ceil(scaled)) / factor;
    case "HALF_UP":
      return Math.round(scaled) / factor;
    default:
      throw new Error("invalid rounding mode");
  }
}

export class ApproximatedNumberFormatter {
  static format(format, roundingMode, locale, value) {
    return formatNumber(value, format, locale, roundingMode, null);
  }
}