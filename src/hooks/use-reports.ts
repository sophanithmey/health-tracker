import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report-service';
import { HealthReportSummary } from '@/types';

export function useReports(days = 7) {
  const query = useQuery<{ summary: HealthReportSummary }>({
    queryKey: ['reports', days],
    queryFn: () => reportService.getSummary(days)
  });

  return {
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}
