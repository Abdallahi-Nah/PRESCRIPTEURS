import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as xlsx from 'xlsx';
import Modal from './ui/Modal';
import Button from './ui/Button';
import toast from 'react-hot-toast';

const ExcelImportModal = ({ isOpen, onClose, onImportComplete, apiService }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [localErrors, setLocalErrors] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const resetState = () => {
        setFile(null);
        setPreviewData([]);
        setLocalErrors([]);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = xlsx.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = xlsx.utils.sheet_to_json(ws);

            const valid = [];
            const errs = [];

            data.forEach((row, idx) => {
                const code = row['code_prescripteur'] || row['Code'] || row['code'];
                const name = row['nom_prescripteur'] || row['Nom'] || row['name'];
                const specialite = row['specialite_prescripteur'] || row['Spécialité'] || row['Specialty'] || row['specialite'];

                if (!code && !name && !specialite) {
                    return; // silently ignore completely empty rows at the end of file
                }
                
                if (!code || !name || !specialite) {
                    errs.push(`Ligne ${idx + 2}: Champs manquants (code, nom ou spécialité)`);
                } else if (valid.some(v => v.code === code)) {
                    errs.push(`Ligne ${idx + 2}: Code doublon dans le fichier (${code})`);
                } else {
                    valid.push({ code, name, specialite });
                }
            });

            setPreviewData(valid);
            setLocalErrors(errs);
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await apiService.importPrescripteurs(formData);
            
            toast.success(`Import réussi : ${res.data.insertedCount} ajoutés`);
            
            if (res.data.errors && res.data.errors.length > 0) {
                // Show backend errors (e.g. DB duplicates)
                res.data.errors.forEach(err => {
                    toast.error(`Ligne ${err.row}: ${err.message}`, { duration: 5000 });
                });
            }

            onImportComplete();
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'import');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={t('import_excel')}
        >
            <div className="space-y-4">
                <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                />

                {localErrors.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-md overflow-y-auto max-h-32 text-xs text-red-600">
                        <p className="font-semibold mb-1">Erreurs détectées :</p>
                        <ul className="list-disc pl-5">
                            {localErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {previewData.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Aperçu des données valides : ({previewData.length})</p>
                        <div className="overflow-y-auto max-h-48 border rounded-md">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-500">Code</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-500">Nom</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-500">Spécialité</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {previewData.slice(0, 10).map((row, i) => (
                                        <tr key={i}>
                                            <td className="px-3 py-2">{row.code}</td>
                                            <td className="px-3 py-2">{row.name}</td>
                                            <td className="px-3 py-2">{row.specialite}</td>
                                        </tr>
                                    ))}
                                    {previewData.length > 10 && (
                                        <tr>
                                            <td colSpan="3" className="px-3 py-2 text-center text-gray-500 italic">
                                                ... et {previewData.length - 10} autres lignes valides
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={handleClose}>
                        {t('actions.cancel')}
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit} 
                        disabled={!file || isUploading}
                    >
                        {isUploading ? 'Import...' : 'Valider l\'import'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExcelImportModal;
