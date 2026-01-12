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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigationMenu from '../../components/NavigationMenu';
import { platformTenantsService } from '../../services';
import type { TenantListDto, RegisterTenantRequest } from '../../types';

const PlatformTenants = () => {
  const [tenants, setTenants] = useState<TenantListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterTenantRequest>({
    key: '',
    name: '',
    city: '',
    state: '',
    defaultAdminMember: { email: '' },
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const result = await platformTenantsService.list(page + 1, pageSize);
      setTenants(result.items);
      setTotalItems(result.totalItems);
    } catch (err: any) {
      setError('Erro ao carregar tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page, pageSize]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'adminEmail') {
      setFormData({
        ...formData,
        defaultAdminMember: { email: value },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await platformTenantsService.create(formData);
      setSuccess('Tenant criado com sucesso!');
      setOpenDialog(false);
      setFormData({
        key: '',
        name: '',
        city: '',
        state: '',
        defaultAdminMember: { email: '' },
      });
      fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar tenant');
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
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Gerenciar Tenants
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Novo Tenant
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Chave</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Cidade</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Criado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.key}</TableCell>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>{tenant.city}</TableCell>
                        <TableCell>{tenant.state}</TableCell>
                        <TableCell>
                          {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
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
          <DialogTitle>Criar Novo Tenant</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="Chave"
                name="key"
                value={formData.key}
                onChange={handleChange}
                helperText="Identificador único do tenant"
              />
              <TextField
                required
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleChange}
                inputProps={{ maxLength: 2 }}
                helperText="Sigla do estado (ex: SP, RJ)"
              />
              <TextField
                required
                fullWidth
                label="E-mail do Administrador"
                name="adminEmail"
                type="email"
                value={formData.defaultAdminMember.email}
                onChange={handleChange}
                helperText="E-mail do primeiro administrador do tenant"
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
    </Box>
  );
};

export default PlatformTenants;
