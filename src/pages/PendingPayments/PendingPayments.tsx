import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';

import { paymentApi } from '../../api/paymentApi';
import { saleApi } from '../../api/saleApi';
import { purchaseApi } from '../../api/purchaseApi';
import { PendingCustomerBill, PendingSupplierPurchase } from '../../types/payment';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { PaymentModal } from '../../components/dialogs/PaymentModal';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const PendingPayments: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [customerPending, setCustomerPending] = useState<PendingCustomerBill[]>([]);
  const [supplierPending, setSupplierPending] = useState<PendingSupplierPurchase[]>([]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{
    type: 'CUSTOMER' | 'SUPPLIER';
    id: string;
    refNo: string;
    name: string;
    pending: number;
  } | null>(null);

  const dispatch = useAppDispatch();

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await paymentApi.getPendingPayments({ search });
      setCustomerPending(res.data.customerPending || []);
      setSupplierPending(res.data.supplierPending || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendingPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCustomerPayment = (bill: PendingCustomerBill) => {
    setSelectedRecord({
      type: 'CUSTOMER',
      id: bill._id,
      refNo: bill.billNumber,
      name: bill.customerName,
      pending: bill.pendingAmount,
    });
    setPaymentModalOpen(true);
  };

  const handleOpenSupplierPayment = (pur: PendingSupplierPurchase) => {
    setSelectedRecord({
      type: 'SUPPLIER',
      id: pur._id,
      refNo: pur.purchaseNumber,
      name: pur.supplierName,
      pending: pur.pendingAmount,
    });
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (data: any) => {
    if (!selectedRecord) return;

    if (selectedRecord.type === 'CUSTOMER') {
      await saleApi.receivePayment(selectedRecord.id, data);
      dispatch(showSnackbar({ message: 'Customer payment received successfully!', severity: 'success' }));
    } else {
      await purchaseApi.payPending(selectedRecord.id, data);
      dispatch(showSnackbar({ message: 'Supplier payment recorded successfully!', severity: 'success' }));
    }

    fetchPendingPayments();
  };

  const totalCustomerPending = customerPending.reduce((sum, item) => sum + item.pendingAmount, 0);
  const totalSupplierPending = supplierPending.reduce((sum, item) => sum + item.pendingAmount, 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Pending Payments Management
        </Typography>
      </Box>

      {/* Dual Tab Switcher Header */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              label={`Customer Pending (${customerPending.length}) - ${formatCurrency(totalCustomerPending)}`}
              sx={{ fontWeight: 600 }}
            />
            <Tab
              label={`Supplier Pending (${supplierPending.length}) - ${formatCurrency(totalSupplierPending)}`}
              sx={{ fontWeight: 600 }}
            />
          </Tabs>
        </Box>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder={
              tabIndex === 0
                ? 'Search by Customer Name, Mobile, Bill Number...'
                : 'Search by Supplier Name, Mobile, Purchase Number...'
            }
            fullWidth
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* TAB 1: Customer Pending Balances */}
      {tabIndex === 0 && (
        <Card>
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none', minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill Number</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Bill Date</TableCell>
                  <TableCell align="right">Bill Total</TableCell>
                  <TableCell align="right">Paid Amount</TableCell>
                  <TableCell align="right">Pending Balance</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : customerPending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        🎉 Great! No pending customer payments found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  customerPending.map((bill) => (
                    <TableRow key={bill._id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {bill.billNumber}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{bill.customerName}</TableCell>
                      <TableCell>{bill.customerMobile || '-'}</TableCell>
                      <TableCell>{formatDate(bill.saleDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(bill.grandTotal)}</TableCell>
                      <TableCell align="right" color="success.main">
                        {formatCurrency(bill.paidAmount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {formatCurrency(bill.pendingAmount)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<PaymentIcon />}
                          onClick={() => handleOpenCustomerPayment(bill)}
                        >
                          Receive Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 2: Supplier Pending Balances */}
      {tabIndex === 1 && (
        <Card>
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none', minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Purchase Number</TableCell>
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Purchase Date</TableCell>
                  <TableCell align="right">Purchase Total</TableCell>
                  <TableCell align="right">Paid Amount</TableCell>
                  <TableCell align="right">Pending Balance</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : supplierPending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        🎉 All supplier purchases are fully paid!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  supplierPending.map((pur) => (
                    <TableRow key={pur._id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {pur.purchaseNumber}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{pur.supplierName}</TableCell>
                      <TableCell>{pur.supplierMobile || '-'}</TableCell>
                      <TableCell>{formatDate(pur.purchaseDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(pur.grandTotal)}</TableCell>
                      <TableCell align="right" color="success.main">
                        {formatCurrency(pur.paidAmount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {formatCurrency(pur.pendingAmount)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          startIcon={<PaymentIcon />}
                          onClick={() => handleOpenSupplierPayment(pur)}
                        >
                          Pay Supplier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {selectedRecord && (
        <PaymentModal
          open={paymentModalOpen}
          type={selectedRecord.type}
          referenceId={selectedRecord.id}
          referenceNumber={selectedRecord.refNo}
          name={selectedRecord.name}
          pendingAmount={selectedRecord.pending}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleProcessPayment}
        />
      )}
    </Box>
  );
};
