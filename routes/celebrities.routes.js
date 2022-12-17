const Celebrity = require("../models/Celebrity.model");

const router = require("express").Router();

router.get('/celebrities', (req, res) => {

    Celebrity.find()
        .populate('moviesId')
        .then(celebrity => res.render('celebrities/celebrities', { celebrity }))
        .catch(err => console.log(err));
    
});

router.get('/celebrities/create', (req, res) => {

    res.render('celebrities/new-celebrity')

});

router.post('/celebrities/create', (req, res) => {

    const { name, occupation, catchPhrase } = req.body;

    Celebrity.create({ name, occupation, catchPhrase })
        .then(() => res.redirect('/celebrities'))
        .catch(() => res.redirect('/celebrities/create'));

});

// router.get('/celebrity/:id', (req, res) => {

// });

module.exports = router;