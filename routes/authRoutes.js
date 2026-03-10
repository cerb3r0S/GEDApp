import express from 'express';
const router = express.Router();
import {
  inscription,
  connexion,
  obtenirUtilisateurConnecte
} from '../controllers/authController.js';
import { protegerRoute } from '../middleware/auth.js';

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.get('/moi', protegerRoute, obtenirUtilisateurConnecte);

export default router;