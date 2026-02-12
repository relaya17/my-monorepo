/**
 * Vision Processing Pipeline – Stub (VISION_SATELLITE_SPEC)
 *
 * TODO: Full implementation
 * - Consume RTSP streams from building NVR/DVR
 * - Extract frames every X seconds, send to Computer Vision (YOLO / AWS Rekognition)
 * - Detect: Water (flood), Obstruction (emergency exit blocked), Human (unauthorized area)
 * - Anonymize faces locally before processing (GDPR)
 * - Emit events to webhook / VisionLog for CEO Dashboard
 */
export type VisionEventType = 'FLOOD_DETECTION' | 'OBSTRUCTION' | 'UNAUTHORIZED_ENTRY';

export interface VisionAnomaly {
  eventType: VisionEventType;
  cameraId: string;
  buildingId: string;
  confidence: number;
  timestamp: Date;
  frameUrl?: string;
}

/**
 * Process a single frame – stub. Replace with actual CV provider.
 */
export async function processFrame(
  _frameBuffer: Buffer,
  _cameraId: string,
  _buildingId: string
): Promise<VisionAnomaly | null> {
  // TODO: Send to OpenCV / AWS Rekognition / YOLO
  // TODO: Anonymize faces before processing
  // TODO: Return anomaly if detected
  return null;
}

/**
 * Start listening to RTSP stream – stub.
 */
export async function startStreamListener(
  _rtspUrl: string,
  _cameraId: string,
  _buildingId: string,
  _intervalSeconds: number = 10
): Promise<() => void> {
  // TODO: FFmpeg / node-rtsp-stream to capture frames
  // TODO: Call processFrame for each frame
  return () => {}; // stop function
}
