/*
This code defines a function that handles a client login attempt.  When a client attempts to log in, the function checks if the provided username and password match any of the default credentials stored in the 'credentials.json' file. If a match is found, the function sends a 'loginSucceed' message to the client, updates the random connected client to include the username of the logged-in user, emits the 'update' event to the 'frontendmonitor' room with the current list of user IDs, and exports the function for other modules to use. If no match is found, the function sends a 'loginFailed' message to the client indicating that the provided credentials were invalid.
*/

// Import the required functions and modules
const globals = require("../globals.js");
const credentials = require("../credentials.json");
let clientFailCounter = 0;

// Define a function to handle a client login attempt
function clientLogin(data, socket, io) {
  console.log("");

  // Check if provided username and password match any of the default credentials
  const match = credentials.find(cred =>
    cred.username === data.username &&
    cred.password === data.password
  );

  // If a match is found
  if (match) {
    console.log(socket.id, "Successful login using default credentials! From", socket.id);

    // Send message to the client saying that login was successful
    socket.emit('loginSucceed');

    // Import food array global here
    socket.emit(globals.getGlobal("foodArray"));

    // Update the random connectedclient to include the user name of the logged in user
    let connectedclients = globals.getGlobal("connectedclients");
    const clientIndex = connectedclients.findIndex(client => client.id === socket.id);
    console.log("[clientLogin]: Client index:", clientIndex);
    if (clientIndex !== -1) {
      console.log("[clientLogin]: Setting name:", socket.id + " - " + data.username);
      connectedclients[clientIndex].username = match.username;
      connectedclients[clientIndex].type = match.type;
    
    }

    // Emit the newly logged in user to the frontend
    io.emit('initopponents', [{
      "username": connectedclients[clientIndex].username ,
      "x": connectedclients[clientIndex].x,
      "y": connectedclients[clientIndex].y,
      "type": connectedclients[clientIndex].type,
    }]);

    // Emit the 'update' event to the 'frontendmonitor' room with the current list of user IDs
    //console.log("[clientLogin]: Sending user ID's:", connectedclients);
    io.to('frontendmonitor').emit('update', connectedclients);

  } else {
    // No match was found
    console.log(socket.id, "Invalid username or password");

    // Send message to the client saying that login was unsuccessful
    socket.emit('loginFailed', 'Invalid username or password');

    clientFailCounter++;
  }
}

function deactivateLoginButton() {

}

if (clientFailCounter == 4) {
  console.log(" !!WARNING!! Too many failed login attemps.");
  console.log("One more attempt before IP is stolen");
} else if (clientFailCounter >= 5) {
  deactivateLoginButton();
  clientFailCounter == 0;
}

// Export the function for other modules to use
module.exports = clientLogin;
