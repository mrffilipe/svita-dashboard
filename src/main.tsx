import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import theme from './theme'
import router from './routes'
import { TenantProvider } from './contexts/TenantContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <TenantProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </TenantProvider>
    </ThemeProvider>
  </StrictMode>,
)
