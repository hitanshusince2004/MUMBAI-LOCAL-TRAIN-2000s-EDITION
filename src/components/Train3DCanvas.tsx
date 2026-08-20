import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Station, TimeOfDay } from '../types';

interface Train3DCanvasProps {
  currentStation: Station;
  nextStation: Station;
  signalState: 'green' | 'yellow' | 'red';
  isMonsoon: boolean;
  timeOfDay: TimeOfDay;
  isHeadlightHigh: boolean;
  onTrainClick: () => void;
  onJourneyComplete: () => void;
  onSpeedChange?: (speedKmph: number) => void;
}

export const Train3DCanvas: React.FC<Train3DCanvasProps> = ({
  currentStation,
  signalState,
  isMonsoon,
  timeOfDay,
  isHeadlightHigh,
  onTrainClick,
  onJourneyComplete,
  onSpeedChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const destinationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const destinationTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // References for animation loop
  const animStateRef = useRef({
    trainX: -85, // starting off-screen left
    speed: 0.28,
    targetSpeed: 0.28,
    direction: 1, // 1: left-to-right, -1: right-to-left
    wheelRotation: 0,
    sparkTimer: 0,
    flickerTimer: 0,
    hasTriggeredTurnaround: false,
    screenShake: 0,
  });

  // Track station updates
  const stationRef = useRef(currentStation);
  useEffect(() => {
    stationRef.current = currentStation;
    updateDestinationTexture(currentStation.name, currentStation.nameHindi);
  }, [currentStation]);

  const updateDestinationTexture = (engText: string, hindiText: string) => {
    if (!destinationCanvasRef.current || !destinationTextureRef.current) return;
    const canvas = destinationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark matrix background with LED dot pattern
    ctx.fillStyle = '#060a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle amber LED matrix grid dots
    ctx.fillStyle = 'rgba(255, 170, 0, 0.08)';
    for (let x = 4; x < canvas.width; x += 6) {
      for (let y = 4; y < canvas.height; y += 6) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Glowing illuminated text (Classic 2000s Yellow-Amber LED / Backlit board)
    ctx.shadowColor = '#ffb300';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffe082';

    // Hindi text
    ctx.font = 'bold 26px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hindiText, canvas.width / 2, 28);

    // English text
    ctx.font = '900 36px "Share Tech Mono", "Teko", monospace';
    ctx.fillStyle = '#fff9c4';
    ctx.shadowColor = '#ff9800';
    ctx.shadowBlur = 16;
    ctx.fillText(engText, canvas.width / 2, 68);

    destinationTextureRef.current.needsUpdate = true;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create destination board canvas texture
    const destCanvas = document.createElement('canvas');
    destCanvas.width = 320;
    destCanvas.height = 100;
    destinationCanvasRef.current = destCanvas;
    const destTexture = new THREE.CanvasTexture(destCanvas);
    destTexture.minFilter = THREE.LinearFilter;
    destTexture.magFilter = THREE.LinearFilter;
    destinationTextureRef.current = destTexture;
    updateDestinationTexture(stationRef.current.name, stationRef.current.nameHindi);

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(
      timeOfDay === 'monsoon_evening' ? 0x0c1424 : timeOfDay === 'sodium_night' ? 0x090d16 : 0x1c1822,
      0.015
    );

    // Camera setup - 2.5D Cinematic perspective overlooking rails and platform
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 3.2, 22);
    camera.lookAt(0, 2.5, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xdde6ff, 0.9);
    scene.add(ambientLight);

    const platformSodiumLight = new THREE.PointLight(0xffaa33, 2.8, 45, 1.2);
    platformSodiumLight.position.set(-10, 8, 8);
    platformSodiumLight.castShadow = true;
    scene.add(platformSodiumLight);

    const platformSodiumLight2 = new THREE.PointLight(0xff9922, 2.5, 45, 1.2);
    platformSodiumLight2.position.set(15, 8, 8);
    scene.add(platformSodiumLight2);

    const moonLight = new THREE.DirectionalLight(0x8ab4f8, 1.2);
    moonLight.position.set(-20, 30, 20);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // ==========================================
    // BUILD 3D MUMBAI LOCAL TRAIN RAKE (EMU)
    // ==========================================
    const trainGroup = new THREE.Group();
    scene.add(trainGroup);

    // Classic 2000s Western/Central Railway livery materials
    const liveryCream = new THREE.MeshStandardMaterial({
      color: 0xf3eedb, // Off-white / Cream
      roughness: 0.35,
      metalness: 0.2,
    });

    const liveryMaroon = new THREE.MeshStandardMaterial({
      color: 0x7a1820, // Classic Dark Maroon / Crimson striping
      roughness: 0.4,
      metalness: 0.3,
    });

    const steelRoofMat = new THREE.MeshStandardMaterial({
      color: 0x5a6268,
      roughness: 0.5,
      metalness: 0.7,
    });

    const darkUnderbodyMat = new THREE.MeshStandardMaterial({
      color: 0x181c20,
      roughness: 0.8,
      metalness: 0.6,
    });

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0a121e,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    });

    const interiorWarmLightMat = new THREE.MeshBasicMaterial({
      color: 0xffeaad, // Warm fluorescent 2000s tube lights
    });

    const headlightGlassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffae0,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });

    const destinationBoardMat = new THREE.MeshBasicMaterial({
      map: destTexture,
    });

    const wheelsMat = new THREE.MeshStandardMaterial({
      color: 0x2b3035,
      roughness: 0.4,
      metalness: 0.8,
    });

    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.9,
    });

    // Wheels tracking for spinning animation
    const spinningWheels: THREE.Mesh[] = [];

    // Helper: Build single Coach
    const createCoach = (isLeadingCab: boolean, hasPantograph: boolean, coachOffset: number) => {
      const coachGroup = new THREE.Group();
      const coachLength = 16.5;
      const coachWidth = 3.6;
      const coachHeight = 3.6;

      // Coach Body (Lower Maroon + Upper Cream split)
      // Lower Maroon Section
      const lowerBodyGeo = new THREE.BoxGeometry(coachLength, 1.4, coachWidth);
      const lowerBody = new THREE.Mesh(lowerBodyGeo, liveryMaroon);
      lowerBody.position.y = 1.6;
      lowerBody.castShadow = true;
      lowerBody.receiveShadow = true;
      coachGroup.add(lowerBody);

      // Upper Cream Section
      const upperBodyGeo = new THREE.BoxGeometry(coachLength, 2.0, coachWidth);
      const upperBody = new THREE.Mesh(upperBodyGeo, liveryCream);
      upperBody.position.y = 3.3;
      upperBody.castShadow = true;
      coachGroup.add(upperBody);

      // Fluted Stainless Steel Ribs (Iconic 2000s ICF EMU Corrugation)
      for (let r = 0; r < 4; r++) {
        const ribGeo = new THREE.BoxGeometry(coachLength, 0.05, coachWidth + 0.06);
        const rib = new THREE.Mesh(ribGeo, liveryCream);
        rib.position.y = 2.4 + r * 0.22;
        coachGroup.add(rib);
      }

      // Arched Roof
      const roofGeo = new THREE.CylinderGeometry(
        coachWidth / 2 + 0.08,
        coachWidth / 2 + 0.08,
        coachLength,
        24,
        1,
        false,
        0,
        Math.PI
      );
      const roof = new THREE.Mesh(roofGeo, steelRoofMat);
      roof.rotation.z = Math.PI / 2;
      roof.rotation.y = Math.PI / 2;
      roof.position.y = 4.3;
      roof.castShadow = true;
      coachGroup.add(roof);

      // Roof Vents & Resistors
      for (let v = -coachLength / 2 + 2; v < coachLength / 2 - 2; v += 2.2) {
        const ventGeo = new THREE.BoxGeometry(0.8, 0.2, 1.2);
        const vent = new THREE.Mesh(ventGeo, darkUnderbodyMat);
        vent.position.set(v, 4.75, 0);
        coachGroup.add(vent);
      }

      // Windows (Multiple barred passenger windows)
      const windowWidth = 1.3;
      const windowHeight = 1.0;
      const numWindows = 6;
      for (let side = -1; side <= 1; side += 2) {
        for (let w = 0; w < numWindows; w++) {
          const wX = -coachLength / 2 + 2.0 + w * 2.3;
          // Skip doorway areas
          if (Math.abs(wX + 3.5) < 0.8 || Math.abs(wX - 3.5) < 0.8) continue;

          // Window Glass
          const winGeo = new THREE.PlaneGeometry(windowWidth, windowHeight);
          const win = new THREE.Mesh(winGeo, windowGlassMat);
          win.position.set(wX, 3.4, (coachWidth / 2 + 0.02) * side);
          if (side === -1) win.rotation.y = Math.PI;
          coachGroup.add(win);

          // Window Bars (Iconic 3 horizontal safety bars)
          for (let b = 0; b < 3; b++) {
            const barGeo = new THREE.BoxGeometry(windowWidth, 0.02, 0.02);
            const bar = new THREE.Mesh(barGeo, darkUnderbodyMat);
            bar.position.set(wX, 3.1 + b * 0.3, (coachWidth / 2 + 0.03) * side);
            coachGroup.add(bar);
          }

          // Interior Fluorescent Light Glow
          const interiorGlow = new THREE.Mesh(
            new THREE.PlaneGeometry(windowWidth * 0.9, windowHeight * 0.8),
            interiorWarmLightMat
          );
          interiorGlow.position.set(wX, 3.4, (coachWidth / 2 - 0.05) * side);
          if (side === -1) interiorGlow.rotation.y = Math.PI;
          coachGroup.add(interiorGlow);
        }
      }

      // Open Passenger Doors (Iconic Mumbai Local experience with grab poles)
      const doorPositions = [-3.8, 3.8];
      doorPositions.forEach((dX) => {
        for (let side = -1; side <= 1; side += 2) {
          // Open doorway cavity
          const doorVoidGeo = new THREE.PlaneGeometry(1.6, 2.5);
          const doorVoid = new THREE.Mesh(doorVoidGeo, darkUnderbodyMat);
          doorVoid.position.set(dX, 2.5, (coachWidth / 2 + 0.01) * side);
          if (side === -1) doorVoid.rotation.y = Math.PI;
          coachGroup.add(doorVoid);

          // Center Stainless Steel Grab Pole (for hanging commuters)
          const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
          const pole = new THREE.Mesh(poleGeo, liveryCream);
          pole.position.set(dX, 2.5, (coachWidth / 2 + 0.02) * side);
          coachGroup.add(pole);

          // Commuter silhouettes standing near door
          const commuterGeo = new THREE.BoxGeometry(0.45, 1.4, 0.3);
          const commuterMat = new THREE.MeshStandardMaterial({
            color: side === 1 ? 0x223344 : 0x443322,
            roughness: 0.7,
          });
          const commuter = new THREE.Mesh(commuterGeo, commuterMat);
          commuter.position.set(dX + 0.35, 2.2, (coachWidth / 2 - 0.25) * side);
          coachGroup.add(commuter);
        }
      });

      // Underbody Equipment (Battery boxes, air brake tanks, piping)
      const underBox1Geo = new THREE.BoxGeometry(3.5, 0.7, 2.6);
      const underBox1 = new THREE.Mesh(underBox1Geo, darkUnderbodyMat);
      underBox1.position.set(-2.5, 0.65, 0);
      coachGroup.add(underBox1);

      const underBox2Geo = new THREE.CylinderGeometry(0.4, 0.4, 3.2, 12);
      const underBox2 = new THREE.Mesh(underBox2Geo, darkUnderbodyMat);
      underBox2.rotation.z = Math.PI / 2;
      underBox2.position.set(2.5, 0.6, 0);
      coachGroup.add(underBox2);

      // Bogies & Wheels (Front & Rear Bogie)
      const bogieOffsets = [-coachLength / 2 + 3.0, coachLength / 2 - 3.0];
      bogieOffsets.forEach((bX) => {
        const bogieFrameGeo = new THREE.BoxGeometry(3.2, 0.35, 2.9);
        const bogieFrame = new THREE.Mesh(bogieFrameGeo, darkUnderbodyMat);
        bogieFrame.position.set(bX, 0.6, 0);
        coachGroup.add(bogieFrame);

        // 4 Wheels per bogie (2 axles)
        const axleOffsets = [-1.0, 1.0];
        axleOffsets.forEach((aX) => {
          for (let side = -1; side <= 1; side += 2) {
            const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.18, 16);
            const wheel = new THREE.Mesh(wheelGeo, wheelsMat);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(bX + aX, 0.55, (coachWidth / 2 - 0.3) * side);
            coachGroup.add(wheel);
            spinningWheels.push(wheel);
          }
        });
      });

      // ==========================================
      // LEADING DRIVING CAB FEATURES (Front Nose)
      // ==========================================
      if (isLeadingCab) {
        const cabFrontX = coachLength / 2;

        // Aerodynamic Rounded Front Nose
        const cabNoseGeo = new THREE.CylinderGeometry(
          coachWidth / 2,
          coachWidth / 2,
          3.4,
          16,
          1,
          false,
          0,
          Math.PI
        );
        const cabNose = new THREE.Mesh(cabNoseGeo, liveryMaroon);
        cabNose.rotation.y = -Math.PI / 2;
        cabNose.position.set(cabFrontX, 2.6, 0);
        coachGroup.add(cabNose);

        // Yellow Warning Stripes on Bumper
        const bumperStripeGeo = new THREE.BoxGeometry(0.1, 0.6, coachWidth - 0.2);
        const bumperStripeMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const bumperStripe = new THREE.Mesh(bumperStripeGeo, bumperStripeMat);
        bumperStripe.position.set(cabFrontX + 0.15, 1.2, 0);
        coachGroup.add(bumperStripe);

        // Center Coupler Buffer (Red beam)
        const couplerGeo = new THREE.BoxGeometry(1.0, 0.35, 0.45);
        const couplerMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, metalness: 0.8 });
        const coupler = new THREE.Mesh(couplerGeo, couplerMat);
        coupler.position.set(cabFrontX + 0.5, 0.8, 0);
        coachGroup.add(coupler);

        // Windscreen (Driver Windows with Security Grills)
        const windscreenGeo = new THREE.BoxGeometry(0.1, 1.1, 1.4);
        for (let side = -1; side <= 1; side += 2) {
          const windscreen = new THREE.Mesh(windscreenGeo, windowGlassMat);
          windscreen.position.set(cabFrontX + 0.1, 3.4, 0.85 * side);
          coachGroup.add(windscreen);

          // Wiper
          const wiperGeo = new THREE.BoxGeometry(0.04, 0.8, 0.04);
          const wiper = new THREE.Mesh(wiperGeo, darkUnderbodyMat);
          wiper.rotation.z = -0.3;
          wiper.position.set(cabFrontX + 0.15, 3.4, 0.85 * side);
          coachGroup.add(wiper);
        }

        // ==========================================
        // DYNAMIC DESTINATION BOARD (Top center front)
        // ==========================================
        const destBoardGeo = new THREE.BoxGeometry(0.12, 0.9, 2.2);
        const destBoard = new THREE.Mesh(destBoardGeo, destinationBoardMat);
        destBoard.position.set(cabFrontX + 0.12, 4.45, 0);
        coachGroup.add(destBoard);

        // Destination Board Hood/Frame
        const destHoodGeo = new THREE.BoxGeometry(0.3, 0.1, 2.4);
        const destHood = new THREE.Mesh(destHoodGeo, darkUnderbodyMat);
        destHood.position.set(cabFrontX + 0.15, 4.95, 0);
        coachGroup.add(destHood);

        // High-Intensity Dual Halogen Headlights
        const headlightGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 16);
        const leftHeadlight = new THREE.Mesh(headlightGeo, headlightGlassMat);
        leftHeadlight.rotation.z = Math.PI / 2;
        leftHeadlight.position.set(cabFrontX + 0.15, 2.2, 0.9);
        coachGroup.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeo, headlightGlassMat);
        rightHeadlight.rotation.z = Math.PI / 2;
        rightHeadlight.position.set(cabFrontX + 0.15, 2.2, -0.9);
        coachGroup.add(rightHeadlight);

        // Volumetric Headlight Light Spotlight
        const headlightSpot = new THREE.SpotLight(0xfffae6, isHeadlightHigh ? 8.0 : 4.5, 60, Math.PI / 5, 0.4, 1.0);
        headlightSpot.position.set(cabFrontX + 0.2, 2.2, 0);
        headlightSpot.target.position.set(cabFrontX + 35, 0.5, 0);
        coachGroup.add(headlightSpot);
        coachGroup.add(headlightSpot.target);

        // Headlight Light Cone Mesh (Volumetric Beam Effect)
        const coneGeo = new THREE.ConeGeometry(5.5, 30, 24, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: 0xfffae6,
          transparent: true,
          opacity: 0.14,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.rotation.z = -Math.PI / 2;
        cone.position.set(cabFrontX + 15, 2.0, 0);
        coachGroup.add(cone);
      }

      // ==========================================
      // ROOF PANTOGRAPH (Touching Overhead Wires)
      // ==========================================
      if (hasPantograph) {
        const pantoGroup = new THREE.Group();
        pantoGroup.position.set(0, 4.8, 0);

        // Base insulators (4 red ceramic bells)
        const insGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.35, 8);
        const insMat = new THREE.MeshStandardMaterial({ color: 0xaa3322 });
        [-0.8, 0.8].forEach((ix) => {
          [-0.8, 0.8].forEach((iz) => {
            const ins = new THREE.Mesh(insGeo, insMat);
            ins.position.set(ix, 0.18, iz);
            pantoGroup.add(ins);
          });
        });

        // Pantograph Diamond Arms
        const armMat = new THREE.MeshStandardMaterial({ color: 0xdd8833, metalness: 0.8 });
        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8);

        const lowerArm = new THREE.Mesh(armGeo, armMat);
        lowerArm.rotation.z = 0.65;
        lowerArm.position.set(0.6, 1.1, 0);
        pantoGroup.add(lowerArm);

        const upperArm = new THREE.Mesh(armGeo, armMat);
        upperArm.rotation.z = -0.65;
        upperArm.position.set(-0.6, 1.1, 0);
        pantoGroup.add(upperArm);

        // Top Contact Pan (Touches catenary wire at y=7.1)
        const panGeo = new THREE.BoxGeometry(0.1, 0.08, 2.4);
        const pan = new THREE.Mesh(panGeo, armMat);
        pan.position.set(0, 2.2, 0);
        pantoGroup.add(pan);

        // Electric Spark Light
        const sparkLight = new THREE.PointLight(0x88ddff, 0, 15);
        sparkLight.position.set(0, 2.3, 0);
        pantoGroup.add(sparkLight);

        // Spark Particle Burst
        const sparkParticleGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const sparkMesh = new THREE.Mesh(sparkParticleGeo, sparkMat);
        sparkMesh.position.set(0, 2.3, 0);
        sparkMesh.visible = false;
        pantoGroup.add(sparkMesh);

        coachGroup.add(pantoGroup);
      }

      coachGroup.position.x = coachOffset;
      return coachGroup;
    };

    // Construct 4-Coach EMU Rake
    // Coach 0: Driving Motor Coach (Front Cab)
    const coach0 = createCoach(true, false, 0);
    // Coach 1: Trailer Coach
    const coach1 = createCoach(false, false, -17.2);
    // Coach 2: Motor Coach with Pantograph
    const coach2 = createCoach(false, true, -34.4);
    // Coach 3: Rear Coach
    const coach3 = createCoach(false, false, -51.6);

    trainGroup.add(coach0);
    trainGroup.add(coach1);
    trainGroup.add(coach2);
    trainGroup.add(coach3);

    // ==========================================
    // RAILWAY TRACKS & BALLAST GROUND (3D Layer)
    // ==========================================
    const groundGeo = new THREE.PlaneGeometry(300, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x14181f,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    // Ballast Gravel Track Bed
    const ballastGeo = new THREE.BoxGeometry(300, 0.3, 6.5);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x272c33,
      roughness: 0.95,
    });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, 0.15, 0);
    ballast.receiveShadow = true;
    scene.add(ballast);

    // Railway Sleepers (Ties)
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x483e35, roughness: 0.8 });
    const sleeperGeo = new THREE.BoxGeometry(0.35, 0.22, 4.4);
    for (let s = -140; s <= 140; s += 1.2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(s, 0.25, 0);
      sleeper.receiveShadow = true;
      scene.add(sleeper);
    }

    // Steel Rails (Pair of shiny steel rails)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x8fa2b8,
      roughness: 0.15,
      metalness: 0.95,
    });
    const railGeo = new THREE.BoxGeometry(300, 0.2, 0.12);

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, 0.45, 1.4);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, 0.45, -1.4);
    scene.add(rightRail);

    // Overhead Catenary Tension Wire (Touched by pantograph at y=7.0)
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x222a35 });
    const wireGeo = new THREE.BoxGeometry(300, 0.03, 0.03);
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, 7.0, 0);
    scene.add(wire);

    // OHE Gantry Steel Masts
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.6 });
    for (let m = -120; m <= 120; m += 40) {
      const mastGroup = new THREE.Group();
      mastGroup.position.set(m, 0, -4.5);

      const vertPoleGeo = new THREE.BoxGeometry(0.35, 8.5, 0.35);
      const vertPole = new THREE.Mesh(vertPoleGeo, mastMat);
      vertPole.position.y = 4.25;
      mastGroup.add(vertPole);

      const cantileverGeo = new THREE.BoxGeometry(0.2, 0.2, 5.0);
      const cantilever = new THREE.Mesh(cantileverGeo, mastMat);
      cantilever.position.set(0, 7.4, 2.5);
      mastGroup.add(cantilever);

      // Dropper insulator
      const insDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6), mastMat);
      insDrop.position.set(0, 7.2, 4.5);
      mastGroup.add(insDrop);

      scene.add(mastGroup);
    }

    // ==========================================
    // MONSOON RAIN PARTICLE SYSTEM
    // ==========================================
    const rainCount = 1400;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    const rainVel = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 120;
      rainPos[i * 3 + 1] = Math.random() * 30;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      rainVel[i] = 0.5 + Math.random() * 0.4;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x90c2e7,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // ==========================================
    // ANIMATION & KINEMATICS LOOP
    // ==========================================
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = animStateRef.current;

      // Adjust speed based on Signal
      if (signalState === 'red') {
        state.targetSpeed = 0.0;
      } else if (signalState === 'yellow') {
        state.targetSpeed = 0.12;
      } else {
        state.targetSpeed = 0.32; // Green fast local
      }

      // Smooth acceleration / braking
      state.speed += (state.targetSpeed - state.speed) * delta * 2.2;

      // Update speed in km/h for UI
      if (onSpeedChange) {
        const kmph = Math.round(state.speed * 260);
        onSpeedChange(kmph);
      }

      // Move train
      state.trainX += state.speed * state.direction * 60 * delta;
      trainGroup.position.x = state.trainX;

      // Rotate wheels synchronously
      state.wheelRotation += state.speed * 18 * delta;
      spinningWheels.forEach((wheel) => {
        wheel.rotation.z = state.wheelRotation;
      });

      // Pantograph electric sparks
      state.sparkTimer += delta;
      if (state.sparkTimer > 2.5 + Math.random() * 3.0 && state.speed > 0.1) {
        state.sparkTimer = 0;
        // Trigger brief visual lightning flicker on catenary wire
        ambientLight.intensity = 1.6;
        setTimeout(() => {
          ambientLight.intensity = 0.9;
        }, 80);
      }

      // Screen shake calculation when train passes right in front
      const distFromCenter = Math.abs(state.trainX);
      if (distFromCenter < 25 && state.speed > 0.15) {
        const intensity = (1 - distFromCenter / 25) * 0.08 * (state.speed / 0.32);
        camera.position.y = 3.2 + (Math.random() - 0.5) * intensity;
        camera.position.x = (Math.random() - 0.5) * intensity;
      } else {
        camera.position.y = 3.2;
        camera.position.x = 0;
      }

      // Destination change & Journey loop trigger:
      // When train finishes crossing the screen (train rear clears viewport at x > 95 or x < -95)
      if (state.direction === 1 && state.trainX > 90) {
        if (!state.hasTriggeredTurnaround) {
          state.hasTriggeredTurnaround = true;
          onJourneyComplete();
          // Reset train smoothly to appear from left again for continuous forward journey
          state.trainX = -95;
          setTimeout(() => {
            state.hasTriggeredTurnaround = false;
          }, 600);
        }
      } else if (state.direction === -1 && state.trainX < -90) {
        if (!state.hasTriggeredTurnaround) {
          state.hasTriggeredTurnaround = true;
          onJourneyComplete();
          state.trainX = 95;
          setTimeout(() => {
            state.hasTriggeredTurnaround = false;
          }, 600);
        }
      }

      // Monsoon rain physics
      if (isMonsoon) {
        rainParticles.visible = true;
        const positions = rainGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          positions[i * 3 + 1] -= rainVel[i] * 65 * delta;
          positions[i * 3] += 8 * delta; // wind slant
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 28 + Math.random() * 5;
            positions[i * 3] = (Math.random() - 0.5) * 120;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      } else {
        rainParticles.visible = false;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [signalState, isMonsoon, timeOfDay, isHeadlightHigh, onJourneyComplete, onSpeedChange]);

  return (
    <div
      ref={containerRef}
      id="mumbai-train-3d-viewport"
      onClick={onTrainClick}
      className="relative w-full h-[52vh] min-h-[360px] max-h-[580px] cursor-pointer overflow-hidden z-10 select-none"
    >
      {/* Visual interaction badge */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-xs text-amber-200 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-mono tracking-wide">3D EMU RAKE • CLICK TRAIN FOR HORN & HIGH BEAMS</span>
      </div>
    </div>
  );
};
