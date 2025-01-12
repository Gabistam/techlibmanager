// middleware/userStatus.js
const jwt = require('jsonwebtoken');

const userStatus = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
        } else {
            res.locals.user = null;
        }
    } catch (err) {
        res.locals.user = null;
    }
    next();
};

module.exports = userStatus;