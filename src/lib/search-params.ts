export type SearchParamInput = Record<string, string | string[] | undefined>;

export function getSingleSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function toFlatSearchParams(input: SearchParamInput) {
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [key, getSingleSearchParamValue(value)])
      .filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}
