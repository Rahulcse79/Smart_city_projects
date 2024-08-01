import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import OnBulb from "../Image/onbulb.jpg"; 
import OffBulb from "../Image/offbulb.jpg"; 

export default function Smart_home() {

  const BaseUrl = process.env.REACT_APP_API_URL || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "3000";
  const CookieName = process.env.REACT_APP_COOKIENAME || "NeoTech";
  const Token = Cookies.get(CookieName);
  const navigate = useNavigate();

  const [isBulbOn, setIsBulbOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);

  const toggleBulb = () => {
    setIsBulbOn((prevState) => !prevState);
  };

  const toggleFan = () => {
    setIsFanOn((prevState) => !prevState);
  };


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
  }, [BaseUrl, Token, navigate, PORT]);

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <h1 className="text-light">Smart Home</h1>

        {/* Bulb Card */}
        <div className="card">
          <img
            src={isBulbOn ? OnBulb : OffBulb} // Dynamically switch between on and off images
            alt={isBulbOn ? "Bulb On" : "Bulb Off"}
            className="card-img"
            onClick={toggleBulb} // Toggle bulb state when clicked
          />
          <div className="card-content">
            <h2 className="card-title textlight">
              {isBulbOn ? "Bulb is On" : "Bulb is Off"}
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}
