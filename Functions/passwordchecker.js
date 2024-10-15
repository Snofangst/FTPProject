const bcrypt = require('bcrypt');
const data =require('../data/FTPServerList.json')
async function passwordChecker(password)
{
    bcrypt.compare(password, data.Password, function(err, result) {
        if (result) {
            return true;
        } else {
            return false;
        }
    });
}
module.exports = {passwordChecker};
