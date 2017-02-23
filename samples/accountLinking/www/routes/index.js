'use strict';

const uuidV4 = require('uuid/v4');
const router = require('../infrastructure/mount.js')(__dirname);
const Storage = require('../../services/userStorage.js');
const MobileDetect = require('mobile-detect');

exports.router = router;

router.get('/', (req, res) => {
  res.render('auth/index', {
    page: 'homepage',
  });
});

router.post('/', (req, res, next) => {
  const md = new MobileDetect(req.headers['user-agent']);
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

      if (md.is('AndroidOS')) {
        console.log(`redirecting android to: ${redirect}`);
        res.redirect(redirect);
      } else {
        console.log(`redirecting web to: ${redirect}`);
        res.render('auth/success', {
          page: 'success',
          title: 'Success',
          redirectUrl: redirect,
        });
      }
    })
    .catch(next);
});
