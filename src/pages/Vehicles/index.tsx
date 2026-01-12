import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigationMenu from '../../components/NavigationMenu';
import { vehiclesService, basesService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import type { VehicleDto, RegisterVehicleRequest, VehicleType, BaseListDto } from '../../types';

const Vehicles = () => {
  const { selectedTenantKey } = useTenant();
  
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [bases, setBases] = useState<BaseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterVehicleRequest>({
    plate: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Ambulance',
    baseId: '',
  });

  const fetchVehicles = async () => {
    if (!selectedTenantKey) {
      setError('Selecione um tenant primeiro');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await vehiclesService.list(page + 1, pageSize);
      setVehicles(result.items);
      setTotalItems(result.totalItems);
    } catch (err: any) {
      setError('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const fetchBases = async () => {
    if (!selectedTenantKey) return;
    
    try {
      const result = await basesService.list(1, 100);
      setBases(result.items);
    } catch (err: any) {
      console.error('Erro ao carregar bases:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, pageSize, selectedTenantKey]);

  useEffect(() => {
    if (openDialog) {
      fetchBases();
    }
  }, [openDialog, selectedTenantKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value,
    });
  };

  const handleTypeChange = (type: VehicleType) => {
    setFormData({
      ...formData,
      type,
    });
  };

  const handleBaseChange = (baseId: string) => {
    setFormData({
      ...formData,
      baseId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedTenantKey) {
      setError('Tenant não especificado');
      return;
    }

    try {
      await vehiclesService.create(formData);
      setSuccess('Veículo criado com sucesso!');
      setOpenDialog(false);
      setFormData({
        plate: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'Ambulance',
        baseId: '',
      });
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar veículo');
    }
  };

  const getVehicleTypeLabel = (type: VehicleType) => {
    const labels: Record<VehicleType, string> = {
      Ambulance: 'Ambulância',
      Other: 'Outro',
    };
    return labels[type];
  };

  const getVehicleTypeColor = (type: VehicleType) => {
    const colors: Record<VehicleType, 'error' | 'default'> = {
      Ambulance: 'error',
      Other: 'default',
    };
    return colors[type];
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
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Veículos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={!selectedTenantKey}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Novo Veículo
            </Button>
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

          {!selectedTenantKey ? (
            <Alert severity="warning">
              Selecione um tenant para visualizar os veículos.
            </Alert>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Placa</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Ano</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Base</TableCell>
                      <TableCell>Criado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{vehicle.plate}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>
                          <Chip
                            label={getVehicleTypeLabel(vehicle.type)}
                            color={getVehicleTypeColor(vehicle.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{vehicle.base.name}</TableCell>
                        <TableCell>
                          {new Date(vehicle.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
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
        </Paper>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Criar Novo Veículo</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="Placa"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <TextField
                required
                fullWidth
                label="Modelo"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Ano"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
              />
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => handleTypeChange(e.target.value as VehicleType)}
                >
                  <MenuItem value="Ambulance">Ambulância</MenuItem>
                  <MenuItem value="Other">Outro</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Base</InputLabel>
                <Select
                  value={formData.baseId}
                  label="Base"
                  onChange={(e) => handleBaseChange(e.target.value)}
                >
                  {bases.map((base) => (
                    <MenuItem key={base.id} value={base.id}>
                      {base.name} ({base.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Criar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Vehicles;
