const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    data: {},
    errors: {}
  });
});

router.post('/', (req, res) => {
  res.render('index', {
    data: req.body, // {nominee-name, explanation}
    errors: {
      nominee: {
        msg: 'A nominee name is required.'
      },
      explanation: {
        msg: 'An explanation for why this nominee is required.'
      }
    }
  });
});

module.exports = router;
