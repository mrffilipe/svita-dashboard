import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import NavigationMenu from '../../components/NavigationMenu';
import { notificationService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import type { NotificationType } from '../../types';

const Comunicado = () => {
  const { selectedTenantKey } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'Comunicado' as NotificationType,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeChange = (type: NotificationType) => {
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
      setError('Selecione um tenant primeiro');
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await notificationService.sendNotification({
        tenantKey: selectedTenantKey,
        title: formData.title,
        body: formData.body,
        type: formData.type,
      });
      setSuccess('Comunicado enviado com sucesso!');
      setFormData({
        title: '',
        body: '',
        type: 'Comunicado',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar comunicado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 12, pb: 4, px: 2 }}>
      <NavigationMenu />
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CampaignIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Enviar Comunicado
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Envie notificações para todos os usuários do tenant selecionado.
          </Typography>

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
              Selecione um tenant para enviar comunicados.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Notificação</InputLabel>
                  <Select
                    value={formData.type}
                    label="Tipo de Notificação"
                    onChange={(e) => handleTypeChange(e.target.value as NotificationType)}
                  >
                    <MenuItem value="Comunicado">Comunicado</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  required
                  fullWidth
                  label="Título"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Digite o título do comunicado"
                  inputProps={{ maxLength: 100 }}
                  helperText={`${formData.title.length}/100 caracteres`}
                />

                <TextField
                  required
                  fullWidth
                  label="Mensagem"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  placeholder="Digite a mensagem do comunicado"
                  inputProps={{ maxLength: 500 }}
                  helperText={`${formData.body.length}/500 caracteres`}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setFormData({
                        title: '',
                        body: '',
                        type: 'Comunicado',
                      });
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={loading}
                  >
                    Limpar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    disabled={loading || !formData.title.trim() || !formData.body.trim()}
                  >
                    {loading ? 'Enviando...' : 'Enviar Comunicado'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Comunicado;
