import User from '../models/User.js';
import Department from '../models/Department.js';
import jwt from 'jsonwebtoken';

// Générer un token JWT
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/inscription
// @access  Public
export const inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse, departement } = req.body;

    const utilisateurExiste = await User.findOne({ email });
    if (utilisateurExiste) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    const dept = await Department.findById(departement);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Département non trouvé'
      });
    }

    const utilisateur = await User.create({
      nom,
      email,
      motDePasse,
      departement
    });

    const token = genererToken(utilisateur._id);

    res.status(201).json({
      success: true,
      data: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        departement: dept,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/connexion
// @access  Public
export const connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const utilisateur = await User.findOne({ email }).populate('departement');

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const motDePasseValide = await utilisateur.comparerMotDePasse(motDePasse);

    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = genererToken(utilisateur._id);

    res.status(200).json({
      success: true,
      data: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        departement: utilisateur.departement,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/moi
// @access  Privé
export const obtenirUtilisateurConnecte = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user.id)
      .select('-motDePasse')
      .populate('departement');

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
};