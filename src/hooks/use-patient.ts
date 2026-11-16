import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient-service';
import { PatientProfile } from '@/types';

export function usePatient() {
  const queryClient = useQueryClient();

  const query = useQuery<PatientProfile>({
    queryKey: ['patient'],
    queryFn: () => patientService.getPatient(),
    staleTime: 60 * 1000
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PatientProfile>) => patientService.updatePatient(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['patient'], updated);
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    }
  });

  return {
    patient: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updatePatient: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
}
