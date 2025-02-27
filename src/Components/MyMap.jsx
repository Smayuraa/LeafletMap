import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import "./MyMap.css";

// Fix default marker icon issue
const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [35, 50],
  iconAnchor: [17, 50],
});

// Geocoding API to get latitude & longitude
const getCoordinates = async (city) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
  );
  const data = await response.json();
  if (data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } else {
    return null;
  }
};

// Routing Component
const RoutingMachine = ({ from, to }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      routeWhileDragging: true,
      createMarker: () => null, // Hide default markers
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, from, to]);

  return null;
};

const MyMap = () => {
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [location1, setLocation1] = useState(null);
  const [location2, setLocation2] = useState(null);
  const [distance, setDistance] = useState(null);

  const handleSearch = async () => {
    if (city1 && city2) {
      const loc1 = await getCoordinates(city1);
      const loc2 = await getCoordinates(city2);

      if (loc1 && loc2) {
        setLocation1(loc1);
        setLocation2(loc2);

        // Calculate Distance
        const lat1 = loc1[0];
        const lon1 = loc1[1];
        const lat2 = loc2[0];
        const lon2 = loc2[1];

        const R = 6371; // Radius of Earth in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        setDistance(distanceKm.toFixed(2)); // Distance in km
      } else {
        alert("Invalid city names. Try again.");
      }
    } else {
      alert("Please enter both city names.");
    }
  };

  return (
    <div className="map-wrapper">
      <h2 className="map-title">City Distance Calculator</h2>

      {/* Search Inputs */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter first city"
          value={city1}
          onChange={(e) => setCity1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter second city"
          value={city2}
          onChange={(e) => setCity2(e.target.value)}
        />
        <button onClick={handleSearch}>Find Distance</button>
      </div>

      {/* {distance && (
        <p className="distance-text">Distance: {distance} km</p>
      )} */}

      <MapContainer center={[20, 78]} zoom={5} className="map-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {location1 && (
          <Marker position={location1} icon={defaultIcon}>
            <Popup>📍 {city1}</Popup>
          </Marker>
        )}

        {location2 && (
          <Marker position={location2} icon={defaultIcon}>
            <Popup>📍 {city2}</Popup>
          </Marker>
        )}

        {location1 && location2 && <RoutingMachine from={location1} to={location2} />}
      </MapContainer>
    </div>
  );
};

export default MyMap;
