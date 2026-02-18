/**
 * Profile Types
 */

export type Gender = 'male' | 'female' | 'other';

export type EducationLevel =
    | 'secondary'
    | 'vocational'
    | 'bachelor'
    | 'master'
    | 'phd'
    | 'doctor';

export interface UserProfile {
    id: string;
    email: string;

    // Personal Information
    firstName: string;
    lastName: string;
    patronymic?: string;
    gender?: Gender;
    dateOfBirth?: string;
    country?: string;
    citizenship?: string;
    passportNumber?: string;
    taxId?: string;
    phone?: string;

    // Professional Information
    position?: string;
    barNumber?: string;
    specialties?: string[];
    languages?: string[];
    experienceYears?: number;

    // Education
    education?: EducationLevel;
    university?: string;
    specialty?: string;
    graduationYear?: number;

    // Bio
    bio?: string;
    avatarUrl?: string;

    // Metadata
    role: UserRole;
    tenantId: string;
    emailVerified: boolean;
    status: UserStatus;
}

export type UserRole =
    | 'super_admin'
    | 'organization_owner'
    | 'organization_admin'
    | 'lawyer'
    | 'assistant'
    | 'accountant';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export interface ProfileFormData {
    // Personal Information
    firstName: string;
    lastName: string;
    patronymic?: string;
    gender?: Gender;
    dateOfBirth?: string;
    country?: string;
    citizenship?: string;
    passportNumber?: string;
    taxId?: string;
    phone?: string;

    // Professional Information
    position?: string;
    barNumber?: string;
    specialties?: string[];
    languages?: string[];
    experienceYears?: number;

    // Education
    education?: EducationLevel;
    university?: string;
    specialty?: string;
    graduationYear?: number;

    // Bio
    bio?: string;
    avatarUrl?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Reference data for dropdowns
export const COUNTRIES = [
    { value: 'UA', label: 'Україна' },
    { value: 'PL', label: 'Польща' },
    { value: 'DE', label: 'Німеччина' },
    { value: 'US', label: 'США' },
    { value: 'GB', label: 'Велика Британія' },
    { value: 'CZ', label: 'Чехія' },
    { value: 'SK', label: 'Словаччина' },
    { value: 'RO', label: 'Румунія' },
    { value: 'HU', label: 'Угорщина' },
    { value: 'BY', label: 'Білорусь' },
    { value: 'MD', label: 'Молдова' },
    { value: 'OTHER', label: 'Інше' },
];

export const GENDERS = [
    { value: 'male', label: 'Чоловіча' },
    { value: 'female', label: 'Жіноча' },
    { value: 'other', label: 'Інша' },
];

export const EDUCATION_LEVELS = [
    { value: 'secondary', label: 'Середня освіта' },
    { value: 'vocational', label: 'Професійно-технічна освіта' },
    { value: 'bachelor', label: 'Бакалавр' },
    { value: 'master', label: 'Магістр' },
    { value: 'phd', label: 'Кандидат наук' },
    { value: 'doctor', label: 'Доктор наук' },
];

export const LEGAL_SPECIALTIES = [
    { value: 'civil', label: 'Цивільне право' },
    { value: 'criminal', label: 'Кримінальне право' },
    { value: 'administrative', label: 'Адміністративне право' },
    { value: 'commercial', label: 'Господарське право' },
    { value: 'family', label: 'Сімейне право' },
    { value: 'labor', label: 'Трудове право' },
    { value: 'tax', label: 'Податкове право' },
    { value: 'intellectual', label: 'Інтелектуальна власність' },
    { value: 'real_estate', label: 'Нерухомість' },
    { value: 'corporate', label: 'Корпоративне право' },
    { value: 'international', label: 'Міжнародне право' },
    { value: 'constitutional', label: 'Конституційне право' },
    { value: 'bankruptcy', label: 'Банкрутство' },
    { value: 'migration', label: 'Міграційне право' },
    { value: 'inheritance', label: 'Спадкове право' },
    { value: 'other', label: 'Інше' },
];

export const LANGUAGES = [
    { value: 'ukrainian', label: 'Українська' },
    { value: 'english', label: 'Англійська' },
    { value: 'russian', label: 'Російська' },
    { value: 'polish', label: 'Польська' },
    { value: 'german', label: 'Німецька' },
    { value: 'french', label: 'Французька' },
    { value: 'spanish', label: 'Іспанська' },
    { value: 'italian', label: 'Італійська' },
    { value: 'chinese', label: 'Китайська' },
    { value: 'other', label: 'Інша' },
];
