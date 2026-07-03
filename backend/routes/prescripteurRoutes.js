import express from 'express';
import multer from 'multer';
import {
    getPrescripteurs,
    getPrescripteurById,
    createPrescripteur,
    updatePrescripteur,
    deletePrescripteur,
    importPrescripteurs
} from '../controllers/prescripteurController.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

// Middleware to check validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const prescripteurValidationRules = [
    check('code_prescripteur', 'Code is required').not().isEmpty(),
    check('nom_prescripteur', 'Name is required').not().isEmpty(),
    check('specialite_prescripteur', 'Specialty is required').not().isEmpty()
];

const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('file'), importPrescripteurs);

router.route('/')
    .get(getPrescripteurs)
    .post(prescripteurValidationRules, validateRequest, createPrescripteur);

router.route('/:id')
    .get(getPrescripteurById)
    .put(prescripteurValidationRules, validateRequest, updatePrescripteur)
    .delete(deletePrescripteur);

export default router;
