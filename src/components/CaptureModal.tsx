import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Droplets,
  Users,
  Compass,
  Check,
  Video,
  VideoOff,
  SwitchCamera,
  FolderOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SaplingRecord, InspectionResult, Language } from '../types';
import { SAMPLE_CAPTURE_PRESETS } from '../data/sampleData';
import { getTranslation } from '../utils/i18n';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  saplings: SaplingRecord[];
  onSaveAudit: (
    treeId: string,
    result: InspectionResult,
    photoDataUrl: string,
    locationData: { lat: number; lng: number; locationName: string; ward: number },
    species: string
  ) => void;
  language: Language;
  preselectedTreeId?: string;
  initialLocation?: { lat: number; lng: number; locationName: string; ward?: number };
}

// Convert an image URL to a clean base64 data URL
async function urlToBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not convert URL to base64, returning raw URL:', err);
    return url;
  }
}

// Robust File reader that scales large photos to max 1280px and always returns a valid base64 data URL
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawData = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const maxWidth = 1280;
          const maxHeight = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        } catch (e) {
          console.warn('Canvas resizing failed, falling back to raw data:', e);
        }
        resolve(rawData);
      };
      img.onerror = () => {
        resolve(rawData);
      };
      img.src = rawData;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}

export const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  onClose,
  saplings,
  onSaveAudit,
  language,
  preselectedTreeId,
  initialLocation,
}) => {
  const [selectedTreeId, setSelectedTreeId] = useState<string>(preselectedTreeId || 'new');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [species, setSpecies] = useState<string>('Neem (Azadirachta indica)');
  const [locationName, setLocationName] = useState<string>('Siripuram Circle (Ward 18)');
  const [lat, setLat] = useState<number>(17.7201);
  const [lng, setLng] = useState<number>(83.3164);
  const [ageMonths, setAgeMonths] = useState<number>(4);
  const [auditorNotes, setAuditorNotes] = useState<string>('Drooping yellow leaves noticed during campus survey');
  const [auditorName, setAuditorName] = useState<string>('AU NSS Volunteer #204');

  // AI Inspection States
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsLocked, setGpsLocked] = useState<boolean>(true);

  // Live Camera Stream States
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera helper
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  // Start live webcam stream with flexible constraints
  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopLiveCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser environment.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e1) {
        console.warn('Initial camera constraint failed, retrying with simple video=true:', e1);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsLiveCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play interrupted:', e));
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      let userMsg = 'Could not open live camera stream.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userMsg = 'Camera permission was denied in your browser. Please allow camera access or use the "Upload Photo" button below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userMsg = 'No camera device found on this system. Please use the "Upload Photo" button below.';
      } else if (err.name === 'NotReadableError') {
        userMsg = 'Camera is already in use by another application. Please free the camera or upload a file.';
      }
      setCameraError(userMsg);
      setIsLiveCameraActive(false);
    }
  };

  // Snap photo from live webcam video frame
  const snapLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoDataUrl(dataUrl);
      setInspectionResult(null);
      setInspectionError(null);
      stopLiveCamera();
    }
  };

  // Toggle camera facing mode (front/rear)
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  // Clean up stream on modal close or unmount
  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedTreeId && preselectedTreeId !== 'new') {
      const found = saplings.find((s) => s.id === preselectedTreeId);
      if (found) {
        setSelectedTreeId(found.id);
        setSpecies(found.species);
        setLocationName(found.location);
        setLat(found.lat);
        setLng(found.lng);
        if (found.photoUrl) setPhotoDataUrl(found.photoUrl);
      }
    } else if (initialLocation) {
      setSelectedTreeId('new');
      setLat(initialLocation.lat);
      setLng(initialLocation.lng);
      setLocationName(initialLocation.locationName);
      setGpsLocked(true);
      if (!photoDataUrl) {
        setPhotoDataUrl(SAMPLE_CAPTURE_PRESETS[0].previewUrl);
      }
    } else if (!photoDataUrl) {
      // Default with preset #1 for instant demo test readiness
      setPhotoDataUrl(SAMPLE_CAPTURE_PRESETS[0].previewUrl);
    }
  }, [preselectedTreeId, initialLocation, saplings]);

  const handleTreeSelectionChange = (treeId: string) => {
    setSelectedTreeId(treeId);
    if (treeId === 'new') {
      setLocationName('Siripuram Circle (Ward 18)');
      setSpecies('Neem (Azadirachta indica)');
      setLat(17.7201);
      setLng(83.3164);
    } else {
      const found = saplings.find((s) => s.id === treeId);
      if (found) {
        setSpecies(found.species);
        setLocationName(found.location);
        setLat(found.lat);
        setLng(found.lng);
        if (found.photoUrl) setPhotoDataUrl(found.photoUrl);
      }
    }
  };

  const handlePresetSelect = async (preset: typeof SAMPLE_CAPTURE_PRESETS[0]) => {
    stopLiveCamera();
    setSpecies(preset.species);
    setLocationName(preset.location);
    setAgeMonths(preset.ageMonths);
    setAuditorNotes(preset.notes);
    setInspectionResult(null);
    setInspectionError(null);

    // Convert preview image to base64 for Gemini vision
    const b64 = await urlToBase64(preset.previewUrl);
    setPhotoDataUrl(b64);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    stopLiveCamera();
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await readFileAsBase64(file);
        if (compressedBase64) {
          setPhotoDataUrl(compressedBase64);
          setInspectionResult(null);
          setInspectionError(null);
        }
      } catch (err) {
        console.error('File reading error:', err);
      }
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    stopLiveCamera();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const compressedBase64 = await readFileAsBase64(file);
      if (compressedBase64) {
        setPhotoDataUrl(compressedBase64);
        setInspectionResult(null);
        setInspectionError(null);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setGpsLoading(false);
        setGpsLocked(true);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsLoading(false);
        setLat(17.7297);
        setLng(83.3130);
        setGpsLocked(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const runGeminiInspection = async () => {
    if (!photoDataUrl && !auditorNotes) {
      setInspectionError('Please capture or upload a sapling photo first.');
      return;
    }

    setIsInspecting(true);
    setInspectionError(null);

    try {
      // Ensure photoDataUrl is base64
      let payloadImage: string | undefined = undefined;
      if (photoDataUrl.startsWith('data:')) {
        payloadImage = photoDataUrl;
      } else if (photoDataUrl.startsWith('http')) {
        payloadImage = await urlToBase64(photoDataUrl);
      }

      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiBase}/api/audit-sapling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: payloadImage,
          species,
          location: locationName,
          ageMonths,
          notes: auditorNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: InspectionResult = await response.json();
      setInspectionResult(data);
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setInspectionError('Inspection connection failed. Click Try Again to retry.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCommitAudit = () => {
    if (!inspectionResult) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00E676', '#FFD600', '#FFFFFF'],
      });
    } catch (e) {
      // ignore
    }

    onSaveAudit(
      selectedTreeId,
      inspectionResult,
      photoDataUrl,
      {
        lat,
        lng,
        locationName,
        ward: parseInt(locationName.match(/Ward\s*(\d+)/i)?.[1] || '18', 10),
      },
      species
    );
    stopLiveCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#181818] border border-[#2F3336] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Log Monthly Sapling Health & GPS Tag
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Visakhapatnam NSS Field Audit & Gemini AI Leaf/Soil Inspector
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            aria-label="Close"
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Target Tree & Preset Demo Buttons */}
          <div className="bg-[#1F1F1F] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs uppercase font-mono font-bold tracking-wider text-[#A0A0A0]">
                Select Sapling Record:
              </label>
              <select
                value={selectedTreeId}
                onChange={(e) => handleTreeSelectionChange(e.target.value)}
                className="bg-[#121212] border border-[#333] text-sm text-white rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-[#00E676]"
              >
                <option value="new">+ Tag New Sapling in Vizag</option>
                {saplings.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.species} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Presets for Demo Reviewers */}
            <div>
              <span className="text-[11px] text-[#8E8E93] block mb-1.5 font-semibold">
                Quick Field Presets (Tap any preset to test immediately):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_CAPTURE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-left p-2 rounded-lg bg-[#252525] hover:bg-[#2F2F2F] border border-[#3A3A3A] hover:border-[#00E676] text-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <img
                      src={p.previewUrl}
                      alt={p.label}
                      className="w-9 h-9 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{p.label}</div>
                      <div className="text-[10px] text-[#8E8E93] truncate">{p.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Camera Capture / Live Viewfinder & Photo Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs uppercase font-mono font-bold tracking-wider text-[#A0A0A0] flex items-center justify-between">
                <span>1. Sapling Photo Evidence:</span>
                {photoDataUrl && !isLiveCameraActive && (
                  <span className="text-[#00E676] text-[11px] flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Photo Loaded
                  </span>
                )}
                {isLiveCameraActive && (
                  <span className="text-[#FFD600] text-[11px] flex items-center gap-1 font-semibold animate-pulse">
                    <Video className="w-3.5 h-3.5" /> Live Camera Active
                  </span>
                )}
              </label>

              {/* Viewfinder Canvas / Photo Preview Container */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative aspect-video sm:aspect-square max-h-72 rounded-xl border-2 transition-all bg-[#121212] overflow-hidden flex flex-col items-center justify-center group ${
                  isDragOver
                    ? 'border-[#00E676] bg-[#121f17]'
                    : 'border-dashed border-[#3A3A3A]'
                }`}
              >
                {/* Live Camera Viewfinder */}
                {isLiveCameraActive ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder Crosshair Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-[#00E676]/40 m-6 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#00E676] rounded-full animate-ping opacity-60" />
                    </div>

                    {/* Shutter Snap Button */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={snapLivePhoto}
                        className="px-5 py-2.5 bg-[#00E676] hover:bg-[#15f385] text-black font-extrabold text-xs rounded-full shadow-[0_0_20px_rgba(0,230,118,0.7)] flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                      >
                        <Camera className="w-4 h-4 stroke-[2.5]" />
                        <span>Snap Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        title="Flip Camera"
                        className="p-2.5 bg-black/70 hover:bg-black text-white rounded-full border border-white/20 cursor-pointer"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="p-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full cursor-pointer"
                        title="Close Camera"
                      >
                        <VideoOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : photoDataUrl ? (
                  /* Captured or Selected Photo Preview */
                  <>
                    <img
                      src={photoDataUrl}
                      alt="Sapling audit target"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => startLiveCamera()}
                        className="px-3 py-1.5 bg-[#00E676] text-black font-bold text-xs rounded-lg shadow-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" /> Retake with Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => directFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#2A2A2A] text-white hover:bg-[#333] font-semibold text-xs rounded-lg border border-[#444] flex items-center gap-1 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Choose Other File
                      </button>
                    </div>
                  </>
                ) : (
                  /* Empty state */
                  <div className="text-center p-4 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#222] flex items-center justify-center text-[#8E8E93]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-[#8E8E93] max-w-xs">
                      Take a photo with your camera, upload an image file, or choose from presets.
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Error Message */}
              {cameraError && (
                <div className="bg-[#2B1717] border border-[#FF5252]/40 p-2.5 rounded-xl text-xs text-[#FF8585] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#FF5252]" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Live WebCam / Viewfinder Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isLiveCameraActive) {
                      stopLiveCamera();
                    } else {
                      startLiveCamera();
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isLiveCameraActive
                      ? 'bg-[#FF5252]/20 border-[#FF5252] text-[#FF5252]'
                      : 'bg-[#18261E] hover:bg-[#203328] border-[#00E676]/50 text-[#00E676]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isLiveCameraActive ? 'Close Camera' : 'Live Camera'}</span>
                </button>

                {/* 2. Direct File Upload Button */}
                <button
                  type="button"
                  onClick={() => directFileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-[#252525] hover:bg-[#303030] text-white font-semibold text-xs border border-[#3A3A3A] flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
                >
                  <Upload className="w-4 h-4 text-[#FFD600]" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Hidden file input for file selection */}
              <input
                ref={directFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Field Details & GPS */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-mono font-bold tracking-wider text-[#A0A0A0]">
                2. Geo-Tag & Field Metadata:
              </label>

              {/* GPS coordinates badge */}
              <div className="bg-[#121212] p-3 rounded-xl border border-[#2F3336] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FFD600]" />
                    <span className="text-xs font-bold text-white">Vizag GPS Coordinates</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={gpsLoading}
                    className="text-[11px] text-[#00E676] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                    {gpsLoading ? 'Locking GPS...' : 'Update Device GPS'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#1C1C1C] px-2 py-1 rounded border border-[#2A2A2A]">
                    <span className="text-[#8E8E93]">LAT:</span> {lat}
                  </div>
                  <div className="bg-[#1C1C1C] px-2 py-1 rounded border border-[#2A2A2A]">
                    <span className="text-[#8E8E93]">LNG:</span> {lng}
                  </div>
                </div>
                <p className="text-[10px] text-[#8E8E93]">
                  Status: {gpsLocked ? '✓ High Accuracy GPS Locked' : 'Pending coordinates'}
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-[#8E8E93] font-medium block">
                    Sapling Species
                  </label>
                  <input
                    type="text"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2F3336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    placeholder="e.g. Neem (Azadirachta indica)"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#8E8E93] font-medium block">
                    Ward / Landmark Location
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2F3336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    placeholder="e.g. Siripuram Circle, Ward 18"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#8E8E93] font-medium block">
                      Age (Months)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[#121212] border border-[#2F3336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8E8E93] font-medium block">
                      Auditor / Team
                    </label>
                    <input
                      type="text"
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2F3336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#8E8E93] font-medium block">
                    Field Notes (Leaf / Soil Observation)
                  </label>
                  <input
                    type="text"
                    value={auditorNotes}
                    onChange={(e) => setAuditorNotes(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2F3336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    placeholder="e.g. Drooping yellow leaves, dry soil"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Gemini Smart Inspector Callout & Action */}
          <div className="border-t border-[#2A2A2A] pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#132219] border border-[#00E676]/30 p-4 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00E676]" />
                  <span className="font-bold text-sm text-white">
                    Gemini Visual Sapling Health Inspector
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#00E676]/20 text-[#00E676] rounded font-bold">
                    gemini-3.8-flash
                  </span>
                </div>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Rates leaf wilting, topsoil moisture, guard condition, and generates automated volunteer care tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={runGeminiInspection}
                disabled={isInspecting}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isInspecting
                    ? 'bg-[#2A2A2A] text-[#8E8E93] cursor-not-allowed'
                    : 'bg-[#00E676] text-black hover:bg-[#15f385] shadow-[0_0_15px_rgba(0,230,118,0.4)]'
                }`}
              >
                {isInspecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#00E676]" />
                    <span>{getTranslation(language, 'inspecting')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>{getTranslation(language, 'inspectWithGemini')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Error state */}
            {inspectionError && (
              <div className="bg-[#2B1717] border border-[#FF5252]/40 p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-[#FF8585]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF5252] flex-shrink-0" />
                  <span>{inspectionError}</span>
                </div>
                <button
                  type="button"
                  onClick={runGeminiInspection}
                  className="px-3 py-1 bg-[#FF5252]/20 hover:bg-[#FF5252]/30 text-white rounded font-semibold transition-colors cursor-pointer"
                >
                  {getTranslation(language, 'tryAgain')}
                </button>
              </div>
            )}

            {/* Result Display: Matched Shape */}
            {inspectionResult && (
              <div className="bg-[#1A1A1A] border-2 border-[#00E676] rounded-xl p-4 sm:p-5 space-y-4 shadow-[0_0_25px_rgba(0,230,118,0.15)] animate-fadeIn">
                {/* User Prompt Exact Shape String Output */}
                <div className="bg-[#121212] border border-[#333] p-3 rounded-lg font-mono text-xs text-[#E5E5EA] flex flex-wrap items-center gap-2 leading-relaxed">
                  <span className="text-[#8E8E93] font-bold">INSPECTION SUMMARY:</span>
                  <span className="font-bold text-[#FFD600]">
                    Health Score: {inspectionResult.healthScore}% ({inspectionResult.statusLabel})
                  </span>
                  <span className="text-[#555]">|</span>
                  <span className="font-bold text-[#00E676]">
                    Diagnosis: {inspectionResult.diagnosis}
                  </span>
                  <span className="text-[#555]">|</span>
                  <span className="font-semibold text-white">
                    Action: {inspectionResult.recommendedAction}
                  </span>
                </div>

                {/* Structured Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Health Score Gauge */}
                  <div className="bg-[#141414] p-3 rounded-lg border border-[#2A2A2A]">
                    <div className="flex items-center justify-between text-xs text-[#8E8E93] mb-1">
                      <span>Health Score</span>
                      <span className="font-bold text-white">{inspectionResult.healthScore}%</span>
                    </div>
                    <div className="w-full bg-[#252525] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          inspectionResult.healthScore > 75
                            ? 'bg-[#00E676]'
                            : inspectionResult.healthScore > 40
                            ? 'bg-[#FFD600]'
                            : 'bg-[#FF5252]'
                        }`}
                        style={{ width: `${inspectionResult.healthScore}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-[#D1D1D6] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>{inspectionResult.statusLabel}</span>
                    </div>
                  </div>

                  {/* Leaf & Soil Clinical Diagnosis */}
                  <div className="bg-[#141414] p-3 rounded-lg border border-[#2A2A2A] text-xs space-y-1">
                    <div className="text-[#8E8E93] font-medium flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Soil & Foliage</span>
                    </div>
                    <p className="font-semibold text-white truncate">{inspectionResult.diagnosis}</p>
                    <p className="text-[11px] text-[#A0A0A0] line-clamp-2">
                      {inspectionResult.leafCondition} • {inspectionResult.soilDryness}
                    </p>
                  </div>

                  {/* Assigned Task & Volunteer Action */}
                  <div className="bg-[#141414] p-3 rounded-lg border border-[#2A2A2A] text-xs space-y-1">
                    <div className="text-[#8E8E93] font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#FFD600]" />
                      <span>Automated Dispatch</span>
                    </div>
                    <p className="font-semibold text-white">{inspectionResult.assignedTeam}</p>
                    <p className="text-[11px] text-[#00E676] font-mono">
                      Water Req: {inspectionResult.waterRequiredLiters} Liters
                    </p>
                  </div>
                </div>

                {/* Save & Dispatch Button */}
                <button
                  type="button"
                  onClick={handleCommitAudit}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{getTranslation(language, 'saveAuditLog')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
