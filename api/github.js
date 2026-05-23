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

    const origin     = req.headers["origin"] || "none";
    const ip         = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    const method     = req.method;
    const userAgent  = req.headers["user-agent"] || "unknown";
    const path       = req.url || "/api/github";
    const referer    = req.headers["referer"] || "none";

    // ── Block unauthorized origins ────────────────────────────────────────────
    if (origin !== ALLOWED_ORIGIN && method !== "OPTIONS") {
        const msg = `UNAUTHORIZED | origin=${origin} method=${method} path=${path} ip=${ip} referer=${referer} ua=${userAgent}`;
        writeLog(msg);
        sendTelegramMessage(
            `🚨 <b>Unauthorized API Request</b>\n\n` +
            `🌐 <b>Origin:</b> ${origin}\n` +
            `📡 <b>Method:</b> ${method}\n` +
            `🔗 <b>Path:</b> ${path}\n` +
            `🖥 <b>IP:</b> ${ip}\n` +
            `🔍 <b>Referer:</b> ${referer}\n` +
            `📱 <b>User-Agent:</b> ${userAgent}`
        ).catch(() => {});

        return res.status(403).json({ error: "Forbidden: unauthorized origin." });
    }

    // ── Set CORS headers for allowed origin ───────────────────────────────────
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        return res.status(200).end();
    }

    const year = req.query?.year ? parseInt(req.query.year) : null;

    try {

        // Log + fire access notification (non-blocking)
        writeLog(`ACCESS | origin=${origin} path=${path} ip=${ip}`);
        sendTelegramMessage(
            `✅ <b>Portfolio API Accessed</b>\n\n` +
            `🌐 <b>Origin:</b> ${origin}\n` +
            `🔗 <b>Path:</b> ${path}\n` +
            `🖥 <b>IP:</b> ${ip}`
        ).catch(() => {});

        // ── Year-specific: contribution calendar only ─────────────────────────
        if (year) {
            const from = `${year}-01-01T00:00:00Z`;
            const to   = `${year}-12-31T23:59:59Z`;

            const query = `
              query {
                user(login: "akg-21") {
                  contributionsCollection(from: "${from}", to: "${to}") {
                    contributionCalendar {
                      totalContributions
                      weeks {
                        contributionDays {
                          contributionCount
                          date
                        }
                      }
                    }
                  }
                }
              }
            `;

            const response = await fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            return res.status(200).json(data);
        }

        // ── Default: user profile + repos + current-year contributions ─────────
        const query = `
          query {
            user(login: "akg-21") {

              name
              bio
              avatarUrl

              repositories(first: 10, privacy: PUBLIC, orderBy: { field: UPDATED_AT, direction: DESC }) {
                nodes {
                  name
                  description
                  stargazerCount
                  url
                  primaryLanguage {
                    name
                    color
                  }
                  forkCount
                }
              }

              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }

            }
          }
        `;

        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        writeLog(`ERROR | ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
}