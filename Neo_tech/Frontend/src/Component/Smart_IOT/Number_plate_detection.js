import React,{ useEffect} from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Number_plate_detection() {

  const BaseUrl = window.location.hostname || "localhost";
  const Token = Cookies.get("NewTech");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const TokenData = JSON.parse(Token);
        const response = await fetch(`http://${BaseUrl}:3023/checkAuth`, {
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
  }, [BaseUrl, Token, navigate]);


  return (
    <>
      <Sidebar/>
      <div className='textlight'>Number Plate Detection</div>
    </>
  )
}
