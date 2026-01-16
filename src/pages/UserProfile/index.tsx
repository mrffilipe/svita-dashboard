import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NavigationMenu from '../../components/NavigationMenu';
import { userService } from '../../services';
import type { UserDto } from '../../types';
import { formatCpfCnpj, formatEmail, formatPhone } from '../../utils';

const UserProfile = () => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const authSessionStr = localStorage.getItem('authSession');
        if (!authSessionStr) {
          setError('Sessão não encontrada');
          return;
        }

        const authSession = JSON.parse(authSessionStr);
        if (!authSession.userId) {
          setError('ID do usuário não encontrado');
          return;
        }

        const userData = await userService.getById(authSession.userId);
        setUser(userData);
      } catch (err: any) {
        setError('Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 12, pb: 4, px: 2 }}>
      <NavigationMenu />
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Meu Perfil
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : user ? (
            <>
              <Box sx={{ mb: 3 }}>
                {user.isPlatformAdmin && (
                  <Chip
                    icon={<AdminPanelSettingsIcon />}
                    label="Administrador da Plataforma"
                    color="error"
                    sx={{ mb: 2 }}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={user.firstName}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    value={user.lastName}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formatEmail(user.email)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={formatPhone(user.phone)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="CPF/CNPJ"
                    value={formatCpfCnpj(user.cpfCnpj)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Criado em
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Atualizado em
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.updatedAt).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
              </Grid>
            </>
          ) : (
            <Alert severity="warning">Nenhum dado de usuário encontrado</Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile;
