import { useQueryClient, useMutation } from '@tanstack/react-query';

import { fetchPostDailyAnalysis } from '@/api/strategyDetail';
import { DailyAnalysisProps } from '@/types/strategyDetail';

export const usePostDailyAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      strategyId,
      payload,
      authRole,
    }: {
      strategyId: number;
      payload: DailyAnalysisProps[];
      authRole: 'admin' | 'trader';
    }) => fetchPostDailyAnalysis(strategyId, { payload }, authRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyAnalysis'] });
    },
  });
};
