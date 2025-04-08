import { useState, useEffect, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import toast from 'react-hot-toast';
import Header from '../common/Header';
import { useAuth } from '../../contexts/AuthContext';

// Define Project interface if not already defined in types
interface Project {
  _id: string;
  teamId: string;
  title: string;
  description?: string;
  branch?: string;
  institution?: string;
  semester?: string;
  teamMembers?: string[];
  mentorName?: string;
  contactNumber?: string;
  location?: string;
  presentationType?: string;
}

// Memoize the Header component to prevent unnecessary re-renders
const MemoizedHeader = memo(Header);

function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  
  // Memoize the fetchProject function to prevent unnecessary re-renders
  const fetchProject = useCallback(async () => {
    if (!token || !id) return;
    
    try {
      console.log(`Fetching project with ID: ${id}`);
      const response = await fetch(`http://localhost:9000/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseData = await response.text();
        console.error('Non-JSON response:', responseData);
        throw new Error('Received non-JSON response');
      }
      
      const data = await response.json();
      console.log('Project data:', data);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to fetch project details');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  // Only fetch when component mounts or when token/id changes
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleEditLocation = () => {
    if (!project) return;
    setEditingLocation(project.location || '');
    setNewLocation(project.location || '');
  };

  const handleSaveLocation = async () => {
    if (!project || !token) return;

    try {
      const response = await fetch(`http://localhost:9000/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: newLocation }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setEditingLocation(null);
      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update location');
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setNewLocation('');
  };

  return (
    <>
      <MemoizedHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
            <Typography>Loading project details...</Typography>
          </Box>
        ) : project ? (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h4" gutterBottom>Project Details</Typography>
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Team ID</Typography>
                  <Typography>{project.teamId}</Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Title</Typography>
                  <Typography>{project.title}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Branch</Typography>
                  <Typography>{project.branch || 'Not specified'}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Institution</Typography>
                  <Typography>{project.institution || 'Not specified'}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Semester</Typography>
                  <Typography>{project.semester || 'Not specified'}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1">Team Members</Typography>
                  <Typography>{project.teamMembers?.join(', ') || 'No members'}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Mentor</Typography>
                  <Typography>{project.mentorName || 'Not specified'}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1">Contact</Typography>
                  <Typography>{project.contactNumber || 'Not specified'}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1">Location</Typography>
                  {editingLocation !== null ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                      />
                      <Button onClick={handleSaveLocation} variant="contained" size="small">
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} size="small">
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography>{project.location || 'Not specified'}</Typography>
                      <Button onClick={handleEditLocation} size="small">
                        Edit
                      </Button>
                    </Box>
                  )}
                </Grid>

                {project.description && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1">Description</Typography>
                    <Typography>{project.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography>Project not found</Typography>
          </Paper>
        )}
      </Container>
    </>
  );
}

export default memo(ProjectDetails);
