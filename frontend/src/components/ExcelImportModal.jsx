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
            const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

            const valid = [];
            const errs = [];

            data.forEach((row, idx) => {
                // If it's an array, map by position. (0: code, 1: nom, 2: specialite)
                let code = row[0];
                let name = row[1];
                let specialite = row[2];

                // Skip header row if it exists
                if (String(code).toLowerCase() === 'code' || String(code).toLowerCase() === 'code_prescripteur') {
                    return;
                }

                code = String(code || '').trim();
                name = String(name || '').trim();
                specialite = String(specialite || '').trim();

                if (!code && !name && !specialite) {
                    return; // silently ignore completely empty rows
                }
                
                if (!code || !name || !specialite) {
                    errs.push(t('excel.missing_fields', { line: idx + 1 }));
                } else if (valid.some(v => v.code === code)) {
                    errs.push(t('excel.duplicate_code', { line: idx + 1, code }));
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
            
            toast.success(t('excel.success_import', { count: res.data.insertedCount }));
            
            if (res.data.errors && res.data.errors.length > 0) {
                // Show backend errors (e.g. DB duplicates)
                res.data.errors.forEach(err => {
                    // For backend errors, we can just use the provided message or customize it if we add more backend keys
                    toast.error(`${err.message} (Ligne ${err.row})`, { duration: 5000 });
                });
            }

            onImportComplete();
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || t('excel.import_error'));
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
                        <p className="font-semibold mb-1">{t('excel.errors_detected')}</p>
                        <ul className="list-disc pl-5">
                            {localErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {previewData.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">{t('excel.valid_data_preview')} ({previewData.length})</p>
                        <div className="overflow-y-auto max-h-48 border rounded-md">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left rtl:text-right font-medium text-gray-500">{t('columns.code')}</th>
                                        <th className="px-3 py-2 text-left rtl:text-right font-medium text-gray-500">{t('columns.name')}</th>
                                        <th className="px-3 py-2 text-left rtl:text-right font-medium text-gray-500">{t('columns.specialty')}</th>
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
                                                {t('excel.and_more', { count: previewData.length - 10 })}
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
                        {isUploading ? t('excel.importing') : t('excel.validate_import')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExcelImportModal;
