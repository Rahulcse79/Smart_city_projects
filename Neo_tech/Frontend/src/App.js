import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WasteManagment from './Component/Smart_IOT/Waste_management';
import Setting from './Component/Helper/Setting';
import Dashboard from './Component/Helper/Dashboard';
import LogIn from './Component/Helper/LogIn';
import NumberPlateDetection from './Component/Smart_IOT/Number_plate_detection';

function App() {

  document.body.style.backgroundColor = 'Black';

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Dashboard/>}/>
          <Route path="/system-setting" element={<Setting/>}/>
          <Route path="/login" element={<LogIn/>}/>
          <Route path="/waste_management" element={<WasteManagment/>}/>
          <Route path="/number_plate_detection" element={<NumberPlateDetection/>}/>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
