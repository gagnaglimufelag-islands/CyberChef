/**
 * PPM To BMP tests.
 *
 * @author YourName / AI Assistant
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "PPM To BMP: P3 (ASCII) 1x1 Red",
        recipeConfig: [{ op: "PPM To BMP", args: [] }, { op: "To Hex", args: ["None"] }],
        input: "P3\n1 1\n255\n255 0 0",
        expectedOutput: "424d3a0000000000000036000000280000000100000001000000010018000000000004000000000000000000000000000000000000000000ff00",
    },
    {
        name: "PPM To BMP: P3 (ASCII) MaxVal Scaling (15 to 255)",
        recipeConfig: [{ op: "PPM To BMP", args: [] }, { op: "To Hex", args: ["None"] }],
        input: "P3\n1 1\n15\n15 0 0",
        expectedOutput: "424d3a0000000000000036000000280000000100000001000000010018000000000004000000000000000000000000000000000000000000ff00",
    },
    {
        name: "PPM To BMP: P6 (Binary) 2x1 Blue/Green",
        recipeConfig: [{ op: "PPM To BMP", args: [] }],
        input: "P6\n2 1\n255\x0a\x00\x00\xff\x00\xff\x00",
        expectedOutput: "BM>\x00\x00\x00\x00\x00\x00\x006\x00\x00\x00(\x00\x00\x00\x02\x00\x00\x00\x01\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x08\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\x00\x00\x00\xff\x00\x00\x00"
    },
    {
        name: "PPM To BMP: Error - Invalid Magic Header",
        recipeConfig: [{ op: "PPM To BMP", args: [] }],
        input: "P7\n1 1\n255\n0 0 0",
        expectedOutput: "Unsupported format 'P7'. Only P3 and P6 are supported.",
    },
    {
        name: "PPM To BMP: Error - Non-numeric Header",
        recipeConfig: [{ op: "PPM To BMP", args: [] }],
        input: "P3\nWidth Height\n255\n0 0 0",
        expectedOutput: "Invalid PPM header values.",
    }
]);
