import React from 'react';
import { Avatar, Badge } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

const Conversation = () => {
  return (
    <div>
      <div className="pt-5 flex gap-3 items-center">
        <div>
          <Badge color="success" variant="dot" overlap='circular' >
            <Avatar sx={{ width: 60, height: 60 }} />
          </Badge>
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <div className="font-bold">Winston Shamraj</div>
            <VerifiedIcon color="primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Some message is here....</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
