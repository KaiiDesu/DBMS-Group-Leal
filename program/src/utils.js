export function generate12DigitCode() {
    // Ensures the first digit isn’t zero
    const min = 1e11;        // 100 000 000 000
    const max = 1e12 - 1;    // 999 999 999 999
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }