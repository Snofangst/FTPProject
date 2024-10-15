var nodeport=3000;
// Get modal element
const modal = document.getElementById("form-modal");
// Get open modal button
const openModalButton = document.getElementById("open-modal");
// Get close button
const closeModalButton = document.getElementById("close-modal");
const cancelModalButton = document.getElementById("cancel-modal");
const errorMessage = document.getElementById("password-message");
const inputField = document.getElementById("password-input");
// Listen for open click
const ftpForm = document.getElementById('ftp-form');
document.getElementById("password-input").addEventListener("keypress", passwordKeyPressValidator);
document.getElementById("host-input").addEventListener("keypress", passwordKeyPressValidator);
document.getElementById("user-input").addEventListener("keypress", passwordKeyPressValidator);
document.getElementById("confirm-password-input").addEventListener("keypress", passwordKeyPressValidator);

document.getElementById("password-input").addEventListener("paste",passwordPasteValidator);
document.getElementById("host-input").addEventListener("paste", passwordPasteValidator);
document.getElementById("user-input").addEventListener("paste", passwordPasteValidator);
document.getElementById("confirm-password-input").addEventListener("paste",passwordPasteValidator);
openModalButton.onclick = function() {
    modal.style.display = "block";
}

// Listen for close click
closeModalButton.onclick = function() {
    modal.style.display = "none";
}
cancelModalButton.onclick = function() {
    modal.style.display = "none";
}

// Listen for outside click
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function passwordKeyPressValidator(event) {
   
    if (event.key === " ") {
        event.preventDefault();  // Prevent space key from being registered
        this.setCustomValidity("Không thể nhập khoảng trắng.");
        this.classList.add("error-border");
        this.reportValidity();
    } else {
        errorMessage.textContent = "";  // Clear the error message if input is valid
        this.classList.remove("error-border");
        this.setCustomValidity("");
        
    }
}
// Function to prevent space on keypress and display error
function passwordPasteValidator (event) {
    const pastedData = (event.clipboardData || window.clipboardData).getData('text');
    if (pastedData.includes(" ")) {
        event.preventDefault();  // Prevent pasting if there is a space
        this.classList.add("error-border");
        this.setCustomValidity("Không thể nhập khoảng trắng.");
        this.classList.add("error-border");
        this.reportValidity();
    } else { 
        this.classList.remove("error-border");
        this.setCustomValidity(""); // Clear the error message if input is valid
    }
}

// Function to prevent space when pasting into the input and display error
ftpForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    // Gather form data
    const formData = {
        host: ftpForm.hostinput.value,
        user: ftpForm.userinput.value,
        password: ftpForm.passwordinput.value,
        name: ftpForm.nameinput.value
    };
    // Post the data to the server
    try {
        const response = await fetch('http://localhost:3000/api/json/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Ensure it's JSON
            },
            body:  JSON.stringify(formData) // Send the form data as JSON
        });

        const data = await response.json();
        if (response.ok) {
            const gridContainer = document.getElementById('ftpGrid');
            showNotification(`${data.result.messages}!`,5000);
            formData.code = data.result.generatedCode;
            await addNewFTPDisplay(formData,gridContainer);
            ftpForm.hostinput.value="";
            ftpForm.userinput.value="";
            ftpForm.passwordinput.value="";
            ftpForm.nameinput.value="";
        } else {
            showNotification(`Error: ${data.result.messages}`, 5000); // Show error message
        }
    } catch (error) {
        showNotification('Error: Could not connect to the server.', 5000); // Show connection error
    }
});


//Confirm pop-up

const deletepopup = document.getElementById("delete-popup");
// Get open modal button
const openConfirmDeletePopUpButton = document.getElementById("ftp-delete-button");
// Get close button
const closeConfirmDeletePopUpButton = document.getElementById("close-delete-popup");
const cancelConfirmDeletePopUpButton = document.getElementById("cancel-delete-popup");
const deleteFtpForm = document.getElementById('delete-ftp-form');
openConfirmDeletePopUpButton.onclick = function() {
    deletepopup.style.display = "block";
}

// Listen for close click
closeConfirmDeletePopUpButton.onclick = function() {
    deletepopup.style.display = "none";
}
cancelConfirmDeletePopUpButton.onclick = function() {
    deletepopup.style.display = "none";
}
deleteFtpForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    // Gather form data
    deleteFTPServer();
    deletepopup.style.display = "none";
})