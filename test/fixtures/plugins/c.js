module.exports = function (app) {
  console.log('plugin C');
  app.emit('test', 'CCC');
};
