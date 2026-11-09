/** Orthogonal floor sweep. All coordinates and clearances are in mm. */
export function storeExchange(services, furniture) {
  const {cylinder, primaryBuffer, riserGross, controlsHydraulics, independentSafety} = services.plant;
  const {plantDryRoom: room, replacementDoor: door} = services.eastWaterJoin;
  const radius = cylinder.cartRadius;
  const margin = 25;
  const centredWest = cylinder.centre[0] - radius - room[0];
  const offset = Math.max(0, margin - centredWest);
  const start = [cylinder.centre[0] + offset, cylinder.centre[1]];
  const path = [start, ...cylinder.path.slice(1)];
  const legs = path.slice(1).map((b, i) => {
    const a = path[i];
    if (a[0] !== b[0] && a[1] !== b[1]) throw Error('Store exchange requires a new diagonal sweep');
    return [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
  });
  // Each centre-line segment is axis-aligned. Minimum Euclidean distance to
  // a closed fixed rectangle, minus the complete rolling radius, covers the bend.
  function reserve([x,y,w=0,h=0]) {
    return Math.min(...legs.map(([l,b,r,t]) => Math.hypot(
      Math.max(l-x-w,x-r,0), Math.max(b-y-h,y-t,0)) - radius));
  }
  const [bx,by,bw,bh] = primaryBuffer.body;
  const exitY = path.at(-1)[1];
  const [south,north] = door.finishedClearY;
  const [mx,my] = independentSafety.manifold;
  const manifoldDeltaY = Math.abs(my - start[1]);
  const firstContact = mx - Math.sqrt(radius ** 2 - manifoldDeltaY ** 2) - start[0];
  return {
    margin, radius, centredWest, offset, path,
    jacketToCartEdge: radius - offset - cylinder.body[2]/2,
    fixed: {
      westWall: start[0] - room[0] - radius, southWall: start[1] - room[1] - radius,
      riser: reserve(riserGross), controls: reserve(controlsHydraulics), radiator: reserve(furniture['service-emitter-plant-N']),
      buffer: reserve([bx+bw/2,by+bh/2])-primaryBuffer.completeDiameter/2,
      doorSouth: exitY-south-radius, doorNorth: north-exitY-radius,
    },
    retainedManifoldAxis: reserve([mx,my]), firstManifoldAxisContact: firstContact,
    tundishAxis: reserve(independentSafety.tundish.slice(0,2)),
    // Compare the top valve with the cylinder in its proposed eccentric cradle.
    maxRetainedValveRadius: radius - margin - Math.hypot(independentSafety.directTopTP[0]-start[0], independentSafety.directTopTP[1]-start[1]),
  };
}
