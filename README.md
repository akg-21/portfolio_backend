# Portfolio Backend

This repository contains the serverless backend API for my personal portfolio website. It is built using Node.js and designed to be deployed on Vercel as Serverless Functions.

## Features

- **GitHub Integration:** Connects to the GitHub GraphQL API to fetch user profile data, top public repositories, and a contribution calendar.
- **Contact Form Handling:** Processes messages from the portfolio contact form.
- **Telegram Notifications:** Automatically sends alerts to a configured Telegram chat for new contact messages and unauthorized API access attempts.
- **Security:** Implements CORS to restrict access only to allowed frontend origins and logs requests/errors.

## Tech Stack

- Node.js (ES Modules)
- Vercel Serverless Functions
- GitHub GraphQL API
- Telegram Bot API
- `dotenv` for local environment variable management

## Prerequisites

To run this backend locally or deploy it, you will need the following environment variables. Create a `.env` file in the root directory and add:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
GITHUB_TOKEN=your_github_personal_access_token
```

## API Endpoints

### `GET /api/github`
Fetches GitHub profile and contribution data.
- **Query Parameters:**
  - `year` (optional): If provided, returns the contribution calendar for the specified year.
- **Access Control:** Restricted by CORS to specific allowed origins.
- **Notifications:** Triggers a Telegram alert upon successful access or unauthorized attempts.

### `POST /api/message`
Receives contact form submissions.
- **Request Body:** Requires `name`, `email`, and `message`.
- **Action:** Sends a formatted HTML message to the configured Telegram chat.
- **Access Control:** Restricted by CORS.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure your `.env` file is set up.
3. You can use Vercel CLI for local development to simulate the serverless environment:
   ```bash
   npm i -g vercel
   vercel dev
   ```

## Deployment

This project is pre-configured to be deployed on Vercel. 
The `vercel.json` configuration file ensures the root directory is used for serverless function deployments.

```bash
vercel --prod
```
