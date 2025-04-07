import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import toast from 'react-hot-toast';
import Header from '../common/Header';
import { Project } from '../../types';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch project details');
    }
  };

  const handleEditLocation = () => {
    if (!project) return;
    setEditingLocation(project.location || '');
    setNewLocation(project.location || '');
  };

  const handleSaveLocation = async () => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: {
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

  if (!project) {
    return (
      <Container>
        <Header />
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      <Box component="main">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" gutterBottom>Project Details</Typography>
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Team ID</Typography>
                <Typography>{project.teamId}</Typography>
              </Grid>
              
              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Title</Typography>
                <Typography>{project.title}</Typography>
              </Grid>

              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Branch</Typography>
                <Typography>{project.branch || 'Not specified'}</Typography>
              </Grid>

              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Institution</Typography>
                <Typography>{project.institution || 'Not specified'}</Typography>
              </Grid>

              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Semester</Typography>
                <Typography>{project.semester || 'Not specified'}</Typography>
              </Grid>

              <Grid item component="div" xs={12}>
                <Typography variant="subtitle1">Team Members</Typography>
                <Typography>{project.teamMembers?.join(', ') || 'No members'}</Typography>
              </Grid>

              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Mentor</Typography>
                <Typography>{project.mentorName || 'Not specified'}</Typography>
              </Grid>

              <Grid item component="div" xs={12} md={6}>
                <Typography variant="subtitle1">Contact</Typography>
                <Typography>{project.contactNumber || 'Not specified'}</Typography>
              </Grid>

              <Grid item component="div" xs={12}>
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
                <Grid item component="div" xs={12}>
                  <Typography variant="subtitle1">Description</Typography>
                  <Typography>{project.description}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
