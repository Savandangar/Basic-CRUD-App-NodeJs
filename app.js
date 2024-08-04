const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const generateUniqueId = require("generate-unique-id");
const port = 4801;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON and form data in request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the homepage at the root URL
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "..", "index.html");
  res.sendFile(indexPath);
});

app.get("/data", (req, res) => {
  const filePath = "data.json";

  // Read data from the JSON file and send it as a response
  fs.readFile(filePath, "utf-8", (err, cars) => {
    if (err) {
      console.error("Error reading data.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const data = JSON.parse(cars);
    res.status(200).json(data);
  });
});

// Handle POST requests to create a new record
app.post("/create", (req, res) => {
  const { name, model, color, year } = req.body;
  const data = fs.readFileSync("data.json");
  const jsonData = JSON.parse(data);

  // Add new data to the JSON array
  const newRecord = {
    id: generateUniqueId(),
    name: name,
    model: model,
    color: color,
    year: year,
  };
  jsonData.cars.push(newRecord);
  // Write the data to the file
  fs.writeFile("data.json", JSON.stringify(jsonData, null, 4), (err) => {
    if (err) {
      res.json({ status: 500, message: "Internal server error" });
    } else {
      console.log("Data added succesfully");
      res.json({
        status: 201,
        message: "Record added successfully",
        newRecord,
      });
    }
  });
});

// Handle GET requests to retrieve data

// Handle PUT requests to update a record by ID
app.put("/data/:id", (req, res) => {
  const id = req.params.id;
  const { name, model, color, year } = req.body;
  const filePath = "data.json";

  // Read data from the JSON file
  fs.readFile(filePath, "utf-8", (err, cars) => {
    if (err) {
      console.error("Error reading file data.json .", err);
      res.status(500).json({ status: 500, message: "Internal Server Error." });
      return;
    }
    const jsonData = JSON.parse(cars);

    // Find the index of the record with the specified ID
    const indexToUpdate = jsonData.cars.findIndex((item) => item.id === id);

    if (indexToUpdate != -1) {
      // Update the record in the JSON array
      jsonData.cars[indexToUpdate] = {
        id: id,
        name: name,
        model: model,
        color: color,
        year: year,
      };
      const editedCar = jsonData.cars[indexToUpdate];
      // Write the updated data back to the file
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), (err) => {
        if (err) {
          console.error("Error writing data.json:", err);
          res
            .status(500)
            .json({ status: 500, message: "Internal Server Error" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Record edited successfully.",
            editedCar,
          });
        }
      });
    } else {
      // If the record with the specified ID was not found
      res.status(404).json({ status: 404, message: "Record not found." });
    }
  });
});

// Handle DELETE requests to delete a record by ID
app.delete("/data/:id", (req, res) => {
  const id = req.params.id;
  const filePath = "data.json";

  // Read data from the JSON file
  fs.readFile(filePath, "utf-8", (err, cars) => {
    if (err) {
      console.error("Error reading data.json:", err);
      res.status(500).json({ status: 500, message: "Internal Server Error" });
      return;
    }

    const jsonData = JSON.parse(cars);

    //  Find the index of the record with the specified ID
    const indexToDelete = jsonData.cars.findIndex((item) => item.id === id);

    if (indexToDelete != -1) {
      // Remove the record from the JSON arra
      jsonData.cars.splice(indexToDelete, 1);

      // Write the updated data back to the file
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), (err) => {
        if (err) {
          console.error("Error writing data.json:", err);
          res
            .status(500)
            .json({ status: 500, message: "Internal Server Error" });
        } else {
          res
            .status(200)
            .json({ status: 200, message: "Record deleted successfully." });
        }
      });
    } else {
      // If the record with the specified ID was not found
      res.status(404).json({ status: 404, message: "Record not found." });
    }
  });
});

// Start the Express app and listen on the specified port
app.listen(port, () => {
  console.log(`App live at http://localhost:${port}`);
});
