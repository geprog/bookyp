const socket = { connect: jest.fn() };

const io = jest.fn();
// eslint-disable-next-line jest/require-hook
io.mockReturnValue(socket);

module.exports = { io };
