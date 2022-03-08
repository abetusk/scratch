self.addEventListener('msg', function(e) {
  var data = e.data;

  switch (data.cmd) {
    case 'start':
      self.postMessage('wrk start:' + data.msg);
      break;
    case 'stop':
      self.postMessage('wrk stop:' + data.msg);
      break;
    default:
      self.postMessage('unknown:' + data.msg);
  };
}, false);
