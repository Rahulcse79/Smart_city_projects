import React, { useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Setting() {

  const BaseUrl = process.env.REACT_APP_API_URL || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "3000";
  const CookieName = process.env.REACT_APP_COOKIENAME || "NeoTech";
  const Token = Cookies.get(CookieName);
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
      <div className='textlight'>Setting</div>
    </>
  )
}
