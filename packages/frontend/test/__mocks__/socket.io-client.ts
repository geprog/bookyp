const socket = { connect: jest.fn() };

const io = jest.fn();
io.mockReturnValue(socket);

module.exports = { io };
