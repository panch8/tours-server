const app = require('./app');
require('dotenv').config({path:`${__dirname}/config.env`})

process.on('uncaughtException', err=>{
    console.error(err.name, err.message);
    console.log('Uncaght Rejection, Shut down.');
    process.exit(1);
})
//START SERVER
app.listen(process.env.PORT,()=>{
    console.log(`server running on port ${process.env.PORT} `);
});

process.on('unhandledRejection', err =>{
    console.error(err.name, err.message);
    console.log('Uncaght Rejection, Shut down.');
    // process.exit(1)
});
