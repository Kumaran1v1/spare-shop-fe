import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { dashboardApi } from '../../api/dashboardApi';
import { DashboardData } from '../../types/dashboard';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { PaymentStatusChip } from '../../components/common/StatusChip';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getSummary();
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button onClick={fetchDashboard}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  const summary = data?.summary;

  const statCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(summary?.todaySales),
      icon: <TrendingUpIcon color="primary" fontSize="large" />,
      color: '#3b82f6',
      link: '/sales',
    },
    {
      title: "Today's Purchase",
      value: formatCurrency(summary?.todayPurchase),
      icon: <ShoppingBagIcon color="secondary" fontSize="large" />,
      color: '#10b981',
      link: '/purchases',
    },
    {
      title: "Today's Collection",
      value: formatCurrency(summary?.todayCollection),
      icon: <AccountBalanceWalletIcon sx={{ color: '#06b6d4' }} fontSize="large" />,
      color: '#06b6d4',
      link: '/sales',
    },
    {
      title: 'Customer Pending',
      value: formatCurrency(summary?.customerPending),
      icon: <PeopleIcon sx={{ color: '#ef4444' }} fontSize="large" />,
      color: '#ef4444',
      link: '/pending-payments',
    },
    {
      title: 'Supplier Pending',
      value: formatCurrency(summary?.supplierPending),
      icon: <LocalShippingIcon sx={{ color: '#f59e0b' }} fontSize="large" />,
      color: '#f59e0b',
      link: '/pending-payments',
    },
    {
      title: 'Total Spare Parts',
      value: summary?.totalSpareParts || 0,
      icon: <PrecisionManufacturingIcon color="action" fontSize="large" />,
      color: '#8b5cf6',
      link: '/spare-parts',
    },
    {
      title: 'Low Stock Alerts',
      value: summary?.lowStockCount || 0,
      icon: <WarningAmberIcon sx={{ color: '#f97316' }} fontSize="large" />,
      color: '#f97316',
      link: '/spare-parts',
    },
  ];

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
          Dashboard Summary
        </Typography>
        <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/purchases/new')}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            + New Purchase
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/sales/new')}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            + New Sale Bill
          </Button>
        </Box>
      </Box>

      {/* Summary Analytics Cards */}
      <Grid container spacing={2} mb={4}>
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
            <Card
              onClick={() => navigate(card.link)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {card.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${card.color}15`, p: 1, width: 48, height: 48 }}>
                  {card.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Sales Table */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Sales Bills
                </Typography>
                <Button size="small" onClick={() => navigate('/sales')}>
                  View All
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill No</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.recentSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No recent sales bills found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.recentSales.map((sale: any) => (
                        <TableRow
                          key={sale._id}
                          hover
                          onClick={() => navigate(`/sales/${sale._id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{sale.billNumber}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{formatDate(sale.createdAt)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(sale.grandTotal)}
                          </TableCell>
                          <TableCell align="center">
                            <PaymentStatusChip status={sale.paymentStatus} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Spares List */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  Low Stock Spares Alert
                </Typography>
                <Button size="small" onClick={() => navigate('/spare-parts')}>
                  View Master
                </Button>
              </Box>

              {data?.lowStockSpares.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" py={4}>
                  🎉 All spare parts have sufficient stock!
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Part No</TableCell>
                        <TableCell>Spare Name</TableCell>
                        <TableCell align="center">Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.lowStockSpares.map((spare: any) => (
                        <TableRow key={spare._id}>
                          <TableCell sx={{ fontWeight: 600 }}>{spare.partNumber}</TableCell>
                          <TableCell>{spare.name}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${spare.currentStock} / ${spare.minimumStock} min`}
                              color={spare.currentStock === 0 ? 'error' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
