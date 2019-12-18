require("babel-polyfill");
require("isomorphic-fetch");

if (!global.WebSocket) {
  global.WebSocket = require("ws");
}

const { Client4 } = require("mattermost-redux/client");

Client4.setUrl(process.env.MATTERMOST_URL);
Client4.setToken(process.env.MATTERMOST_TOKEN);

const mattermostEmailsByGithubUsername = Object.entries(process.env).reduce((acc, [key, value]) => {
  if (key.includes("GH_USERNAME___")) {
    acc[key.replace("GH_USERNAME___", "")] = value;
  }
  return acc;
}, {});

const getMattermostUserByGithubHandle = async (githubHandle) => {
  const userEmail = mattermostEmailsByGithubUsername[githubHandle];

  if (!userEmail) {
    return;
  }

  const user = await Client4.getUserByEmail(userEmail);

  return user;
};

const createDirectBotCommunicationChannel = async (userId) => {
  const bot = await Client4.getMe();

  const directChannel = await Client4.createDirectChannel([bot.id, userId]);

  return directChannel;
};

const greetings = [
  "What it do buckaroo",
  "Greetings, animated being",
  "<insert office whazzaaaa gif>",
  "Hellooo",
  "Ahoy",
  "G'day",
  "Greetings",
  "Hello",
  "Hey there",
  "Hey",
  "Hi there",
  "Hi",
  "Hiya",
  "How are things",
  "How are ya",
  "How ya doin'",
  "How's it goin'",
  "How's it going",
  "How's life",
  "Howdy",
  "Sup",
  "What's new",
  "What's up",
  ":wave:",
];

const getGreeting = () => {
  return greetings[Math.floor(Math.random() * greetings.length)];
};

const notifyUser = async ({ reminder, commentUrl }) => {
  const user = await getMattermostUserByGithubHandle(reminder.who);
  if (!user) {
    return;
  }

  try {
    const channel = await createDirectBotCommunicationChannel(user.id);

    await Client4.createPost({
      channel_id: channel.id,
      message: `${getGreeting()} ${user.first_name || user.username}, do you remember that you wanted to ${reminder.what}\n ${commentUrl}`,
    });
  } catch (error) {
    throw new Error(`Could not notify  user: ${user.username}, reason: ${error.message}`);
  }
};

module.exports = {
  notifyUser,
};
