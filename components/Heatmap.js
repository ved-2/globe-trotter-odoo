// components/Heatmap.js

import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
);
// import HeatmapLayer from 'react-leaflet-heatmap-layer-v3';


const Heatmap = ({ data }) => {
  const position = [23.2156, 72.6369]; // Centered on Gandhinagar, Gujarat

  return (
    <MapContainer center={position} zoom={7} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data && data.length > 0 && (
        <HeatmapLayer
          fitBoundsOnLoad
          fitBoundsOnUpdate
          points={data}
          longitudeExtractor={m => m[1]}
          latitudeExtractor={m => m[0]}
          intensityExtractor={m => parseFloat(m[2])}
        />
      )}
    </MapContainer>
  );
};

export default Heatmap;