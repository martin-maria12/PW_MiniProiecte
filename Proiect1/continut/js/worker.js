onmessage = function(event) {
    if (event.data === "start") {
      // Start the worker
      console.log("Notificare de la scriptul principal dupa apasarea butonului Adauga!");
      self.postMessage("Mesaj de la worker");
    }
  };