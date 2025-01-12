// config/oauth.js
module.exports = {
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID ,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3335/auth/google/callback'
    },
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://localhost:3335/auth/github/callback'
    }
};