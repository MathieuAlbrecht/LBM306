const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

function loadUsers() {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data).users;
}

function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users }, null, 2));
}

// Registrierung
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).send('Benutzer existiert bereits');
    }

    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed });
    saveUsers(users);

    res.status(200).send('✅ Registrierung erfolgreich');
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).send('❌ Benutzer nicht gefunden');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('❌ Falsches Passwort');

    res.status(200).send('✅ Login erfolgreich');
});

app.listen(PORT, () => {
    console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
 
 