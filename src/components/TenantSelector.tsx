import { useState, useEffect } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useTenant } from '../contexts/TenantContext';
import { platformTenantsService } from '../services';
import type { AuthSession, TenantListDto, MyTenantDto } from '../types';

interface TenantOption {
  key: string;
  name: string;
}

const TenantSelector = () => {
  const { selectedTenantKey, setSelectedTenantKey } = useTenant();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const authSessionStr = localStorage.getItem('authSession');
        if (!authSessionStr) return;

        const authSession: AuthSession = JSON.parse(authSessionStr);

        let tenantOptions: TenantOption[] = [];

        if (authSession.isPlatformAdmin) {
          const result = await platformTenantsService.list(1, 100);
          tenantOptions = result.items.map((t: TenantListDto) => ({
            key: t.key,
            name: t.name,
          }));
        } else {
          const result = await platformTenantsService.getMyTenants();
          tenantOptions = result.map((t: MyTenantDto) => ({
            key: t.tenantKey,
            name: t.tenantName,
          }));
        }

        setTenants(tenantOptions);

        if (!selectedTenantKey && tenantOptions.length > 0) {
          setSelectedTenantKey(tenantOptions[0].key);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedTenantKey(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Carregando...</Typography>
      </Box>
    );
  }

  if (tenants.length === 0) {
    return (
      <Box sx={{ px: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum tenant disponível
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
      <BusinessIcon sx={{ color: 'primary.main', fontSize: 18 }} />
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={selectedTenantKey || ''}
          onChange={handleChange}
          displayEmpty
          sx={{
            bgcolor: 'background.paper',
            height: 36,
            '& .MuiSelect-select': {
              py: 1,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        >
          {tenants.map((tenant) => (
            <MenuItem key={tenant.key} value={tenant.key} sx={{ py: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.4 }}>
                  {tenant.key}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                  {tenant.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TenantSelector;
