import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { formatCurrency } from '../../utils/currency';
import { PaymentMethod } from '../../types/purchase';

interface PaymentModalProps {
  open: boolean;
  type: 'CUSTOMER' | 'SUPPLIER';
  referenceId: string;
  referenceNumber: string; // Bill No or Purchase No
  name: string; // Customer Name or Supplier Name
  pendingAmount: number;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes: string;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  type,
  referenceNumber,
  name,
  pendingAmount,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [refNum, setRefNum] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setAmount(pendingAmount.toString());
      setPaymentMethod('CASH');
      setRefNum('');
      setNotes('');
      setError('');
    }
  }, [open, pendingAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    if (numericAmount > pendingAmount) {
      setError(`Payment cannot be greater than pending amount (${formatCurrency(pendingAmount)}).`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        amount: numericAmount,
        paymentMethod,
        referenceNumber: refNum,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {type === 'CUSTOMER' ? 'Receive Customer Payment' : 'Pay Supplier Pending'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {type === 'CUSTOMER' ? 'Bill Number:' : 'Purchase Number:'}
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {referenceNumber}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {type === 'CUSTOMER' ? 'Customer:' : 'Supplier:'}
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {name}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Pending Amount:
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight={700}>
                  {formatCurrency(pendingAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Amount (₹)"
                type="number"
                fullWidth
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: 0.01, step: 'any', max: pendingAmount }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Payment Method"
                fullWidth
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI / GPay / PhonePe</MenuItem>
                <MenuItem value="CARD">Debit / Credit Card</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer / NEFT</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reference Number (e.g. Transaction ID / Cheque No)"
                fullWidth
                value={refNum}
                onChange={(e) => setRefNum(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Processing...' : 'Save Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
