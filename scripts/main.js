var elements = {
  "clear" : getElement("#clear"),
  "mainCanvas" : getElement("#mainCanvas"),
  "addVertex" : getElement("#addVertex"),
  "addEdge" : getElement("#addEdge"),
  "selectedVertex" : getElement("#selectedVertex")
};

class Graph {
  constructor(canvas = null, numVertices = 0, numEdges = 0) {
    this.canvas = canvas;
    this.numVertices = numVertices;
    this.numEdges = numEdges;
    this.vertices = [];
    this.edges = [];
    this.adjacencyList = [];
    this.tempEdge = {"vertex1" : null, "vertex2" : null};
  }
  
  addVertex(vertex) {
    this.vertices.push(vertex);
    this.numVertices++;
  }
  
  addEdge(vertex1, vertex2) {
    this.edges.push([vertex1, vertex2]);
    this.numEdges++;
  }
  
}

class Vertex {
  constructor(name, value = 0, radius = 50, x = 0, y = 0) {
    this.name = name;
    this.value = value;
    this.connections = {};
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.lineWidth = 5;
    this.strokeStyle = "rgb(0, 0, 0)";
    this.fillStyle = "rgb(0, 0, 0)";
    this.topLeft = {"x" : this.x - this.radius,
                    "y" : this.y - this.radius};
                    
    this.bottomRight = {"x" : this.x + this.radius,
                        "y" : this.y + this.radius};
    this.highlighted = false;
    this.highlightStrokeStyle = "rgb(0, 200, 255)";
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  setColour(r, g, b) {
    this.fillStyle = `rgb(${r}, ${g}, ${b})`;
  }
  
  setRadius(radius) {
    this.radius = radius;
  }
  
  intersectsWith(x, y) {
    /* Returns true if point (x, y) lies within this vertex's rectangle */
    if ((x >= this.topLeft["x"]) && (x <= this.bottomRight["x"]) &&
      (y >= this.topLeft["y"]) && (y <= this.bottomRight["y"])) return true;
    
    return false;
  }
  
  draw(canvas, x = this.x, y = this.y) {
    /* Draws a circle on the canvas with (x, y) as its centre */
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this.strokeStyle;
    ctx.stroke();
    ctx.fillStyle = this.fillStyle;
    ctx.fill();
  }
  
  drawConnection(canvas, x1, y1, x2, y2) {
    /* Draws a line between two coordinates */
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  drawEdge(canvas, vertex2, lineWidth = 5) {
    /* Draws an edge between this vertex and vertex2 */
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(vertex2.x, vertex2.y);
    ctx.stroke();
    
    // Redraw both vertices so that they appear on top of the edge
    this.draw(canvas);
    vertex2.draw(canvas);
  }
  
  toggleHighlight(canvas) {
    var ctx = canvas.getContext("2d");
    this.highlighted = !this.highlighted;
    if (this.highlighted) {
      this.strokeStyle = this.highlightStrokeStyle;
      this.draw(canvas);
    } else {
      this.strokeStyle = `rgb(0, 0, 0)`;
      this.draw(canvas);
    }
  }
  
  addHighlight(canvas) {
    this.highlighted = true;
    this.strokeStyle = this.highlightStrokeStyle;
    this.draw(canvas);
  }
  
  removeHighlight(canvas) {
    this.highlighted = false;
    this.strokeStyle = `rgb(0, 0, 0)`;
    this.draw(canvas);
  }
}

var mainGraph = new Graph();
var flags = {
  "addVertex" : false,
  "addEdge" : false
};

function setupElements() {
  elements["clear"].onclick = () => {
    var canvas = elements["mainCanvas"];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  elements["mainCanvas"].onclick = e => {
    var x = e.clientX - elements["mainCanvas"].offsetLeft;
    var y = e.clientY - elements["mainCanvas"].offsetTop;
    var v1, v2;
    
    if (flags["addVertex"]) {
      var vertex = new Vertex("", value = 1, radius = 20, x = x, y = y);
      vertex.setColour(randomInt(0, 256), randomInt(0, 256), randomInt(0, 256));
      vertex.draw(elements["mainCanvas"]);
      mainGraph.addVertex(vertex);
    } else if (flags["addEdge"]) {
      var vertex = getVertexAt(elements["mainCanvas"], x, y);
      if (vertex) {
        console.log(mainGraph.tempEdge);
        
        if (!mainGraph.tempEdge["vertex1"]) {
          mainGraph.tempEdge["vertex1"] = vertex;
        } else if ((!mainGraph.tempEdge["vertex2"]) && (mainGraph.tempEdge["vertex2"] != 
          mainGraph.tempEdge["vertex1"])) {
          mainGraph.tempEdge["vertex2"] = vertex;
          v1 = mainGraph.tempEdge["vertex1"];
          v2 = mainGraph.tempEdge["vertex2"];
          
          if ((v1 != null) && (v2 != null)) {
            v1.drawEdge(elements["mainCanvas"], v2);
            mainGraph.addEdge([v1, v2]);
            mainGraph.tempEdge = {"vertex1" : null, "vertex2" : null};
          }
        }
      }
    } else {
      var vertex = getVertexAt(elements["mainCanvas"], x, y);
      if (vertex) {
        for (var i = 0; i < mainGraph.numVertices; i++) {
          if (mainGraph.vertices[i] != vertex) {
            mainGraph.vertices[i].removeHighlight(elements["mainCanvas"]);
          }
        }
        vertex.toggleHighlight(elements["mainCanvas"]);
      }
    }
  }
  
  elements["addVertex"].onclick = () => {
    flags["addVertex"] = !flags["addVertex"];
    var buttonText = {true: "Stop Adding Vertices", false: "Add Vertices"}
    elements["addVertex"].innerHTML = buttonText[flags["addVertex"]];
  }
  
  elements["addEdge"].onclick = () => {
    flags["addEdge"] = !flags["addEdge"];
    var buttonText = {true: "Currently Adding Edge...", false: "Add Edge"}
    elements["addEdge"].innerHTML = buttonText[flags["addEdge"]];
  }
}

function getElement(elementName) {
  return document.querySelector(elementName);
}

function getVertexAt(canvas, x, y) {
  /* Returns the vertex that intersects with point (x, y), if there is one */
  var vertex;
  for (var i = 0; i < mainGraph.numVertices; i++) {
    vertex = mainGraph.vertices[i];
    if (vertex.intersectsWith(x, y)) return vertex;
  }
  
  return null;
}

function randomInt(low, high) {
  /* Returns a random number in the range [low, high) */
  return Math.floor((Math.random() * high) + low);
}

function test() {
  var vertex1 = new Vertex("Vertex 1", value = 1, radius = 20, x = 100, y = 100);
  var vertex2 = new Vertex("Vertex 2", value = 2, radius = 20, x = 200, y = 250);
  mainGraph.addVertex(vertex1);
  mainGraph.addVertex(vertex2);
  vertex1.setColour(0, 200, 50);
  vertex2.setColour(0, 50, 200);

  //vertex1.drawConnection(mainCanvas, 100, 100, 200, 200);
  vertex1.draw(elements["mainCanvas"]);
  vertex2.draw(elements["mainCanvas"]);
  
  vertex1.drawEdge(elements["mainCanvas"], vertex2);
}

function main() {
  setupElements();
  //test();
  

}

main();
