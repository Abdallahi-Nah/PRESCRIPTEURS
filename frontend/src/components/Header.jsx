import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇲🇷' },
];

const Header = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold shadow-md">
                        P
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
                        {t('app_title')}
                    </span>
                </div>

                {/* Language Switcher */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(prev => !prev)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors px-3 py-2 rounded-md"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                    >
                        <Globe size={18} />
                        <span className="text-sm font-medium">{currentLang.flag} {currentLang.label}</span>
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border ring-1 ring-black ring-opacity-5">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors
                                        ${i18n.language === lang.code
                                            ? 'bg-primary-50 text-primary-700 font-semibold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
