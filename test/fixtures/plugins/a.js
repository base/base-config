module.exports = function (app) {
  console.log('plugin A');
  app.emit('test', 'AAA');
};
