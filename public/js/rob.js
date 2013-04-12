$(document).ready(function() {
  	//var rowTemplate = "<tr class='{{rowClass}} row-{{status}}'><td>{{status}}</td><td>{{file}}</td><td>{{link}}</td><td><a href='{{url}}' target='_new'>{{url}}</a></td><td>{{notes}}</td></tr>"
  	//var currentFileTemplate = "<div class='currentFile'>{{fileName}}</div>";
	var socket = io.connect('http://localhost:17500');

	socket.on('clientConnected', function (data) {
		$('#currentListeners').html(data.clientCount);
	});



	socket.on('clientDisconnected', function (data) {
		$('#currentListeners').html(data.clientCount);
	});

	socket.on('saidIt', function(data) {
		$('#currentCount').html(data.saidCount);
		$('#lastReported').html(data.reporter);
	});

	socket.on('didntSayIt', function(data) {
		$('#currentCount').html(data.saidCount);
		$('#lastContested').html(data.reporter);
	});

	

	$('#report').click(function() {
	  socket.emit('saidIt', { reporter: 'unknown'}); 
	});

	$('#contest').click(function() {
		socket.emit('didntSayIt', { reporter: 'unknown' }); 
 	});
});