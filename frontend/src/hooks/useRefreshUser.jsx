// Create a useRefreshUser.js hook
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import getUser from '../Atom/getUser';
import { fetchUserById } from '../apis/userApi';

export const useRefreshUser = (intervalMs = 60000) => {
  const [currentUser, setCurrentUser] = useRecoilState(getUser);
  
  useEffect(() => {
    if (!currentUser?._id) return;
    
    const refreshUser = async () => {
      try {
        const freshUserData = await fetchUserById(currentUser._id);
        if (freshUserData) {
          setCurrentUser(freshUserData);
          // Also update localStorage directly
          localStorage.setItem('PixelPalsUser', JSON.stringify(freshUserData));
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };
    
    // Initial refresh
    refreshUser();
    
    // Set up interval
    const intervalId = setInterval(refreshUser, intervalMs);
    return () => clearInterval(intervalId);
  }, [currentUser?._id]);
};

