import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import NavigationMenu from '../../components/NavigationMenu';
import { platformTenantsService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import type { MyTenantDto } from '../../types';
import { useNavigate } from 'react-router';
import { translateTenantMemberRole, translateTenantMemberStatus } from '../../utils';

const MyTenants = () => {
  const navigate = useNavigate();
  const { setSelectedTenantKey } = useTenant();
  const [tenants, setTenants] = useState<MyTenantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTenants = async () => {
      setLoading(true);
      try {
        const result = await platformTenantsService.getMyTenants();
        setTenants(result);
      } catch (err: any) {
        setError('Erro ao carregar seus tenants');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTenants();
  }, []);

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
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            Meus Tenants
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : tenants.length === 0 ? (
            <Alert severity="info">
              Você ainda não está associado a nenhum tenant.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {tenants.map((tenant) => (
                <Card key={tenant.tenantId} elevation={1}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {tenant.tenantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Chave: {tenant.tenantKey}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={translateTenantMemberRole(tenant.role)}
                          color={getRoleColor(tenant.role)}
                          size="small"
                        />
                        <Chip
                          label={translateTenantMemberStatus(tenant.status)}
                          color={getStatusColor(tenant.status)}
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedTenantKey(tenant.tenantKey);
                        navigate('/tenant-members');
                      }}
                    >
                      Ver Membros
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MyTenants;
