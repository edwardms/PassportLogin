if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const app = express()
const host = 'localhost'
const port = 3000

const users = [
    {
        id: '1724399968312',
        name: 'edi',
        email: 'q',
        password: '$2b$10$p3N5l2sScyKoZuWwa00O0.HcizJrlBkLRCFi4Tmi9SOSJIXcwdXoC'
    },
    {
        id: '1724400457045',
        name: 'Ana',
        email: 'n@n.nn',
        password: '$2b$10$viRm66NV5iOQZ2gnPJRGXeeKUWqzXhPpOVWvQwD4E4PF2tt7BL6ZW'
    }
]

const viewsDir  = path.join(__dirname, 'views')
const publicDir = path.join(__dirname, 'public')

app.set('view-engine', 'ejs')

app.use( express.urlencoded({ extended: false }) )
app.use( express.static(viewsDir) )
app.use( express.static(publicDir) )
app.use( flash() )
app.use( session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}) )
app.use( passport.initialize() )
app.use( passport.session() )
app.use( methodOverride('_method') )

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (e) {
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut(req.user, err => {
        if (err) return next(err)
        res.redirect("/login")
    })
})

function checkAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if ( !req.isAuthenticated() ) {
        return next()
    }

    res.redirect('/')
}

app.listen(port, host, () => {
    console.log(`App running on ${host}:${port}`)
})