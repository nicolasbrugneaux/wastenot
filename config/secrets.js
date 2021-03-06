/**
 * IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT
 *
 * You should never commit this file to a public repository on GitHub!
 * All public code on GitHub can be searched, that means anyone can see your
 * uploaded secrets.js file.
 *
 * I did it for your convenience using "throw away" API keys and passwords so
 * that all features could work out of the box.
 *
 * Use config vars (environment variables) below for production API keys
 * and passwords. Each PaaS (e.g. Heroku, Nodejitsu, OpenShift, Azure) has a way
 * for you to set it up from the dashboard.
 *
 * Another added benefit of this approach is that you can use two different
 * sets of keys for local development and production mode without making any
 * changes to the code.

 * IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT
 */

module.exports = {

  db: process.env.MONGOLAB_URI,

  sessionSecret: process.env.SESSION_SECRET,

  sendgrid: {
    user: process.env.SENDGRID_USER,
    password: process.env.SENDGRID_PASSWORD,
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  twitter: {
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET ,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  google: {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  twilio: {
    sid: process.env.TWILIO_SID,
    token: process.env.TWILIO_TOKEN,
  },

  paypal: {
    sandbox: true,
    clientID: process.env.PAYPAL_KEY,
    clientSecret: process.env.PAYPAL_SECRET,
    callbackURL: '/auth/paypal/callback',
    returnUrl: process.env.PAYPAL_RETURN_URL,
    cancelUrl: process.env.PAYPAL_CANCEL_URL,
  },

  yummly: {
    appID: process.env.YUMMLY_APP_ID,
    appKey: process.env.YUMMLY_APP_KEY
  }

};
