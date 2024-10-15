
const fs = require('fs').promises;
const path = require('path');
const {logError,logSuccess,clearLogFile} = require('./errorcatcher');
const filePath = path.join(__dirname, '../data/FTPServerList.json');
const {generateRandomCode} =require('./functions');
async function checkExistedHost(host)
{
    const dataBuffer = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(dataBuffer); // Parse JSON data
    var result = data.FTPList.find(ftp=>ftp.host==host);
    if(result)
        return true;
    return false;
}
async function returnHostByCode(code)
{
    const dataBuffer = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(dataBuffer); // Parse JSON data
    var result = data.FTPList.find(ftp=>ftp.code==code);
    if(result)
        return result.host;
    return null;
}
async function deleteFTPServerByCode(code)
{
    var host =await returnHostByCode(code);
    if(await checkExistedHost(host)==false)
    {
        
        logError(code+" isn't existed in data!");
        return {code:401,messages:code+" isn't existed!", success: false};
    }
    else
    {
        try{
            const dataBuffer = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(dataBuffer); // Parse JSON data
            index = data.FTPList.findIndex(server=>server.host==host);
            data.FTPList.splice(index,1);
            const updatedData = JSON.stringify(data, null, 2); // Pretty print with indentation
            await fs.writeFile(filePath, updatedData, 'utf8');
            logSuccess(host+' has been deleted successfully!');
            return {code:200,messages: host+' has been deleted successfully!', success: true};
        }catch(err)
        {
            logError(err);
            return {code:403,messages: err, success: false};
        }
    }
}
// async function deleteFTPServerArray(array)
// {
//     try{
//         if (Array.isArray(array)) {
//             if(array.length>0)
//             {
//                 var promises = array.map(host => deleteFTPServer(host));
//                 await Promise.all(promises);
//                 logSuccess("FTP servers has been deleted successfully!")
//             }
//             else{
//                 logError("There is no ftp server in array to delete!");
//                 return {code: 403,messages: "There is no ftp server in array to delete!", success: false};
//             }
//         } 
//         else {
//             logError("This is not an array!");
//             return {code:403,messages: "This is not an array!", success: false};
//         }
//     }catch(err)
//     {
//         logError(err);
//         return {code:403,messages: err, success: false};
//     }
// }
async function addNewFTPServer(host,username,password,name)
{

    if(await checkExistedHost(host)==true)
    {
        
        logError(host+" is existed!");
        return {code:401,messages:host+" is existed!", success: false};
    }
    else
    {
        try{
            var generatedCode =generateRandomCode(50);
            const dataBuffer = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(dataBuffer); // Parse JSON data
            data.FTPList.push({host:host,username:username,password:password,name:name,code:generatedCode});
            const updatedData = JSON.stringify(data, null, 2); // Pretty print with indentation
            await fs.writeFile(filePath, updatedData, 'utf8');
            logSuccess(host+' has been added successfully!');
            return {code:200,messages: host+' has been added successfully!',generatedCode:generatedCode, success: true};
        }catch(err)
        {
            logError(err);
            return {code:403,messages: err, success: false};
        }
    }
}
module.exports = {addNewFTPServer,deleteFTPServerByCode};