import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import toast from 'react-hot-toast';

const PrescripteurForm = ({ isOpen, onClose, initialData, onSave }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        code_prescripteur: '',
        nom_prescripteur: '',
        specialite_prescripteur: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                code_prescripteur: initialData.code_prescripteur || '',
                nom_prescripteur: initialData.nom_prescripteur || '',
                specialite_prescripteur: initialData.specialite_prescripteur || '',
            });
        } else {
            setFormData({ code_prescripteur: '', nom_prescripteur: '', specialite_prescripteur: '' });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.code_prescripteur) newErrors.code_prescripteur = t('form.required_error');
        if (!formData.nom_prescripteur) newErrors.nom_prescripteur = t('form.required_error');
        if (!formData.specialite_prescripteur) newErrors.specialite_prescripteur = t('form.required_error');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        try {
            await onSave(formData);
        } catch (error) {
            const msg = error.response?.data?.message || 'Error occurred';
            toast.error(msg);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={initialData ? t('form.edit_title') : t('form.add_title')}
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Input
                    label={t('form.code_label')}
                    name="code_prescripteur"
                    value={formData.code_prescripteur}
                    onChange={handleChange}
                    error={errors.code_prescripteur}
                />
                
                <Input
                    label={t('form.name_label')}
                    name="nom_prescripteur"
                    value={formData.nom_prescripteur}
                    onChange={handleChange}
                    error={errors.nom_prescripteur}
                />
                
                <Input
                    label={t('form.specialty_label')}
                    name="specialite_prescripteur"
                    value={formData.specialite_prescripteur}
                    onChange={handleChange}
                    error={errors.specialite_prescripteur}
                />

                <div className="mt-5 flex justify-end gap-3 border-t pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        {t('actions.cancel')}
                    </Button>
                    <Button type="submit" variant="primary">
                        {t('actions.save')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PrescripteurForm;
