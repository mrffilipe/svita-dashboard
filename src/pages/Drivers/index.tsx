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
  TablePagination,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import NavigationMenu from '../../components/NavigationMenu';
import { driversService, vehiclesService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import type { DriverStatusDto, VehicleDto, StartShiftRequest } from '../../types';

const Drivers = () => {
  const { selectedTenantKey } = useTenant();
  
  const [tabValue, setTabValue] = useState(0);
  const [allDrivers, setAllDrivers] = useState<DriverStatusDto[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverStatusDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openStartShiftDialog, setOpenStartShiftDialog] = useState(false);
  const [openEndShiftDialog, setOpenEndShiftDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverStatusDto | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchAllDrivers = async () => {
    if (!selectedTenantKey) {
      setError('Selecione um tenant primeiro');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await driversService.list(page + 1, pageSize);
      setAllDrivers(result.items);
      setTotalItems(result.totalItems);
    } catch (err: any) {
      setError('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    if (!selectedTenantKey) {
      setError('Selecione um tenant primeiro');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await driversService.getAvailable();
      setAvailableDrivers(result);
    } catch (err: any) {
      setError('Erro ao carregar motoristas disponíveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchAllDrivers();
    } else {
      fetchAvailableDrivers();
    }
  }, [page, pageSize, selectedTenantKey, tabValue]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    setError(null);
  };

  const fetchVehicles = async () => {
    try {
      const result = await vehiclesService.list(1, 100);
      setVehicles(result.items);
    } catch (err: any) {
      setError('Erro ao carregar veículos');
    }
  };

  const handleOpenStartShift = (driver: DriverStatusDto) => {
    console.log('Opening start shift dialog for driver:', driver);
    setSelectedDriver(driver);
    setOpenStartShiftDialog(true);
    fetchVehicles();
  };

  const handleOpenEndShift = (driver: DriverStatusDto) => {
    setSelectedDriver(driver);
    setOpenEndShiftDialog(true);
  };

  const handleStartShift = async () => {
    if (!selectedDriver || !selectedVehiclePlate) return;

    setLoadingAction(true);
    setError(null);
    setSuccess(null);

    try {
      const shiftData: StartShiftRequest = {
        driverTenantUserId: selectedDriver.tenantUserId,
        startingLocation: {
          coordinate: {
            latitude: 0,
            longitude: 0,
          },
          timestamp: new Date().toISOString(),
        },
      };

      await vehiclesService.startShift(selectedVehiclePlate, shiftData);
      setSuccess('Turno iniciado com sucesso!');
      setOpenStartShiftDialog(false);
      setSelectedVehiclePlate('');
      
      if (tabValue === 0) {
        fetchAllDrivers();
      } else {
        fetchAvailableDrivers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao iniciar turno');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEndShift = async () => {
    if (!selectedDriver?.activeShift) return;

    setLoadingAction(true);
    setError(null);
    setSuccess(null);

    try {
      await vehiclesService.endShift(selectedDriver.activeShift.driverShiftId);
      setSuccess('Turno finalizado com sucesso!');
      setOpenEndShiftDialog(false);
      
      if (tabValue === 0) {
        fetchAllDrivers();
      } else {
        fetchAvailableDrivers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao finalizar turno');
    } finally {
      setLoadingAction(false);
    }
  };

  const renderDriverRow = (driver: DriverStatusDto) => {
    console.log('Rendering driver:', driver.name, 'hasActiveShift:', !!driver.activeShift, 'isOnline:', driver.isOnline);
    
    return (
      <TableRow key={driver.driverProfileId}>
        <TableCell>{driver.name}</TableCell>
        <TableCell>
          <Chip
            icon={driver.isOnline ? <CheckCircleIcon /> : <CancelIcon />}
            label={driver.isOnline ? 'Online' : 'Offline'}
            color={driver.isOnline ? 'success' : 'default'}
            size="small"
          />
        </TableCell>
        <TableCell>
          {driver.activeShift ? (
            <Box>
              <Typography variant="body2">
                {driver.activeShift.vehicle.plate} - {driver.activeShift.vehicle.model}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Velocidade: {driver.activeShift.currentLocation.speed?.toFixed(1) || '0'} km/h
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sem turno ativo
            </Typography>
          )}
        </TableCell>
        <TableCell>
          {driver.activeShift?.currentLocation ? (
            <Typography variant="body2">
              {driver.activeShift.currentLocation.coordinate.latitude.toFixed(6)}, {' '}
              {driver.activeShift.currentLocation.coordinate.longitude.toFixed(6)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )}
        </TableCell>
        <TableCell>
          {driver.activeShift ? (
            <IconButton
              color="error"
              size="small"
              onClick={() => handleOpenEndShift(driver)}
              title="Finalizar turno"
            >
              <StopIcon />
            </IconButton>
          ) : (
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleOpenStartShift(driver)}
              disabled={!driver.isOnline}
              title="Iniciar turno"
            >
              <PlayArrowIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 12, pb: 4, px: 2 }}>
      <NavigationMenu />
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DirectionsCarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Motoristas
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Todos os Motoristas" />
            <Tab label="Motoristas Disponíveis" />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

          {!selectedTenantKey ? (
            <Alert severity="warning">
              Selecione um tenant para visualizar os motoristas.
            </Alert>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {tabValue === 0 && (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Veículo/Turno</TableCell>
                          <TableCell>Localização</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allDrivers.map((driver) => renderDriverRow(driver))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    labelRowsPerPage="Itens por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} de ${count}`
                    }
                  />
                </>
              )}

              {tabValue === 1 && (
                <>
                  {availableDrivers.length === 0 ? (
                    <Alert severity="info">
                      Nenhum motorista disponível no momento.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Veículo/Turno</TableCell>
                            <TableCell>Localização</TableCell>
                            <TableCell>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {availableDrivers.map((driver) => renderDriverRow(driver))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </>
          )}
        </Paper>
      </Container>

      <Dialog open={openStartShiftDialog} onClose={() => setOpenStartShiftDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Iniciar Turno</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Motorista: <strong>{selectedDriver?.name}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Selecione o Veículo</InputLabel>
              <Select
                value={selectedVehiclePlate}
                label="Selecione o Veículo"
                onChange={(e) => setSelectedVehiclePlate(e.target.value)}
              >
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.plate}>
                    {vehicle.plate} - {vehicle.model} ({vehicle.year})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStartShiftDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleStartShift}
            variant="contained"
            disabled={!selectedVehiclePlate || loadingAction}
            startIcon={loadingAction ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Iniciar Turno
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEndShiftDialog} onClose={() => setOpenEndShiftDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Finalizar Turno</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Motorista: <strong>{selectedDriver?.name}</strong>
            </Typography>
            {selectedDriver?.activeShift && (
              <Typography variant="body2">
                Veículo: <strong>{selectedDriver.activeShift.vehicle.plate} - {selectedDriver.activeShift.vehicle.model}</strong>
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              Tem certeza que deseja finalizar este turno?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEndShiftDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleEndShift}
            variant="contained"
            color="error"
            disabled={loadingAction}
            startIcon={loadingAction ? <CircularProgress size={20} /> : <StopIcon />}
          >
            Finalizar Turno
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Drivers;
