import User from '../models/User.js';

// ➤ Récupérer tous les utilisateurs
// - admin: voit tous les utilisateurs
// - utilisateur: voit uniquement les utilisateurs du même département
export const getUsers = async (req, res) => {
  try {
    const query = {};

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    if (req.user.role !== 'admin') {
      // limiter aux utilisateurs du même département
      const deptId = req.user.departement && req.user.departement._id ? req.user.departement._id : req.user.departement;
      query.departement = deptId;
    }

    const users = await User.find(query)
      .select('-motDePasse')
      .populate('departement');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// ➤ Récupérer un utilisateur par ID
// - admin: accès à n'importe quel utilisateur
// - utilisateur: accès seulement si l'utilisateur demandé est dans le même département
//   ou si c'est lui-même
export const getUserById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    const user = await User.findById(req.params.id)
      .select('-motDePasse')
      .populate('departement');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    // Admin peut voir tout
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, data: user });
    }

    // Si c'est le même utilisateur, autoriser
    if (req.user._id && req.user._id.toString() === user._id.toString()) {
      return res.status(200).json({ success: true, data: user });
    }

    // Sinon vérifier le département
    const reqDeptId = req.user.departement && req.user.departement._id ? req.user.departement._id.toString() : (req.user.departement ? req.user.departement.toString() : null);
    const userDeptId = user.departement && user.departement._id ? user.departement._id.toString() : (user.departement ? user.departement.toString() : null);

    if (reqDeptId && userDeptId && reqDeptId === userDeptId) {
      return res.status(200).json({ success: true, data: user });
    }

    return res.status(403).json({ success: false, message: 'Accès refusé' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};
