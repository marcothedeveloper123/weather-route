import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import WeatherMarker from '@/components/WeatherMarker';
import type { StopForecast } from '@/lib/types';

const MARKER_SIZE: [number, number] = [136, 96];
const CARD_GAP_PX = 6;

interface ScreenBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface RouteMapProps {
  geometry: [number, number][] | null;
  items: StopForecast[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

function cardBoxAt(point: L.Point): ScreenBox {
  const [width, height] = MARKER_SIZE;
  return {
    left: point.x - width / 2 - CARD_GAP_PX,
    right: point.x + width / 2 + CARD_GAP_PX,
    top: point.y - height - CARD_GAP_PX,
    bottom: point.y + CARD_GAP_PX,
  };
}

function boxesOverlap(a: ScreenBox, b: ScreenBox): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

export default function RouteMap({ geometry, items, selectedIndex, onSelect }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { center: [20, 0], zoom: 2, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geometry) return;
    const line = L.polyline(geometry, { color: '#0369a1', weight: 5, opacity: 0.85 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [64, 64] });
    return () => {
      line.remove();
    };
  }, [geometry]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || items.length === 0) return;

    const group = L.layerGroup().addTo(map);
    const markupByIndex = new Map(
      items.map((item) => [
        item.index,
        renderToStaticMarkup(<WeatherMarker item={item} selected={item.index === selectedIndex} />),
      ]),
    );
    const placementOrder = [items[0], items[items.length - 1], ...items.slice(1, -1)];

    const layoutMarkers = () => {
      group.clearLayers();
      const shownBoxes: ScreenBox[] = [];
      placementOrder.forEach((item, position) => {
        const point = map.latLngToContainerPoint([item.stop.lat, item.stop.lng]);
        const box = cardBoxAt(point);
        const isAnchor = position < 2;
        if (!isAnchor && shownBoxes.some((shown) => boxesOverlap(shown, box))) return;
        shownBoxes.push(box);

        const icon = L.divIcon({
          className: 'weather-marker-icon',
          html: markupByIndex.get(item.index),
          iconSize: MARKER_SIZE,
          iconAnchor: [MARKER_SIZE[0] / 2, MARKER_SIZE[1]],
        });
        L.marker([item.stop.lat, item.stop.lng], { icon, zIndexOffset: item.index === selectedIndex ? 1000 : 0 })
          .on('click', () => onSelect(item.index))
          .addTo(group);
      });
    };

    layoutMarkers();
    map.on('moveend', layoutMarkers);
    return () => {
      map.off('moveend', layoutMarkers);
      group.remove();
    };
  }, [items, selectedIndex, onSelect]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Route map" />;
}
