const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BigInt(62);

/**
 * Encode a BigInt or number to Base62 string
 * @param {number|bigint} num - The number to encode
 * @returns {string} - The Base62 encoded string
 */
function encode(num) {
    let value = BigInt(num);
    if (value === 0n) return CHARSET[0];

    let encoded = '';
    while (value > 0n) {
        const remainder = value % BASE;
        encoded = CHARSET[Number(remainder)] + encoded;
        value = value / BASE;
    }
    return encoded;
}

/**
 * Decode a Base62 string to BigInt
 * @param {string} str - The Base62 string
 * @returns {bigint} - The decoded number as BigInt
 */
function decode(str) {
    let decoded = 0n;
    for (let i = 0; i < str.length; i++) {
        const charIndex = CHARSET.indexOf(str[i]);
        if (charIndex === -1) {
             throw new Error("Invalid Base62 character");
        }
        decoded = decoded * BASE + BigInt(charIndex);
    }
    return decoded;
}

/**
 * Pad Base62 string to minimum length
 * @param {string} str - The Base62 string
 * @param {number} length - Minimum length
 * @returns {string}
 */
function pad(str, length) {
    while (str.length < length) {
        str = CHARSET[0] + str;
    }
    return str;
}

export { encode, decode, pad, CHARSET };
