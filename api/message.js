import dotenv from "dotenv";
import { writeLog } from "../utils/logger.js";

dotenv.config();

const ALLOWED_ORIGIN = "https://akg-21.vercel.app";

// ── Telegram notification ─────────────────────────────────────────────────────
async function sendTelegramMessage(message) {
    await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "HTML"
            })
        }
    );
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    const origin = req.headers["origin"] || "none";
    const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    const method = req.method;

    // ── Block unauthorized origins ────────────────────────────────────────────
    if (origin !== ALLOWED_ORIGIN && method !== "OPTIONS") {
        return res.status(403).json({ error: "Forbidden: unauthorized origin." });
    }

    // ── Set CORS headers for allowed origin ───────────────────────────────────
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        return res.status(200).end();
    }

    if (method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const telegramText = `✉️ <b>New Contact Message</b>\n\n` +
                             `👤 <b>Name:</b> ${name}\n` +
                             `📧 <b>Email:</b> ${email}\n\n` +
                             `💬 <b>Message:</b>\n${message}\n\n` +
                             `🌐 <b>Origin:</b> ${origin}\n` +
                             `🖥 <b>IP:</b> ${ip}`;

        await sendTelegramMessage(telegramText);

        writeLog(`MESSAGE SENT | origin=${origin} ip=${ip} email=${email}`);
        
        return res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        writeLog(`ERROR | ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}
