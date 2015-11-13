module.exports = function(express, app) {
    var router = express.Router();

    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Mage Knight'});
    });

    router.get('/setcolor', function(req, res, next) {
        req.session.favColor = process.env.NODE_ENV === 'production' ? "Green" : "Red";
        res.send('Setting favourite colour !');
    });

    router.get('/getcolor', function(req, res, next) {
        res.send('Favourite colour: ' + (req.session.favColor ? req.session.favColor : "Not Found"));
    });

    app.use('/', router);
}