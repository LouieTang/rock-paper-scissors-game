
const beat = {'R': 'P', 'P': 'S', 'S': 'R'}; //Map for win conditions with each outcome

class MarkovChain {
  constructor(order, decay, random_predictor) { //order - how many previous moves to consider, decay is for probability, random_predictor for when there is not enough data.
    this.decay = decay;
    this.matrix = this.createMatrix(order);
    this.random_predictor = random_predictor;
  }

  static createKeys(order) {
    const keys = ['R', 'P', 'S'];

    for (let i = 0; i < (order * 2 - 1); i++) {
      const keyLen = keys.length;
      for (const pair of keys.flatMap((k1) => keys.map((k2) => k1 + k2))) {
        keys.push(pair);
      }
      keys.splice(0, keyLen);
    }

    return keys;
  }

  createMatrix(order) { //create and store probability into matrix
    const keys = MarkovChain.createKeys(order);
    const matrix = {};

    for (const key of keys) {
      matrix[key] = {
        'R': {'prob': 1 / 3, 'n_obs': 0},
        'P': {'prob': 1 / 3, 'n_obs': 0},
        'S': {'prob': 1 / 3, 'n_obs': 0},
      };
    }

    return matrix;
  }

  updateMatrix(pair, input) { //updates and stores updated probability into matrix
    const outcomes = ['R', 'P', 'S'];
    const n_total = Object.values(this.matrix[pair]).reduce((acc, curr) => acc + curr.n_obs, 0);
  
    if (n_total > 0) {
      const n_input = this.matrix[pair][input].n_obs;
      const n_outcomes = outcomes.map((outcome) => this.matrix[pair][outcome].n_obs);
      const n_other = n_total - n_input;
  
      for (const outcome of outcomes) {
        if (outcome === input) {
          this.matrix[pair][input].prob = (n_input + 1) / (n_total + 3);
        } else {
          this.matrix[pair][outcome].prob = (n_outcomes[outcomes.indexOf(outcome)] + this.decay) / (n_other + 3 * this.decay);
        }
      }
    } else {
      for (const outcome of outcomes) {
        if (outcome === input) {
          this.matrix[pair][input].prob = 0.5;
        } else {
          this.matrix[pair][outcome].prob = 0.25;
        }
      }
    }
  
    this.matrix[pair][input].n_obs++;
  }
  

  predict(pair) {
    const probs = this.matrix[pair];
    if (Object.values(probs).every((v) => v === probs['R'])) {
      const choices = ['R', 'P', 'S'];
      return choices[Math.floor(Math.random() * choices.length)];
    } else {
      return Object.entries(probs).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }
  }
}
class RandomPredictor { //random prediction function
    predict() {
      const choices = ['R', 'P', 'S'];
      return choices[Math.floor(Math.random() * choices.length)];
    }
  }
  

let output = '';
let random_predictor = new RandomPredictor();
let markov_model = new MarkovChain(1, 0.9, random_predictor);
let pair_diff2 = '';
let pair_diff1 = '';

function predict(input) {
    let pair_diff1 = '';
    let pair_diff2 = '';
  
    if (input === '') { //if no move
      random_predictor = new RandomPredictor();
      markov_model = new MarkovChain(1, 0.9, random_predictor);
    } else { //if move happened already
      pair_diff2 = pair_diff1;
      pair_diff1 = output + input;
    }
    if (pair_diff2 !== '') { //update matrix based on previous input
      markov_model.updateMatrix(pair_diff2, input);
      output = beat[markov_model.predict(pair_diff1)];
    } else {
      output = random_predictor.predict(); //random if not enough data
    }
  
    // Returns decision
    return output;
}

function displayOnPage(str, ele){ //display on page, depends on element
  document.getElementById(ele).innerHTML = str;
}
function reset(){ //resets win/loss/draw, resets markov chain for new player.
  win = 0;
  loss = 0;
  draw = 0;
  let output = '';
  markov_model = new MarkovChain(1, 0.9, random_predictor);
  pair_diff2 = '';
  pair_diff1 = '';
}

