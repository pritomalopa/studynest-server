export const toSafeString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
};
