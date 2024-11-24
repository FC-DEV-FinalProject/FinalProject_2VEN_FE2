import { useState, useEffect } from 'react';

import { css } from '@emotion/react';
import { BiPlus } from 'react-icons/bi';

import AnalysisTable, { AnalysisProps, AnalysisDataProps } from '../table/AnalysisTable';
import InputTable, { InputTableProps } from '../table/InputTable';
import TableModal from '../table/TableModal';

import { fetchDailyAnalysis } from '@/api/strategyDetail';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import useTableModalStore from '@/stores/tableModalStore';

const DailyAnalysis = ({ strategyId, attributes }: AnalysisProps) => {
  const [tableData, setTableData] = useState<InputTableProps[]>([]);
  const [paginatedData, setPaginatedData] = useState({
    currentPage: 1,
    totalPage: 0,
    totalElements: 0,
    pageSize: 5,
  });
  const [analysis, setAnalysis] = useState<AnalysisDataProps[]>([]);
  const { openTableModal } = useTableModalStore();

  const handleOpenModal = () => {
    const initalData = Array(5).fill({ date: '', trade: '', day: '' });
    openTableModal({
      type: 'insert',
      title: '일간분석 데이터 직접 입력',
      data: <InputTable data={initalData} onChange={handleInputChange} />,
      onAction: handleSaveData,
    });
  };

  const handleInputChange = (updatedData: InputTableProps[]) => {
    setTableData(updatedData);
  };

  const handleSaveData = () => {
    setTableData((prevData) => {
      const updatedData = [...prevData, ...tableData];
      return updatedData;
    });
  };

  const handleChangePage = async (newPage: number) => {
    setPaginatedData((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchDailyAnalysis(
        Number(strategyId),
        paginatedData.currentPage,
        paginatedData.pageSize
      );
      setAnalysis(res.data);
      setPaginatedData((prev) => ({
        ...prev,
        totalPage: res.totalPages,
        totalElements: res.totalItems,
      }));
    };
    fetchData();
  }, [strategyId, paginatedData.currentPage, paginatedData.pageSize]);

  return (
    <div css={dailyStyle}>
      {analysis.length > 0 && (
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
          <Button variant='neutral' size='xs' width={89}>
            삭제
          </Button>
        </div>
      )}
      <AnalysisTable
        attributes={attributes}
        analysis={analysis}
        mode={'write'}
        onUpload={handleOpenModal}
      />
      <Pagination
        totalPage={paginatedData.totalPage}
        limit={paginatedData.pageSize}
        page={paginatedData.currentPage}
        setPage={handleChangePage}
      />
      <TableModal />
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
export default DailyAnalysis;
