import { GoogleMap, Marker } from "@react-google-maps/api"
import { useMemo } from "react"
import "./Map.css"

function Map({ geolocation }) {
  const center = useMemo(() => (geolocation), [])

  return (
    <GoogleMap zoom={15} center={center} mapContainerClassName="map-container">
      <Marker position={center} />
    </GoogleMap>
  )
}
export default Map