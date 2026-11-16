import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetService, TargetsResponse } from '@/services/target-service';
import { GlucoseTarget, GlucoseTargetAuditLog } from '@/types';

export function useTargets(patientId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') {
  const queryClient = useQueryClient();

  const query = useQuery<TargetsResponse>({
    queryKey: ['targets'],
    queryFn: () => targetService.getTargets()
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => targetService.createTarget(patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ targetId, payload }: { targetId: string; payload: Record<string, unknown> }) =>
      targetService.updateTarget(patientId, targetId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const approveMutation = useMutation({
    mutationFn: ({ targetId, reason }: { targetId: string; reason?: string }) =>
      targetService.approveTarget(patientId, targetId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ targetId, reason }: { targetId: string; reason?: string }) =>
      targetService.rejectTarget(patientId, targetId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  return {
    targets: query.data?.targets || [],
    activeTargets: query.data?.activeTargets || {},
    generalGuidelines: query.data?.generalGuidelines || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createTarget: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTarget: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    approveTarget: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectTarget: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending
  };
}
