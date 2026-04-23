"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToSlug = stringToSlug;
function stringToSlug(input) {
    return input
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    // const uid = Math.floor(Math.random() * 0x10000)
    //   .toString(16)
    //   .padStart(4, '0');
    // return `${slug}-${uid}`;
}
