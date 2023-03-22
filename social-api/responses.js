const { fetchFromDatabase, addToDatabase, updateDatabase, deleteFromDatabase } = require("./database");
const { fetchFromCache } = require("./cache");
require('dotenv').config();


// Get user's information endpoint handler
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

    let data = await fetchFromDatabase("users", param, req.params[param], dbQuery);
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

// Get user's followers/following endpoint handler
const userFollowHandler = async (req, res, type) => {
  const requiredFields = ['uuid', 'username', 'name', 'external_information'];
  const param = Object.keys(req.params)[0];

  try {
    const invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }

    const data = await fetchFromDatabase("users", param, req.params[param], requiredFields);
    if (!data) {
      userNotFoundHandler(req, res, param);
      return;
    }

    let next_token = undefined;
    if (Object.keys(req.query).length > 0) {
      let arg = req.query[Object.keys(req.query)];
      const queryHandlerResult = await queryHandler(req, res, ["next_token"], {"next_token": [String(arg)]});
      next_token = arg;

      if (queryHandlerResult === 'response_sent') {
        return;
      }
    }

    let followInfo;

    if (type === "followers") {
      followInfo = await fetchFromCache('followers', data.external_information.id, {'user.fields':  'profile_image_url'}, next_token);
    } else if (type === "following") {
      followInfo = await fetchFromCache('following', data.external_information.id, {'user.fields':  'profile_image_url'}, next_token);
    }

    res.status(200).json(JSON.parse(followInfo));
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

// Get user's posts endpoint handler
const handleUserPostResponse = async (req, res) => {
  const requiredFields = ['uuid', 'username', 'name', 'external_information'];
  const param = Object.keys(req.params)[0];
  let next_token = req.query;

  try {
    const invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }

    let data = await fetchFromDatabase("users", param, req.params[param], requiredFields);
    if (!data) {
      userNotFoundHandler(req, res, param);
      return;
    }

    const queryHandlerResult = await queryHandler(req, res, ["next_token"], {"next_token": [req.query[Object.keys(req.query)]]});
    if (queryHandlerResult === 'response_sent') {
      return;
    }

    if (Object.keys(req.query).length === 0) {
      next_token = null;
    } else {
      next_token = next_token.next_token;
    }

    const tweets = await fetchFromCache('user_tweets', data.external_information.id, null, next_token);

    return res.status(200).json(JSON.parse(tweets));
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

// Post user endpoint handler
const handleCreateUserRequest = async (req, res) => {
  const requiredFields = ['uuid', 'username', 'name', 'external_information'];
  const param = Object.keys(req.params)[0];
  let queries = req.query;
  // Get values of the query keys by alphabetical order
  const queriesValues = Object.keys(queries).sort().reduce((a, b) => (a[b] = queries[b], a), {});
  
  try {
    let invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }

    invalidUserHandlerResult = await invalidUserHandler({params: {username: queries[Object.keys(queriesValues)[3]]}}, res, "username");
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }

    const queryHandlerResult = await queryHandler(req, res, ['name', 'username', 'location', 'twitter_id'], {
      'name': [queries[Object.keys(queriesValues)[1]]],
      'username': [queries[Object.keys(queriesValues)[3]]],
      'location': [queries[Object.keys(queriesValues)[0]]],
      'twitter_id': [queries[Object.keys(queriesValues)[2]]],
    });

    if (queryHandlerResult === 'response_sent') {
      return;
    }

    let dbTest;
    // Check if the uuid is already registered
    dbTest = await fetchFromDatabase("users", param, req.params[param], requiredFields);
    if (dbTest) {
      userAlreadyRegisteredHandler(req, res, param);
      return;
    }
    // Check if the username is alreadu registered
    dbTest = await fetchFromDatabase("users", "username", queries.username, requiredFields);
    if (dbTest) {
      userAlreadyRegisteredHandler(req, res, "username");
      return;
    }

    // Verify if the twitter_id is valid
    const twitter_id = queries.twitter_id;
    let data = { 
      uuid: req.params.uuid,
      username: queries.username,
      name: queries.name,
      created_at: new Date().toISOString(),
      location: queries.location,
      external_information: {} 
    };

    try {
      externalInfoCache = await fetchFromCache('external_information', twitter_id, { 'user.fields': '' });
      data["external_information"]["id"] = twitter_id;
    } catch (error) {
      return res.status(404).json({
        errors: [{
          parameters: {
            value: [twitter_id]
          }
        }],
        detail: "Could not find Twitter user with id: [" + twitter_id + "].",
        title: "Not Found Error",
        parameter: param,
        resource_type: "user"
      });
    }

    // Add user to database
    await addToDatabase("users", data);
    delete data._id;

    // Add external information to the response
    data["external_information"]["twitter_name"] = JSON.parse(externalInfoCache).twitter_name;
    data["external_information"]["twitter_username"] = JSON.parse(externalInfoCache).twitter_username;

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

// Put user endpoint handler
const hadnleUpdateUserRequest = async (req, res) => {
};

// Delete user endpoint handler
const handleDeleteUserRequest = async (req, res) => {
  const param = Object.keys(req.params)[0];

  try {
    const invalidUserHandlerResult = await invalidUserHandler(req, res, param);
    if (invalidUserHandlerResult === 'response_sent') {
      return;
    }
    
    let data = await deleteFromDatabase("users", param, req.params[param]);
    if (!data) {
      userNotFoundHandler(req, res, param);
      return;
    }

    return res.status(200).json({ message: "Deleted user with uuid:[" + req.params[param] + "] successfully." });
  } catch (error) {
    console.log(error);   // Debugging purposes

    return res.status(500).json({ errors: "Internal server error" });
  }
};

// Auxiliary handler for invalid id/username
const invalidUserHandler = async (req, res, param) => {
  try {
    // if param is username and the value doesnt match the regex ^[A-Za-z0-9_]{1,15}$, return error
    if (param === "username" && !req.params[param].match(/^[A-Za-z0-9_]{1,15}$/)) throw new Error("Invalid username");

    // if param is uuid and the value contains letters, return error
    if (param === "uuid" && req.params[param].match(/[a-zA-Z]/)) throw new Error("Invalid uuid");

    return
  } catch (error) {
    console.log(error.message);   // Debugging purposes
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

const userAlreadyRegisteredHandler = async (req, res, param) => {
  let value;
  if (req.params[param]) {
    value = req.params[param];
  } else {
    value = req.query[param];
  }

  res.status(409).json({
    errors: [{
      parameters: {
        value: [value]
      }
    }],
    detail: "User with "+ param + ": [" + value + "] already registered in platform.",
    title: "User Already Registered Error",
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

module.exports = {
  handleUserResponse, handleCreateUserRequest, hadnleUpdateUserRequest, handleDeleteUserRequest,
  userFollowHandler, 
  handleUserPostResponse
};  
