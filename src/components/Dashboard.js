import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Box,
  TextField,
  Popover,
  Switch,
} from "@mui/material";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the default styles
import Draggable from "react-draggable";
import { Chart } from "react-google-charts";
import Autocomplete from "@mui/material/Autocomplete";
import Plot from "react-plotly.js";
import MenuIcon from "@mui/icons-material/Menu";
import ThemeToggle from "./ThemeToggle"; // Ensure this path is correct
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import EditIcon from "@mui/icons-material/Edit"; // Import Edit icon
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"; // Remove Typography from this line
import { ChromePicker } from "react-color"; // Import color picker
import { Rnd } from "react-rnd";

const buttonStyles = {
  mb: 2,
  textAlign: "left", // Ensures text is aligned to the left
  paddingLeft: "16px", // Adds padding to the left of the button content
  justifyContent: "flex-start", // Aligns the content to the start of the button
};

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

const Dashboard = () => {
  const [positions, setPositions] = useState({
    graph1: { x: 0, y: 0 },
    timeline1: { x: 0, y: 0 },
    circularGauge: { x: 0, y: 0 },
  });

  const [graphData, setGraphData] = useState({
    graph1: {
      dataset1: { x: [], y: [] },
      dataset2: { x: [], y: [] },
      dataset3: { x: [], y: [] },
    },
    graph2: {
      dataset1: { x: [], y: [] },
      dataset2: { x: [], y: [] },
    },
  });

  const [temperatureData, setTemperatureData] = useState({
    title: "",

    averageValue: "",
    referenceRange: "",
  });

  const [currentValue, setCurrentValue] = useState(0);
  const [averageValue, setAverageValue] = useState(0);
  const [timelineData, setTimelineData] = useState([]); // Define state for timeline data

  const [isFlipped, setIsFlipped] = useState(false); // Ensure this is defined
  const [isFlipped2, setIsFlipped2] = useState(false); // Ensure this is defined

  const [activeGraph, setActiveGraph] = useState("graph1"); // State for activeGraph
  const [anchorEl, setAnchorEl] = useState(null);
  const [theme, setTheme] = useState(darkTheme); // Define theme state
  const navigate = useNavigate(); // Initialize navigate using useNavigate
  const [isEditMode, setIsEditMode] = useState(false); // State for edit mode
  const [selectedOption, setSelectedOption] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [colors, setColors] = useState({
    dataset1: "red",
    dataset2: "blue",
    dataset3: "green",
    timelineColor1: "blue",
    timelineColor2: "blue",
    timelineColor3: "blue",
  });

  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false); // Default to disabled
  const [size, setSize] = useState({ width: 500, height: 400 }); // Default size
  const prevPositions = useRef(positions);
  const componentRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch positions, colors, and theme
        const positionResponse = await axios.post(
          "http://192.168.1.20:5000/api/card-position",
          { username: "testUser" }
        );
        if (positionResponse.data && positionResponse.data.position) {
          setPositions(positionResponse.data.position);
          setColors(positionResponse.data.colors || colors);
          prevPositions.current = positionResponse.data.position;
        }
        if (positionResponse.data.theme) {
          const themeMode = positionResponse.data.theme;
          setTheme(themeMode === "dark" ? darkTheme : lightTheme);
        }

        // Fetch general data including graph data, currentValue, and averageValue
        const dataResponse = await axios.get(
          "http://192.168.1.20:5000/api/data"
        );
        if (dataResponse.data) {
          // Set graph data
          setGraphData({
            graph1: dataResponse.data.graph1,
            graph2: dataResponse.data.graph2,
          });

          // Set currentValue and averageValue separately
          setCurrentValue(dataResponse.data.currentValue || 0);
          setAverageValue(dataResponse.data.averageValue || 0);

          // Set timeline data
          if (dataResponse.data.timeline) {
            const formattedTimelineData = dataResponse.data.timeline.map(
              (row) => {
                if (row[2] && row[3]) {
                  return [row[0], row[1], new Date(row[2]), new Date(row[3])];
                }
                return row;
              }
            );
            setTimelineData(formattedTimelineData);
          } else {
            setTimelineData([]); // Handle absence of timeline data
          }
        }

        // Set temperature data
        if (dataResponse.data.temperature) {
          setTemperatureData(dataResponse.data.temperature);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Set up interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleStop = (e, data, key) => {
    const newPosition = { ...positions, [key]: { x: data.x, y: data.y } };
    const movedComponentRect =
      componentRefs.current[key]?.getBoundingClientRect();

    console.log("Sending position and colors:", {
      position: newPosition,
      colors,
      theme,
    });

    // Get the bounding rectangles of the Box component and buttons
    const boxRect = document
      .querySelector("#controlBox")
      ?.getBoundingClientRect();
    const button1Rect = document
      .querySelector("#button1")
      ?.getBoundingClientRect();
    const button2Rect = document
      .querySelector("#button2")
      ?.getBoundingClientRect();

    // Check for overlap with all other components
    const isOverlapping = Object.keys(componentRefs.current).some(
      (otherKey) => {
        if (key === otherKey) return false; // Skip self
        const otherComponentRect =
          componentRefs.current[otherKey]?.getBoundingClientRect();
        return (
          (movedComponentRect &&
            otherComponentRect &&
            movedComponentRect.left < otherComponentRect.right &&
            movedComponentRect.right > otherComponentRect.left &&
            movedComponentRect.top < otherComponentRect.bottom &&
            movedComponentRect.bottom > otherComponentRect.top) ||
          (movedComponentRect &&
            boxRect &&
            movedComponentRect.left < boxRect.right &&
            movedComponentRect.right > boxRect.left &&
            movedComponentRect.top < boxRect.bottom &&
            movedComponentRect.bottom > boxRect.top) ||
          (movedComponentRect &&
            button1Rect &&
            movedComponentRect.left < button1Rect.right &&
            movedComponentRect.right > button1Rect.left &&
            movedComponentRect.top < button1Rect.bottom &&
            movedComponentRect.bottom > button1Rect.top) ||
          (movedComponentRect &&
            button2Rect &&
            movedComponentRect.left < button2Rect.right &&
            movedComponentRect.right > button2Rect.left &&
            movedComponentRect.top < button2Rect.bottom &&
            movedComponentRect.bottom > button2Rect.top)
        );
      }
    );

    if (isOverlapping) {
      // Revert to the previous position
      setPositions(prevPositions.current);
    } else {
      // Update the position and save it
      setPositions(newPosition);
      prevPositions.current = newPosition;

      axios
        .post("http://192.168.1.20:5000/api/save-card-position", {
          username: "testUser",
          position: newPosition,
          colors: colors, // Include colors in the payload
          theme: theme.palette.mode,
        })
        .then((response) => {
          console.log("Save response:", response.data);
        })
        .catch((error) => {
          console.error("Error saving position:", error);
        });
    }
  };

  const handleColorChange = (color) => {
    if (currentDataset) {
      setColors((prevColors) => ({
        ...prevColors,
        [currentDataset]: color.hex,
      }));
    }
  };

  const handleSaveColor = () => {
    axios
      .post("http://192.168.1.20:5000/api/save-card-position", {
        username: "testUser",
        position: positions,
        colors: colors,
        theme: theme.palette.mode,
      })
      .then((response) => {
        console.log("Save response:", response.data);
        handleColorPickerClose(); // Close the color picker
      })
      .catch((error) => {
        console.error("Error saving updated colors:", error);
      });
  };

  const handleThemeToggle = () => {
    const newTheme = theme.palette.mode === "dark" ? "light" : "dark";
    setTheme(newTheme === "dark" ? darkTheme : lightTheme);

    axios
      .post("http://192.168.1.20:5000/api/save-card-position", {
        username: "testUser",
        position: positions,
        colors: colors,
        theme: newTheme,
      })
      .then((response) => {
        console.log("Save response:", response.data);
      })
      .catch((error) => {
        console.error("Error saving theme:", error);
      });
  };

  const currentTheme = theme;

  const handleGuidanceClick = () => {
    setIsFlipped((prev) => !prev); // Toggle the flip state for first gauge
  };

  const handleGuidanceClick2 = () => {
    setIsFlipped2((prev) => !prev); // Toggle the flip state
  };

  // const handleThemeToggle = () => {
  // setTheme(prevTheme => (prevTheme.palette.mode === 'dark' ? lightTheme : darkTheme));
  // };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleEdit = () => {
    setOpenDialog(true); // Open the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOption(null); // Reset selection when dialog is closed
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setOpenDialog(true);
  };

  const handleDatasetClick = (dataset, event) => {
    setCurrentDataset(dataset);
    setAnchorEl(event.currentTarget); // Open color picker dropdown
  };

  const handleColorPickerClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? "color-picker-popover" : undefined;

  const handleSwitchChange = (event) => {
    setIsDraggingEnabled(event.target.checked);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    // Handle resizing locally
    setSize({
      width: ref.style.width,
      height: ref.style.height,
    });
  };

  // Example reference batches (replace with your actual data)
  const referenceBatches = [
    { name: "Batch 1" },
    { name: "Batch 2" },
    { name: "Batch 3" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        {" "}
        {/* AppBar is fixed at the top */}
        <Toolbar>
          <MenuIcon style={{ cursor: "pointer", marginRight: "8px" }} />
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Batch Quality Advisor
          </Typography>

          {/* Add Edit Icon */}
          <EditIcon
            style={{ cursor: "pointer", marginRight: "16px" }}
            onClick={handleEdit}
          />

          {/* Add Drag Components Switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "16px",
            }}
          >
            <Typography variant="body1" style={{ marginRight: "8px" }}>
              Drag
            </Typography>
            <Switch
              checked={isDraggingEnabled}
              onChange={handleSwitchChange}
              color="default"
            />
          </div>

          <ThemeToggle currentTheme={theme} onToggle={handleThemeToggle} />
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <>
        {/* Main Dialog for Edit Options */}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md" // Ensures dialog size is reasonable
          PaperProps={{
            sx: {
              width: "1000px", // Adjust width as needed
              height: "800px", // Adjust height as needed
            },
          }}
        >
          <DialogTitle>Edit Options</DialogTitle>
          <DialogContent sx={{ padding: 3 }}>
            <Grid container spacing={2} sx={{ height: "100%" }}>
              {/* First Part: Button List */}
              <Grid
                item
                xs={4}
                sx={{ borderRight: "1px solid #ccc", height: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    padding: "16px",
                  }}
                >
                  <Button
                    onClick={() => handleOptionClick("graph1")}
                    fullWidth
                    sx={buttonStyles}
                  >
                    Graph1
                  </Button>
                  <Button
                    onClick={() => handleOptionClick("timeline1")}
                    fullWidth
                    sx={buttonStyles}
                  >
                    Timeline1
                  </Button>
                  <Button
                    onClick={() => handleOptionClick("circularGauge")}
                    fullWidth
                    sx={buttonStyles}
                  >
                    CircularGauge
                  </Button>
                  <Button
                    onClick={() => handleOptionClick("circularGauge2")}
                    fullWidth
                    sx={buttonStyles}
                  >
                    CircularGauge2
                  </Button>
                </div>
              </Grid>

              {/* Second Part: Dynamic Content Based on Selection */}
              <Grid
                item
                xs={8}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    padding: "16px",
                  }}
                >
                  {selectedOption === "graph1" && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Select a dataset for Graph1:
                      </Typography>
                      <Button
                        onClick={(event) =>
                          handleDatasetClick("dataset1", event)
                        }
                        fullWidth
                        sx={buttonStyles}
                      >
                        Dataset1
                      </Button>
                      <Button
                        onClick={(event) =>
                          handleDatasetClick("dataset2", event)
                        }
                        fullWidth
                        sx={buttonStyles}
                      >
                        Dataset2
                      </Button>
                      <Button
                        onClick={(event) =>
                          handleDatasetClick("dataset3", event)
                        }
                        fullWidth
                        sx={buttonStyles}
                      >
                        Dataset3
                      </Button>
                    </>
                  )}

                  {selectedOption === "timeline1" && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Select a color for Timeline datasets:
                      </Typography>
                      <Button
                        onClick={(event) =>
                          handleDatasetClick("timelineColor1", event)
                        }
                        fullWidth
                        sx={buttonStyles}
                      >
                        Color 1
                      </Button>
                      <Button
                        onClick={(event) =>
                          handleDatasetClick("timelineColor2", event)
                        }
                        fullWidth
                        sx={buttonStyles}
                      >
                        Color 2
                      </Button>
                      <Button
                        onClick={(event) =>
                          handleDatasetClick("timelineColor3", event)
                        }
                        fullWidth
                        sx={buttonStyles}
                      >
                        Color 3
                      </Button>
                    </>
                  )}

                  {/* Add similar sections for 'circularGauge' and 'circularGauge2' if needed */}
                </div>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ padding: 2 }}>
            <Button onClick={handleCloseDialog} variant="contained">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Popover for Color Picker */}

        <Popover
          id={id}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleColorPickerClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{
            "& .MuiPopover-paper": {
              width: "900px", // Adjust as needed
              padding: 0,
            },
          }}
        >
          <div style={{ width: "100%", padding: "16px" }}>
            <div style={{ width: "100%", height: "655px" }}>
              {" "}
              {/* Ensure this container has no fixed height */}
              <ChromePicker
                color={colors[currentDataset] || "#fff"}
                onChangeComplete={handleColorChange}
                disableAlpha
                styles={{
                  default: {
                    picker: {
                      width: "100%", // ChromePicker takes full width of its container
                      height: "600px", // Adjust height of the ChromePicker
                    },
                  },
                }}
              />
              <DialogActions sx={{ padding: 2 }}>
                <Button
                  onClick={handleSaveColor}
                  variant="contained"
                  color="primary"
                >
                  OK
                </Button>
                <Button onClick={handleColorPickerClose} variant="outlined">
                  Cancel
                </Button>
              </DialogActions>
            </div>
          </div>
        </Popover>
      </>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                id="button1"
                variant={activeGraph === "graph1" ? "contained" : "outlined"}
                onClick={() => setActiveGraph("graph1")}
              >
                Show Graph 1
              </Button>
              <Button
                id="button2"
                variant={activeGraph === "graph2" ? "contained" : "outlined"}
                onClick={() => setActiveGraph("graph2")}
                style={{ marginLeft: "10px" }}
              >
                Show Graph 2
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Draggable
                disabled={!isDraggingEnabled}
                position={positions[activeGraph] || { x: 0, y: 0 }}
                onStop={(e, data) => handleStop(e, data, activeGraph)}
              >
                <div
                  style={{
                    width: 1850,
                    height: 600,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6",
                    color: theme.palette.text.primary,
                  }}
                  ref={(el) => (componentRefs.current[activeGraph] = el)}
                >
                  {activeGraph === "graph1" && graphData.graph1 && (
                    <Plot
                      data={[
                        {
                          x: graphData.graph1.dataset1?.x || [],
                          y: graphData.graph1.dataset1?.y || [],
                          type: "scatter",
                          mode: "lines+markers",
                          name: "Dataset 1",
                          marker: { color: colors.dataset1 || "blue" },
                          line: { color: colors.dataset1 || "blue" },
                        },
                        {
                          x: graphData.graph1.dataset2?.x || [],
                          y: graphData.graph1.dataset2?.y || [],
                          type: "scatter",
                          mode: "lines+markers",
                          name: "Dataset 2",
                          marker: { color: colors.dataset2 || "green" },
                        },
                        {
                          x: graphData.graph1.dataset3?.x || [],
                          y: graphData.graph1.dataset3?.y || [],
                          type: "scatter",
                          mode: "lines+markers",
                          name: "Dataset 3",
                          marker: { color: colors.dataset3 || "red" },
                        },
                      ]}
                      layout={{
                        title: "Graph 1",
                        height: 600,
                        width: 1850,
                        paper_bgcolor:
                          theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6",
                        plot_bgcolor:
                          theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6",
                        font: { color: theme.palette.text.primary },
                        xaxis: {
                          title: "Time (Units)",
                          titlefont: { color: theme.palette.text.primary },
                          tickfont: { color: theme.palette.text.primary },
                          fixedrange: true,
                        },
                        yaxis: {
                          title: "Value",
                          titlefont: { color: theme.palette.text.primary },
                          tickfont: { color: theme.palette.text.primary },
                          fixedrange: true,
                        },
                        shapes: [
                          {
                            type: "line",
                            x0: 1,
                            y0: 0,
                            x1: 5,
                            y1: 0,
                            line: {
                              color: theme.palette.text.primary,
                              width: 2,
                            },
                          },
                        ],
                        showlegend: true,
                      }}
                    />
                  )}

                  {activeGraph === "graph2" && graphData.graph2 && (
                    <Plot
                      data={[
                        {
                          x: graphData.graph2.dataset1?.x || [],
                          y: graphData.graph2.dataset1?.y || [],
                          type: "scatter",
                          mode: "lines+markers",
                          name: "Dataset 1",
                          marker: { color: "orange" },
                        },
                        {
                          x: graphData.graph2.dataset2?.x || [],
                          y: graphData.graph2.dataset2?.y || [],
                          type: "scatter",
                          name: "Another Dataset",
                          marker: { color: "purple" },
                        },
                      ]}
                      layout={{
                        title: "Graph 2",
                        height: 600,
                        width: 1850,
                        paper_bgcolor:
                          theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6",
                        plot_bgcolor:
                          theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6",
                        font: { color: theme.palette.text.primary },
                        xaxis: {
                          title: "Categories",
                          titlefont: { color: theme.palette.text.primary },
                          tickfont: { color: theme.palette.text.primary },
                          fixedrange: true,
                        },
                        yaxis: {
                          title: "Values",
                          titlefont: { color: theme.palette.text.primary },
                          tickfont: { color: theme.palette.text.primary },
                          fixedrange: true,
                        },
                        showlegend: true,
                      }}
                    />
                  )}
                </div>
              </Draggable>
            </Grid>

            <Grid container spacing={2}>
              {/* First Circular Gauge */}
              <Grid item xs={12}>
                <Draggable
                  disabled={!isDraggingEnabled} // Enable or disable dragging based on state
                  position={positions.circularGauge}
                  onStop={(e, data) => handleStop(e, data, "circularGauge")}
                >
                  <div
                    style={{
                      width: 500,
                      height: 400,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6", // Light gray for light mode

                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      perspective: "1000px",
                    }}
                    ref={(el) => (componentRefs.current["circularGauge"] = el)}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.6s",
                        transform: isFlipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                        position: "relative",
                      }}
                    >
                      {/* Front Side */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#1e1e1e"
                              : "#F6F6F6", // Light gray for light mode
                          color: theme.palette.text.primary, // Text color based on theme
                          borderRadius: "8px",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 350,
                            height: 350,
                            position: "relative",
                          }}
                        >
                          <CircularProgressbar
                            value={currentValue}
                            minValue={0}
                            maxValue={100}
                            styles={buildStyles({
                              pathColor:
                                currentValue <= 20
                                  ? "#ff0000" // Red for 0-20
                                  : currentValue <= 60
                                  ? "#ffff00" // Yellow for 21-60
                                  : "#00ff00", // Green for 61-100
                              trailColor: "#3a3a3a",
                              strokewidth: 5,
                            })}
                          />
                          <div
                            style={{
                              position: "absolute",
                              color: theme.palette.text.primary,
                              fontSize: "50px",
                              fontWeight: "bold",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {currentValue}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              color: theme.palette.text.primary,
                              fontSize: "50px",
                              fontWeight: "bold",
                              top: "70%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {
                              currentValue <= 20
                                ? "Low" // Low for 0-20
                                : currentValue <= 60
                                ? "Medium" // Medium for 21-60
                                : "High" // High for 61-100
                            }
                          </div>
                        </div>
                      </div>
                      {/* Back Side */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          backgroundColor:
                            theme.palette.mode === "dark" ? "#333" : "#e0e0e0", // Light gray for light mode
                          color: theme.palette.text.primary, // Text color based on theme
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "8px",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "rotateY(180deg)",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h5">Guidance Message</Typography>
                      </div>
                    </div>
                    <button
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        right: "20px",
                        backgroundColor: "#ff0000",
                        color: "#ffffff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={handleGuidanceClick}
                    >
                      Guidance
                    </button>
                  </div>
                </Draggable>
              </Grid>

              {/* Second Circular Gauge */}
              <Grid item xs={12}>
                <Draggable
                  disabled={!isDraggingEnabled} // Enable or disable dragging based on state
                  position={positions.circularGauge2}
                  onStop={(e, data) => handleStop(e, data, "circularGauge2")}
                >
                  <div
                    style={{
                      width: 500,
                      height: 400,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6", // Light gray for light mode

                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      perspective: "1000px",
                    }}
                    ref={(el) => (componentRefs.current["circularGauge2"] = el)}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.6s",
                        transform: isFlipped2
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                        position: "relative",
                      }}
                    >
                      {/* Front Side */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#1e1e1e"
                              : "#f5f5f5", // Light gray for light mode
                          color: theme.palette.text.primary, // Text color based on theme
                          borderRadius: "8px",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 350,
                            height: 350,
                            position: "relative",
                          }}
                        >
                          <CircularProgressbar
                            value={averageValue}
                            minValue={0}
                            maxValue={100}
                            styles={buildStyles({
                              pathColor:
                                averageValue <= 20
                                  ? "#ff0000" // Red for 0-20
                                  : averageValue <= 60
                                  ? "#ffff00" // Yellow for 21-60
                                  : "#00ff00", // Green for 61-100
                              trailColor: "#3a3a3a",
                              strokeWidth: 1,
                            })}
                          />
                          <div
                            style={{
                              position: "absolute",
                              color: theme.palette.text.primary,
                              fontSize: "50px",
                              fontWeight: "bold",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {averageValue}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              color: theme.palette.text.primary,
                              fontSize: "50px",
                              fontWeight: "bold",
                              top: "70%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {
                              averageValue <= 20
                                ? "Low" // Low for 0-20
                                : averageValue <= 60
                                ? "Medium" // Medium for 21-60
                                : "High" // High for 61-100
                            }
                          </div>
                        </div>
                      </div>
                      {/* Back Side */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          backgroundColor:
                            theme.palette.mode === "dark" ? "#333" : "#e0e0e0", // Light gray for light mode
                          color: theme.palette.text.primary, // Text color based on theme
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "8px",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "rotateY(180deg)",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h5">Guidance Message</Typography>
                      </div>
                    </div>
                    <button
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        right: "20px",
                        backgroundColor: "#ff0000",
                        color: "#ffffff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={handleGuidanceClick2}
                    >
                      Guidance
                    </button>
                  </div>
                </Draggable>
              </Grid>
            </Grid>

            <Grid container item xs={6} spacing={2} justifyContent="flex-end">
              <Grid item>
                <Draggable
                  disabled={!isDraggingEnabled} // Enable or disable dragging based on state
                  position={{
                    x: positions["emptyGrid1"]?.x || 0,
                    y: positions["emptyGrid1"]?.y || 0,
                  }}
                  onStop={(e, data) => handleStop(e, data, "emptyGrid1")}
                >
                  <Box
                    ref={(el) => (componentRefs.current["emptyGrid1"] = el)}
                    sx={{
                      width: 500,
                      height: 400,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6", // Background color based on theme

                      color: theme.palette.text.primary, // Text color based on theme
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative", // Ensures the status bar is positioned relative to this container
                    }}
                  >
                    {/* Status Bar */}
                    <Box
                      sx={{
                        width: "90%",
                        height: "10px",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "orange"
                            : "darkorange", // Adjusted for visibility in both themes
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 10px",
                        position: "absolute", // Positioned absolutely within the container
                        top: 30,
                        left: 20,
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "5px",
                        boxSizing: "border-box",
                      }}
                    />

                    {/* Content */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        paddingTop: "50px", // Adjusted to make space for the status bar
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "24px", paddingBottom: "5px" }}
                      >
                        {temperatureData.title}
                      </Typography>

                      <Typography
                        sx={{ fontSize: "40px", paddingBottom: "5px" }}
                      >
                        {temperatureData.averageValue}
                      </Typography>
                      <Typography sx={{ fontSize: "22px", paddingTop: "10px" }}>
                        Reference range
                      </Typography>
                      <Typography sx={{ fontSize: "30px", paddingTop: "5px" }}>
                        {temperatureData.referenceRange}
                      </Typography>
                    </Box>
                  </Box>
                </Draggable>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                {positions.emptyGrid2 && (
                  <Rnd
                    disableDragging={!isDraggingEnabled} // Control dragging based on state
                    size={size}
                    position={{
                      x: positions.emptyGrid2.x,
                      y: positions.emptyGrid2.y,
                    }}
                    onDragStop={(e, data) => handleStop(e, data, "emptyGrid2")}
                    onResizeStop={handleResizeStop} // Handle resizing locally
                    minWidth={200} // Minimum width
                    minHeight={150} // Minimum height
                  >
                    <Box
                      ref={(el) => (componentRefs.current["emptyGrid2"] = el)}
                      sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6",
                      }}
                    >
                      {/* Content of your component goes here */}
                    </Box>
                  </Rnd>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Draggable
                disabled={!isDraggingEnabled} // Enable or disable dragging based on state
                position={positions.timeline1}
                onStop={(e, data) => handleStop(e, data, "timeline1")}
              >
                <div
                  style={{
                    width: 1850,
                    height: "250px",
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6", // Dynamic background color
                    color: theme.palette.text.primary, // Adapts to theme
                  }}
                  ref={(el) => (componentRefs.current["timeline1"] = el)}
                >
                  <div style={{ padding: "16px" }}>
                    <Autocomplete
                      options={referenceBatches}
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Batch"
                          variant="outlined"
                        />
                      )}
                      style={{ marginBottom: "16px", width: "300px" }}
                    />
                  </div>
                  <Chart
                    chartType="Timeline"
                    width="1850px"
                    height="200px"
                    data={timelineData}
                    options={{
                      timeline: {
                        showBarLabels: false,
                      },
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#F6F6F6", // Dynamic background color
                      fontSize: 12,
                      colors: [
                        colors.timelineColor1,
                        colors.timelineColor2,
                        colors.timelineColor3,
                      ],
                      textStyle: {
                        color: theme.palette.text.primary, // Adapts to theme
                      },
                    }}
                  />
                </div>
              </Draggable>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Dashboard;
