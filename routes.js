const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res) => {
  res.render('index', {
    data: {},
    errors: {}
  });
});

router.get('/confirmation', (req, res) => {
  res.render('confirmation', {
    data: {},
    errors: {}
  });
});

// Function to validate data
const { check, validationResult } = require('express-validator/check');

const { matchedData } = require('express-validator/filter');

router.post(
  '/',
  [
    check('nominee')
      .isLength({ min: 1 })
      .withMessage('Provide a full name for the nominee.')
      .trim(),
    check('nominator')
      .isLength({ min: 1 })
      .withMessage('Provide your full name in the nominator section.')
      .trim(),
    check('email')
      .isEmail()
      .withMessage('That email does not look right.'),
    check('explanation')
      .isLength({ min: 20 })
      .withMessage('Provide an explanation at least 20 characters long.')
      .trim()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('index', {
        data: req.body,
        errors: errors.mapped()
      });
    }
    const data = matchedData(req);
    console.log('Sanitized:', data);

    if (req.file) {
      console.log('Uploaded: ', req.file);
    }

    req.flash('success', 'Thanks for nominating someone! Have a great day!');
    res.redirect('/confirmation');
  }
);

module.exports = router;
