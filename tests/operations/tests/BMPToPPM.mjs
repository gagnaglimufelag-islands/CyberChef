/**
 * BMP To PPM tests.
 *
 * @author YourName / AI Assistant
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "BMP To PPM: Binary (P6) 1x1 Red",
        recipeConfig: [{op: "BMP To PPM", args: ["Binary (P6)", 255]}],
        input: "BM:\x00\x00\x00\x00\x00\x00\x006\x00\x00\x00(\x00\x00\x00\x01\x00\x00\x00\x01\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\x00\x00",
        expectedOutput: "P6\n1 1\n255\n\xff\x00\x00"
    },
    {
        name: "BMP To PPM: Plaintext (P3) 1x1 Red",
        recipeConfig: [{op: "BMP To PPM", args: ["Plaintext (P3)", 255]}],
        input: "BM:\x00\x00\x00\x00\x00\x00\x006\x00\x00\x00(\x00\x00\x00\x01\x00\x00\x00\x01\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\x00\x00",
        expectedOutput: "P3\n1 1\n255\n255 0 0"
    },
    {
        name: "BMP To PPM: 32-bit BMP to P3",
        recipeConfig: [{op: "BMP To PPM", args: ["Plaintext (P3)", 255]}],
        // A 1x1 Blue BMP, 32-bit (RGBA, 4 bytes: ff 00 00 00)
        input: "BM>\x00\x00\x00\x00\x00\x00\x006\x00\x00\x00(\x00\x00\x00\x01\x00\x00\x00\x01\x00\x00\x00\x01\x00 \x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\x00\x00\x00",
        expectedOutput: "P3\n1 1\n255\n0 0 255"
    },
    {
        name: "BMP To PPM: Scale to MaxVal 15",
        recipeConfig: [{op: "BMP To PPM", args: ["Plaintext (P3)", 15]}],
        input: "BM:\x00\x00\x00\x00\x00\x00\x006\x00\x00\x00(\x00\x00\x00\x01\x00\x00\x00\x01\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\x00\x00",
        expectedOutput: "P3\n1 1\n15\n15 0 0"
    },
    {
        name: "BMP To PPM: Error - Invalid Magic Bytes",
        recipeConfig: [{op: "BMP To PPM", args: ["Binary (P6)", 255]}],
        input: "NOTABMP",
        expectedOutput: "Invalid BMP file: Magic bytes 'BM' not found."
    }
]);
