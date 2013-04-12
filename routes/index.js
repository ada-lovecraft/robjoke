
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'How Many Times Has Rob Made An Inappropriate joke' });
};