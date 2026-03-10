import express from 'express';
const router = express.Router();
import {
  creerDossier,
  obtenirDossiers,
  obtenirDossier,
  modifierDossier,
  supprimerDossier
} from '../controllers/folderController.js';
import { protegerRoute } from '../middleware/auth.js';

// Toutes les routes sont protégées
router.use(protegerRoute);

router.route('/')
  .get(obtenirDossiers)
  .post(creerDossier);

router.route('/:id')
  .get(obtenirDossier)
  .put(modifierDossier)
  .delete(supprimerDossier);

export default router;