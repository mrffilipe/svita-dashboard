import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import NavigationMenu from '../../components/NavigationMenu';
import { dispatchService, driversService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import { useSignalR } from '../../hooks/useSignalR';
import type { RequestDto, DriverStatusDto, PriorityOccurrence } from '../../types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const Occurrences = () => {
  const { selectedTenantKey } = useTenant();
  const { requests, isConnected, error: signalRError, refresh } = useSignalR(selectedTenantKey);
  
  const [drivers, setDrivers] = useState<DriverStatusDto[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestDto | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedDriverShiftId, setSelectedDriverShiftId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityOccurrence>('Medium');
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -14.2350, lng: -51.9253 });
  const [selectedDriverInfo, setSelectedDriverInfo] = useState<DriverStatusDto | null>(null);

  useEffect(() => {
    if (selectedTenantKey) {
      fetchDrivers();
      
      // Atualizar motoristas a cada 5 segundos
      const interval = setInterval(() => {
        fetchDrivers();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedTenantKey]);

  useEffect(() => {
    // Calcular centro do mapa baseado nas localizações de requests e drivers
    const allCoordinates: { lat: number; lng: number }[] = [];

    requests.forEach((request) => {
      if (request.pickup.coordinate) {
        allCoordinates.push({
          lat: request.pickup.coordinate.latitude,
          lng: request.pickup.coordinate.longitude,
        });
      }
    });

    drivers.forEach((driver) => {
      if (driver.activeShift?.currentLocation?.coordinate) {
        allCoordinates.push({
          lat: driver.activeShift.currentLocation.coordinate.latitude,
          lng: driver.activeShift.currentLocation.coordinate.longitude,
        });
      }
    });

    if (allCoordinates.length > 0) {
      const avgLat = allCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / allCoordinates.length;
      const avgLng = allCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / allCoordinates.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
      console.log(`Map updated: ${requests.length} requests, ${drivers.length} drivers`);
    }
  }, [requests, drivers]);

  const fetchDrivers = async () => {
    if (!selectedTenantKey) return;

    setLoadingDrivers(true);
    try {
      const availableDrivers = await driversService.getAvailable();
      setDrivers(availableDrivers);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar motoristas');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleOpenAssignDialog = (request: RequestDto) => {
    console.log('Opening assign dialog for request:', request.id);
    setSelectedRequest(request);
    setOpenAssignDialog(true);
    setSelectedDriverShiftId('');
    setSelectedPriority('Medium');
    setError(null);
    setSuccess(null);
    // Buscar motoristas ao abrir o dialog
    fetchDrivers();
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedRequest(null);
    setSelectedDriverShiftId('');
    setSelectedPriority('Medium');
  };

  const handleAssignOccurrence = async () => {
    if (!selectedRequest || !selectedDriverShiftId) {
      setError('Selecione um motorista');
      return;
    }

    console.log('Assigning occurrence:', {
      requestId: selectedRequest.id,
      driverShiftId: selectedDriverShiftId,
      priority: selectedPriority,
    });

    setLoadingAssign(true);
    setError(null);
    setSuccess(null);

    try {
      await dispatchService.startOccurrence(selectedRequest.id, {
        driverShiftId: selectedDriverShiftId,
        priority: selectedPriority,
      });
      console.log('Occurrence assigned successfully');
      setSuccess('Ocorrência atribuída com sucesso!');
      handleCloseAssignDialog();
      // Atualizar lista de requests via SignalR
      if (refresh) {
        await refresh();
      }
    } catch (err: any) {
      console.error('Error assigning occurrence:', err);
      setError(err.response?.data?.message || 'Erro ao atribuir ocorrência');
    } finally {
      setLoadingAssign(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AwaitingReview':
        return 'warning';
      case 'InProgress':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AwaitingReview':
        return 'Aguardando Avaliação';
      case 'InProgress':
        return 'Em Progresso';
      case 'Completed':
        return 'Concluída';
      case 'Cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getOccurrenceTypeLabel = (type: string) => {
    switch (type) {
      case 'Urgent':
        return 'Urgente';
      case 'Emergency':
        return 'Emergência';
      case 'Elective':
        return 'Eletiva';
      case 'Social':
        return 'Social';
      case 'Other':
        return 'Outro';
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: PriorityOccurrence) => {
    switch (priority) {
      case 'VeryHigh':
        return 'Muito Alta';
      case 'High':
        return 'Alta';
      case 'Medium':
        return 'Média';
      case 'Low':
        return 'Baixa';
      case 'VeryLow':
        return 'Muito Baixa';
      default:
        return priority;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 12, pb: 4, px: 2 }}>
      <NavigationMenu />
      <Container maxWidth="xl">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalShippingIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Ocorrências em Tempo Real
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Typography>
            </Stack>
          </Stack>

          {(error || signalRError) && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error || signalRError}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {!selectedTenantKey ? (
            <Alert severity="warning">
              Selecione um tenant para visualizar as ocorrências em tempo real.
            </Alert>
          ) : !isConnected ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Conectando ao servidor em tempo real...</Typography>
            </Box>
          ) : (
            <>
              {/* Google Maps */}
              <Box sx={{ mb: 3, height: 500, borderRadius: 2, overflow: 'hidden' }}>
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <Map
                    defaultCenter={mapCenter}
                    defaultZoom={4}
                    mapId="occurrences-map"
                    gestureHandling="greedy"
                  >
                    {/* Markers para requests (pacientes) */}
                    {requests.map((request) => (
                      request.pickup.coordinate && (
                        <AdvancedMarker
                          key={`request-${request.id}`}
                          position={{
                            lat: request.pickup.coordinate.latitude,
                            lng: request.pickup.coordinate.longitude,
                          }}
                        >
                          <Pin
                            background="#ef4444"
                            borderColor="#991b1b"
                            glyphColor="#ffffff"
                          />
                        </AdvancedMarker>
                      )
                    ))}

                    {/* Markers para motoristas (ambulâncias) */}
                    {drivers.map((driver) => (
                      driver.activeShift?.currentLocation?.coordinate && (
                        <AdvancedMarker
                          key={`driver-${driver.driverProfileId}`}
                          position={{
                            lat: driver.activeShift.currentLocation.coordinate.latitude,
                            lng: driver.activeShift.currentLocation.coordinate.longitude,
                          }}
                          onClick={() => setSelectedDriverInfo(driver)}
                        >
                          <div style={{
                            background: '#10b981',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #065f46',
                            fontSize: '20px',
                            cursor: 'pointer',
                          }}>
                            🚑
                          </div>
                        </AdvancedMarker>
                      )
                    ))}

                    {/* InfoWindow para mostrar informações do motorista */}
                    {selectedDriverInfo && selectedDriverInfo.activeShift?.currentLocation?.coordinate && (
                      <InfoWindow
                        position={{
                          lat: selectedDriverInfo.activeShift.currentLocation.coordinate.latitude,
                          lng: selectedDriverInfo.activeShift.currentLocation.coordinate.longitude,
                        }}
                        onCloseClick={() => setSelectedDriverInfo(null)}
                      >
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {selectedDriverInfo.name}
                          </Typography>
                          <Divider sx={{ mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong> {selectedDriverInfo.isOnline ? 'Online' : 'Offline'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Veículo:</strong> {selectedDriverInfo.activeShift.vehicle.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Placa:</strong> {selectedDriverInfo.activeShift.vehicle.plate}
                          </Typography>
                          {selectedDriverInfo.activeShift.currentLocation.speed !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Velocidade:</strong> {selectedDriverInfo.activeShift.currentLocation.speed.toFixed(0)} km/h
                            </Typography>
                          )}
                        </Box>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </Box>

              {requests.length === 0 ? (
                <Alert severity="info">
                  Nenhuma solicitação disponível no momento. As solicitações aparecerão aqui em tempo real.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {requests.length} {requests.length === 1 ? 'solicitação disponível' : 'solicitações disponíveis'}
                  </Typography>
                  <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Paciente</TableCell>
                      <TableCell>Local de Coleta</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getOccurrenceTypeLabel(request.aboutOccurrence.type)}
                            size="small"
                            color={request.aboutOccurrence.type === 'Emergency' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {request.patient ? (
                            <Box>
                              <Typography variant="body2">{request.patient.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.patient.phone.value}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Não informado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.pickup.address}
                          </Typography>
                          {request.pickup.complement && (
                            <Typography variant="caption" color="text.secondary">
                              {request.pickup.complement}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenAssignDialog(request)}
                            title="Atribuir ocorrência"
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                </>
              )}
            </>
          )}
        </Paper>
      </Container>

      <Dialog 
        open={openAssignDialog} 
        onClose={handleCloseAssignDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Atribuir Ocorrência</Typography>
            <IconButton onClick={handleCloseAssignDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Detalhes da Solicitação
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tipo
                      </Typography>
                      <Typography variant="body1">
                        {getOccurrenceTypeLabel(selectedRequest.aboutOccurrence.type)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Local de Coleta
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.pickup.address}
                      </Typography>
                    </Grid>
                    {selectedRequest.patient && (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Paciente
                          </Typography>
                          <Typography variant="body1">
                            {selectedRequest.patient.name}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Telefone
                          </Typography>
                          <Typography variant="body1">
                            {selectedRequest.patient.phone.value}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Selecione o Motorista</InputLabel>
                    <Select
                      value={selectedDriverShiftId}
                      label="Selecione o Motorista"
                      onChange={(e) => setSelectedDriverShiftId(e.target.value)}
                      disabled={loadingDrivers}
                    >
                      {loadingDrivers ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Carregando motoristas...
                        </MenuItem>
                      ) : drivers.length === 0 ? (
                        <MenuItem disabled>Nenhum motorista em turno disponível</MenuItem>
                      ) : (
                        drivers.map((driver) => (
                          <MenuItem key={driver.activeShift!.driverShiftId} value={driver.activeShift!.driverShiftId}>
                            {driver.name} - {driver.activeShift!.vehicle.plate} ({driver.activeShift!.vehicle.model})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Prioridade</InputLabel>
                    <Select
                      value={selectedPriority}
                      label="Prioridade"
                      onChange={(e) => setSelectedPriority(e.target.value as PriorityOccurrence)}
                    >
                      <MenuItem value="VeryHigh">Muito Alta</MenuItem>
                      <MenuItem value="High">Alta</MenuItem>
                      <MenuItem value="Medium">Média</MenuItem>
                      <MenuItem value="Low">Baixa</MenuItem>
                      <MenuItem value="VeryLow">Muito Baixa</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancelar</Button>
          <Button
            onClick={handleAssignOccurrence}
            variant="contained"
            disabled={loadingAssign || !selectedDriverShiftId || drivers.length === 0}
            startIcon={loadingAssign ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Atribuir Ocorrência
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Occurrences;
