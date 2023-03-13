const { MongoClient } = require("mongodb");
const { publishMessage, fetchFromCache } = require("./cache");
require('dotenv').config();


const fetchFromDatabase = async (collectionName, param, paramValue, dbQuery) => {
  const mongoClient = new MongoClient("mongodb://localhost:27017");
  
  try {
    await mongoClient.connect();
    const database = mongoClient.db("mixit");
    const collection = database.collection(collectionName);
    let data = await collection.findOne({ [param]: paramValue });
    
    if (data) {
      // Filtering for database local fields
      data = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => dbQuery.includes(key))
      );
    }

    return data;
  } catch (error) {
    console.error(error);     // Debugging purposes
    throw new Error("Failed to fetch data from database");
  } finally {
    await mongoClient.close();    
  }
};
  
const handleUserResponse = async (req, res) => {
  const requiredFields = ['uuid', 'username', 'name', 'external_information'];
  const param = Object.keys(req.params)[0];
  const query = req.query;

  try {
    const invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }
    
    const queryHandlerResult = await queryHandler(req, res, ["user.fields"], {"user.fields": ["location", "created_at", "public_metrics"]});
    if (queryHandlerResult === 'response_sent') {
      return;
    }

    let dbQuery = requiredFields;
    let cacheQuery = [];

    if (Object.keys(query).length > 0) {
      query["user.fields"].split(",").forEach(element => {
        if (element === "location" || element === "created_at") {
          dbQuery.push(element);
        } else {
          cacheQuery.push(element);
        }
      });
    }

    let data = await fetchFromDatabase("users", param, req.params[param], dbQuery, cacheQuery);
    if (!data) {
      userNotFoundHandler(req, res, param);
      return;
    }
    
    if (cacheQuery.length > 0) {
      publicMetricsCache = await fetchFromCache('public_metrics', data.external_information.id, { 'user.fields': 'public_metrics' });
      data["public_metrics"] = JSON.parse(publicMetricsCache);
    }

    externalInfoCache = await fetchFromCache('external_information', data.external_information.id, { 'user.fields': '' });

    data["external_information"]["twitter_name"] = JSON.parse(externalInfoCache).twitter_name;
    data["external_information"]["twitter_username"] = JSON.parse(externalInfoCache).twitter_username;

    return res.status(200).json({ data: data });
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
  res.status(404).json({
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
            message: "The query parameter [" + key + "] is not one of [" + queryKeys + "]"
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

    let max_results = 50;

    if (Object.keys(req.query).length > 0) {
      let arg = Number(req.query[Object.keys(req.query)]);
      let queryHandlerResult;

      if (isNaN(arg) || arg < 1 || arg > 100) {
        queryHandlerResult = await queryHandler(req, res, ["max_results"], {"max_results": ["1 to 100"]});
      } else {
        queryHandlerResult = await queryHandler(req, res, ["max_results"], {"max_results": [String(arg)]});
      }

      if (queryHandlerResult === 'response_sent') {
        return;
      }

      max_results = arg;
    }

    let followInfo;
    if (type === "followers") {
      followInfo = await readOnlyClient.v2.followers(data.external_information.id, { max_results: max_results });
    } else if (type === "following") {
      followInfo = await readOnlyClient.v2.following(data.external_information.id, { max_results: max_results });
    }

    res.status(200).json(followInfo);
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

module.exports = { handleUserResponse, userFollowHandler };  
