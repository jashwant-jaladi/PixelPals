import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchUser } from '../apis/userApi';

const useGetUserProfile = (setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen) => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true); // Reset loading when username changes
      setUser(null); // Reset user to prevent stale data

      try {
        const data = await searchUser(username);

        if (data.error) {
          setSnackbarMessage(data.error);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }

        if (data.delete) {
          setUser(null);
          return;
        }

        setUser(data);
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [username, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]); // Ensure dependencies are included

  return { user, loading };
};

export default useGetUserProfile;
