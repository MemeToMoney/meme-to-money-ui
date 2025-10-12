'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as EarningsIcon,
  Send as SendIcon,
  Download as GetAppIcon,
  History as HistoryIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WalletPage() {
  const [tabValue, setTabValue] = useState(0);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const walletData = {
    balance: 156.78,
    totalEarnings: 892.45,
    pendingEarnings: 23.50,
    thisMonthEarnings: 127.30
  };

  const transactions = [
    { id: 1, type: 'tip', amount: 5.00, from: 'user123', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'content', amount: 12.50, from: 'Content Revenue', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'withdraw', amount: -50.00, from: 'Bank Transfer', date: '2024-01-13', status: 'pending' },
    { id: 4, type: 'tip', amount: 8.75, from: 'meme_lover', date: '2024-01-12', status: 'completed' },
    { id: 5, type: 'content', amount: 15.25, from: 'Content Revenue', date: '2024-01-11', status: 'completed' }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleWithdraw = () => {
    console.log('Withdraw amount:', withdrawAmount);
    setWithdrawDialog(false);
    setWithdrawAmount('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'tip': return '💰';
      case 'content': return '📈';
      case 'withdraw': return '💸';
      default: return '💳';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Wallet Overview */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WalletIcon /> My Wallet
      </Typography>

      {/* Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                ${walletData.balance}
              </Typography>
              <Typography variant="body2">Available Balance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom color="success.main">
                ${walletData.totalEarnings}
              </Typography>
              <Typography variant="body2" color="textSecondary">Total Earnings</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom color="warning.main">
                ${walletData.pendingEarnings}
              </Typography>
              <Typography variant="body2" color="textSecondary">Pending Earnings</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom color="info.main">
                ${walletData.thisMonthEarnings}
              </Typography>
              <Typography variant="body2" color="textSecondary">This Month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<GetAppIcon />}
          onClick={() => setWithdrawDialog(true)}
          disabled={walletData.balance < 10}
        >
          Withdraw Funds
        </Button>
        <Button variant="outlined" startIcon={<EarningsIcon />}>
          View Earnings Report
        </Button>
      </Box>

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Transaction History" icon={<HistoryIcon />} />
          <Tab label="Earnings Overview" icon={<EarningsIcon />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>From/To</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getTransactionIcon(transaction.type)}</span>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.from}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={getStatusColor(transaction.status) as any}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Earnings Breakdown</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenue Sources</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Content Tips</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">68%</Typography>
                      <Typography variant="body2" fontWeight="bold">$607.27</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Direct Tips</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">32%</Typography>
                      <Typography variant="body2" fontWeight="bold">$285.18</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Performing Content</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">&quot;Funny Cat Meme #42&quot;</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">$45.80</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">&quot;Dancing Dog Video&quot;</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">$38.25</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">&quot;Relatable Work Meme&quot;</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">$32.10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)}>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Available Balance: ${walletData.balance}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Minimum withdrawal amount: $10.00
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Withdrawal Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            inputProps={{ min: 10, max: walletData.balance }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > walletData.balance}
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}