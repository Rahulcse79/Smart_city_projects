import React, { useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Setting() {

  const BaseUrl = window.location.hostname || "localhost";
  const Token = Cookies.get("session");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const TokenData = JSON.parse(Token);
        const response = await fetch(`http://${BaseUrl}:3000/checkAuth`, {
          method: "post",
          headers: {
            Authorization: "Bearer " + TokenData.AuthToken,
          },
        });
        const data = await response.json();
        if (data.status === 1) {
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
      <div className='textlight'>Setting</div>
    </>
  )
}
