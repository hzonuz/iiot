import React, { useEffect, useState, useRef } from 'react';
import { Line as LineJS } from 'chart.js/auto'
import { Line } from 'react-chartjs-2';
import WebSocketInstance from './WebSocketService';

const RealTimeChart = () => {
    const [data, setData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Temperature (°C)',
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                data: [],
            },
            {
                label: 'Humidity (%)',
                borderColor: 'rgba(255,165,0,1)',
                backgroundColor: 'rgba(255,165,0,0.2)',
                data: [],
            },
        ],
    });

    const updateChart = (newData) => {
        setData((prevData) => {
            let updatedLabels, updatedTempData, updatedHumData;
            if (prevData.labels[prevData.labels.length - 1] !== newData.time)
            {
                updatedLabels = [...prevData.labels, newData.time];
                updatedTempData = [...prevData.datasets[0].data, newData.temperature];
                updatedHumData = [...prevData.datasets[1].data, newData.humidity];
            }
            else
            {
                updatedLabels = [...prevData.labels];
                updatedTempData = [...prevData.datasets[0].data];
                updatedHumData = [...prevData.datasets[1].data];
            }
          

            return {
                ...prevData,
                labels: updatedLabels,
                datasets: [
                    {
                        ...prevData.datasets[0],
                        data: updatedTempData,
                    },
                    {
                        ...prevData.datasets[1],
                        data: updatedHumData,
                    },
                ],
            };
        });
    };

    useEffect(() => {
        WebSocketInstance.connect();
        WebSocketInstance.addCallbacks(updateChart);

        return () => {
            console.log("BASSSTE");
            WebSocketInstance.socketRef.close();
        };
    }, []);

    return (
        <div>
            <h2>Real-Time Sensor Data</h2>
            <Line data={data} />
        </div>
    );
};

export default RealTimeChart;