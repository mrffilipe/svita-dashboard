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
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigationMenu from '../../components/NavigationMenu';
import { tenantUsersService } from '../../services';
import { userService } from '../../services/userService';
import { useTenant } from '../../contexts/TenantContext';
import type { TenantUsersListDto, AddTenantUserRequest, TenantMemberRole } from '../../types';
import type { UserDto } from '../../types/user';
import { formatEmail, translateTenantMemberRole, translateTenantMemberStatus, formatCpfCnpj } from '../../utils';

const TenantMembers = () => {
  const { selectedTenantKey } = useTenant();
  
  const [members, setMembers] = useState<TenantUsersListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userSearchResults, setUserSearchResults] = useState<UserDto[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [formData, setFormData] = useState<AddTenantUserRequest>({
    email: '',
    role: 'User',
  });

  const fetchMembers = async () => {
    if (!selectedTenantKey) {
      setError('Selecione um tenant primeiro');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await tenantUsersService.list(page + 1, pageSize);
      setMembers(result.items);
      setTotalItems(result.totalItems);
    } catch (err: any) {
      setError('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, pageSize, selectedTenantKey]);

  const handleRoleChange = (role: TenantMemberRole) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleUserSearch = async (term: string) => {
    setUserSearchTerm(term);
    
    if (term.length < 3) {
      setUserSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const results = await userService.search(term);
      setUserSearchResults(results);
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      setUserSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSelectUser = (user: UserDto) => {
    setFormData({
      ...formData,
      email: user.email,
    });
    setUserSearchResults([]);
    setUserSearchTerm('');
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
      await tenantUsersService.create(formData);
      setSuccess('Membro adicionado com sucesso!');
      setOpenDialog(false);
      setFormData({
        email: '',
        role: 'User',
      });
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar membro');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TenantAdmin':
        return 'error';
      case 'User':
        return 'primary';
      case 'Driver':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Suspended':
        return 'error';
      case 'Invited':
        return 'warning';
      default:
        return 'default';
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
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Membros do Tenant
              </Typography>
              {selectedTenantKey && (
                <Typography variant="body2" color="text.secondary">
                  Tenant: {selectedTenantKey}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={!selectedTenantKey}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Adicionar Membro
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
              Selecione um tenant para visualizar seus membros.
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
                      <TableCell>Nome</TableCell>
                      <TableCell>E-mail</TableCell>
                      <TableCell>Função</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Criado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name || '-'}</TableCell>
                        <TableCell>{formatEmail(member.email)}</TableCell>
                        <TableCell>
                          <Chip
                            label={translateTenantMemberRole(member.role)}
                            color={getRoleColor(member.role)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={translateTenantMemberStatus(member.status)}
                            color={getStatusColor(member.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(member.createdAt).toLocaleDateString('pt-BR')}
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
          <DialogTitle>Adicionar Membro ao Tenant</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Autocomplete
                freeSolo
                options={userSearchResults}
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
                  <TextField
                    {...params}
                    required
                    fullWidth
                    label="E-mail"
                    placeholder="Digite 3+ caracteres para buscar usuário (nome, CPF ou email)"
                    helperText={userSearchTerm && userSearchTerm.length < 3 ? 'Digite pelo menos 3 caracteres para buscar' : 'Pesquise por nome, CPF (apenas números) ou email'}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchingUsers && <CircularProgress size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                onInputChange={(_, value) => handleUserSearch(value)}
                onChange={(_, value) => {
                  if (value && typeof value !== 'string') {
                    handleSelectUser(value);
                  } else if (typeof value === 'string') {
                    setFormData({ ...formData, email: value });
                  }
                }}
                value={formData.email || ''}
                noOptionsText={
                  userSearchTerm.length < 3 
                    ? 'Digite pelo menos 3 caracteres' 
                    : 'Nenhum usuário encontrado'
                }
                loading={searchingUsers}
                loadingText="Buscando usuários..."
              />
              <FormControl fullWidth required>
                <InputLabel>Função</InputLabel>
                <Select
                  value={formData.role}
                  label="Função"
                  onChange={(e) => handleRoleChange(e.target.value as TenantMemberRole)}
                >
                  <MenuItem value="User">Usuário</MenuItem>
                  <MenuItem value="Driver">Motorista</MenuItem>
                  <MenuItem value="TenantAdmin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Adicionar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TenantMembers;
