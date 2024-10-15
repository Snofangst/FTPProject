const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");
const data =require('../data/FTPServerList.json');
const oneday = 24*60*60*1000; 
const {logError,logSuccess,clearLogFile} = require('./errorcatcher')
async function deleteFromMultipleIps()
{
    clearLogFile();
    try{
        process.chdir('.')
        const folderPath = path.join(process.cwd(), data.BackupFolder);
        // Check if the folder exists, and if not, create it
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
            logSuccess(`Created folder: ${folderPath}`);
        } else {
            logSuccess(`Folder already exists: ${folderPath}`);
        }
        const list = data.FTPList;
        for(const item of list)
        { 
            await listFilesWithDates(item.host,item.username,item.password,folderPath,item.name)
        };
    }catch(err)
    {
         logError(err);
    }
}
async function listFilesWithDates(host,user,password,filelocation,name) {
    const client = new ftp.Client();
    var flag=0;
    client.ftp.verbose = true;  // Optional: for detailed logging
    try {
        // Connect to the FTP server
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false // Change to true for FTPS if needed
        });
        // Navigate to the desired directory (you can modify this path)
        await client.cd("/");
        
        // Get the list of files
        const fileList = await client.list();
        // Extract filenames and their modification dates
        const folderName = name || "unknown_ip";  // Fallback if IP is not found
        const localDir = path.join(filelocation, folderName);
        // Create the folder if it doesn't exist
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir);
            logSuccess(`Created folder: ${localDir}`);
        }
        for (const file of fileList) {
            try {
                const formattedDateStr = file.rawModifiedAt.replace(/(\d{2})-(\d{2})-(\d{2}) (\d{2}:\d{2})([APM]{2})/, (match, p1, p2, p3, time, ampm) => {
                    return `${p1}/${p2}/20${p3} ${time} ${ampm}`.replace(/([APM]{2})/, ' $1');
                });
                const date = new Date(formattedDateStr);
                var now = new Date();
                var days=Math.round((now-date)/oneday);
                if(days>=data.Days)
                {
                    
                    const localFilePath = path.join(localDir, file.name);
                    logSuccess(`Downloading ${file.name} to ${localFilePath}`);
                    await client.downloadTo(localFilePath, file.name);
                    logSuccess(`Downloaded: ${file.name}`);
                    await client.remove(file.name);
                    logSuccess(`Deleted: ${file.name}`);
                    flag=1;
                    
                }
            } catch (error) {
                logError(`Failed to delete ${file.name}:`, error);
            }
        }
        if(flag==0)
        {
           await logSuccess(`There is no outdated PDF file to delete at ip: ${host}`);
        }
    } catch (error) {
        await logError(error);
    }
    client.close();
}
//Execution
module.exports={deleteFromMultipleIps };