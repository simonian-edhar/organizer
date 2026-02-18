/**
 * Case-related Enums
 */
export enum CaseStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    ON_HOLD = 'on_hold',
    CLOSED = 'closed',
    ARCHIVED = 'archived'
}

export enum CasePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum CaseType {
    CIVIL = 'civil',
    CRIMINAL = 'criminal',
    ADMINISTRATIVE = 'administrative',
    ECONOMIC = 'economic',
    FAMILY = 'family',
    LABOR = 'labor',
    TAX = 'tax',
    OTHER = 'other'
}
