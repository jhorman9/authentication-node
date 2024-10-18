import express from 'express';
import { PORT } from './utils/config.js';
import { UserRepository } from './user-repository.js';

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserRepository.login({ username, password });
        res.send({ user });
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
app.post('/logout', (req, res) => {});
app.get('/protected', (req, res) => {
    //TODO: if sesion del usuario
    res.render('protected', { username: 'jhormanDev' });
    // TODO: else 401
});


app.listen(PORT, (req, res) => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});