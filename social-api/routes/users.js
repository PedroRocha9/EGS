const express = require('express');
const router = express.Router();
const { handleUserResponse } = require('../responses');


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
 *          - in: query
 *            name: user.fields
 *            schema:
 *              type: string
 *            description: The UID of the user in mixit platform
 *      responses:
 *          200:
 *              description: A User Object
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/User'
 *                      examples:
 *                          UserFound:
 *                              summary: User Found
 *                              value:
 *                                  data:
 *                                      name: "André Clérigo"
 *                                      uuid: "1128339639209811969"
 *                                      username: "mrmaster"
 *                                      created_at: "2019-05-14T16:41:48.000Z"
 *                                      location: "Portugal"
 *                                      public_metrics:
 *                                          followers_count: 144
 *                                          following_count: 125
 *                                      external_information:
 *                                          twitter_name: "André"
 *                                          twitter_username: "mrmaster__"
 *                          UserNotFound:
 *                              summary: User NOT Found
 *                              value:
 *                                  errors:
 *                                      - parameters:
 *                                          value: [":uuid"]
 *                                  detail: "Could not find user with username: [':uuid']."
 *                                  title: "Not Found Error"
 *                                  parameter: "uuid"
 *                                  resource_type: "user"
 *          400:
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              errors:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          parameters:
 *                                              type: object
 *                                              properties:
 *                                                  id:
 *                                                      type: array
 *                                                      items:
 *                                                          type: string
 *                                          message:
 *                                              type: string
 *                                  required:
 *                                      - parameters
 *                                      - message
 *                              title:
 *                                  type: string
 *                              detail:
 *                                  type: string
 *                          required:
 *                              - errors
 *                              - title
 *                              - detail
 *                      example:
 *                          errors:
 *                              - parameters:
 *                                    uuid: [":uuid"]
 *                                message: "The 'uuid' query parameter value [:uuid] is not valid"
 *                          title: "Invalid Request"
 *                          detail: "One or more parameters to your request were invalid."
 */
router.get("/:uuid", async (req, res) => {
  await handleUserResponse(req, res, "uuid");
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
 *          - in: query
 *            name: user.fields
 *            schema:
 *              type: string
 *            description: The UID of the user in mixit platform
 *      responses:
 *          200:
 *              description: A User Object
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/User'
 *                      examples:
 *                          UserFound:
 *                              summary: User Found
 *                              value:
 *                                  data:
 *                                      name: "André Clérigo"
 *                                      uuid: "1128339639209811969"
 *                                      username: "mrmaster"
 *                                      created_at: "2019-05-14T16:41:48.000Z"
 *                                      location: "Portugal"
 *                                      public_metrics:
 *                                          followers_count: 144
 *                                          following_count: 125
 *                                      external_information:
 *                                          twitter_name: "André"
 *                                          twitter_username: "mrmaster__"
 *                          UserNotFound:
 *                              summary: User NOT Found
 *                              value:
 *                                  errors:
 *                                      - parameters:
 *                                          value: [":username"]
 *                                  detail: "Could not find user with username: [':username']."
 *                                  title: "Not Found Error"
 *                                  parameter: "username"
 *                                  resource_type: "user"
 *          400:
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              errors:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          parameters:
 *                                              type: object
 *                                              properties:
 *                                                  id:
 *                                                      type: array
 *                                                      items:
 *                                                          type: string
 *                                          message:
 *                                              type: string
 *                                  required:
 *                                      - parameters
 *                                      - message
 *                              title:
 *                                  type: string
 *                              detail:
 *                                  type: string
 *                          required:
 *                              - errors
 *                              - title
 *                              - detail
 *                      example:
 *                          errors:
 *                              - parameters:
 *                                    username: [":username"]
 *                                message: "The 'username' query parameter value [:username] is not valid"
 *                          title: "Invalid Request"
 *                          detail: "One or more parameters to your request were invalid."
 */
router.get("/by/username/:username", async (req, res) => {
  await handleUserResponse(req, res, "username");
});

module.exports = router;
