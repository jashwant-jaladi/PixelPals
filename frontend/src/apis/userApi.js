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

  // src/api.js

export const loginUser = async (email, password) => {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// src/api.js

// Function to handle logout
export const logoutUser = async () => {
  try {
    const response = await fetch('/api/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// src/api.js

// Function to handle user registration
export const registerUser = async (input) => {
  try {
    const response = await fetch('/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.name,
        username: input.username,
        email: input.email,
        password: input.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Directly return the error message from the backend
      return { error: data.message || 'Registration failed' };
    }

    return data;
  } catch (error) {
    console.error('Registration API error:', error);
    return { error: 'Something went wrong. Please try again.' }; // Avoid throwing new Error
  }
};


// src/utils/api.js

export const fetchSuggestedUsers = async () => {
  try {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (!token) {
      throw new Error("Unauthorized: No token found.");
    }

    const response = await fetch("/api/users/suggested", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Attach token
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch suggested users.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || "An error occurred while fetching users.");
  }
};


// src/utils/api.js

export const resetPassword = async (token, password) => {
  try {
    if (!token) {
      throw new Error("Invalid or missing token.");
    }

    const response = await fetch(`/api/users/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong. Please try again.");
    }

    return result;
  } catch (error) {
    console.error("Password Reset Error:", error.message); // Log for debugging
    throw new Error(error.message || "Failed to reset password. Please try again.");
  }
};


// src/utils/api.js

// Frontend function
export const requestResetPasswordLink = async (email) => {
  try {
    const response = await fetch('/api/users/reset-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Look for error message in multiple possible properties
      throw new Error(result.error || result.message || 'Something went wrong.');
    }
    
    return result;
  } catch (error) {
    // Preserve the original error message if it exists
    throw error.message ? error : new Error('Failed to send request. Please try again.');
  }
};

// src/utils/api.js

export const toggleAccountPrivacy = async (newPrivateState) => {
  try {
    const response = await fetch("/api/users/private", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ private: newPrivateState }),
    });

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteAccount = async (userId) => {
  try {
    const response = await fetch("/api/users/deleteUser", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }), // Send userId in the request body
    });

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};


// api/updateProfile.js
export const updateProfileAPI = async (userId, input) => {
  try {
    const response = await fetch(`/api/users/update/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.name,
        username: input.username,
        bio: input.bio,
        email: input.email,
        profilePic: input.profilePic,
        password: input.password || undefined, // Only send password if it's not empty
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occurred while updating the profile.');
  }
};

export const fetchUserById = async (userId) => {
  try {
      const response = await fetch(`/api/users/${userId}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          throw new Error("Failed to fetch user");
      }

      return await response.json();
  } catch (error) {
      console.error("Error fetching user by ID:", error);
      return { error: "Something went wrong" };
  }
};
