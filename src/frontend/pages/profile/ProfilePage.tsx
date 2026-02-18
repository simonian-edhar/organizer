import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    ProfileFormData,
    Gender,
    EducationLevel,
    COUNTRIES,
    GENDERS,
    EDUCATION_LEVELS,
    LEGAL_SPECIALTIES,
    LANGUAGES,
} from '../../types/profile.types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { profileService } from '../../services/profile.service';
import './ProfilePage.css';

/**
 * Profile Page Component
 */
export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'security'>('personal');

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: '',
        lastName: '',
        patronymic: '',
        gender: undefined,
        dateOfBirth: '',
        country: '',
        citizenship: '',
        passportNumber: '',
        taxId: '',
        phone: '',
        position: '',
        barNumber: '',
        specialties: [],
        languages: [],
        experienceYears: undefined,
        education: undefined,
        university: '',
        specialty: '',
        graduationYear: undefined,
        bio: '',
        avatarUrl: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const profile = await profileService.getProfile();
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                patronymic: profile.patronymic || '',
                gender: profile.gender as Gender,
                dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
                country: profile.country || '',
                citizenship: profile.citizenship || '',
                passportNumber: profile.passportNumber || '',
                taxId: profile.taxId || '',
                phone: profile.phone || '',
                position: profile.position || '',
                barNumber: profile.barNumber || '',
                specialties: profile.specialties || [],
                languages: profile.languages || [],
                experienceYears: profile.experienceYears,
                education: profile.education as EducationLevel,
                university: profile.university || '',
                specialty: profile.specialty || '',
                graduationYear: profile.graduationYear,
                bio: profile.bio || '',
                avatarUrl: profile.avatarUrl || '',
            });
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Не вдалося завантажити профіль' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        setMessage(null);
    };

    const handleMultiSelectChange = (name: string, value: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
                ? [...(prev[name as keyof ProfileFormData] as string[] || []), value]
                : (prev[name as keyof ProfileFormData] as string[] || []).filter(v => v !== value),
        }));
        setMessage(null);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) newErrors.firstName = "Обов'язкове поле";
        if (!formData.lastName) newErrors.lastName = "Обов'язкове поле";
        if (formData.phone && !/^\+?380\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Невірний формат телефону';
        }
        if (formData.taxId && !/^\d{10}$/.test(formData.taxId)) {
            newErrors.taxId = 'РНОКПП має містити 10 цифр';
        }
        if (formData.graduationYear && (formData.graduationYear < 1950 || formData.graduationYear > new Date().getFullYear())) {
            newErrors.graduationYear = 'Невірний рік';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: FormEvent) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        setMessage(null);

        try {
            await profileService.updateProfile(formData);
            setMessage({ type: 'success', text: 'Профіль успішно оновлено' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Не вдалося зберегти профіль' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!passwordData.currentPassword) newErrors.currentPassword = "Обов'язкове поле";
        if (!passwordData.newPassword) newErrors.newPassword = "Обов'язкове поле";
        if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Мінімум 8 символів';
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Паролі не співпадають';
        }

        if (Object.keys(newErrors).length > 0) {
            setPasswordErrors(newErrors);
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            await profileService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage({ type: 'success', text: 'Пароль успішно змінено' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Не вдалося змінити пароль' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <Spinner size="large" />
                    <p>Завантаження профілю...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" />
                    ) : (
                        <div className="avatar-placeholder">
                            {formData.firstName?.[0]}{formData.lastName?.[0]}
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <h1>{formData.firstName} {formData.lastName}</h1>
                    <p>{formData.position || 'Юрист'}</p>
                    <span className={`status-badge ${user?.status}`}>{user?.status}</span>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    Особиста інформація
                </button>
                <button
                    className={`tab ${activeTab === 'professional' ? 'active' : ''}`}
                    onClick={() => setActiveTab('professional')}
                >
                    Професійна інформація
                </button>
                <button
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Безпека
                </button>
            </div>

            <div className="profile-content">
                {message && (
                    <Alert type={message.type} className="profile-alert">
                        {message.text}
                    </Alert>
                )}

                {activeTab === 'personal' && (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-section">
                            <h3>ПІБ</h3>
                            <div className="form-row">
                                <Input
                                    name="lastName"
                                    label="Прізвище"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Петренко"
                                    required
                                    disabled={isSaving}
                                    error={errors.lastName}
                                />
                                <Input
                                    name="firstName"
                                    label="Ім'я"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Іван"
                                    required
                                    disabled={isSaving}
                                    error={errors.firstName}
                                />
                                <Input
                                    name="patronymic"
                                    label="По батькові"
                                    value={formData.patronymic}
                                    onChange={handleChange}
                                    placeholder="Іванович"
                                    disabled={isSaving}
                                    error={errors.patronymic}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Персональні дані</h3>
                            <div className="form-row">
                                <Select
                                    name="gender"
                                    label="Стать"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    options={GENDERS}
                                    placeholder="Оберіть стать"
                                    disabled={isSaving}
                                />
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    label="Дата народження"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="form-row">
                                <Select
                                    name="country"
                                    label="Країна проживання"
                                    value={formData.country}
                                    onChange={handleChange}
                                    options={COUNTRIES}
                                    placeholder="Оберіть країну"
                                    disabled={isSaving}
                                />
                                <Select
                                    name="citizenship"
                                    label="Громадянство"
                                    value={formData.citizenship}
                                    onChange={handleChange}
                                    options={COUNTRIES}
                                    placeholder="Оберіть громадянство"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Документи</h3>
                            <div className="form-row">
                                <Input
                                    name="passportNumber"
                                    label="Номер паспорта"
                                    value={formData.passportNumber}
                                    onChange={handleChange}
                                    placeholder="АБ123456"
                                    disabled={isSaving}
                                    error={errors.passportNumber}
                                />
                                <Input
                                    name="taxId"
                                    label="РНОКПП (Ідентифікаційний код)"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    placeholder="1234567890"
                                    maxLength={10}
                                    disabled={isSaving}
                                    error={errors.taxId}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Контакти</h3>
                            <div className="form-row">
                                <Input
                                    name="phone"
                                    type="tel"
                                    label="Телефон"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+380 44 123 4567"
                                    disabled={isSaving}
                                    error={errors.phone}
                                />
                                <Input
                                    name="avatarUrl"
                                    label="URL фото профілю"
                                    value={formData.avatarUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/avatar.jpg"
                                    disabled={isSaving}
                                    error={errors.avatarUrl}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner size="small" />
                                        Збереження...
                                    </>
                                ) : (
                                    'Зберегти зміни'
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {activeTab === 'professional' && (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-section">
                            <h3>Професійна інформація</h3>
                            <div className="form-row">
                                <Input
                                    name="position"
                                    label="Посада"
                                    value={formData.position}
                                    onChange={handleChange}
                                    placeholder="Адвокат, Юрист"
                                    disabled={isSaving}
                                />
                                <Input
                                    name="barNumber"
                                    label="Номер свідоцтва адвоката"
                                    value={formData.barNumber}
                                    onChange={handleChange}
                                    placeholder="123456789012"
                                    maxLength={12}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="form-row">
                                <Input
                                    name="experienceYears"
                                    type="number"
                                    label="Досвід роботи (років)"
                                    value={formData.experienceYears?.toString() || ''}
                                    onChange={handleChange}
                                    placeholder="5"
                                    min="0"
                                    max="100"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Освіта</h3>
                            <div className="form-row">
                                <Select
                                    name="education"
                                    label="Рівень освіти"
                                    value={formData.education}
                                    onChange={handleChange}
                                    options={EDUCATION_LEVELS}
                                    placeholder="Оберіть рівень освіти"
                                    disabled={isSaving}
                                />
                                <Input
                                    name="graduationYear"
                                    type="number"
                                    label="Рік закінчення"
                                    value={formData.graduationYear?.toString() || ''}
                                    onChange={handleChange}
                                    placeholder="2020"
                                    min="1950"
                                    max={new Date().getFullYear()}
                                    disabled={isSaving}
                                    error={errors.graduationYear}
                                />
                            </div>
                            <div className="form-row">
                                <Input
                                    name="university"
                                    label="Навчальний заклад"
                                    value={formData.university}
                                    onChange={handleChange}
                                    placeholder="Національний юридичний університет"
                                    disabled={isSaving}
                                />
                                <Input
                                    name="specialty"
                                    label="Спеціальність"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                    placeholder="Правознавство"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Спеціалізація</h3>
                            <div className="checkbox-group">
                                <label className="checkbox-group-label">Напрямки права</label>
                                <div className="checkbox-grid">
                                    {LEGAL_SPECIALTIES.map((item) => (
                                        <label key={item.value} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.specialties?.includes(item.value)}
                                                onChange={(e) => handleMultiSelectChange('specialties', item.value, e.target.checked)}
                                                disabled={isSaving}
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Мови</h3>
                            <div className="checkbox-group">
                                <div className="checkbox-grid languages-grid">
                                    {LANGUAGES.map((item) => (
                                        <label key={item.value} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.languages?.includes(item.value)}
                                                onChange={(e) => handleMultiSelectChange('languages', item.value, e.target.checked)}
                                                disabled={isSaving}
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Про себе</h3>
                            <div className="form-group">
                                <label className="form-label">Короткий опис</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Розкажіть про свій досвід та досягнення..."
                                    rows={5}
                                    maxLength={2000}
                                    disabled={isSaving}
                                    className="form-textarea"
                                />
                                <span className="char-count">{formData.bio?.length || 0} / 2000</span>
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner size="small" />
                                        Збереження...
                                    </>
                                ) : (
                                    'Зберегти зміни'
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-section">
                            <h3>Зміна паролю</h3>
                            <div className="form-row single">
                                <Input
                                    name="currentPassword"
                                    type="password"
                                    label="Поточний пароль"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Введіть поточний пароль"
                                    required
                                    disabled={isSaving}
                                    error={passwordErrors.currentPassword}
                                />
                            </div>
                            <div className="form-row">
                                <Input
                                    name="newPassword"
                                    type="password"
                                    label="Новий пароль"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Мінімум 8 символів"
                                    required
                                    disabled={isSaving}
                                    error={passwordErrors.newPassword}
                                />
                                <Input
                                    name="confirmPassword"
                                    type="password"
                                    label="Підтвердження паролю"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Повторіть новий пароль"
                                    required
                                    disabled={isSaving}
                                    error={passwordErrors.confirmPassword}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Безпека акаунту</h3>
                            <div className="security-info">
                                <div className="security-item">
                                    <span className="security-label">Email:</span>
                                    <span className="security-value">{user?.email}</span>
                                    {user?.emailVerified ? (
                                        <span className="verified-badge">Підтверджено</span>
                                    ) : (
                                        <span className="unverified-badge">Не підтверджено</span>
                                    )}
                                </div>
                                <div className="security-item">
                                    <span className="security-label">Двофакторна автентифікація:</span>
                                    {user?.mfaEnabled ? (
                                        <span className="enabled-badge">Увімкнено</span>
                                    ) : (
                                        <span className="disabled-badge">Вимкнено</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner size="small" />
                                        Збереження...
                                    </>
                                ) : (
                                    'Змінити пароль'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
