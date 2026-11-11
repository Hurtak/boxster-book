import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { group, mesh } from '../geometry.js';
import { rounded, ellipsoid, line3, patch, profile } from './surfaces.js';

// Integrated head restraints, a broad shoulder and a low cushion. The section
// remains continuous across the bolsters instead of adding tall side pillows.
const backWidth = y => profile([
  [.47,.153],[.58,.19],[.77,.205],[.84,.203],[.915,.155],
  [.95,.128],[1.065,.126],[1.105,.102],[1.125,0],
],y);
const backCentre = y => -.325-(y-.47)*.24;
const backFront = (x,y) => {
  const w=Math.max(1e-8,backWidth(y)),round=Math.sqrt(Math.max(0,1-(x/w)**2));
  const bolster=.048*Math.exp(-(((Math.abs(x)-.171)/.035)**2))
    * Math.sin(Math.PI*Math.min(1,Math.max(0,(y-.47)/.45)));
  return backCentre(y)+(.062+bolster)*round;
};

export function seat(parent,p,side,{belt=true}={}) {
  const root=group(side>0?'driver-seat':'passenger-seat',parent,[side*.345,0,0]);
  root.userData.carPart = true;
  rounded(root,[.435,.095,.47],p.tan,[0,.425,-.115],.04).name='seat-cushion';
  rounded(root,[.302,.04,.365],p.insert,[0,.471,-.09],.018).name='seat-cushion-insert';
  for(const x of [-.185,.185])ellipsoid(root,[.045,.061,.214],p.tan,[x,.476,-.12]).name=`seat-cushion-bolster-${x}`;
  patch(root,'integrated-seat-back',(u,v)=>{
    const y=.47+.655*v,a=u*Math.PI*2,x=backWidth(y)*Math.cos(a);
    const depth=(Math.sin(a)>=0?backFront(x,y)-backCentre(y):.045*Math.sin(a))*Math.min(1,backWidth(y)/.1);
    return [x,y,backCentre(y)+depth];
  },80,80,p.tan);
  const insertWidth=y=>profile([[.535,.125],[.7,.139],[.83,.135],[.91,.102]],y);
  patch(root,'contoured-seat-insert',(u,v)=>{
    const y=.535+.375*v,x=(u*2-1)*insertWidth(y);
    return [x,y,backFront(x,y)+.0015];
  },36,48,p.insert);
  for(const side of [-1,1]) {
    const seam=Array.from({length:35},(_,i)=>{
      const y=.54+i/34*.364,x=side*insertWidth(y);
      return [x,y,backFront(x,y)+.002];
    });
    line3(root,seam,.0006,p.stitch);
    line3(root,[[side*.143,.494,.07],[side*.143,.494,-.10],[side*.143,.494,-.255]],.0006,p.stitch);
  }
  for(const y of [.615,.69,.765,.84]) {
    const seam=Array.from({length:20},(_,i)=>{
      const x=(i/19*2-1)*insertWidth(y)*.97;
      return [x,y,backFront(x,y)+.002];
    });
    line3(root,seam,.0005,p.stitch);
  }
  const dots=new THREE.InstancedMesh(new THREE.SphereGeometry(.0008,4,3),
    new THREE.MeshStandardMaterial({color:'#87643d',roughness:1}),187);
  const matrix=new THREE.Matrix4();
  for(let row=0;row<17;row++)for(let col=0;col<11;col++) {
    const y=.56+row*.019,x=-.107+col*.0214;
    matrix.makeTranslation(x,y,backFront(x,y)+.002);
    dots.setMatrixAt(row*11+col,matrix);
  }
  root.add(dots);
  if (belt) {
    const restraint = group(`seat-belt-${side}`, parent, [side * .345, 0, 0]);
    restraint.userData.carPart = true;
    line3(restraint,[[side*.218,1.005,-.604],[side*.24,.79,-.42],[side*.21,.49,-.29]],.009,p.black);
    rounded(restraint,[.034,.05,.025],p.black,[-side*.238,.48,-.25],.007);
    rounded(restraint,[.025,.012,.025],new THREE.MeshStandardMaterial({color:'#8e1720'}),[-side*.238,.508,-.25],.002);
  }
  return root;
}

export const hoopOutline = [[-.192,.745],[-.181,.90],[-.151,1.033],[-.109,1.099],
  [0,1.126],[.109,1.099],[.151,1.033],[.181,.90],[.192,.745]];
export const hoopDepth = y => -.612-(y-.745)*.105;

// Flattened, slightly rearward leaning hoops closely follow the head restraints.
// The reference rear photograph has a silver rear face and tan front trim.
export function rollHoop(parent,p,side) {
  const root=group(`roll-hoop-${side}`,parent,[side*.345,0,0]);
  root.userData.carPart = true;
  const outline = hoopOutline;
  const zAt = hoopDepth;
  const path=new THREE.CatmullRomCurve3(outline.map(([x,y])=>new THREE.Vector3(x,y,zAt(y))),false,'centripetal');
  // A flattened oval section gives a smooth crown without a faceted tube.
  const band=new THREE.Shape();band.absellipse(0,0,.026,.018,0,Math.PI*2,false,0);
  const extruded=new THREE.ExtrudeGeometry(band,{steps:110,extrudePath:path,curveSegments:12,bevelEnabled:false});
  extruded.deleteAttribute('normal');extruded.deleteAttribute('uv');
  const smoothBand=mergeVertices(extruded,1e-6);smoothBand.computeVertexNormals();extruded.dispose();
  const trim=p.silver.clone();trim.name='Aluminium-look hoop trim';trim.roughness=.4;trim.metalness=.6;
  mesh(root,smoothBand,trim).name='roll-hoop-shell';
  const tanPath=path.getPoints(120).map(point=>[point.x,point.y,point.z+.016]);
  line3(root,tanPath,.008,p.tan);
  const screen=new THREE.MeshStandardMaterial({color:'#13191a',transparent:true,opacity:.3,roughness:.95,side:THREE.DoubleSide,depthWrite:false});
  const opening=new THREE.Shape();opening.moveTo(-.159,.77);opening.lineTo(-.146,.98);
  opening.bezierCurveTo(-.13,1.073,-.08,1.1,0,1.101);
  opening.bezierCurveTo(.08,1.1,.13,1.073,.146,.98);opening.lineTo(.159,.77);opening.closePath();
  const screenGeometry=new THREE.ShapeGeometry(opening,32);
  const positions=screenGeometry.attributes.position;
  for(let i=0;i<positions.count;i++)positions.setZ(i,zAt(positions.getY(i))-.008);
  screenGeometry.computeVertexNormals();mesh(root,screenGeometry,screen).name='roll-hoop-screen';
  const half=y=>profile([[.77,.158],[.98,.146],[1.055,.109],[1.09,.052],[1.101,0]],y);
  for(let i=0;i<49;i++) {
    const x=-.144+i*.006;
    let y=1.1;while(y>.78&&half(y)<Math.abs(x))y-=.002;
    line3(root,[[x,.775,zAt(.775)-.009],[x,y,zAt(y)-.009]],.00038,p.black);
  }
  for(let i=0;i<53;i++) {
    const y=.78+i*.006,w=half(y);
    line3(root,[[-w,y,zAt(y)-.009],[w,y,zAt(y)-.009]],.00038,p.black);
  }
  return root;
}
