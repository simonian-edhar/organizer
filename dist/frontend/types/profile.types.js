/**
 * Profile Types
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get COUNTRIES () {
        return COUNTRIES;
    },
    get EDUCATION_LEVELS () {
        return EDUCATION_LEVELS;
    },
    get GENDERS () {
        return GENDERS;
    },
    get LANGUAGES () {
        return LANGUAGES;
    },
    get LEGAL_SPECIALTIES () {
        return LEGAL_SPECIALTIES;
    }
});
const COUNTRIES = [
    {
        value: 'UA',
        label: 'Україна'
    },
    {
        value: 'PL',
        label: 'Польща'
    },
    {
        value: 'DE',
        label: 'Німеччина'
    },
    {
        value: 'US',
        label: 'США'
    },
    {
        value: 'GB',
        label: 'Велика Британія'
    },
    {
        value: 'CZ',
        label: 'Чехія'
    },
    {
        value: 'SK',
        label: 'Словаччина'
    },
    {
        value: 'RO',
        label: 'Румунія'
    },
    {
        value: 'HU',
        label: 'Угорщина'
    },
    {
        value: 'BY',
        label: 'Білорусь'
    },
    {
        value: 'MD',
        label: 'Молдова'
    },
    {
        value: 'OTHER',
        label: 'Інше'
    }
];
const GENDERS = [
    {
        value: 'male',
        label: 'Чоловіча'
    },
    {
        value: 'female',
        label: 'Жіноча'
    },
    {
        value: 'other',
        label: 'Інша'
    }
];
const EDUCATION_LEVELS = [
    {
        value: 'secondary',
        label: 'Середня освіта'
    },
    {
        value: 'vocational',
        label: 'Професійно-технічна освіта'
    },
    {
        value: 'bachelor',
        label: 'Бакалавр'
    },
    {
        value: 'master',
        label: 'Магістр'
    },
    {
        value: 'phd',
        label: 'Кандидат наук'
    },
    {
        value: 'doctor',
        label: 'Доктор наук'
    }
];
const LEGAL_SPECIALTIES = [
    {
        value: 'civil',
        label: 'Цивільне право'
    },
    {
        value: 'criminal',
        label: 'Кримінальне право'
    },
    {
        value: 'administrative',
        label: 'Адміністративне право'
    },
    {
        value: 'commercial',
        label: 'Господарське право'
    },
    {
        value: 'family',
        label: 'Сімейне право'
    },
    {
        value: 'labor',
        label: 'Трудове право'
    },
    {
        value: 'tax',
        label: 'Податкове право'
    },
    {
        value: 'intellectual',
        label: 'Інтелектуальна власність'
    },
    {
        value: 'real_estate',
        label: 'Нерухомість'
    },
    {
        value: 'corporate',
        label: 'Корпоративне право'
    },
    {
        value: 'international',
        label: 'Міжнародне право'
    },
    {
        value: 'constitutional',
        label: 'Конституційне право'
    },
    {
        value: 'bankruptcy',
        label: 'Банкрутство'
    },
    {
        value: 'migration',
        label: 'Міграційне право'
    },
    {
        value: 'inheritance',
        label: 'Спадкове право'
    },
    {
        value: 'other',
        label: 'Інше'
    }
];
const LANGUAGES = [
    {
        value: 'ukrainian',
        label: 'Українська'
    },
    {
        value: 'english',
        label: 'Англійська'
    },
    {
        value: 'russian',
        label: 'Російська'
    },
    {
        value: 'polish',
        label: 'Польська'
    },
    {
        value: 'german',
        label: 'Німецька'
    },
    {
        value: 'french',
        label: 'Французька'
    },
    {
        value: 'spanish',
        label: 'Іспанська'
    },
    {
        value: 'italian',
        label: 'Італійська'
    },
    {
        value: 'chinese',
        label: 'Китайська'
    },
    {
        value: 'other',
        label: 'Інша'
    }
];

//# sourceMappingURL=profile.types.js.map