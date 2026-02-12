/**
 * HSLL Vision Service – CCTV AI Integration (Spec: docs/vantera/VISION_SATELLITE_SPEC.md)
 *
 * TODO Task 1: Vision Processing Pipeline
 * - Consume RTSP streams (pull frame every X seconds).
 * - Send frames to Computer Vision provider (OpenCV or Cloud-based AI).
 * - Anomaly Detection: Water Detection, Obstruction, Human Presence in restricted areas.
 * - Anonymize faces locally before processing (privacy).
 * - On anomaly → trigger alert logic (create System Generated ticket, notify CEO Dashboard with "Visual Evidence" badge).
 *
 * This file is a stub; implement when RTSP and CV provider are chosen.
 */

export type VisionAnomalyType = 'water' | 'obstruction' | 'human_presence';

export interface VisionAlert {
  buildingId: string;
  cameraId: string;
  type: VisionAnomalyType;
  timestamp: Date;
  frameRef?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Placeholder: process a single frame from an RTSP stream.
 * Implement: fetch frame → anonymize → call CV API → return alerts if any.
 */
export async function processFrame(
  _rtspUrl: string,
  _buildingId: string,
  _cameraId: string
): Promise<VisionAlert[]> {
  // TODO: RTSP frame capture, anonymization, CV inference, map to VisionAlert[]
  return [];
}

/**
 * Placeholder: start/stop stream processing for a building camera.
 */
export async function startStreamProcessing(
  _rtspUrl: string,
  _buildingId: string,
  _cameraId: string,
  _intervalSeconds: number
): Promise<{ jobId: string }> {
  // TODO: background job that calls processFrame every _intervalSeconds
  return { jobId: 'stub' };
}
