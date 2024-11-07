import * as THREE from "three"; 
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { addYears, MyXYGridPlane, MyXZGridPlane, readcsv } from "./myGrid.js";
console.clear();

const graphcolor = 0x22bb33;
const graphcornercolor = 0xcc2233;
const scenebgcolor = 0xface8D;

let numberofpoints = 25; // Number of y values in one graph
let numberofgraphs = 6; // Number of graphs
//let zoffset = numberofgraphs / 2;
const graphthickness = 0.4;

const grdata = await readcsv();
let csvData = [];
const xylabels = grdata.xylabels;
const xzlabels = grdata.headers;
const yVals = grdata.yVals;
numberofgraphs = grdata.headers.length;
numberofpoints = grdata.xylabels.length + 1;
console.log(yVals.length);
for ( let k = 0; k < xzlabels.length; k++) {
  csvData.push({ countryName: xzlabels[k], peaks: yVals[k] });
}

class DataPart extends THREE.Object3D {
  constructor(data) {
    super();
    this.countryName = data.countryName;
    this.peaks = data.peaks;
    this.isDataPart = true;
    let gData = new THREE.BoxGeometry(1, 1, 1, this.peaks.length - 1, 1, 1)
      .translate(0.5, 0.5, 0.5)
      .scale(this.peaks.length - 1, 1, graphthickness);
    for (let i = 0; i < gData.attributes.position.count; i++) {
      if (gData.attributes.position.getY(i) > 0.5) {
        let idx = Math.round(gData.attributes.position.getX(i));
        gData.attributes.position.setY(i, this.peaks[idx]);
        //console.log( i, "  ", this.peaks[idx]);
      }
    }
    const zoffset = 0;
    gData.translate(-0.5 * (this.peaks.length - 1) + 0.5, 0, zoffset);
    const graphlengthscale = numberofpoints;
    gData.scale(graphlengthscale / this.peaks.length, 0.8, 1);
    gData.toNonIndexed();
    gData.computeVertexNormals();
    let mData = new THREE.MeshLambertMaterial({ wireframe: false });
    mData.transparent = true;
    mData.color.set(graphcolor);
    mData.opacity = 0.9;
    mData.visible = true;
    let oData = new THREE.Mesh(gData, mData);
    this.add(oData);
    
    // text label positioning
    this.anchors = [
      new THREE.Vector3(-this.peaks.length * 0.5, 0, 0),
      new THREE.Vector3(
        this.peaks.length * 0.5,
        this.peaks[this.peaks.length - 1],
        0
      )
    ];
    this.anchorsProjection = (camera, projVectors, halfSize) => {
      projVectors.forEach((pv, idx) => {
        pv.copy(this.anchors[idx]);
        this.localToWorld(pv);
        pv.project(camera);
        pv.x *= halfSize.x;
        pv.y *= -1 * halfSize.y;
        //pv.y *= -1 * halfSize.y * 0.8;
        pv.x += halfSize.x;
        pv.y += halfSize.y;
      });
    };
  }
}

class DataWidget extends THREE.Object3D {
  constructor(mainData) {
    //console.log(mainData);
    super();
    //this.colors = [new THREE.Color("pink"), new THREE.Color("orange")];
    this.color = "yellow";
    this.mainData = mainData;
    this.count = mainData.length;

    this.dataBars = [];
    this.mainData.forEach((md, mdIdx) => {
      let dp = new DataPart(md);
      //const spacebetweengraphs = 1.2;
      dp.position.z = ((this.count - 1) * 0.5 - mdIdx); // - 0.1; // * spacebetweengraphs;;
      this.dataBars.push(dp);
      this.add(dp);
    });

    let helper = new THREE.LineSegments(
    //let helper = new THREE.BoxGeometry(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: 0xab11df,
        //color: graphcornercolor;
        //transparent: false,
        //opacity: 0.9,
        depthWrite: false,
        depthTest: false
      })
    );
    this.add(helper);
    this.helper = helper;
    this.prevSelected = null;
    let textName = document.createElement("div");
    textName.className = "text";
    textName.style.display = "none";
    //console.log(textName)
    textHolder.appendChild(textName);
    this.textName = textName;
    let textVal = document.createElement("div");
    textVal.className = "text";
    textVal.style.display = "none";
    //console.log(textName);
    textHolder.appendChild(textVal);
    //textHolder.appendChild(textName);
    this.textVal = textVal;
    this.anchorsProjections = [new THREE.Vector3(), new THREE.Vector3()];
    this.hideData = () => {
      this.helper.visible = false;
      this.textName.style.display = "none";
      this.textVal.style.display = "none";
    };
    this.showData = () => {
      //this.parent.visible = false;
      this.helper.visible = true;
      this.helper.material.color.set(graphcornercolor);
      this.textName.style.display = "block";
      this.textVal.style.display = "block";
    };
    this.showText = (obj, camera, halfSize) => {
      obj.parent.anchorsProjection(camera, this.anchorsProjections, halfSize);
      this.textName.style.transform = `translate(${this.anchorsProjections[0].x - 50}px, ${this.anchorsProjections[0].y}px)`;
      this.textVal.style.transform = `translate(${this.anchorsProjections[1].x + 20}px, ${this.anchorsProjections[1].y}px)`;
      //this.textVal.style.transform = `translate(${textValx}px, ${this.anchorsProjections[1].y}px)`;
    };
    this.setSelected = (obj) => {
      //console.log(obj);
      this.helper.geometry.dispose();
        this.helper.geometry = new THREE.EdgesGeometry(obj.geometry);
        this.helper.material = new THREE.MeshBasicMaterial({ color: 0x772299}); //0x772299
      this.helper.position.copy(obj.parent.position);
      this.textName.innerHTML = obj.parent.countryName;
      this.textVal.innerHTML = obj.parent.countryName;
      //this.textVal.innerHTML = obj.parent.peaks[
      //  obj.parent.peaks.length - 1
      //].toFixed(2);
    };
  }
}

