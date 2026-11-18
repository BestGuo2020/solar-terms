export const OBLIQUITY = 23.44 * Math.PI / 180;
export const NORTH_AXIS = Object.freeze([0, Math.cos(OBLIQUITY), -Math.sin(OBLIQUITY)]);
export const normalizeLongitude = value => ((value%360)+360)%360;
/** Ecliptic north is +Y. λ is geocentric SUN longitude, not Earth's scene angle.
 * At λ=90° Earth is +Z, with the constant north axis tilted toward Sun (-Z). */
export function positionFromLongitude(longitude,radius=7.3) {
  const a = longitude*Math.PI/180;
  return [-radius*Math.cos(a),0,radius*Math.sin(a)];
}
export function geometryAtLongitude(longitude,distance=1) {
  return {longitude,distance,declination:Math.asin(Math.sin(OBLIQUITY)*Math.sin(longitude*Math.PI/180))*180/Math.PI,position:positionFromLongitude(longitude,7.3*distance)};
}
