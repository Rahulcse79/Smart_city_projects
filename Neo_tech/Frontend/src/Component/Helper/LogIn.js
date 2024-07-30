import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Image/logoDark.png"

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const BaseUrl = window.location.hostname || "localhost";

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (username === "") {
      alert("Username is required.");
      return;
    } else if (password === "") {
      alert("Password is required.");
      return;
    }
    try {
      let result = await fetch(`http://${BaseUrl}:3023/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      result = await result.json();
      if (result.success) {
        const Data = {
          AuthToken: result.AuthToken,
        }
        const cookieString = `NeoTech=${JSON.stringify(Data)}`;
        document.cookie = cookieString;

        navigate("/");
      } else {
        alert("Incorrect Email and password.");
      }
    } catch (error) {
      alert("Server error, please try again.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="login-container21">
        <img className="login-img" width={350} src ={Logo} alt ='Loading...'/>
        <form onSubmit={handleSubmit} className="login-form21">
          <h2>Login</h2>
          <div className="form-control21">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="form-control21">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
}
