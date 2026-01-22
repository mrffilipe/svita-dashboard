import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Map, Marker } from '@vis.gl/react-google-maps';

interface MapPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat: number;
  initialLng: number;
  address?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapPicker = ({
  open,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  address,
}: MapPickerProps) => {
  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Check API Key configuration
  useEffect(() => {
    console.log('MapPicker - API Key check:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('API Key do Google Maps não encontrada. Verifique a variável de ambiente VITE_GOOGLE_MAPS_API_KEY.');
      setIsMapLoading(false);
    } else if (GOOGLE_MAPS_API_KEY.length < 20) {
      setMapError('API Key do Google Maps parece inválida. Verifique a configuração.');
      setIsMapLoading(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      console.log('MapPicker opened with initial coords:', initialLat, initialLng);
      const validLat = initialLat || -23.5505; // Default: São Paulo
      const validLng = initialLng || -46.6333; // Default: São Paulo
      setMarkerPosition({ lat: validLat, lng: validLng });
      setMapError(null);
      setIsMapLoading(true);
    }
  }, [open, initialLat, initialLng]);

  const handleMarkerDrag = useCallback((event: any) => {
    console.log('Marker dragged:', event);
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    console.log('New position:', newLat, newLng);
    setMarkerPosition({ lat: newLat, lng: newLng });
  }, []);

  const handleMapLoad = useCallback(() => {
    console.log('Map loaded successfully');
    setIsMapLoading(false);
  }, []);

  const handleMapError = useCallback((error: any) => {
    console.error('Map error:', error);
    setMapError('Erro ao carregar o mapa. Verifique se a API Key tem permissão para este domínio (localhost:5173/5174). No Google Cloud Console, vá em APIs & Services > Credentials > Edit API Key > Application restrictions e adicione os domínios localhost.');
    setIsMapLoading(false);
  }, []);

  const handleConfirm = () => {
    onConfirm(markerPosition.lat, markerPosition.lng);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Ajustar Localização</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {address && (
            <Typography variant="body2" color="text.secondary">
              Endereço: {address}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Arraste o marcador para ajustar a localização exata
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Coordenadas: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: 450,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
          }}
        >
          {isMapLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          
          {mapError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mapError}
            </Alert>
          )}

          <Map
            defaultCenter={markerPosition}
            defaultZoom={16}
            gestureHandling="greedy"
            disableDefaultUI={false}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
            onIdle={handleMapLoad}
            onError={handleMapError}
          >
            <Marker
              position={markerPosition}
              draggable={true}
              onDrag={handleMarkerDrag}
            />
          </Map>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirmar Localização
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapPicker;
