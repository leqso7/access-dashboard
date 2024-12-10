import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessRequest } from './components/AccessRequest';
import { StudentManager } from './components/StudentManager/StudentManager';
import './components/AccessRequest.css';

const theme = createTheme({
  palette: {
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/request" element={<AccessRequest />} />
          <Route path="/manager" element={<StudentManager />} />
          <Route path="/" element={<Navigate to="/request" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
