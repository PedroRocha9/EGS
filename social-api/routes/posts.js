const express = require('express');
const router = express.Router();
const { handleUserPostResponse } = require('../responses');


/**
 * @swagger
 * /v1/posts/users/{uuid}:
 *  get:
 *      summary: Returns a list of Posts created by the user, specified by the requested UID.
 *      tags: [Posts]
 *      parameters:
 *          - in: path
 *            name: uuid
 *            schema:
 *              type: string
 *            required: true
 *            description: The UID of the user in mixit platform
 *          - in: query
 *            name: next_token
 *            schema:
 *              type: string
 *            description: The fields can contain the next_token if to get the next "set" of posts.
 *      responses:
 *          200:
 *              description: List of Posts Object
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Post'                            
 *          400:
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorInvalid'
 *          404:
 *              description: User not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorNotFound'       
 */
router.get("/users/:uuid", async (req, res) => {
    await handleUserPostResponse(req, res);
});

/**
 * @swagger
 * /v1/users/{uuid}/timeline:
 */

/**
 * @swagger
 * /v1/posts/{id}
 */

/**
 * @swagger
 * /v1/posts/:id/liking_users
 */


module.exports = router;