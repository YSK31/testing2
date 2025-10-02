import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let ground,
  pitch,
  markers = [],
  labels = [],
  lines = [];
let raycaster, mouse;
let isNightMode = false;
let tooltip, infoCard, welcomeModal;
let positionsData = {};
let clouds = [];
let fielders = [];
let animationId;
let isAnimating = false;

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 20, 50);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 15, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("container").appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 50;

  setupLighting();
  addGround();
  addPitch();
  addStadium();
  addClouds();
  placePositions();
  addFielders();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  tooltip = document.getElementById("tooltip");
  infoCard = document.getElementById("infoCard");
  welcomeModal = document.getElementById("welcomeModal");

  setupUI();
  setupEventListeners();

  // Show welcome modal
  welcomeModal.style.display = "block";

  animate();
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 25);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  scene.add(directionalLight);

  const rimLight = new THREE.DirectionalLight(0x4466ff, 0.3);
  rimLight.position.set(-25, 25, -25);
  scene.add(rimLight);

  // Add a subtle hemisphere light for more natural outdoor lighting
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x2e8b57, 0.3);
  scene.add(hemisphereLight);
}

function addGround() {
  // Main field with gradient texture
  const groundGeometry = new THREE.CircleGeometry(30, 64);
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x2e8b57,
    roughness: 0.8,
  });
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Boundary line
  const boundaryGeometry = new THREE.RingGeometry(29.5, 30, 64);
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
  boundary.rotation.x = -Math.PI / 2;
  scene.add(boundary);

  // Field markings - 30-yard circle
  const circle30Geometry = new THREE.RingGeometry(20, 20.2, 64);
  const circle30Material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const circle30 = new THREE.Mesh(circle30Geometry, circle30Material);
  circle30.rotation.x = -Math.PI / 2;
  scene.add(circle30);

  // Add grass texture details
  for (let i = 0; i < 100; i++) {
    const bladeGeometry = new THREE.PlaneGeometry(0.1, 0.5);
    const bladeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e7a1e,
      side: THREE.DoubleSide,
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.rotation.x = -Math.PI / 2;
    blade.position.set(
      (Math.random() - 0.5) * 60,
      0.01,
      (Math.random() - 0.5) * 60
    );
    blade.rotation.z = Math.random() * Math.PI;
    scene.add(blade);
  }
}

function addPitch() {
  // Main pitch with better texture
  const pitchGeometry = new THREE.BoxGeometry(3, 0.1, 20);
  const pitchMaterial = new THREE.MeshLambertMaterial({
    color: 0xd2b48c,
    roughness: 0.7,
  });
  pitch = new THREE.Mesh(pitchGeometry, pitchMaterial);
  pitch.position.y = 0.05;
  pitch.castShadow = true;
  pitch.receiveShadow = true;
  scene.add(pitch);

  // Pitch lines
  const lineGeometry = new THREE.BoxGeometry(3.1, 0.02, 0.1);
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const topLine = new THREE.Mesh(lineGeometry, lineMaterial);
  const bottomLine = new THREE.Mesh(lineGeometry, lineMaterial);
  topLine.position.set(0, 0.06, 10);
  bottomLine.position.set(0, 0.06, -10);
  scene.add(topLine);
  scene.add(bottomLine);

  // Crease at both ends
  const creaseGeometry = new THREE.BoxGeometry(1, 0.11, 1.2);
  const creaseMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const crease1 = new THREE.Mesh(creaseGeometry, creaseMaterial);
  const crease2 = new THREE.Mesh(creaseGeometry, creaseMaterial);
  crease1.position.set(0, 0.06, 9.4);
  crease2.position.set(0, 0.06, -9.4);
  scene.add(crease1);
  scene.add(crease2);

  // Stumps with bails
  const stumpGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
  const stumpMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

  for (let i = -1; i <= 1; i++) {
    const stump1 = new THREE.Mesh(stumpGeometry, stumpMaterial);
    const stump2 = new THREE.Mesh(stumpGeometry, stumpMaterial);
    stump1.position.set(i * 0.2, 0.35, 10);
    stump2.position.set(i * 0.2, 0.35, -10);
    stump1.castShadow = true;
    stump2.castShadow = true;
    scene.add(stump1);
    scene.add(stump2);
  }

  // Bails
  const bailGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
  const bailMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const bail1 = new THREE.Mesh(bailGeometry, bailMaterial);
  const bail2 = new THREE.Mesh(bailGeometry, bailMaterial);
  bail1.position.set(0, 0.7, 10);
  bail2.position.set(0, 0.7, -10);
  scene.add(bail1);
  scene.add(bail2);
}

