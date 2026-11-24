// Project-native 9 x 11 pixel glyphs, dedicated to CC0-1.0.
// Run with Node to rebuild the small, dependency-free TrueType symbols font.
const fs=require('node:fs'),path=require('node:path');
const glyphs={
  '☉':['001111100','010000010','100000001','100000001','100010001','100000001','100000001','010000010','001111100','000000000','000000000'],
  '←':['000100000','001000000','010000000','100000000','111111111','100000000','010000000','001000000','000100000','000000000','000000000'],
  '↗':['001111111','000000011','000000101','000001001','000010001','000100001','001000000','010000000','100000000','000000000','000000000'],
  '⊕':['001111100','010010010','100010001','100010001','111111111','100010001','100010001','010010010','001111100','000000000','000000000'],
  '☰':['111111111','111111111','000000000','000000000','111111111','111111111','000000000','000000000','111111111','111111111','000000000'],
  '☿':['010000010','001000100','000111000','001000100','010000010','001000100','000111000','000010000','001111100','000010000','000010000'],
  '♀':['000111000','001000100','010000010','010000010','001000100','000111000','000010000','001111100','000010000','000010000','000000000'],
  '♂':['000011111','000000011','000000101','000001001','001110001','010001000','100000100','100000100','100000100','010001000','001110000'],
  '♃':['001100100','010100100','000100100','001000100','010000100','100000100','111111111','000000100','000000100','000000100','000000000'],
  '♄':['001000000','111110000','001000000','001011100','001100010','001000010','001000010','001000010','000000100','000000100','000000010'],
  '♅':['100010001','100010001','111111111','100010001','100010001','000010000','000111000','001000100','001000100','000111000','000000000'],
  '♆':['100010001','100010001','100010001','010010010','001111100','000010000','000010000','001111100','000010000','000010000','000000000'],
  '♇':['001111000','001000100','001000100','001111000','001000000','001000000','001000000','001111110','000000000','000000000','000000000'],
  '✕':['100000001','010000010','001000100','000101000','000010000','000101000','001000100','010000010','100000001','000000000','000000000'],
};
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n&65535);return b;};
const i16=n=>{const b=Buffer.alloc(2);b.writeInt16BE(n);return b;};
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n>>>0);return b;};
const pad=b=>Buffer.concat([b,Buffer.alloc((4-b.length%4)%4)]);
function shape(rows){
  const points=[],ends=[];
  rows.forEach((row,y)=>[...row].forEach((cell,x)=>{if(cell!=='1')return;
    const a=x*64,b=(10-y)*64;
    points.push([a,b],[a,b+64],[a+64,b+64],[a+64,b]);ends.push(points.length-1);
  }));
  let px=0,py=0;const dx=[],dy=[];
  for(const [x,y] of points){dx.push(i16(x-px));dy.push(i16(y-py));px=x;py=y;}
  return pad(Buffer.concat([i16(ends.length),i16(0),i16(0),i16(576),i16(704),...ends.map(u16),u16(0),Buffer.alloc(points.length,1),...dx,...dy]));
}
const entries=Object.entries(glyphs).sort((a,b)=>a[0].codePointAt(0)-b[0].codePointAt(0));
const shapes=[shape(['11111','10001','10101','10001','11111']),...entries.map(([,rows])=>shape(rows))];
const count=shapes.length,tables={};let offset=0;
tables.glyf=Buffer.concat(shapes);tables.loca=Buffer.concat([...shapes.map(g=>{const o=offset;offset+=g.length;return u32(o);}),u32(offset)]);
tables.hmtx=Buffer.concat(shapes.map(()=>Buffer.concat([u16(704),i16(0)])));
tables.head=Buffer.alloc(54);tables.head.writeUInt32BE(0x10000,0);tables.head.writeUInt32BE(0x10000,4);tables.head.writeUInt32BE(0x5f0f3cf5,12);tables.head.writeUInt16BE(3,16);tables.head.writeUInt16BE(1024,18);tables.head.writeInt16BE(576,40);tables.head.writeInt16BE(704,42);tables.head.writeUInt16BE(8,46);tables.head.writeInt16BE(2,48);tables.head.writeInt16BE(1,50);
tables.hhea=Buffer.alloc(36);tables.hhea.writeUInt32BE(0x10000,0);tables.hhea.writeInt16BE(896,4);tables.hhea.writeInt16BE(-128,6);tables.hhea.writeUInt16BE(704,10);tables.hhea.writeInt16BE(576,16);tables.hhea.writeInt16BE(1,18);tables.hhea.writeUInt16BE(count,34);
tables.maxp=Buffer.alloc(32);tables.maxp.writeUInt32BE(0x10000,0);tables.maxp.writeUInt16BE(count,4);tables.maxp.writeUInt16BE(400,6);tables.maxp.writeUInt16BE(100,8);tables.maxp.writeUInt16BE(2,14);
const codes=entries.map(([c])=>c.codePointAt(0)),segments=codes.length+1,search=2**Math.floor(Math.log2(segments));
const cmap4=Buffer.concat([u16(4),u16(16+8*segments),u16(0),u16(2*segments),u16(2*search),u16(Math.log2(search)),u16(2*segments-2*search),...codes.map(u16),u16(65535),u16(0),...codes.map(u16),u16(65535),...codes.map((c,i)=>u16(i+1-c)),u16(1),Buffer.alloc(segments*2)]);
tables.cmap=Buffer.concat([u16(0),u16(2),u16(0),u16(3),u32(20),u16(3),u16(1),u32(20),cmap4]);
const names={0:'Original project-native pixel symbols. CC0 1.0 Universal.',1:'Orbit Pixel Symbols',2:'Regular',3:'OrbitPixelSymbols-Regular-1.0',4:'Orbit Pixel Symbols Regular',5:'Version 1.0',6:'OrbitPixelSymbols-Regular',13:'CC0 1.0 Universal',14:'https://creativecommons.org/publicdomain/zero/1.0/'};
const strings=[],records=[];offset=0;
for(const [id,value]of Object.entries(names)){const b=Buffer.from(value,'utf16le');b.swap16();records.push(Buffer.concat([u16(3),u16(1),u16(0x409),u16(Number(id)),u16(b.length),u16(offset)]));strings.push(b);offset+=b.length;}
tables.name=Buffer.concat([u16(0),u16(records.length),u16(6+records.length*12),...records,...strings]);
tables.post=Buffer.alloc(32);tables.post.writeUInt32BE(0x30000,0);
tables['OS/2']=Buffer.alloc(96);const os=tables['OS/2'];os.writeUInt16BE(4,0);os.writeInt16BE(704,2);os.writeUInt16BE(400,4);os.writeUInt16BE(5,6);os.writeInt16BE(64,26);os.writeInt16BE(320,28);os.write('JG__',58);os.writeUInt16BE(64,62);os.writeUInt16BE(codes[0],64);os.writeUInt16BE(codes.at(-1),66);os.writeInt16BE(896,68);os.writeInt16BE(-128,70);os.writeUInt16BE(896,74);os.writeUInt16BE(128,76);os.writeInt16BE(512,86);os.writeInt16BE(704,88);os.writeUInt16BE(2,94);
function checksum(buffer){const b=pad(buffer);let sum=0;for(let i=0;i<b.length;i+=4)sum=(sum+b.readUInt32BE(i))>>>0;return sum;}
const tags=Object.keys(tables).sort(),num=tags.length,power=2**Math.floor(Math.log2(num));
const header=Buffer.concat([u32(0x10000),u16(num),u16(power*16),u16(Math.log2(power)),u16(num*16-power*16)]),directory=[],data=[];offset=12+num*16;let headOffset=0;
for(const tag of tags){const b=tables[tag];if(tag==='head')headOffset=offset;directory.push(Buffer.concat([Buffer.from(tag),u32(checksum(b)),u32(offset),u32(b.length)]));data.push(pad(b));offset+=pad(b).length;}
const font=Buffer.concat([header,...directory,...data]);font.writeUInt32BE((0xb1b0afba-checksum(font))>>>0,headOffset+8);
const destination=path.join(__dirname,'../assets/fonts/orbit-pixel-symbols.ttf');fs.writeFileSync(destination,font);
console.log(`Built ${entries.length} pixel symbols (${font.length} bytes): ${entries.map(([c])=>c).join(' ')}`);
