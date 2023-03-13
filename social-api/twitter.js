const { TwitterApi } = require("twitter-api-v2");

const fetchFromTwitterApi = async (id, query) => {
  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
  const readOnlyClient = twitterClient.readOnly;
  const userInfo = await readOnlyClient.v2.users(id, query);

  return userInfo.data[0];
};

module.exports = { fetchFromTwitterApi };