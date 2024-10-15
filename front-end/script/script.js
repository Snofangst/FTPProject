let execCount=0;
var nodeport=3000;
var deletedarray= [];
var server ="http://localhost:3000"
generateGridItems();
updateConnection();
function preventNegative(input) {
    // Ensure the value is not negative
    if (input.value <0) {
        input.value = 0; // or you can set it to an empty string ''
    }
    if(input.value>365)
        input.value =365;
}
document.querySelectorAll('.accordion-button').forEach(button => {
    button.addEventListener('click', () => {
        // Toggle the active class for button
        button.classList.toggle('active');

        // Get the associated content element
        const content = button.nextElementSibling;

        // Toggle the content display
        if (content.style.display === "block") {
            content.style.display = "none"; // Collapse
        } else {
            content.style.display = "block"; // Expand
        }
    });
});
function checkNodeStatus() {
    fetch(server+'/status') // Change to your server's URL
    .then(response => {
        if (response.ok) {
            document.getElementById('status').classList.remove('server-off');
            document.getElementById('status').classList.add('server-on');
            document.getElementById('status').setAttribute('data-tooltip', "NodeJS server đang mở");
        } else {
            document.getElementById('status').classList.remove('server-on');
            document.getElementById('status').classList.add('server-off');
            document.getElementById('status').setAttribute('data-tooltip', "NodeJS server đã đóng");
        }
    })
    .catch(error => {
        document.getElementById('status').classList.remove('server-on');
        document.getElementById('status').classList.add('server-off');
        document.getElementById('status').setAttribute('data-tooltip', "NodeJS server đã đóng");
    });
}
// Start checking the status every second (1000 milliseconds)
setInterval(checkNodeStatus, 1000); // Check every second

