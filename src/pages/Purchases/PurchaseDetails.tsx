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
  Divider,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';

import { purchaseApi } from '../../api/purchaseApi';
import { Purchase } from '../../types/purchase';
import { PaymentStatusChip } from '../../components/common/StatusChip';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { PaymentModal } from '../../components/dialogs/PaymentModal';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const PurchaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchPurchaseDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await purchaseApi.getById(id);
      setPurchase(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load purchase details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const handleProcessPayment = async (data: any) => {
    if (!id) return;
    await purchaseApi.payPending(id, data);
    dispatch(showSnackbar({ message: 'Supplier payment recorded successfully!', severity: 'success' }));
    fetchPurchaseDetails();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !purchase) {
    return (
      <Alert severity="error" action={<Button onClick={() => navigate('/purchases')}>Back to List</Button>}>
        {error || 'Purchase record not found.'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/purchases')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Purchase Order: {purchase.purchaseNumber}
          </Typography>
          <PaymentStatusChip status={purchase.paymentStatus} />
        </Box>

        {purchase.pendingAmount > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentModalOpen(true)}
          >
            Pay Pending Balance
          </Button>
        )}
      </Box>

      {/* Supplier & Header Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Supplier Name:
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {purchase.supplierName}
              </Typography>
              {purchase.supplierMobile && (
                <Typography variant="body2" color="text.secondary">
                  📞 {purchase.supplierMobile}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Purchase Date:
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {formatDate(purchase.purchaseDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoice No: {purchase.supplierInvoiceNumber || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Payment Breakdown:
              </Typography>
              <Typography variant="body2">
                Total: <strong>{formatCurrency(purchase.grandTotal)}</strong>
              </Typography>
              <Typography variant="body2" color="success.main">
                Paid: <strong>{formatCurrency(purchase.paidAmount)}</strong>
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight={700}>
                Pending: <strong>{formatCurrency(purchase.pendingAmount)}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Purchased Items Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Purchased Spare Parts
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Spare Part Name</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchase.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {item.partNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.spareName}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.purchasePrice)}</TableCell>
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

      {/* Supplier Payment Ledger History */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Supplier Payment History Ledger
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Amount Paid</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference No</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!purchase.payments || purchase.payments.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No payments recorded yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchase.payments.map((p) => (
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

      {purchase && (
        <PaymentModal
          open={paymentModalOpen}
          type="SUPPLIER"
          referenceId={purchase._id}
          referenceNumber={purchase.purchaseNumber}
          name={purchase.supplierName}
          pendingAmount={purchase.pendingAmount}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleProcessPayment}
        />
      )}
    </Box>
  );
};
