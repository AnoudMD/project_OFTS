export const isEmpty = (value?: string) => !value || value.trim().length === 0;

export const isValidDate = (value?: string) =>
  !!value && /^\d{4}-\d{2}-\d{2}/.test(value);
