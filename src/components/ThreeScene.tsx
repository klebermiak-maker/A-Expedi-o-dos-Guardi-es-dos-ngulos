import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { IslandLevelData, IslandPolygonData, PolygonVertexData } from '../data/levels';
import { sound } from '../utils/sound';

export type CameraMode = 'ilha' | 'inspecao' | 'topo';

interface ThreeSceneProps {
  level: IslandLevelData;
  activePolygon: IslandPolygonData;
  activeVertex: PolygonVertexData;
  completedPolygonIds: string[];
  cameraMode: CameraMode;
  showEsquadro3D: boolean;
  polygonRotationY: number;
  polygonZoom: number;
  onSelectPolygon: (polyId: string) => void;
  onSelectVertex: (vertexId: string, screenPos?: { x: number; y: number }) => void;
}

// Pre-allocated math helpers at module scope (zero GC in loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _playerTarget = new THREE.Vector3(0, 0, 4.5);
const _vecA = new THREE.Vector3();
const _vertexWorldPos = new THREE.Vector3();
const _vertexScreenPos = new THREE.Vector3();

function createLabelSprite(
  text: string,
  bgColor: string,
  textColor: string,
  maxAnisotropy: number,
  scaleSize: number = 1.1
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 128);
  // Rounded pill badge for 3D vertex/polygon label
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(16, 20, 224, 88, 28);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = 'bold 46px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scaleSize, scaleSize * 0.5, 1);
  sprite.renderOrder = 20;
  return sprite;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  level,
  activePolygon,
  activeVertex,
  completedPolygonIds,
  cameraMode,
  showEsquadro3D,
  polygonRotationY,
  polygonZoom,
  onSelectPolygon,
  onSelectVertex,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Store latest props in refs so WebGL loop & handlers never tear down the canvas
  const stateRef = useRef({
    level,
    activePolygon,
    activeVertex,
    completedPolygonIds,
    cameraMode,
    showEsquadro3D,
    polygonRotationY,
    polygonZoom,
    onSelectPolygon,
    onSelectVertex,
  });

  useEffect(() => {
    stateRef.current = {
      level,
      activePolygon,
      activeVertex,
      completedPolygonIds,
      cameraMode,
      showEsquadro3D,
      polygonRotationY,
      polygonZoom,
      onSelectPolygon,
      onSelectVertex,
    };
  }, [
    level,
    activePolygon,
    activeVertex,
    completedPolygonIds,
    cameraMode,
    showEsquadro3D,
    polygonRotationY,
    polygonZoom,
    onSelectPolygon,
    onSelectVertex,
  ]);

  // Rebuild trigger ref when level or active vertex/polygon visual tools change
  const sceneObjectsRef = useRef<{
    rebuildLevel?: () => void;
    updateActiveVisuals?: () => void;
  }>({});

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(stateRef.current.level.skyColor);
    scene.fog = new THREE.FogExp2(stateRef.current.level.fogColor, 0.018);

    // 2. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      160
    );
    camera.position.set(0, 11, 16);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 3.5;
    controls.maxDistance = 32;
    controls.target.set(0, 1.5, 0);

    let userDraggingOrbit = false;
    controls.addEventListener('start', () => {
      userDraggingOrbit = true;
    });
    controls.addEventListener('end', () => {
      userDraggingOrbit = false;
    });

    // 3. Balanced 3-Point Studio & Outdoor Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(14, 24, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 60;
    const d = 16;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-16, 12, -14);
    scene.add(rimLight);

    // Root container for level-specific objects
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Interactive click targets
    const clickableObjects: THREE.Object3D[] = [];
    const polygonPivotMap = new Map<string, THREE.Group>();
    const vertexOverlayMap = new Map<string, THREE.Group>();

    // Dynamic animated entities
    let playerGroup = new THREE.Group();
    let masterGroup = new THREE.Group();
    let neblinoGroup = new THREE.Group();
    let portalVortexMesh: THREE.Mesh | null = null;
    let portalRingMesh: THREE.Mesh | null = null;
    let riverMesh: THREE.Mesh | null = null;
    let celebrationParticles: THREE.Points | null = null;

    // Build Composite Player Character (Guardião Explorador - 9 parts)
    const createPlayerExplorer = (): THREE.Group => {
      const group = new THREE.Group();
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, metalness: 0.1 });
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6, metalness: 0.1 });
      const tunicMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.15 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5, metalness: 0.05 });
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.25 });
      const packMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6, metalness: 0.15 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.5 });

      // Boots
      const bootGeo = new THREE.BoxGeometry(0.24, 0.18, 0.34);
      const leftBoot = new THREE.Mesh(bootGeo, bootMat);
      leftBoot.position.set(-0.16, 0.09, 0.03);
      const rightBoot = new THREE.Mesh(bootGeo, bootMat);
      rightBoot.position.set(0.16, 0.09, 0.03);
      group.add(leftBoot, rightBoot);

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.38, 12);
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.16, 0.34, 0);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.16, 0.34, 0);
      group.add(leftLeg, rightLeg);

      // Torso tunic
      const torso = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.72, 16), tunicMat);
      torso.position.set(0, 0.82, 0);
      torso.castShadow = true;
      group.add(torso);

      // Backpack
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.26), packMat);
      pack.position.set(0, 0.84, -0.26);
      group.add(pack);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), skinMat);
      head.position.set(0, 1.38, 0);
      head.castShadow = true;
      group.add(head);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.045, 10, 10);
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.11, 1.42, 0.28);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.11, 1.42, 0.28);
      group.add(leftEye, rightEye);

      // Explorer Hat (brim + crown)
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), hatMat);
      brim.position.set(0, 1.62, 0);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.26, 16), hatMat);
      crown.position.set(0, 1.76, 0);
      group.add(brim, crown);

      return group;
    };

    // Build Composite Mestre Esquadro (Friendly Triangle Guide - 6 parts)
    const createMestreEsquadro = (): THREE.Group => {
      const group = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(-0.7, 0);
      shape.lineTo(0.7, 0);
      shape.lineTo(-0.7, 1.4);
      shape.closePath();

      const extrude = new THREE.ExtrudeGeometry(shape, {
        depth: 0.22,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3,
      });
      extrude.center();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.25,
        metalness: 0.65,
      });
      const body = new THREE.Mesh(extrude, bodyMat);
      body.position.y = 1.25;
      body.castShadow = true;
      group.add(body);

      // Eyes
      const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
      [-0.18, 0.12].forEach((xOffset) => {
        const w = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), eyeWhiteMat);
        w.position.set(xOffset, 1.18, 0.16);
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), pupilMat);
        p.position.set(xOffset, 1.18, 0.23);
        group.add(w, p);
      });

      // Pedestal ring
      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.06, 12, 28),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 })
      );
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = 0.15;
      group.add(baseRing);

      return group;
    };

    // Build Composite Neblino Villain (Storm Cloud Character - 7 parts)
    const createNeblino = (): THREE.Group => {
      const group = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0x4c1d95,
        roughness: 0.55,
        metalness: 0.2,
      });
      const puffs = [
        [0, 0, 0, 0.72],
        [-0.55, -0.1, 0.1, 0.5],
        [0.55, -0.1, 0.1, 0.5],
        [0, 0.38, -0.1, 0.52],
      ];
      puffs.forEach(([x, y, z, r]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 18), cloudMat);
        m.position.set(x, y, z);
        m.castShadow = true;
        group.add(m);
      });

      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.9,
      });
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), eyeMat);
      leftEye.position.set(-0.22, 0.08, 0.64);
      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), eyeMat);
      rightEye.position.set(0.22, 0.08, 0.64);
      group.add(leftEye, rightEye);

      const swirlRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.05, 10, 32),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.5 })
      );
      swirlRing.rotation.x = Math.PI / 2;
      swirlRing.position.y = -0.35;
      group.add(swirlRing);

      return group;
    };

    // Build Composite Tree (4 parts)
    const createStylizedTree = (foliageColor: string): THREE.Group => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.26, 1.1, 10),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, metalness: 0.05 })
      );
      trunk.position.y = 0.55;
      trunk.castShadow = true;
      tree.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({
        color: foliageColor,
        roughness: 0.45,
        metalness: 0.1,
      });
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.3, 9), leafMat);
      c1.position.y = 1.4;
      c1.castShadow = true;
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.1, 9), leafMat);
      c2.position.y = 2.05;
      c2.castShadow = true;
      const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.85, 9), leafMat);
      c3.position.y = 2.6;
      c3.castShadow = true;
      tree.add(c1, c2, c3);
      return tree;
    };

    // Build 3D Angle + Esquadro Overlay for a specific vertex of a polygon
    const buildVertexAngleOverlay = (
      poly: IslandPolygonData,
      vertexIndex: number,
      showEsquadro: boolean,
      isSelected: boolean
    ): THREE.Group => {
      const overlay = new THREE.Group();
      const v = poly.vertices[vertexIndex];
      const prevV = poly.vertices[(vertexIndex - 1 + poly.vertices.length) % poly.vertices.length];
      const nextV = poly.vertices[(vertexIndex + 1) % poly.vertices.length];

      // Vectors along the two adjacent edges from vertex v
      const dir1 = new THREE.Vector2(nextV.x - v.x, nextV.y - v.y).normalize();
      const dir2 = new THREE.Vector2(prevV.x - v.x, prevV.y - v.y).normalize();

      let a1 = Math.atan2(dir1.y, dir1.x);
      let a2 = Math.atan2(dir2.y, dir2.x);

      // Compute interior sweep from a1 to a2
      let sweep = a2 - a1;
      while (sweep <= 0) sweep += Math.PI * 2;
      if (sweep > Math.PI * 1.55) {
        // Flip if exterior was picked on convex shapes
        const tmp = a1;
        a1 = a2;
        a2 = tmp;
        sweep = a2 - a1;
        while (sweep <= 0) sweep += Math.PI * 2;
      }

      overlay.position.set(v.x, v.y, 0.22);

      if (v.isRight) {
        // Classic Right Angle Square Symbol (□ with dot)
        const sqSize = isSelected ? 0.58 : 0.38;
        const u1 = new THREE.Vector2(Math.cos(a1), Math.sin(a1));
        const u2 = new THREE.Vector2(Math.cos(a1 + Math.PI / 2), Math.sin(a1 + Math.PI / 2));

        const sqShape = new THREE.Shape();
        sqShape.moveTo(0, 0);
        sqShape.lineTo(u1.x * sqSize, u1.y * sqSize);
        sqShape.lineTo((u1.x + u2.x) * sqSize, (u1.y + u2.y) * sqSize);
        sqShape.lineTo(u2.x * sqSize, u2.y * sqSize);
        sqShape.closePath();

        const sqMesh = new THREE.Mesh(
          new THREE.ShapeGeometry(sqShape),
          new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: isSelected ? 0.85 : 0.45,
            side: THREE.DoubleSide,
          })
        );
        overlay.add(sqMesh);
      } else {
        // Non-right angle circular sector arc
        const radius = isSelected ? 0.62 : 0.4;
        const arcShape = new THREE.Shape();
        arcShape.moveTo(0, 0);
        arcShape.absarc(0, 0, radius, a1, a1 + sweep, false);
        arcShape.closePath();

        const arcColor = v.angleDeg < 90 ? 0x38bdf8 : 0xf43f5e;
        const arcMesh = new THREE.Mesh(
          new THREE.ShapeGeometry(arcShape),
          new THREE.MeshBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: isSelected ? 0.8 : 0.4,
            side: THREE.DoubleSide,
          })
        );
        overlay.add(arcMesh);
      }

      // Virtual 3D Set-Square (Esquadro Mágico de 90°) aligned with edge a1
      if (isSelected && showEsquadro) {
        const esquadroGroup = new THREE.Group();
        esquadroGroup.rotation.z = a1;
        esquadroGroup.position.z = 0.08;

        const esqShape = new THREE.Shape();
        esqShape.moveTo(0, 0);
        esqShape.lineTo(1.35, 0);
        esqShape.lineTo(0, 1.35);
        esqShape.closePath();

        // Inner triangular cutout like a real plastic geometry set-square
        const hole = new THREE.Path();
        hole.moveTo(0.24, 0.24);
        hole.lineTo(0.82, 0.24);
        hole.lineTo(0.24, 0.82);
        hole.closePath();
        esqShape.holes.push(hole);

        const esqGeo = new THREE.ExtrudeGeometry(esqShape, {
          depth: 0.06,
          bevelEnabled: true,
          bevelThickness: 0.015,
          bevelSize: 0.015,
          bevelSegments: 2,
        });

        const esqMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          roughness: 0.2,
          metalness: 0.3,
          transparent: true,
          opacity: 0.82,
        });
        const esqMesh = new THREE.Mesh(esqGeo, esqMat);
        esquadroGroup.add(esqMesh);

        // 90° corner highlight border on the Esquadro
        const lPoints = [
          new THREE.Vector3(1.35, 0, 0.08),
          new THREE.Vector3(0, 0, 0.08),
          new THREE.Vector3(0, 1.35, 0.08),
        ];
        const lGeo = new THREE.BufferGeometry().setFromPoints(lPoints);
        const lLine = new THREE.Line(
          lGeo,
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 })
        );
        esquadroGroup.add(lLine);

        overlay.add(esquadroGroup);
      }

      return overlay;
    };

    // Build or Rebuild entire Floating Island Level
    const rebuildLevel = () => {
      const currentLevel = stateRef.current.level;
      scene.background = new THREE.Color(currentLevel.skyColor);
      scene.fog = new THREE.FogExp2(currentLevel.fogColor, 0.016);

      // Clear previous worldGroup children
      while (worldGroup.children.length > 0) {
        const child = worldGroup.children[0];
        worldGroup.remove(child);
      }
      clickableObjects.length = 0;
      polygonPivotMap.clear();
      vertexOverlayMap.clear();

      // 1. Floating Island Multi-Layer Base (6-part composite terrain)
      const islandGroup = new THREE.Group();

      // Top grass/crystal plateau
      const topPlateau = new THREE.Mesh(
        new THREE.CylinderGeometry(14.5, 13.8, 1.2, 36),
        new THREE.MeshStandardMaterial({
          color: currentLevel.groundColor,
          roughness: 0.75,
          metalness: 0.08,
        })
      );
      topPlateau.position.y = -0.6;
      topPlateau.receiveShadow = true;
      islandGroup.add(topPlateau);

      // Clickable ground proxy for walking
      topPlateau.userData = { type: 'ground' };
      clickableObjects.push(topPlateau);

      // Middle dirt/cliff rim
      const midRim = new THREE.Mesh(
        new THREE.CylinderGeometry(13.8, 10.2, 3.2, 28),
        new THREE.MeshStandardMaterial({
          color: currentLevel.groundSecondaryColor,
          roughness: 0.85,
          metalness: 0.1,
        })
      );
      midRim.position.y = -2.8;
      islandGroup.add(midRim);

      // Deep floating rocky spire bottom
      const spireBottom = new THREE.Mesh(
        new THREE.ConeGeometry(10.2, 7.5, 18),
        new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.9,
          metalness: 0.12,
        })
      );
      spireBottom.rotation.x = Math.PI;
      spireBottom.position.y = -8.1;
      islandGroup.add(spireBottom);

      // Winding River across the island
      const riverGeo = new THREE.BoxGeometry(27.5, 0.15, 2.8);
      const riverMat = new THREE.MeshStandardMaterial({
        color: currentLevel.waterColor,
        roughness: 0.15,
        metalness: 0.55,
        transparent: true,
        opacity: 0.88,
      });
      riverMesh = new THREE.Mesh(riverGeo, riverMat);
      riverMesh.position.set(0, 0.03, -5.8);
      islandGroup.add(riverMesh);

      // Arched Wooden/Stone Bridge over the River (multi-part)
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(0, 0.05, -5.8);
      const plankMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.7,
        metalness: 0.15,
      });
      const postMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.8,
        metalness: 0.1,
      });
      for (let i = -3; i <= 3; i++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.42), plankMat);
        plank.position.set(0, Math.cos((i / 4) * 1.1) * 0.38, i * 0.52);
        plank.castShadow = true;
        plank.receiveShadow = true;
        bridgeGroup.add(plank);
      }
      [-1.1, 1.1].forEach((xSide) => {
        [-1.5, 0, 1.5].forEach((zPost) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.95, 8), postMat);
          post.position.set(xSide, 0.55, zPost);
          bridgeGroup.add(post);
        });
      });
      islandGroup.add(bridgeGroup);

      // Cobblestone Golden Paths connecting polygons to the bridge & portal
      const pathMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.8,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const pathPositions: [number, number, number][] = [
        [0, 0.02, -8.2],
        [0, 0.02, -3.2],
        [0, 0.02, -0.8],
        [-3.2, 0.02, -2.2],
        [3.2, 0.02, -2.2],
      ];
      pathPositions.forEach(([px, py, pz]) => {
        const stone = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.15, 0.06, 16), pathMat);
        stone.position.set(px, py, pz);
        stone.receiveShadow = true;
        islandGroup.add(stone);
      });

      // Decorative Trees & Floating Mini-Islands around the perimeter
      const treeCoords: [number, number][] = [
        [-10.5, -6.8],
        [10.5, -6.8],
        [-11.2, 2.5],
        [11.2, 2.5],
        [-8.5, 7.5],
        [8.5, 7.5],
      ];
      treeCoords.forEach(([tx, tz]) => {
        const t = createStylizedTree(currentLevel.accentColor);
        t.position.set(tx, 0, tz);
        islandGroup.add(t);
      });

      worldGroup.add(islandGroup);

      // 2. Portal Mágico Monument at the North of the Island
      const portalGroup = new THREE.Group();
      portalGroup.position.set(
        currentLevel.portalPosition[0],
        0,
        currentLevel.portalPosition[1]
      );

      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.6,
        metalness: 0.25,
      });
      const baseStep = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.45, 24), stoneMat);
      baseStep.position.y = 0.22;
      baseStep.receiveShadow = true;
      portalGroup.add(baseStep);

      // Pillars
      const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 4.2, 16), stoneMat);
      leftPillar.position.set(-2.1, 2.3, 0);
      leftPillar.castShadow = true;
      const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 4.2, 16), stoneMat);
      rightPillar.position.set(2.1, 2.3, 0);
      rightPillar.castShadow = true;
      portalGroup.add(leftPillar, rightPillar);

      // Top Arch
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.38, 14, 32, Math.PI),
        stoneMat
      );
      arch.position.set(0, 4.3, 0);
      portalGroup.add(arch);

      // Rotating Energy Ring
      portalRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.75, 0.1, 16, 48),
        new THREE.MeshStandardMaterial({
          color: currentLevel.portalColor,
          emissive: currentLevel.portalColor,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.8,
        })
      );
      portalRingMesh.position.set(0, 2.6, 0);
      portalGroup.add(portalRingMesh);

      // Portal Energy Vortex Core
      portalVortexMesh = new THREE.Mesh(
        new THREE.CircleGeometry(1.68, 36),
        new THREE.MeshBasicMaterial({
          color: currentLevel.portalColor,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        })
      );
      portalVortexMesh.position.set(0, 2.6, 0);
      portalGroup.add(portalVortexMesh);

      worldGroup.add(portalGroup);

      // 3. Add Characters: Player, Mestre Esquadro, and Vilão Neblino
      playerGroup = createPlayerExplorer();
      playerGroup.position.set(0, 0, 5.2);
      _playerTarget.set(0, 0, 5.2);
      worldGroup.add(playerGroup);

      masterGroup = createMestreEsquadro();
      masterGroup.position.set(-3.8, 0, -8.2);
      masterGroup.rotation.y = 0.35;
      worldGroup.add(masterGroup);

      neblinoGroup = createNeblino();
      neblinoGroup.position.set(3.8, 3.2, -9.2);
      worldGroup.add(neblinoGroup);

      // 4. Build the 3 Interactive Polygons on Pedestals
      currentLevel.polygons.forEach((poly) => {
        const stationGroup = new THREE.Group();
        stationGroup.position.set(poly.worldPos[0], 0, poly.worldPos[1]);

        // Pedestal Base
        const pedestal = new THREE.Mesh(
          new THREE.CylinderGeometry(2.3, 2.6, 0.55, 24),
          new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.5,
            metalness: 0.4,
          })
        );
        pedestal.position.y = 0.275;
        pedestal.receiveShadow = true;
        stationGroup.add(pedestal);

        // Glowing status ring on pedestal
        const ringMat = new THREE.MeshStandardMaterial({
          color: poly.colorHex,
          emissive: poly.colorHex,
          emissiveIntensity: 0.5,
          roughness: 0.3,
        });
        const pedRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.07, 12, 36), ringMat);
        pedRing.rotation.x = Math.PI / 2;
        pedRing.position.y = 0.56;
        stationGroup.add(pedRing);

        // Floating Pivot for the 3D Polygon itself
        const polyPivot = new THREE.Group();
        polyPivot.position.set(0, 3.1, 0);
        polygonPivotMap.set(poly.id, polyPivot);

        // Build Extruded Polygon Shape from poly.vertices
        const shape = new THREE.Shape();
        poly.vertices.forEach((v, idx) => {
          if (idx === 0) shape.moveTo(v.x, v.y);
          else shape.lineTo(v.x, v.y);
        });
        shape.closePath();

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.28,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3,
        });
        // Center Z around 0
        extrudeGeo.translate(0, 0, -0.14);

        const polyMat = new THREE.MeshPhysicalMaterial({
          color: poly.colorHex,
          roughness: 0.25,
          metalness: 0.2,
          clearcoat: 0.6,
          transparent: true,
          opacity: 0.92,
        });
        const polyMesh = new THREE.Mesh(extrudeGeo, polyMat);
        polyMesh.castShadow = true;
        polyMesh.userData = { type: 'polygon', polygonId: poly.id };
        clickableObjects.push(polyMesh);
        polyPivot.add(polyMesh);

        // Crisp Perimeter Outline
        const edgePoints = poly.vertices.map((v) => new THREE.Vector3(v.x, v.y, 0.18));
        edgePoints.push(new THREE.Vector3(poly.vertices[0].x, poly.vertices[0].y, 0.18));
        const edgeLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(edgePoints),
          new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        polyPivot.add(edgeLine);

        // Interactive Vertex Spheres + Labels
        poly.vertices.forEach((v) => {
          const vGroup = new THREE.Group();
          vGroup.position.set(v.x, v.y, 0.18);

          const sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 18, 18),
            new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: poly.colorHex,
              emissiveIntensity: 0.35,
              roughness: 0.2,
              metalness: 0.5,
            })
          );
          sphereMesh.userData = {
            type: 'vertex',
            polygonId: poly.id,
            vertexId: v.id,
            isRight: v.isRight,
          };
          clickableObjects.push(sphereMesh);
          vGroup.add(sphereMesh);

          const labelSprite = createLabelSprite(
            v.id,
            v.isRight ? '#059669' : '#0284c7',
            '#ffffff',
            maxAnisotropy,
            0.78
          );
          labelSprite.position.set(0, 0.42, 0.15);
          vGroup.add(labelSprite);

          polyPivot.add(vGroup);
        });

        // Container for angle arcs and 3D Esquadro tool
        const angleOverlayContainer = new THREE.Group();
        polyPivot.add(angleOverlayContainer);
        vertexOverlayMap.set(poly.id, angleOverlayContainer);

        stationGroup.add(polyPivot);
        worldGroup.add(stationGroup);
      });

      // 5. Atmospheric Floating Star/Sparkle Particles
      const particleCount = 120;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 34;
        positions[i * 3 + 1] = Math.random() * 14 + 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 34;
      }
      const partGeo = new THREE.BufferGeometry();
      partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      celebrationParticles = new THREE.Points(
        partGeo,
        new THREE.PointsMaterial({
          color: 0xfde047,
          size: 0.22,
          transparent: true,
          opacity: 0.75,
        })
      );
      worldGroup.add(celebrationParticles);

      updateActiveVisuals();
    };

    // Update angle overlays & 3D Esquadro tool when active polygon/vertex or tool state changes
    const updateActiveVisuals = () => {
      const { level: curLevel, activePolygon: curPoly, activeVertex: curVert, showEsquadro3D: showEsq, completedPolygonIds: doneIds } =
        stateRef.current;

      curLevel.polygons.forEach((poly) => {
        const container = vertexOverlayMap.get(poly.id);
        if (!container) return;
        while (container.children.length > 0) {
          container.remove(container.children[0]);
        }

        const isPolyActive = poly.id === curPoly.id;
        poly.vertices.forEach((v, idx) => {
          const isVertSelected = isPolyActive && v.id === curVert.id;
          const overlay = buildVertexAngleOverlay(
            poly,
            idx,
            isPolyActive && showEsq,
            isVertSelected
          );
          container.add(overlay);
        });
      });

      // Update Portal glow based on completion
      const allDone = doneIds.length === curLevel.polygons.length;
      if (portalVortexMesh) {
        const mat = portalVortexMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = allDone ? 0.88 : 0.18 + doneIds.length * 0.18;
        mat.color.set(allDone ? '#10b981' : curLevel.portalColor);
      }

      // Move Player Explorer near active polygon
      _playerTarget.set(curPoly.worldPos[0] * 0.55, 0, curPoly.worldPos[1] + 2.4);
    };

    sceneObjectsRef.current = {
      rebuildLevel,
      updateActiveVisuals,
    };

    rebuildLevel();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for clicking polygons, vertices, or walking on island
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    // Throttled PointerMove for Directional Audio Radar on Right-Angle (90°) Vertices
    let lastSonarTime = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSonarTime < 45) return; // ~22fps ray/distance throttle for smooth performance
      lastSonarTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      const activePoly = stateRef.current.activePolygon;
      const pivot = polygonPivotMap.get(activePoly.id);
      if (!pivot) return;

      // Find closest right-angle vertex on screen
      let maxProximity = 0;
      let targetPan = 0;

      // Threshold in pixels where audio cue activates (~220px on screen)
      const maxDetectionRadius = Math.min(rect.width, rect.height) * 0.38;

      activePoly.vertices.forEach((v) => {
        if (!v.isRight) return; // Only right angles emit crystalline discovery audio chimes

        // Convert vertex local coordinates (v.x, v.y, 0.18) to 3D World space then 2D Screen space
        _vertexWorldPos.set(v.x, v.y, 0.18);
        pivot.localToWorld(_vertexWorldPos);

        _vertexScreenPos.copy(_vertexWorldPos).project(camera);

        // Ensure vertex is in front of the camera
        if (_vertexScreenPos.z > 1) return;

        const screenX = ((_vertexScreenPos.x + 1) / 2) * rect.width + rect.left;
        const screenY = ((-_vertexScreenPos.y + 1) / 2) * rect.height + rect.top;

        const dx = screenX - clientX;
        const dy = screenY - clientY;
        const pixelDist = Math.hypot(dx, dy);

        if (pixelDist < maxDetectionRadius) {
          // Normalize proximity: 1.0 = right on top of vertex, 0.0 = at radius border
          const proximity = Math.max(0, 1 - pixelDist / maxDetectionRadius);
          if (proximity > maxProximity) {
            maxProximity = proximity;
            // Calculate stereo panning: if vertex is to the right of cursor => positive pan, left => negative pan
            targetPan = THREE.MathUtils.clamp(dx / (maxDetectionRadius * 0.75), -1, 1);
          }
        }
      });

      if (maxProximity > 0.04) {
        sound.updateRightAngleProximitySonar(maxProximity, targetPan);
      }
      if (maxProximity > 0.82) {
        sound.playRightAngleHoverChime(targetPan);
      }
      renderer.domElement.style.cursor = maxProximity > 0.7 ? 'pointer' : 'default';
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit drags

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableObjects, false);
      if (hits.length > 0) {
        const hit = hits[0];
        const data = hit.object.userData;
        if (data.type === 'vertex') {
          if (data.polygonId !== stateRef.current.activePolygon.id) {
            stateRef.current.onSelectPolygon(data.polygonId);
          }
          stateRef.current.onSelectVertex(data.vertexId, { x: e.clientX, y: e.clientY });
        } else if (data.type === 'polygon') {
          sound.playClick();
          stateRef.current.onSelectPolygon(data.polygonId);
        } else if (data.type === 'ground') {
          _playerTarget.set(
            THREE.MathUtils.clamp(hit.point.x, -11, 11),
            0,
            THREE.MathUtils.clamp(hit.point.z, -9, 9)
          );
        }
      }
    };

    // Keyboard WASD / Arrow Keys to walk the Explorer around the island
    const keysPressed: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 4. Animation Loop with Software-WebGL Pacing Guard (afterDraw)
    const clock = new THREE.Clock();
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const cur = stateRef.current;

      // Keyboard movement for Explorer
      const moveSpeed = 6.5 * delta;
      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) _playerTarget.z -= moveSpeed;
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) _playerTarget.z += moveSpeed;
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) _playerTarget.x -= moveSpeed;
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) _playerTarget.x += moveSpeed;

      // Smoothly move Player Explorer toward _playerTarget
      const distToTarget = _vecA.subVectors(_playerTarget, playerGroup.position).length();
      if (distToTarget > 0.08) {
        const targetAngle = Math.atan2(
          _playerTarget.x - playerGroup.position.x,
          _playerTarget.z - playerGroup.position.z
        );
        playerGroup.rotation.y = THREE.MathUtils.damp(
          playerGroup.rotation.y,
          targetAngle,
          8,
          delta
        );
        playerGroup.position.x = THREE.MathUtils.damp(
          playerGroup.position.x,
          _playerTarget.x,
          5,
          delta
        );
        playerGroup.position.z = THREE.MathUtils.damp(
          playerGroup.position.z,
          _playerTarget.z,
          5,
          delta
        );
        // Walking hop bounce
        playerGroup.position.y = Math.abs(Math.sin(elapsed * 10)) * 0.18;
      } else {
        playerGroup.position.y = THREE.MathUtils.damp(playerGroup.position.y, 0, 8, delta);
      }

      // Animate Mestre Esquadro & Neblino
      masterGroup.position.y = Math.sin(elapsed * 2.2) * 0.15;
      masterGroup.rotation.y = 0.35 + Math.sin(elapsed * 1.4) * 0.2;

      const allComplete = cur.completedPolygonIds.length === cur.level.polygons.length;
      const targetNeblinoScale = allComplete ? 0.01 : 1;
      neblinoGroup.scale.setScalar(
        THREE.MathUtils.damp(neblinoGroup.scale.x, targetNeblinoScale, 4, delta)
      );
      neblinoGroup.position.y = 3.2 + Math.cos(elapsed * 2.5) * 0.28;
      neblinoGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.35;

      // Animate Portal Ring & River
      if (portalRingMesh) {
        portalRingMesh.rotation.z += delta * (allComplete ? 2.4 : 0.6);
      }
      if (riverMesh) {
        riverMesh.position.y = 0.03 + Math.sin(elapsed * 3) * 0.025;
      }
      if (celebrationParticles) {
        celebrationParticles.rotation.y += delta * 0.08;
      }

      // Animate Polygons on Pedestals
      cur.level.polygons.forEach((poly) => {
        const pivot = polygonPivotMap.get(poly.id);
        if (!pivot) return;
        const isSelected = poly.id === cur.activePolygon.id;
        const targetRotY = isSelected ? cur.polygonRotationY : Math.sin(elapsed * 0.8) * 0.25;
        pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, targetRotY, 6, delta);
        pivot.position.y = 3.1 + Math.sin(elapsed * 2 + poly.worldPos[0]) * 0.12;
      });

      // Smooth Camera Choreography (when user is not actively dragging OrbitControls)
      if (!userDraggingOrbit) {
        const activePos = cur.activePolygon.worldPos;
        if (cur.cameraMode === 'inspecao') {
          const zoomDist = 6.8 / cur.polygonZoom;
          _targetCamPos.set(activePos[0], 3.4, activePos[1] + zoomDist);
          _targetLookAt.set(activePos[0], 3.0, activePos[1]);
        } else if (cur.cameraMode === 'topo') {
          _targetCamPos.set(0, 22, 4);
          _targetLookAt.set(0, 0, -2);
        } else {
          // 'ilha' overview
          _targetCamPos.set(0, 11.5, 16.5);
          _targetLookAt.set(0, 1.8, -2.5);
        }

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, 4.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, 4.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, 4.5, delta);
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Trigger level rebuild when level changes
  useEffect(() => {
    sceneObjectsRef.current.rebuildLevel?.();
  }, [level.id]);

  // Trigger active vertex/esquadro/completion visuals update
  useEffect(() => {
    sceneObjectsRef.current.updateActiveVisuals?.();
  }, [activePolygon.id, activeVertex.id, showEsquadro3D, completedPolygonIds.length]);

  return <div ref={canvasMountRef} className="w-full h-full" />;
};
