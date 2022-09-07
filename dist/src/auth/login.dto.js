"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const date_fns_1 = require("date-fns");
const swagger_1 = require("@nestjs/swagger");
const ACCEPTABLE_TIME_DEVIATION_IN_SECONDS = 60;
function IsCurrentTimestamp(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'isCurrentTimestamp',
        validator: {
            validate(value) {
                const timestamp = Number(value);
                const diff = (0, date_fns_1.differenceInSeconds)(timestamp, Date.now());
                return Math.abs(diff) < ACCEPTABLE_TIME_DEVIATION_IN_SECONDS;
            },
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix +
                `$property must not deviate from current server time (${Date.now()}) for more that 1 minute`, validationOptions),
        },
    }, validationOptions);
}
function ArraySize(size, validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'arraySize',
        constraints: [size],
        validator: {
            validate: (value, args) => Array.isArray(value) && value.length === args.constraints[0],
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must contain exactly $constraint1 elements', validationOptions),
        },
    }, validationOptions);
}
class LoginDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { accountId: { required: true, type: () => String }, timestamp: { required: true, type: () => Number }, signature: { required: true, type: () => [Number], minimum: 0, maximum: 255 } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The accountId of a user.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: `Current timestamp.` }),
    IsCurrentTimestamp(),
    __metadata("design:type", Number)
], LoginDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: `Signature of timestamp string signed with user's private key in form of an array of 64 integer numbers.`,
        example: Array.from({ length: 64 }).map((unused, index) => index),
    }),
    ArraySize(64),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(0, { each: true }),
    (0, class_validator_1.Max)(255, { each: true }),
    __metadata("design:type", Array)
], LoginDto.prototype, "signature", void 0);
exports.LoginDto = LoginDto;
//# sourceMappingURL=login.dto.js.map