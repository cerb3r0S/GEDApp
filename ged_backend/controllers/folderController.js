import Folder from '../models/Folder.js';
import Department from '../models/Department.js';

// @desc    Créer un nouveau dossier
// @route   POST /api/folders
// @access  Privé
export const creerDossier = async (req, res) => {
  try {
    const { nom, description, departement, parent, couleur } = req.body;

    // Vérifier que le département existe
    const dept = await Department.findById(departement);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Département non trouvé'
      });
    }

    // Vérifier que l'utilisateur appartient au département (sauf admin)
    if (req.user.role !== 'admin' && req.user.departement._id.toString() !== departement) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez créer des dossiers que dans votre département'
      });
    }

    // Si parent existe, vérifier qu'il appartient au même département
    if (parent) {
      const parentFolder = await Folder.findById(parent);
      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: 'Dossier parent non trouvé'
        });
      }
      if (parentFolder.departement.toString() !== departement) {
        return res.status(400).json({
          success: false,
          message: 'Le dossier parent doit appartenir au même département'
        });
      }
    }

    const dossier = await Folder.create({
      nom,
      description,
      departement,
      parent: parent || null,
      couleur: couleur || '#3B82F6',
      creePar: req.user._id
    });

    await dossier.populate('departement creePar', 'nom code email');

    res.status(201).json({
      success: true,
      data: dossier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du dossier',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les dossiers du département de l'utilisateur
// @route   GET /api/folders
// @access  Privé
export const obtenirDossiers = async (req, res) => {
  try {
    let query = {};

    // Si utilisateur normal, filtrer par département
    if (req.user.role !== 'admin') {
      query.departement = req.user.departement._id;
    }

    // Filtrer par département si spécifié dans la query
    if (req.query.departement) {
      query.departement = req.query.departement;
    }

    // Filtrer par dossier parent
    if (req.query.parent) {
      query.parent = req.query.parent;
    } else if (req.query.racine === 'true') {
      query.parent = null;
    }

    const dossiers = await Folder.find(query)
      .populate('departement', 'nom code')
      .populate('creePar', 'nom email')
      .populate('parent', 'nom')
      .sort({ dateCreation: -1 });

    res.status(200).json({
      success: true,
      count: dossiers.length,
      data: dossiers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dossiers',
      error: error.message
    });
  }
};

// @desc    Obtenir un dossier par ID
// @route   GET /api/folders/:id
// @access  Privé
export const obtenirDossier = async (req, res) => {
  try {
    const dossier = await Folder.findById(req.params.id)
      .populate('departement', 'nom code')
      .populate('creePar', 'nom email')
      .populate('parent', 'nom');

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier non trouvé'
      });
    }

    // Vérifier l'accès au département
    if (req.user.role !== 'admin' && 
        dossier.departement._id.toString() !== req.user.departement._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce dossier'
      });
    }

    res.status(200).json({
      success: true,
      data: dossier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dossier',
      error: error.message
    });
  }
};

// @desc    Modifier un dossier
// @route   PUT /api/folders/:id
// @access  Privé
export const modifierDossier = async (req, res) => {
  try {
    let dossier = await Folder.findById(req.params.id);

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && 
        dossier.departement.toString() !== req.user.departement._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    dossier = await Folder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('departement creePar parent', 'nom code email');

    res.status(200).json({
      success: true,
      data: dossier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du dossier',
      error: error.message
    });
  }
};

// @desc    Supprimer un dossier
// @route   DELETE /api/folders/:id
// @access  Privé
export const supprimerDossier = async (req, res) => {
  try {
    const dossier = await Folder.findById(req.params.id);

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && 
        dossier.departement.toString() !== req.user.departement._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    // Vérifier s'il y a des sous-dossiers
    const sousDossiers = await Folder.countDocuments({ parent: req.params.id });
    if (sousDossiers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un dossier contenant des sous-dossiers'
      });
    }

    await dossier.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Dossier supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du dossier',
      error: error.message
    });
  }
};