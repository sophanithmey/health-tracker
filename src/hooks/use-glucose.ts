import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { glucoseService, CreateGlucoseRecordPayload } from '@/services/glucose-service';
import { GlucoseRecord, NotificationAlert } from '@/types';

export function useGlucose(limit?: number) {
  const queryClient = useQueryClient();

  const query = useQuery<{ records: GlucoseRecord[]; total: number }>({
    queryKey: ['glucose', limit],
    queryFn: () => glucoseService.getRecords(limit)
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateGlucoseRecordPayload) => glucoseService.createRecord(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['glucose'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => glucoseService.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glucose'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  return {
    records: query.data?.records || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createRecord: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteRecord: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}
