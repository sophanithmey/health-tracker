import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { usePatient } from '@/hooks/use-patient';
import { useRole } from '@/context/RoleContext';
import {
  Activity,
  Droplet,
  Pill,
  Utensils,
  Target,
  FileText,
  Settings,
  BookOpen
} from 'lucide-react';

export function useHeaderNavigation() {
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { role, switchRole } = useRole();
  const { patient } = usePatient();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen((prev) => !prev);
    const handleOpen = () => setIsMobileMenuOpen(true);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    window.addEventListener('open-mobile-menu', handleOpen);
    return () => {
      window.removeEventListener('toggle-mobile-menu', handleToggle);
      window.removeEventListener('open-mobile-menu', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const patientDisplayName = patient
    ? locale === 'km'
      ? patient.fullNameKm || patient.fullName
      : patient.fullName
    : '';

  const handleLanguageChange = (newLocale: 'km' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  const navItems = [
    { href: '/', label: tNav('dashboard'), icon: Activity },
    { href: '/blood-sugar', label: tNav('bloodSugar'), icon: Droplet },
    { href: '/medications', label: tNav('medications'), icon: Pill },
    { href: '/lifestyle', label: tNav('lifestyle'), icon: Utensils },
    { href: '/targets', label: tNav('targets'), icon: Target },
    { href: '/knowledge', label: tNav('knowledge'), icon: BookOpen },
    { href: '/reports', label: tNav('reports'), icon: FileText },
    { href: '/settings', label: tNav('settings'), icon: Settings }
  ];

  return {
    navItems,
    pathname,
    locale,
    role,
    switchRole,
    patient,
    patientDisplayName,
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLanguageChange
  };
}
