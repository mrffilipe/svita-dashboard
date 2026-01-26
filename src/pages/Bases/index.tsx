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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { APIProvider } from '@vis.gl/react-google-maps';
import NavigationMenu from '../../components/NavigationMenu';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import MapPicker from '../../components/MapPicker';
import { basesService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import type { BaseListDto, RegisterBaseRequest, BaseType, UpdateBaseRequest } from '../../types';
import { translateBaseType } from '../../utils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const Bases = () => {
  const { selectedTenantKey } = useTenant();
  
  const [bases, setBases] = useState<BaseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openMapPicker, setOpenMapPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingBase, setEditingBase] = useState<BaseListDto | null>(null);
  const [formData, setFormData] = useState<RegisterBaseRequest>({
    name: '',
    type: 'Hospital',
    location: {
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
      address: '',
      complement: '',
    },
  });

  const fetchBases = async () => {
    if (!selectedTenantKey) {
      setError('Selecione um tenant primeiro');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await basesService.list(page + 1, pageSize);
      setBases(result.items);
      setTotalItems(result.totalItems);
    } catch (err: any) {
      setError('Erro ao carregar bases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, [page, pageSize, selectedTenantKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.coordinate.')) {
      const coordField = name.split('.')[2] as 'latitude' | 'longitude';
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinate: {
            ...formData.location.coordinate,
            [coordField]: parseFloat(value) || 0,
          },
        },
      });
    } else if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleTypeChange = (type: BaseType) => {
    setFormData({
      ...formData,
      type,
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
      await basesService.create(formData);
      setSuccess('Base criada com sucesso!');
      setOpenDialog(false);
      setFormData({
        name: '',
        type: 'Hospital',
        location: {
          coordinate: {
            latitude: 0,
            longitude: 0,
          },
          address: '',
          complement: '',
        },
      });
      fetchBases();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar base');
    }
  };

  const handleEdit = (base: BaseListDto) => {
    setEditingBase(base);
    setFormData({
      name: base.name,
      type: base.type,
      location: base.location,
    });
    setOpenEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedTenantKey || !editingBase) {
      setError('Dados não especificados');
      return;
    }

    try {
      const updateData: UpdateBaseRequest = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
      };

      await basesService.update(editingBase.id, updateData);
      setSuccess('Base atualizada com sucesso!');
      setOpenEditDialog(false);
      setEditingBase(null);
      setFormData({
        name: '',
        type: 'Hospital',
        location: {
          coordinate: {
            latitude: 0,
            longitude: 0,
          },
          address: '',
          complement: '',
        },
      });
      fetchBases();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar base');
    }
  };

  const handleDelete = async (base: BaseListDto) => {
    if (!window.confirm(`Tem certeza que deseja excluir a base "${base.name}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (!selectedTenantKey) {
      setError('Tenant não especificado');
      return;
    }

    try {
      await basesService.delete(base.id);
      setSuccess('Base excluída com sucesso!');
      fetchBases();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir base');
    }
  };

  const getBaseTypeColor = (type: BaseType) => {
    const colors: Record<BaseType, 'error' | 'primary' | 'success' | 'warning' | 'info' | 'default'> = {
      Hospital: 'error',
      HealthCenter: 'primary',
      Clinic: 'info',
      FireDepartment: 'warning',
      MunicipalGarage: 'success',
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
              Bases
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={!selectedTenantKey}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Nova Base
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
              Selecione um tenant para visualizar as bases.
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
                      <TableCell>Código</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Endereço</TableCell>
                      <TableCell>Veículos</TableCell>
                      <TableCell>Criado em</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bases.map((base) => (
                      <TableRow key={base.id}>
                        <TableCell>{base.code}</TableCell>
                        <TableCell>{base.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={translateBaseType(base.type)}
                            color={getBaseTypeColor(base.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{base.location.address || '-'}</TableCell>
                        <TableCell>{base.vehicles?.length || 0}</TableCell>
                        <TableCell>
                          {new Date(base.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(base)}
                              variant="outlined"
                            >
                              Editar
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(base)}
                              variant="outlined"
                              color="error"
                            >
                              Excluir
                            </Button>
                          </Stack>
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
          <DialogTitle>Criar Nova Base</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => handleTypeChange(e.target.value as BaseType)}
                >
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="HealthCenter">Centro de Saúde</MenuItem>
                  <MenuItem value="Clinic">Clínica</MenuItem>
                  <MenuItem value="FireDepartment">Corpo de Bombeiros</MenuItem>
                  <MenuItem value="MunicipalGarage">Garagem Municipal</MenuItem>
                  <MenuItem value="Other">Outro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                required
                fullWidth
                label="Latitude"
                name="location.coordinate.latitude"
                type="number"
                inputProps={{ step: 'any' }}
                value={formData.location.coordinate.latitude}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Longitude"
                name="location.coordinate.longitude"
                type="number"
                inputProps={{ step: 'any' }}
                value={formData.location.coordinate.longitude}
                onChange={handleChange}
              />
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <AddressAutocomplete
                  value={formData.location.address || ''}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: value,
                      },
                    });
                  }}
                  onPlaceSelect={(place) => {
                    const lat = place.geometry?.location?.lat();
                    const lng = place.geometry?.location?.lng();
                    if (lat && lng) {
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: place.formatted_address || formData.location.address || '',
                          coordinate: {
                            latitude: lat,
                            longitude: lng,
                          },
                        },
                      });
                      setOpenMapPicker(true);
                    }
                  }}
                  label="Endereço"
                />
              </APIProvider>
              <TextField
                fullWidth
                label="Complemento"
                name="location.complement"
                value={formData.location.complement}
                onChange={handleChange}
              />
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

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleUpdate}>
          <DialogTitle>Editar Base</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => handleTypeChange(e.target.value as BaseType)}
                >
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="HealthCenter">Centro de Saúde</MenuItem>
                  <MenuItem value="Clinic">Clínica</MenuItem>
                  <MenuItem value="FireDepartment">Corpo de Bombeiros</MenuItem>
                  <MenuItem value="MunicipalGarage">Garagem Municipal</MenuItem>
                  <MenuItem value="Other">Outro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                required
                fullWidth
                label="Latitude"
                name="location.coordinate.latitude"
                type="number"
                inputProps={{ step: 'any' }}
                value={formData.location.coordinate.latitude}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Longitude"
                name="location.coordinate.longitude"
                type="number"
                inputProps={{ step: 'any' }}
                value={formData.location.coordinate.longitude}
                onChange={handleChange}
              />
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <AddressAutocomplete
                  value={formData.location.address || ''}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: value,
                      },
                    });
                  }}
                  onPlaceSelect={(place) => {
                    const lat = place.geometry?.location?.lat();
                    const lng = place.geometry?.location?.lng();
                    if (lat && lng) {
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: place.formatted_address || formData.location.address || '',
                          coordinate: {
                            latitude: lat,
                            longitude: lng,
                          },
                        },
                      });
                      setOpenMapPicker(true);
                    }
                  }}
                  label="Endereço"
                />
              </APIProvider>
              <TextField
                fullWidth
                label="Complemento"
                name="location.complement"
                value={formData.location.complement}
                onChange={handleChange}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Atualizar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <MapPicker
          open={openMapPicker}
          onClose={() => setOpenMapPicker(false)}
          onConfirm={(lat, lng) => {
            setFormData({
              ...formData,
              location: {
                ...formData.location,
                coordinate: {
                  latitude: lat,
                  longitude: lng,
                },
              },
            });
          }}
          initialLat={formData.location.coordinate.latitude}
          initialLng={formData.location.coordinate.longitude}
          address={formData.location.address}
        />
      </APIProvider>
    </Box>
  );
};

export default Bases;
