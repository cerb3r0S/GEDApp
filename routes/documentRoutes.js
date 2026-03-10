import express from 'express';
const router = express.Router();
import {
  uploaderDocument,
  obtenirDocuments,
  obtenirDocument,
  telechargerDocument,
  partagerDocument,
  supprimerDocument
} from '../controllers/documentController.js';
import { protegerRoute } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

// Toutes les routes sont protégées
router.use(protegerRoute);

router.route('/')
  .get(obtenirDocuments)
  .post(upload.single('fichier'), uploaderDocument);

router.route('/:id')
  .get(obtenirDocument)
  .delete(supprimerDocument);

router.get('/:id/telecharger', telechargerDocument);
router.post('/:id/partager', partagerDocument);

export default router;