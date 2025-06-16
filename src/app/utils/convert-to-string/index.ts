export const convertToString = (
  data: Array<{ label: string; value: string }>
) =>
  (Array.isArray(data) ? data : [])?.map(
    ({ value }: { value: string }) => value
  );
