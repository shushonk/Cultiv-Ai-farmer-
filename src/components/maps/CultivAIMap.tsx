import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CaseRecord, Hotspot, FieldVisit, AlertItem } from '../../types';
import { useI18n } from '../../i18n';

// Fix Leaflet's default icon paths if needed
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapFiltersState {
  crop: string;
  condition: string;
  risk: string;
  severity: string;
  district: string;
  status: string;
  showCases: boolean;
  showHotspots: boolean;
  showVisits: boolean;
  showWeather: boolean;
}

interface Props {
  cases?: CaseRecord[];
  hotspots?: Hotspot[];
  fieldVisits?: FieldVisit[];
  alerts?: AlertItem[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
  filters?: MapFiltersState;
  onSelectCase?: (caseItem: CaseRecord) => void;
  interactiveSelection?: boolean;
  onLocationSelected?: (lat: number, lng: number) => void;
}

export const CultivAIMap: React.FC<Props> = ({
  cases = [],
  hotspots = [],
  fieldVisits = [],
  alerts = [],
  centerLat = 13.1367, // Kolar, Karnataka
  centerLng = 78.1291,
  zoom = 9,
  height = '500px',
  filters,
  onSelectCase,
  interactiveSelection = false,
  onLocationSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const selectedPinRef = useRef<L.Marker | null>(null);
  const { t, tStatus, tRisk, tSeverity } = useI18n();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CartoDB Dark Matter tile layer for an elegant AgTech UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      // Interactive location selection (e.g. for adding new field)
      if (interactiveSelection) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (selectedPinRef.current) {
            selectedPinRef.current.setLatLng([lat, lng]);
          } else {
            selectedPinRef.current = L.marker([lat, lng]).addTo(map);
          }
          if (onLocationSelected) {
            onLocationSelected(Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000);
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Layers & Markers when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Render Hotspots (if enabled)
    const renderHotspots = filters ? filters.showHotspots : true;
    if (renderHotspots) {
      hotspots.forEach((hs) => {
        if (filters && filters.district && filters.district !== 'ALL' && hs.district !== filters.district) {
          return;
        }

        const isCritical = hs.riskLevel === 'CRITICAL';
        const isHigh = hs.riskLevel === 'HIGH';
        const circleColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#eab308';
        const circle = L.circle([hs.lat, hs.lng], {
          radius: hs.radiusKm * 1000,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '4, 6',
        });

        circle.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 200px;">
            <div style="font-weight: 700; color: ${circleColor}; text-transform: uppercase; font-size: 11px; margin-bottom: 2px;">
              ● ${hs.majorCondition || 'Pathogen'} Hotspot
            </div>
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${hs.areaName || hs.district}, ${hs.district}</div>
            <div style="margin-bottom: 2px;"><strong>Risk Level:</strong> ${hs.riskLevel}</div>
            <div style="margin-bottom: 2px;"><strong>Affected Area:</strong> ${hs.affectedAcres} Acres (${hs.caseCount} Cases)</div>
            <div style="background: #f1f5f9; padding: 4px 6px; border-radius: 4px; font-size: 10px; color: #475569;">
              Trajectory: ${hs.trend || 'Stable'}
            </div>
          </div>
        `);
        layer.addLayer(circle);
      });
    }

    // 2. Render Cases (if enabled)
    const renderCases = filters ? filters.showCases : true;
    if (renderCases) {
      cases.forEach((c) => {
        // Apply Filters
        if (filters) {
          if (filters.crop !== 'ALL' && c.crop !== filters.crop) return;
          if (filters.risk !== 'ALL' && c.riskAssessment.overallRisk !== filters.risk) return;
          if (filters.district !== 'ALL' && c.location.district !== filters.district) return;
          if (filters.status !== 'ALL' && c.status !== filters.status) return;
        }

        const isHigh = c.riskAssessment.overallRisk === 'CRITICAL' || c.riskAssessment.overallRisk === 'HIGH';
        const isModerate = c.riskAssessment.overallRisk === 'MODERATE';
        const pinBg = isHigh ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

        // Privacy location obfuscation (add small random jitter of ~200m so exact private farmer courtyard is protected)
        const jitterLat = c.location.lat + (Math.sin(c.id.length * 13) * 0.003);
        const jitterLng = c.location.lng + (Math.cos(c.id.length * 17) * 0.003);

        const customIcon = L.divIcon({
          className: 'cultivai-map-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: ${pinBg};
              border: 2px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
            ">
              ${c.crop.charAt(0)}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([jitterLat, jitterLng], { icon: customIcon });

        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'inherit';
        popupContent.style.fontSize = '12px';
        popupContent.style.color = '#0f172a';
        popupContent.style.minWidth = '220px';

        popupContent.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: bold; font-size: 13px; color: #0284c7;">${c.crop}</span>
            <span style="font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${c.id}</span>
          </div>
          <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px; color: #0f172a;">${c.aiPrediction.condition}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${c.location.district}, Karnataka</div>
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <span style="background: ${pinBg}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
              ${c.riskAssessment.overallRisk}
            </span>
            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              ${c.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            Confidence: ${Math.round(c.aiPrediction.confidence * 100)}% • Severity: ${c.aiPrediction.severity}
          </div>
        `;

        if (onSelectCase) {
          const btn = document.createElement('button');
          btn.innerText = 'Inspect Diagnostic Case →';
          btn.style.width = '100%';
          btn.style.padding = '6px';
          btn.style.backgroundColor = '#0f172a';
          btn.style.color = '#ffffff';
          btn.style.border = 'none';
          btn.style.borderRadius = '6px';
          btn.style.fontSize = '11px';
          btn.style.fontWeight = '600';
          btn.style.cursor = 'pointer';
          btn.onclick = () => onSelectCase(c);
          popupContent.appendChild(btn);
        }

        marker.bindPopup(popupContent);
        layer.addLayer(marker);
      });
    }

    // 3. Render Field Visits (if enabled)
    const renderVisits = filters ? filters.showVisits : true;
    if (renderVisits) {
      fieldVisits.forEach((fv) => {
        const visitLat = (fv as any).lat || 13.1367;
        const visitLng = (fv as any).lng || 78.1291;
        const visitDate = fv.scheduledDate || (fv as any).date;

        const visitIcon = L.divIcon({
          className: 'cultivai-visit-marker',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 6px;
              background-color: #3b82f6;
              border: 2px solid white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
            ">
              📋
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const vMarker = L.marker([visitLat, visitLng], { icon: visitIcon });
        vMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 180px;">
            <div style="font-weight: 700; color: #2563eb; margin-bottom: 2px;">Field Inspection Scheduled</div>
            <div style="font-size: 13px; font-weight: 600;">Farmer: ${fv.farmerName || 'Grower'}</div>
            <div style="font-size: 11px; color: #64748b;">${visitDate} • Officer: ${fv.assignedOfficerName}</div>
            <div style="margin-top: 4px; font-size: 11px; background: #eff6ff; padding: 4px; border-radius: 4px;">
              ${fv.notes || fv.reason}
            </div>
          </div>
        `);
        layer.addLayer(vMarker);
      });
    }
  }, [cases, hotspots, fieldVisits, filters, onSelectCase]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Map Legend Bar */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-xl text-[11px] text-slate-300 flex flex-wrap items-center gap-3 shadow-lg">
        <span className="font-semibold text-white">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm"></span>
          <span>Critical / High</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
          <span>Moderate</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          <span>Low / Safe</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block shadow-sm"></span>
          <span>Field Visit</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 border border-dashed border-rose-400 bg-rose-500/30 inline-block"></span>
          <span>Outbreak Hotspot</span>
        </span>
      </div>
    </div>
  );
};
