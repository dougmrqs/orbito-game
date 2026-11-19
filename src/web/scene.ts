// The three.js view of the board. It draws whatever board it is given and
// reports what was clicked; it takes no decisions about the game.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import {
  Board,
  Direction,
  SPACE_IDS,
  SpaceId,
  getSpace,
  nextSpace,
  occupiedSpaces,
} from "../engine";

export type Pick =
  | { kind: "space"; spaceId: SpaceId }
  | { kind: "button" }
  | null;

export interface Highlights {
  /** The space whose marble is picked up, if any. */
  selected: SpaceId | null;
  /** Spaces the picked up marble can go to. */
  targets: readonly SpaceId[];
  /** Whether the button is waiting to be pressed. */
  buttonArmed: boolean;
}

export interface BoardViewOptions {
  /** The way the arrows on the tracks point. */
  direction: Direction;
  /** Marble colour for each owner. */
  marbleColors: Readonly<Record<string, number>>;
}

export interface BoardView {
  sync(board: Board, options?: { animate?: boolean }): void;
  setHighlights(highlights: Highlights): void;
  pick(clientX: number, clientY: number): Pick;
  /** Where a space or the button is on screen, in client coordinates. */
  screenPoint(target: SpaceId | "button"): { x: number; y: number };
  pressButton(): void;
}

const SPACING = 1.2;
// the inner orbit is pushed out a little from the grid, to sit midway between
// the button and the outer orbit
const INNER_SPREAD = 1.3;
// a marble rests sunk into its socket, which is as wide as the marble is there
const MARBLE_RADIUS = 0.36;
const MARBLE_REST_Y = 0.2;
const SOCKET_RADIUS = 0.3;
const BUTTON_RADIUS = 0.4;
// the button is the sun of the board: the light that casts every shadow
const SUN_HEIGHT = 1.5;
const SUN_INTENSITY = 5.5;
const BOARD_SIZE = SPACING * 4 + 0.5;
const BOARD_HEIGHT = 0.5;

const COLORS = {
  board: 0x1c2740,
  socket: 0x0c1322,
  inlay: 0xb8934e,
  button: 0xe2622b,
  highlight: 0x7fd6ff,
};

interface MarbleView {
  mesh: THREE.Mesh;
  spaceId: SpaceId;
  from: THREE.Vector3;
  to: THREE.Vector3;
  start: number;
  duration: number;
  hop: number;
}

function spacePosition(id: SpaceId, y = 0): THREE.Vector3 {
  const { row, col, orbit } = getSpace(id);
  const spread = orbit === "inner" ? INNER_SPREAD : 1;

  return new THREE.Vector3(
    (col - 1.5) * SPACING * spread,
    y,
    (row - 1.5) * SPACING * spread,
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** A flat mesh lying on the board, a little above it to avoid flicker. */
function flat(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  layer: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.y = 0.002 * layer;
  mesh.receiveShadow = true;

  return mesh;
}

function buildBoard(direction: Direction): THREE.Group {
  const group = new THREE.Group();

  const slab = new THREE.Mesh(
    new RoundedBoxGeometry(BOARD_SIZE, BOARD_HEIGHT, BOARD_SIZE, 6, 0.16),
    new THREE.MeshStandardMaterial({
      color: COLORS.board,
      roughness: 0.6,
      metalness: 0.15,
    }),
  );
  slab.position.y = -BOARD_HEIGHT / 2;
  slab.receiveShadow = true;
  group.add(slab);

  const inlay = new THREE.MeshStandardMaterial({
    color: COLORS.inlay,
    roughness: 0.35,
    metalness: 0.8,
    side: THREE.DoubleSide,
  });
  const socket = new THREE.MeshStandardMaterial({
    color: COLORS.socket,
    roughness: 0.9,
  });

  const trackGeometry = new THREE.PlaneGeometry(SPACING, 0.05).rotateX(
    -Math.PI / 2,
  );
  const socketGeometry = new THREE.CircleGeometry(SOCKET_RADIUS, 48).rotateX(
    -Math.PI / 2,
  );
  const rimGeometry = new THREE.RingGeometry(
    SOCKET_RADIUS,
    SOCKET_RADIUS + 0.03,
    48,
  ).rotateX(-Math.PI / 2);
  const arrowGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.1, 0, 0),
    new THREE.Vector3(-0.07, 0, -0.1),
    new THREE.Vector3(-0.07, 0, 0.1),
  ]);
  arrowGeometry.computeVertexNormals();

  SPACE_IDS.forEach((id) => {
    const here = spacePosition(id);
    const there = spacePosition(nextSpace(id, direction));
    const middle = here.clone().lerp(there, 0.5);
    const heading = Math.atan2(-(there.z - here.z), there.x - here.x);

    // the track to the next space, with an arrow showing which way marbles go
    const track = flat(trackGeometry, inlay, 1);
    track.position.add(middle);
    track.rotation.y = heading;
    track.scale.x = here.distanceTo(there) / SPACING;

    const arrow = flat(arrowGeometry, inlay, 2);
    arrow.position.add(middle);
    arrow.rotation.y = heading;

    const hole = flat(socketGeometry, socket, 3);
    hole.position.add(here);

    const rim = flat(rimGeometry, inlay, 4);
    rim.position.add(here);

    group.add(track, arrow, hole, rim);
  });

  return group;
}

