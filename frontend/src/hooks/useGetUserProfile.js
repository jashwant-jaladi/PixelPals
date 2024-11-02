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

        if (res.ok) {
          setUser(data);
        } else {
          setError(data.error || 'User not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [username]);

  return { user, loading };
};

export default useGetUserProfile;
