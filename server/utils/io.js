const Rooms = require('./Rooms');
const { generateServerMessage, generateUserMessage } = require('../utils/message');

exports.setupIO = (io) => {
  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', async (data) => {
      console.log('joining user', data);
      const { roomId, name, userId, videoId } = data;
      console.log(`User ${name} just joined in room ${roomId}`);

      socket.join(roomId);
      await Rooms.addRoom(roomId, videoId);
      await Rooms.addUser(roomId, name, userId); // data.userId = socket.id
      // Rooms.showInfo();

      // emit to all except the joined user
      socket.broadcast.to(roomId).emit(
        'newMessage',
        generateServerMessage('userJoin', {
          roomId,
          name,
          userId,
        })
      );

      // tell everyone in the room to update their userlist
      io.to(roomId).emit('updateUserList', await Rooms.getUserList(roomId));

      // if the user joined existing room, tell him about the playing video
      if (!videoId) {
        const room = await Rooms.getRoom(roomId);
        socket.emit(
          'newMessage',
          generateServerMessage('changeVideo', {
            videoId: room.videoId,
          })
        );
      }
    });

    socket.on('createMessage', async (message) => {
      const user = await Rooms.getUser(socket.id);

      if (user) {
        io.to(user.roomId).emit(
          'newMessage',
          generateUserMessage(user.name, user.id, message)
        );
        console.log('new message received', message);
      }
    });

    socket.on('videoStateChange', async (data) => {
      const user = await Rooms.getUser(socket.id);
      console.log('videoStateChange trigerred', data);
      // tell others to update the videoState
      socket.broadcast.to(user.roomId).emit(
        'newMessage',
        generateServerMessage('updateVideoState', {
          type: data.type,
          ...data.payload,
          user: {
            name: user.name,
            id: socket.id,
          },
        })
      );
    });

    socket.on('changeVideo', async (data) => {
      const { videoId } = data;
      const user = await Rooms.getUser(socket.id);
      io.to(user.roomId).emit(
        'newMessage',
        generateServerMessage('updateVideoId', { videoId, user })
      );
      await Rooms.setVideoId(user.roomId, videoId);
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected');
      const user = await Rooms.removeUser(socket.id);
      // Rooms.showInfo();
      console.log(`${user.name} has left`);

      io.to(user.roomId).emit(
        'newMessage',
        generateServerMessage('userLeft', {
          name: user.name,
          userId: user.id,
          roomId: user.roomId,
        })
      );

      // tell everyone in the room to update their userlist
      io.to(user.roomId).emit(
        'updateUserList',
        await Rooms.getUserList(user.roomId)
      );
    });
  });
};