import express, { Response } from 'express';
import type { CustomRequest } from '../types/index';
import Evaluation from '../models/Evaluation';
import Project from '../models/Project';
import { authenticateJury } from '../middleware/auth';

const router = express.Router();

// Get evaluations for a project
router.get('/project/:projectId', authenticateJury, async (req: CustomRequest, res: Response) => {
  try {
    const evaluations = await Evaluation.find({ projectId: req.params.projectId })
      .populate('juryId', 'name')
      .sort('-createdAt');
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching evaluations' });
  }
});

// Submit a new evaluation
router.post('/', authenticateJury, async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { projectId, marks, comment, round } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if jury has already evaluated this project in this round
    const existingEvaluation = await Evaluation.findOne({
      projectId,
      juryId: req.user._id,
      round
    });

    if (existingEvaluation) {
      return res.status(400).json({ message: 'Already evaluated this project in this round' });
    }

    const evaluation = new Evaluation({
      projectId,
      juryId: req.user._id,
      marks,
      comment,
      round,
      isLocked: false
    });

    await evaluation.save();

    // Update project's evaluations
    await Project.findByIdAndUpdate(projectId, {
      $push: { evaluations: evaluation._id }
    });

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting evaluation' });
  }
});

// Lock an evaluation
router.put('/:id', authenticateJury, async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    if (evaluation.juryId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    evaluation.isLocked = true;
    await evaluation.save();

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Error locking evaluation' });
  }
});

export default router;
