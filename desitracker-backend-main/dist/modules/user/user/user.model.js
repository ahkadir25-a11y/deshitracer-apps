"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// const mongoose = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
// const jwt = require("jsonwebtoken");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptHelper_1 = require("../../../utils/bcrypt/bcryptHelper");
const contactSchema = new mongoose_1.default.Schema({
    address: { type: String, trim: true },
    subArea: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
}, {
    _id: false,
});
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
    },
    userStatus: {
        type: String,
        enum: ['new', 'suspicious', 'verified'],
        default: 'new',
    },
    email: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [8, 'Password should be greater than 8 characters'],
        select: false,
    },
    phone: {
        type: String,
        required: [true, 'Please enter your phone number'],
        validate: [validator_1.default.isMobilePhone, 'Please enter a valid phone number'],
    },
    fbProfile: {
        type: String,
        trim: true,
    },
    profilePic: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'business_owner'],
            message: '{VALUE} is not a valid role. Allowed roles are: user, admin, business_owner.',
        },
        default: 'business_owner',
    },
    contact: {
        type: contactSchema,
    },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            Reflect.deleteProperty(ret, "password");
            return ret;
        },
    },
});
// Hash password before save
userSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = yield (0, bcryptHelper_1.hashPassword)(this.password);
        next();
    });
});
// Hash password before update
userSchema.pre('findOneAndUpdate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const update = this.getUpdate();
        if (update === null || update === void 0 ? void 0 : update.password) {
            update.password = yield (0, bcryptHelper_1.hashPassword)(update.password);
            this.setUpdate(update);
        }
        next();
    });
});
// static method to Compare Password
userSchema.statics.comparePassword = function (password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, hashedPassword);
    });
};
// Static method to find user by _id
userSchema.statics.isUserExists = function (id) {
    return this.findById(id);
};
// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email });
};
// Static method to find user by phone number
userSchema.statics.findByPhone = function (phone) {
    return this.findOne({ phone });
};
// Set profile picture URL
userSchema.methods.setProfilePictureUrl = function (url) {
    this.profilePic = url;
};
exports.User = mongoose_1.default.model('User', userSchema);
