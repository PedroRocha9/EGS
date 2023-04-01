const { TwitterApi } = require("twitter-api-v2");

const fetchFromTwitter = async (key, id, query, next_token) => {
  let twitterApiResponse;

  try {
    if (key === "external_information") {
      const twitterUserResult = await fetchUserFromTwitter(id, query);
      twitterApiResponse = { twitter_name: twitterUserResult.name, twitter_username: twitterUserResult.username };
    }

    if (key === "public_metrics") {
      const twitterUserResult = await fetchUserFromTwitter(id, query);
      twitterApiResponse = { followers_count: twitterUserResult.public_metrics.followers_count, following_count: twitterUserResult.public_metrics.following_count };
    }

    if (key === "followers") {
      const twitterFollowersResult = await fetchFollowersFromTwitter(id, query, next_token);
      twitterApiResponse = twitterFollowersResult;
    }

    if (key === "following") {
      const twitterFollowingResult = await fetchFollowingFromTwitter(id, query, next_token);
      twitterApiResponse = twitterFollowingResult;
    }

    if (key === "user_tweets") {
      const twitterTweetsResult = await fetchUserTweetsFromTwitter(id, query, next_token);
      twitterApiResponse = twitterTweetsResult;
    }

    return twitterApiResponse;
 } catch(error) {
    console.log('Twitter API had an error with the returned response', error);
  }
};

const fetchUserFromTwitter = async (id, query) => {
  try {
    const userInfo = await readOnlyClient.v2.users(id, query, {});
    return userInfo.data[0];
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
};

const fetchFollowersFromTwitter = async (id, query, next_token) => {
  try {
    if (next_token !== undefined) query = { ...query, 'pagination_token': next_token };
    
    const followerInfo = await readOnlyClient.v2.followers(id, query);

    return { data: followerInfo.data, next_token: followerInfo.meta.next_token };
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
};

const fetchFollowingFromTwitter = async (id, query, next_token) => {
  try {
    if (next_token !== undefined) query = { ...query, 'pagination_token': next_token };

    const followerInfo = await readOnlyClient.v2.followers(id, query);
    return { data: followerInfo.data, next_token: followerInfo.meta.next_token };
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
};

const fetchUserTweetsFromTwitter = async (id, query, next_token) => {
  let queries = { exclude: 'replies', expansions: 'attachments.media_keys', 'media.fields': ['url', 'preview_image_url']};
  try {
    if (next_token !== undefined) queries = { ...queries, 'pagination_token': next_token };
    const userTweets = await readOnlyClient.v2.userTimeline(id, queries);

    // Iterate over tweets
    userTweets.data.data.forEach(tweet => {
      // If tweet has media
      if ('attachments' in tweet) {
        // Iterate over media keys
        tweet.attachments.media_keys.forEach(key => {
          // Get media object
          const media = userTweets.includes.media.find(media => media.media_key === key);
          // If media is a video
          // if (media.type === 'video') {
          //   // Get video info
          //   const videoInfo = await readOnlyClient.v2.media(media.media_key);
          //   // Add video info to tweet
          //   tweet.videoInfo = videoInfo;
          // }
          if (media.type === 'video') {
            // Add video url to tweet
            if ("preview_urls" in tweet) {
              tweet.preview_urls.push(media.preview_image_url);
            } else {
              tweet.preview_urls = [media.preview_image_url];
            }
          }

          // If media is a photo
          if (media.type === 'photo') {
            // Add photo url to tweet
            if ("photo_urls" in tweet) {
              tweet.photo_urls.push(media.url);
            } else {
              tweet.photo_urls = [media.url];
            }
          }
        });
      }
      
      // Remove attachments and edit history from tweet
      delete tweet.attachments;
      delete tweet.edit_history_tweet_ids;
    });

    // Remove unwanted meta information
    delete userTweets.meta.newest_id;
    delete userTweets.meta.oldest_id;
    delete userTweets.meta.result_count;
    
    let tweets = { data: userTweets.data.data};
    if ('next_token' in userTweets.meta) tweets.next_token = userTweets.meta.next_token;
    
    return tweets;
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
};

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const readOnlyClient = twitterClient.readOnly;

module.exports = { fetchFromTwitter };
