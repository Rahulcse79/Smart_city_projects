import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { IoLocationSharp } from 'react-icons/io5';
import Dustbin from '../Image/dustbin.jpg';
import L from 'leaflet';

const App = ({LevelValue}) => {
  const markers = [
    { id: 1, position: [28.618256, 77.386015], name: 'Smart dustbin', imageUrl: Dustbin }
  ];

  const customIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/ios-filled/50/000000/marker.png', 
    iconSize: [25, 41], 
    iconcolor: ['#a80520'],
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
  });

  return (
    <div className="map-card">
      <h1>Locate Dustbin Here</h1>
      <MapContainer center={[28.618256, 77.386015]} zoom={12} style={{ width: '100%', height: '400px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={customIcon}>
            <Popup>
              <div>
                <h3>{marker.name}</h3>
                <div>
                <img src={marker.imageUrl} alt={marker.name} style={{ maxWidth: '80px', height: 'auto' }} />
                <p>Depth : {LevelValue?LevelValue.depth+" cm":""}</p>
                <p>Gas : {LevelValue?LevelValue.gas+" pa":""}</p>
                <p>Temperature : {LevelValue?LevelValue.temp+" °C":""}</p>
                <p>Humidity : {LevelValue?LevelValue.humidity+" %":""}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
