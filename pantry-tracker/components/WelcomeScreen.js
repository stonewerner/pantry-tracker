// components/WelcomeScreen.js
import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const WelcomeScreen = ({ onSignIn, onSignUp, onAnonymous }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      gap={2}
    >
      <Typography variant="h4">Welcome to Inventory Management</Typography>
      <Button onClick={onAnonymous}>Continue as Guest</Button>
    </Box>
  );
};

export default WelcomeScreen;