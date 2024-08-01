import React,{ useEffect, useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import PieChartComponent from "./cards/Piechart";
import DashboardCard from "./cards/index";
import { Container, Row, Col } from "react-bootstrap";
import { FaMobileAlt, FaClock, FaHistory } from "react-icons/fa";

const Dashboard = () => {

  const [dataPointsUltrasonic, setDataPointsOfUltrasonic] = useState(null);
  const [dataPointsOfTemp, setDataPointsOfTemp] = useState(null);
  const [dataPointsOfGas, setDataPointsOfGas] = useState(null);
  const [dataPointsOfHumidity, setDataPointsOfHumidity] = useState(null);
  const BaseUrl = process.env.REACT_APP_API_URL || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "3000";
  const Token = Cookies.get("NeoTech");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!Token) navigate("/login");
        const TokenData = JSON.parse(Token);
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
    fetchData();
    
    const fetchData2 = async () => {
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
          y: parseFloat(item.message.temperature),
        }));

        let formattedData2 = responseData.data.map((item, index) => ({
          y: parseFloat(item.message.fill_level),
        }));

        let formattedData3 = responseData.data.map((item, index) => ({
          y: parseFloat(item.message.air_quality),
        }));

        let formattedData4 = responseData.data.map((item, index) => ({
          y: parseFloat(item.message.humidity),
        }));

        if (formattedData1.length > 1) {
          formattedData1 = formattedData1.slice(-1);
        }
        if (formattedData2.length > 1) {
          formattedData2 = formattedData2.slice(-1);
        }
        if (formattedData3.length > 1) {
          formattedData3 = formattedData3.slice(-1);
        }
        if (formattedData4.length > 1) {
          formattedData4 = formattedData4.slice(-1);
        }
        setDataPointsOfUltrasonic(formattedData2);
        setDataPointsOfTemp(formattedData1);
        setDataPointsOfGas(formattedData3);
        setDataPointsOfHumidity(formattedData4);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(() => {
      fetchData2();
    }, 1000);
    return () => clearInterval(interval);
  }, [BaseUrl, Token, navigate, PORT, setDataPointsOfUltrasonic, setDataPointsOfTemp, setDataPointsOfGas,setDataPointsOfHumidity]);

  return (
    <>
      <Sidebar/>
      <div className='textlight'>Dashboard</div>
      <Container fluid className="dashboard-container rows-flex">
        <Row className="dashboard-row column-flex">
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Dustbin level"
              value={dataPointsUltrasonic?dataPointsUltrasonic[0].y:"null"}
              color="#8cbed6"
              icon={<FaMobileAlt />}
            />
          </Col>
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Gas level"
              value= {dataPointsOfGas?dataPointsOfGas[0].y:"null"}
              color="#8cbed6"
              icon={<FaClock />}
            />
          </Col>
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Humidity"
              value={dataPointsOfHumidity?dataPointsOfHumidity[0].y:"null"}
              color="#8cbed6"
              icon={<FaHistory />}
            />
          </Col>
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Temperature"
              value={dataPointsOfTemp?dataPointsOfTemp[0].y:"null"}
              color="#8cbed6"
              icon={<FaHistory />}
            />
          </Col>
        </Row>
      </Container>
    </>
  )
}
export default Dashboard;
