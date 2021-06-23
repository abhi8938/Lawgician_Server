module.exports = function () {
    process.on('unhandledRejection', (ex) =>{
        console.log('uncaught exceptions:' + ex);
        process.exit(1);
    });
    process.on('uncaughtException', (ex) =>{
        console.log('unhandled Exceptions:' + ex);
        process.exit(1);
    });    
    
}