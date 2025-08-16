// The "2-digit" option doesn't seem to work reliably...
const pad = (input) => {
  return String(input).padStart(2, '0');
};

const extract = (format, date, part) => {
  return format.formatToParts(date).find(it => it.type === part)?.value ?? "?";
};

const buildDateSuppliers = (date, locale, timeZone) => {
  let options = {};

  if (timeZone)
    options.timeZone = timeZone;

  if (locale === null)
    locale = undefined;

  return {
    // Year
    "yyyy": () => new Intl.DateTimeFormat(locale, { year: "numeric", ...options }).format(date),
    "yy":   () => pad(new Intl.DateTimeFormat(locale, { year: "2-digit", ...options }).format(date)),

    // Month
    "MM":   () => pad(new Intl.DateTimeFormat(locale, { month: "2-digit", ...options }).format(date)),
    "M":    () => new Intl.DateTimeFormat(locale, { month: "numeric", ...options }).format(date),
    "MMM":  () => new Intl.DateTimeFormat(locale, { month: "short", ...options }).format(date),
    "MMMM": () => new Intl.DateTimeFormat(locale, { month: "long", ...options }).format(date),

    // Day
    "dd":   () => pad(new Intl.DateTimeFormat(locale, { day: "2-digit", ...options }).format(date)),
    "d":    () => new Intl.DateTimeFormat(locale, { day: "numeric", ...options }).format(date),

    // Hour (24-hour)
    "HH":   () => pad(extract(new Intl.DateTimeFormat(locale, { hour: "2-digit", ...options, hour12: false }), date, "hour")),
    "H":    () => extract(new Intl.DateTimeFormat(locale, { hour: "numeric", ...options, hour12: false }), date, "hour"),

    // Hour (12-hour)
    "hh":   () => pad(extract(new Intl.DateTimeFormat(locale, { hour: "2-digit", ...options, hour12: true }), date, "hour")),
    "h":    () => extract(new Intl.DateTimeFormat(locale, { hour: "numeric", ...options, hour12: true }), date, "hour"),

    // Minute
    "mm":   () => pad(extract(new Intl.DateTimeFormat(locale, { minute: "2-digit", ...options }), date, "minute")),
    "m":    () => extract(new Intl.DateTimeFormat(locale, { minute: "numeric", ...options }), date, "minute"),

    // Second
    "ss":   () => pad(extract(new Intl.DateTimeFormat(locale, { second: "2-digit", ...options }), date, "second")),
    "s":    () => extract(new Intl.DateTimeFormat(locale, { second: "numeric", ...options }), date, "second"),

    // AM/PM
    "a": () => new Intl.DateTimeFormat(locale, { hour: "numeric", ...options, hour12: true })
                .formatToParts(date).find(p => p.type === "dayPeriod")?.value || "",

    // Weekday
    "EEE":  () => new Intl.DateTimeFormat(locale, { weekday: "short", ...options }).format(date),
    "EEEE": () => new Intl.DateTimeFormat(locale, { weekday: "long", ...options }).format(date),

    // Time zone
    "z":    () => new Intl.DateTimeFormat(locale, { timeZoneName: "short", ...options }).format(date)
  };
};

export class ApproximatedDateFormatter {
  static format(format, locale, timeZone, timestamp) {
    const suppliers = buildDateSuppliers(new Date(timestamp), locale, timeZone);
    const orderedTokens = Object.keys(suppliers).sort((a, b) => b.length - a.length);

    let result = "";
    let currentIndex = 0;
    const formatLength = format.length;

    while (currentIndex < formatLength) {
      const currentChar = format[currentIndex];

      // Quoted literal per DateTimeFormatter rules
      if (currentChar === "'") {
        let innerIndex = currentIndex + 1;
        let literal = "";

        while (innerIndex < formatLength) {
          if (format[innerIndex] === "'") {
            // escaped ''
            if (innerIndex + 1 < formatLength && format[innerIndex + 1] === "'") {
              literal += "'";
              innerIndex += 2;
              continue;
            }

            // end of literal
            else {
              ++innerIndex;
              break;
            }
          }

          literal += format[innerIndex++];
        }

        result += literal;
        currentIndex = innerIndex;
        continue;
      }

      let matched = false;

      for (const t of orderedTokens) {
        if (format.startsWith(t, currentIndex)) {
          result += suppliers[t]();
          currentIndex += t.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        result += currentChar;
        ++currentIndex;
      }
    }

    return result;
  }
}