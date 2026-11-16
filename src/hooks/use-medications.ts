import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '@/services/medication-service';
import { Medication, MedicationLog } from '@/types';

export function useMedications() {
  const queryClient = useQueryClient();

  const medsQuery = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: () => medicationService.getMedications()
  });

  const logsQuery = useQuery<MedicationLog[]>({
    queryKey: ['medication-logs'],
    queryFn: () => medicationService.getLogs()
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => medicationService.createMedication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicationService.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    }
  });

  const logDoseMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => medicationService.logDose(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-logs'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  return {
    medications: medsQuery.data || [],
    logs: logsQuery.data || [],
    isLoadingMeds: medsQuery.isLoading,
    isLoadingLogs: logsQuery.isLoading,
    refetchMeds: medsQuery.refetch,
    refetchLogs: logsQuery.refetch,
    createMedication: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteMedication: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    logDose: logDoseMutation.mutateAsync,
    isLoggingDose: logDoseMutation.isPending
  };
}
