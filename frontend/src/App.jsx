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
    { field: 'similarity', headerName: 'Cosine Similarity', type: 'number', flex: 1, description: 'Similarity between embeddings (-1 to 1)' },
    { field: 'identity', headerName: 'Sequence Identity (%)', type: 'number', flex: 1, description: 'Percentage of shared amino acids between sequences' },
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
      const res = await fetch('https://app-510117665463.us-east1.run.app/recommend-sequence', {
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
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>ESMFinder</Typography>
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
        position: 'relative',
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #0d1117, #1f1f1f)'
          : 'linear-gradient(135deg, #e3f2fd, #ffffff)',
        py: 4,
      }}>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <CircularProgress size={60} thickness={5} color="primary" />
          </Box>
        )}
        <Container maxWidth="lg" sx={{ mb: 2, px: 2 }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              What is ESMFinder?
            </Typography>
            <Typography variant="body1" paragraph>
              ESMFinder is a protein similarity search tool that leverages embeddings from the ESMC 300M model. 
              It allows users to input a protein sequence and retrieve the top-k most similar proteins from the UniProtKB/Swiss-Prot database, 
              based on the cosine similarity between their ESM embeddings.
            </Typography>
            <Typography variant="body1" paragraph>
              To use ESMFinder, paste your protein sequence into the input box, optionally adjust the number of top results, 
              and click "Search". The results will include UniProt IDs, cosine similarity scores, sequence identity percentages, 
              and links to associated Pfam domains.
            </Typography>
            <Typography variant="body1" paragraph>
              This project was built with ESM and in accordance with the <a href='https://www.evolutionaryscale.ai/policies/cambrian-open-license-agreement'>Cambrian Open License Agreement (COLA)</a>.
            </Typography>
          </Paper>
          <Paper sx={{ p: 4, mb: 3, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Enter Protein Sequence"
                placeholder="MKTLLVLL..."
                multiline
                fullWidth
                minRows={4}
                value={sequence}
                onChange={e => setSequence(e.target.value)}
                error={!!error}
                helperText={error}
              />
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button onClick={() => setSequence('MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN')} variant='contained'>
                  Load Example
                </Button>
              </Box>
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
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
            <>
              <Box sx={{ mb: 2, textAlign: 'right' }}>
                <Button variant="contained" onClick={() => {
                  const csv = rows.map(r => {
                    const pfam = r.pfam.join(';');
                    return `${r.id},${r.similarity},${r.identity},${pfam}`;
                  });
                  const header = "UniProt ID,Cosine Similarity,Sequence Identity (%),Pfam Domains";
                  const blob = new Blob([header + "\n" + csv.join("\n")], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'esmfinder_results.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  Download Results
                </Button>
              </Box>
              <Paper sx={{ p: 2, borderRadius: 2, mb: 4, height: 400, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                />
              </Paper>
            </>
          )}
        </Container>
      </Box>
      <footer style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>
        <Box display="flex" justifyContent="center" gap={2}>
          <Link href="https://github.com/jburke11/ESMC-Finder" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" width="24" height="24" />
          </Link>
          <Link href="https://www.linkedin.com/in/josephburke11/" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" width="24" height="24" />
          </Link>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Created by Joseph Burke
          </Typography>
      </footer>
    </ThemeProvider>
  )
}