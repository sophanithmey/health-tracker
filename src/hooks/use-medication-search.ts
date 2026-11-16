import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicationService } from '@/services/medication-service';
import { useDebounce } from '@/hooks/use-debounce';
import { RxNormDrugConcept } from '@/types/medication-database';

export function useMedicationSearch(initialQuery = 'metformin') {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query.trim(), 350);

  const { data, isLoading, isError, error } = useQuery<{
    items: RxNormDrugConcept[];
    total: number;
  }>({
    queryKey: ['medication-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { total: 0, items: [] };
      return medicationService.searchMedications(debouncedQuery, 25);
    },
    enabled: Boolean(debouncedQuery),
    staleTime: 5 * 60 * 1000
  });

  return {
    query,
    setQuery,
    debouncedQuery,
    items: data?.items || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error
  };
}
