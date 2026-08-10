import React, { useEffect, useState } from 'react';
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
  Avatar,
  TablePagination,
  CircularProgress,
  Alert,
  Switch,
  Tooltip,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import { sparePartApi } from '../../api/sparePartApi';
import { SparePart, CreateSparePartPayload } from '../../types/sparePart';
import { StockStatusChip } from '../../components/common/StatusChip';
import { formatCurrency } from '../../utils/currency';
import { SparePartModal } from '../../components/dialogs/SparePartModal';
import { useAppDispatch } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const SpareParts: React.FC = () => {
  const [items, setItems] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpare, setSelectedSpare] = useState<SparePart | null>(null);

  const dispatch = useAppDispatch();

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await sparePartApi.getAll({
        search,
        page: page + 1,
        limit: rowsPerPage,
      });
      setItems(res.data || res.items || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load spare parts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpareParts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, rowsPerPage]);

  const handleOpenAddModal = () => {
    setSelectedSpare(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (spare: SparePart) => {
    setSelectedSpare(spare);
    setModalOpen(true);
  };

  const handleSaveSparePart = async (data: CreateSparePartPayload) => {
    if (selectedSpare) {
      await sparePartApi.update(selectedSpare._id, data);
      dispatch(showSnackbar({ message: 'Spare part updated successfully', severity: 'success' }));
    } else {
      await sparePartApi.create(data);
      dispatch(showSnackbar({ message: 'Spare part created successfully', severity: 'success' }));
    }
    fetchSpareParts();
  };

  const handleToggleStatus = async (spare: SparePart) => {
    try {
      await sparePartApi.toggleStatus(spare._id);
      dispatch(
        showSnackbar({
          message: `Status updated for ${spare.name}`,
          severity: 'info',
        })
      );
      fetchSpareParts();
    } catch (err: any) {
      dispatch(showSnackbar({ message: 'Failed to update status', severity: 'error' }));
    }
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
          Machine Spare Parts Master
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Spare Part
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search by Part Number, Spare Name, Category, Brand, Machine Type..."
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
        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none', minWidth: 900 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Part Number</TableCell>
                <TableCell>Spare Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand / Machine</TableCell>
                <TableCell align="right">Purchase Price</TableCell>
                <TableCell align="right">Selling Price</TableCell>
                <TableCell align="center">Current Stock</TableCell>
                <TableCell align="center">Stock Status</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No machine spare parts found. Click <strong>+ Add Spare Part</strong> to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((spare) => (
                  <TableRow key={spare._id} hover>
                    <TableCell>
                      <Avatar src={spare.image} variant="rounded" sx={{ width: 44, height: 44 }}>
                        ⚙️
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {spare.partNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{spare.name}</TableCell>
                    <TableCell>{spare.category}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{spare.brand || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {spare.machineType || ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(spare.purchasePrice)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(spare.sellingPrice)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      {spare.currentStock} {spare.unit}
                    </TableCell>
                    <TableCell align="center">
                      <StockStatusChip
                        currentStock={spare.currentStock}
                        minimumStock={spare.minimumStock}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={spare.isActive ? 'Deactivate' : 'Activate'}>
                        <Switch
                          checked={spare.isActive}
                          onChange={() => handleToggleStatus(spare)}
                          size="small"
                          color="primary"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Spare Part">
                        <IconButton color="primary" onClick={() => handleOpenEditModal(spare)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

      <SparePartModal
        open={modalOpen}
        sparePart={selectedSpare}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveSparePart}
      />
    </Box>
  );
};
