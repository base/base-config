module.exports = function (app) {
  console.log('plugin B');
  app.emit('test', 'BBB');
};
