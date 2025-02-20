import React, { useState } from "react";
import {  CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import getUser from "../Atom/getUser";
import { useSetRecoilState } from "recoil";
const GuestLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setUser=useSetRecoilState(getUser);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/guest-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Guest login failed.");
      }

      // Store token and user details in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("PixelPalsUser", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/"); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <button
                  type="submit"
                  disabled={loading}
                  onClick={handleGuestLogin}
                  className='w-full bg-black  text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition duration-300'
                >
                  {loading ? <CircularProgress color="inherit" size={24} /> : "Continue as a guest..."}
                </button>
    </>
  );
};

export default GuestLogin;
