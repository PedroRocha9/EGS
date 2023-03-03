const express = require('express');
const router = express.Router();
const static = require('../static');
// const { handleResponse } = require('../responses');

/**
 * @swagger
 * /users:
 *  get:
 *      summary: Returns a list of the student's exams
 *      tags: [Users]
 *      security:
 *          - basicAuth: []
 *      responses:
 *          200:
 *              description: List of of users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              
 */
router.get("/", async (req, res) => {
    res.status(200).json({
        'name': 'andree'
    })
});

module.exports = router;
