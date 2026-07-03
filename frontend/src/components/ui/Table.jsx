import React from 'react';
import { useTranslation } from 'react-i18next';

const Table = ({ columns, data, onEdit, onDelete, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="w-full p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full p-8 text-center text-gray-500">
                {t('messages.no_data')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 bg-white text-sm rtl:text-right">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th 
                                key={idx} 
                                scope="col" 
                                className="px-3 py-3.5 text-left rtl:text-right font-semibold text-gray-900"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((row) => (
                        <tr key={row._id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-3 py-4 text-gray-900 font-medium">{row.code_prescripteur}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-gray-500">{row.nom_prescripteur}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-gray-500">{row.specialite_prescripteur}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-right rtl:text-left text-sm font-medium">
                                <button
                                    onClick={() => onEdit(row)}
                                    className="text-primary-600 hover:text-primary-900 mx-2"
                                >
                                    {t('actions.edit')}
                                </button>
                                <button
                                    onClick={() => onDelete(row)}
                                    className="text-red-600 hover:text-red-900 mx-2"
                                >
                                    {t('actions.delete')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
