declare module 'js-aruco2/src/aruco.js' {
  export interface ArMarker {
    id: number;
    corners: { x: number; y: number }[];
    hammingDistance: number;
  }
  export interface ArDetector {
    detect(image: { width: number; height: number; data: Uint8ClampedArray }): ArMarker[];
  }
  export interface ArDictionary {
    generateSVG(id: number): string;
  }
  const aruco: {
    AR: {
      Detector: new (config: { dictionaryName: string; maxHammingDistance?: number }) => ArDetector;
      Dictionary: new (name: string) => ArDictionary;
    };
  };
  export default aruco;
}

declare module 'js-aruco2/src/dictionaries/aruco_4x4_1000.js';
