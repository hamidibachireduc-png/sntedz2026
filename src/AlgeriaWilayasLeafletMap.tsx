// اسم الملف: AlgeriaWilayasLeafletMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import geo from 'geoalgeria';

interface AlgeriaWilayasLeafletMapProps {
  selectedWilayaCode: string;
  onSelectWilaya: (code: string) => void;
  className?: string;
}

export const AlgeriaWilayasLeafletMap: React.FC<AlgeriaWilayasLeafletMapProps> = ({
  selectedWilayaCode,
  onSelectWilaya,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeLayerType, setActiveLayerType] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [filterRegion, setFilterRegion] = useState<'all' | '1-48' | '49-58' | '59-69'>('all');
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [boundariesData, setBoundariesData] = useState<any>(null);
  const [pointsData, setPointsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load geojson data from local applet storage with fallback to hamidibachireduc-png/mapalgeria
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/data/wilaya-boundaries.json').then((res) => (res.ok ? res.json() : null)).catch(() => null),
      fetch('/data/wilayas.json').then((res) => (res.ok ? res.json() : null)).catch(() => null),
    ]).then(async ([boundaries, points]) => {
      if (!isMounted) return;
      // Fallback directly to user's repository if local files are missing
      if (!boundaries) {
        try {
          const res = await fetch('https://raw.githubusercontent.com/hamidibachireduc-png/mapalgeria/main/test/fixtures/app-carriers/wilaya-boundaries.geojson');
          if (res.ok) boundaries = await res.json();
        } catch {}
      }
      if (!points) {
        try {
          const res = await fetch('https://raw.githubusercontent.com/hamidibachireduc-png/mapalgeria/main/test/fixtures/app-carriers/wilayas.geojson');
          if (res.ok) points = await res.json();
        } catch {}
      }
      if (boundaries) setBoundariesData(boundaries);
      if (points) setPointsData(points);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix leaflet marker default icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const algeriaBounds = L.latLngBounds(
      L.latLng(18.5, -9.0), // SW
      L.latLng(37.5, 12.5)  // NE
    );

    const map = L.map(mapContainerRef.current, {
      center: [28.2, 2.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      maxBounds: algeriaBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
    });

    // Custom Zoom control in top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Tile Layer Manager
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>';

    if (activeLayerType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Maxar, Earthstar Geographics';
    } else if (activeLayerType === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap &copy; OSM';
    }

    const tileLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;
  }, [activeLayerType]);

  // Render Boundaries & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layers
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    // Filter helper
    const isCodeAllowed = (codeNum: number) => {
      if (filterRegion === '1-48') return codeNum >= 1 && codeNum <= 48;
      if (filterRegion === '49-58') return codeNum >= 49 && codeNum <= 58;
      if (filterRegion === '59-69') return codeNum >= 59 && codeNum <= 69;
      return true;
    };

    // Add Wilayas Boundaries GeoJSON
    if (showBoundaries && boundariesData) {
      const geoLayer = L.geoJSON(boundariesData, {
        filter: (feature) => {
          const code = Number(feature.properties?.code);
          return isCodeAllowed(code);
        },
        style: (feature) => {
          const code = String(feature?.properties?.code || '');
          const codeNum = parseInt(code, 10);
          const codePadded = !code.includes('-') && !isNaN(codeNum) ? String(codeNum).padStart(2, '0') : code;
          const isSelected =
            String(code) === String(selectedWilayaCode) ||
            codePadded === String(selectedWilayaCode) ||
            (String(selectedWilayaCode).startsWith('16') && (code === '16' || codeNum === 16));
          return {
            fillColor: isSelected ? '#f59e0b' : '#047857',
            fillOpacity: isSelected ? 0.65 : 0.25,
            color: isSelected ? '#b45309' : '#065f46',
            weight: isSelected ? 3 : 1.2,
            dashArray: isSelected ? '' : '2, 3',
          };
        },
        onEachFeature: (feature, layer) => {
          const rawCode = String(feature.properties?.code);
          const codeNum = parseInt(rawCode, 10);
          const codePadded = !rawCode.includes('-') && !isNaN(codeNum) ? String(codeNum).padStart(2, '0') : rawCode;
          const wInfo = WILAYAS_LIST.find((w) => String(w.code) === rawCode || String(w.code) === codePadded);
          const nameAr = feature.properties?.name_ar || wInfo?.name || `ولاية ${codePadded}`;
          const nameFr = feature.properties?.name_fr || '';
          const sgName = wInfo?.sgName || '';
          const phone = wInfo?.phone || '';

          layer.bindTooltip(
            `<div style="text-align: right; direction: rtl; font-family: Cairo, sans-serif; min-width: 140px;">
              <strong style="color: #047857; font-size: 13px;">${codePadded} - ولاية ${nameAr}</strong>
              ${nameFr ? `<div style="font-size: 11px; color: #4b5563;">${nameFr}</div>` : ''}
              ${sgName ? `<div style="font-size: 11px; color: #1e293b; margin-top: 3px; font-weight: bold;">الأمين العام: ${sgName}</div>` : ''}
              ${phone ? `<div style="font-size: 10px; color: #0284c7; direction: ltr; text-align: right;">${phone}</div>` : ''}
              <div style="font-size: 10px; color: #b45309; margin-top: 2px;">اضغط لعرض الهيكل النقابي S.N.T.E</div>
            </div>`,
            { sticky: true, className: 'leaflet-custom-tooltip' }
          );

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              if (String(rawCode) !== String(selectedWilayaCode) && codePadded !== String(selectedWilayaCode)) {
                target.setStyle({
                  fillOpacity: 0.5,
                  fillColor: '#10b981',
                  weight: 2,
                });
              }
            },
            mouseout: (e) => {
              const target = e.target;
              if (String(rawCode) !== String(selectedWilayaCode) && codePadded !== String(selectedWilayaCode)) {
                target.setStyle({
                  fillColor: '#047857',
                  fillOpacity: 0.25,
                  weight: 1.2,
                });
              }
            },
            click: () => {
              onSelectWilaya(codePadded);
            },
          });
        },
      }).addTo(map);

      geoJsonLayerRef.current = geoLayer;
    }

    // Add Wilayas Markers Layer
    if (showMarkers && pointsData?.features) {
      const markersGroup = L.layerGroup();

      pointsData.features.forEach((feature: any) => {
        const codeNum = Number(feature.properties?.code);
        if (!isCodeAllowed(codeNum)) return;

        const codeStr = String(codeNum);
        const codePadded = String(codeNum).padStart(2, '0');
        const [lng, lat] = feature.geometry.coordinates;
        const isSelected =
          codeStr === String(selectedWilayaCode) ||
          codePadded === String(selectedWilayaCode) ||
          (String(selectedWilayaCode).startsWith('16') && codeNum === 16);
        const wInfo = WILAYAS_LIST.find((w) => String(w.code) === codeStr || String(w.code) === codePadded);
        const nameAr = feature.properties?.name_ar || wInfo?.name || `ولاية ${codePadded}`;
        const sgName = wInfo?.sgName || '';

        // Create custom HTML circle marker with number badge
        const customIcon = L.divIcon({
          className: 'custom-wilaya-pin',
          html: `
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              background: ${isSelected ? '#f59e0b' : '#065f46'};
              border: 2px solid ${isSelected ? '#ffffff' : '#a7f3d0'};
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${isSelected ? '#000000' : '#ffffff'};
              font-family: monospace, sans-serif;
              font-size: ${isSelected ? '12px' : '10px'};
              font-weight: 900;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
              cursor: pointer;
              transition: transform 0.15s ease;
            ">
              ${codeNum}
            </div>
          `,
          iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
          iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        marker.bindTooltip(
          `<div style="text-align: right; direction: rtl; font-family: Cairo, sans-serif; padding: 2px;">
            <div style="font-weight: bold; color: #065f46;">${codePadded} - ولاية ${nameAr}</div>
            ${sgName ? `<div style="font-size: 11px; color: #1e293b; font-weight: bold;">الأمين العام: ${sgName}</div>` : ''}
            <div style="font-size: 10px; color: #6b7280;">هاتف: ${feature.properties?.phone_code || '—'} | بريد: ${feature.properties?.postal_code || '—'}</div>
          </div>`,
          { direction: 'top', offset: [0, -12] }
        );

        marker.on('click', () => {
          onSelectWilaya(codePadded);
        });

        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);
      markersLayerRef.current = markersGroup;
    }
  }, [boundariesData, pointsData, selectedWilayaCode, showBoundaries, showMarkers, filterRegion, onSelectWilaya]);

  // Center on selected wilaya when it changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pointsData?.features) return;

    const codeNum = parseInt(String(selectedWilayaCode), 10);
    const targetFeature = pointsData.features.find((f: any) => {
      const fCode = f.properties?.code;
      return (
        String(fCode) === String(selectedWilayaCode) ||
        Number(fCode) === codeNum ||
        (String(selectedWilayaCode).startsWith('16') && Number(fCode) === 16)
      );
    });

    if (targetFeature && targetFeature.geometry?.coordinates) {
      const [lng, lat] = targetFeature.geometry.coordinates;
      // Fly smoothly to target wilaya if user selected it
      map.flyTo([lat, lng], Math.max(map.getZoom(), 7), { duration: 1.2 });
    }
  }, [selectedWilayaCode, pointsData]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([28.2, 2.5], 5, { duration: 1 });
  };

  const handleFilterRegionChange = (region: 'all' | '1-48' | '49-58' | '59-69') => {
    setFilterRegion(region);
    const map = mapInstanceRef.current;
    if (!map) return;
    if (region === '59-69') {
      map.flyTo([34.6, 3.2], 7, { duration: 1.2 });
    } else if (region === '49-58') {
      map.flyTo([27.0, 3.0], 5.5, { duration: 1.2 });
    } else if (region === '1-48') {
      map.flyTo([34.5, 3.0], 6, { duration: 1.2 });
    } else {
      map.flyTo([28.2, 2.5], 5, { duration: 1.2 });
    }
  };

  const MODIFIED_WILAYAS_CHIPS = [
    { code: '59', name: 'آفلو' },
    { code: '60', name: 'الأبيض سيدي الشيخ' },
    { code: '61', name: 'العريشة' },
    { code: '62', name: 'القنطرة' },
    { code: '63', name: 'بريكة' },
    { code: '64', name: 'بوسعادة' },
    { code: '65', name: 'بئر العاتر' },
    { code: '66', name: 'قصر البخاري' },
    { code: '67', name: 'قصر الشلالة' },
    { code: '68', name: 'عين وسارة' },
    { code: '69', name: 'مسعد' },
  ];

  return (
    <div className={`relative flex flex-col w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-emerald-900 shadow-xl ${className}`}>
      
      {/* Top Map Control Bar */}
      <div className="z-[1000] bg-slate-900/90 backdrop-blur-md border-b border-emerald-800/40 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Wilaya Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => handleFilterRegionChange('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              filterRegion === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            جميع الولايات (69)
          </button>
          <button
            type="button"
            onClick={() => handleFilterRegionChange('1-48')}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              filterRegion === '1-48'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="الولايات من 01 إلى 48"
          >
            1 - 48
          </button>
          <button
            type="button"
            onClick={() => handleFilterRegionChange('49-58')}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              filterRegion === '49-58'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="ولايات الجنوب المستحدثة سنة 2019 (من 49 إلى 58)"
          >
            49 - 58
          </button>
          <button
            type="button"
            onClick={() => handleFilterRegionChange('59-69')}
            className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
              filterRegion === '59-69'
                ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-white scale-102'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40'
            }`}
            title="عرض الولايات الـ 11 المعدلة والمستحدثة (59 إلى 69)"
          >
            <span>✨</span>
            <span>الولايات المعدلة (59-69)</span>
          </button>
        </div>

        {/* Layer Styles & Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Basemap switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveLayerType('streets')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                activeLayerType === 'streets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              خريطة واضحة
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerType('satellite')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                activeLayerType === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              قمر صناعي
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerType('terrain')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                activeLayerType === 'terrain' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              تضاريس
            </button>
          </div>

          {/* Toggle Pins */}
          <button
            type="button"
            onClick={() => setShowMarkers((p) => !p)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
              showMarkers
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="إظهار / إخفاء دبابيس أرقام الولايات"
          >
            📍 {showMarkers ? 'إخفاء الأرقام' : 'إظهار الأرقام'}
          </button>

          {/* Toggle Boundaries */}
          <button
            type="button"
            onClick={() => setShowBoundaries((p) => !p)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
              showBoundaries
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="إظهار / إخفاء حدود الولايات"
          >
            🗺️ {showBoundaries ? 'الحدود مفعلة' : 'الحدود معطلة'}
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetView}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="إعادة ضبط المشهد لكامل الجزائر"
          >
            ⟲ كل الجزائر
          </button>
        </div>
      </div>

      {/* Quick Interactive Chips Bar for Modified Wilayas (59-69) */}
      <div className="z-[1000] bg-slate-900/95 border-b border-amber-500/30 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] custom-scrollbar shadow-inner">
        <span className="font-bold text-amber-400 shrink-0 flex items-center gap-1 text-[11px]">
          <span>✨</span>
          <span>الولايات المعدلة (انقر للتحديد والتكبير):</span>
        </span>
        <div className="flex items-center gap-1.5">
          {MODIFIED_WILAYAS_CHIPS.map((nw) => {
            const isCur = String(selectedWilayaCode) === nw.code;
            return (
              <button
                key={nw.code}
                type="button"
                onClick={() => onSelectWilaya(nw.code)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap text-[10px] transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  isCur
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-white scale-105'
                    : 'bg-slate-800 text-amber-200 hover:bg-amber-500/20 hover:text-white border border-amber-500/40 hover:border-amber-400'
                }`}
                title={`تحديد ولاية ${nw.name} (${nw.code})`}
              >
                <span className="font-mono font-black">{nw.code}</span>
                <span>{nw.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Canvas / Container */}
      <div className="relative flex-1 w-full h-full min-h-[420px] bg-slate-950">
        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs text-white">
            <div className="w-9 h-9 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-emerald-300 font-bold text-xs">جاري تحميل خريطة ومواقع الولايات 69 الرسمية...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Bottom Info Status bar */}
      <div className="z-[1000] bg-slate-900/95 border-t border-emerald-900/60 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-300 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400">
            خريطة جغرافية وطنية مباشرة لمواقع وحدود الـ 69 ولاية فقط
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <a
            href="https://github.com/hamidibachireduc-png/mapalgeria"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-emerald-300 hover:text-emerald-200 underline font-mono flex items-center gap-1"
          >
            <span>مستودع: hamidibachireduc-png/mapalgeria ↗</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-300 font-mono font-bold">
            الولاية المختارة: {selectedWilayaCode} - {WILAYAS_LIST.find((w) => String(w.code) === String(selectedWilayaCode))?.name || ''}
          </span>
        </div>
      </div>
    </div>
  );
};