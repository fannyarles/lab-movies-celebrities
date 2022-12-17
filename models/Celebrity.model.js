//  Add your code here
const mongoose = require('mongoose');
const { Schema } = mongoose;

const celebritySchema = new Schema({
    name: String,
    occupation: String,
    catchPhrase: String,
    moviesId: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Movie'
        }
    ]
});

const Celebrity = mongoose.model('Celebrity', celebritySchema);

module.exports = Celebrity;