/*************************************************
 * MORNING WHL GAMES BOT (SAFE VERSION)
 *************************************************/

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

/**********************
 * ENV VARIABLES
 **********************/
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const TEST_DATE = process.env.TEST_DATE || null;

/**********************
 * SAFETY CHECKS
 **********************/
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing.");
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error("❌ CHANNEL_ID is missing.");
  process.exit(1);
}

/**********************
 * DISCORD CLIENT
 **********************/
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/**********************
 * GET DATE FUNCTION
 **********************/
function getRunDate() {
  if (TEST_DATE) {
    console.log("🧪 Using TEST_DATE:", TEST_DATE);
    return TEST_DATE;
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const today = `${yyyy}-${mm}-${dd}`;
  console.log("📅 Using TODAY:", today);
  return today;
}

/**********************
 * FETCH GAMES FROM CHL API
 **********************/
async function fetchGames(date) {
  try {
    const url = `https://chl.ca/whl/wp-json/wp/v2/game?per_page=100`;

    const res = await fetch(url);

    if (!res.ok) {
      console.log("❌ API returned status:", res.status);
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.log("❌ Unexpected API format");
      return [];
    }

    // Filter games by date string
    const gamesToday = data.filter(g =>
      g.date && g.date.startsWith(date)
    );

    return gamesToday;

  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    return [];
  }
}

/**********************
 * READY EVENT
 **********************/
client.once("clientReady", async () => {
  console.log("🤖 Morning Games Bot Ready");

  try {
    const date = getRunDate();
    const games = await fetchGames(date);

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      console.error("❌ Could not fetch channel.");
      process.exit(1);
    }

    if (!games.length) {
      console.log("ℹ️ No games found.");
      await channel.send(`📅 **${date}**\nNo WHL games today.`);
      process.exit(0);
    }

    let message = `📅 **WHL Games – ${date}**\n\n`;

    games.forEach(g => {
      const home = g.home_team_name || "Home";
      const away = g.away_team_name || "Away";
      message += `• ${away} @ ${home}\n`;
    });

    await channel.send(message);

    console.log("✅ Games posted successfully");
    process.exit(0);

  } catch (err) {
    console.error("❌ Bot error:", err);
    process.exit(1);
  }
});

/**********************
 * LOGIN
 **********************/
client.login(BOT_TOKEN);
