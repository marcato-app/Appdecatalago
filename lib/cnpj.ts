// CNPJ é opcional no cadastro ("com CNPJ quando houver") — só valida o
// formato quando o lojista informa algo, nunca exige. Guarda só os dígitos;
// a formatação (00.000.000/0000-00) é responsabilidade da UI.

function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, i) => acc + weight * Number(digits[i]), 0);
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

export function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits)) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false; // all same digit — never valid

  const firstCheck = checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstCheck !== Number(digits[12])) return false;

  const secondCheck = checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return secondCheck === Number(digits[13]);
}

export function formatCnpj(digits: string): string {
  if (digits.length !== 14) return digits;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
