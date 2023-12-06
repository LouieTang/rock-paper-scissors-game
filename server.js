// // EVERYTHING SERVER SIDE GOES HERE
let win = 0;
let loss = 0;
let draw = 0;
let body = ''; //0 for paper, 1 for rock, 2 for scissors
const abbrv = {'R': 'Rock', 'P': 'Paper', 'S': 'Scissors'}; //Map for abbreviations
let arrived= false; 

var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors({
  origin: 'http://cpen291-13.ece.ubc.ca',
  methods: ['FETCH', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const http = require('http');

// Create a server and listen for requests on port 443
http.createServer(async(req, res) => {
  console.log('Received request from client');

  // Send a response to the client

  // let response = predict(req); //get prediction off of the model below
  // console.log(response);
  res.setHeader('Access-Control-Allow-Origin', '*');// added this line idk will it work
  if(req.url === '/reset'){
	res.write('wins: ' + win.toString() + ' draws: ' + draw.toString() + ' losses: ' + loss.toString() + ' win%: ' + Math.round(win/(win+draw+loss)*10000)/100 + '%'); //write response
  	reset();
  }
  else if(req.url === '/rock'){
//	while(arrived ==false){
//	setTimeout(() => { console.log('After 15second');}, 15000);
//	}
const result = await new Promise(resolve => setTimeout(() => resolve("Hello"),15000)); //force this thread to wait 15s such that the prediction arrive first
//	let choice = predict(body)
	let choice = predict(req);
	//Rock();
	console.log(choice);
	res.write('Robot Plays: ' + abbrv[choice.toString()]);
	arrived=false;
/*	waitUntilArrived(body, async () => {
      let choice = predict(body);
//      Rock();
	console.log(choice);
      res.write('Robot Plays: ' + abbrv[choice.toString()]);
      arrived = false;
    });*/
}
  else if(req.url === '/paper'){
//	while(arrived ==false){
//	setTimeout(() => { console.log('After 15second');}, 15000);
//	}
const result = await new Promise(resolve => setTimeout(() => resolve("Hello"),15000));
//	let choice = predict(body)
	let choice = predict(req);
	//Rock();
	console.log(choice);
	res.write('Robot Plays: ' + abbrv[choice.toString()]);
	arrived=false;
/*	waitUntilArrived(body, async () => {
      let choice = predict(body);
//      Rock();
	console.log(choice);
      res.write('Robot Plays: ' + abbrv[choice.toString()]);
      arrived = false;
    });*/
}
else if(req.url === '/scissors'){
  //	while(arrived ==false){
  //	setTimeout(() => { console.log('After 15second');}, 15000);
  //	}
  const result = await new Promise(resolve => setTimeout(() => resolve("Hello"),15000));
  //	let choice = predict(body)
    let choice = predict(req);
    //Rock();
    console.log(choice);
    res.write('Robot Plays: ' + abbrv[choice.toString()]);
    arrived=false;
  /*	waitUntilArrived(body, async () => {
        let choice = predict(body);
  //      Rock();
    console.log(choice);
        res.write('Robot Plays: ' + abbrv[choice.toString()]);
        arrived = false;
      });*/
  }
else if(req.url === '/prediction'){
 	body='';
 	 req.on('data', chunk => {  // listen for incoming data
    	body += chunk.toString();  // append incoming data to the body variable
  	});

  	req.on('end', () => {  // listen for the end of the request
	console.log(body);
   	console.log("payload received");
	body = body.replace(/[^0-9]/g, ''); // replace all non-numeric characters with an empty string
	console.log(body);
	if(body=== '0'){
		body= 'P';
	}
	else if(body=== '1'){
                body= 'R';
        } 
	else if(body=== '2'){
                body= 'S';
        }
	arrived=true;
    try {
	
      res.statusCode = 200;
    	} catch (err) {  // handle JSON parsing errors
     	 res.statusCode = 400;
      	return res.end(`Error: ${err.message}`);
    }

  });
}
	console.log('finished response');
  res.end(); //end response
}).listen(443, () => {
  console.log('Server listening on port 443');
});


function waitUntilArrived(body, callback) {
  if (arrived) {
    callback();
  } else {
    setTimeout(() => {
      waitUntilArrived(body, callback);
    }, 100);
  }
}


const beat = {'R': 'P', 'P': 'S', 'S': 'R'}; //Map for win conditions with each outcome (eg. paper beats rock)

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
      const newKeys = keys.reduce((acc, k1) => {
        const pairs = keys.map((k2) => k1 + k2);
        return acc.concat(pairs);
      }, []);
      keys.splice(0, keyLen);
      keys.push(...newKeys);
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
let currentPair = '';
let previousPair = '';

function predict(input) {
    let previousPair = '';
    let currentPair = '';
  
    if (input === '') { //if no move
      random_predictor = new RandomPredictor();
      markov_model = new MarkovChain(1, 0.9, random_predictor);
    } else { //if move happened already
      currentPair = previousPair;
      previousPair = output + input;
    }
    if (currentPair !== '') { //update matrix based on previous input
      markov_model.updateMatrix(currentPair, input);
      output = beat[markov_model.predict(previousPair)];
    } else {
      output = random_predictor.predict(); //random if not enough data
    }
  
    // Returns decision
    return output;
}


function reset(){ //resets win/loss/draw, resets markov chain for new player.
  win = 0;
  loss = 0;
  draw = 0;
  markov_model = new MarkovChain(1, 0.9, random_predictor);
  currentPair = '';
  previousPair = '';
	console.log('reset complete');
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
