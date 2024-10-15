const ftp = require('basic-ftp');
const fs = require('fs').promises;
const path = require('path');
const data =require('../data/FTPServerList.json');
const {logError,logSuccess,clearLogFile} = require('./errorcatcher');
let count =0;

async function getFileList(filelocation)
{
    try{
        process.chdir('.')
        var fileList = [];
        const folderPath = path.join(process.cwd(),filelocation);
        console.log(folderPath);
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const localFilePath = path.join(folderPath, file);
            var fileInfo = { name: file, path: localFilePath };
            fileList.push(fileInfo);
        }
        return fileList;
    }catch(err)
    {
        logError(err);
    }
}
async function uploadAllFiles(host,user,password,array) {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Set to true for logging
    try {
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false // Use false if not using FTPS
        });
       
        logSuccess("Connected to the FTP server");
        
        for(var i=0;i<array.length;i++)
        {
            var fileList= await getFileList(array[i]);
            for(var file of fileList){
                await client.uploadFrom(file.path, file.name);
                logSuccess(file.name+" uploaded successfully");
            }
        }
        count+=1;
        client.close();
    } catch (error) {
        logError(error);
       
    } 
}
async function tranferUploadedFileToUploadedFolder(filepath,filename)
{
    try{
        process.chdir('.')
        const folderPath = path.join(process.cwd(), data.UploadedFolder);
        // Check if the folder exists, and if not, create it
        try{
            await fs.access(folderPath);
            logSuccess(`Folder already exists: ${folderPath}`);}
        catch(err) {
            logError(`Folder doesn't exist: ${folderPath}`);
            await fs.mkdir(folderPath);
            logSuccess(`Created folder: ${folderPath}`);
        } 
        const destinationFilePath = path.join(folderPath, filename);
        // Move (cut) the file
        fs.rename(filepath, destinationFilePath, (err) => {
            if (err) {
                logError(`Error moving the file: ${err.message}`);
            } else {
                logSuccess(filename+' moved successfully');
            }
        });

    }catch(err)
    {
        logError(err);
    }
}
async function uploadToMultipleIps()
{
    clearLogFile();
    try{
        
        count =0;
        const list = data.FTPList;
        for(const item of list){ 
            await uploadAllFiles(item.host,item.username,item.password,data.UploadFolders)
        }
        
        if(count ==list.length)
        {
            for(var i=0;i<data.UploadFolders.length;i++)
            {
                var fileList= await getFileList(data.UploadFolders[i]);
                for(var file of fileList){
                    tranferUploadedFileToUploadedFolder(file.path, file.name);
                    logSuccess(file.name+" transfers successfully");
                }
            }
        }
    }catch(err)
    {
        logError(err);
    }
}
uploadToMultipleIps();