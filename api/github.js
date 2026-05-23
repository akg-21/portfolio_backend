import dotenv from "dotenv";

dotenv.config();    
export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    try {

        const query = `
      query {
        user(login: "akg-21") {

          name
          bio
          avatarUrl

          repositories(first: 10, privacy: PUBLIC) {
            nodes {
              name
              description
              stargazerCount
              url
            }
          }

          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `;

        const response = await fetch(
            "https://api.github.com/graphql",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    query
                })
            }
        );

        const data = await response.json();

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}