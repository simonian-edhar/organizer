"use strict";
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
    get ChangePasswordDto () {
        return ChangePasswordDto;
    },
    get ProfileResponseDto () {
        return ProfileResponseDto;
    },
    get UpdateProfileDto () {
        return UpdateProfileDto;
    }
});
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateProfileDto = class UpdateProfileDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(2),
    (0, _classvalidator.MaxLength)(100),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(2),
    (0, _classvalidator.MaxLength)(100),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(100),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "patronymic", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'male',
        'female',
        'other'
    ]),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof Gender === "undefined" ? Object : Gender)
], UpdateProfileDto.prototype, "gender", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "dateOfBirth", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(100),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "country", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(100),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "citizenship", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(50),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "passportNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(20),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Matches)(/^\d{10}$/, {
        message: 'Tax ID must be 10 digits'
    }),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "taxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(20),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(100),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "position", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(20),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "barNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Array)
], UpdateProfileDto.prototype, "specialties", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Array)
], UpdateProfileDto.prototype, "languages", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.Max)(100),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], UpdateProfileDto.prototype, "experienceYears", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'secondary',
        'vocational',
        'bachelor',
        'master',
        'phd',
        'doctor'
    ]),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof EducationLevel === "undefined" ? Object : EducationLevel)
], UpdateProfileDto.prototype, "education", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(255),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "university", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(100),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "specialty", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1950),
    (0, _classvalidator.Max)(new Date().getFullYear()),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], UpdateProfileDto.prototype, "graduationYear", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MaxLength)(2000),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "avatarUrl", void 0);
let ChangePasswordDto = class ChangePasswordDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(8),
    (0, _classvalidator.MaxLength)(128),
    (0, _classvalidator.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain lowercase, uppercase and number'
    }),
    _ts_metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
let ProfileResponseDto = class ProfileResponseDto {
};

//# sourceMappingURL=profile.dto.js.map