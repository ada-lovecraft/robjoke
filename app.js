
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , levelup = require('levelup')

var app = express();
var yourmother = null;
var activeClients = 0;

var server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8000); 

// all environments
app.set('port', 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

levelup('db/yourmother', function (err,db) {
	if (!err) {
		yourmother = db;
		yourmother.on('ready', function() {
			yourmother.put('timesSaid',0);
		});
	} else {
		console.log(err);
	}
});

levelup('db/log', function(err,db) {
	if (!err) {
		log = db;
	} else {
		console.log(err);
	}
});

io.sockets.on('connection', function (socket) {

	clientConnect(socket);
  	socket.on('disconnect', function() { clientDisconnect(socket); });
  	socket.on('saidIt', function(data) {
  		increaseTimes(socket,data); 
  	});
  	socket.on('didntSayIt', function(data) {
  		decreaseTimes(socket,data);
  	});
});

function clientConnect(socket) {
	activeClients++;
	socket.broadcast.emit('clientConnected', { clientCount: activeClients })
	socket.emit('clientConnected', { clientCount: activeClients });
	console.log('activeClients: ' + activeClients)
	socket.emit('robLog', { data: 'someData' } );
	yourmother.get('timesSaid', function(err, value) {
		if (!err) {
			socket.emit('saidIt', { saidCount: value, reporter:'unknown' } );
		} else {
			console.log("ERROR INCREASING: " + err);
		}
	});

}

function clientDisconnect(socket) {
	activeClients--;
	socket.broadcast.emit('clientDisconnected', { clientCount: activeClients });
}

function increaseTimes(socket,data) {
	yourmother.get('timesSaid', function(err, value) {
		if (!err) {
			value++;
			yourmother.put('timesSaid', value);
			socket.broadcast.emit('saidIt', { saidCount: value, reporter:data.reporter }  );
			socket.emit('saidIt', { saidCount: value, reporter:data.reporter } );
		} else {
			console.log("ERROR INCREASING: " + err);
		}
	});
}

function decreaseTimes(socket,data) {
	console.log(data);
	yourmother.get('timesSaid', function(err, value) {
		if (!err) {
			value--;
			if (value < 0)
				value = 0;
			yourmother.put('timesSaid', value);
			socket.broadcast.emit('didntSayIt', { saidCount: value, reporter: data.reporter }  );
			socket.emit('didntSayIt', { saidCount: value, reporter:data.reporter } );
		}
		else {
			console.log("ERROR DECREASING: " + err);
		}
	});
}

