export function validateCNPJ(cnpj: string) {
  const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const c = String(cnpj).replace(/[^\d]/g, '');

  if (c.length !== 14) return false;

  if (/0{14}/.test(c)) return false;

  // eslint-disable-next-line no-var
  for (var i = 0, n = 0; i < 12; n += Number(c[i]) * b[++i]);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (Number(c[12]) != ((n %= 11) < 2 ? 0 : 11 - n)) return false;

  // eslint-disable-next-line no-var
  for (var i = 0, n = 0; i <= 12; n += Number(c[i]) * b[i++]);
  if (Number(c[13]) != ((n %= 11) < 2 ? 0 : 11 - n)) return false;

  return true;
}
