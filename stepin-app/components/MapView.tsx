/**
 * MapView Component
 * Reusable map component for displaying walking routes with Mapbox
 * Phase 4: Enhanced with privacy zone visualization
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import type { GeoCoordinate, Location } from '@/types/database';

// Set Mapbox access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

interface PrivacyZone {
  id: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  name: string;
}

interface MapViewProps {
  routes?: GeoCoordinate[][]; // Multiple routes
  startLocations?: Location[];
  endLocations?: Location[];
  centerOn?: Location; // Center map on specific location
  showUserLocation?: boolean;
  privacyZones?: PrivacyZone[]; // Privacy zones to display
  onMapPress?: (coordinates: [number, number]) => void;
  style?: any;
}

/**
 * Calculate bounding box from all coordinates
 */
function calculateBounds(routes: GeoCoordinate[][]): [[number, number], [number, number]] | null {
  if (!routes || routes.length === 0) return null;

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  routes.forEach((route) => {
    route.forEach((coord) => {
      minLng = Math.min(minLng, coord.lng);
      maxLng = Math.max(maxLng, coord.lng);
      minLat = Math.min(minLat, coord.lat);
      maxLat = Math.max(maxLat, coord.lat);
    });
  });

  // Add padding (10% on each side)
  const lngPadding = (maxLng - minLng) * 0.1;
  const latPadding = (maxLat - minLat) * 0.1;

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ];
}

/**
 * Convert GeoCoordinate array to GeoJSON LineString
 */
function convertToLineString(coordinates: GeoCoordinate[]) {
  return {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: coordinates.map((coord) => [coord.lng, coord.lat]),
    },
    properties: {},
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a coordinate is within any privacy zone
 */
function isInPrivacyZone(
  coord: GeoCoordinate,
  privacyZones: PrivacyZone[]
): boolean {
  return privacyZones.some((zone) => {
    const distance = calculateDistance(
      coord.lat,
      coord.lng,
      zone.latitude,
      zone.longitude
    );
    return distance <= zone.radius_meters;
  });
}

/**
 * Split route into segments based on privacy zones
 * Returns array of segments with their privacy status
 */
interface RouteSegment {
  coordinates: GeoCoordinate[];
  isPrivate: boolean;
}

function splitRouteByPrivacy(
  route: GeoCoordinate[],
  privacyZones: PrivacyZone[]
): RouteSegment[] {
  if (!privacyZones || privacyZones.length === 0) {
    return [{ coordinates: route, isPrivate: false }];
  }

  const segments: RouteSegment[] = [];
  let currentSegment: GeoCoordinate[] = [];
  let currentPrivacy = isInPrivacyZone(route[0], privacyZones);

  route.forEach((coord, index) => {
    const coordPrivacy = isInPrivacyZone(coord, privacyZones);

    // If privacy status changes, start a new segment
    if (coordPrivacy !== currentPrivacy && currentSegment.length > 0) {
      segments.push({
        coordinates: currentSegment,
        isPrivate: currentPrivacy,
      });
      currentSegment = [coord];
      currentPrivacy = coordPrivacy;
    } else {
      currentSegment.push(coord);
    }
  });

  // Add final segment
  if (currentSegment.length > 0) {
    segments.push({
      coordinates: currentSegment,
      isPrivate: currentPrivacy,
    });
  }

  return segments;
}

/**
 * Create GeoJSON circle for privacy zone
 */
function createCircleGeoJSON(
  center: { lat: number; lng: number },
  radiusMeters: number,
  points: number = 64
) {
  const coordinates: number[][] = [];
  const earthRadius = 6371000; // meters

  for (let i = 0; i <= points; i++) {
    const angle = (i * 360) / points;
    const angleRad = (angle * Math.PI) / 180;

    const lat = center.lat + (radiusMeters / earthRadius) * (180 / Math.PI) * Math.cos(angleRad);
    const lng =
      center.lng +
      ((radiusMeters / earthRadius) * (180 / Math.PI) * Math.sin(angleRad)) /
        Math.cos((center.lat * Math.PI) / 180);

    coordinates.push([lng, lat]);
  }

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coordinates],
    },
    properties: {},
  };
}

