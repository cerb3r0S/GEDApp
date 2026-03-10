import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du dossier est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  departement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  couleur: {
    type: String,
    default: '#3B82F6'
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Folder', folderSchema);