const fs = require('fs').promises;
const path = require('path');
const data =require('../data/FTPServerList.json');
// Path to the log file
var logFilePath;
async function checkLogFolder()
{
    process.chdir('.')
    const folderPath = path.join(process.cwd(), data.ServerLog);
    logFilePath=path.join(folderPath, 'server.log');
    // Check if the folder exists, and if not, create it
    try{
        await fs.access(folderPath)
        console.log(`Created folder: ${folderPath}`);
    }
    catch(err)
    {
        await fs.mkdir(folderPath);
        console.log(`Folder already exists: ${folderPath}`);
    }
}
// Function to log errors
async function logError(error) {
    await checkLogFolder();
    try{
        const errorMessage = `${new Date().toLocaleString()} - Error: ${error.message||error}\n`;
        // Append the error message to the log file
        await fs.appendFile(logFilePath, errorMessage);
        console.log('Error logged to file');
    }
    catch(err){
        console.error(`Failed to write to log file: ${err.message}`);
    }
}
async function logSuccess(success) {
    await checkLogFolder();
    try{
        const successMessage = `${new Date().toLocaleString()} - Success: ${success}\n`;
        // Append the error message to the log file
        await fs.appendFile(logFilePath, successMessage);
        console.log('Success logged to file');
    }
    catch(err){
        console.error(`Failed to write to log file: ${err.message}`);
    }
}
function clearLogFile() {
    checkLogFolder();
    fs.writeFile(logFilePath, '', (err) => {
        if (err) {
            console.error('Error clearing log file:', err);
        } else {
            console.log('Log file cleared successfully');
        }
    });
}
module.exports = {logSuccess, logError,clearLogFile };