import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';

import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { saleApi } from '../../api/saleApi';
import { Sale } from '../../types/sale';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export const PrintBill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      saleApi
        .getById(id)
        .then((res) => setSale(res.data))
        .catch((err) => setError(err.response?.data?.message || 'Failed to load bill.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleTriggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !sale) {
    return (
      <Alert severity="error" action={<Button onClick={() => navigate('/sales')}>Back</Button>}>
        {error || 'Bill not found.'}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#ffffff', color: '#000000', borderRadius: 2 }}>
      {/* Screen-only Action Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          '@media print': {
            display: 'none !important',
          },
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/sales/${sale._id}`)}>
          Back to Bill Details
        </Button>
        <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handleTriggerPrint}>
          Print Bill Now
        </Button>
      </Box>

      {/* Printable Invoice Header */}
      <Box textAlign="center" mb={3} sx={{ pb: 2, borderBottom: '2px solid #000' }}>
        <Typography variant="h4" fontWeight={800} letterSpacing={1}>
          MAHINDRA & GENERIC SPARE PARTS SHOP
        </Typography>
        <Typography variant="body2" sx={{ color: '#444' }}>
          Authorized Dealers in Machine & Heavy Tractor Spare Parts
        </Typography>
        <Typography variant="body2" sx={{ color: '#444' }}>
          Main Road, Industrial Area • Mobile: +91 98765 43210 / 91234 56789
        </Typography>
      </Box>

      {/* Bill & Customer Metadata */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            CUSTOMER DETAILS:
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {sale.customerName}
          </Typography>
          {sale.customerMobile && (
            <Typography variant="body2">Mobile: {sale.customerMobile}</Typography>
          )}
        </Box>
        <Box textAlign="right">
          <Typography variant="subtitle2" color="text.secondary">
            INVOICE / BILL DETAILS:
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
            {sale.billNumber}
          </Typography>
          <Typography variant="body2">Date: {formatDate(sale.saleDate)}</Typography>
          <Typography variant="body2" fontWeight={600} color={sale.paymentStatus === 'PAID' ? 'success.main' : 'error.main'}>
            Status: {sale.paymentStatus}
          </Typography>
        </Box>
      </Box>

      {/* Billed Items Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, border: '1px solid #000' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ color: '#000', fontWeight: 700 }}>S.No</TableCell>
              <TableCell sx={{ color: '#000', fontWeight: 700 }}>Part Number</TableCell>
              <TableCell sx={{ color: '#000', fontWeight: 700 }}>Spare Part Description</TableCell>
              <TableCell align="center" sx={{ color: '#000', fontWeight: 700 }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ color: '#000', fontWeight: 700 }}>
                Price (₹)
              </TableCell>
              <TableCell align="right" sx={{ color: '#000', fontWeight: 700 }}>
                Amount (₹)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sale.items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {item.partNumber}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{item.spareName}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{item.sellingPrice.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {item.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Calculation Summary Footer */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box maxWidth={400}>
          {sale.notes && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
              Notes: {sale.notes}
            </Typography>
          )}
          <Typography variant="caption" display="block" mt={2} color="text.secondary">
            * Goods once sold will not be taken back or exchanged without valid receipt.
          </Typography>
        </Box>

        <Box width={260}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(sale.subtotal)}
            </Typography>
          </Box>

          {sale.discount > 0 && (
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2">Discount (-):</Typography>
              <Typography variant="body2">{formatCurrency(sale.discount)}</Typography>
            </Box>
          )}

          {sale.tax > 0 && (
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2">Tax (+):</Typography>
              <Typography variant="body2">{formatCurrency(sale.tax)}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 1, borderColor: '#000' }} />

          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="subtitle1" fontWeight={800}>
              Grand Total:
            </Typography>
            <Typography variant="subtitle1" fontWeight={800}>
              {formatCurrency(sale.grandTotal)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="success.main">
              Amount Paid:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(sale.paidAmount)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="error.main" fontWeight={700}>
              Pending Amount:
            </Typography>
            <Typography variant="body2" fontWeight={700} color="error.main">
              {formatCurrency(sale.pendingAmount)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Signature Section */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={6} pt={2}>
        <Box textAlign="center" width={200}>
          <Divider sx={{ mb: 1, borderColor: '#aaa' }} />
          <Typography variant="caption">Customer Signature</Typography>
        </Box>
        <Box textAlign="center" width={200}>
          <Typography variant="caption" display="block" mb={4}>
            For Machine Spare Parts Shop
          </Typography>
          <Divider sx={{ mb: 1, borderColor: '#aaa' }} />
          <Typography variant="caption">Authorized Signatory</Typography>
        </Box>
      </Box>
    </Box>
  );
};
