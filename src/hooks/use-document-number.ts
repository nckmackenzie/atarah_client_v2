import { useQuery } from '@tanstack/react-query';

export function useDocumentNumbers<T>(
  queryKey: string,
  queryFn: () => Promise<T>
) {
  const {
    data: documentNo,
    error: docNumberError,
    isLoading: isFetchingNo,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: () => queryFn(),
    refetchInterval: false,
  });

  return { documentNo, isFetchingNo, docNumberError };
}
