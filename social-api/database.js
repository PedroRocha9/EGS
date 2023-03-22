const { MongoClient } = require("mongodb");
const { deleteFromCache } = require("./cache");

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
  
const addToDatabase = async (collectionName, data) => {
  const mongoClient = new MongoClient("mongodb://localhost:27017");
  
  try {
    await mongoClient.connect();
    const database = mongoClient.db("mixit");
    const collection = database.collection(collectionName);
    await collection.insertOne(data);
  } catch (error) {
    console.error(error);     // Debugging purposes
    throw new Error("Failed to post data from database");
  } finally {
    await mongoClient.close();    
  }
};

const updateDatabase = async (collectionName, param, paramValue, data) => {
};

const deleteFromDatabase = async (collectionName, param, paramValue) => {
  const mongoClient = new MongoClient("mongodb://localhost:27017");

  try {
    await mongoClient.connect();
    const database = mongoClient.db("mixit");
    const collection = database.collection(collectionName);
    const data = await collection.findOne({ [param]: paramValue });

    if (data) {
      await collection.deleteOne({ [param]: paramValue });
      let user = await collection.findOne({ "external_information.id": data.external_information.id });
      // Delete the data from the cache
      if (!user) {
        await deleteFromCache(data.external_information.id);
      }
    }

    return data;
  } catch (error) {
    console.error(error);     // Debugging purposes
    throw new Error("Failed to delete data from database");
  } finally {
    await mongoClient.close();    
  }
};

module.exports = { fetchFromDatabase, addToDatabase, updateDatabase, deleteFromDatabase };
