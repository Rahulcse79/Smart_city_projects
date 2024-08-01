import React,{ useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
// import PieChartComponent from "./cards/Piechart";
// import DashboardCard from "./cards/index";
// import { Container, Row, Col } from "react-bootstrap";
// import { FaMobileAlt, FaClock, FaHistory } from "react-icons/fa";

const Dashboard = () => {

  const BaseUrl = process.env.REACT_APP_API_URL || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "3000";
  const Token = Cookies.get("NeoTech");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, [BaseUrl, Token, navigate, PORT]);

  return (
    <>
      <Sidebar/>
      <div className='textlight'>Dashboard</div>
      {/* <Container fluid className="dashboard-container rows-flex">
        <Row className="dashboard-row column-flex">
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Connected devices"
              value="2"
              color="#8cbed6"
              icon={<FaMobileAlt />}
            />
          </Col>
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Time schedule"
              // value={timeschedule}
              color="#8cbed6"
              icon={<FaClock />}
            />
          </Col>
          <Col md={3}>
            <DashboardCard
              className="dash-card"
              title="Total histories"
              // value={countHistory}
              color="#8cbed6"
              icon={<FaHistory />}
            />
          </Col>
        </Row>

        <Row className="dashboard-row">
          <Col md={3}>
            <PieChartComponent 
           // memUsage={systemHealth.data.totalCpu} 
            title ="CPU Usage"
            used = 'CPU Used'
            unused = 'CPU Unused'
            />
            
          </Col>
          <Col md={3}>
            <PieChartComponent 
           // memUsage={systemHealth.data.diskUsage.diskUsage}
            title = "Disk Usage"
            used = 'Disk Used'
            unused = 'Disk Unused'
            />
          </Col>
          <Col md={3}>
           <PieChartComponent 
           // memUsage={systemHealth.data.ramUsage.memUsage}
            title = "RAM Usage"
            used = 'RAM Used'
            unused = 'RAM Unused'
            />
          </Col>
        </Row>
      </Container> */}
    </>
  )
}
export default Dashboard;
