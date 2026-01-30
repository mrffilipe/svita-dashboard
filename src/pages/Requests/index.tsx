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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField as MuiTextField,
  Card,
  CardContent,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import { APIProvider } from '@vis.gl/react-google-maps';
import NavigationMenu from '../../components/NavigationMenu';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import MapPicker from '../../components/MapPicker';
import { requestsService, platformTenantsService } from '../../services';
import { userService } from '../../services/userService';
import { useTenant } from '../../contexts/TenantContext';
import type { RequestDto, RegisterRequestRequest, TypeOccurrence, UpdateRequestRequest } from '../../types';
import type { UserDto } from '../../types/user';
import { formatPhone, formatCpfCnpj } from '../../utils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const Requests = () => {
  const { selectedTenantKey } = useTenant();
  
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestDto | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openMapPicker, setOpenMapPicker] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RequestDto | null>(null);
  const [patientSearchResults, setPatientSearchResults] = useState<UserDto[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userTerms: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState<Partial<RegisterRequestRequest>>({
    pickup: {
      coordinate: { latitude: 0, longitude: 0 },
      address: '',
      complement: '',
    },
    aboutOccurrence: {
      type: 'Urgent' as TypeOccurrence,
      description: '',
    },
    patient: {
      name: '',
      phone: { value: '' },
      cpf: { value: '' },
      typeOfApplicant: 'Patient',
    },
  });

  const fetchRequests = async () => {
    if (!selectedTenantKey) {
      setError('Selecione um tenant para visualizar as solicitações.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Constrói filtros para a API
      const apiFilters: any = {
        page: page + 1,
        pageSize: pageSize,
      };

      // Adiciona filtros apenas se tiverem valores
      if (filters.userTerms && filters.userTerms.length >= 3) {
        apiFilters.userTerms = filters.userTerms;
      }
      if (filters.status) {
        apiFilters.status = filters.status;
      }
      if (filters.startDate) {
        // Converte de DD/MM/YYYY para YYYY/MM/DD
        const [day, month, year] = filters.startDate.split('/');
        if (day && month && year) {
          apiFilters.startDate = `${year}/${month}/${day}`;
        }
      }
      if (filters.endDate) {
        // Converte de DD/MM/YYYY para YYYY/MM/DD
        const [day, month, year] = filters.endDate.split('/');
        if (day && month && year) {
          apiFilters.endDate = `${year}/${month}/${day}`;
        }
      }

      const result = await requestsService.getAll(apiFilters);
      setRequests(result.items);
      setTotalItems(result.totalItems);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar solicitações');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, pageSize, selectedTenantKey]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      userTerms: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchRequests();
  };

  useEffect(() => {
    if (selectedTenantKey) {
      fetchRequests();
    }
  }, [page, pageSize, selectedTenantKey]);

  const handleViewDetails = async (requestId: string) => {
    setLoadingDetail(true);
    setOpenDetailDialog(true);
    try {
      const request = await requestsService.getById(requestId);
      setSelectedRequest(request);
    } catch (err: any) {
      setError('Erro ao carregar detalhes da solicitação');
      setOpenDetailDialog(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
    setSelectedRequest(null);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      pickup: {
        coordinate: { latitude: 0, longitude: 0 },
        address: '',
        complement: '',
      },
      aboutOccurrence: {
        type: 'Urgent' as TypeOccurrence,
        description: '',
      },
      patient: {
        name: '',
        phone: { value: '' },
        cpf: { value: '' },
        typeOfApplicant: 'Patient',
      },
    });
  };

  const handleFormChange = (field: string, value: any) => {
    if (field.startsWith('pickup.')) {
      const pickupField = field.split('.')[1];
      if (pickupField === 'latitude' || pickupField === 'longitude') {
        setFormData(prev => ({
          ...prev,
          pickup: {
            ...prev.pickup!,
            coordinate: {
              ...prev.pickup!.coordinate,
              [pickupField]: parseFloat(value) || 0,
            },
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          pickup: {
            ...prev.pickup!,
            [pickupField]: value,
          },
        }));
      }
    } else if (field.startsWith('aboutOccurrence.')) {
      const occurrenceField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        aboutOccurrence: {
          ...prev.aboutOccurrence!,
          [occurrenceField]: value,
        },
      }));
    } else if (field.startsWith('patient.')) {
      const patientField = field.split('.')[1];
      if (patientField === 'phone' || patientField === 'cpf') {
        setFormData(prev => ({
          ...prev,
          patient: {
            ...prev.patient!,
            [patientField]: { value },
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          patient: {
            ...prev.patient!,
            [patientField]: value,
          },
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    const authSession = localStorage.getItem('authSession');
    if (!authSession) {
      setError('Sessão não encontrada');
      return;
    }

    const session = JSON.parse(authSession);
    const userId = session.userId;

    if (!formData.pickup?.address || !formData.aboutOccurrence?.type) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    setLoadingCreate(true);
    setError(null);
    setSuccess(null);

    try {
      // Buscar os tenants do usuário para obter o tenantId
      const myTenants = await platformTenantsService.getMyTenants();
      const selectedTenant = myTenants.find(t => t.tenantKey === selectedTenantKey);

      if (!selectedTenant) {
        setError('Tenant não encontrado');
        setLoadingCreate(false);
        return;
      }

      const requestData: RegisterRequestRequest = {
        tenantId: selectedTenant.tenantId,
        userId,
        pickup: formData.pickup!,
        aboutOccurrence: formData.aboutOccurrence!,
        patient: formData.patient?.name ? formData.patient : undefined,
      };

      await requestsService.create(requestData);
      setSuccess('Solicitação criada com sucesso!');
      handleCloseCreateDialog();
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar solicitação');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleEdit = async (request: RequestDto) => {
    if (request.status !== 'AwaitingReview') {
      setError('Só é possível editar solicitações com status "Aguardando Revisão"');
      return;
    }

    setLoadingDetail(true);
    try {
      const requestDetails = await requestsService.getById(request.id);
      setEditingRequest(requestDetails);
      setFormData({
        pickup: {
          coordinate: requestDetails.pickup.coordinate,
          address: requestDetails.pickup.address,
          complement: requestDetails.pickup.complement || '',
        },
        aboutOccurrence: requestDetails.aboutOccurrence,
        patient: requestDetails.patient,
        scheduling: requestDetails.scheduling,
      });
      setOpenEditDialog(true);
    } catch (err: any) {
      setError('Erro ao carregar dados da solicitação para edição');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRequest) {
      setError('Solicitação não encontrada');
      return;
    }

    if (!formData.pickup?.address || !formData.aboutOccurrence?.type) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    setLoadingUpdate(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateRequestRequest = {
        pickup: formData.pickup!,
        aboutOccurrence: formData.aboutOccurrence!,
        patient: formData.patient?.name ? formData.patient : undefined,
        scheduling: formData.scheduling,
      };

      await requestsService.update(editingRequest.id, updateData);
      setSuccess('Solicitação atualizada com sucesso!');
      setOpenEditDialog(false);
      setEditingRequest(null);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar solicitação');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingRequest(null);
    setFormData({
      pickup: {
        coordinate: { latitude: 0, longitude: 0 },
        address: '',
        complement: '',
      },
      aboutOccurrence: {
        type: 'Urgent' as TypeOccurrence,
        description: '',
      },
      patient: {
        name: '',
        phone: { value: '' },
        cpf: { value: '' },
        typeOfApplicant: 'Patient',
      },
    });
  };

  const handlePatientSearch = async (term: string) => {
    setPatientSearchTerm(term);
    
    if (term.length < 3) {
      setPatientSearchResults([]);
      return;
    }

    setSearchingPatients(true);
    try {
      const results = await userService.search(term);
      setPatientSearchResults(results);
    } catch (err: any) {
      console.error('Erro ao buscar pacientes:', err);
      setPatientSearchResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleSelectPatient = (user: UserDto) => {
    setFormData({
      ...formData,
      patient: {
        name: user.firstName + ' ' + user.lastName,
        phone: { value: user.phone },
        cpf: { value: user.cpfCnpj },
        typeOfApplicant: 'Patient',
      },
    });
    setPatientSearchResults([]);
    setPatientSearchTerm('');
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
        return 'Aguardando Revisão';
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
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Solicitações
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                disabled={!selectedTenantKey}
              >
                Nova Solicitação
              </Button>
            </Stack>
          </Stack>

          {/* Filtros */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Filtros
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Buscar Usuário"
                    placeholder="Digite 3+ caracteres para buscar"
                    value={filters.userTerms}
                    onChange={(e) => handleFilterChange('userTerms', e.target.value)}
                    helperText={
                      filters.userTerms && filters.userTerms.length < 3 
                        ? 'Digite pelo menos 3 caracteres para buscar' 
                        : 'Pesquise por nome, CPF (apenas números) ou email'
                    }
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="AwaitingReview">Aguardando Revisão</MenuItem>
                      <MenuItem value="InProgress">Em Progresso</MenuItem>
                      <MenuItem value="Completed">Concluída</MenuItem>
                      <MenuItem value="Cancelled">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    label="Data Inicial"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: filters.endDate || undefined }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    label="Data Final"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: filters.startDate || undefined }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handleApplyFilters}
                      disabled={!!(filters.userTerms && filters.userTerms.length < 3)}
                      fullWidth
                    >
                      Aplicar Filtros
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                    >
                      Limpar
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

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
              Selecione um tenant para visualizar as solicitações.
            </Alert>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Alert severity="info">
              Nenhuma solicitação encontrada.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Tipo de Ocorrência</TableCell>
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
                          {getOccurrenceTypeLabel(request.aboutOccurrence.type)}
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
                            onClick={() => handleViewDetails(request.id)}
                            title="Ver detalhes"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {request.status === 'AwaitingReview' && (
                            <IconButton
                              color="secondary"
                              size="small"
                              onClick={() => handleEdit(request)}
                              title="Editar solicitação"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
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

      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Detalhes da Solicitação</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedRequest ? (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedRequest.status)}
                    color={getStatusColor(selectedRequest.status)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Ocorrência
                  </Typography>
                  <Typography variant="body1">
                    {getOccurrenceTypeLabel(selectedRequest.aboutOccurrence.type)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data de Criação
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedRequest.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>

                {selectedRequest.aboutOccurrence.description && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descrição da Ocorrência
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.aboutOccurrence.description}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Local de Coleta
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.pickup.address}
                  </Typography>
                  {selectedRequest.pickup.complement && (
                    <Typography variant="body2" color="text.secondary">
                      Complemento: {selectedRequest.pickup.complement}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Coordenadas: {selectedRequest.pickup.coordinate.latitude.toFixed(6)}, {selectedRequest.pickup.coordinate.longitude.toFixed(6)}
                  </Typography>
                </Grid>

                {selectedRequest.patient && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Divider />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Informações do Paciente
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nome
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.patient.name}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Telefone
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.patient.phone ? formatPhone(selectedRequest.patient.phone) : 'Não informado'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        CPF
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.patient.cpf ? formatCpfCnpj(selectedRequest.patient.cpf) : 'Não informado'}
                      </Typography>
                    </Grid>
                  </>
                )}

                {selectedRequest.scheduling && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Divider />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Agendamento
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Data e Hora
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedRequest.scheduling.dateTime).toLocaleString('pt-BR')}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Destino
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.scheduling.destination.value}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Última Atualização
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedRequest.updatedAt).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Nova Solicitação</Typography>
            <IconButton onClick={handleCloseCreateDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Informações da Ocorrência
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Ocorrência</InputLabel>
                  <Select
                    value={formData.aboutOccurrence?.type || 'Urgent'}
                    label="Tipo de Ocorrência"
                    onChange={(e) => handleFormChange('aboutOccurrence.type', e.target.value)}
                  >
                    <MenuItem value="Urgent">Urgente</MenuItem>
                    <MenuItem value="Emergency">Emergência</MenuItem>
                    <MenuItem value="Elective">Eletiva</MenuItem>
                    <MenuItem value="Social">Social</MenuItem>
                    <MenuItem value="Other">Outro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descrição da Ocorrência"
                  multiline
                  rows={3}
                  value={formData.aboutOccurrence?.description || ''}
                  onChange={(e) => handleFormChange('aboutOccurrence.description', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
                  Local de Coleta
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <AddressAutocomplete
                    value={formData.pickup?.address || ''}
                    onChange={(value) => handleFormChange('pickup.address', value)}
                    onPlaceSelect={(place) => {
                      const lat = place.geometry?.location?.lat();
                      const lng = place.geometry?.location?.lng();
                      if (lat && lng) {
                        handleFormChange('pickup.address', place.formatted_address || formData.pickup?.address || '');
                        handleFormChange('pickup.latitude', lat.toString());
                        handleFormChange('pickup.longitude', lng.toString());
                        setOpenMapPicker(true);
                      }
                    }}
                    label="Endereço"
                    required
                  />
                </APIProvider>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={formData.pickup?.complement || ''}
                  onChange={(e) => handleFormChange('pickup.complement', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={formData.pickup?.coordinate.latitude || 0}
                  onChange={(e) => handleFormChange('pickup.latitude', e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={formData.pickup?.coordinate.longitude || 0}
                  onChange={(e) => handleFormChange('pickup.longitude', e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
                  Informações do Paciente
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  freeSolo
                  options={patientSearchResults}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return `${option.firstName} ${option.lastName} (${option.email})`;
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ cursor: 'pointer' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {option.firstName} {option.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email} • {option.cpfCnpj ? formatCpfCnpj(option.cpfCnpj) : 'Não informado'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Nome do Paciente"
                      placeholder="Digite 3+ caracteres para buscar..."
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {searchingPatients && <CircularProgress size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  onInputChange={(_, value) => {
                    handlePatientSearch(value);
                    handleFormChange('patient.name', value);
                  }}
                  onChange={(_, value) => {
                    if (value && typeof value !== 'string') {
                      handleSelectPatient(value);
                    }
                  }}
                  noOptionsText={
                    patientSearchTerm.length < 3 
                      ? 'Digite pelo menos 3 caracteres' 
                      : 'Nenhum paciente encontrado'
                  }
                  loading={searchingPatients}
                  loadingText="Buscando pacientes..."
                  value={formData.patient?.name || ''}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.patient?.phone?.value || ''}
                  onChange={(e) => handleFormChange('patient.phone', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  options={patientSearchResults}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.cpfCnpj ? formatCpfCnpj(option.cpfCnpj) : '';
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ cursor: 'pointer' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {option.cpfCnpj ? formatCpfCnpj(option.cpfCnpj) : 'Não informado'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.firstName} {option.lastName} • {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="CPF"
                      placeholder="Digite 3+ caracteres para buscar..."
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {searchingPatients && <CircularProgress size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  onInputChange={(_, value) => {
                    handlePatientSearch(value);
                    handleFormChange('patient.cpf', value);
                  }}
                  onChange={(_, value) => {
                    if (value && typeof value !== 'string') {
                      handleSelectPatient(value);
                    }
                  }}
                  noOptionsText={
                    patientSearchTerm.length < 3 
                      ? 'Digite pelo menos 3 caracteres' 
                      : 'Nenhum paciente encontrado'
                  }
                  loading={searchingPatients}
                  loadingText="Buscando pacientes..."
                  value={formData.patient?.cpf?.value || ''}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loadingCreate || !formData.pickup?.address || !formData.aboutOccurrence?.type}
            startIcon={loadingCreate ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Criar Solicitação
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Solicitação</Typography>
            <IconButton onClick={handleCloseEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Informações da Ocorrência
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Ocorrência</InputLabel>
                  <Select
                    value={formData.aboutOccurrence?.type || 'Urgent'}
                    label="Tipo de Ocorrência"
                    onChange={(e) => handleFormChange('aboutOccurrence.type', e.target.value)}
                  >
                    <MenuItem value="Urgent">Urgente</MenuItem>
                    <MenuItem value="Emergency">Emergência</MenuItem>
                    <MenuItem value="Elective">Eletiva</MenuItem>
                    <MenuItem value="Social">Social</MenuItem>
                    <MenuItem value="Other">Outro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descrição da Ocorrência"
                  multiline
                  rows={3}
                  value={formData.aboutOccurrence?.description || ''}
                  onChange={(e) => handleFormChange('aboutOccurrence.description', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
                  Local de Coleta
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <AddressAutocomplete
                    value={formData.pickup?.address || ''}
                    onChange={(value) => handleFormChange('pickup.address', value)}
                    onPlaceSelect={(place) => {
                      const lat = place.geometry?.location?.lat();
                      const lng = place.geometry?.location?.lng();
                      if (lat && lng) {
                        handleFormChange('pickup.address', place.formatted_address || formData.pickup?.address || '');
                        handleFormChange('pickup.latitude', lat.toString());
                        handleFormChange('pickup.longitude', lng.toString());
                        setOpenMapPicker(true);
                      }
                    }}
                    label="Endereço"
                    required
                  />
                </APIProvider>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={formData.pickup?.complement || ''}
                  onChange={(e) => handleFormChange('pickup.complement', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={formData.pickup?.coordinate.latitude || 0}
                  onChange={(e) => handleFormChange('pickup.latitude', e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={formData.pickup?.coordinate.longitude || 0}
                  onChange={(e) => handleFormChange('pickup.longitude', e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
                  Informações do Paciente
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nome do Paciente"
                  value={formData.patient?.name || ''}
                  onChange={(e) => handleFormChange('patient.name', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.patient?.phone?.value || ''}
                  onChange={(e) => handleFormChange('patient.phone', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.patient?.cpf?.value || ''}
                  onChange={(e) => handleFormChange('patient.cpf', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={loadingUpdate || !formData.pickup?.address || !formData.aboutOccurrence?.type}
            startIcon={loadingUpdate ? <CircularProgress size={20} /> : <EditIcon />}
          >
            Atualizar Solicitação
          </Button>
        </DialogActions>
      </Dialog>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <MapPicker
          open={openMapPicker}
          onClose={() => setOpenMapPicker(false)}
          onConfirm={(lat, lng) => {
            handleFormChange('pickup.latitude', lat.toString());
            handleFormChange('pickup.longitude', lng.toString());
          }}
          initialLat={formData.pickup?.coordinate.latitude || 0}
          initialLng={formData.pickup?.coordinate.longitude || 0}
          address={formData.pickup?.address || ''}
        />
      </APIProvider>
    </Box>
  );
};

export default Requests;
