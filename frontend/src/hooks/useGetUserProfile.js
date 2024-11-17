import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const useGetUserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();

        if(data.error)
        {
          snackbarMessage(data.error);
          setSnackbarSeverity('error'); 
          setSnackbarOpen(true);
          return;
        }
        if(data.isFrozen)
        {
          setUser(null)
          return;
        }

        setUser(data);
        setLoading(false);
      } catch (error) {
 
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
       
    };
    getUser();
  }, [username]);

  return { user, loading };
};

export default useGetUserProfile;
