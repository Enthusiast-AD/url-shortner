// Implementation of Twitter Snowflake Algorithm for unique ID generation
// This is used to generate unique short IDs for URLs in a distributed system without collisions.

const EPOCH = 1704067200000n; // Custom Epoch (Jan 1, 2024)
const MACHINE_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;

const MAX_MACHINE_ID = -1n ^ (-1n << MACHINE_ID_BITS); // 1023
const MAX_SEQUENCE = -1n ^ (-1n << SEQUENCE_BITS);     // 4095

const MACHINE_ID_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS;

let lastTimestamp = -1n;
let sequence = 0n;

/**
 * Generate a unique ID based on Snowflake algorithm
 * @param {number} machineId - Unique ID for this machine instance (0-1023)
 * @returns {bigint} - The generated unique ID
 */
export function generate(machineId) {
    machineId = BigInt(machineId) & MAX_MACHINE_ID;
    
    let timestamp = BigInt(Date.now());

    if (timestamp < lastTimestamp) {
        throw new Error("Clock moved backwards. Refusing to generate id");
    }

    if (timestamp === lastTimestamp) {
        sequence = (sequence + 1n) & MAX_SEQUENCE;
        if (sequence === 0n) {
            // Sequence overflow, wait for next millisecond
            while (timestamp <= lastTimestamp) {
                timestamp = BigInt(Date.now());
            }
        }
    } else {
        sequence = 0n;
    }

    lastTimestamp = timestamp;

    return ((timestamp - EPOCH) << TIMESTAMP_SHIFT) | 
           (machineId << MACHINE_ID_SHIFT) | 
           sequence;
}