export default function MapView({
  routes = [],
  startLocations = [],
  endLocations = [],
  centerOn,
  showUserLocation = false,
  privacyZones = [],
  onMapPress,
  style,
}: MapViewProps) {
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // Fit bounds to show all routes
  useEffect(() => {
    if (routes.length > 0 && cameraRef.current) {
      const bounds = calculateBounds(routes);
      if (bounds) {
        cameraRef.current.fitBounds(bounds[0], bounds[1], 50, 1000);
      }
    } else if (centerOn && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [centerOn.lng, centerOn.lat],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [routes, centerOn]);

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Outdoors}
        compassEnabled={true}
        compassViewPosition={3} // Top right
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
        logoEnabled={false}
        onPress={onMapPress ? (feature) => {
          if (feature.geometry.type === 'Point') {
            onMapPress(feature.geometry.coordinates as [number, number]);
          }
        } : undefined}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          pitch={0}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User location */}
        {showUserLocation && (
          <MapboxGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            animated={true}
          />
        )}

        {/* Privacy Zone boundaries */}
        {privacyZones.map((zone, index) => {
          const circle = createCircleGeoJSON(
            { lat: zone.latitude, lng: zone.longitude },
            zone.radius_meters
          );

          return (
            <MapboxGL.ShapeSource
              key={`privacy-zone-${zone.id || index}`}
              id={`privacy-zone-source-${zone.id || index}`}
              shape={circle}
            >
              {/* Semi-transparent fill */}
              <MapboxGL.FillLayer
                id={`privacy-zone-fill-${zone.id || index}`}
                style={{
                  fillColor: '#9E9E9E',
                  fillOpacity: 0.15,
                }}
              />
              {/* Dashed border */}
              <MapboxGL.LineLayer
                id={`privacy-zone-border-${zone.id || index}`}
                style={{
                  lineColor: '#757575',
                  lineWidth: 2,
                  lineDasharray: [3, 3],
                  lineOpacity: 0.6,
                }}
              />
            </MapboxGL.ShapeSource>
          );
        })}

        {/* Route polylines with privacy segments */}
        {routes.map((route, routeIndex) => {
          if (!route || route.length === 0) return null;

          const segments = splitRouteByPrivacy(route, privacyZones);

          return segments.map((segment, segmentIndex) => {
            if (segment.coordinates.length === 0) return null;

            const lineString = convertToLineString(segment.coordinates);

            return (
              <MapboxGL.ShapeSource
                key={`route-${routeIndex}-segment-${segmentIndex}`}
                id={`route-source-${routeIndex}-segment-${segmentIndex}`}
                shape={lineString}
              >
                <MapboxGL.LineLayer
                  id={`route-line-${routeIndex}-segment-${segmentIndex}`}
                  style={
                    segment.isPrivate
                      ? {
                          // Private segment: grey dashed line
                          lineColor: '#9E9E9E',
                          lineWidth: 4,
                          lineCap: 'round',
                          lineJoin: 'round',
                          lineDasharray: [4, 4],
                          lineOpacity: 0.7,
                        }
                      : {
                          // Public segment: green solid line
                          lineColor: '#4CAF50',
                          lineWidth: 4,
                          lineCap: 'round',
                          lineJoin: 'round',
                        }
                  }
                />
              </MapboxGL.ShapeSource>
            );
          });
        })}

        {/* Start markers */}
        {startLocations.map((location, index) => {
          if (!location) return null;
          
          return (
            <MapboxGL.PointAnnotation
              key={`start-${index}`}
              id={`start-marker-${index}`}
              coordinate={[location.lng, location.lat]}
            >
              <View style={styles.startMarker}>
                <View style={styles.startMarkerInner} />
              </View>
            </MapboxGL.PointAnnotation>
          );
        })}

        {/* End markers */}
        {endLocations.map((location, index) => {
          if (!location) return null;
          
          return (
            <MapboxGL.PointAnnotation
              key={`end-${index}`}
              id={`end-marker-${index}`}
              coordinate={[location.lng, location.lat]}
            >
              <View style={styles.endMarker}>
                <View style={styles.endMarkerInner} />
              </View>
            </MapboxGL.PointAnnotation>
          );
        })}
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  startMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  startMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  endMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  endMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

