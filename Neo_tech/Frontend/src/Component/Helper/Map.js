import React, { useEffect, useRef } from "react";
import GoogleMapReact from "google-map-react";

const GoogleMap = ({ apiKey }) => {
  const mapRef = useRef(null);

  const defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33,
    },
    zoom: 11,
  };

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.map_;
      if (map) {
        // Enable Street View
        const streetViewService = new window.google.maps.StreetViewService();
        const streetView = new window.google.maps.StreetViewPanorama(
          document.getElementById("street-view"), {
            position: { lat: defaultProps.center.lat, lng: defaultProps.center.lng },
            pov: { heading: 165, pitch: 0 },
            zoom: 1
          });
        map.setStreetView(streetView);
      }
    }
  }, []);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", height: "400px", width: "95%" }}>
        <div style={{ flex: 1, height: "100%" }}>
          <GoogleMapReact
            ref={mapRef}
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
          />
        </div>
        <div id="street-view" style={{ flex: 1, height: "100%" }} />
      </div>
    </>
  );
};

export default GoogleMap;
