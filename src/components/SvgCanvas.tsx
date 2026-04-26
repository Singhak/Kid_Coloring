import React from 'react';
import { motion } from 'motion/react';
import { SvgPath } from '../types';

interface SvgCanvasProps {
  paths: SvgPath[];
  viewBox: string;
  svgRef: React.RefObject<SVGSVGElement>;
  handleFill: (pathId: string) => void;
}

const SvgCanvas: React.FC<SvgCanvasProps> = ({ paths, viewBox, svgRef, handleFill }) => {
  return (
    <motion.svg
      key="svg-canvas"
      ref={svgRef}
      viewBox={viewBox}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full h-full max-w-[800px] max-h-[800px] cursor-pointer"
      style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }}
    >
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill={path.fill}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          onClick={() => handleFill(path.id)}
          className="transition-colors duration-300 hover:opacity-80"
        />
      ))}
    </motion.svg>
  );
};

export default SvgCanvas;