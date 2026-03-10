import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du document est requis'],
    trim: true
  },
  fichier: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  tailleFichier: {
    type: Number,
    required: true
  },
  dossier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  departement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partageAvec: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    typeAcces: {
      type: String,
      enum: ['lecture', 'modification'],
      default: 'lecture'
    },
    datePartage: {
      type: Date,
      default: Date.now
    }
  }],
  dateUpload: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Document', documentSchema);