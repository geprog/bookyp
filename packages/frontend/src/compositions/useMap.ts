import type { FeatureCollection, Position } from 'geojson';
import {
  AttributionControl,
  GeoJSONSource,
  LngLatLike,
  Map,
  MapMouseEvent,
  Source,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { computed, onMounted, Ref, watch } from 'vue';

import { getConfig } from '~/config';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMap = (options: {
  coordinates?: Ref<{ lng: number; lat: number } | undefined>;
  followCoordinates?: Ref<boolean>;
  clickable?: Ref<boolean>;
  clickHandler?: (event: MapMouseEvent) => void;
  geojson?: Ref<FeatureCollection>;
  selectedMarkerId?: Ref<string | undefined>;
}) => {
  const { coordinates } = options;
  let map: Map;

  function flyTo(center: LngLatLike) {
    if (!map) {
      return;
    }

    map.flyTo({
      center,
      padding: {
        bottom: 84, // 84px is the height of the bottom panel
      },
    });
  }

  const loadImage = (name: string, url: string) =>
    new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      map.loadImage(url, (error, image) => {
        if (error) {
          reject(error);
        } else if (image) {
          map.addImage(name, image);
          resolve();
        }
      });
    });

  const geojson = computed<FeatureCollection>(() => {
    if (options.geojson) {
      return options.geojson.value;
    }
    return {
      type: 'FeatureCollection',
      features: coordinates
        ? [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [coordinates.value?.lng, coordinates.value?.lat] as Position,
              },
              properties: {},
            },
          ]
        : [],
    };
  });

  const selectedMarker = computed(() => {
    if (!options.selectedMarkerId?.value) {
      return;
    }

    return geojson?.value?.features.find((feature) => feature.properties?.id === options.selectedMarkerId?.value);
  });

  if (options.selectedMarkerId) {
    watch(options.selectedMarkerId, (newSelectedMarkerId, oldSelectedMarkerId) => {
      if (!map || !newSelectedMarkerId || newSelectedMarkerId === oldSelectedMarkerId) {
        return;
      }

      if (selectedMarker.value?.geometry.type === 'Point') {
        flyTo(selectedMarker.value?.geometry.coordinates as LngLatLike);
      }
    });
  }

  const spacesLayer: Ref<SymbolLayerSpecification> = computed(() => ({
    id: 'spaces',
    type: 'symbol',
    source: 'geojson',
    layout: {
      'icon-image': ['match', ['get', 'id'], options.selectedMarkerId?.value || '', 'pin-red-border', 'pin'],
      'icon-size': 0.5,
      'icon-allow-overlap': true,
    },
  }));

  const config = getConfig();

  onMounted(() => {
    map = new Map({
      container: 'map',
      style: config.map.brightMapStyle,
      minZoom: config.map.minZoom,
      maxZoom: config.map.maxZoom,
      center: coordinates?.value || config.map.center,
      zoom: coordinates ? 14 : config.map.zoom,
      maxBounds: config.map.maxBounds,
      attributionControl: false,
    });

    const attributionControl = new AttributionControl({ compact: true });
    map.addControl(attributionControl, 'bottom-left');

    map.on('load', () => {
      map.addSource('geojson', {
        type: 'geojson',
        data: Object.freeze(geojson.value),
      });

      void loadImage('pin', '/pin-green.png');
      void loadImage('pin-red-border', '/pin-red-border.png');

      map.addLayer(spacesLayer.value);
    });

    map.on('click', (e) => {
      if (options.clickHandler) {
        options.clickHandler(e);
        return;
      }
      if (!options.clickable?.value) {
        return;
      }
      if (coordinates !== undefined) {
        coordinates.value = e.lngLat;
      }
    });
  });

  if (coordinates) {
    watch(coordinates, () => {
      if (!map || !coordinates?.value || !options.followCoordinates?.value) {
        return;
      }
      map.setCenter(coordinates.value);
    });
  }

  watch(geojson, () => {
    if (!map) {
      return;
    }

    const geoJSONSource = map.getSource('geojson');
    const isGeoJsonSource = (source?: Source): source is GeoJSONSource => source?.type === 'geojson';
    if (isGeoJsonSource(geoJSONSource)) {
      geoJSONSource.setData(Object.freeze(geojson.value));
    }
  });

  watch(spacesLayer, () => {
    if (!map) {
      return;
    }

    if (spacesLayer.value.layout) {
      Object.keys(spacesLayer.value.layout).forEach((key) => {
        if (spacesLayer.value.layout) {
          map.setLayoutProperty('spaces', key, spacesLayer.value.layout[key as keyof typeof spacesLayer.value.layout]);
        }
      });
    }

    if (spacesLayer.value.paint) {
      Object.keys(spacesLayer.value.paint).forEach((key) => {
        if (spacesLayer.value.paint) {
          map.setPaintProperty('spaces', key, spacesLayer.value.paint[key as keyof typeof spacesLayer.value.paint]);
        }
      });
    }
  });
};
