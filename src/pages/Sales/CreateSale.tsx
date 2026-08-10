import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Alert,
  Autocomplete,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';

import { sparePartApi } from '../../api/sparePartApi';
import { saleApi } from '../../api/saleApi';
import { SparePart } from '../../types/sparePart';
import { PaymentMethod } from '../../types/purchase';
import { formatCurrency } from '../../utils/currency';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

interface SelectedSaleItem {
  productId: string;
  partNumber: string;
  spareName: string;
  image?: string;
  availableStock: number;
  quantity: number;
  sellingPrice: number;
  amount: number;
}

export const CreateSale: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [selectedSpare, setSelectedSpare] = useState<SparePart | null>(null);

  const [items, setItems] = useState<SelectedSaleItem[]>([]);

  const [discount, setDiscount] = useState<number | ''>(0);
  const [tax, setTax] = useState<number | ''>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveSpareParts();
  }, []);

  const fetchActiveSpareParts = async () => {
    try {
      const res = await sparePartApi.getAll({ status: 'ACTIVE', limit: 100 });
      setSpareParts(res.data || res.items || []);
    } catch (err) {
      console.error('Failed to load spare parts list', err);
    }
  };

  const handleAddSparePart = (spare: SparePart | null) => {
    if (!spare) return;

    if (spare.currentStock <= 0) {
      setError(`Cannot add '${spare.name}'. Stock is OUT OF STOCK (0 available).`);
      return;
    }

    const existingIndex = items.findIndex((i) => i.productId === spare._id);
    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      if (currentQty + 1 > spare.currentStock) {
        setError(`Insufficient stock for '${spare.name}'. Available: ${spare.currentStock}, Requested: ${currentQty + 1}`);
        return;
      }
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].amount = updated[existingIndex].quantity * updated[existingIndex].sellingPrice;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: spare._id,
          partNumber: spare.partNumber,
          spareName: spare.name,
          image: spare.image,
          availableStock: spare.currentStock,
          quantity: 1,
          sellingPrice: spare.sellingPrice,
          amount: spare.sellingPrice,
        },
      ]);
    }
    setError('');
    setSelectedSpare(null);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const item = items[index];
    const requestedQty = qty || 1;

    if (requestedQty > item.availableStock) {
      setError(`Insufficient stock for '${item.spareName}'. Available: ${item.availableStock}, Requested: ${requestedQty}`);
      return;
    }

    setError('');
    const updated = [...items];
    updated[index].quantity = requestedQty;
    updated[index].amount = requestedQty * updated[index].sellingPrice;
    setItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const validPrice = Math.max(0, price || 0);
    const updated = [...items];
    updated[index].sellingPrice = validPrice;
    updated[index].amount = updated[index].quantity * validPrice;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const numDiscount = Number(discount) || 0;
  const numTax = Number(tax) || 0;
  const grandTotal = Math.max(0, subtotal - numDiscount + numTax);
  const numPaid = Number(paidAmount) || 0;
  const pendingAmount = Math.max(0, grandTotal - numPaid);

  const handleSaveBill = async (shouldPrint: boolean = false) => {
    if (!customerName.trim()) {
      setError('Please enter Customer Name.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one spare part to the bill.');
      return;
    }

    if (numPaid > grandTotal) {
      setError(`Paid amount (${formatCurrency(numPaid)}) cannot exceed bill total (${formatCurrency(grandTotal)}).`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await saleApi.create({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        saleDate,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          sellingPrice: i.sellingPrice,
        })),
        discount: numDiscount,
        tax: numTax,
        paidAmount: numPaid,
        paymentMethod,
        referenceNumber,
        notes,
      });

      dispatch(
        showSnackbar({
          message: 'Sales bill created and stock updated successfully!',
          severity: 'success',
        })
      );

      const createdSale = res.data;
      if (shouldPrint && createdSale?._id) {
        navigate(`/sales/${createdSale._id}/print`);
      } else {
        navigate('/sales');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sales bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveBill(false); }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/sales')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          New Sales Bill (Counter Billing)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Customer Info Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Customer Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Customer Name *"
                fullWidth
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Kumar Machine Works"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Mobile Number"
                fullWidth
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Sale Date"
                type="date"
                fullWidth
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes / Instructions"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional customer notes or machine vehicle number"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search & Add Spare Parts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Select Spare Parts
          </Typography>

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
            <Autocomplete
              options={spareParts}
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name} (Stock: ${option.currentStock} ${option.unit} | ₹${option.sellingPrice})`
              }
              value={selectedSpare}
              onChange={(_, newValue) => setSelectedSpare(newValue)}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Search Spare Name / Part Number / Category / Machine" placeholder="Type spare part..." />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Box display="flex" alignItems="center" gap={1.5} width="100%">
                    <Avatar src={option.image} variant="rounded" sx={{ width: 36, height: 36 }}>
                      ⚙️
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {option.name} <span style={{ fontFamily: 'monospace', color: '#666' }}>({option.partNumber})</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category} • {option.brand || 'Generic'}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        {formatCurrency(option.sellingPrice)}
                      </Typography>
                      <Chip
                        label={`Stock: ${option.currentStock}`}
                        color={option.currentStock === 0 ? 'error' : option.currentStock <= option.minimumStock ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </li>
              )}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddSparePart(selectedSpare)}
              disabled={!selectedSpare}
              sx={{ whiteSpace: 'nowrap', px: 3, height: 56, width: { xs: '100%', sm: 'auto' } }}
            >
              Add to Bill
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ minWidth: 700 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Spare Part</TableCell>
                  <TableCell align="center">Available Stock</TableCell>
                  <TableCell align="center" width="140">
                    Quantity
                  </TableCell>
                  <TableCell align="right" width="160">
                    Selling Price (₹)
                  </TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No spare parts added to bill. Search above and click <strong>Add to Bill</strong>.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.spareName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {item.partNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${item.availableStock} in stock`}
                          color={item.availableStock < item.quantity ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          inputProps={{ min: 1, max: item.availableStock, style: { textAlign: 'center' } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.sellingPrice}
                          onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value))}
                          inputProps={{ min: 0, style: { textAlign: 'right' } }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="error" size="small" onClick={() => handleRemoveItem(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Bill Totals & Payment Entry */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Payment Collection
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Collected / Advance Amount (₹)"
                    type="number"
                    fullWidth
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Payment Method"
                    fullWidth
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="UPI">UPI / GPay / PhonePe</MenuItem>
                    <MenuItem value="CARD">Debit / Credit Card</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Transaction Reference Number"
                    fullWidth
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UPI Ref / Cheque No"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Bill Calculations
              </Typography>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Subtotal:</Typography>
                <Typography fontWeight={600}>{formatCurrency(subtotal)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography color="text.secondary">Discount (₹):</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, style: { textAlign: 'right' } }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography color="text.secondary">Tax / GST (₹):</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={tax}
                  onChange={(e) => setTax(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, style: { textAlign: 'right' } }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6" fontWeight={700}>
                  Grand Total:
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatCurrency(grandTotal)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Collected Amount:</Typography>
                <Typography fontWeight={600} color="success.main">
                  {formatCurrency(numPaid)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="text.secondary">Pending Balance:</Typography>
                <Typography fontWeight={700} color={pendingAmount > 0 ? 'error.main' : 'text.primary'}>
                  {formatCurrency(pendingAmount)}
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={1.5} mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PrintIcon />}
                  onClick={() => handleSaveBill(true)}
                  disabled={loading}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  {loading ? 'Processing...' : 'SAVE & PRINT BILL'}
                </Button>
                <Button fullWidth variant="outlined" color="inherit" onClick={() => navigate('/sales')}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
