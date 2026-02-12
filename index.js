/*********************************
 * WHL MORNING GAMES BOT
 *********************************/

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

/*********************************
 * CONFIG
 *********************************/

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Optional test date via Railway ENV
// Example: TEST_DATE = 2026-02-12
function getTodayDate() {
  const testDate = process.env.TEST_DATE;

  if (testDate) {
    console.log("🧪 Using TEST_DATE:", testDate);
    return testDate;
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const realDate = `${yyyy}-${mm}-${dd}`;
  console.log("📅 Using REAL DATE:", realDate);
  return realDate;
}

/*********************************
 * DISCORD CLIENT
 *********************************/

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("clientReady", async () => {
  console.log("Morning Games Bot Ready");

  try {
    const today = getTodayDate();
    console.log("Date being used:", today);

    // 🔥 Example API (replace if needed)
    const url = `https://api-web.nhle.com/v1/score/${today}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.log("❌ API error:", res.status);
      process.exit(0);
    }

    const data = await res.json();

    if (!data.games || data.games.length === 0) {
      console.log("ℹ️ No games today");
      process.exit(0);
    }

    const gamesList = data.games.map(g => {
      return `• ${g.awayTeam.abbrev} @ ${g.homeTeam.abbrev}`;
    });

    const message =
      `📅 **Games for ${today}**\n\n` +
      gamesList.join("\n");

    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send(message);

    console.log("✅ Games posted successfully");
    process.exit(0);

  } catch (err) {
    console.error("❌ Bot error:", err);
    process.exit(1);
  }
});

/*********************************
 * LOGIN
 *********************************/

client.login(TOKEN);
