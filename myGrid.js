import * as THREE from "three";
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
//import * as d3  from 'https//d3js.org/d3.v3.min.js';
//import * as d3 from 'https://d3js.org/d3.v7.min.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export class MyXYGridPlane extends THREE.Mesh {
  constructor(labels, Xsize, Ysize, numberofgraphvalues ,nrgraphs) {
  super();
  const zoffset = 0.0;
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide }); // Double-sided for text visibility
  const planeGeometry = new THREE.PlaneGeometry(Xsize,Ysize);  
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.x = -planeGeometry.parameters.width / 2; // Half-width offset
  plane.position.y = planeGeometry.parameters.height / 2; // Half-height offset
  plane.position.z = zoffset; // Set Z to 0 for origin
  this.add(plane);

  // Line geometry and material for grid lines
  const lineGeometry = new THREE.BufferGeometry(Xsize, Ysize);
  const positions = [];
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

  // Create line positions parallel to X-axis
  for (let i = 1; i < 10; i++) {
    const ypo = i * Ysize / 10;
    positions.push(1, ypo, 0); // Start points (at origin)
    positions.push(Xsize, ypo, 0); // End points (full width, same y)
  }

  // Create line positions parallel to Y-axis
  const lponr = numberofgraphvalues + 1;
  for (let i = 1; i < lponr; i++) {
    const xpo = i * (Xsize)/numberofgraphvalues;
    positions.push(xpo, 0, 0); // Start points (at origin)
    positions.push(xpo, Ysize, 0); // End points (same x, full height)
  }

  // Set line geometry attributes
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  // Create and add X and Y-axis line objects
  const xLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  xLines.position.x = -numberofgraphvalues;
  xLines.position.z = 0; // zoffset + 0.01;
  this.add(xLines);
 
  const startyear = 2000;
  const endyear = 2024;
  const yearlabels = [];
  for (let i = 0; i < numberofgraphvalues - 1; i = i + 5 ) {
    const label = startyear + i;
    let xpos = numberofgraphvalues - i - 2;
    yearlabels[i] = new MyXYLabel(labels[i], 0.7 );
    yearlabels[i].position.x = -xpos;
    yearlabels[i].position.y = 5.0;
    this.add(yearlabels[i]);
  }
  }
}


export class MyXZGridPlane extends THREE.Mesh {
  constructor(Xsize, Ysize, nrhor, nrver) {
  super();
  const zoffset = nrhor / 2;
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide }); // Double-sided for text visibility
  const planeGeometry = new THREE.PlaneGeometry(Xsize,Ysize);  
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = Math.PI / 2;
  plane.position.x = -planeGeometry.parameters.width / 2;
  plane.position.z = planeGeometry.parameters.height / 2;
  this.add(plane);
  
  // Line geometry and material for grid lines
  const lineGeometry = new THREE.BufferGeometry(Xsize, Ysize);
  const positions = [];
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

  // Create line positions parallel to X-axis
  for (let i = 0; i < nrhor; i++) {
    positions.push(0, i, 0); // Start points (at origin)
    positions.push(nrver - 1, i, 0); // End points (full width, same y)
  }

  // Create line positions parallel to Y-axis
  const lponr = nrhor + 1;
  for (let i = 0; i < nrver; i++) {
    const xpo = i;
    positions.push(xpo, 0, 0); // Start points (at origin)
    positions.push(xpo, nrhor, 0); // End points (same x, full height)
  }

  // Set line geometry attributes
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  // Create and add X and Y-axis line objects
  const xLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  xLines.rotation.x = Math.PI / 2;
  xLines.position.x = -nrver + 1;
  xLines.position.y = 0.01;
  xLines.position.z = 0.0 //-nrhor;
  
  this.add(xLines);
 
  }
}


export function addYears(scene) {
    const material = new THREE.LineBasicMaterial({
        color: 0x23006f
    });
    const points = [];
    points.push( new THREE.Vector3( - 12, 0, 0 ) );
    points.push( new THREE.Vector3( 3, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 9 ) );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    scene.add(line);
 }


export function mytest() {
    //window.alert("teeestii");
    console.log("xprt test");
}

class MyXYLabel extends THREE.Mesh {
  constructor(text, size) {
  super();
  let font = null;
  const thickness = 0.01;
  //size = 1.2;
  const curveSegments = 4;
  const material = new THREE.MeshPhongMaterial( { color: 0x112233, flatShading: true } )

  const loader = new TTFLoader();
  loader.load( './UbuntuMono-R.ttf', function ( json ) {
    font = new Font( json );
    createText();
  } );

  const group = new THREE.Group();
  this.add(group);

  function createText() {
    const textGeo = new TextGeometry( text, {
      font: font,
      size: size,
      //height: thickness,
      depth: thickness,
      curveSegments: curveSegments,
    } );
  
    textGeo.computeBoundingBox();
    const txtboxwidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x ;
  const textMesh1 = new THREE.Mesh( textGeo, material );
  textMesh1.rotation.z = -Math.PI / 2;
  textMesh1.position.y =  txtboxwidth;
  textMesh1.position.x =  -0.5 - ( size / 2 );

  group.add(textMesh1);

  }
  }
}


function extractRowData(row, headers) {
  const extractedData = {};
  headers.forEach((header, index) => {
    if (index !== 0) { // Skip the first header (already used for xylabels)
      extractedData[header] = row[header];
    }
  });
  return extractedData;
}

export async function readcsvnew() {
  const data = await d3.csv("skills01.csv");
  // Extract headers
  const headers = [];
  for (const key in data[0]) {
    headers.push(key);
  }
  // Extract x-labels from the first row
  const xylabels = data.map(row => row[headers[0]]);
  // Extract y-values and construct remapped headers
   const yVals = data.map(row => {
    const rest = {};
    for (const key in row) {
      if (key !== headers[0]) {
        rest[key] = row[key];
      }
    }
    return Object.values(rest);
  });
  const retobj = { headers: headers.slice(1), xylabels, yVals }; // Remove first header
  return retobj;
}


export async function readcsv() {
  const data = await d3.csv("skills01.csv");
  var headers = [];
  var rows = [];
    // Extract headers from the first row
    for (var key in data[0]) {
      headers.push(key);
     }
    const rownr = data.length;
    const colnr = headers.length;
    var yVals = Array(colnr -1)
      .fill()
      .map(() => Array(rownr).fill(0.0));
    let xylabels = [];
    var k = 0;
    data.forEach(function (row) {
      xylabels[k] = row[headers[0]];
      k++;
    });
    headers.shift(); // remove first item
    for ( var n = 0; n < colnr - 1; n++) {
     k = 0;
     data.forEach(function(row) {
       yVals[n][k] = parseFloat(row[headers[n]]);
       k++
    });
   }
    const retobj = { headers, xylabels, yVals };
    return retobj;
}
