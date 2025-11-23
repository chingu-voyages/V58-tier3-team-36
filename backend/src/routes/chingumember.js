const express = require('express');
const router = express.Router();

const {
  getChingus,
  aggregateByCountry,
} = require('../controllers/memberController'); 

router.get('/aggregate-by-country', aggregateByCountry);
router.get('/', getChingus);


module.exports = router;
