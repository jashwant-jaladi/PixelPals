import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from "@mui/material";
import { useSetRecoilState, useRecoilValue } from "recoil";
import getUser from "../Atom/getUser";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isPrivate, setIsPrivate] = useState(false);
  const setUserAtom = useSetRecoilState(getUser);
  const user = useRecoilValue(getUser);
  const navigate = useNavigate();

  // Initialize privacy setting from user data
  useEffect(() => {
    if (user && typeof user.private !== 'undefined') {
      setIsPrivate(user.private);
    }
  }, [user]);

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?")) return;

    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.error) {
        setSnackbarMessage("Error: " + data.error);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      if (data.success) {
        await logout();
        setSnackbarMessage("Your account has been frozen.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setModalOpen(false);
      }
    } catch (error) {
      setSnackbarMessage("Error: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const newPrivateState = !isPrivate;
      
      // Make the API call first
      const response = await fetch("/api/users/private", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ private: newPrivateState }),
      });

      const data = await response.json();
      
      if (data.error) {
        setSnackbarMessage("Error: " + data.error);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      // Only update state if the API call was successful
      setIsPrivate(newPrivateState);
      
      // Update the Recoil atom with the new user data
      setUserAtom(prev => ({ ...prev, private: newPrivateState }));
      
      // Update localStorage if you're storing user data there
      const storedUser = JSON.parse(localStorage.getItem("PixelPalsUser") || "{}");
      localStorage.setItem("PixelPalsUser", JSON.stringify({
        ...storedUser,
        private: newPrivateState
      }));
      
      setSnackbarMessage(
        `Your account is now ${newPrivateState ? "Private" : "Public"}.`
      );
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error toggling privacy:", error);
      setSnackbarMessage("Error: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.error) {
        setSnackbarMessage("Error: " + data.error);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      localStorage.removeItem("PixelPalsUser");
      setUserAtom(null);
      navigate("/login");
    } catch (error) {
      setSnackbarMessage("Error: " + error.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: 3,
        fontFamily: "parkinsans",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 2,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Settings
      </Typography>

      <Card
        sx={{
          width: "90%",
          maxWidth: 420,
          borderRadius: "16px",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.1)",
          padding: 3,
          transition: "0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        <CardContent>
          {/* Account Privacy Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={handleTogglePrivacy}
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: isPrivate ? "#c0392b" : "#2ecc71",
                  },
                }}
              />
            }
            label={
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", fontSize: "16px" }}
              >
                Private Account
              </Typography>
            }
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
            }}
          />

          {/* Deactivate Account Button */}
          <Button
            variant="contained"
            color="error"
            size="large"
            fullWidth
            onClick={() => setModalOpen(true)}
            sx={{
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "none",
              padding: "12px 24px",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "#c0392b",
                transform: "scale(1.05)",
                boxShadow: "0px 4px 12px rgba(192, 57, 43, 0.4)",
              },
            }}
          >
            Deactivate Account
          </Button>
        </CardContent>
      </Card>

      {/* Deactivation Confirmation Dialog */}
      <Dialog open={isModalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold", color: "#e74c3c" }}>
          Confirm Deactivation
        </DialogTitle>
        <DialogContent>
          <Typography color="textSecondary">
            Are you sure you want to deactivate your account? This action is
            permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeactivate} color="error" variant="contained">
            Yes, Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
