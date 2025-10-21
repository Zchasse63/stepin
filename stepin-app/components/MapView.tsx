/**
 * MapView Component
 * Reusable map component for displaying walking routes with Mapbox
 * Phase 4: Enhanced with privacy zone visualization
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import type { GeoCoordinate, Location } from '@/types/database';
import {
  calculateBounds,
  convertToLineString,
  calculateDistance,
  isInPrivacyZone,
  splitRouteByPrivacy,
  createCircleGeoJSON,
  type PrivacyZone,
  type RouteSegment,
} from '../lib/map-utils';

// Set Mapbox access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

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

