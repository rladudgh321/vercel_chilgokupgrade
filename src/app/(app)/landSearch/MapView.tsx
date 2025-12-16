"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    kakao?: any;
  }
}

type Listing = {
  id: number;
  title?: string;
  address?: string; // 옵션: 주소가 있으면 지오코딩
  mapLocation?: string; // "lat,lng" (좌표가 있으면 이 값을 우선 사용)
  isAddressPublic?: "public" | "private" | "exclude";
};

type Props = {
  listings: Listing[];
  width?: number | string;
  height?: number | string;
  onClusterClick?: (listingIds: number[]) => void;
  view: string;
};

const MapView = ({
  listings,
  width = "100%",
  height = "100%",
  onClusterClick,
  view,
}: Props) => {
  const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const onClusterClickRef = useRef(onClusterClick);

  useEffect(() => {
    onClusterClickRef.current = onClusterClick;
  }, [onClusterClick]);

  useEffect(() => {
    if (view === 'map' && mapRef.current) {
      // The map container might have been hidden and is now visible.
      // We need to relayout the map to ensure it fits the container.
      setTimeout(() => {
        mapRef.current.relayout();
      }, 0);
    }
  }, [view]);

  const circleStyle = (size: number, bg: string) => ({
    width: `${size}px`,
    height: `${size}px`,
    background: bg,
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: `${size + 1}px`,
    textAlign: "center" as const,
    borderRadius: `${Math.round(size / 2)}px`,
    boxShadow:
      "0 3px 10px rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255,255,255,0.85)",
  });

  const refreshMarkers = useCallback(async (items: Listing[]) => {
    const kakao = window.kakao;
    const map = mapRef.current;
    const clusterer = clustererRef.current;
    if (!kakao?.maps || !map || !clusterer) return;

    clusterer.clear();
    if (!items?.length) return;

    const geocoder = new kakao.maps.services.Geocoder();

    const toMarker = (it: Listing) =>
      new Promise<any>((resolve) => {
        if (it.mapLocation && it.mapLocation.includes(",")) {
          const [lat, lng] = it.mapLocation.split(",").map(Number);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            const pos = new kakao.maps.LatLng(lat, lng);
            const marker = new kakao.maps.Marker({
              position: pos,
              title: it.title ?? "",
            });
            marker.listingId = it.id;
            resolve(marker);
            return;
          }
        }
        if (it.address) {
          geocoder.addressSearch(it.address, (result: any[], status: any) => {
            if (status === kakao.maps.services.Status.OK && result?.[0]) {
              const pos = new kakao.maps.LatLng(result[0].y, result[0].x);
              const marker = new kakao.maps.Marker({
                position: pos,
                title: it.title ?? "",
              });
              marker.listingId = it.id;
              resolve(marker);
            } else {
              resolve(null);
            }
          });
          return;
        }
        resolve(null);
      });

    const markers = (await Promise.all(items.map(toMarker))).filter(Boolean);
    if (!markers.length) return;

    markers.forEach((marker) => {
      kakao.maps.event.addListener(marker, "click", () => {
        if (onClusterClickRef.current && marker.listingId) {
          onClusterClickRef.current([marker.listingId]);
        }
      });
    });

    clusterer.addMarkers(markers);
    if (markers.length > 0) {
      map.panTo(markers[0].getPosition());
    }
  }, []);

  const initMap = useCallback(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || !containerRef.current || mapRef.current) return;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 8,
    });
    mapRef.current = map;

    const mapTypeControl = new kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    if (!kakao.maps.MarkerClusterer) {
      console.error("Kakao Maps MarkerClusterer library is not loaded.");
      return;
    }

    const clusterer = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 1,
      gridSize: 70,
      disableClickZoom: true,
      calculator: [10, 30, 50, 100, 200],
      styles: [
        circleStyle(36, "#7F56D9"),
        circleStyle(42, "#6E59A5"),
        circleStyle(48, "#5B4A8A"),
        circleStyle(56, "#4B3B76"),
        circleStyle(64, "#3A2C62"),
        circleStyle(76, "#2A1E4E"),
      ],
    });
    clustererRef.current = clusterer;

    kakao.maps.event.addListener(clusterer, "clusterclick", (cluster: any) => {
      if (onClusterClickRef.current) {
        const markersInCluster = cluster.getMarkers();
        const listingIds = markersInCluster.map((m: any) => m.listingId).filter(Boolean);
        if (listingIds.length > 0) {
          onClusterClickRef.current(listingIds);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
            initMap();
        });
    }
  }, [initMap]);

  useEffect(() => {
    if (mapRef.current && clustererRef.current) {
      void refreshMarkers(listings);
    }
  }, [listings, refreshMarkers]);

  if (!KAKAO_KEY) {
    return (
      <div style={{ padding: 12, color: "#b91c1c" }}>
        환경변수 <code>NEXT_PUBLIC_KAKAO_MAP_KEY</code>가 비어 있습니다.
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} style={{ width, height }} />
    </>
  );
};

export default MapView;
