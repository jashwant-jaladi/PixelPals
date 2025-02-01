export const followUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      throw new Error(error.message || 'An error occurred while following the user');
    }
  };