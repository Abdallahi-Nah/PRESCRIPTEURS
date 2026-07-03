import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { getPrescripteurs, addPrescripteur, updatePrescripteur, deletePrescripteur, importPrescripteurs } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import PrescripteurForm from '../components/PrescripteurForm';
import ExcelImportModal from '../components/ExcelImportModal';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const PrescripteurList = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Search & Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getPrescripteurs({ search: debouncedSearch, page: currentPage, limit: 10 });
            setData(res.data.prescripteurs);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (formData) => {
        if (selectedItem) {
            await updatePrescripteur(selectedItem._id, formData);
            toast.success(t('messages.success_edit'));
        } else {
            await addPrescripteur(formData);
            toast.success(t('messages.success_add'));
        }
        setIsFormOpen(false);
        fetchData();
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deletePrescripteur(selectedItem._id);
            toast.success(t('messages.success_delete'));
            setIsDeleteOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const openEdit = (item) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const openDelete = (item) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const columns = [
        { label: t('columns.code') },
        { label: t('columns.name') },
        { label: t('columns.specialty') },
        { label: t('columns.actions') }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Toaster position="top-right" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{t('app_title')}</h1>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2"
                    >
                        {t('import_excel')}
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} /> {t('add_prescripteur')}
                    </Button>
                </div>
            </div>

            <div className="mb-6 max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 rtl:pr-3 ltr:pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 rtl:pl-3 rtl:pr-10 ltr:pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm border py-2"
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Table 
                columns={columns} 
                data={data} 
                isLoading={isLoading}
                onEdit={openEdit}
                onDelete={openDelete}
            />

            {/* Pagination controls could go here... omitted for brevity */}

            <PrescripteurForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={selectedItem}
                onSave={handleSave}
            />

            <Modal 
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title={t('actions.confirm_delete')}
            >
                <div className="py-4">
                    <p className="text-sm text-gray-500">
                        {t('messages.delete_confirmation_text')}
                    </p>
                </div>
                <div className="mt-5 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
                        {t('actions.cancel')}
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        {t('actions.delete')}
                    </Button>
                </div>
            </Modal>

            <ExcelImportModal 
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImportComplete={fetchData}
                apiService={{ importPrescripteurs }}
            />
        </div>
    );
};

export default PrescripteurList;
