export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const formatCnic = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 13);
  return [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)]
    .filter(Boolean)
    .join('-');
};
