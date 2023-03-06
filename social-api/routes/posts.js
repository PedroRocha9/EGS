const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /v1/users/{uuid}/posts:
 *  get:
 *      tags: [Posts]
 * 
 */
router.get("/:uuid/posts", async (req, res) => {

});

/**
 * @swagger
 * /v1/users/{uuid}/timeline:
 */

/**
 * @swagger
 * /v1/posts/:id
 */

/**
 * @swagger
 * /v1/posts/:id/liking_users
 */


module.exports = router;