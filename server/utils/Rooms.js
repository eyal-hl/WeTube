const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    id: String,
    roomId: String,
});

const roomSchema = new Schema({
    roomId: String,
    users: [userSchema],
    videoURL: String,
});

const RoomModel = mongoose.model('Room', roomSchema);

class Rooms {
    constructor() {}

    async addRoom(roomId, videoURL) {
        const existingRoom = await RoomModel.findOne({ roomId });

        if (!existingRoom) {
            const newRoom = new RoomModel({
                roomId,
                users: [],
                videoURL,
            });

            await newRoom.save();
        }
    }

    async setVideoURL(roomId, videoURL) {
        const room = await RoomModel.findOne({ roomId });

        if (room) {
            room.videoURL = videoURL;
            await room.save();
        }
    }

    async addUser(roomId, name, userId) {
        const room = await RoomModel.findOne({ roomId });

        if (room) {
            const user = {
                name,
                id: userId,
                roomId,
            };

            room.users.push(user);
            await room.save();
        }
    }

    async removeUser(userId) {
        const room = await RoomModel.findOne({ 'users.id': userId });

        if (room) {
            const userIndex = room.users.findIndex((user) => user.id === userId);
            const user = room.users[userIndex];

            room.users.splice(userIndex, 1);
            await room.save();

            return user;
        }

        return null;
    }

    async removeRoom(roomId) {
        const room = await RoomModel.findOne({ roomId });

        if (room) {
            await RoomModel.deleteOne({ roomId });
        }
    }

    async getUserList(roomId) {
        const room = await RoomModel.findOne({ roomId });

        if (room) {
            return room.users;
        }

        return null;
    }

    async getUser(userId) {
        const room = await RoomModel.findOne({ 'users.id': userId });

        if (room) {
            const user = room.users.find((user) => user.id === userId);
            return user;
        }

        return null;
    }

    async showInfo() {
        const rooms = await RoomModel.find();

        rooms.forEach((room) => {
            console.log(`Room: ${room.roomId}`);
            room.users.forEach((user) => console.log(user));
        });
    }
}

module.exports = new Rooms();