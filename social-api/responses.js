const { MongoClient } = require("mongodb");
const { TwitterApi } = require("twitter-api-v2");
require('dotenv').config();


const fetchFromDatabase = async (collectionName, param, paramValue) => {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    const database = client.db("mixit");
    const collection = database.collection(collectionName);
    const data = await collection.findOne({ [param]: paramValue });
    return data;
  } catch (error) {
    console.error(error);     // Debugging purposes
    throw new Error("Failed to fetch data from database");
  } finally {
    await client.close();
  }
};
  
const handleUserResponse = async (req, res) => {
  const requiredFields = ['uuid', 'username', 'name', 'external_information'];
  const param = Object.keys(req.params)[0];

  try {
    const invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }
    
    const queryHandlerResult = await queryHandler(req, res, ["user.fields"], {"user.fields": ["location", "created_at", "public_metrics"]});
    if (queryHandlerResult === 'response_sent') {
      return;
    }

    const data = await fetchFromDatabase("users", param, req.params[param]);
    if (!data) {
      userNotFoundHandler(req, res, param);
      return;
    }

    const requestParams = requiredFields.concat(Object.keys(req.query).length > 0 ? req.query["user.fields"].split(",") : []);
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => requestParams.includes(key))
    );

    return res.status(200).json({ data: filteredData });
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

const invalidUserHandler = async (req, res, param) => {
  try {
    // if param is username and the value doesnt match the regex ^[A-Za-z0-9_]{1,15}$, return error
    if (param === "username" && !req.params[param].match(/^[A-Za-z0-9_]{1,15}$/)) throw new Error("Invalid username");

    // if param is uuid and the value contains letters, return error
    if (param === "uuid" && req.params[param].match(/[a-zA-Z]/)) throw new Error("Invalid uuid");

    return
  } catch (error) {
    console.log(error);   // Debugging purposes
    res.status(400).json({
      errors: [{
        parameters: {
          [param]: [req.params[param]]
        },
        message: "The `" + param + "` query parameter value [" + req.params[param] +"] is not valid"
      }],
      title: "Invalid Request",
      detail: "One or more parameters to your request was invalid.",
    });

    return 'response_sent';
  }
};

const userNotFoundHandler = async (req, res, param) => {
  res.status(200).json({
    errors: [{
      parameters: {
        value: [req.params[param]]
      }
    }],
    detail: "Could not find user with "+ param + ": [" + req.params[param] + "].",
    title: "Not Found Error",
    parameter: param,
    resource_type: "user"
  });
};

const queryHandler = async (req, res, queryKeys, queryValues) => {
  const queryErrorStack = [];

  if (Object.keys(req.query).length > 0) {
    for (let i in Object.keys(req.query)) {
      let key = Object.keys(req.query)[i];

      // Check if they is on queryKeys list
      if (!queryKeys.includes(key)) {
        queryErrorStack.push(
          {
            parameters: {
              [key]: [req.query[key]]
            },
            message: "The query parameter [" + key +"] is not one of [user.fields]"
          }
        );
      } else {
        let values = req.query[key].split(',');

         // Check if value for the valid key is on queryValues dict
        for (let j in values) {
          if (!queryValues[key].includes(values[j])) {
            queryErrorStack.push(
              {
                parameters: {
                  [key]: [req.query[key]]
                },
                message: "The `" + key + "` query parameter value [" + values[j] + "] is not one of [" + queryValues[key] +"]"
              }
            );
          }
        }
      }
    }
  }
  
  // If the query stack has something then an error occured
  if (queryErrorStack.length > 0) {
    res.status(400).json({
      errors: queryErrorStack,
      title: "Invalid Request",
      detail: "One or more parameters to your request was invalid.",
    });

    return 'response_sent';
  }

  return null
};

const userFollowHandler = async (req, res, type) => {
  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
  const readOnlyClient = twitterClient.readOnly;
  const param = Object.keys(req.params)[0];

  try {
    const invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }

    const data = await fetchFromDatabase("users", param, req.params[param]);
    if (!data) {
      userNotFoundHandler(req, res, param);
      return;
    }

    let followInfo;
    if (type === "followers") {
      followInfo = await readOnlyClient.v2.followers(data.external_information.id, { max_results: 10 });
    } else if (type === "following") {
      followInfo = await readOnlyClient.v2.following(data.external_information.id, { max_results: 10 });
    }

    res.status(200).json(followInfo);
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

module.exports = { handleUserResponse, userFollowHandler };  
