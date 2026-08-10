import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import PrintIcon from '@mui/icons-material/Print';

import { saleApi } from '../../api/saleApi';
import { Sale } from '../../types/sale';
import { PaymentStatusChip } from '../../components/common/StatusChip';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { PaymentModal } from '../../components/dialogs/PaymentModal';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchSaleDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await saleApi.getById(id);
      setSale(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales bill details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const handleProcessPayment = async (data: any) => {
    if (!id) return;
    await saleApi.receivePayment(id, data);
    dispatch(showSnackbar({ message: 'Customer payment received successfully!', severity: 'success' }));
    fetchSaleDetails();
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
      <Alert severity="error" action={<Button onClick={() => navigate('/sales')}>Back to List</Button>}>
        {error || 'Sales bill record not found.'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/sales')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Bill: {sale.billNumber}
          </Typography>
          <PaymentStatusChip status={sale.paymentStatus} />
        </Box>

        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => navigate(`/sales/${sale._id}/print`)}
          >
            Print Bill
          </Button>
          {sale.pendingAmount > 0 && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentModalOpen(true)}
            >
              Receive Payment
            </Button>
          )}
        </Box>
      </Box>

      {/* Customer & Header Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Customer Name:
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {sale.customerName}
              </Typography>
              {sale.customerMobile && (
                <Typography variant="body2" color="text.secondary">
                  📞 {sale.customerMobile}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Bill Date:
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {formatDate(sale.saleDate)}
              </Typography>
              {sale.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {sale.notes}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Payment Summary:
              </Typography>
              <Typography variant="body2">
                Grand Total: <strong>{formatCurrency(sale.grandTotal)}</strong>
              </Typography>
              <Typography variant="body2" color="success.main">
                Total Paid: <strong>{formatCurrency(sale.paidAmount)}</strong>
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight={700}>
                Pending Balance: <strong>{formatCurrency(sale.pendingAmount)}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Billed Items Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Billed Spare Parts
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Spare Part Name</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Selling Price</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sale.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {item.partNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.spareName}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.sellingPrice)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Customer Payment Ledger History */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Customer Payment History Ledger
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Amount Received</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference No</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!sale.payments || sale.payments.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No payments recorded yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sale.payments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{formatDateTime(p.createdAt || p.paymentDate)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell>{p.referenceNumber || '-'}</TableCell>
                      <TableCell>{p.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {sale && (
        <PaymentModal
          open={paymentModalOpen}
          type="CUSTOMER"
          referenceId={sale._id}
          referenceNumber={sale.billNumber}
          name={sale.customerName}
          pendingAmount={sale.pendingAmount}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleProcessPayment}
        />
      )}
    </Box>
  );
};
