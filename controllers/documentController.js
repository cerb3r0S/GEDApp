import Document from '../models/Document.js';
import Folder from '../models/Folder.js';
import path from 'path';
import fs from 'fs';

// @desc    Uploader un document
// @route   POST /api/documents
// @access  Privé
export const uploaderDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé'
      });
    }

    const { titre, dossier, departement } = req.body;

    // Vérifier le dossier
    const folder = await Folder.findById(dossier);
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Dossier non trouvé'
      });
    }

    // Vérifier l'accès au département
    if (req.user.role !== 'admin' && 
        folder.departement.toString() !== req.user.departement._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce dossier'
      });
    }

    const document = await Document.create({
      titre: titre || req.file.originalname,
      fichier: req.file.filename,
      type: req.file.mimetype,
      tailleFichier: req.file.size,
      dossier,
      departement: folder.departement,
      proprietaire: req.user._id
    });

    await document.populate('dossier departement proprietaire', 'nom code email');

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du document',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les documents
// @route   GET /api/documents
// @access  Privé
export const obtenirDocuments = async (req, res) => {
  try {
    let query = {};

    // Filtrer par département pour les utilisateurs normaux
    if (req.user.role !== 'admin') {
      query.departement = req.user.departement._id;
    }

    // Filtrer par dossier si spécifié
    if (req.query.dossier) {
      query.dossier = req.query.dossier;
    }

    // Filtrer par département si spécifié
    if (req.query.departement) {
      query.departement = req.query.departement;
    }

    const documents = await Document.find(query)
      .populate('dossier', 'nom')
      .populate('departement', 'nom code')
      .populate('proprietaire', 'nom email')
      .sort({ dateUpload: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

// @desc    Obtenir un document par ID
// @route   GET /api/documents/:id
// @access  Privé
export const obtenirDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('dossier', 'nom')
      .populate('departement', 'nom code')
      .populate('proprietaire', 'nom email')
      .populate('partageAvec.utilisateur', 'nom email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Vérifier l'accès
    const aAcces = req.user.role === 'admin' ||
                   document.departement._id.toString() === req.user.departement._id.toString() ||
                   document.proprietaire._id.toString() === req.user._id.toString() ||
                   document.partageAvec.some(p => p.utilisateur._id.toString() === req.user._id.toString());

    if (!aAcces) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce document'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      error: error.message
    });
  }
};

// @desc    Télécharger un document
// @route   GET /api/documents/:id/telecharger
// @access  Privé
export const telechargerDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Vérifier l'accès
    const aAcces = req.user.role === 'admin' ||
                   document.departement.toString() === req.user.departement._id.toString() ||
                   document.proprietaire.toString() === req.user._id.toString() ||
                   document.partageAvec.some(p => p.utilisateur.toString() === req.user._id.toString());

    if (!aAcces) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce document'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', document.fichier);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }

    // Get file extension from the stored filename
    const fileExtension = path.extname(document.fichier);
    const downloadFileName = document.titre + fileExtension;

    // Set proper headers for download
    res.setHeader('Content-Type', document.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du document',
      error: error.message
    });
  }
};

// @desc    Partager un document
// @route   POST /api/documents/:id/partager
// @access  Privé
export const partagerDocument = async (req, res) => {
  try {
    const { utilisateur, typeAcces } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (req.user.role !== 'admin' && 
        document.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut partager ce document'
      });
    }

    // Vérifier si déjà partagé avec cet utilisateur
    const dejaPartage = document.partageAvec.find(
      p => p.utilisateur.toString() === utilisateur
    );

    if (dejaPartage) {
      return res.status(400).json({
        success: false,
        message: 'Document déjà partagé avec cet utilisateur'
      });
    }

    document.partageAvec.push({
      utilisateur,
      typeAcces: typeAcces || 'lecture'
    });

    await document.save();
    await document.populate('partageAvec.utilisateur', 'nom email');

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du partage du document',
      error: error.message
    });
  }
};

// @desc    Supprimer un document
// @route   DELETE /api/documents/:id
// @access  Privé
export const supprimerDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && 
        document.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut supprimer ce document'
      });
    }

    // Supprimer le fichier physique
    const filePath = path.join(process.cwd(), 'uploads', document.fichier);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message
    });
  }
};