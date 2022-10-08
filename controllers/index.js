var express = require('express');
var router = express.Router();
 
router.use('/user', require('./user'));
router.use('/friend',require('./friend'));
router.use('/fmessage',require('./friend_message'));
router.use('/group',require('./group'));
router.use('/gmessage',require('./group_message'));
 
// router.get('/', function(req, res){
//     res.render('index');
// });
 
module.exports = router;