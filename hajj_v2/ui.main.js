

function getElement(selector) {
    return document.querySelector(selector);
}

var main = getElement('.main');

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function addNewMessage(args) {
    var newMessageDIV = document.createElement('div');
    newMessageDIV.className = 'new-message';

    var userinfoDIV = document.createElement('div');
    userinfoDIV.className = 'user-info';
    userinfoDIV.innerHTML = args.userinfo || '<img src="images/user.png">';
    userinfoDIV.style = 'visibility: hidden;width: 0px;height: 0px;margin-top: 0px;margin-bottom: 0px;';
    userinfoDIV.style.background = args.color || rtcMultiConnection.extra.color || getRandomColor();

    newMessageDIV.appendChild(userinfoDIV);

    var userActivityDIV = document.createElement('div');
    userActivityDIV.className = 'user-activity';
    userActivityDIV.style = '';
    userActivityDIV.innerHTML = '<h2 style="visibility: hidden;margin-bottom: 0px;margin-top: 0px;width: 0px;height: 0px;" class="header">' + args.header + '</h2>';

    var p = document.createElement('p');
    p.className = 'message';

    userActivityDIV.appendChild(p);
    p.innerHTML = args.message;
    p.style = 'margin-bottom: 0px;margin-top: 0px;';
    newMessageDIV.appendChild(userActivityDIV);

    main.insertBefore(newMessageDIV, main.firstChild);

    userinfoDIV.style.height = 'visibility: hidden; 0 px';

    if (args.callback) {
        args.callback(newMessageDIV);
    }

    document.querySelector('#message-sound').play();
}





if(localStorage.getItem('user-name')) {
    
}

main.querySelector('#continue').onclick = function() {
   
    var roomName = this.parentNode.querySelector('#room-name');
    
    if(!roomName.value || !roomName.value.length) {
        roomName.focus();
        return alert('Your MUST Enter Room Name!');
    }
    
    localStorage.setItem('room-name', roomName.value);
    
    
     roomName.disabled = this.disabled = true;

    var username ='Anonymous';

    rtcMultiConnection.extra = {
        username: username,
        color: getRandomColor()
    };

    addNewMessage({
        header: username,
        message: 'Searching for existing rooms...',
        userinfo: ''
    });
    
    var roomid = main.querySelector('#room-name').value;
    rtcMultiConnection.channel = roomid;
	
	var firebaseRoomSocket = new Firebase(rtcMultiConnection.resources.firebaseio + rtcMultiConnection.channel + 'openjoinroom');
	
	firebaseRoomSocket.once('value', function (data) {
		var sessionDescription = data.val();

		// checking for room; if not available "open" otherwise "join"
		if (sessionDescription == null) {
			addNewMessage({
                header: username,
                message: 'No room found. Creating new room...<br /><br />You can share following room-id with your friends: <input type=text value="' + roomid + '">',
                userinfo: '<img src="images/action-needed.png">'
            });

            rtcMultiConnection.userid = roomid;
            rtcMultiConnection.open({
                dontTransmit: true,
                sessionid: roomid
            });
			
			firebaseRoomSocket.set(rtcMultiConnection.sessionDescription);
					
			// if room owner leaves; remove room from the server
			firebaseRoomSocket.onDisconnect().remove();
		} else {
			addNewMessage({
                header: username,
                message: 'Room found. Joining the room...',
                userinfo: '<img src="images/action-needed.png">'
            });
            rtcMultiConnection.join(sessionDescription);
		}

		console.debug('room is present?', sessionDescription == null);
	});
};

function getUserinfo(blobURL, imageURL) {
    return blobURL ? '<video src="' + blobURL + '" autoplay controls></video>' : '<img src="' + imageURL + '">';
}

var isShiftKeyPressed = false;



var numberOfKeys = 0;


getElement('#allow-webcam').onclick = function() {
    this.disabled = true;

    var session = { audio: true, video: true };

    rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasCamera: true,
            streamid: streamid,
            session: session
        });
    }, session);
};

getElement('#allow-mic').onclick = function() {
    this.disabled = true;
    var session = { audio: true };

    rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasMic: true,
            streamid: streamid,
            session: session
        });
    }, session);
};

getElement('#allow-screen').onclick = function() {
    this.disabled = true;
    var session = { screen: true };

    rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasScreen: true,
            streamid: streamid,
            session: session
        });
    }, session);
};

getElement('#share-files').onclick = function() {
    var file = document.createElement('input');
    file.type = 'file';

    file.onchange = function() {
        rtcMultiConnection.send(this.files[0]);
    };
    fireClickEvent(file);
};

function fireClickEvent(element) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