// // need to run these before running :
// // npm install ssh2 express 
// let click_button = document.querySelector("#click-photo");
// let canvas = document.querySelector("#canvas"); 

// // i am not sure how to import it yet, maybe have to use a module bundle
// // it is erroring rn due to the require/import part
// const express = require('express');
// const { Client } = require('ssh2');

// const app = express();

// // Set up the SSH client
// const sshClient = new Client();
// sshClient.connect({
//   host: 'cpen291-13.ece.ubc.ca',
//   port: 22, // Modify this if your SSH server uses a different port
//   username: 'b13root',
//   password: 'BBsoftAstrayGlory+93'
// });
// app.get('/transfer', (req, res) => {

// click_button.addEventListener('click', function() {
//   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
//   let image_data_url = canvas.toDataURL('image/jpeg');
//   // data url of the image
//   console.log(image_data_url);
//   sshClient.scp(Buffer.from(image_data_url.replace(/^data:image\/\w+;base64,/, ''), 'base64'), {
//     path: '//test_picture.jpg'
//   }, (err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Error transferring file');
//     } else {
//       console.log('File transferred successfully');
//       res.status(200).send('File transferred successfully');
//     }
//   });
// });
// });

// // Modify the port number to specify a different port if desired
// app.listen(3000, () => {
//   console.log('Server started on port 3000');
// });








// rockButton.addEventListener('click', function handleClick() {
//   let move = predict('R'); //gets machine's prediction
//   if(move.valueOf() == 'R'){ //if AI plays rock
//     displayOnPage('Robot plays: Rock', 'output'); //calls display function for displaying output on screen
//     draw++; //when both AI and player plays rock, draw increments.
//   }
//   else if (move.valueOf() == 'P'){ //if AI plays paper
//     displayOnPage('Robot plays: Paper', 'output');
//     loss++; //when AI wins, (player) loss increments 
//   }
//   else{ //if AI plays scissors
//     displayOnPage('Robot plays: Scissors', 'output');
//     win++; //when AI loses, (player) win increments 
//   }
// });
// paperButton.addEventListener('click', function handleClick() { //follows same format as above (rock)
//   let move = predict('P');
//   if(move.valueOf() == 'R'){
//     displayOnPage('Robot plays: Rock', 'output');
//     win++;
//   }
//   else if (move.valueOf() == 'P'){
//     displayOnPage('Robot plays: Paper', 'output');
//     draw++;
//   }
//   else{ //scissors case
//     displayOnPage('Robot plays: Scissors', 'output');
//     loss++;
//   }
//  });
// scissorsButton.addEventListener('click', function handleClick() { //follows same format as above (rock)
//   let move = predict('S');
//   if(move.valueOf() == 'R'){
//     displayOnPage('Robot plays: Rock', 'output');
//     loss++;
//   }
//   else if (move.valueOf() == 'P'){
//     displayOnPage('Robot plays: Paper', 'output');
//     win++;
//   }
//   else{ //scissors case
//     displayOnPage('Robot plays: Scissors', 'output');
//     draw++;
//   }
// });  

// click_button.addEventListener('click', function() {
//    	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
//    	let image_data_url = canvas.toDataURL('image/jpeg');

//    	// data url of the image
//    	console.log(image_data_url);

//      // Create a new XMLHttpRequest object
//      var xhr = new XMLHttpRequest();
     
//      // Set the responseType to 'blob' to get the response as a binary object
//      xhr.responseType = 'blob';
     
//      // Send an HTTP GET request to the URL of the image
//      xhr.open('GET', image_data_url);
//      xhr.send();
     
//      // Define a function to handle the response when it arrives
//      xhr.onload = function() {
//        if (xhr.status === 200) {
//          // Create a new Blob object from the response
//          var blob = new Blob([xhr.response], {type: 'image/jpeg'});
     
//          // Create a new link element and set its href and download attributes
//          var link = document.createElement('a');
//          link.href = URL.createObjectURL(blob);
//          link.download = 'rock_paper_scissors.jpg';
     
//          // Simulate a click on the link to download the file
//          document.body.appendChild(link);
//          link.click();
//          document.body.removeChild(link);
//        }
//      };
// });