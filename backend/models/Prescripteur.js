import mongoose from 'mongoose';

const PrescripteurSchema = new mongoose.Schema({
    code_prescripteur: {
        type: String,
        required: [true, 'Code is required'],
        unique: true,
        trim: true
    },
    nom_prescripteur: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    specialite_prescripteur: {
        type: String,
        required: [true, 'Specialty is required'],
        trim: true
    }
}, {
    timestamps: true
});

const Prescripteur = mongoose.model('Prescripteur', PrescripteurSchema);
export default Prescripteur;
