import { Toolbar, Typography, Button, Box, TextField } from "@mui/material";
import React, { useState, useContext } from "react"; // Ensure useState is imported
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useLocation } from "react-router-dom";

import ThemeToggle from "./ThemeToggle"; // Ensure the path is correct

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const referenceBatches = ["Batch A", "Batch B", "Batch C"];

const AppBarComponent = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState(darkTheme);
  const lastUpdated = new Date().toLocaleString();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleRunClick = () => {
    setIsRunning(!isRunning);
  };

  const handleThemeToggle = () => {
    setTheme((prevTheme) =>
      prevTheme.palette.mode === "dark" ? lightTheme : darkTheme
    );
  };

  const location = useLocation();
  const batch = location.state?.batch;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Typography variant="h6">
          Batch Dashboard &gt; KPI indicators
        </Typography>
        <Typography variant="body1">Last updated: {lastUpdated}</Typography>
      </Toolbar>

      <Box
        id="controlBox"
        sx={{
          width: "100%",
          height: 64,
          backgroundColor: "#1e1e1e",
          marginTop: "1px",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={handleRunClick}
          size="small"
        >
          {isRunning ? "Running" : "Run"}
        </Button>
        <Box
          sx={{
            marginLeft: "16px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" sx={{ marginRight: "8px" }}>
            Product Name: {batch ? batch.productName : "xxxxxxx"}
          </Typography>
          <Typography variant="body1" sx={{ marginRight: "8px" }}>
            | Batch ID: {batch ? batch.batchId : "xxxxxxxx"}
          </Typography>
          <Typography variant="body1" sx={{ marginRight: "8px" }}>
            | Start Time: {batch ? batch.startTime : "xxxxxxxx"}
          </Typography>
          <Typography variant="body1" sx={{ marginLeft: "8px" }}>
            | End Time: {batch ? batch.startTime : "xxxxxxxx"}
          </Typography>
          <Typography variant="body1" sx={{ marginLeft: "16px" }}>
            | Reference Batch:
          </Typography>
          <Autocomplete
            options={referenceBatches.filter((batch) =>
              batch.toLowerCase().includes(searchValue.toLowerCase())
            )}
            getOptionLabel={(option) => option}
            onInputChange={(event, newInputValue) =>
              setSearchValue(newInputValue)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  marginLeft: "8px",
                  backgroundColor: "#000",
                  color: "#fff",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#fff",
                    },
                    "&:hover fieldset": {
                      borderColor: "#fff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#fff",
                    },
                  },
                }}
                placeholder="Search Reference Batch"
              />
            )}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppBarComponent;
