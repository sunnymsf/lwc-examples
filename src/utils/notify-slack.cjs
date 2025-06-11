const axios = require('axios');

const {
  ENVIRONMENT,
  CONTENT_APP_URL,
  HEROKU_APP_DEFAULT_DOMAIN_NAME,
  HEROKU_APP_NAME,
  SLACK_WEBHOOK_URL,
  SLACK_GROUP_ID
} = process.env;

const success = async () => {
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `:rocket: *${ENVIRONMENT} Deployment Successful!* (Please check in 5 mins)`,
      attachments: [
        {
          text: "Click below to open the app:",
          fallback: "View the deployed app",
          actions: [
            {
              type: "button",
              text: ":link: Playground APP",
              url: `https://${HEROKU_APP_DEFAULT_DOMAIN_NAME}`,
              style: "primary"
            },
            {
              type: "button",
              text: ":scroll: View Logs (Support Only)",
              url: `https://dashboard.heroku.com/apps/${HEROKU_APP_NAME}/logs`,
              style: "default"
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error("[ERROR] Failed to send Slack notification, but continuing with the next steps.");
  }
};

const fail = async () => {
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `:alert_spin: *${ENVIRONMENT} Deployment failed!*`,
      attachments: [
        {
          text: `<!subteam^${SLACK_GROUP_ID}> have a look, Click below to view the activity:`,
          fallback: "View the logs:",
          actions: [
            {
              type: "button",
              text: ":scroll: View Activity (Support Only)",
              url: `https://dashboard.heroku.com/apps/${HEROKU_APP_NAME}/activity`,
              style: "danger"
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error("[ERROR] Failed to send Slack notification, but continuing with the next steps.");
  }
};

const main = async (exitCode) => {
  if (!ENVIRONMENT || !CONTENT_APP_URL || !HEROKU_APP_DEFAULT_DOMAIN_NAME || !HEROKU_APP_NAME || !SLACK_WEBHOOK_URL || !SLACK_GROUP_ID) {
    console.warn("[WARN] Skipping the Slack notification as one or more required environment variables are not set.");
    return;
  }

  if (exitCode === 0) {
    await success();
  } else {
    await fail();
  }
};

// Usage function to display how to use the script
function showUsage() {
  console.log("Usage: node notify-slack.cjs <EXITCODE>");
}

// Check if an argument is provided
if (process.argv.length < 3) {
  console.log("Error: Missing argument.");
  showUsage();
} else {
  const exitCode = parseInt(process.argv[2], 10);
  main(exitCode);
}

