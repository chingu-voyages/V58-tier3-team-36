const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getChingus,
  aggregateByCountry,
} = require('../controllers/memberController'); 

router.get('/aggregate-by-country', auth, aggregateByCountry);
router.get('/', auth, getChingus);


module.exports = router;
