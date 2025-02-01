export const searchUser = async (searchText) => {
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to search user');
      }
    } catch (error) {
      throw new Error(error.message || 'An error occurred while searching for user');
    }
  };