import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationMenu from '../../components/NavigationMenu';
import { vehiclesService, platformTenantsService, tenantUsersService, driversService, basesService } from '../../services';
import { useTenant } from '../../contexts/TenantContext';
import type { AuthSession } from '../../types';

interface DashboardStats {
    vehicles: number;
    tenants: number;
    users: number;
    drivers: number;
    bases: number;
}

const Home = () => {
    const navigate = useNavigate();
    const { selectedTenantKey } = useTenant();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({ vehicles: 0, tenants: 0, users: 0, drivers: 0, bases: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const authSessionStr = localStorage.getItem('authSession');
        if (!authSessionStr) {
            navigate('/login');
        } else {
            const authSession: AuthSession = JSON.parse(authSessionStr);
            setIsAuthenticated(true);
            setIsPlatformAdmin(authSession.isPlatformAdmin);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            setError(null);

            try {
                const authSessionStr = localStorage.getItem('authSession');
                if (!authSessionStr) return;

                const authSession: AuthSession = JSON.parse(authSessionStr);
                const newStats: DashboardStats = { vehicles: 0, tenants: 0, users: 0, drivers: 0, bases: 0 };

                // Fetch vehicles
                if (selectedTenantKey) {
                    try {
                        const vehiclesData = await vehiclesService.list(1, 1000);
                        newStats.vehicles = vehiclesData.items.length;
                    } catch (err) {
                        console.error('Error fetching vehicles:', err);
                    }

                    // Fetch users
                    try {
                        const usersData = await tenantUsersService.list(1, 1000);
                        newStats.users = usersData.items.length;
                    } catch (err) {
                        console.error('Error fetching users:', err);
                    }

                    // Fetch drivers
                    try {
                        const driversData = await driversService.list(1, 1000);
                        newStats.drivers = driversData.items.length;
                    } catch (err) {
                        console.error('Error fetching drivers:', err);
                    }

                    // Fetch bases
                    try {
                        const basesData = await basesService.list(1, 1000);
                        newStats.bases = basesData.items.length;
                    } catch (err) {
                        console.error('Error fetching bases:', err);
                    }
                }

                // Fetch tenants (only for platform admin)
                if (authSession.isPlatformAdmin) {
                    try {
                        const tenantsData = await platformTenantsService.list(1, 1000);
                        newStats.tenants = tenantsData.items.length;
                    } catch (err) {
                        console.error('Error fetching tenants:', err);
                    }
                }

                setStats(newStats);
            } catch (err: any) {
                console.error('Error fetching dashboard stats:', err);
                setError('Erro ao carregar estatísticas do dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, selectedTenantKey]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                pt: 12,
                pb: 4,
                px: 2,
            }}
        >
            <NavigationMenu />
            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 1,
                            fontWeight: 600,
                            color: 'primary.main',
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                    >
                        Visão geral do sistema
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {!selectedTenantKey && !isPlatformAdmin ? (
                    <Alert severity="warning">
                        Selecione um tenant para visualizar as estatísticas.
                    </Alert>
                ) : loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {isPlatformAdmin && (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                            <Box>
                                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                    {stats.tenants}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Tenants
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <DirectionsCarIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {stats.vehicles}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Veículos
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PeopleIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {stats.users}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Usuários
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocalShippingIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {stats.drivers}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Motoristas
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocationOnIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {stats.bases}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Bases
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default Home