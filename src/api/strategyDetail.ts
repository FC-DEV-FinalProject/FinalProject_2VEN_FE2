import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';

//전략 상세 기본 정보 조회
export const fetchDefaultStrategyDetail = async (id: number) => {
  if (!id) {
    throw new Error('Strategy ID is required');
  }
  try {
    const res = await apiClient.get(`${API_ENDPOINTS.STRATEGY.CREATE}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Auth: 'admin',
      },
    });
    return res.data;
  } catch (error) {
    console.error('failed to fetch DefaultStrategyDetail data', error);
  }
};

//전략 상세 기본 정보 삭제
export const fetchDeleteStrategyDetail = async (id: number) => {
  try {
    const req = await apiClient.delete(`${API_ENDPOINTS.STRATEGY.CREATE}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Auth: 'admin',
      },
    });
    return req.data;
  } catch (error) {
    console.error('faild to fetch DeleteStrategyDetail', error);
  }
};

//일간분석 조회
export const fetchDailyAnalysis = async (strategyId: number, page: number, pageSize: number) => {
  try {
    const res = await apiClient.get(
      `${API_ENDPOINTS.STRATEGY.CREATE}/${strategyId}/daily-analyses`,
      {
        params: {
          page,
          pageSize,
        },
        headers: {
          useMock: import.meta.env.VITE_ENABLE_MSW === 'true',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error('fetch to failed Daily Analysis', error);
  }
};
