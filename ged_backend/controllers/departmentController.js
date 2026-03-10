import Department from '../models/Department.js';

// ➤ Ajouter un département
export const createDepartment = async (req, res) => {
  try {
    const { nom, code, description } = req.body;

    const department = await Department.create({
      nom,
      code,
      description
    });

    res.status(201).json({
      message: 'Département créé avec succès',
      department
    });
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la création du département',
      error: error.message
    });
  }
};

// ➤ Récupérer tous les départements
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();

    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des départements',
      error: error.message
    });
  }
};

// ➤ Récupérer un département par ID
export const getDepartmentById = async (req, res) => {
  try {
    // s'assurer que l'utilisateur est présent (protegerRoute doit le remplir)
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non autorisé - Token manquant' });
    }

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Département introuvable' });
    }

    // Admin peut voir n'importe quel département
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, data: department });
    }

    // Utilisateur normal : ne peut voir que son propre département
    const reqDeptId = req.user.departement && req.user.departement._id ? req.user.departement._id.toString() : (req.user.departement ? req.user.departement.toString() : null);
    const deptId = department._id ? department._id.toString() : department.toString();

    if (reqDeptId && reqDeptId === deptId) {
      return res.status(200).json({ success: true, data: department });
    }

    return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération du département',
      error: error.message
    });
  }
};

// ➤ Modifier un département
export const updateDepartment = async (req, res) => {
  try {
    const { nom, code, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { nom, code, description },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Département introuvable' });
    }

    res.status(200).json({
      message: 'Département mis à jour avec succès',
      department
    });
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la mise à jour du département',
      error: error.message
    });
  }
};

// ➤ Supprimer un département
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Département introuvable' });
    }

    res.status(200).json({ message: 'Département supprimé avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la suppression du département',
      error: error.message
    });
  }
};
