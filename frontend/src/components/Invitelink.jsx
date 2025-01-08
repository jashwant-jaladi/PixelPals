import React, { useState } from 'react';
import { Card, CardContent, Button, Alert } from '@mui/material';
import { Copy } from 'lucide-react';

const InviteLink = () => {
  // State to manage the snackbar visibility
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // You can replace this with your actual invite link generation logic
  const inviteLink = "https://pixelpals.com/invite/xyz123";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShowSnackbar(true);
      
      // Hide the snackbar after 3 seconds
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="relative">
    
      <Card variant="outlined" className="w-full max-w-md p-6" sx={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', border: '1px solid rgba(176, 73, 174, 0.69)', }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <input  
              type="text" 
              value={inviteLink}
              readOnly
              className="flex-1 p-2 text-sm font-bold rounded border w-[80%] border-pink-700 bg-transparent"
            />
            <Button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-pink-700 hover:bg-pink-800 text-white py-2 px-4 rounded"
            >
              <Copy size={16} color="white" />
              <p className='font-bold text-pink-700'>Copy</p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snackbar Notification */}
      {showSnackbar && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-4">
          <Alert className="bg-green-100 text-green-800 border-green-200">
            Link copied to clipboard!
          </Alert>
        </div>
      )}
    </div>
  );
};

export default InviteLink;
