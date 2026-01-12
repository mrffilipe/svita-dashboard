import { Box, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import NavigationMenu from '../../components/NavigationMenu';

const Home = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authSession = localStorage.getItem('authSession');
        if (!authSession) {
            navigate('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [navigate]);

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
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4, md: 5 },
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: 'primary.main',
                        }}
                    >
                        SVita Dashboard
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Sistema de Gestão de Saúde
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ mb: 4 }}
                    >
                        Bem-vindo ao dashboard! Use o menu lateral para navegar.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

export default Home