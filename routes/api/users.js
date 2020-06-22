const express = require('express');
const router = express.Router();

//@route    GET api/users/test
//@des      Test users routes
//@access   Public
router.get('/test', (req, res) => res.json({msg: 'User works...'}));

module.exports = router;