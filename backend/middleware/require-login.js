// middleware/require-login.js
// The guard at the door: "No wristband? You can't come in."
//
// 401 means "we don't know who you are, please log in first".

function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Please log in first.' });
  }
  next();
}

module.exports = { requireLogin };
