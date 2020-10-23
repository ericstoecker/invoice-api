const crypto = require('crypto');

module.exports = {
    key: null,
    createKey: function() {
        this.key = crypto.randomBytes(16);
    }
}