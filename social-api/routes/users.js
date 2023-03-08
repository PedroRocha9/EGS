const express = require('express');
const router = express.Router();
const { handleUserResponse, userFollowHandler } = require('../responses');


/**
 * @swagger
 * /v1/users/{uuid}:
 *  get:
 *      summary: Returns a variety of information about a single user specified by the requested UID.
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: uuid
 *            schema:
 *              type: string
 *            required: true
 *            description: The UID of the user in mixit platform
 *          - in: query
 *            name: user.fields
 *            schema:
 *              type: string
 *            description: The fields can be location, created_at, public_metrics, and must be separated by commas. Make sure to not include a space between commas and fields.
 *      responses:
 *          200:
 *              description: A User Object
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'                            
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
router.get("/:uuid", async (req, res) => {
  await handleUserResponse(req, res);
});

/**
 * @swagger
 * /v1/users/by/username/{username}:
 *  get:
 *      summary: Returns a variety of information about a single user specified by the requested username.
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: username
 *            schema:
 *              type: string
 *            required: true
 *            description: The username of the user in mixit platform
 *          - in: query
 *            name: user.fields
 *            schema:
 *              type: string
 *            description: The fields can be location, created_at, public_metrics, and must be separated by commas. Make sure to not include a space between commas and fields.
 *            
 *      responses:
 *          200:
 *              description: A User Object
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
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
router.get("/by/username/:username", async (req, res) => {
  await handleUserResponse(req, res);
});

/**
 * @swagger
 * /v1/users/{uuid}/followers:
 *  get:
 *      summary: Returns a list of users who are followers of the specified user ID (Twitter ID).
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: uuid
 *            schema:
 *              type: string
 *            required: true
 *            description: The UID of the user in mixit platform
 *          - in: query
 *            name: max_results
 *            schema:
 *              type: integer
 *            description: The maximum number of results to be returned per page. This can be a number between 1 and the 100. By default, each page will return 50 results.
 *      
 *      responses:
 *          200:
 *              description: A list of users who are followers.
 *              content:
 *                  application/json:
 *                      schema:
 *                        type: array
 *                        items:
 *                          $ref: '#/components/schemas/FollowUser'
 *          400:
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorInvalid'
 * 
 *          404:
 *              description: User not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorNotFound'
*/
router.get("/:uuid/followers", async (req, res) => {
  await userFollowHandler(req, res, "followers");
});

/**
 * @swagger
 * /v1/users/{uuid}/following:
 *  get:
 *      summary: Returns a list of users that the specified user ID (Twitter ID) follows.
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: uuid
 *            schema:
 *              type: string
 *            required: true
 *            description: The UID of the user in mixit platform
 *          - in: query
 *            name: max_results
 *            schema:
 *              type: integer
 *            description: The maximum number of results to be returned per page. This can be a number between 1 and the 100. By default, each page will return 50 results.
 *      
 *      responses:
 *          200:
 *              description: A list of users who are followers.
 *              content:
 *                  application/json:
 *                      schema:
 *                        type: array
 *                        items:
 *                          $ref: '#/components/schemas/FollowUser'
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
router.get("/:uuid/following", async (req, res) => {
  await userFollowHandler(req, res, "following");
});

module.exports = router;
