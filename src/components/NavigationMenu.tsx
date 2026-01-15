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
  ];

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SVita Dashboard
        </Typography>
        <Typography variant="caption">
          Sistema de Gestão de Saúde
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.filter(item => item.show).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
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
          <IconButton
            color="primary"
            aria-label="open menu"
            onClick={() => setDrawerOpen(true)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
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
