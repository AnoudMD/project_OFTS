import { useMemo, useState } from 'react';
import {
  Batch,
  CertificationStatus,
  ScanHistoryItem,
  SupplyChainEvent,
} from '../types/traceability';
import { initialBatches, initialScanHistory } from '../data/mockData';

export const useMockStore = () => {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(initialScanHistory);
  const [loading, setLoading] = useState(false);

  const addBatch = (batch: Batch) => {
    setBatches((prev) => [batch, ...prev]);
  };

  const updateBatchStatus = (batchId: string, status: CertificationStatus) => {
    setBatches((prev) =>
      prev.map((batch) =>
        batch.batchId === batchId
          ? {
              ...batch,
              certificationStatus: status,
              status: status === 'Certified Organic' ? 'Approved' : batch.status,
            }
          : batch,
      ),
    );
  };

  const addSupplyChainEvent = (event: SupplyChainEvent) => {
    setBatches((prev) =>
      prev.map((batch) =>
        batch.batchId === event.batchId
          ? { ...batch, events: [...batch.events, event] }
          : batch,
      ),
    );
  };

  const addScanHistory = (item: ScanHistoryItem) => {
    setScanHistory((prev) => [item, ...prev.filter((h) => h.batchId !== item.batchId)]);
  };

  const findBatchById = (batchId: string) =>
    batches.find((batch) => batch.batchId.toLowerCase() === batchId.toLowerCase());

  const value = useMemo(
    () => ({
      batches,
      scanHistory,
      loading,
      setLoading,
      addBatch,
      updateBatchStatus,
      addSupplyChainEvent,
      addScanHistory,
      findBatchById,
    }),
    [batches, scanHistory, loading],
  );

  return value;
};
