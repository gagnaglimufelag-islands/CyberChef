/**
 * @author YourName / AI Assistant
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * BMP to PPM operation
 */
class BMPToPPM extends Operation {

    /**
     * BMPToPPM constructor
     */
    constructor() {
        super();

        this.name = "BMP To PPM";
        this.module = "Image";
        this.description = "Converts a 24-bit or 32-bit Windows Bitmap (BMP) into a Netpbm color image (PPM). Supports outputting to Plaintext (P3) or Binary (P6) with custom MaxVal scaling.";
        this.infoURL = "https://wikipedia.org/wiki/BMP_file_format";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Format",
                type: "option",
                value: ["Binary (P6)", "Plaintext (P3)"]
            },
            {
                name: "Max Color Value",
                type: "number",
                value: 255
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        if (!input.byteLength) return new ArrayBuffer(0);

        const format = args[0];
        const maxVal = args[1];
        const isBinary = format === "Binary (P6)";

        const view = new DataView(input);

        // 1. Validate BMP Header
        if (view.getUint16(0) !== 0x424D) { // 'BM'
            throw new OperationError("Invalid BMP file: Magic bytes 'BM' not found.");
        }

        const dataOffset = view.getUint32(10, true);
        const width = view.getInt32(18, true);
        const height = Math.abs(view.getInt32(22, true)); // BMP height can be negative for top-down
        const bpp = view.getUint16(28, true);

        if (bpp !== 24 && bpp !== 32) {
            throw new OperationError(`Unsupported BMP bit depth: ${bpp}-bit. Only 24-bit and 32-bit are supported.`);
        }

        const bytesPerPixel = bpp / 8;
        const rowSize = width * bytesPerPixel;
        const padding = (4 - (rowSize % 4)) % 4;

        // 2. Build PPM Header
        const headerStr = `${isBinary ? "P6" : "P3"}\n${width} ${height}\n${maxVal}\n`;
        const headerBytes = new TextEncoder().encode(headerStr);

        // 3. Extract and Scale Pixel Data
        // BMP is stored Bottom-to-Top, BGR. PPM is Top-to-Bottom, RGB.
        const samples = []; // Used for P3 (ASCII)
        const binaryData = []; // Used for P6 (Binary)

        for (let y = height - 1; y >= 0; y--) {
            const rowStart = dataOffset + (y * (rowSize + padding));
            for (let x = 0; x < width; x++) {
                const p = rowStart + (x * bytesPerPixel);

                // Read BGR
                const b = view.getUint8(p);
                const g = view.getUint8(p + 1);
                const r = view.getUint8(p + 2);

                // Scale to user's maxVal (assuming BMP source is 0-255)
                const scale = (val) => Math.floor((val / 255) * maxVal);
                const rgb = [scale(r), scale(g), scale(b)];

                if (isBinary) {
                    // P6 Binary
                    if (maxVal < 256) {
                        binaryData.push(rgb[0], rgb[1], rgb[2]);
                    } else {
                        // 16-bit samples (Big-Endian)
                        binaryData.push(rgb[0] >> 8, rgb[0] & 0xFF);
                        binaryData.push(rgb[1] >> 8, rgb[1] & 0xFF);
                        binaryData.push(rgb[2] >> 8, rgb[2] & 0xFF);
                    }
                } else {
                    // P3 Plaintext
                    samples.push(rgb.join(" "));
                }
            }
        }

        // 4. Assemble Output
        if (isBinary) {
            const output = new Uint8Array(headerBytes.length + binaryData.length);
            output.set(headerBytes);
            output.set(binaryData, headerBytes.length);
            return output.buffer;
        } else {
            const contentStr = samples.join("\n");
            const finalBytes = new TextEncoder().encode(headerStr + contentStr);
            return finalBytes.buffer;
        }
    }
}

export default BMPToPPM;
