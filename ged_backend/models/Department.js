import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du département est requis'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Le code du département est requis'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Department', departmentSchema);