function buildButton() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(
      BUTTON_RADIUS + 0.05,
      BUTTON_RADIUS + 0.07,
      0.06,
      48,
    ),
    new THREE.MeshStandardMaterial({
      color: COLORS.inlay,
      roughness: 0.35,
      metalness: 0.8,
    }),
  );
  base.position.y = 0.03;
  base.receiveShadow = true;

  const material = new THREE.MeshStandardMaterial({
    // mostly its own glow, so the light above does not wash its colour out
    color: 0x6b2408,
    emissive: COLORS.button,
    emissiveIntensity: 0.8,
    roughness: 0.45,
  });
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(
      BUTTON_RADIUS,
      48,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    ),
    material,
  );
  cap.scale.y = 0.7;

  group.add(base, cap);

  return { group, cap, material };
}

export function createBoardView(
  container: HTMLElement,
  options: BoardViewOptions,
): BoardView {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;

  const sun = new THREE.PointLight(0xffd2ad, SUN_INTENSITY, 0, 1);
  sun.position.set(0, SUN_HEIGHT, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 12;
  sun.shadow.bias = -0.002;
  sun.shadow.radius = 4;
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 8.4, 4.6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 7;
  controls.maxDistance = 30;
  controls.maxPolarAngle = 1.3;

  scene.add(buildBoard(options.direction));

  const button = buildButton();
  scene.add(button.group);

  // highlights
  const glow = new THREE.MeshBasicMaterial({
    color: COLORS.highlight,
    transparent: true,
    opacity: 0.9,
  });
  const selection = new THREE.Mesh(
    new THREE.TorusGeometry(MARBLE_RADIUS + 0.08, 0.03, 12, 64).rotateX(
      Math.PI / 2,
    ),
    glow,
  );
  selection.position.y = 0.03;
  selection.visible = false;
  scene.add(selection);

  const targetGeometry = new THREE.CircleGeometry(0.13, 32).rotateX(
    -Math.PI / 2,
  );
  const targets = new Map<SpaceId, THREE.Mesh>(
    SPACE_IDS.map((id) => {
      const dot = new THREE.Mesh(targetGeometry, glow);
      dot.position.copy(spacePosition(id, 0.012));
      dot.visible = false;
      scene.add(dot);

      return [id, dot];
    }),
  );

  // marbles
  const marbleGeometry = new THREE.SphereGeometry(MARBLE_RADIUS, 48, 32);
  const marbleMaterials = new Map<string, THREE.Material>();
  const marbles = new Map<number, MarbleView>();

  function marbleMaterial(owner: string): THREE.Material {
    let material = marbleMaterials.get(owner);

    if (!material) {
      material = new THREE.MeshPhysicalMaterial({
        color: options.marbleColors[owner] ?? 0x888888,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      });
      marbleMaterials.set(owner, material);
    }

    return material;
  }

  let buttonArmed = false;
  let buttonPressedAt = -Infinity;

  function resize() {
    const { clientWidth: width, clientHeight: height } = container;
    const aspect = width / Math.max(height, 1);

    renderer.setSize(width, height);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    // step back on narrow screens so the whole board stays in view
    camera.position.setLength(12.6 * Math.max(1, 1.05 / aspect));
  }

  new ResizeObserver(resize).observe(container);
  resize();

  renderer.setAnimationLoop((now) => {
    marbles.forEach((marble) => {
      const t = Math.min((now - marble.start) / marble.duration, 1);

      marble.mesh.position.lerpVectors(marble.from, marble.to, easeInOut(t));
      marble.mesh.position.y += Math.sin(Math.PI * t) * marble.hop;
    });

    const pulse = 0.5 + 0.5 * Math.sin(now / 260);
    button.material.emissiveIntensity = buttonArmed ? 0.75 + 0.5 * pulse : 0.8;
    sun.intensity = SUN_INTENSITY * (buttonArmed ? 0.9 + 0.25 * pulse : 1);
    glow.opacity = 0.55 + 0.35 * pulse;

    const press = Math.min((now - buttonPressedAt) / 220, 1);
    button.cap.position.y = 0.05 - 0.05 * Math.sin(Math.PI * press);

    controls.update();
    renderer.render(scene, camera);
  });

  const raycaster = new THREE.Raycaster();
  const pickPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -MARBLE_REST_Y);

  return {
    sync(board, { animate = true } = {}) {
      const now = performance.now();
      const duration = animate && !reducedMotion ? 450 : 0;
      const onBoard = new Set<number>();

      occupiedSpaces(board).forEach(({ spaceId, marble }) => {
        const to = spacePosition(spaceId, MARBLE_REST_Y);
        const view = marbles.get(marble.id);

        onBoard.add(marble.id);

        if (!view) {
          // a new marble drops in from above
          const mesh = new THREE.Mesh(
            marbleGeometry,
            marbleMaterial(marble.owner),
          );
          const from = to.clone().setY(duration ? 2.4 : to.y);

          mesh.castShadow = true;
          mesh.position.copy(from);
          scene.add(mesh);
          marbles.set(marble.id, {
            mesh,
            spaceId,
            from,
            to,
            start: now,
            duration,
            hop: 0,
          });
        } else if (view.spaceId !== spaceId) {
          Object.assign(view, {
            spaceId,
            from: view.mesh.position.clone(),
            to,
            start: now,
            duration,
            hop: 0.14,
          });
        }
      });

      marbles.forEach((view, id) => {
        if (!onBoard.has(id)) {
          scene.remove(view.mesh);
          marbles.delete(id);
        }
      });
    },

    setHighlights(highlights) {
      buttonArmed = highlights.buttonArmed;
      selection.visible = highlights.selected !== null;

      if (highlights.selected !== null) {
        selection.position.copy(spacePosition(highlights.selected, 0.03));
      }

      targets.forEach((dot, id) => {
        dot.visible = highlights.targets.includes(id);
      });
    },

    pick(clientX, clientY) {
      const bounds = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        -((clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      const point = new THREE.Vector3();

      raycaster.setFromCamera(pointer, camera);

      if (!raycaster.ray.intersectPlane(pickPlane, point)) return null;

      if (Math.hypot(point.x, point.z) <= BUTTON_RADIUS + 0.03) {
        return { kind: "button" };
      }

      const spaceId = SPACE_IDS.find((id) => {
        const center = spacePosition(id);

        return Math.hypot(point.x - center.x, point.z - center.z) <= 0.5;
      });

      return spaceId ? { kind: "space", spaceId } : null;
    },

    screenPoint(target) {
      const bounds = renderer.domElement.getBoundingClientRect();
      const point =
        target === "button"
          ? new THREE.Vector3(0, MARBLE_REST_Y, 0)
          : spacePosition(target, MARBLE_REST_Y);

      point.project(camera);

      return {
        x: bounds.left + ((point.x + 1) / 2) * bounds.width,
        y: bounds.top + ((1 - point.y) / 2) * bounds.height,
      };
    },

    pressButton() {
      buttonPressedAt = performance.now();
    },
  };
}
