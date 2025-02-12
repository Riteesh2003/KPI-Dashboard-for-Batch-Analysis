const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware setup
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

// Path for the shared positions file
const positionsFilePath = path.join(__dirname, "cardpositions.json");
const dataFilePath = path.join(__dirname, "data.json"); // Updated path for data.json

// Ensure the positions file exists
if (!fs.existsSync(positionsFilePath)) {
  fs.writeFileSync(positionsFilePath, JSON.stringify({}), "utf8");
}

// Ensure the data file exists
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify({}), "utf8");
}

// Function to read positions from the file
const readPositions = () => {
  try {
    const data = fs.readFileSync(positionsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return {};
  }
};

// Function to save positions to the file
const savePositions = (positions) => {
  try {
    fs.writeFileSync(
      positionsFilePath,
      JSON.stringify(positions, null, 2),
      "utf8"
    );
    console.log("Positions saved:", positions);
  } catch (error) {
    console.error("Error writing JSON file:", error);
  }
};

// Function to read data from the data file
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    return {};
  }
};

// Function to generate new data
const generateRandomDate = (startYear, endYear) => {
  const start = new Date(`${startYear}-01-01`);
  const end = new Date(`${endYear}-12-31`);
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
};

const generateNewData = () => {
  const getRandomInteger = (min, max) => {
    // Generate a random integer between min and max, inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return {
    currentValue: getRandomInteger(0, 10) * 10, // Random integer between 0 and 100, in increments of 10
    averageValue: getRandomInteger(0, 10) * 10, // Random integer between 0 and 100, in increments of 10
    temperature: {
      title: "M1_Temp",
      averageValue: `${(Math.random() * 50 + 50).toFixed(2)} Deg C`, // Keeps decimal points for temperature
      referenceRange: `${(Math.random() * 30 + 60).toFixed(2)} Deg C - ${(
        Math.random() * 30 +
        50
      ).toFixed(2)} Deg C`, // Keeps decimal points for temperature
    },
    graph1: {
      dataset1: {
        x: [1, 2, 3, 4, 5],
        y: Array.from({ length: 5 }, () => Math.random() * 10),
      },
      dataset2: {
        x: [1, 2, 3, 4, 5],
        y: Array.from({ length: 5 }, () => Math.random() * 10),
      },
      dataset3: {
        x: [1, 2, 3, 4, 5],
        y: Array.from({ length: 5 }, () => Math.random() * 10),
      },
    },
    graph2: {
      dataset1: {
        x: [1, 2, 3, 4, 5],
        y: Array.from({ length: 5 }, () => Math.random() * 10),
      },
      dataset2: {
        x: [1, 2, 3, 4, 5],
        y: Array.from({ length: 5 }, () => Math.random() * 10),
      },
    },
    timeline: [
      ["President", "Name", "Start", "End"],
      [
        "Washington",
        "George Washington",
        generateRandomDate(1789, 1797),
        generateRandomDate(1797, 1797),
      ],
      [
        "Adams",
        "John Adams",
        generateRandomDate(1797, 1801),
        generateRandomDate(1801, 1809),
      ],
      [
        "Jefferson",
        "Thomas Jefferson",
        generateRandomDate(1801, 1809),
        generateRandomDate(1809, 1809),
      ],
    ],
  };
};

// Function to update the data file
const updateDataFile = () => {
  try {
    const newData = generateNewData();
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), "utf8");
    console.log("Data updated:", newData);
  } catch (error) {
    console.error("Error updating data file:", error);
  }
};

// Update data every 5 seconds
setInterval(updateDataFile, 5000);

// Endpoint to save card positions and colors and theme
app.post("/api/save-card-position", (req, res) => {
  const { username, position, colors, theme } = req.body;

  // Log received data
  console.log("Received request to save position, colors, and theme:", {
    username,
    position,
    colors,
    theme,
  });

  // Check if colors or theme is undefined or empty and log an error
  if (!colors || Object.keys(colors).length === 0) {
    console.error(
      `Error: Colors data is missing or empty for user: ${username}`
    );
  }
  if (!theme) {
    console.error(`Error: Theme data is missing for user: ${username}`);
  }

  const positions = readPositions();

  // Save both position, colors, and theme
  positions[username] = {
    position: position,
    colors: colors || positions[username]?.colors || {}, // Fallback to previous colors if not provided
    theme: theme || positions[username]?.theme, // Fallback to previous theme if not provided
  };

  // After saving, check if the data is correctly written
  savePositions(positions);
  if (
    !positions[username].colors ||
    Object.keys(positions[username].colors).length === 0
  ) {
    console.error(
      `Error: Colors were not saved correctly for user: ${username}`
    );
  } else {
    console.log(
      `Successfully saved colors and theme for user ${username}:`,
      positions[username].colors,
      positions[username].theme
    );
  }

  res.json({ success: true });
});

// Endpoint to get card positions and colors and theme
app.post("/api/card-position", (req, res) => {
  const { username } = req.body;
  console.log("Fetching positions, colors, and theme for user:", username);

  try {
    const positions = readPositions();
    if (!positions[username]) {
      console.log(`No positions found for user: ${username}`);
      return res.json({ position: {}, colors: {}, theme: {} });
    }

    // Check if colors or theme exist and log if they are missing
    if (
      !positions[username].colors ||
      Object.keys(positions[username].colors).length === 0
    ) {
      console.error(`Error: Colors not found for user: ${username}`);
    }
    if (!positions[username].theme) {
      console.error(`Error: Theme not found for user: ${username}`);
    }

    res.json({
      position: positions[username].position,
      colors: positions[username].colors || {},
      theme: positions[username].theme || {},
    });
  } catch (error) {
    console.error("Error handling fetch request:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Endpoint to serve data.json file
app.get("/api/data", (req, res) => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading data file:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Endpoint to serve data.json file
//app.get('/api/data', (req, res) => {
//try {
// const data = readData();
//res.json(data);
//} catch (error) {
//console.error('Error reading data file:', error);
// res.status(500).json({ success: false, error: 'Internal Server Error' });
// }
//});

//Endpoint to get timeline data
//app.get('/api/timeline-data', (req, res) => {
// try {
// const data = readData();
//const timelineData = data.timelines || {}; // Adjust according to the structure of your data.json
//res.json(timelineData);
// } catch (error) {
//  console.error('Error reading timeline data:', error);
// res.status(500).json({ success: false, error: 'Internal Server Error' });
// }
//});

// Endpoint to update currentValue and averageValue
//app.post('/api/update-values', (req, res) => {
// const { currentValue, averageValue } = req.body;

//if (currentValue === undefined || averageValue === undefined) {
//return res.status(400).json({ success: false, error: 'Invalid input' });
//}

//try {
//const data = readData();
//data.currentValue = currentValue;
//data.averageValue = averageValue;

//fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
//res.json({ success: true });
//} catch (error) {
//console.error('Error updating values:', error);
//res.status(500).json({ success: false, error: 'Internal Server Error' });
// }
//});

// Root endpoint to verify server is running
app.get("/", (req, res) => {
  res.send("Welcome to the API server");
});

// Listen on all network interfaces
app.listen(port, () => {
  console.log(`Server running on http://192.168.1.20:${port}`);
});
