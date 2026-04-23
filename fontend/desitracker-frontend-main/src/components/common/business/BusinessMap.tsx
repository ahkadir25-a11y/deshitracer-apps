import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const logoIcon = new L.Icon({
  iconUrl: "/marker.png", // Replace with your actual marker
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const BusinessMap = ({ location }: { location?: { lat?: number; long?: number } }) => {
  const hasLocation = location?.lat && location?.long;

  if (!hasLocation) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <FaMapMarkerAlt className="text-rose-500" />
        <h2 className="text-xl font-semibold text-gray-800">Find Us!</h2>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-md border border-gray-300"
        style={{ height: "350px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <MapContainer
          center={[location.lat ?? 41.9028, location.long ?? 12.4964]}
          zoom={13}
          minZoom={12}
          maxZoom={18}
          scrollWheelZoom={true}
          dragging={true}
          zoomControl={false}
          className="h-full w-full z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[location.lat ?? 41.9028, location.long ?? 12.4964]} icon={logoIcon}>
            <Popup>This is our location.</Popup>
          </Marker>
        </MapContainer>
      </motion.div>
    </div>
  );
};

export default BusinessMap;
