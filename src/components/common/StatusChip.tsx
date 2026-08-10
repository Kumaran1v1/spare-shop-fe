import React from 'react';
import { Chip } from '@mui/material';

interface StockStatusChipProps {
  currentStock: number;
  minimumStock: number;
}

export const StockStatusChip: React.FC<StockStatusChipProps> = ({ currentStock, minimumStock }) => {
  if (currentStock === 0) {
    return <Chip label="OUT OF STOCK" color="error" size="small" sx={{ fontWeight: 600 }} />;
  }
  if (currentStock <= minimumStock) {
    return <Chip label="LOW STOCK" color="warning" size="small" sx={{ fontWeight: 600 }} />;
  }
  return <Chip label="IN STOCK" color="success" size="small" sx={{ fontWeight: 600 }} />;
};

interface PaymentStatusChipProps {
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
}

export const PaymentStatusChip: React.FC<PaymentStatusChipProps> = ({ status }) => {
  switch (status) {
    case 'PAID':
      return <Chip label="PAID" color="success" size="small" sx={{ fontWeight: 600 }} />;
    case 'PARTIAL':
      return <Chip label="PARTIAL" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    case 'UNPAID':
      return <Chip label="UNPAID" color="error" size="small" sx={{ fontWeight: 600 }} />;
    default:
      return <Chip label={status} size="small" />;
  }
};
