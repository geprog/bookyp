// this mock is needed because @feathersjs/socketio-client has a deep import
// to @feathersjs/transport-commons/src/client, which results in the error 'No `import` outside a module'
const socketioClient = jest.fn();

exports = socketioClient;
