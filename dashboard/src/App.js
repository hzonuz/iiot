import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Login from './Login';
import LineChart from './LineChart';
import RealTimeChart from './RealTimeChart';


function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [mode, setMode] = useState('realtime');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) setMode(newMode);
    };

    return (
        <div className="App">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Data Visualization
                    </Typography>
                    {token && (
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 3 }}>
                {token ? <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <ToggleButtonGroup
                                value={mode}
                                exclusive
                                onChange={handleModeChange}
                                aria-label="data mode"
                            >
                                <ToggleButton value="realtime" aria-label="real-time">
                                    Real-Time Data
                                </ToggleButton>
                                <ToggleButton value="passive" aria-label="passive">
                                    Passive Data
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        {mode === 'realtime' ? <RealTimeChart /> : <LineChart />}
                    </> : <Login setToken={setToken} />}
            </Container>
        </div>
    );
}

export default App;