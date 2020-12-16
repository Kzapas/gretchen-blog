// Initialize Firebase
var config = {
	apiKey: "AIzaSyC9C8633jrajY-PWnWEVc3Vg-IeS0Fc7QY",
    authDomain: "gretchen-ec590.firebaseapp.com",
    databaseURL: "https://gretchen-ec590-default-rtdb.firebaseio.com",
    projectId: "gretchen-ec590",
    storageBucket: "gretchen-ec590.appspot.com",
    messagingSenderId: "761971405474",
    appId: "1:761971405474:web:b0c3ad92d780c135149dfb",
    measurementId: "G-C774QNLG51"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();
var chatMsgs = firebase.database().ref().child('chat');

// Bind elements
const inputName = document.getElementById('input-name');
const inputPass = document.getElementById('input-pass');
const btnLogin = document.getElementById('btn-login');
const inputMsg = document.getElementById('input-message');
const inputTxt = document.getElementById('input-msg');
const btnSendMsg = document.getElementById('btn-sendMsg');
const chatWrap = document.getElementById('chat-wrap');
const pageLogin = document.getElementById('page-login');
const pageChat = document.getElementById('page-chat');
const yourName = document.getElementById('your-name');
var userName = "";
var postTime = "";
var userPass = "";
const auth = firebase.auth();

function timeNow() {
	var d = new Date();
	var hr = d.getHours();
	var min = d.getMinutes();
	if (min < 10) {
		min = "0" + min;
	}
	var ampm = " am";
	if( hr > 12 ) {
		hr -= 12;
		ampm = " pm";
	}
	var date = d.getDate();
	postTime = hr + ":" + min + ampm;
}
timeNow();

function account() {
	  if (firebase.auth().currentUser != null) {
		firebase.auth().signOut();
	  }
	  
	  if (firebase.auth().currentUser == null) {
		  pageLogin.classList.remove('d-none');
		  pageChat.classList.add('d-none');
	  }
}

// App start here
var app = {
// Initialize the app
  init: function() {
    this.getName();
    this.fireListen();
  },
// Look for user name in local storage
  getName: function() {
    firebase.auth().onAuthStateChanged(user => {
	  if (user) {
		  pageLogin.classList.add('d-none');
		  pageChat.classList.remove('d-none');
		  inputTxt.classList.remove('d-none');
		  window.scrollTo(0,document.body.scrollHeight);
		  this.setName();
	  }
	  if (!user) {
		  inputTxt.classList.add('d-none');
		  userName = "Guest";
		  yourName.innerHTML = userName;
	  }
    })
  },
// Login for new user
  login: function() {
    if (inputName.value && inputPass.value) {
      userName = inputName.value;
	  userPass = inputPass.value;
      auth.signInWithEmailAndPassword(userName, userPass).catch(function(error){
		var errorCode = error.code;
		var errorMessage = error.message;
		var res = errorMessage.replace(error.message, "This account is not valid.");
		alert(res);
	  });
	  /*firebase.auth().onAuthStateChanged(user => {
	  if (user) {
		  pageLogin.classList.add('d-none');
		  pageChat.classList.remove('d-none');
		  inputTxt.classList.remove('d-none');
		  window.scrollTo(0,document.body.scrollHeight);
		  this.setName();
		  console.log("logged in - login func");
	  }
	  })*/
    } else {
      if (userName == '' || userPass == ''){
			alert("Please fill out the field");
		}
    }
  },
  setName: function() {
	userName = "Gretchen Watkins";
    yourName.innerHTML = userName;
  },
// Get chat message from database & listen to update
  fireListen: function() {
    chatMsgs.on('value', function(chatMsgs) {
      var displayMsgs = document.createElement('div');
      chatMsgs.forEach(function(chatMsg) {
        // console.log(chatMsg.val());
        var message = chatMsg.val().message;
        var sender = chatMsg.val().sender;
		var time = chatMsg.val().time;
        var displayMsg = app.displayMsg(message, sender, time);
        displayMsgs.append(displayMsg);
      });
      chatWrap.innerHTML = "";
      chatWrap.append(displayMsgs);
      app.scrollBtm();
    });
  },
// Writing data to firebase, add new item with .push, replace entire list with .set
  writeMessage: function(sender, message) {
    firebase.database().ref('chat/').push({
      sender: sender,
      message: message,
	  time: postTime
    });
  },
// Send message when click on submit button
  sendMsg: function() {
    if (inputMsg.value) { // Only send when input is not empty
      this.writeMessage(userName, inputMsg.value);
      inputMsg.value = "";
    }
  },
// Scroll to bottom
  scrollBtm: function() {
    window.scrollTo(0,document.body.scrollHeight);
  },
// Construct chat bubble
  displayMsg: function(message, sender, time) {
    var displayMsg = document.createElement('div');
    var displaySender = document.createElement('div');
	var youtubeURL = message.substring(0, 32);
	var regurl = message.substring(0, 7);
	if (youtubeURL == "https://www.youtube.com/watch?v=") {
		var urlID = message.slice(32);
		displayMsg.innerHTML = "<br><div id='iframe-yt'><iframe width='560' height='315' src='https://www.youtube.com/embed/"+urlID+"' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe></div>"
	} else if (regurl == "https:/" || regurl == "http://") {
		displayMsg.innerHTML = "<a target='_blank' href='"+message+"'>"+message+"</a>";
	} else {
    displayMsg.innerHTML = message;
	}
    displaySender.innerHTML = "<strong style='font-size:15px;'>" + sender + "</strong>" + "&nbsp; &nbsp;" + time;
    displaySender.classList.add('sender');
	displayMsg.classList.add("card", "message", "p-2", "mb-2");
	displayMsg.prepend(displaySender);
    return displayMsg;
  }
};

inputMsg.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    
    btnSendMsg.click();
  }
});

app.init();