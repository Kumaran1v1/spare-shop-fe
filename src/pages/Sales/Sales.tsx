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
import PrintIcon from '@mui/icons-material/Print';

import { saleApi } from '../../api/saleApi';
import { Sale } from '../../types/sale';
import { PaymentStatusChip } from '../../components/common/StatusChip';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { PaymentModal } from '../../components/dialogs/PaymentModal';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const Sales: React.FC = () => {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await saleApi.getAll({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setItems(res.data || res.items || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, rowsPerPage]);

  const handleOpenPaymentModal = (sale: Sale) => {
    setSelectedSale(sale);
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (data: any) => {
    if (!selectedSale) return;
    await saleApi.receivePayment(selectedSale._id, data);
    dispatch(showSnackbar({ message: 'Customer payment received successfully!', severity: 'success' }));
    fetchSales();
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
          Sales Bills & Billing Counter
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/sales/new')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          + New Sale Bill
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search by Bill Number, Customer Name, Mobile Number..."
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
                <TableCell>Bill Number</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Mobile Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Bill Total</TableCell>
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
                      No sales bills created yet. Click <strong>+ New Sale Bill</strong> to generate a bill.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((sale) => (
                  <TableRow key={sale._id} hover>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {sale.billNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{sale.customerName}</TableCell>
                    <TableCell>{sale.customerMobile || '-'}</TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(sale.grandTotal)}
                    </TableCell>
                    <TableCell align="right" color="success.main">
                      {formatCurrency(sale.paidAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: sale.pendingAmount > 0 ? 'error.main' : 'text.primary' }}>
                      {formatCurrency(sale.pendingAmount)}
                    </TableCell>
                    <TableCell align="center">
                      <PaymentStatusChip status={sale.paymentStatus} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Bill Details">
                        <IconButton color="primary" onClick={() => navigate(`/sales/${sale._id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Bill">
                        <IconButton color="default" onClick={() => navigate(`/sales/${sale._id}/print`)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {sale.pendingAmount > 0 && (
                        <Tooltip title="Receive Customer Payment">
                          <IconButton color="success" onClick={() => handleOpenPaymentModal(sale)}>
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

      {selectedSale && (
        <PaymentModal
          open={paymentModalOpen}
          type="CUSTOMER"
          referenceId={selectedSale._id}
          referenceNumber={selectedSale.billNumber}
          name={selectedSale.customerName}
          pendingAmount={selectedSale.pendingAmount}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleProcessPayment}
        />
      )}
    </Box>
  );
};