let scene = new THREE.Scene();
scene.background = new THREE.Color(scenebgcolor); //0xface8D);

let frustumSize = 27;
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 1.5, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );

// let fov = 50; // Field of view angle in degrees
// let camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

//camera.position.set(-27, 12, 23).setLength(35);
camera.position.set(-39, 12, 30);
//camera.lookAt( -3, 0 , 0 );
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", (event) => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = - frustumSize * aspect / 2; //2
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = - frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.target.set( -12, 3, 0);
controls.enableDamping = true;

const xzpl = new MyXZGridPlane(numberofpoints, numberofgraphs,numberofgraphs,numberofpoints);
xzpl.position.y = 0.01;
scene.add(xzpl);

let light = new THREE.DirectionalLight(0xffffff, 0.25);
light.position.set(3, 5, 8);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.75));
// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
scene.add( directionalLight );

const myxyplane = new MyXYGridPlane(xylabels, numberofpoints, 8, numberofpoints, numberofgraphs);
//const myxyplane = new MyXYGridPlaneImg(numberofpoints, 8, numberofpoints, numberofgraphs);
scene.add(myxyplane);

//let dw = new DataWidget(testData);
let dw = new DataWidget(csvData);

dw.position.x = ( -numberofpoints / 2 );
dw.position.z = (numberofgraphs - 1 ) / 2; //(numberofgraphs / 2 ) - 2 * graphthickness;
scene.add(dw);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-1, -1);
const halfSize = new THREE.Vector2();
let intersects;

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
 }

window.addEventListener("pointermove", onPointerMove);

const zoffsetvertgrid = -0.01 + ( numberofgraphs - 1 ) / 2;
var mousehit = false;
var shownext = true;

renderer.setAnimationLoop(() => {
  controls.update();
  raycaster.setFromCamera(pointer, camera);
  intersects = raycaster.intersectObjects(dw.dataBars);
  if (intersects.length > 0 || shownext) {
    let obj;
    if (intersects.length > 0) {
      obj = intersects[0].object;
      mousehit = true;
      }
    else {
      obj = dw.children[ind].children[0];
      mousehit = false;
    }

    if (obj.parent.isDataPart && dw.prevSelected != obj) {
      myxyplane.visible = true;

      dw.setSelected(obj);
      if ( dw.prevSelected !== null) {
        dw.prevSelected.material.opacity = 0.0;
      }

      dw.showData();
      obj.material.color.set(graphcolor); 
      obj.material.opacity = 0.9;
      
      const mygrz = obj.parent.position.z;
      myxyplane.position.z =  mygrz + zoffsetvertgrid;
      dw.prevSelected = obj;
    }
    if (dw.prevSelected != null) {
      dw.showText(obj, camera, halfSize.set(innerWidth, innerHeight).multiplyScalar(0.5));
    }
  } else {
    mousehit = false;
    myxyplane.visible = false;
    dw.hideData();

    console.log("before if prevselect");
    if ( dw.prevSelected !== null ) {
      console.log("in if prevselect");
      dw.prevSelected.material.color.set(0xbbccdd); //(0xbbccdd);
      dw.prevSelected.material.opacity = 0.3;
    }

    dw.prevSelected = null;
    dw.children[ind].visible = true;
    dw.dataBars[ind].children[0].material.opacity = 0.9;
  }
  renderer.render(scene, camera);
});


var ind = 0;
let startTime = Date.now();
const animate = () => {
  requestAnimationFrame(animate);

  const elapsedTime = Date.now() - startTime;
  // Check if 1.5 seconds have passed since the last increment
  if (elapsedTime >= 1500 && !mousehit) {
    if ( ind < numberofgraphs - 1 ) {
      shownext = true;
      ind++;
    }
    else {
      ind = 0;
    }
    startTime = Date.now(); // Reset start time for next increment
  }
  renderer.render(scene, camera);
};

animate();

