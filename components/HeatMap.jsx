
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {HeatmapLayer} from "react-leaflet-heatmap-layer-v3";

const Heatmap = ({ points }) => {
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <HeatmapLayer
        points={points}
        latitudeExtractor={point => point[0]}
        longitudeExtractor={point => point[1]}
        intensityExtractor={point => point[2]}
        radius={15}
        blur={20}
        max={1.0}
      />
    </MapContainer>
  );
};

export default Heatmap;
