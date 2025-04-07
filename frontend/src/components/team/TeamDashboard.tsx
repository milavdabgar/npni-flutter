import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import Header from '../common/Header';
import { Project } from '../../types';

export default function TeamDashboard() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await fetch('http://localhost:9000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setProject(data[0]); // Team users only get their own project
        } else {
          setError('No project found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, []);

  const handleDownloadCertificate = (type: 'participation' | 'winner') => {
    // TODO: Implement certificate download
    console.log(`Downloading ${type} certificate...`);
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Loading project details...</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography color="error">{error || 'Project not found'}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  const hasWon = project.evaluations.some(e => e.marks >= 80); // Example threshold

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Project Details */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Project Details
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {project.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Team Members:
                  </Typography>
                  <List dense>
                    {project.teamMembers.map((member, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={member} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Box>

        {/* Location Information */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Stall Location
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {project.location || 'Not Assigned Yet'}
            </Typography>
          </Paper>
        </Box>

        {/* Evaluation Status */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Evaluation Status
            </Typography>
            <List>
              {project.evaluations.map((evaluation, index) => (
                <div key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`Round ${evaluation.round}`}
                      secondary={evaluation.isLocked ? 'Evaluated' : 'Pending'}
                    />
                    {evaluation.isLocked && (
                      <Typography variant="h6">
                        {evaluation.marks}/100
                      </Typography>
                    )}
                  </ListItem>
                  {index < project.evaluations.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Certificates */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Certificates
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleDownloadCertificate('participation')}
              >
                Download Participation Certificate
              </Button>
              {hasWon && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDownloadCertificate('winner')}
                >
                  Download Winner Certificate
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
    </Box>
  );
}
