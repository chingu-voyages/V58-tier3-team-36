const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getChingus,
  aggregateByCountry,
} = require('../controllers/memberController'); 

router.get('/aggregate-by-country', auth, auth, aggregateByCountry);
router.get('/', auth, auth, getChingus);


module.exports = router;
