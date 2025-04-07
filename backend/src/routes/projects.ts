import express from 'express';
import Project from '../models/Project';
import { authenticateAdmin, authenticateUser } from '../middleware/auth';
import csv from 'csv-parse';

const router = express.Router();

// Get all projects
router.get('/', authenticateUser, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('evaluations.juryId', 'name')
      .sort('teamId');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('evaluations.juryId', 'name');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Create new project (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Import projects from CSV (admin only)
router.post('/import', authenticateAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file;
    const parser = csv({ columns: true });

    const projects = [];
    
    parser.on('readable', async () => {
      let record;
      while ((record = parser.read())) {
        const project = new Project({
          teamId: record.teamId,
          title: record.title,
          description: record.description,
          presentationType: record.presentationType,
          institution: record.institution,
          semester: record.semester,
          branch: record.branch,
          teamMembers: record.teamMembers.split(',').map(m => m.trim()),
          mentorName: record.mentorName,
          contactNumber: record.contactNumber,
          location: record.location
        });
        projects.push(project);
      }
    });

    parser.on('end', async () => {
      try {
        await Project.insertMany(projects);
        res.json({ message: `Successfully imported ${projects.length} projects` });
      } catch (error) {
        res.status(500).json({ message: 'Error importing projects' });
      }
    });

    parser.write(file.data);
    parser.end();
  } catch (error) {
    res.status(500).json({ message: 'Error processing file' });
  }
});

// Update project (admin only)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
