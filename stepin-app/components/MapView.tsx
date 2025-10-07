/**
 * MapView Component
 * Reusable map component for displaying walking routes with Mapbox
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import type { GeoCoordinate, Location } from '@/types/database';

// Set Mapbox access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

interface MapViewProps {
  routes?: GeoCoordinate[][]; // Multiple routes
  startLocations?: Location[];
  endLocations?: Location[];
  centerOn?: Location; // Center map on specific location
  showUserLocation?: boolean;
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

export default function MapView({
  routes = [],
  startLocations = [],
  endLocations = [],
  centerOn,
  showUserLocation = false,
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

        {/* Route polylines */}
        {routes.map((route, index) => {
          if (!route || route.length === 0) return null;
          
          const lineString = convertToLineString(route);
          
          return (
            <MapboxGL.ShapeSource
              key={`route-${index}`}
              id={`route-source-${index}`}
              shape={lineString}
            >
              <MapboxGL.LineLayer
                id={`route-line-${index}`}
                style={{
                  lineColor: '#4CAF50',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </MapboxGL.ShapeSource>
          );
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

