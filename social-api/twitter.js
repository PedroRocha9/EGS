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
      const twitterTweetsResult = await fetchUserTweetsFromTwitter(id, next_token);
      twitterApiResponse = twitterTweetsResult;
    }

    if (key === "timeline") {
      const twitterTimelineResult = await fetchTimelineFromTwitter(id, next_token);
      twitterApiResponse = twitterTimelineResult;
    }

    if (key == "tweet") {
      const twitterTweetResult = await fetchTweetFromTwtitter(id);
      twitterApiResponse = twitterTweetResult;
    }

    if (key == "replies") {
      const twitterTweetResult = await fetchTweetRepliesFromTwitter(id, next_token);
      twitterApiResponse = twitterTweetResult;
    }

    return twitterApiResponse;
 } catch (error) {
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

const fetchUserTweetsFromTwitter = async (id, next_token) => {
  let queries = { 
    'expansions': ['attachments.media_keys', 'author_id', 'referenced_tweets.id'],
    'media.fields': ['url', 'preview_image_url'],
    'user.fields': ['profile_image_url', 'username'],
    'tweet.fields': ['public_metrics', 'created_at', 'conversation_id']
  };

  try {
    if (next_token !== undefined) queries = { ...queries, 'pagination_token': next_token };
    const userTweets = await readOnlyClient.v2.userTimeline(id, queries);

    // Iterate over tweets
    const parsedTweets = await Promise.all(userTweets.data.data.map(async tweet => {
      return await parseTweetsData(tweet, userTweets, false);
    }));

    userTweets.data.data = parsedTweets;

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

const fetchTimelineFromTwitter = async (id, next_token) => {
  let queries = {
    'expansions': ['attachments.media_keys', 'author_id', 'referenced_tweets.id'],
    'media.fields': ['url', 'preview_image_url'],
    'user.fields': ['profile_image_url', 'username'],
    'tweet.fields': ['public_metrics', 'created_at', 'conversation_id']
  };

  try {
    if (next_token !== undefined) queries = { ...queries, 'pagination_token': next_token };
    const homeTimeline = await userClient.v2.homeTimeline(queries);

    // Iterate over tweets
    for (let i = 0; i < homeTimeline.data.data.length; i++) {
      homeTimeline.data.data[i] = await parseTweetsData(homeTimeline.data.data[i], homeTimeline, false);
    }

    // Remove unwanted meta information
    delete homeTimeline.meta.newest_id;
    delete homeTimeline.meta.oldest_id;
    delete homeTimeline.meta.result_count;
    
    let tweets = { data: homeTimeline.data.data};
    if ('next_token' in homeTimeline.meta) tweets.next_token = homeTimeline.meta.next_token;
    
    return tweets;
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
}

const fetchTweetFromTwtitter = async (id) => {
  try {
    let tweet = await readOnlyClient.v2.singleTweet(id, { 
      'expansions': ['attachments.media_keys', 'author_id', 'referenced_tweets.id'],
      'media.fields': ['url', 'preview_image_url'],
      'user.fields': ['profile_image_url', 'username'],
      'tweet.fields': ['public_metrics', 'created_at', 'conversation_id']
    });

    tweet = parseTweetsData(tweet.data, tweet, false);

    return tweet
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
}

const fetchOriginalTweetFromTwtitter = async (id) => {
  try {
    let tweet = await readOnlyClient.v2.singleTweet(id, { 
      'expansions': ['attachments.media_keys', 'author_id', 'referenced_tweets.id'],
      'media.fields': ['url', 'preview_image_url'],
      'user.fields': ['profile_image_url', 'username'],
      'tweet.fields': ['public_metrics', 'created_at', 'conversation_id']
    });

    tweet = parseTweetsData(tweet.data, tweet, true);

    return tweet
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
}

const fetchTweetRepliesFromTwitter = async (id, next_token) => {
  let queries = { 
    'expansions': ['attachments.media_keys', 'author_id'],
    'media.fields': ['url', 'preview_image_url'],
    'user.fields': ['profile_image_url', 'username'],
    'tweet.fields': ['public_metrics', 'created_at']
  };

  try {
    if (next_token !== undefined) queries = { ...queries, 'pagination_token': next_token };
    let replies = await readOnlyClient.v2.search('conversation_id:' + id, queries);

    // no replies found
    if (Object.keys(replies.data).length < 2) return { data : [] };

    // Iterate over tweets
    for (let i = 0; i < replies.data.data.length; i++) {
      replies.data.data[i] = await parseTweetsData(replies.data.data[i], replies);
    }

    // Remove unwanted meta information
    delete replies.meta.newest_id;
    delete replies.meta.oldest_id;
    delete replies.meta.result_count;
    
    let tweets = { data: replies.data.data};
    if ('next_token' in replies.meta) tweets.next_token = replies.meta.next_token;
    
    return tweets;
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
}

const parseTweetsData = async (tweet, tweetBase, original) => {
  try {
    if ('attachments' in tweet) {
      tweet.attachments.media_keys.forEach(key => {
        // Get media object
        const media = tweetBase.includes.media.find(media => media.media_key === key);
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

    // Add referenced tweet information if it's a quote tweet
    if ('referenced_tweets' in tweet && !original) {
      // console.log('referenced_tweets');
      const originalTweet = await fetchOriginalTweetFromTwtitter(tweet.referenced_tweets[0].id);
      // console.log('originalTweet');
      // console.log(originalTweet);

      tweet.referenced_tweet = { originalTweet };
      delete tweet.referenced_tweets;
    }
    
    tweet.author_info = {};
    tweet.author_info.username = tweetBase.includes.users[0].username;
    tweet.author_info.name = tweetBase.includes.users[0].name;
    tweet.author_info.profile_image = tweetBase.includes.users[0].profile_image_url;
  
    delete tweet.author_id;
    delete tweet.edit_history_tweet_ids;
    delete tweet.attachments;
  
    // console.log('tweet');
    // console.log(tweet);
    return tweet;
  } catch (error) {
    console.log('Twitter API had an error while fetching info', error);
  }
}

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const readOnlyClient = twitterClient.readOnly;
const userClient =  new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_TOKEN_SECRET,
});


module.exports = { fetchFromTwitter };
