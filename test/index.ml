import (
  "coreio",
  "random",
  "fs",
  "bytes"
);

func readConfig(file) {
  var fd = fs.open(file, "r");


  return {
    content: fs.read(fd, bytes.Bytes(2048), 0, 2048, 0),
    [symbol.dispose]: func() {
      coreio.print('Closing file descriptor for', file);
      fs.close(fd);
    }
  }
}

var readFile = defer readConfig("./package.json");

coreio.print('File descriptor:', symbol.dispose);
coreio.print('File content:', readFile.content.buffer.toString());
