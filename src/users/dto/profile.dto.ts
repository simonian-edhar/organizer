import {
    IsString,
    IsOptional,
    MinLength,
    MaxLength,
    IsEmail,
    IsEnum,
    IsInt,
    Min,
    Max,
    IsDateString,
    Matches,
    IsArray,
} from 'class-validator';

export type Gender = 'male' | 'female' | 'other';

export type EducationLevel =
    | 'secondary'
    | 'vocational'
    | 'bachelor'
    | 'master'
    | 'phd'
    | 'doctor';

/**
 * Update Profile DTO
 */
export class UpdateProfileDto {
    // Personal Information
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    lastName: string;

    @IsString()
    @MaxLength(100)
    @IsOptional()
    patronymic?: string;

    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: Gender;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @MaxLength(100)
    @IsOptional()
    country?: string;

    @IsString()
    @MaxLength(100)
    @IsOptional()
    citizenship?: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    passportNumber?: string;

    @IsString()
    @MaxLength(20)
    @IsOptional()
    @Matches(/^\d{10}$/, { message: 'Tax ID must be 10 digits' })
    taxId?: string;

    @IsString()
    @MaxLength(20)
    @IsOptional()
    phone?: string;

    // Professional Information
    @IsString()
    @MaxLength(100)
    @IsOptional()
    position?: string;

    @IsString()
    @MaxLength(20)
    @IsOptional()
    barNumber?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    specialties?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    languages?: string[];

    @IsInt()
    @Min(0)
    @Max(100)
    @IsOptional()
    experienceYears?: number;

    // Education
    @IsEnum(['secondary', 'vocational', 'bachelor', 'master', 'phd', 'doctor'])
    @IsOptional()
    education?: EducationLevel;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    university?: string;

    @IsString()
    @MaxLength(100)
    @IsOptional()
    specialty?: string;

    @IsInt()
    @Min(1950)
    @Max(new Date().getFullYear())
    @IsOptional()
    graduationYear?: number;

    // Bio
    @IsString()
    @MaxLength(2000)
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;
}

/**
 * Change Password DTO
 */
export class ChangePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain lowercase, uppercase and number',
    })
    newPassword: string;
}

/**
 * Profile Response DTO
 */
export class ProfileResponseDto {
    id: string;
    email: string;

    // Personal Information
    firstName: string;
    lastName: string;
    patronymic?: string;
    gender?: Gender;
    dateOfBirth?: Date;
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
    role: string;
    tenantId: string;
    emailVerified: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
