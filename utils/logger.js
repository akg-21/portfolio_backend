import fs from "fs";
import path from "path";

const IS_VERCEL = !!process.env.VERCEL; // "1" on deployed Vercel, undefined locally
const LOG_FILE  = path.resolve("error.log");

/**
 * Writes a log entry.
 * - Local:      appends to error.log file + console
 * - Production: console only (Vercel filesystem is ephemeral)
 */
export function writeLog(message) {
    const time  = new Date().toISOString();
    const entry = `[${time}] ${message}`;

    console.log(entry);

    if (!IS_VERCEL) {
        try {
            fs.appendFileSync(LOG_FILE, entry + "\n");
        } catch (e) {
            console.error("[logger] Could not write to log file:", e.message);
        }
    }
}
