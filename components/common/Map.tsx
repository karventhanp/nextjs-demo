"use client";

import { GoogleMap, useJsApiLoader, KmlLayer } from "@react-google-maps/api";
import Skeleton from "./Skeleton";
import { useEffect, useState } from "react";
import { getValidUrl } from "@/helpers/helper";

const containerStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};
const mapStyles = [
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [
      {
        fontSize: "0.75rem",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text",
    stylers: [
      {
        fontSize: "0.625rem",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        fontSize: "0.625rem",
      },
    ],
  },
];
const center = {
  lat: 12.9905748,
  lng: 80.2429236,
};

interface MapProps {
  url: string;
  userId: string;
}

const Map: React.FC<MapProps> = ({ url, userId }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!,
  });
  const [mapUrl, setMapUrl] = useState<string>();

  useEffect(() => {
    setMapUrl(getValidUrl(url, userId));
  }, [url]);

  return (
    <div className="h-full w-full">
      {!isLoaded ? (
        <div className="h-full w-full">
          <Skeleton type="box" />
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyles}
          center={center}
          zoom={14}
          options={{
            mapTypeId: "satellite",
            styles: mapStyles,
            scaleControl: true,
          }}
        >
          <KmlLayer url={mapUrl} />
        </GoogleMap>
      )}
    </div>
  );
};

export default Map;
