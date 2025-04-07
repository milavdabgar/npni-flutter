import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs
} from '@mui/material';
import Header from '../common/Header';
import { Project } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [projects] = useState<Project[]>([]);

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:9000/api/projects/import', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Import failed');
        }

        const result = await response.json();
        toast.success(result.message);
        // Refresh the projects list
        // TODO: Add fetchProjects() function to refresh the list
      } catch (error: any) {
        console.error('Error importing CSV:', error);
        toast.error(error.message || 'Failed to import CSV file');
      }
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Projects" />
            <Tab label="Jury Management" />
            <Tab label="Results" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              component="label"
            >
              Import CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleImportCSV}
              />
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team ID</TableCell>
                  <TableCell>Project Title</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.teamId}>
                    <TableCell>{project.teamId}</TableCell>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.branch}</TableCell>
                    <TableCell>{project.location || 'Not Assigned'}</TableCell>
                    <TableCell>
                      <Button size="small">Assign Location</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography>Jury Management (Coming Soon)</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography>Results (Coming Soon)</Typography>
        </TabPanel>
      </Paper>
    </Container>
    </Box>
  );
}
