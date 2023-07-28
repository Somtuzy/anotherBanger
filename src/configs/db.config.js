const mongoose = require('mongoose');
const logger = require('pino')()

module.exports = (function database() {
    const startdb = () => {
        mongoose.set('strictQuery', false)
        mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'Bale'
        })
        .then(() => {
            logger.info('Database connection successful...')
        })
        .catch(err => {
            logger.error('Error connecting to the database:', err)
            logger.info('Reconnecting to database...')
            startdb()
        })
    }

    startdb()
})