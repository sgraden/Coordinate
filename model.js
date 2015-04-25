var DB = require('./db').DB;

var user = DB.Model.extend({
   tableName: 'tblUSER',
   idAttribute: 'UserID',
   userfname: 'UserFName',
   userlname: 'UserLName'
});

module.exports = {
   user: user
};