const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

const db= require('./config/keys').mongoURI;

mongoose
 .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
 .then(() => console.log('MongoDB Connected'))
 .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello Rajitha Srinath'));

//Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on ${port}`));