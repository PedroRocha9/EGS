const { MongoClient } = require("mongodb");

const fetchUserFromDatabase = async (collectionName, param, paramValue) => {
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
  
const handleUserResponse = async (req, res, param) => {
  const requiredFields = ['uuid', 'username', 'name', 'external_information'];
  const key = Object.keys(req.params)[0];

  try {
    // if param is username and the value doesnt match the regex ^[A-Za-z0-9_]{1,15}$, return error
    if (param === "username" && !req.params[key].match(/^[A-Za-z0-9_]{1,15}$/)) throw new SyntaxError("Invalid username");

    // if param is uuid and the value contains letters, return error
    if (param === "uuid" && req.params[key].match(/[a-zA-Z]/)) throw new SyntaxError("Invalid uuid");
    
    const queryHandlerResult = await queryHandler(req, res, ["user.fields"], {"user.fields": ["location", "created_at", "public_metrics"]});
    if (queryHandlerResult === 'response_sent') {
      return;
    }

    const data = await fetchUserFromDatabase("users", param, req.params[key]);
    // User NOT found
    if (!data) {
      return res.status(200).json({
        errors: [{
          parameters: {
            value: [req.params[key]]
          }
        }],
        detail: "Could not find user with "+ key + ": [" + req.params[key] + "].",
        title: "Not Found Error",
        parameter: key,
        resource_type: "user"
      });
    }

    // User found
    const requestParams = req.query["user.fields"].split(",").concat(requiredFields);
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => requestParams.includes(key))
    );

    return res.status(200).json({ data: filteredData });
  } catch (error) {
    console.log(error.name + ": " + error.message);   // Debugging purposes
    
    // UUID or Username not valid
    if (error instanceof SyntaxError && (error.message.includes("uuid") || error.message.includes("username"))) {
      return res.status(400).json({
        errors: [{
          parameters: {
            [key]: [req.params[key]]
          },
          message: "The `" + key + "` query parameter value [" + req.params[key] +"] is not valid"
        }],
        title: "Invalid Request",
        detail: "One or more parameters to your request was invalid.",
      });
    }

    return res.status(500).json({ errors: "Internal server error" });
  }
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

module.exports = { handleUserResponse };  
