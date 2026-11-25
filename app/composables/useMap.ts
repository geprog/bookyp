import type { Feature, FeatureCollection, Position } from 'geojson';
import type { GeoJSONSource, LngLatLike, Map as MapLibreMap, MapMouseEvent, SymbolLayerSpecification } from 'maplibre-gl';
import type { Ref } from 'vue';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapConfig = {
  minZoom: 5,
  maxZoom: 18,
  /** currently Kiel */
  center: [10.1283, 54.3166] as [number, number],
  zoom: 10,
  /** [west, south, east, north] (currently the borders of Germany) */
  maxBounds: [5.0, 46.0, 15.0, 57.0] as [number, number, number, number],
};

/**
 * A MapLibre map showing markers for spaces (or a single coordinate that can be picked by clicking).
 */
export function useMap(options: {
  coordinates?: Ref<{ lng: number; lat: number } | undefined | null>;
  followCoordinates?: boolean;
  clickable?: boolean;
  clickHandler?: (event: MapMouseEvent, map: MapLibreMap) => { continueDefaultClickHandler: boolean };
  geojson?: Ref<FeatureCollection>;
  selectedMarkerId?: Ref<string | undefined>;
  container: Ref<HTMLElement | undefined | null>;
}) {
  const { coordinates } = options;
  const { tileServer } = useRuntimeConfig().public.map;
  let map: MapLibreMap | undefined;

  const geojson = computed<FeatureCollection>(() => {
    if (options.geojson) {
      return options.geojson.value;
    }
    return {
      type: 'FeatureCollection',
      features: coordinates?.value
        ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [coordinates.value.lng, coordinates.value.lat] as Position }, properties: {} }]
        : [],
    };
  });

  const spacesLayer = computed<SymbolLayerSpecification>(() => ({
    id: 'spaces',
    type: 'symbol',
    source: 'geojson',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': ['match', ['get', 'id'], options.selectedMarkerId?.value || '', 'pin-red-border', 'pin'],
      'icon-size': 0.5,
      'icon-allow-overlap': true,
    },
  }));

  function flyTo(center: LngLatLike) {
    map?.easeTo({ center, padding: { bottom: 84 } });
  }

  if (options.selectedMarkerId) {
    watch(options.selectedMarkerId, (id, oldId) => {
      if (!map || !id || id === oldId) {
        return;
      }
      const feature = geojson.value.features.find((f: Feature) => f.properties?.id === id);
      if (feature?.geometry.type === 'Point') {
        flyTo(feature.geometry.coordinates as LngLatLike);
      }
    });
  }

  async function createMap(container: HTMLElement) {
    const maplibre = await import('maplibre-gl');
    map = new maplibre.Map({
      container,
      style: `${tileServer}/styles/bright-matter/style.json`,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
      center: coordinates?.value ?? mapConfig.center,
      zoom: coordinates ? 14 : mapConfig.zoom,
      maxBounds: mapConfig.maxBounds,
      attributionControl: false,
    });
    const instance = map;
    instance.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-left');

    instance.on('load', async () => {
      instance.addSource('geojson', {
        type: 'geojson',
        data: geojson.value,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 15,
      });

      for (const [name, url] of [['pin', '/pin-green.png'], ['pin-red-border', '/pin-red-border.png']] as const) {
        try {
          const image = await instance.loadImage(url);
          if (!instance.hasImage(name)) {
            instance.addImage(name, image.data);
          }
        }
        catch (error) {
          console.error(`Could not load map image ${name}`, error);
        }
      }

      instance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'geojson',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#F59E0B', 10, '#D97706', 30, '#D97706'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        },
      });
      instance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'geojson',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Metropolis Regular', 'Klokantech Noto Sans Regular'],
          'text-size': 15,
          'text-offset': [0, 0.2],
          'text-overlap': 'cooperative',
        },
        paint: { 'text-color': '#fff' },
      });
      instance.addLayer(spacesLayer.value);
    });

    instance.on('click', async (event) => {
      if (options.clickHandler && !options.clickHandler(event, instance).continueDefaultClickHandler) {
        return;
      }
      if (!options.clickable) {
        return;
      }
      if (coordinates) {
        coordinates.value = { lng: event.lngLat.lng, lat: event.lngLat.lat };
      }
      const features = instance.getLayer('clusters') ? instance.queryRenderedFeatures(event.point, { layers: ['clusters'] }) : [];
      const cluster = features[0];
      if (!cluster || cluster.geometry.type !== 'Point') {
        return;
      }
      const source = instance.getSource('geojson') as GeoJSONSource | undefined;
      if (!source) {
        return;
      }
      const zoom = await source.getClusterExpansionZoom(cluster.properties.cluster_id as number);
      instance.easeTo({ center: cluster.geometry.coordinates as LngLatLike, zoom });
    });

    for (const layer of ['clusters', 'spaces']) {
      instance.on('mouseenter', layer, () => (instance.getCanvas().style.cursor = 'pointer'));
      instance.on('mouseleave', layer, () => (instance.getCanvas().style.cursor = ''));
    }
  }

  watch(options.container, (container) => {
    if (container && !map) {
      void createMap(container);
    }
  }, { immediate: true });

  if (coordinates) {
    watch(coordinates, (value) => {
      if (map && value && options.followCoordinates) {
        map.setCenter(value);
      }
    });
  }

  watch(geojson, (value) => {
    const source = map?.getSource('geojson') as GeoJSONSource | undefined;
    source?.setData(value);
  });

  watch(spacesLayer, (layer) => {
    if (!map?.getLayer('spaces') || !layer.layout) {
      return;
    }
    map.setLayoutProperty('spaces', 'icon-image', layer.layout['icon-image']);
  });

  onBeforeUnmount(() => {
    map?.remove();
    map = undefined;
  });
}
