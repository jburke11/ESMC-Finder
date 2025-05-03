import React, { useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Link,
  CircularProgress,
  Switch,
  FormControlLabel,
  CssBaseline,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SearchIcon from '@mui/icons-material/Search';

export default function App() {
  const [sequence, setSequence] = useState('')
  const [topK, setTopK] = useState(5)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const theme = React.useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: darkMode ? '#90caf9' : '#1976d2' },
        background: { default: darkMode ? '#121212' : '#f0f2f5' },
        text: {
          primary: darkMode ? '#ffffff' : '#000000',
          secondary: darkMode ? '#aaaaaa' : '#666666',
        },
      },
      typography: {
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiDataGrid: {
          styleOverrides: {
            root: { border: 'none', borderRadius: '8px' },
            columnHeaders: {
              backgroundColor: darkMode ? '#333333' : '#1976d2',
              color: '#ffffff',
              fontSize: '1rem',
            },
            virtualScroller: {
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            },
            row: {
              '&:hover': {
                backgroundColor: darkMode
                  ? 'rgba(144,202,249,0.1)'
                  : 'rgba(25,118,210,0.1)',
              },
            },
            columnHeaderTitle: {
              color: darkMode ? 'white' : 'black',
              fontWeight: '600'
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
      },
    }), [darkMode]
  )

  const columns = [
    { field: 'id', headerName: 'UniProt ID', flex: 1, renderCell: params => (
        <Link href={params.row.id_link} target="_blank" rel="noopener">
          {params.value}
        </Link>
      )
    },
    { field: 'similarity', headerName: 'Cosine Similarity', type: 'number', flex: 1 },
    { field: 'identity', headerName: 'Sequence Identity (%)', type: 'number', flex: 1 },
    {
      field: 'pfam',
      headerName: 'Pfam Domains',
      flex: 2,
      renderCell: params => (
        <Box>
          {params.value.map((p, i) => (
            <Link key={i} href={params.row.pfam_links[i]} target="_blank" sx={{ mr: 1 }}>
              {p}
            </Link>
          ))}
        </Box>
      ),
    },
  ]

  const handleSubmit = async e => {
    e.preventDefault()
    if (!sequence.trim()) return setError('Please enter a protein sequence.')
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/recommend-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence, top_k: topK }),
      })
      const data = await res.json()
      if (res.ok) {
        setRows(data.results.map((r, idx) => ({ id: idx, ...r })))
      } else {
        setError(data.detail || 'Error fetching results')
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <AppBar position="sticky" elevation={1}>
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>Protein Similarity Search</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  color="default"
                />
              }
              label={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            />
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #0d1117, #1f1f1f)'
          : 'linear-gradient(135deg, #e3f2fd, #ffffff)',
        py: 4,
      }}>
        <Container maxWidth="lg" sx={{ mb: 2, px: 2 }}>
          <Paper sx={{ p: 4, mb: 3, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Protein Sequence"
                placeholder="MKTLLVLL..."
                multiline
                fullWidth
                minRows={4}
                value={sequence}
                onChange={e => setSequence(e.target.value)}
                error={!!error}
                helperText={error}
              />
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Top K"
                  type="number"
                  value={topK}
                  onChange={e => setTopK(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  startIcon={<SearchIcon />}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Box>
            </form>
          </Paper>
          {rows.length > 0 && (
            <Paper sx={{ p: 2, borderRadius: 2, mb: 4, height: 400, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}