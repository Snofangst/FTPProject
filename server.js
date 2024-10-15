const express = require('express');
const cron = require('node-cron');
const app = express();
const cors = require('cors'); 
const ftp = require('basic-ftp');
const path = require("path");
const PORT = process.env.PORT || 3000;
const data =require('./data/FTPServerList.json');
const scheduledTimer = data.ScheduleTime;
const {deleteFromMultipleIps} = require('./Functions/deleteandbackup');
const {addNewFTPServer,deleteFTPServerByCode}= require('./Functions/json');
// Function to be scheduled
// Start the function to run every minute
// const intervalId = setInterval(deleteFromMultipleIps, 60000); // 60000 milliseconds = 1 minute
cron.schedule(`${scheduledTimer.minutes} ${scheduledTimer.hours} * * *`, async() => {
     // Clear the console first
    console.log("The delete process is running!!!");
    await deleteFromMultipleIps();
    console.log("The delete process is completed!!!");
    console.clear();
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`This function will start at ${scheduledTimer.hours}:${scheduledTimer.minutes.toString().padStart(2,'0')} o'clock every day`);
});
app.use(express.json()); 
app.use(cors());

app.get('/status', (req, res) => {
    res.send({ status: 'Node.js is running' });
});

app.get('/api/json', (req, res) => {
    // Path to the JSON file
    const jsonFilePath = path.join(__dirname, 'data', 'FTPServerList.json');
    res.sendFile(jsonFilePath);
});

app.post('/api/checkConnection', async (req, res) => {
    const { host, user, password } = req.body;
    const ftpClient = new ftp.Client(); // Initialize a new FTP client for each request
    // Set timeout
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timed out")), data.Timeout);
    });
    // Validate input
    if (!host || !user || !password) {
        return res.status(400).json({
            success: false,
            message: "Required fields: host, user, and password can't be empty."
        });
    }
    try {
        await Promise.race([
            ftpClient.access({ host, user, password }),  // FTP connection
            timeoutPromise  // Timeout
        ]);
        res.json({ success: true, message: "Connection successful!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } finally {
        ftpClient.close(); // Always close the client
    }
});

//Add new ftp server
app.post('/api/json/add', async  (req, res) => {
    const { host, user, password,name } = req.body;
    //Set timeout
    // Validate input
    if (!host || !user || !password ||!name) {
        return res.status(400).json({
            success: false,
            message: "Required fields: name, host, user, and password can't be empty."
        });
    }
    var result =await addNewFTPServer(host,user,password,name);
    if(result.success==true)
        return res.status(200).json({result});
    else
        return res.status(400).json({result});

});

app.post('/api/json/remove', async  (req, res) => {
    const { code} = req.body;
    //Set timeout
    // Validate input
    if (!code ) {
        return res.status(400).json({
            success: false,
            message: "Required fields: code can't be empty."
        });
    }
    var result =await deleteFTPServerByCode(code);
    if(result.success==true)
        return res.status(200).json({result});
    else
        return res.status(400).json({result});
});

// Start the server
app.listen(PORT, () => {
    console.clear();
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("This function will start at "+scheduledTimer.hours+":"+scheduledTimer.minutes.toString().padStart(2,'0')+" o'clock every day")
});
