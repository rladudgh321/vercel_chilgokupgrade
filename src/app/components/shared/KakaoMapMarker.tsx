/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import { useEffect, useRef } from 'react';

interface KakaoMapMarkerProps {
  address: string;
}

const KakaoMapMarker = ({ address }: KakaoMapMarkerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-ignore
    const kakao = window.kakao;
    if (!address || !kakao || !kakao.maps) return;

    const initMap = () => {
      if (!containerRef.current) return;

      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result?.[0]) {
          const pos = new kakao.maps.LatLng(result[0].y, result[0].x);
          const map = new kakao.maps.Map(containerRef.current, {
            center: pos,
            level: 4,
          });
          const marker = new kakao.maps.Marker({
            position: pos,
          });
          marker.setMap(map);
        } else {
          // 주소 검색 실패 시 기본 위치(칠곡군청)로 표시
          const defaultPos = new kakao.maps.LatLng(35.995, 128.404);
          const map = new kakao.maps.Map(containerRef.current, {
            center: defaultPos,
            level: 4,
          });
           new kakao.maps.Marker({
            position: defaultPos,
          }).setMap(map);
        }
      });
    };

    kakao.maps.load(initMap);
  }, [address]);

  return <div ref={containerRef} style={{ width: '100%', height: '300px' }} />;
};

export default KakaoMapMarker;
