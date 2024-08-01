import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Dustbin from '../Image/dustbin.jpg';

const App = () => {

  const markers = [
    { id: 1, position: [28.618256, 77.386015], name: 'Smart dustbin', imageUrl: Dustbin }
  ];

  return (
    <div className="App">
      <h1>React Leaflet Example</h1>
      <MapContainer center={[28.618256, 77.386015]} zoom={12} style={{ width: '95%', height: '400px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
         {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup openPopup>
              <div>
                <h3>{marker.name}</h3>
                <img src={marker.imageUrl} alt={marker.name} style={{ maxWidth: '20px', height: '30px' }} />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
