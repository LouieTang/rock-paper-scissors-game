// EVERYTHING CLIENT SIDE GOES HERE

let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
//var http = require('http');



camera_button.addEventListener('click', async function() {
   	let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
	video.srcObject = stream;
});

function startCountdown() {
  var count = 5;
  var timer = setInterval(function() {
    document.getElementById("countdown").innerHTML = count;
    count--;
    if (count === -1) {
      document.getElementById("countdown").innerHTML = "Shoot";
      clearInterval(timer);
      canvas.getContext('2d').drawImage(video, 0, 0, 64, 64);
   	let image_data_url = canvas.toDataURL('image/jpeg');

   	// data url of the image
   	console.log(image_data_url);

     // Create a new XMLHttpRequest object
     var xhr = new XMLHttpRequest();
     
     // Set the responseType to 'blob' to get the response as a binary object
     xhr.responseType = 'blob';
     
     // Send an HTTP GET request to the URL of the image
     xhr.open('GET', image_data_url);
     xhr.send();
     
     // Define a function to handle the response when it arrives
     xhr.onload = function() {
       if (xhr.status === 200) {
         // Create a new Blob object from the response
         var blob = new Blob([xhr.response], {type: 'image/jpeg'});
     
         // Create a new link element and set its href and download attributes
         var link = document.createElement('a');
         link.href = URL.createObjectURL(blob);
         link.download = 'rock_paper_scissors.jpg';
     
         // Simulate a click on the link to download the file
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
       }
	xhr = null;
     };
    }
  }, 1000);
	fetch('http://<>/paper')
    .then(response => response.text())
    .then(data => {
      console.log(`Received data from server: ${data}`);
	console.log('here');
	displayOnPage('', 'output');
	displayOnPage(data.toString(), 'stats');
	console.log('finished');
    })
    .catch(error => {
      console.log(`Error: ${error.message}`);
    });
};


document.getElementById("click-photo").addEventListener("click", startCountdown);

// Get a reference to the button element
let endButton = document.querySelector('#reset');

// Add a click event listener to the button
endButton.addEventListener('click', () => {
  // Send a request to the server when the button is clicked
  fetch('http://<>/reset')
    .then(response => response.text())
    .then(data => {
      console.log(`Received data from server: ${data}`);
	console.log('here');
	displayOnPage('', 'output');
	displayOnPage(data.toString(), 'stats');
	console.log('finished');
    })
    .catch(error => {
      console.log(`Error: ${error.message}`);
    });
});

let rockButton = document.querySelector('#rock');

rockButton.addEventListener('click', () => {
	fetch('http://<>/rock')
	.then(response => response.text())
	.then(data => {
		console.log(`Received data from server: ${data}`);
		displayOnPage(data.toString(), 'output');
		displayOnPage('', 'stats');
	//	Rock();
	})
	.catch(error => {
		console.log(`Error: ${error.message}`);
	});
});

let paperButton = document.querySelector('#paper');

paperButton.addEventListener('click', () => {
	fetch('http://<>/paper')
	.then(response => response.text())
	.then(data => {
		console.log(`Received data from server: ${data}`);
		displayOnPage(data.toString(), 'output');
		displayOnPage('', 'stats');
	})
	.catch(error => {
		console.log(`Error: ${error.message}`);
	});
});

let scissorsButton = document.querySelector('#scissors');

scissorsButton.addEventListener('click', () => {
	fetch('http://<>/scissors')
	.then(response => response.text())
	.then(data => {
		console.log(`Received data from server: ${data}`);
		displayOnPage(data.toString(), 'output');
		displayOnPage('', 'stats');
	})
	.catch(error => {
		console.log(`Error: ${error.message}`);
	});
});




// the output aspect of the html, here is what we output back to the webpage
// document.getElementById('output').innerHTML = 'Robot plays: ';
// events, do on click
// const endButton = document.getElementById('#reset');
// endButton.addEventListener('click', function handleClick() { //End game, reset everything
//   displayOnPage('', 'output');
//   displayOnPage('wins: ' + win.toString() + ' draws: ' + draw.toString() + ' losses: ' + loss.toString() + ' win%: ' + Math.round(win/(win+draw+loss)*10000)/100 + '%', 'stats');
//   // reset();
// });  


function displayOnPage(str, ele){ //display on page, depends on element
  document.getElementById(ele).innerHTML = str;
}


function Scissors() {
  fetch('http://<>/move-servos', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({'anglein': 180, 'angleth': 0})
  })
};

function Paper() {
  fetch('http://<>/move-servos', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({'anglein': 180, 'angleth': 180})
  })
};

function Rock() {
const data = JSON.stringify({'anglein': 0, 'angleth': 0});

const options = {
  hostname: '<>',
  port: 80,
  path: '/move-servos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
	console.log('here');
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});
console.log('written to: ' + options.hostname.toString());
req.write(data);
req.end();
};
