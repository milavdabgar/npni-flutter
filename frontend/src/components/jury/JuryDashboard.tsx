import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Slider,
  Container
} from '@mui/material';
import Header from '../common/Header';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Project, Evaluation } from '../../types';

export default function JuryDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [evaluationDialog, setEvaluationDialog] = useState(false);
  const [scannerDialog, setScannerDialog] = useState(false);
  const [marks, setMarks] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    // TODO: Fetch assigned projects
    fetch('/api/projects/assigned')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  const handleScanResult = (decodedText: string) => {
    console.log('Scanned team ID:', decodedText);
    setScannerDialog(false);
    
    const project = projects.find(p => p.teamId === decodedText);
    if (project) {
      setSelectedProject(project);
      setEvaluationDialog(true);
    }
  };

  const initializeScanner = () => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: 250
    });
    scanner.render(
      (decodedText) => handleScanResult(decodedText),
      (error) => console.error('QR Scanner error:', error)
    );
  };

  const handleEvaluate = (project: Project) => {
    setSelectedProject(project);
    setEvaluationDialog(true);
  };

  useEffect(() => {
    if (scannerDialog) {
      initializeScanner();
    }
  }, [scannerDialog]);

  const handleSubmitEvaluation = async () => {
    if (!selectedProject) return;

    try {
      const evaluation: Evaluation = {
        juryId: 'current-jury-id', // TODO: Get from auth context
        marks,
        comment,
        round: 1, // TODO: Get from context or config
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.teamId,
          ...evaluation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit evaluation');
      }

      // Update local state
      const updatedProjects = projects.map(p => {
        if (p.teamId === selectedProject.teamId) {
          return {
            ...p,
            evaluations: [...p.evaluations, evaluation],
          };
        }
        return p;
      });

      setProjects(updatedProjects);
      setEvaluationDialog(false);
      setMarks(0);
      setComment('');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error submitting evaluation:', error.message);
      }
    }
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Jury Dashboard
          </Typography>
          <Button
            startIcon={<QrCodeScannerIcon />}
            variant="contained"
            onClick={() => setScannerDialog(true)}
          >
            Scan QR Code
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.teamId}>
                  <TableCell>{project.teamId}</TableCell>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.institution}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleEvaluate(project)}
                    >
                      Evaluate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* QR Code Scanner Dialog */}
        <Dialog
          open={scannerDialog}
          onClose={() => setScannerDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Scan Project QR Code</DialogTitle>
          <DialogContent>
            <div id="reader" />
          </DialogContent>
        </Dialog>

        {/* Evaluation Dialog */}
        <Dialog
          open={evaluationDialog}
          onClose={() => setEvaluationDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Evaluate Project: {selectedProject?.title}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Marks (0-100)</Typography>
              <Slider
                value={marks}
                onChange={(_, value) => setMarks(value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
              <TextField
                label="Comments"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEvaluationDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitEvaluation} variant="contained" color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
    </Box>
  );
}
