import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmergencyIcon from '@mui/icons-material/Emergency';
import TenantSelector from './TenantSelector';
import type { AuthSession } from '../types';

const NavigationMenu = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    const authSessionStr = localStorage.getItem('authSession');
    if (authSessionStr) {
      const authSession: AuthSession = JSON.parse(authSessionStr);
      setIsPlatformAdmin(authSession.isPlatformAdmin);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authSession');
    localStorage.removeItem('idToken');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/', show: true },
    { 
      text: 'Meu Perfil', 
      icon: <PersonIcon />, 
      path: '/profile', 
      show: true 
    },
    { 
      text: 'Meus Tenants', 
      icon: <BusinessIcon />, 
      path: '/my-tenants', 
      show: !isPlatformAdmin 
    },
    { 
      text: 'Gerenciar Tenants', 
      icon: <AdminPanelSettingsIcon />, 
      path: '/platform-tenants', 
      show: isPlatformAdmin 
    },
    { 
      text: 'Membros do Tenant', 
      icon: <PeopleIcon />, 
      path: '/tenant-members', 
      show: true 
    },
    { 
      text: 'Bases', 
      icon: <LocationOnIcon />, 
      path: '/bases', 
      show: true 
    },
    { 
      text: 'Veículos', 
      icon: <DirectionsCarIcon />, 
      path: '/vehicles', 
      show: true 
    },
    { 
      text: 'Motoristas', 
      icon: <LocalShippingIcon />, 
      path: '/drivers', 
      show: true 
    },
    { 
      text: 'Minhas Solicitações', 
      icon: <AssignmentIcon />, 
      path: '/requests', 
      show: true 
    },
    { 
      text: 'Ocorrências', 
      icon: <EmergencyIcon />, 
      path: '/occurrences', 
      show: true 
    },
  ];

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <img src="/logo.png" alt="SVita Logo" style={{ width: 48, height: 48 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            SVita
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
            Sistema de Saúde
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.filter(item => item.show).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'rgba(0, 191, 165, 0.08)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: 'primary.main',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />
      <List sx={{ px: 1.5, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'rgba(255, 82, 82, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: 'error.main',
              minWidth: 40,
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Sair"
              primaryTypographyProps={{
                fontSize: '0.9375rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="primary"
              aria-label="open menu"
              onClick={() => setDrawerOpen(true)}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <img src="/logo.png" alt="SVita Logo" style={{ width: 48, height: 48 }} />
          </Box>
          <TenantSelector />
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavigationMenu;
