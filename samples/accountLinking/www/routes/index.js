'use strict';

const uuidV4 = require('uuid/v4');
const router = require('../infrastructure/mount.js')(__dirname);
const Storage = require('../../services/userStorage.js');

exports.router = router;

router.get('/', (req, res) => {
  res.render('auth/index', {
    page: 'homepage',
  });
});

router.post('/', (req, res, next) => {
  const db = new Storage();
  const email = req.body.email;
  const code = uuidV4().replace(/-/g, '');

  const params = {
    id: code,
    email,
  };

  return db.put(params)
    .then(() => {
      const redirect = `${req.query.redirect_uri}#state=${req.query.state}&access_token=${code}&token_type=Bearer`;
      res.redirect(redirect);
    })
    .catch(next);
});
