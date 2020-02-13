const mongoose  =require('mongoose');

mongoose.connect('mongodb+srv://roberta:roberta11@cluster0-wpomw.mongodb.net/test?retryWrites=true&w=majority', {  useUnifiedTopology: true, useNewUrlParser: true   });

mongoose.Promise = global.Promise;

module.exports = mongoose;
