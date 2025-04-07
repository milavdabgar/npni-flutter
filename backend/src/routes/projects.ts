import express, { Request, Response } from 'express';
import Project from '../models/Project';
import User from '../models/User';
import { authenticateAdmin, authenticateUser } from '../middleware/auth';
import { parse } from 'csv-parse';
import { UploadedFile } from 'express-fileupload';
import type { IProject, CustomRequest } from '../types/index';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all projects or team-specific project
router.get('/', authenticateUser, async (req: CustomRequest, res: Response) => {
  try {
    // If user is a team member, only return their project
    if (req.user?.role === 'team') {
      const project = await Project.findOne({ teamId: req.user.email })
        .populate('evaluations.juryId', 'name');
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      return res.json([project]); // Return as array for frontend compatibility
    }

    // For admin/jury, return all projects
    const projects = await Project.find()
      .select('teamId title branch location evaluations')
      .populate('evaluations.juryId', 'name')
      .sort('teamId');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:id', authenticateUser, async (req: CustomRequest, res: Response) => {
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
router.post('/', authenticateAdmin, async (req: CustomRequest, res: Response) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Import projects from CSV (admin only)
router.post('/import', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    console.log('Starting CSV import...');
    const files = req.files as { [key: string]: UploadedFile };
    if (!files || !files.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File received:', files.file.name);

    const file = files.file;
    const csvContent = file.data.toString('utf8');
    console.log('CSV content first 100 chars:', csvContent.substring(0, 100));
    const records = await new Promise<any[]>((resolve, reject) => {
      const results: any[] = [];
      parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      .on('data', (data) => {
        results.push(data);
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('end', () => {
        resolve(results);
      });
    });

    const projects = records.map((record, index) => {
      // Filter out empty team member fields and 'Na' values
      const teamMembers = [
        record['First Team Member Name  (For Certificate Printing)'],
        record['Second Team Member Name  (For Certificate Printing)'],
        record['Third Team Member Name  (For Certificate Printing)'],
        record['Forth Team Member Name  (For Certificate Printing)'],
        record['Fifth Team Member Name  (For Certificate Printing)']
      ].filter(member => member && member.toLowerCase() !== 'na' && member.trim() !== '');

      const projectData = {
        teamId: `NPNI-${String(index + 1).padStart(3, '0')}`,
        title: record['Project Title'] || '',
        description: record['Write about your Idea/project '] || '',
        presentationType: record['Demo Model  / Poster '] || '',
        institution: record['School / college'] || '',
        semester: record['Select Semester'] || '',
        branch: record['Select Branch '] || '',
        teamMembers,
        mentorName: record['Faculty Mentor Name'] || '',
        contactNumber: record['Mobile number any one team member'] || '',
        evaluations: []
      };

      // Log the project data before creation
      console.log('Creating project:', projectData);

      return new Project(projectData);
    });

    console.log('Parsed projects:', projects.length);
    if (projects.length === 0) {
      throw new Error('No projects parsed from CSV');
    }
    
    console.log('Sample project:', JSON.stringify(projects[0], null, 2));
    
    // Create team users with teamId as email and contact number as password
    const teamUsers = projects.map(project => ({
      email: project.teamId, // NPNI-001 etc.
      password: bcrypt.hashSync(project.contactNumber, 10), // Using contact number as password
      role: 'team',
      name: project.teamMembers[0] || 'Team Leader'
    }));

    // First clear existing projects and team users
    await Project.deleteMany({});
    await User.deleteMany({ role: 'team' });
    console.log('Cleared existing projects and team users');

    // Create team users first
    let createdCount = 0;
    for (const user of teamUsers) {
      try {
        await User.create(user);
        console.log(`Created team user: ${user.email} with password: ${user.password}`);
        createdCount++;
      } catch (error: any) {
        console.error(`Error creating team user ${user.email}:`, error);
        throw error;
      }
    }
    console.log(`Created ${createdCount} team accounts`);

    // Then create projects
    await Project.insertMany(projects);
    console.log(`Created ${projects.length} projects`);
    res.json({ message: `Successfully imported ${projects.length} projects` });
  } catch (error: any) {
    console.error('CSV import error:', error);
    res.status(500).json({ message: error.message || 'Error processing file' });
  }
});

// Update project (admin only)
router.put('/:id', authenticateAdmin, async (req: CustomRequest, res: Response) => {
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
router.delete('/:id', authenticateAdmin, async (req: CustomRequest, res: Response) => {
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