function addStadium() {
  // Simple stadium structure
  const stadiumGeometry = new THREE.RingGeometry(31, 40, 64);
  const stadiumMaterial = new THREE.MeshLambertMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
  });
  const stadium = new THREE.Mesh(stadiumGeometry, stadiumMaterial);
  stadium.rotation.x = -Math.PI / 2;
  stadium.position.y = -0.1;
  scene.add(stadium);

  // Add some simple stands
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const standGeometry = new THREE.BoxGeometry(8, 3, 2);
    const standMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(Math.sin(angle) * 35, 1.5, Math.cos(angle) * 35);
    stand.rotation.y = -angle;
    scene.add(stand);
  }
}

function addClouds() {
  for (let i = 0; i < 5; i++) {
    const cloudGroup = new THREE.Group();

    // Create cloud with multiple spheres
    for (let j = 0; j < 4; j++) {
      const cloudGeometry = new THREE.SphereGeometry(
        1 + Math.random() * 1.5,
        7,
        7
      );
      const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
      const cloudPiece = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloudPiece.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 3
      );
      cloudGroup.add(cloudPiece);
    }

    cloudGroup.position.set(
      (Math.random() - 0.5) * 80,
      15 + Math.random() * 10,
      (Math.random() - 0.5) * 80
    );

    clouds.push({
      group: cloudGroup,
      speed: 0.01 + Math.random() * 0.02,
    });

    scene.add(cloudGroup);
  }
}

function addFielders() {
  // Create simple fielder figures at each position
  Object.keys(positionsData).forEach((key) => {
    const pos = positionsData[key];

    // Create a simple human-like figure
    const fenderGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    fenderGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.0;
    fenderGroup.add(head);

    fenderGroup.position.set(pos.x, 0, pos.z);
    fenderGroup.userData = { type: "fielder", name: key };
    fenderGroup.visible = false; // Hide by default, show on hover

    fielders.push(fenderGroup);
    scene.add(fenderGroup);
  });
}

