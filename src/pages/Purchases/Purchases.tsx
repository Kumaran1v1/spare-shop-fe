import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';

import { purchaseApi } from '../../api/purchaseApi';
import { Purchase } from '../../types/purchase';
import { PaymentStatusChip } from '../../components/common/StatusChip';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { PaymentModal } from '../../components/dialogs/PaymentModal';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const Purchases: React.FC = () => {
  const [items, setItems] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await purchaseApi.getAll({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setItems(res.data || res.items || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load purchase records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchases();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, rowsPerPage]);

  const handleOpenPaymentModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (data: any) => {
    if (!selectedPurchase) return;
    await purchaseApi.payPending(selectedPurchase._id, data);
    dispatch(showSnackbar({ message: 'Supplier payment recorded successfully!', severity: 'success' }));
    fetchPurchases();
  };

  return (
    <Box>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Purchase Orders & Stock Entry
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/purchases/new')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          + New Purchase
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search by Purchase Number, Supplier Name, Invoice Number..."
            fullWidth
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
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

      <Card>
        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none', minWidth: 850 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Purchase No</TableCell>
                <TableCell>Supplier Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Supplier Invoice</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Paid Amount</TableCell>
                <TableCell align="right">Pending Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No purchase records found. Click <strong>+ New Purchase</strong> to add stock from suppliers.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((purchase) => (
                  <TableRow key={purchase._id} hover>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {purchase.purchaseNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {purchase.supplierName}
                      {purchase.supplierMobile && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          📞 {purchase.supplierMobile}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                    <TableCell>{purchase.supplierInvoiceNumber || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(purchase.grandTotal)}
                    </TableCell>
                    <TableCell align="right" color="success.main">
                      {formatCurrency(purchase.paidAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: purchase.pendingAmount > 0 ? 'error.main' : 'text.primary' }}>
                      {formatCurrency(purchase.pendingAmount)}
                    </TableCell>
                    <TableCell align="center">
                      <PaymentStatusChip status={purchase.paymentStatus} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Purchase Details">
                        <IconButton color="primary" onClick={() => navigate(`/purchases/${purchase._id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {purchase.pendingAmount > 0 && (
                        <Tooltip title="Pay Supplier Pending">
                          <IconButton color="secondary" onClick={() => handleOpenPaymentModal(purchase)}>
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {selectedPurchase && (
        <PaymentModal
          open={paymentModalOpen}
          type="SUPPLIER"
          referenceId={selectedPurchase._id}
          referenceNumber={selectedPurchase.purchaseNumber}
          name={selectedPurchase.supplierName}
          pendingAmount={selectedPurchase.pendingAmount}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleProcessPayment}
        />
      )}
    </Box>
  );
};
