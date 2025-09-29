import React, { useRef, useEffect, useImperativeHandle, useState, forwardRef } from 'react';

export interface DrawingCanvasRef {
  toDataURL: () => string;
  clearCanvas: () => void;
  isEmpty: () => boolean;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  // Ref to store the last position to prevent re-renders on every mouse move.
  const lastPosition = useRef<{ x: number, y: number } | null>(null);

  const fillBackground = (context: CanvasRenderingContext2D) => {
    const canvas = context.canvas;
    // Save current transform, clear it, fill, then restore.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0); // Use identity matrix
    context.fillStyle = '#fef3c7'; // amber-50
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.offsetWidth * scale);
    canvas.height = Math.floor(canvas.offsetHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(scale, scale);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 6; // slightly thicker for better visibility and analysis
    contextRef.current = context;

    fillBackground(context);
  }, []);

  const getCoords = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      return null;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const coords = getCoords(event.nativeEvent);
    const context = contextRef.current;
    if (!coords || !context) return;

    setIsDrawing(true);
    setHasDrawn(true);
    lastPosition.current = coords;

    // Draw a single "dot" to start the line.
    // This makes single clicks visible and ensures the line starts immediately.
    context.beginPath();
    context.moveTo(coords.x, coords.y);
    context.lineTo(coords.x, coords.y);
    context.stroke();
  };
  
  const finishDrawing = () => {
    setIsDrawing(false);
    lastPosition.current = null;
  };
  
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition.current) return;
    event.preventDefault();
    const coords = getCoords(event.nativeEvent);
    const context = contextRef.current;
    if (!coords || !context) return;
    
    context.beginPath();
    context.moveTo(lastPosition.current.x, lastPosition.current.y);
    context.lineTo(coords.x, coords.y);
    context.stroke();

    lastPosition.current = coords;
  };

  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL('image/png') : '';
    },
    clearCanvas: () => {
      const context = contextRef.current;
      if (context) {
        fillBackground(context);
        setHasDrawn(false);
      }
    },
    isEmpty: () => !hasDrawn,
  }));
  
  return (
    <div className="w-full max-w-sm mx-auto aspect-square bg-amber-50 rounded-lg shadow-inner border-2 border-gray-600 touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className="w-full h-full brush-cursor"
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
export default DrawingCanvas;