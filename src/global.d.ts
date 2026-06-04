declare module '*.glb' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        meshLineGeometry: any;
        meshLineMaterial: any;
      }
    }
  }
}
