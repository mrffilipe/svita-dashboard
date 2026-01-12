import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

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

    const handleLogout = () => {
        localStorage.removeItem('authSession');
        localStorage.removeItem('idToken');
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                py: 4,
                px: 2,
            }}
        >
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
                        Bem-vindo ao dashboard! Você está autenticado.
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                        >
                            Dashboard
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            onClick={handleLogout}
                        >
                            Sair
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default Home