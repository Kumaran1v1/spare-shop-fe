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
  Chip,
  Switch,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  Tooltip,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';

import { userApi } from '../../api/userApi';
import { UserAccount, CreateUserPayload } from '../../types/user';
import { formatDate } from '../../utils/date';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { showSnackbar } from '../../store/uiSlice';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SHOP_OWNER' | 'USER'>('USER');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userApi.getAll();
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Empty unless changing password
    setRole(user.role);
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Please enter Name and Email.');
      return;
    }

    if (!selectedUser && (!password || password.length < 6)) {
      setFormError('Password is required and must be at least 6 characters.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      if (selectedUser) {
        const payload: any = { name, email, role };
        if (password) payload.password = password;
        await userApi.update(selectedUser._id, payload);
        dispatch(showSnackbar({ message: `User '${name}' updated successfully`, severity: 'success' }));
      } else {
        await userApi.create({ name, email, password, role });
        dispatch(showSnackbar({ message: `New user account '${name}' created successfully`, severity: 'success' }));
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save user account.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserAccount) => {
    if (user._id === currentUser?._id) {
      dispatch(showSnackbar({ message: 'You cannot deactivate your own logged-in admin account.', severity: 'warning' }));
      return;
    }

    try {
      await userApi.toggleStatus(user._id);
      dispatch(
        showSnackbar({
          message: `User account '${user.name}' ${user.isActive ? 'deactivated' : 'activated'}`,
          severity: 'info',
        })
      );
      fetchUsers();
    } catch (err: any) {
      dispatch(showSnackbar({ message: 'Failed to update user status', severity: 'error' }));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderRoleChip = (userRole: string) => {
    if (userRole === 'ADMIN') {
      return <Chip label="ADMINISTRATOR" color="primary" size="small" sx={{ fontWeight: 700 }} />;
    }
    if (userRole === 'SHOP_OWNER') {
      return (
        <Chip
          label="SHOP OWNER"
          color="secondary"
          size="small"
          sx={{ fontWeight: 700, bgcolor: '#8b5cf6', color: '#ffffff' }}
        />
      );
    }
    return <Chip label="SHOP STAFF" size="small" sx={{ fontWeight: 700, bgcolor: '#e2e8f0', color: '#334155' }} />;
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
        <Box display="flex" alignItems="center" gap={1.5}>
          <SecurityIcon color="primary" fontSize="large" />
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            User Accounts & Roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAddModal}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          + Create New User
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search by User Name, Email..."
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

      <Card>
        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none', minWidth: 650 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Role</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No user accounts found. Click <strong>+ Create New User</strong> to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">
                      {renderRoleChip(user.role)}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleToggleStatus(user)}
                          size="small"
                          color="primary"
                          disabled={user._id === currentUser?._id}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit User / Reset Password">
                        <IconButton color="primary" onClick={() => handleOpenEditModal(user)}>
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
      </Card>

      {/* User Create / Edit Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveUser}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {selectedUser ? `Edit User: ${selectedUser.name}` : 'Create New User Account'}
          </DialogTitle>
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shopowner@spares.com"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={selectedUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  type="password"
                  fullWidth
                  required={!selectedUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Role *"
                  fullWidth
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SHOP_OWNER' | 'USER')}
                >
                  <MenuItem value="USER">USER (Shop Staff)</MenuItem>
                  <MenuItem value="SHOP_OWNER">SHOP OWNER (Store Manager)</MenuItem>
                  <MenuItem value="ADMIN">ADMIN (System Administrator)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setModalOpen(false)} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
