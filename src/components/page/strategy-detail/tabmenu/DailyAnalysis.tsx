import { useMemo, useState } from 'react';

import { css } from '@emotion/react';
import { BiPlus } from 'react-icons/bi';

import AnalysisTable, { AnalysisProps } from '../table/AnalysisTable';
import InputTable, { InputTableProps } from '../table/InputTable';
import TableModal from '../table/TableModal';

import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/common/Toast';
import { usePostDailyAnalysis } from '@/hooks/mutations/useDailyAnalysis';
import useFetchDailyAnalysis from '@/hooks/queries/useFetchDailyAnalysis';
import usePagination from '@/hooks/usePagination';
import useModalStore from '@/stores/modalStore';
import useTableModalStore from '@/stores/tableModalStore';
import useToastStore from '@/stores/toastStore';
import { DailyAnalysisProps, AnalysisDataProps } from '@/types/strategyDetail';

const DailyAnalysis = ({ strategyId, attributes }: AnalysisProps) => {
  const [selectedData, setSelectedData] = useState<number[]>([]);
  const { pagination, setPage } = usePagination(1, 5);
  const { showToast, type, message, hideToast, isToastVisible } = useToastStore();
  const { openModal } = useModalStore();
  const { openTableModal } = useTableModalStore();
  const { mutate: postDailyAnalysis, isError } = usePostDailyAnalysis();
  const { dailyAnalysis, currentPage, pageSize, totalPages, isLoading } = useFetchDailyAnalysis(
    Number(strategyId),
    pagination.currentPage - 1,
    pagination.pageSize
  );

  const normalizedData = useMemo(() => {
    if (!dailyAnalysis) return [];
    return dailyAnalysis.map((data: AnalysisDataProps) => ({
      dataId: data.dailyStrategicStatisticsId,
      date: data.inputDate,
      principal: data.principal,
      dep_wd_price: data.depWdPrice,
      profit_loss: data.dailyProfitLoss,
      pl_rate: Math.round(data.dailyPlRate * 100) / 100,
      cumulative_profit_loss: data.cumulativeProfitLoss,
      cumulative_profit_loss_rate: Math.round(data.cumulativeProfitLossRate * 100) / 100,
    }));
  }, [dailyAnalysis]);

  const handleOpenModal = () => {
    let modalData: InputTableProps[] = [];
    const initalData: InputTableProps[] = Array.from({ length: 5 }, () => ({
      date: '',
      depWdPrice: 0,
      dailyProfitLoss: 0,
    }));

    openTableModal({
      type: 'insert',
      title: '일간분석 데이터 직접 입력',
      data: (
        <InputTable
          data={initalData}
          onChange={(newData) => {
            modalData = newData;
          }}
        />
      ),
      onAction: () => {
        if (modalData.length < 1) {
          showToast('올바른 데이터를 입력하세요.', 'error');
          return;
        }
        handleSaveData(modalData);
        if (isError) {
          showToast('이미 등록된 일자입니다.', 'error');
        }
      },
    });
  };

  const handleSaveData = (modalData: InputTableProps[]) => {
    if (!strategyId) return;

    const payload: DailyAnalysisProps[] = modalData
      .filter((data) => data.date && data.dailyProfitLoss && data.depWdPrice)
      .map((data) => ({
        date: data.date,
        depWdPrice: Number(data.depWdPrice),
        dailyProfitLoss: Number(data.dailyProfitLoss),
      }));

    postDailyAnalysis({
      strategyId: Number(strategyId),
      payload,
      authRole: 'admin',
    });

    modalData = [];
  };

  const handleSelectChange = (selectedIdx: number[]) => {
    setSelectedData(selectedIdx);
  };

  const handleDelete = () => {
    openModal({
      type: 'warning',
      title: '일간분석 삭제',
      desc: '일간 분석 데이터를 삭제하시겠습니까?',
      onAction: () => {},
    });
  };

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  return (
    <div css={dailyStyle}>
      {dailyAnalysis.length > 0 && (
        <div css={editArea}>
          <div css={addArea}>
            <Button
              variant='secondary'
              size='xs'
              width={116}
              css={buttonStyle}
              onClick={handleOpenModal}
            >
              <BiPlus size={16} />
              직접입력
            </Button>
            <Button variant='accent' size='xs' width={116} css={buttonStyle}>
              <BiPlus size={16} />
              엑셀추가
            </Button>
          </div>
          <Button variant='neutral' size='xs' width={89} onClick={handleDelete}>
            삭제
          </Button>
        </div>
      )}
      <AnalysisTable
        attributes={attributes}
        analysis={normalizedData}
        mode={'write'}
        selectedItems={selectedData}
        onUpload={handleOpenModal}
        onSelectChange={handleSelectChange}
      />
      <div css={PaginationArea}>
        <Pagination
          totalPage={totalPages}
          limit={pageSize}
          page={currentPage + 1}
          setPage={setPage}
        />
      </div>
      <TableModal />
      <Toast type={type} message={message} onClose={hideToast} isVisible={isToastVisible} />
    </div>
  );
};

const dailyStyle = css`
  width: 100%;
`;

const addArea = css`
  display: flex;
  gap: 8px;
`;

const editArea = css`
  display: flex;
  justify-content: space-between;
`;

const buttonStyle = css`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const PaginationArea = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  margin-top: 40px;
`;
export default DailyAnalysis;
