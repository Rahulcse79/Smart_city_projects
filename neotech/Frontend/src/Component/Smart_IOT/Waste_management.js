import React, { useState, useEffect } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import Sidebar from "../Sidebar/Sidebar";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Map from "../Helper/Map";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const IOTSenser = () => {

  const [dataPointsUltrasonic, setDataPointsOfUltrasonic] = useState([]);
  const [dataPointsOfTemp, setDataPointsOfTemp] = useState([]);
  const [dataPointsOfGas, setDataPointsOfGas] = useState([]);
  const [dataPointsOfHumidity, setDataPointsOfHumidity] = useState([]);
  const BaseUrl = process.env.REACT_APP_API_URL || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "3000";
  const CookieName = process.env.REACT_APP_COOKIENAME || "NeoTech";
  const Token = Cookies.get(CookieName);
  const navigate = useNavigate();

  useEffect(() => {
    if(!Token) navigate("/login");
    const fetchData = async () => {
      try {
        const TopicOfUltrasonic = process.env.REACT_APP_TOPIC || "home/ultrasonic/distance";
        const TokenData = JSON.parse(Token);
        const response = await fetch(`http://${BaseUrl}:${PORT}/api/data`, {
          method: "get",
          headers: {
            Authorization: "Bearer " + TokenData.AuthToken,
            topic: TopicOfUltrasonic,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const responseData = await response.json();
        let formattedData1 = responseData.data.map((item, index) => ({
          x: index + 1,
          y: parseFloat(item.message.temperature),
        }));

        let formattedData2 = responseData.data.map((item, index) => ({
          x: index + 1,
          y: parseFloat(item.message.fill_level),
        }));

        let formattedData3 = responseData.data.map((item, index) => ({
          x: index + 1,
          y: parseFloat(item.message.air_quality),
        }));

        let formattedData4 = responseData.data.map((item, index) => ({
          x: index + 1,
          y: parseFloat(item.message.humidity),
        }));

        if (formattedData1.length > 30) {
          formattedData1 = formattedData1.slice(-29);
        }
        if (formattedData2.length > 30) {
          formattedData2 = formattedData2.slice(-29);
        }
        if (formattedData3.length > 30) {
          formattedData3 = formattedData3.slice(-29);
        }
        if (formattedData4.length > 30) {
          formattedData4 = formattedData4.slice(-29);
        }

        setDataPointsOfUltrasonic(formattedData2);
        setDataPointsOfTemp(formattedData1);
        setDataPointsOfGas(formattedData3);
        setDataPointsOfHumidity(formattedData4);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchData2 = async () => {
      try {
        const TokenData = JSON.parse(Token);
        console.log(TokenData);
        const response = await fetch(`http://${BaseUrl}:${PORT}/checkAuth`, {
          method: "get",
          headers: {
            Authorization: "Bearer " + TokenData.AuthToken,
          },
        });
        const data = await response.json();
        if (data.success) {
          console.log("Token is valid.");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const interval = setInterval(() => {
      fetchData();
    }, 1000);
    fetchData2();
    return () => clearInterval(interval);
  }, [
    BaseUrl,
    Token,
    navigate,
    setDataPointsOfUltrasonic,
    setDataPointsOfTemp,
    setDataPointsOfGas,
    setDataPointsOfHumidity,
    PORT
  ]);

  const OptionsOfUltrasonic = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Total depth",
    },
    axisX: {
      title: "Index",
    },
    axisY: {
      title: "Total depth",
      minimum: 0,
      maximum: 75,
      interval: 5,
    },
    data: [
      {
        type: "line",
        lineColor: "blue",
        markerSize: 10,
        toolTipContent: "Index: {x}, Data: {y}",
        dataPoints: dataPointsUltrasonic,
      },
    ],
  };

  const OptionsOfTemp = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Temperature",
    },
    axisX: {
      title: "Index",
    },
    axisY: {
      title: "Temperature (°C)",
      minimum: 0,
      maximum: 50,
    },
    data: [
      {
        type: "line",
        lineColor: "blue",
        markerSize: 10,
        toolTipContent: "Index: {x}, Temperature: {y}°C",
        dataPoints: dataPointsOfTemp,
      },
    ],
  };

  const OptionsOfGas = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Gas",
    },
    axisX: {
      title: "Index",
    },
    axisY: {
      title: "Gas Level",
      includeZero: false,
      stripLines: [
        {
          value: 25,
          label: "Lower Limit",
          labelFontColor: "#333",
          labelAlign: "near",
          color: "rgba(0, 255, 0, 0.3)",
        },
        {
          value: 35,
          label: "Upper Limit",
          labelFontColor: "#333",
          labelAlign: "near",
          color: "rgba(255, 0, 0, 0.3)",
        },
      ],
    },
    data: [
      {
        type: "line",
        lineColor: "blue",
        markerSize: 10,
        toolTipContent: "Index: {x}, Data: {y}",
        dataPoints: dataPointsOfGas,
      },
    ],
  };

  const OptionsOfHumidity = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Humidity",
    },
    axisX: {
      title: "Index",
    },
    axisY: {
      title: "Humidity Level (%)",
      includeZero: false,
      stripLines: [
        {
          value: 25,
          label: "Lower Limit",
          labelFontColor: "red",
          labelAlign: "near",
          color: "rgba(0, 255, 0, 0.3)",
        },
        {
          value: 35,
          label: "Upper Limit",
          labelFontColor: "#333",
          labelAlign: "near",
          color: "rgba(255, 0, 0, 0.3)",
        },
      ],
    },
    data: [
      {
        type: "line",
        // Set the line color dynamically based on humidity level
        lineColor: (context) => {
          // context.dataPoint.y will give you the y-value (humidity level)
          const humidityLevel = context.dataPoint.y;

          // Change color if humidity is more than 20%
          if (humidityLevel > 20) {
            return "red"; // Red color for high humidity
          } else {
            return "blue"; // Blue color for normal humidity
          }
        },
        markerSize: 10,
        toolTipContent: "Index: {x}, Humidity: {y}%",
        dataPoints: dataPointsOfHumidity,
      },
    ],
  };

  return (
    <>
      <Sidebar />
      <div className="container mt-4">
        <div className="waste-container">
          <div className="chart-container">
            <CanvasJSChart options={OptionsOfUltrasonic} />
          </div>
          <div className="chart-container">
            <CanvasJSChart options={OptionsOfGas} />
          </div>
        </div>
        <div className="waste-container">
          <div className="chart-container">
            <CanvasJSChart options={OptionsOfTemp} />
          </div>
          <div className="chart-container">
            <CanvasJSChart options={OptionsOfHumidity} />
          </div>
        </div>
        <div className="waste-containerMap">
          <Map />
        </div>
      </div>
    </>
  );
};

export default IOTSenser;
