import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const currentBatchRows = [
  { id: 1, batchId: 'B001', productName: 'Product A', startTime: '2024-08-01 08:00', status: 'Completed' },
  { id: 2, batchId: 'B002', productName: 'Product B', startTime: '2024-08-02 09:30', status: 'In Progress' },
  { id: 3, batchId: 'B003', productName: 'Product C', startTime: '2024-08-01 08:00', status: 'Completed' },
  { id: 4, batchId: 'B004', productName: 'Product D', startTime: '2024-08-02 09:30', status: 'In Progress' },
];

const historicalBatchRows = [
  { id: 1, batchId: 'B100', productName: 'Product X', startTime: '2024-06-01 08:00', endTime: '2024-07-01 08:00', status: 'Completed' },
  { id: 2, batchId: 'B101', productName: 'Product Y', startTime: '2024-05-15 08:00', endTime: '2024-06-15 09:30', status: 'Completed' },
];

const Profile = () => {
  const [showCurrentBatch, setShowCurrentBatch] = useState(true);
  const navigate = useNavigate();

  const handleBatchClick = (batch) => {
    navigate('/dashboard', { state: { batch } }); // Pass batch data to Dashboard
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={3}
      width="100%"
      height="100vh"
      justifyContent="center"
    >
      <Typography variant="h4" marginBottom={2}>Batches</Typography>
      
      <Box display="flex" justifyContent="center" marginBottom={2} gap={2}>
        <Button
          variant={showCurrentBatch ? 'contained' : 'outlined'}
          onClick={() => setShowCurrentBatch(true)}
        >
          Current Batch
        </Button>
        <Button
          variant={!showCurrentBatch ? 'contained' : 'outlined'}
          onClick={() => setShowCurrentBatch(false)}
        >
          Historical Batch
        </Button>
      </Box>
      
      <Box width="100%" maxWidth="1200px">
        <TableContainer component={Paper} sx={{ margin: '0 auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Batch ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Start Time</TableCell>
                { !showCurrentBatch && <TableCell>End Time</TableCell> }
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(showCurrentBatch ? currentBatchRows : historicalBatchRows).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Button variant="text" color="primary" onClick={() => handleBatchClick(row)}>
                      {row.batchId}
                    </Button>
                  </TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{row.startTime}</TableCell>
                  { !showCurrentBatch && <TableCell>{row.endTime}</TableCell> }
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Profile;
