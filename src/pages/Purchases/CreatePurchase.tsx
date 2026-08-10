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
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { sparePartApi } from '../../api/sparePartApi';
import { purchaseApi } from '../../api/purchaseApi';
import { SparePart } from '../../types/sparePart';
import { PaymentMethod } from '../../types/purchase';
import { formatCurrency } from '../../utils/currency';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

interface SelectedPurchaseItem {
  productId: string;
  partNumber: string;
  spareName: string;
  availableStock: number;
  quantity: number;
  purchasePrice: number;
  amount: number;
}

export const CreatePurchase: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [supplierName, setSupplierName] = useState('');
  const [supplierMobile, setSupplierMobile] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [selectedSpare, setSelectedSpare] = useState<SparePart | null>(null);

  const [items, setItems] = useState<SelectedPurchaseItem[]>([]);

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

    const existingIndex = items.findIndex((i) => i.productId === spare._id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].amount = updated[existingIndex].quantity * updated[existingIndex].purchasePrice;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: spare._id,
          partNumber: spare.partNumber,
          spareName: spare.name,
          availableStock: spare.currentStock,
          quantity: 1,
          purchasePrice: spare.purchasePrice,
          amount: spare.purchasePrice,
        },
      ]);
    }
    setSelectedSpare(null);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty || 1);
    const updated = [...items];
    updated[index].quantity = validQty;
    updated[index].amount = validQty * updated[index].purchasePrice;
    setItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const validPrice = Math.max(0, price || 0);
    const updated = [...items];
    updated[index].purchasePrice = validPrice;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('Please enter Supplier Name.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one spare part to the purchase.');
      return;
    }

    if (numPaid > grandTotal) {
      setError(`Paid amount (${formatCurrency(numPaid)}) cannot exceed grand total (${formatCurrency(grandTotal)}).`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await purchaseApi.create({
        supplierName: supplierName.trim(),
        supplierMobile: supplierMobile.trim(),
        supplierInvoiceNumber: supplierInvoiceNumber.trim(),
        purchaseDate,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          purchasePrice: i.purchasePrice,
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
          message: 'Purchase saved and inventory stock updated successfully!',
          severity: 'success',
        })
      );

      navigate('/purchases');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save purchase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/purchases')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          New Purchase Order (Stock In)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Supplier Info Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Supplier Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Supplier Name *"
                fullWidth
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. ABC Machine Spares"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Supplier Mobile"
                fullWidth
                value={supplierMobile}
                onChange={(e) => setSupplierMobile(e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Supplier Invoice Number"
                fullWidth
                value={supplierInvoiceNumber}
                onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-1025"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Purchase Date"
                type="date"
                fullWidth
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Notes / Remarks"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional purchase details or delivery notes"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Spare Parts Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Spare Parts Selection
          </Typography>

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
            <Autocomplete
              options={spareParts}
              getOptionLabel={(option) => `${option.partNumber} - ${option.name} (${option.category})`}
              value={selectedSpare}
              onChange={(_, newValue) => setSelectedSpare(newValue)}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Search Spare Part by Part No / Name / Category" placeholder="Type to search..." />
              )}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddSparePart(selectedSpare)}
              disabled={!selectedSpare}
              sx={{ whiteSpace: 'nowrap', px: 3, height: 56, width: { xs: '100%', sm: 'auto' } }}
            >
              Add Item
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ minWidth: 700 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Spare Name</TableCell>
                  <TableCell align="center">Current Stock</TableCell>
                  <TableCell align="center" width="140">
                    Quantity
                  </TableCell>
                  <TableCell align="right" width="160">
                    Purchase Price (₹)
                  </TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No spare parts added yet. Search above and click <strong>Add Item</strong>.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <TableRow key={item.productId}>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {item.partNumber}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.spareName}</TableCell>
                      <TableCell align="center">{item.availableStock}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.purchasePrice}
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

      {/* Calculations & Payment Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Payment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Paid Amount (₹)"
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
                    <MenuItem value="UPI">UPI / Online</MenuItem>
                    <MenuItem value="CARD">Debit / Credit Card</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Payment Reference / Cheque No"
                    fullWidth
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Optional reference number"
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
                Bill Summary
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
                <Typography color="text.secondary">Tax (₹):</Typography>
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
                <Typography color="text.secondary">Paid Amount:</Typography>
                <Typography fontWeight={600} color="success.main">
                  {formatCurrency(numPaid)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="text.secondary">Pending Amount:</Typography>
                <Typography fontWeight={700} color={pendingAmount > 0 ? 'error.main' : 'text.primary'}>
                  {formatCurrency(pendingAmount)}
                </Typography>
              </Box>

              <Box display="flex" gap={2} mt={3}>
                <Button fullWidth variant="outlined" color="inherit" onClick={() => navigate('/purchases')}>
                  Cancel
                </Button>
                <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Purchase'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
