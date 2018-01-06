var id = 0;

function TrackedObject() {
  this.id = id++;
}

module.exports = TrackedObject;
