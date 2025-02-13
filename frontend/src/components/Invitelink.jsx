import React, { useState } from 'react';
import { Card, CardContent, Button, Alert } from '@mui/material';
import { Copy } from 'lucide-react';

const InviteLink = () => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const inviteLink = "https://pixelpals.com/invite/xyz123"; // Replace with dynamic link if needed

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000); // Hide after 3 seconds
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[300px] p-6 bg-black text-white font-parkinsans">
      {/* Invite Link Card */}
      <Card className="w-full max-w-md bg-gray-900 shadow-lg rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Invite Friends to PixelPals
          </h2>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Share the link below and invite your friends to join the fun!
          </p>

          {/* Input + Copy Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 p-2 text-sm font-medium rounded-lg border border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
            />
            <Button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
              sx={{ textTransform: 'none' }}
            >
              <Copy size={16} color="white" />
              <span className="font-bold">Copy</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snackbar Notification */}
      {showSnackbar && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs">
          <Alert
            severity="success"
            className="bg-green-900 text-green-200 border border-green-800 rounded-lg shadow-md"
            sx={{ width: '100%' }}
          >
            Link copied to clipboard!
          </Alert>
        </div>
      )}
    </div>
  );
};

export default InviteLink;
