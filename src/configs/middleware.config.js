const morganConfig = `:date[iso] :method :url :status :response-time ms :remote-addr :http-version :referrer :user-agent`

const corsConfig = {
  origin: '*',
  // methods: ["GET", "POST", "PATCH", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
  exposedHeaders: ['Authorization'],
  // credentials: true,
}

const sessionConfig = {
  name: "connect.sid",
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 86400000,
  },
}

module.exports = { morganConfig, corsConfig, sessionConfig }