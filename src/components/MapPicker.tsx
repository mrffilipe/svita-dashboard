import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface MapPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat: number;
  initialLng: number;
  address?: string;
}

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

  const handleMarkerDrag = useCallback((event: any) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    setMarkerPosition({ lat: newLat, lng: newLng });
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
          }}
        >
          <Map
            defaultCenter={markerPosition}
            defaultZoom={16}
            gestureHandling="greedy"
            disableDefaultUI={false}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
          >
            <AdvancedMarker
              position={markerPosition}
              draggable={true}
              onDrag={handleMarkerDrag}
              onDragEnd={handleMarkerDrag}
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
