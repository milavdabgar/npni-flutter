import { useState, useEffect } from 'react';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingLocation, setEditingLocation] = useState<{id: string, location: string} | null>(null);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:9000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error(error.message || 'Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

        await response.json();
        toast.success('Projects imported successfully');
        fetchProjects(); // Refresh the projects list
      } catch (error: any) {
        console.error('Import error:', error);
        toast.error(error.message || 'Failed to import projects');
      }
    }
  };

  const handleLocationUpdate = async (projectId: string, location: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:9000/api/projects/${projectId}/location`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location })
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      await response.json();
      toast.success('Location updated successfully');
      setEditingLocation(null);
      fetchProjects(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast.error(error.message || 'Failed to update location');
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
                  <TableCell>Title</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Team Members</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>{project.teamId}</TableCell>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.branch}</TableCell>
                    <TableCell>
                      {editingLocation?.id === project._id ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <input
                            type="text"
                            value={editingLocation?.location || ''}
                            onChange={(e) => setEditingLocation({ id: project._id, location: e.target.value })}
                            style={{ padding: '4px', width: '100px' }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => editingLocation && handleLocationUpdate(project._id, editingLocation.location)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setEditingLocation(null)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {project.location || 'Not assigned'}
                          <Button
                            size="small"
                            onClick={() => setEditingLocation({ id: project._id, location: project.location || '' })}
                          >
                            Edit
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{project.teamMembers?.join(', ') || ''}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => window.location.href = `/project/${project._id}`}
                      >
                        View Details
                      </Button>
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
