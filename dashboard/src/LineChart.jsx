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

const hubs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const colors = [
  "rgba(75,192,192,1)",
  "rgba(153,102,255,1)",
  "rgba(255,159,64,1)",
  "rgba(255,99,132,1)",
  "rgba(54,162,235,1)",
  "rgba(255,206,86,1)",
];

const LineChart = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedHubs, setSelectedHubs] = useState([]);

  // const [data, setData] = useState([
  //   {
  //     labels: [],
  //     datasets: [
  //       {
  //         label: "Temperature (°C)",
  //         borderColor: "rgba(75,192,192,1)",
  //         backgroundColor: "rgba(75,192,192,0.2)",
  //         data: [],
  //       },
  //       {
  //         label: "Humidity (%)",
  //         borderColor: "rgba(255,165,0,1)",
  //         backgroundColor: "rgba(255,165,0,0.2)",
  //         data: [],
  //       },
  //     ],
  //   },
  // ]);
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
          const processedData = response.data.map((d) => ({
            time: d.time,
            temperature: d.temperature,
            humidity: d.humidity,
            hub_id: d.hub_id
          }));
          setData(processedData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
      setLoading(false);
      console.log(startDateTime.toISOString());
    }
  };

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

  const processDataForChart = () => {
    const hubDataMap = selectedHubs.reduce((acc, hub_id) => {
        acc[hub_id] = {
            time: [],
            temperature: [],
            humidity: []
        };
        return acc;
    }, {});

    data.forEach(item => {
        const { hub_id, time, temperature, humidity } = item;
        if (selectedHubs.includes(hub_id)) {
            // The time is in "YYYY/MM/DD, HH:mm:ss" format. Converting it to a Date object.
            const dateTime = new Date(time.replace(',', ''));
            hubDataMap[hub_id].time.push(dateTime);
            hubDataMap[hub_id].temperature.push(temperature);
            hubDataMap[hub_id].humidity.push(humidity);
        }
    });

    const datasets = [];
    
    Object.keys(hubDataMap).forEach((hub_id, index) => {
        datasets.push({
            label: `Hub ${hub_id} - Temperature`,
            data: hubDataMap[hub_id].time.map((time, i) => ({
                x: time,
                y: hubDataMap[hub_id].temperature[i],
            })),
            fill: false,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            yAxisID: 'y-axis-temperature',
        });
        datasets.push({
            label: `Hub ${hub_id} - Humidity`,
            data: hubDataMap[hub_id].time.map((time, i) => ({
                x: time,
                y: hubDataMap[hub_id].humidity[i],
            })),
            fill: false,
            backgroundColor: colors[(index + 3) % colors.length], // offset for humidity colors
            borderColor: colors[(index + 3) % colors.length],
            yAxisID: 'y-axis-humidity',
        });
    });

    return { datasets };
};

const options = {
    responsive: true,
    scales: {
        x: {
            type: 'timeseries',
            time: {
                unit: 'minute',
            },
            title: {
                display: true,
                text: 'Time',
            },
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-temperature',
            title: {
                display: true,
                text: 'Temperature',
            },
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-humidity',
            title: {
                display: true,
                text: 'Humidity',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
    },
};

  // const generateChartData = () => {
  //   const cfgs = [];
  //   selectedHubs.forEach((element, index) => {
  //     const hub_data = data.filter((d) => d.hub_id === element);
  //     console.log(hub_data);
  //     cfgs.push({
  //       // label: `Hub ${element} - Temperature`,
  //       datasets: [{
  //       data: hub_data.map(hub =>  ({x: hub.time, y: hub.temperature}
  //       ))
  //     }],
  //       fill: false,
  //       backgroundColor: colors[index % colors.length],
  //       borderColor: colors[index % colors.length],
  //       yAxisID: "y-axis-temperature",
  //     });
  //     cfgs.push({
  //       // label: `Hub ${element} - Humidity`,
  //       datasets: [{
  //         data: hub_data.map(hub => ( {x: hub.time, y: hub.humidity}
  //         ))
  //       }],
  //       fill: false,
  //       backgroundColor: colors[(index + 3) % colors.length], // offset for humidity colors
  //       borderColor: colors[(index + 3) % colors.length],
  //       yAxisID: "y-axis-humidity",
  //     });
  //   });

  //   return { cfgs };
  // };

  // const options = {
  //   responsive: true,
  //   scales: {
  //     x: {
  //       title: {
  //         display: true,
  //         text: "Time",
  //       },
  //     },
  //     y: {
  //       type: "linear",
  //       display: true,
  //       position: "left",
  //       id: "y-axis-temperature",
  //       title: {
  //         display: true,
  //         text: "Temperature",
  //       },
  //     },
  //     y1: {
  //       type: "linear",
  //       display: true,
  //       position: "right",
  //       id: "y-axis-humidity",
  //       title: {
  //         display: true,
  //         text: "Humidity",
  //       },
  //       grid: {
  //         drawOnChartArea: false,
  //       },
  //     },
  //   },
  // };

  const chartData = {
    labels: data.map((d) => d.timestamp),
    datasets: [
      {
        label: "Temperature",
        data: data.map((d) => d.temperature),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
      {
        label: "Humidity",
        data: data.map((d) => d.humidity),
        borderColor: "rgba(153,102,255,1)",
        fill: false,
      },
    ],
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
          {/* <Line data={chartData} /> */}
          {(data).length > 0 ? (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Temperature and Humidity Data
              </Typography>
              <Line data={processDataForChart()} options={options} />
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