function placePositions() {
  // Define field positions with accurate coordinates
  positionsData = {
    "wicket-keeper": {
      x: 0,
      z: 12,
      color: 0xff0000,
      desc: "Directly behind the stumps, responsible for catching edges and stumping batsmen. The wicket-keeper is the only fielder allowed to wear gloves and leg pads.",
    },
    "1st-slip": {
      x: 2,
      z: 12,
      color: 0xff4500,
      desc: "Close catching position to the wicket-keeper's right (for right-handed batsmen). First slip is considered one of the most important catching positions.",
    },
    "2nd-slip": {
      x: 3.5,
      z: 11.5,
      color: 0xff6347,
      desc: "Next to first slip, another catching position for edges. Second slip is slightly wider than first slip.",
    },
    "3rd-slip": {
      x: 5,
      z: 11,
      color: 0xff7f50,
      desc: "Rarely used in modern cricket, positioned further from the batsman. Used when conditions favor significant swing or seam movement.",
    },
    gully: {
      x: 6,
      z: 9,
      color: 0xffa500,
      desc: "Wider than slips, catches edges that fly squarer. The gully fielder needs quick reflexes as balls come fast.",
    },
    point: {
      x: 8,
      z: 5,
      color: 0xffd700,
      desc: "Saves runs on the off side and stops cuts. Point requires agility and a strong throwing arm.",
    },
    cover: {
      x: 6,
      z: 0,
      color: 0xadff2f,
      desc: "Covers the area between point and mid-off. Cover fielders need to be quick to stop drives through the covers.",
    },
    "mid-off": {
      x: 0,
      z: -5,
      color: 0x32cd32,
      desc: "Stops straight drives and off-side shots. Mid-off is often positioned slightly straighter than cover.",
    },
    "mid-on": {
      x: 0,
      z: 5,
      color: 0x00fa9a,
      desc: "Stops straight drives and on-side shots. Mid-on is the leg-side equivalent of mid-off.",
    },
    midwicket: {
      x: -6,
      z: 0,
      color: 0x40e0d0,
      desc: "Covers the area between square leg and mid-on. Midwicket needs to be alert for shots played off the hips.",
    },
    "square-leg": {
      x: -8,
      z: 5,
      color: 0x1e90ff,
      desc: "Leg side equivalent of point. Square leg fields shots played square of the wicket on the leg side.",
    },
    "fine-leg": {
      x: -4,
      z: 12,
      color: 0x4169e1,
      desc: "Close to the boundary behind the batsman on the leg side. Fine leg often fields tickles down the leg side.",
    },
    "third-man": {
      x: 4,
      z: 12,
      color: 0x8a2be2,
      desc: "Behind the batsman on the off side, near the boundary. Third man fields edges that go fine on the off side.",
    },
    "long-off": {
      x: 0,
      z: -18,
      color: 0x9932cc,
      desc: "Deep fielding position straight down the ground. Long-off is positioned on the boundary to catch lofted shots.",
    },
    "long-on": {
      x: 0,
      z: 18,
      color: 0xda70d6,
      desc: "Deep fielding position straight on the leg side. Long-on fields big hits straight down the ground on the leg side.",
    },
    "deep-midwicket": {
      x: -12,
      z: 8,
      color: 0xff69b4,
      desc: "Deep fielding position on the leg side. Deep midwicket is positioned to catch lofted leg-side shots.",
    },
    "cow-corner": {
      x: -15,
      z: 12,
      color: 0xff1493,
      desc: "Unofficial position between deep midwicket and long-on where batsmen often hit lofted shots. The name comes from rural cricket where fields might actually have cows!",
    },
  };

  // Create markers for each position
  Object.keys(positionsData).forEach((key) => {
    const pos = positionsData[key];

    // Create marker sphere with pulsing animation
    const markerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const markerMaterial = new THREE.MeshLambertMaterial({
      color: pos.color,
      emissive: pos.color,
      emissiveIntensity: 0.2,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(pos.x, 0.5, pos.z);
    marker.userData = {
      type: "position",
      name: key,
      desc: pos.desc,
      originalScale: 1,
      pulseDirection: 1,
    };
    marker.castShadow = true;
    scene.add(marker);
    markers.push(marker);

    // Create label
    const label = document.createElement("div");
    label.className = "position-label";
    label.textContent = key.replace(/-/g, " ");
    label.style.display = document.getElementById("showLabels").checked
      ? "block"
      : "none";
    document.getElementById("container").appendChild(label);
    labels.push({ element: label, name: key });

    // Create line from marker to label
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: pos.color,
      transparent: true,
      opacity: 0.7,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.visible = document.getElementById("showLines").checked;
    scene.add(line);
    lines.push({ line: line, name: key });
  });

  updateLabels();
}

function updateLabels() {
  labels.forEach((labelObj) => {
    const pos = positionsData[labelObj.name];
    const screenPos = worldToScreen(pos.x, 0.5, pos.z);

    if (screenPos) {
      labelObj.element.style.left = `${screenPos.x}px`;
      labelObj.element.style.top = `${screenPos.y}px`;
    }

    // Update line from marker to label
    const lineObj = lines.find((l) => l.name === labelObj.name);
    if (lineObj && screenPos) {
      const linePoints = [
        new THREE.Vector3(pos.x, 0.5, pos.z),
        new THREE.Vector3(pos.x, 5, pos.z),
      ];
      lineObj.line.geometry.setFromPoints(linePoints);
    }
  });
}

function worldToScreen(x, y, z) {
  const vector = new THREE.Vector3(x, y, z);
  vector.project(camera);

  return {
    x: (vector.x * 0.5 + 0.5) * window.innerWidth,
    y: (-(vector.y * 0.5) + 0.5) * window.innerHeight,
  };
}

function setupUI() {
  // Show labels toggle
  document.getElementById("showLabels").addEventListener("change", function () {
    const isVisible = this.checked;
    labels.forEach((label) => {
      label.element.style.display = isVisible ? "block" : "none";
    });
  });

  // Show lines toggle
  document.getElementById("showLines").addEventListener("change", function () {
    const isVisible = this.checked;
    lines.forEach((lineObj) => {
      lineObj.line.visible = isVisible;
    });
  });

  // Position select
  document
    .getElementById("positionSelect")
    .addEventListener("change", function () {
      const position = this.value;
      if (position && positionsData[position]) {
        const pos = positionsData[position];
        camera.position.set(pos.x + 5, 8, pos.z + 5);
        controls.target.set(pos.x, 0, pos.z);
      }
    });

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", function () {
    isNightMode = !isNightMode;
    this.textContent = isNightMode ? "☀️ Day Mode" : "🌙 Night Mode";

    if (isNightMode) {
      scene.background = new THREE.Color(0x0a0a2a);
      scene.fog = new THREE.Fog(0x0a0a2a, 20, 50);
      ground.material.color.set(0x1a4d1a);
      pitch.material.color.set(0xb89a7c);
    } else {
      scene.background = new THREE.Color(0x87ceeb);
      scene.fog = new THREE.Fog(0x87ceeb, 20, 50);
      ground.material.color.set(0x2e8b57);
      pitch.material.color.set(0xd2b48c);
    }
  });

  // Close info card
  document.getElementById("closeCard").addEventListener("click", function () {
    infoCard.style.display = "none";
  });

  // Start exploring button
  document
    .getElementById("startExploring")
    .addEventListener("click", function () {
      welcomeModal.style.display = "none";
    });
}