async function checkConnection(requestBody)
{
    var connection={};
    await fetch(server+'/api/checkConnection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(result => {
        console.log(result);
        if(result.status==200)
        {
            connection.status = true; // Set connection to true if successful
            connection.message = result.status;
        }
        else
        {
            connection.status = false; // Set connection to true if successful
            connection.message = result.status;
        }
    })
    .catch(error => {
        console.error('Connection failed:', error);
        connection.status = true; // Set connection to true if successful
        connection.message = error;
    });
    return connection;
}
//Generate Grid Item From Json File
async function generateGridItems() {
    var data = await getJsonData();
    const daysInput = document.getElementById('dayIn');
    const timeInput = document.getElementById('timeIn');
    const gridContainer = document.getElementById('ftpGrid');
    // console.log("Data fetched successfully:", data);
    daysInput.setAttribute("value",data.Days);
    timeInput.setAttribute("value",data.ScheduleTime.hours+":"+data.ScheduleTime.minutes);
    for (const item of data.FTPList) {
        // Create grid item
        await addNewFTPDisplay(item,gridContainer);
    }
}
async function addNewFTPDisplay(item,parentContainer)
{
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.id=item.code;
    // connection= await checkConnection(requestBody);
    // Set inner HTML
    gridItem.innerHTML = `
        <input onchange="addToDeletedArray.call(this)" class="delete-checkbox " type="checkbox" id="delete-checkbox" name="${item.code}" value="${item.code}">
        <i class="fi fi-rr-pager"></i>
        
        <span>${item.name}</span>
        <i class="fi fi-rr-info icon-tt">
            <div class="tooltip">
                Host: ${item.host}<br>
                User: ${item.username}<br>
                Password: ${item.password}
            </div>
        </i>`;
    gridItem.innerHTML +=`<i id="FTPstatus" class="fi fi-rr-clock-future-past pending"></i> `;
    // Append grid item to container
    parentContainer.appendChild(gridItem);
}
async function fetchJSONData(url) {
    try {
        const response = await fetch(url); // Fetch the data from the URL
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse the response as JSON
        return data; // Return the JSON data
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Throw the error to be handled by the caller
    }
}
// Usage example
async function getJsonData() {
    const url = server+"/api/json"; // Your API endpoint
    try {
        const data = await fetchJSONData(url); // Fetch and get JSON data
      
        return data; // Optionally return the data for further processing
    } catch (error) {
        console.error("Error:", error);
    }
}
// Call the function to get the data
async function updateConnection() {
    var data = await getJsonData();
    var ftpChecker = document.getElementById("ftpchecker");
    ftpChecker.onclick=null;
    ftpChecker.style.cursor="no-drop";
    var promises = data.FTPList.map(server => checkFTPConnectionPerServer(server));
    await Promise.all(promises);
    ftpChecker.onclick=updateConnection;
    ftpChecker.style.cursor="pointer";
}
async function deleteFTPServer(){
    try{
        var data = await getJsonData();
        for( var i=0;i<deletedarray.length;i++)
        {
            var code = deletedarray[i];
            var host = await data.FTPList.find(item=>{return item.code==code});
            const formData = {
               code:code
            };
            try {
                const response = await fetch(server+'/api/json/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Ensure it's JSON
                    },
                    body:  JSON.stringify(formData) // Send the form data as JSON
                });
                const messagedata = await response.json();
                if (response.ok) {
                    
                    var item = document.getElementById(code);
                    showNotification("Deleted "+host.host+" successfully!",3000);
                    deletedarray.splice(i,1);
                    i--;
                    item.parentNode.removeChild(item);
                } else {
                    showNotification(`Error: ${messagedata.result.messages}`, 5000); // Show error message
                }
            } catch (error) {
                showNotification(error, 5000); // Show connection error
            }
           
        }
        // await Promise.all(promises);
    }catch(err)
    {
        showNotification(err,3000);
    }đ
}
async function checkFTPConnectionPerServer(server) {
    var connection={};
    var item =document.getElementById(server.code);
    var icon = item.querySelector("#FTPstatus");
    const loadingGif = document.createElement("img");
    loadingGif.classList.add('loading');
    loadingGif.src = "../assets/Loading.gif"; // Set the GIF path
    loadingGif.alt = "Loading...";
    loadingGif.id="loadingStatus";
    // Replace the <i> tag with the <img> tag
    item.append(loadingGif);
    icon.parentNode.removeChild(icon);
    const requestBody = {
        host: server.host,
        user: server.username,
        password: server.password
    };
    connection = await checkConnection(requestBody);
    loadingGif.parentNode.removeChild(loadingGif);
    const statusIcon = document.createElement("i");
    statusIcon.id="FTPstatus";
    if(connection.status ==true)
        statusIcon.classList.add("fi", "fi-rr-wifi","connected");
    else
    {
        statusIcon.classList.add("fi", "fi-rr-wifi-slash","disconnected");
        statusIcon.setAttribute("data-error","Err: "+connection.message)
    }
    item.append(statusIcon);
}

function showNotification(message, duration = 3000) {
    const notificationContainer = document.getElementById('notification-container');

    // Create the notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}<span> 
        <button style="position:relative; top:-1px;right:-5px;float:right" onclick="closeNotification()">✖</button>
    `;

    // Append the notification to the container
    notificationContainer.appendChild(notification);

    // Set a timer to close the notification automatically
    setTimeout(() => {
        closeNotification();
    }, duration);
}

// Function to close the notification
function closeNotification() {
    const notificationContainer = document.getElementsByClassName('notification')[0];
    if (notificationContainer.parentNode) {
        notificationContainer.parentNode.removeChild(notificationContainer);
    }
}

// showNotification("This is a notification message!", 5000);
//Add to deleted Array
function addToDeletedArray()
{
    var deleteButton =document.getElementById("ftp-delete-button");
    if (this.checked==1) {
        deletedarray.push(this.value);
        deleteButton.style.display="inline"
        
    } else {
        var index = deletedarray.indexOf(this.value);
        deletedarray.splice(index,1);
        if(deletedarray.length==0)
           deleteButton.style.display="none"
    }
}