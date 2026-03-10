import express from 'express';
import {
	createDepartment,
	getDepartments,
	getDepartmentById,
	updateDepartment,
	deleteDepartment
} from '../controllers/departmentController.js';
import { protegerRoute, autoriserAdmin } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protegerRoute);

// ➤ /api/departments
// Seuls les admins peuvent accéder à la liste et modifier les départements
router.route('/')
	.get(autoriserAdmin, getDepartments)        // Récupérer tous les départements
	.post(autoriserAdmin, createDepartment);     // Créer un département

// ➤ /api/departments/:id
// GET /:id : accessible par admin OU par un utilisateur appartenant à ce département
router.route('/:id')
	.get(getDepartmentById)      // Récupérer un département (admin ou membre du département)
	.put(autoriserAdmin, updateDepartment)        // Modifier un département
	.delete(autoriserAdmin, deleteDepartment);    // Supprimer un département

export default router;

