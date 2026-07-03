import Prescripteur from '../models/Prescripteur.js';
import xlsx from 'xlsx';

// @desc    Get all prescripteurs / search
// @route   GET /api/prescripteurs
export const getPrescripteurs = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { nom_prescripteur: { $regex: search, $options: 'i' } },
                    { code_prescripteur: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const count = await Prescripteur.countDocuments(query);
        
        // Ensure limit isn't huge
        const limitInt = parseInt(limit, 10);
        const pageInt = parseInt(page, 10);
        
        const prescripteurs = await Prescripteur.find(query)
            .sort({ createdAt: -1 })
            .limit(limitInt)
            .skip((pageInt - 1) * limitInt);

        res.status(200).json({
            prescripteurs,
            totalPages: Math.ceil(count / limitInt),
            currentPage: pageInt,
            totalItems: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single prescripteur
// @route   GET /api/prescripteurs/:id
export const getPrescripteurById = async (req, res) => {
    try {
        const prescripteur = await Prescripteur.findById(req.params.id);
        if (!prescripteur) {
            return res.status(404).json({ message: 'Prescripteur not found' });
        }
        res.status(200).json(prescripteur);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a prescripteur
// @route   POST /api/prescripteurs
export const createPrescripteur = async (req, res) => {
    try {
        const { code_prescripteur, nom_prescripteur, specialite_prescripteur } = req.body;

        const prescripteurExists = await Prescripteur.findOne({ code_prescripteur });
        if (prescripteurExists) {
            return res.status(400).json({ message: 'Prescripteur with this code already exists' });
        }

        const prescripteur = await Prescripteur.create({
            code_prescripteur,
            nom_prescripteur,
            specialite_prescripteur
        });

        res.status(201).json(prescripteur);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a prescripteur
// @route   PUT /api/prescripteurs/:id
export const updatePrescripteur = async (req, res) => {
    try {
        const { code_prescripteur, nom_prescripteur, specialite_prescripteur } = req.body;

        const prescripteur = await Prescripteur.findById(req.params.id);
        if (!prescripteur) {
            return res.status(404).json({ message: 'Prescripteur not found' });
        }

        if (code_prescripteur !== prescripteur.code_prescripteur) {
            const codeExists = await Prescripteur.findOne({ code_prescripteur });
            if (codeExists) {
                return res.status(400).json({ message: 'Prescripteur with this code already exists' });
            }
        }

        prescripteur.code_prescripteur = code_prescripteur || prescripteur.code_prescripteur;
        prescripteur.nom_prescripteur = nom_prescripteur || prescripteur.nom_prescripteur;
        prescripteur.specialite_prescripteur = specialite_prescripteur || prescripteur.specialite_prescripteur;

        const updatedPrescripteur = await prescripteur.save();
        res.status(200).json(updatedPrescripteur);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a prescripteur
// @route   DELETE /api/prescripteurs/:id
export const deletePrescripteur = async (req, res) => {
    try {
        const prescripteur = await Prescripteur.findById(req.params.id);
        if (!prescripteur) {
            return res.status(404).json({ message: 'Prescripteur not found' });
        }

        await prescripteur.deleteOne();
        res.status(200).json({ message: 'Prescripteur removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Import prescripteurs from Excel
// @route   POST /api/prescripteurs/import
export const importPrescripteurs = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        if (data.length === 0) {
            return res.status(400).json({ message: 'File is empty or incorrectly formatted' });
        }

        const validPrescripteurs = [];
        const errors = [];

        // Validate rows
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            let code = row[0];
            let name = row[1];
            let specialite = row[2];

            if (String(code).toLowerCase() === 'code' || String(code).toLowerCase() === 'code_prescripteur') {
                continue;
            }

            code = String(code || '').trim();
            name = String(name || '').trim();
            specialite = String(specialite || '').trim();

            if (!code && !name && !specialite) {
                continue; // Ignore blank lines
            }

            if (!code || !name || !specialite) {
                errors.push({ row: i + 1, message: 'Missing required fields (code, name, or specialty)' });
                continue;
            }

            // Check duplicate in file
            if (validPrescripteurs.some(p => p.code_prescripteur === String(code))) {
                errors.push({ row: i + 2, message: 'Duplicate code in file' });
                continue;
            }

            // Check duplicate in DB
            const existing = await Prescripteur.findOne({ code_prescripteur: String(code) });
            if (existing) {
                errors.push({ row: i + 2, message: 'Code already exists in database' });
                continue;
            }

            validPrescripteurs.push({
                code_prescripteur: String(code),
                nom_prescripteur: String(name),
                specialite_prescripteur: String(specialite)
            });
        }

        if (validPrescripteurs.length > 0) {
            await Prescripteur.insertMany(validPrescripteurs);
        }

        res.status(200).json({
            message: 'Import processed',
            insertedCount: validPrescripteurs.length,
            errors
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error during import', error: error.message });
    }
};
