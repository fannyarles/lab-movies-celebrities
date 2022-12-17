const Celebrity = require('../models/Celebrity.model');
const Movie = require('../models/Movie.model');

const router = require('express').Router();

router.get('/movies', (req, res) => {

    Movie.find()
        .then(movies => res.render('movies/movies', { movies }))
        .catch(err => console.log(err));

});

router.get('/movies/create', (req, res) => {

    Celebrity.find()
        .then(celebrities => res.render('movies/new-movie', { celebrities }))
        .catch(err => console.log(err));

});

router.post('/movies/create', (req, res) => {

    const { title, genre, plot, cast } = req.body;

    Movie.create({ title, genre, plot, cast })
        .then(createdMovie => {

            const castMembers = [createdMovie.cast].flat();

            for (let i = 0; i < castMembers.length; i++) {
                
                Celebrity.findById(castMembers[i])
                    .then(celebrity => {
                        celebrity.moviesId.push(createdMovie._id);
                        celebrity.save();
                    })
                    .catch(err => console.log(err))
            }

        })
        .then(() => res.redirect('/movies'))
        .catch(err => res.redirect('/movies/create'));

});

router.get('/movie/:id', (req, res) => {
    
    Movie.findById(req.params.id)
        .populate('cast')
        .then(movie => res.render('movies/movie-single', { movie }))
        .catch(err => console.log(err));

});

router.post('/movie/:id/delete', async (req, res) => {

    // Remove the movie._id from cast members' moviesId field

    try {
    
        const movie = await Movie.findById(req.params.id)
            .catch(err => console.log(err));

        movie.cast.forEach(actor => {
            Celebrity.findByIdAndUpdate( 
                actor,
                { $pull: { moviesId: movie._id } }, 
                { new: true }
            ).catch(err => console.log(err));
        });        
        
    } catch (err) { console.log(err); }

    // Delete the movie and redirect

    Movie.findByIdAndDelete(req.params.id)
        .then(() => res.redirect('/movies'))
        .catch(err => console.log(err));

});

router.get('/movie/:id/edit', async (req, res) => {

    try {

        const celebrities = await Celebrity.find();
    
        Movie.findById(req.params.id)
            .then(movie => {

                let movieCastIds = movie.cast.map(el => el._id.toString());
                console.log(movieCastIds)

                let optionsArray = [];
                
                celebrities.forEach(celebrity => {
                    if (movieCastIds.includes(celebrity._id.toString())) {
                        optionsArray.push(`<option value="${celebrity._id}" selected>${celebrity.name}</option>`)
                    } else {
                        optionsArray.push(`<option value="${celebrity._id}">${celebrity.name}</option>`)
                    }
                });
                
                res.render('movies/movie-update', { movie, optionsArray })
            })
            .catch(err => console.log(err));
        
    } catch (err) { console.log(err); }

});

router.post('/movie/:id/edit', async (req, res) => {

    const { title, genre, plot, cast } = req.body;

    // Find all celebrities from current cast, delete the movie from their moviesId field

    try {

        const movie = await Movie.findById(req.params.id);
    
        movie.cast.forEach(actor => {
            Celebrity.findByIdAndUpdate(
                actor,
                { $pull: { moviesId: movie._id }}
            ).catch(err => console.log(err));
        });
        
    } catch (error) {
        console.log(error);
    }
    
    
    // Update movie with new informations + add the movie to new cast members' moviesId field

    Movie.findByIdAndUpdate(req.params.id, { title, genre, plot, cast }, { new: true })
        .then(updatedMovie => {

            const castMembers = updatedMovie.cast;

            for (let i = 0; i < castMembers.length; i++) {
                
                Celebrity.findById(castMembers[i])
                    .then(celebrity => {
                        if (!celebrity.moviesId.includes(updatedMovie._id)) {
                            celebrity.moviesId.push(updatedMovie._id);
                            celebrity.save();
                        }
                    })
                    .catch(err => console.log(err))
            }

        })
        .then(() => res.redirect('/movies'))
        .catch(err => res.redirect(`/movies/${req.params.id}/edit`));

});

module.exports = router;