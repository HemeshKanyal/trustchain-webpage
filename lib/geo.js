import * as THREE from "three";

// Matches the UV layout of THREE.SphereGeometry, so a point placed here sits
// exactly over the same spot of an equirectangular texture.
export function latLonToVector3(lat, lon, radius = 1, target = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** Globe rotation (x, y) that brings lat/lon to face a camera looking down -Z. */
export function rotationToFace(lat, lon) {
  const p = latLonToVector3(lat, lon, 1);
  const y = -Math.atan2(p.x, p.z);
  const x = Math.asin(THREE.MathUtils.clamp(p.y, -1, 1));
  return { x, y };
}

/**
 * Longitude the globe faces while idling: an eased sweep between the Americas
 * (-75°) and East Asia (125°), so the empty Pacific never turns to the camera.
 */
export function sweepLongitude(phase) {
  return 25 + 100 * Math.sin(phase);
}

/** Shortest-path interpolation between two angles. */
export function lerpAngle(a, b, t) {
  const diff = ((((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + diff * t;
}
