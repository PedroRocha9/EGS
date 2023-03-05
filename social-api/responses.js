const { MongoClient } = require("mongodb");

const fetchFromDatabase = async (collectionName, uuid) => {
    const client = new MongoClient("mongodb://localhost:27017");
    try {
      await client.connect();
      const database = client.db("mixit");
      const collection = database.collection(collectionName);
      const data = await collection.findOne({ uuid });
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch data from database");
    } finally {
      await client.close();
    }
  };
  
const handleUserResponse = async (req, res) => {
    try {
        const data = await fetchFromDatabase("users", req.params.uuid);
        if (!data) {
        return res.status(404).json({ error: "Data not found" });
        }
        return res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { handleUserResponse };  
