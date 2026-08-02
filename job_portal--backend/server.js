const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Users routes
const usersRoutes = require('./routes/users.route');
app.use('/users', usersRoutes);

// Jobs routes
const jobsRoutes = require('./routes/jobs.route');
app.use('/jobs', jobsRoutes);

// Profile routes (both /profile and /profiles)
const profileRoutes = require('./routes/profiles.route');
app.use('/profile', profileRoutes);
app.use('/profiles', profileRoutes);

// Applications routes (both /aplication and /applications)
const applicationRoutes = require('./routes/applications.route');
app.use('/aplication', applicationRoutes);
app.use('/applications', applicationRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/job_portal').then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
