const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let studentCounter = 1;
const students = {};  // Mapping of studentId to socketId

app.use(express.static('public'));

io.on('connection', (socket) => {
  // Assign a new ID to each student who joins
  let studentId = 'student' + studentCounter++;
  students[studentId] = socket.id;

  // Notify the student of their assigned ID
  socket.emit('assignId', { studentId });
  console.log(`${studentId} has joined with socket id: ${socket.id}`);

  // Handle student messages to admin
  socket.on('studentMessage', ({ studentId, message }) => {
    console.log(`Message from ${studentId}: ${message}`);
    // Send message to admin (broadcast to all admin clients)
    io.emit('messageFromStudent', { studentId, message });
  });

  // Handle admin responses to students
  socket.on('adminMessage', ({ studentId, message }) => {
    const studentSocketId = students[studentId];
    if (studentSocketId) {
      io.to(studentSocketId).emit('messageFromAdmin', { message });
      console.log(`Admin to ${studentId}: ${message}`);
    }
  });

  // Handle admin broadcast to all students
  socket.on('adminBroadcastMessage', ({ message }) => {
    // Broadcast the message to all connected students
    for (const studentId in students) {
      io.to(students[studentId]).emit('messageFromAdmin', { message });
    }
    console.log(`Admin broadcast: ${message}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`${studentId} disconnected`);
    delete students[studentId];  // Remove student from list
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