function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
  renderer.domElement.addEventListener("mousemove", onMouseMove);
  renderer.domElement.addEventListener("click", onMouseClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateLabels();
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    tooltip.textContent = marker.userData.name.replace(/-/g, " ");
    tooltip.style.opacity = 1;
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY + 15}px`;

    // Highlight the marker with pulsing animation
    marker.scale.set(1.2, 1.2, 1.2);

    // Show fielder at this position
    const fielder = fielders.find(
      (f) => f.userData.name === marker.userData.name
    );
    if (fielder) {
      fielder.visible = true;
    }
  } else {
    tooltip.style.opacity = 0;

    // Reset all marker scales
    markers.forEach((marker) => {
      marker.scale.set(1, 1, 1);
    });

    // Hide all fielders
    fielders.forEach((fielder) => {
      fielder.visible = false;
    });
  }
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    document.getElementById("cardTitle").textContent =
      marker.userData.name.replace(/-/g, " ");
    document.getElementById("cardDesc").textContent = marker.userData.desc;
    infoCard.style.display = "block";
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Animate clouds
  clouds.forEach((cloud) => {
    cloud.group.position.x += cloud.speed;
    if (cloud.group.position.x > 40) {
      cloud.group.position.x = -40;
    }
  });

  // Animate markers with pulsing effect
  markers.forEach((marker) => {
    const pulseSpeed = 0.02;
    marker.userData.originalScale +=
      pulseSpeed * marker.userData.pulseDirection;

    if (marker.userData.originalScale > 1.2) {
      marker.userData.pulseDirection = -1;
    } else if (marker.userData.originalScale < 0.8) {
      marker.userData.pulseDirection = 1;
    }

    // Only pulse if not hovered
    if (marker.scale.x === 1) {
      marker.scale.set(
        marker.userData.originalScale,
        marker.userData.originalScale,
        marker.userData.originalScale
      );
    }
  });

  updateLabels();
  renderer.render(scene, camera);
}

// Initialize the scene
initScene();
