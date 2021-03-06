var elements = {
  "clear" : getElement("#clear"),
  "mainCanvas" : getElement("#mainCanvas"),
  "addVertex" : getElement("#addVertex"),
  "addEdge" : getElement("#addEdge"),
  "selectedVertex" : getElement("#selectedVertex"),
  "increaseRadius" : getElement("#increaseRadius"),
  "decreaseRadius" : getElement("#decreaseRadius"),
  "addTextField" : getElement("#addTextField"),
  "addText" : getElement("#addText"),
  "outputGraph" : getElement("#outputGraph"),
  "consoleOutput" : getElement("#consoleOutput")
};

class Graph {
  constructor(canvas = null, numVertices = 0, numEdges = 0) {
    this.canvas = canvas;
    this.numVertices = numVertices;
    this.numEdges = numEdges;
    this.vertices = [];
    this.edges = [];
    this.adjacencyList = [];
    this.tempEdge = [null, null];
    this.tempImageData = null;
    this.defaultRadius = 20;
    this.tempText = null;
  }
  
  addVertex(vertex) {
    this.vertices.push(vertex);
    this.adjacencyList.push([]);
    this.numVertices++;
  }
  
  addEdge(vertex1, vertex2) {
    if (this.adjacencyList[vertex1.value].includes(vertex2.value) ||
      this.adjacencyList[vertex2.value].includes(vertex1.value)) return;
    this.edges.push([vertex1.value, vertex2.value]);
    this.adjacencyList[vertex1.value].push(vertex2.value);
    this.adjacencyList[vertex2.value].push(vertex1.value);
    this.numEdges++;
  }
  
  snapshotCanvas(canvas = this.canvas) {
    /* Saves the ImageData of the current canvas */
    this.tempImageData = canvas.getContext("2d").getImageData(0, 0, canvas.height, canvas.width);
  }
  
  redrawCanvas(canvas = this.canvas, imageData = this.tempImageData) {
    if (imageData) {
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  }
  
  
  outputGraph() {
    /* Returns a formatted string of this graph's adjacency list */
    var outputString = "[";
    var temp;
    
    for (var i = 0; i < this.adjacencyList.length; i++) {
      temp = "[";
      for (var j = 0; j < this.adjacencyList[i].length - 1; j++) {
        temp += this.adjacencyList[i][j].toString();
        temp += ",";
      }
      
      if (this.adjacencyList[i].length > 0) {
        temp += this.adjacencyList[i][this.adjacencyList[i].length - 1].toString();
      }
      temp += "]";
      outputString += temp;
      if (i < this.adjacencyList.length - 1) outputString += ",\r\n";
    }
    outputString += "]";
    
    return outputString;
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
    drawText(canvas, this.name, x, y);
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

var mainGraph = new Graph(canvas = elements["mainCanvas"]);
var flags = {
  "addVertex" : false,
  "addEdge" : false
};

function setupElements() {
  elements["clear"].onclick = () => {
    var canvas = elements["mainCanvas"];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mainGraph = new Graph(canvas = elements["mainCanvas"]);
    clearTextFields();
  };

  elements["mainCanvas"].onclick = e => {
    var x = e.clientX - elements["mainCanvas"].offsetLeft;
    var y = e.clientY - elements["mainCanvas"].offsetTop;
    var v1, v2;
    
    // Adding edges takes priority as it usually happens after adding vertices
    if (flags["addVertex"] && flags["addEdge"]) elements["addVertex"].onclick();
    
    if (flags["addVertex"]) {
      var vertex = new Vertex(mainGraph.numVertices.toString(), value = mainGraph.numVertices,
        radius = mainGraph.defaultRadius, x = x, y = y);
      vertex.setColour(randomInt(80, 256), randomInt(80, 256), randomInt(80, 256));
      vertex.draw(elements["mainCanvas"]);
      mainGraph.addVertex(vertex);
    } else if (flags["addEdge"]) {
      var vertex = getVertexAt(elements["mainCanvas"], x, y);
      if (vertex) {
        if (!mainGraph.tempEdge[0]) {
          mainGraph.tempEdge[0] = vertex;
        } else if ((!mainGraph.tempEdge[1]) && (mainGraph.tempEdge[1] != 
          mainGraph.tempEdge[0])) {
          mainGraph.tempEdge[1] = vertex;
          v1 = mainGraph.tempEdge[0];
          v2 = mainGraph.tempEdge[1];
          
          if ((v1 != null) && (v2 != null)) {
            mainGraph.redrawCanvas(elements["mainCanvas"]);
            v1.drawEdge(elements["mainCanvas"], v2);
            mainGraph.addEdge(v1, v2);
            mainGraph.snapshotCanvas(elements["mainCanvas"]);
            mainGraph.tempEdge = [null, null];
          }
        }
      }
    } else if (mainGraph.tempText != null) {
        drawText(elements["mainCanvas"], mainGraph.tempText, x, y);
        mainGraph.tempText = null;
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
  
  elements["mainCanvas"].addEventListener("mousemove", e => {
    var x = e.clientX - elements["mainCanvas"].offsetLeft;
    var y = e.clientY - elements["mainCanvas"].offsetTop;
    var vertex1;
    
    if ((mainGraph.tempEdge[0] != null) && (mainGraph.tempEdge[1] == null)) {
      vertex1 = mainGraph.tempEdge[0];
      mainGraph.redrawCanvas(canvas = elements["mainCanvas"]);
      vertex1.drawConnection(elements["mainCanvas"],
       vertex1.x, vertex1.y, x, y);
      vertex1.draw(elements["mainCanvas"]);
    }
  });
  
  elements["addVertex"].onclick = () => {
    flags["addVertex"] = !flags["addVertex"];
    var buttonText = {true: "Stop Adding Vertices", false: "Add Vertices"}
    elements["addVertex"].innerHTML = buttonText[flags["addVertex"]];
  }
  
  elements["addEdge"].onclick = () => {
    flags["addEdge"] = !flags["addEdge"];
    var buttonText = {true: "Stop Adding Edges", false: "Add Edges"}
    elements["addEdge"].innerHTML = buttonText[flags["addEdge"]];
    mainGraph.snapshotCanvas(canvas = elements["mainCanvas"]);
  }
  
  elements["increaseRadius"].onclick = () => mainGraph.defaultRadius += 5;
  
  elements["decreaseRadius"].onclick = () => {
    mainGraph.defaultRadius -= 5;
    if (mainGraph.defaultRadius < 15) mainGraph.defaultRadius = 15;
  };
  
  window.onload = () => {
    clearTextFields();
  };
  
  elements["addText"].onclick = () => {
    mainGraph.tempText = elements["addTextField"].value;
  };
  
  elements["outputGraph"].onclick = () => {
    elements["consoleOutput"].textContent = mainGraph.outputGraph();
  };
}

function clearTextFields() {
  elements["addTextField"].value = "";
  elements["consoleOutput"].textContent = "";
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

function drawText(canvas, text, x, y, fontSize = 20, font = "Arial", colour = "black", align = "center") {
  var ctx = canvas.getContext("2d");
  ctx.font = `${fontSize}px ` + font;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.fillText(text, x, y + (fontSize / 3));
}

function main() {
  setupElements();
}

main();
