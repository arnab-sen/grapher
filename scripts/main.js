class Vertex {
  constructor(name, value = 0, radius = 50, x = 0, y = 0) {
    this.name = name;
    this.value = value;
    this.connections = {};
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.colour = "rgb(0, 0, 0)";
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  setColour(r, g, b) {
    this.colour = `rgb(${r}, ${g}, ${b})`;
  }
  
  setRadius(radius) {
    this.radius = radius;
  }
  
  draw(canvas, x = this.x, y = this.y) {
    /* Draws a circle on the canvas with (x, y) as its centre */
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = this.colour;
    ctx.fill();
  }
  
  drawConnection(canvas, x1, y1, x2, y2) {
    /* Draws a line between two coordinates */
    var ctx = canvas.getContext("2d");
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
}

function test() {
  var mainCanvas = document.querySelector("#mainCanvas");
  var vertex1 = new Vertex("Vertex 1", value = 1, radius = 20, x = 100, y = 100);
  var vertex2 = new Vertex("Vertex 2", value = 2, radius = 20, x = 200, y = 250);
  vertex1.setColour(0, 200, 50);
  vertex2.setColour(0, 50, 200);

  //vertex1.drawConnection(mainCanvas, 100, 100, 200, 200);
  vertex1.draw(mainCanvas);
  vertex2.draw(mainCanvas);
  
  vertex1.drawEdge(mainCanvas, vertex2);
}

function main() {
  test();
}

main();
