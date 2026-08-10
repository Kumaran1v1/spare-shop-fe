import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SparePart, CreateSparePartPayload } from '../../types/sparePart';

interface SparePartModalProps {
  open: boolean;
  sparePart?: SparePart | null;
  onClose: () => void;
  onSubmit: (data: CreateSparePartPayload) => Promise<void>;
}

export const SparePartModal: React.FC<SparePartModalProps> = ({
  open,
  sparePart,
  onClose,
  onSubmit,
}) => {
  const [partNumber, setPartNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [machineType, setMachineType] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [minimumStock, setMinimumStock] = useState<number | ''>(5);
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (sparePart) {
        setPartNumber(sparePart.partNumber || '');
        setName(sparePart.name || '');
        setCategory(sparePart.category || '');
        setBrand(sparePart.brand || '');
        setMachineType(sparePart.machineType || '');
        setUnit(sparePart.unit || 'Nos');
        setPurchasePrice(sparePart.purchasePrice || 0);
        setSellingPrice(sparePart.sellingPrice || 0);
        setMinimumStock(sparePart.minimumStock || 0);
        setImage(sparePart.image || '');
      } else {
        setPartNumber('');
        setName('');
        setCategory('');
        setBrand('');
        setMachineType('');
        setUnit('Nos');
        setPurchasePrice('');
        setSellingPrice('');
        setMinimumStock(5);
        setImage('');
      }
      setError('');
    }
  }, [open, sparePart]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNumber.trim() || !name.trim() || !category.trim() || !unit.trim()) {
      setError('Please fill in all required fields (Part No, Name, Category, Unit).');
      return;
    }

    if (purchasePrice === '' || purchasePrice < 0) {
      setError('Purchase price must be a valid positive number.');
      return;
    }

    if (sellingPrice === '' || sellingPrice < 0) {
      setError('Selling price must be a valid positive number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        partNumber: partNumber.trim(),
        name: name.trim(),
        category: category.trim(),
        brand: brand.trim(),
        machineType: machineType.trim(),
        unit: unit.trim(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        minimumStock: Number(minimumStock) || 0,
        image,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save spare part.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {sparePart ? 'Edit Machine Spare Part' : 'Add New Spare Part'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {sparePart && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Current Stock: <strong>{sparePart.currentStock} {sparePart.unit}</strong> (Stock changes automatically through Purchases & Sales).
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Spare Part Image Upload Section */}
            <Grid item xs={12} display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
              <Avatar
                src={image}
                variant="rounded"
                sx={{ width: 80, height: 80, border: '1px solid #ccc' }}
              >
                ⚙️
              </Avatar>
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  size="small"
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                  />
                </Button>
                {image && (
                  <IconButton color="error" onClick={handleRemoveImage} size="small" sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                )}
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Supports JPG, PNG, WEBP (Max 2MB)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Part Number *"
                fullWidth
                required
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. MF-CL-001"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Spare Part Name *"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clutch Plate"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Category *"
                fullWidth
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Clutch, Engine, Hydraulic"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Brand"
                fullWidth
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Mahindra, Swaraj, JCB"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Machine Type"
                fullWidth
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                placeholder="e.g. Harvester, Tractor, JCB"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Unit *"
                fullWidth
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Nos, Set, Kg"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Purchase Price (₹) *"
                type="number"
                fullWidth
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Selling Price (₹) *"
                type="number"
                fullWidth
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Minimum Alert Stock"
                type="number"
                fullWidth
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value === '' ? '' : Number(e.target.value))}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Saving...' : sparePart ? 'Update Spare Part' : 'Save Spare Part'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
