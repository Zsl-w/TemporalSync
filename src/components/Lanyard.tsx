/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import cardGLB from './card.glb';
import lanyard from './lanyard.png';
import './Lanyard.css';

import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
}

const segmentProps: any = {
  type: 'dynamic',
  canSleep: true,
  colliders: false,
  angularDamping: 4,
  linearDamping: 4
};

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={isMobile ? [0, -18, 0] : gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const texture = useTexture(lanyard);
  const avatarTexture = useTexture('/assets/card_touxiang.jpg');
  const contactTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const textureScale = 2;
    const badgeWidth = 1024;
    const badgeHeight = 1400;
    canvas.width = badgeWidth * textureScale;
    canvas.height = badgeHeight * textureScale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(textureScale, textureScale);
    const avatarImage = avatarTexture.image as CanvasImageSource | undefined;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, badgeWidth, badgeHeight);

    const gradient = ctx.createLinearGradient(0, 0, badgeWidth, badgeHeight);
    gradient.addColorStop(0, '#050505');
    gradient.addColorStop(0.58, '#111111');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, badgeWidth, badgeHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 18;
    ctx.strokeRect(34, 34, 956, 1332);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.76)';
    ctx.lineWidth = 6;
    ctx.strokeRect(72, 72, 880, 1256);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 2;
    for (let x = 64; x < badgeWidth; x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, 48);
      ctx.lineTo(x, badgeHeight - 48);
      ctx.stroke();
    }
    for (let y = 64; y < badgeHeight; y += 72) {
      ctx.beginPath();
      ctx.moveTo(48, y);
      ctx.lineTo(badgeWidth - 48, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(104, 158, 10, 158);

    const avatarX = 612;
    const avatarY = 505;
    const avatarWidth = 282;
    const avatarHeight = 390;
    ctx.save();
    ctx.beginPath();
    ctx.rect(avatarX, avatarY, avatarWidth, avatarHeight);
    ctx.clip();
    if (avatarImage) {
      const imageSource = avatarImage as CanvasImageSource & {
        naturalWidth?: number;
        naturalHeight?: number;
        width?: number;
        height?: number;
      };
      const sourceWidth = Number(imageSource.naturalWidth ?? imageSource.width ?? avatarWidth);
      const sourceHeight = Number(imageSource.naturalHeight ?? imageSource.height ?? avatarHeight);
      const sourceRatio = sourceWidth / sourceHeight;
      const targetRatio = avatarWidth / avatarHeight;
      const sourceCropWidth = sourceRatio > targetRatio ? sourceHeight * targetRatio : sourceWidth;
      const sourceCropHeight = sourceRatio > targetRatio ? sourceHeight : sourceWidth / targetRatio;
      const sourceX = (sourceWidth - sourceCropWidth) / 2;
      const sourceY = (sourceHeight - sourceCropHeight) / 2;
      ctx.filter = 'grayscale(1) contrast(1.28) brightness(1.06)';
      ctx.drawImage(avatarImage, sourceX, sourceY, sourceCropWidth, sourceCropHeight, avatarX, avatarY, avatarWidth, avatarHeight);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#1f1f1f';
      ctx.fillRect(avatarX, avatarY, avatarWidth, avatarHeight);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 8;
    ctx.strokeRect(avatarX, avatarY, avatarWidth, avatarHeight);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 132px sans-serif';
    ctx.fillText('TSync', 148, 220);
    ctx.fillText('7', 666, 220);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '900 42px monospace';
    ctx.fillText('STUDIO PASS', 154, 315);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(104, 420);
    ctx.lineTo(894, 420);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 118px sans-serif';
    ctx.fillText('CQMU', 104, 560);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = '900 50px sans-serif';
    ctx.fillText('AI MEDICINE', 104, 660);
    ctx.fillText('BIG DATA', 104, 726);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
    ctx.font = '800 34px monospace';
    ctx.fillText('TIME SYSTEMS', 104, 830);
    ctx.fillText('INTEL BUILDER', 104, 880);
    ctx.fillText('WRITING LAB', 104, 930);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px monospace';
    ctx.fillText('temporalsync.online', 104, 1118);

    ctx.fillStyle = '#ffffff';
    let barcodeX = 104;
    const bars = [8, 4, 12, 5, 5, 15, 4, 9, 12, 4, 18, 5, 8, 8, 4, 12, 18, 5, 5, 8, 12, 4, 16];
    bars.forEach((bar, index) => {
      const height = index % 3 === 0 ? 94 : 72;
      ctx.fillRect(barcodeX, 1192 + (94 - height), bar, height);
      barcodeX += bar + 8;
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
    ctx.font = '700 28px monospace';
    ctx.fillText('STUDIO IDENTITY BADGE', 104, 1310);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, [avatarTexture]);
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (!hovered) return;

    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => void (document.body.style.cursor = 'auto');
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }

    if (!fixed.current) return;

    [j1, j2].forEach(ref => {
      if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
      const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
      ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
    });

    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.lerped);
    curve.points[2].copy(j1.current.lerped);
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, isMobile ? 4.75 : 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={isMobile ? 1.5 : 2.72}
            position={[0, isMobile ? -1.12 : -1.3, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={e => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh position={[0, 0.523, 0.022]} renderOrder={10}>
              <planeGeometry args={[0.705, 0.965]} />
              <meshBasicMaterial map={contactTexture} toneMapped={false} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
