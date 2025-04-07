import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import Project from '../models/Project';

dotenv.config();

const sampleUsers = [
  {
    email: 'admin@gppalanpur.ac.in',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'jury1@gppalanpur.ac.in',
    password: 'jury123',
    name: 'Jury Member 1',
    role: 'jury'
  },
  {
    email: 'jury2@gppalanpur.ac.in',
    password: 'jury123',
    name: 'Jury Member 2',
    role: 'jury'
  }
];

async function initializeDb() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/npni');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    await User.insertMany(hashedUsers);
    console.log('Created sample users');

    // Read and parse CSV file
    const csvPath = path.join(__dirname, '../../../_New Palanpur For New India 3.0 (Responses).csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Transform CSV data to Project documents
    const projects = records.map((record: any, index: number) => ({
      teamId: `NPNI2025-${String(index + 1).padStart(3, '0')}`,
      title: record['Project Title'] || 'Untitled Project',
      description: record['Write about your Idea/project '] || 'No description provided',
      presentationType: record['Demo Model  / Poster '] || 'Model',
      institution: record['School / college'] || 'Unknown Institution',
      semester: record['Select Semester'] || 'Unknown Semester',
      branch: record['Select Branch '] || 'Unknown Branch',
      teamMembers: [
        record['First Team Member Name  (For Certificate Printing)'],
        record['Second Team Member Name  (For Certificate Printing)'],
        record['Third Team Member Name  (For Certificate Printing)'],
        record['Forth Team Member Name  (For Certificate Printing)'],
        record['Fifth Team Member Name  (For Certificate Printing)']
      ].filter(Boolean),
      mentorName: record['Faculty Mentor Name'] || 'Unknown Mentor',
      contactNumber: record['Mobile number any one team member'] || 'No contact provided',
      evaluations: []
    }));

    await Project.insertMany(projects);
    console.log('Imported projects from CSV');

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDb();
