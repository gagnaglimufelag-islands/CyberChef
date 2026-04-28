/**
 * @author The universe
 * @copyright None
 * @license Public Domain
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * PPM to BMP operation
 */
class PPMToBMP extends Operation {

    /**
     * PPMToBMP constructor
     */
    constructor() {
        super();

        this.name = "PPM To BMP";
        this.module = "Image";
        this.description = "Converts Netpbm color images (PPM) in both ASCII (P3) and Binary (P6) formats to 24-bit Windows Bitmap (BMP) images. Supports arbitrary MaxVal scaling and 16-bit binary samples.";
        this.infoURL = "https://wikipedia.org/wiki/Netpbm#PPM_format";
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        if (!input.length) return new ArrayBuffer(0);

        let offset = 0;

        /**
         * Helper to get the next "token" from the file, skipping comments.
         */
        const readToken = () => {
            let str = "";
            while (offset < input.length) {
                const char = input[offset++];

                if (char === "#") {
                    while (offset < input.length && input[offset++] !== "\n");
                    continue;
                }

                if (/\s/.test(char)) {
                    if (str.length > 0) break;
                    continue;
                }
                str += char;
            }
            return str;
        };

        // 1. Parse Header
        const magic = readToken();
        if (magic !== "P3" && magic !== "P6") {
            throw new OperationError(`Unsupported format '${magic}'. Only P3 and P6 are supported.`);
        }

        const width = parseInt(readToken(), 10);
        const height = parseInt(readToken(), 10);
        const maxVal = parseInt(readToken(), 10);

        if (isNaN(width) || isNaN(height) || isNaN(maxVal) || maxVal <= 0) {
            throw new OperationError("Invalid PPM header values.");
        }

        // 2. Normalize Pixel Data to 8-bit RGB
        const numSamples = width * height * 3;
        const rgbData = new Uint8Array(numSamples);

        if (magic === "P6") {
            // Binary logic: MaxVal >= 256 means 2 bytes per sample (Big-Endian)
            const bytesPerSample = maxVal < 256 ? 1 : 2;

            for (let i = 0; i < numSamples; i++) {
                let val = 0;
                for (let b = 0; b < bytesPerSample; b++) {
                    if (offset >= input.length) break;
                    val = (val << 8) | (input.charCodeAt(offset++) & 0xFF);
                }
                // Scale to 0-255
                rgbData[i] = Math.floor((val / maxVal) * 255);
            }
        } else {
            // ASCII logic
            for (let i = 0; i < numSamples; i++) {
                const token = readToken();
                if (token === "") break;
                const val = parseInt(token, 10);
                // Scale to 0-255
                rgbData[i] = Math.floor((val / maxVal) * 255);
            }
        }

        // 3. BMP Setup
        const rowSize = width * 3;
        const padding = (4 - (rowSize % 4)) % 4;
        const paddedRowSize = rowSize + padding;
        const pixelDataSize = paddedRowSize * height;
        const fileSize = 54 + pixelDataSize;

        const output = new Uint8Array(fileSize);
        const view = new DataView(output.buffer);

        // 4. BMP Header (Little Endian)
        output[0] = 0x42; // B
        output[1] = 0x4D; // M
        view.setUint32(2, fileSize, true);
        view.setUint32(10, 54, true);
        view.setUint32(14, 40, true);
        view.setUint32(18, width, true);
        view.setUint32(22, height, true);
        view.setUint16(26, 1, true);
        view.setUint16(28, 24, true);
        view.setUint32(34, pixelDataSize, true);

        // 5. Convert & Flip (Top-to-Bottom PPM to Bottom-to-Top BMP)
        let outputIdx = 54;
        for (let y = height - 1; y >= 0; y--) {
            const rowStart = y * width * 3;
            for (let x = 0; x < width; x++) {
                const i = rowStart + (x * 3);
                // RGB to BGR
                output[outputIdx++] = rgbData[i + 2]; // B
                output[outputIdx++] = rgbData[i + 1]; // G
                output[outputIdx++] = rgbData[i];     // R
            }
            for (let p = 0; p < padding; p++) {
                output[outputIdx++] = 0;
            }
        }

        return output.buffer;
    }
}

export default PPMToBMP;
