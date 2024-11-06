import express from 'express';
import jwt from 'jsonwebtoken';
import { PORT, SECRET_JWT_KEY } from './utils/config.js';
import { UserRepository } from './user-repository.js';
import cookieParser from 'cookie-parser';

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    const token = req.cookies.access_token;
    req.session = { user: null };

    try {
        const data = jwt.verify(token, SECRET_JWT_KEY);
        req.session.user = data;
    } catch {}

    next();
});

app.get('/', (req, res) => {
    const { user } = req.session;
    res.render('index', user);
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserRepository.login({ username, password });
        const token = jwt.sign({ id: user._id, username: user.username }, SECRET_JWT_KEY, {
            expiresIn: '1h',
            algorithm: 'HS256'
        });
        res
        .cookie('access_token', token, {
            httpOnly: true, // La cookie solo se puede acceder en el servidor
            secure: process.env.NODE_ENV === 'production', // La cookie se enviará al cliente solo si la conexión es HTTPS
            sameSite: 'strict', // La cookie solo se enviará al cliente si la conexión es del mismo dominio
            maxAge: 1000 * 60 * 60
        })
        .send({ user, token });
    } catch (error) {
        res.status(401).send(error.message);
    }
});
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const id = await UserRepository.create({ username, password });
        res.send({id: id});
    } catch (error) {
        // NORMALMENTE NO ES BUENA IDEA MANDAR EL ERROR DEL REPOSITORIO
        if(error.message)
        res.status(404).send(error.message);
    }
});
app.post('/logout', (req, res) => {
    res.clearCookie('access_token')
    res.send('Logged out');
});
app.get('/protected', (req, res) => {
    const { user } = req.session;
    if(!user) return res.status(403).send('Access not authorized');
    res.render('protected', user);
});


app.listen(PORT, (req, res) => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});