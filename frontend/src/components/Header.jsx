import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const Header = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold shadow-md">
                        P
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
                        {t('app_title')}
                    </span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
                            <Globe size={18} />
                            <span className="uppercase font-medium text-sm">{i18n.language}</span>
                        </button>
                        
                        {/* Dropdown menu */}
                        <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border ring-1 ring-black ring-opacity-5">
                            <button 
                                onClick={() => changeLanguage('fr')} 
                                className={`block w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-gray-100 ${i18n.language === 'fr' ? 'font-bold text-primary-600 bg-primary-50' : 'text-gray-700'}`}
                            >
                                Français
                            </button>
                            <button 
                                onClick={() => changeLanguage('en')} 
                                className={`block w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-gray-100 ${i18n.language === 'en' ? 'font-bold text-primary-600 bg-primary-50' : 'text-gray-700'}`}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => changeLanguage('ar')} 
                                className={`block w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-gray-100 ${i18n.language === 'ar' ? 'font-bold text-primary-600 bg-primary-50' : 'text-gray-700'}`}
                            >
                                العربية
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
