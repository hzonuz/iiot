import React, { useEffect, useState, useRef } from "react";
import { Line as LineJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import {
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  CircularProgress,
  FormControl,
  Checkbox,
  ListItemText,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import axios from "axios";

const API_URL = "http://localhost:8000";

const colors = [
  "rgba(31, 119, 180, 1)", // Blue
  "rgba(44, 160, 44, 1)",
  "rgba(255, 127, 14, 1)", // Orange
  "rgba(140, 86, 75, 1)", // Brown
  "rgba(188, 189, 34, 1)",
  "rgba(214, 39, 40, 1)",
  "rgba(148, 103, 189, 1)",
  "rgba(23, 190, 207, 1)",
  "rgba(227, 119, 194, 1)", // Pink
  "rgba(127, 127, 127, 1)", // Gray
];

const LineChart = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedHubs, setSelectedHubs] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [data, setData] = useState([]);

  const fetchData = async (startDateTime, endDateTime) => {
    setToken(localStorage.getItem("token"));
    if (token) {
      axios
        .get(
          `${API_URL}/api/data?start=${startDateTime.toISOString()}&end=${endDateTime.toISOString()}&hub_ids=${selectedHubs}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          const processedData = response.data.data.map((d) => ({
            time: d.time,
            temperature: d.temperature,
            humidity: d.humidity,
            hub_id: d.hub_id,
          }));
          setData(processedData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/hubs");
        const hubData = await response.json();
        setHubs(hubData.hubs);
      } catch (error) {
        console.error("Error fetching hubs:", error);
      }
    };
    fetchHubs();
  }, []);

  useEffect(() => {
    if (loading) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startTime.getHours() - 1);
      startDateTime.setMinutes(startTime.getMinutes());

      setStartTime(startDateTime);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endTime.getHours());
      endDateTime.setMinutes(endTime.getMinutes());

      fetchData(startDateTime, endDateTime);
    }
  }, []);

  const handleFilter = () => {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours());
    startDateTime.setMinutes(startTime.getMinutes());

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours());
    endDateTime.setMinutes(endTime.getMinutes());

    setLoading(true);
    fetchData(startDateTime, endDateTime);
  };

  const generateChartData = () => {
    const datasets = [];
    selectedHubs.forEach((element, index) => {
      const hub_data = data.filter((d) => d.hub_id === element);
      datasets.push({
        label: `Hub ${element} - Temperature`,
        data: hub_data.map((hub) => ({ x: hub.time, y: hub.temperature })),
        fill: false,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        yAxisID: "y-axis-temperature",
      });
      datasets.push({
        label: `Hub ${element} - Humidity`,
        data: hub_data.map((hub) => ({ x: hub.time, y: hub.humidity })),
        fill: false,
        backgroundColor: colors[(index + 5) % colors.length], // offset for humidity colors
        borderColor: colors[(index + 5) % colors.length],
        yAxisID: "y-axis-humidity",
      });
    });

    return { datasets };
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      "y-axis-temperature": {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Temperature",
        },
      },
      "y-axis-humidity": {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Humidity",
        },
        grid: {
          drawOnChartArea: false,
          display: false,
        },
      },
    },
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Date and Time Filters
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <FormControl variant="outlined">
            <InputLabel>Hubs</InputLabel>
            <Select
              label="Hubs"
              multiple
              value={selectedHubs}
              onChange={(e) => setSelectedHubs(e.target.value)}
              renderValue={(selected) => selected.join(", ")}
              sx={{ minWidth: 90 }}
            >
              {hubs.map((hub) => (
                <MenuItem key={hub} value={hub}>
                  <Checkbox checked={selectedHubs.indexOf(hub) > -1} />
                  <ListItemText primary={hub} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFilter}
            sx={{ alignSelf: "center" }}
          >
            Filter
          </Button>
        </Box>
      </Paper>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <div>
          <h2>Sensor Data</h2>
          {data.length > 0 ? (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Temperature and Humidity Data
              </Typography>
              <Line data={generateChartData()} options={options} />
            </Paper>
          ) : (
            <Typography variant="body2">
              No data available for the selected filters.
            </Typography>
          )}
        </div>
      )}
    </Box>
  );
};

export default LineChart;
