import { useState, useRef, useEffect } from 'react';
import { TextField, Box, Paper, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: any) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const AddressAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  label = 'Endereço',
  required = false,
  disabled = false,
}: AddressAutocompleteProps) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLibraryReady, setIsLibraryReady] = useState(false);
  const placesLib = useMapsLibrary('places');
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  useEffect(() => {
    if (!placesLib) {
      console.log('Places library not loaded yet');
      setIsLibraryReady(false);
      return;
    }

    try {
      console.log('Initializing Google Places services');
      autocompleteService.current = new placesLib.AutocompleteService();
      
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div');
      placesService.current = new placesLib.PlacesService(dummyDiv);
      setIsLibraryReady(true);
      console.log('Google Places services initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Places services:', error);
      setIsLibraryReady(false);
    }
  }, [placesLib]);

  const handleInputChange = (inputValue: string) => {
    console.log('handleInputChange called with:', inputValue);
    onChange(inputValue);

    if (!inputValue || inputValue.length < 3) {
      console.log('Input too short or empty, clearing predictions');
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (!autocompleteService.current) {
      console.error('AutocompleteService not initialized yet');
      return;
    }

    console.log('Fetching predictions for:', inputValue);
    setLoading(true);
    
    autocompleteService.current.getPlacePredictions(
      {
        input: inputValue,
        componentRestrictions: { country: 'br' },
      },
      (predictions: any, status: any) => {
        console.log('Predictions callback - Status:', status, 'Predictions:', predictions);
        setLoading(false);
        
        if (status === 'OK' && predictions) {
          console.log('Predictions received:', predictions.length);
          setPredictions(predictions);
          setShowPredictions(true);
        } else {
          console.error('No predictions or error. Status:', status);
          setPredictions([]);
          setShowPredictions(false);
        }
      }
    );
  };

  const handlePredictionClick = async (placeId: string, description: string) => {
    if (!placesService.current) return;

    onChange(description);
    setShowPredictions(false);
    setPredictions([]);

    // Get place details
    placesService.current.getDetails(
      {
        placeId,
        fields: ['geometry', 'formatted_address', 'address_components'],
      },
      (place: any, status: any) => {
        if (status === 'OK' && place) {
          onPlaceSelect(place);
        }
      }
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        required={required}
        disabled={disabled || !isLibraryReady}
        label={label}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowPredictions(true);
          }
        }}
        helperText={!isLibraryReady ? 'Carregando serviço de endereços...' : undefined}
        InputProps={{
          endAdornment: loading ? <CircularProgress size={20} /> : null,
        }}
      />

      {showPredictions && predictions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 300,
            overflow: 'auto',
            mt: 0.5,
          }}
          elevation={3}
        >
          <List>
            {predictions.map((prediction) => (
              <ListItemButton
                key={prediction.place_id}
                onClick={() => handlePredictionClick(prediction.place_id, prediction.description)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={prediction.structured_formatting.main_text}
                  secondary={prediction.structured_formatting.secondary_text}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default AddressAutocomplete;
