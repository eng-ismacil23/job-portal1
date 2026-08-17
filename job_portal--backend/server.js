require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const port = process.env.PORT || 3001;

// --- Security middleware ---
app.use(helmet());

// CORS: only allow the configured frontend origin(s) instead of `cors()`
// wide-open-to-everyone. Set FRONTEND_ORIGIN in .env, comma-separated for
// multiple origins.
const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Strip Mongo operator keys ($gt, $ne, ...) from req.body/params/query
// - defense in depth against NoSQL injection alongside the Joi validators.
app.use(mongoSanitize());

// Upload route (Cloudinary)
const uploadRoutes = require('./routes/upload.route');
app.use('/api/upload', uploadRoutes);

// Users routes
const usersRoutes = require('./routes/users.route');
app.use('/users', usersRoutes);

// Jobs routes
const jobsRoutes = require('./routes/jobs.route');
app.use('/jobs', jobsRoutes);

// Profile routes
const profileRoutes = require('./routes/profiles.route');
app.use('/profiles', profileRoutes);

// Applications routes
const applicationRoutes = require('./routes/applications.route');
app.use('/applications', applicationRoutes);

const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

// MONGO_URI now comes from .env (was hardcoded to a local-only connection
// string before, which made it impossible to point at MongoDB Atlas /
// any remote DB without editing source code).
const { usersModel } = require('./models/users.service');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';

async function autoSeedAdmin() {
    try {
        const adminEmail = 'admin@jobportal.com';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@1234', salt);

        const existingAdmin = await usersModel.findOne({ email: adminEmail }).select('+password');
        if (!existingAdmin) {
            const admin = new usersModel({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                skills: [],
                status: 'active'
            });
            await admin.save();
            console.log('✅ Default Admin created: admin@jobportal.com / Admin@1234');
        } else {
            // Guarantee admin is active and password works
            existingAdmin.status = 'active';
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('✅ Admin account verified & ready: admin@jobportal.com / Admin@1234');
        }
    } catch (err) {
        console.error('Error auto-seeding admin:', err.message);
    }
}

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    await autoSeedAdmin();
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
