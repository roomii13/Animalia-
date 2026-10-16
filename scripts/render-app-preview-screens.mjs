import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const outputDir = resolve('screenshots');
const logo = (await readFile(resolve('mobile/assets/animalia-icon.png'))).toString('base64');
const logoData = `data:image/png;base64,${logo}`;
const green = '#31563a';
const muted = '#718075';
const paper = '#f8f5ef';
const border = '#e0e7dc';
const orange = '#f2a128';

function text(x, y, value, size = 28, color = green, weight = 500, extra = '') {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${value}</text>`;
}

function roundRect(x, y, width, height, radius = 28, fill = '#fff', stroke = 'none') {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
}

function base(title, subtitle, body, tab = 'Inicio') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <rect width="1080" height="1920" fill="#e8eee4"/>
    ${roundRect(35, 35, 1010, 1850, 60, '#17241a')}
    ${roundRect(53, 53, 974, 1814, 45, paper)}
    <rect x="440" y="70" width="200" height="22" rx="11" fill="#17241a"/>
    ${text(100, 152, '9:41', 22, '#26392c', 700)}
    ${text(836, 152, '●  ●  ▰', 18, '#26392c', 700)}
    <image href="${logoData}" x="96" y="190" width="72" height="72"/>
    ${text(184, 224, 'Animalia', 34, green, 800)}
    ${text(184, 253, 'COMUNIDAD QUE CUIDA', 16, '#9b6c3d', 700, 'letter-spacing="2"')}
    ${text(930, 237, '＋', 48, green, 400, 'text-anchor="middle"')}
    ${title}
    ${subtitle}
    ${body}
    ${roundRect(78, 1690, 924, 116, 34, '#fff', border)}
    ${['Inicio', 'Explorar', 'Guardados', 'Mensajes', 'Perfil'].map((item, index) => {
      const x = 170 + index * 185;
      const active = item === tab;
      const icon = ['⌂', '⌕', '♡', '▤', '◉'][index];
      return `<g>${text(x, 1747, icon, 34, active ? green : muted, 700, 'text-anchor="middle"')}${text(x, 1784, item, 16, active ? green : muted, active ? 700 : 500, 'text-anchor="middle"')}</g>`;
    }).join('')}
    ${text(540, 1835, 'VISTA DE PRESENTACIÓN · CONTENIDO ILUSTRATIVO', 14, muted, 700, 'text-anchor="middle" letter-spacing="1"')}
    </svg>`;
}

const screens = [
  {
    file: 'animalia-inicio.png',
    svg: base(
      `${roundRect(78, 290, 924, 270, 30, green)}${text(96, 345, 'BIENESTAR ANIMAL EN COMUNIDAD', 17, '#efc98f', 800, 'letter-spacing="2"')}` +
      text(96, 389, 'Cuidar también es', 46, '#fffaf2', 800) + text(96, 444, 'encontrarnos.', 46, '#fffaf2', 800) +
      text(96, 493, 'Adopciones, rescates y personas', 24, '#e3ecdf') + text(96, 527, 'que se unen para ayudar.', 24, '#e3ecdf'),
      '',
      `${roundRect(78, 590, 924, 95, 26, orange)}${text(122, 648, '♥', 32, '#fff', 800)}${text(176, 650, 'Campaña: cementerio de mascotas', 24, '#3b4029', 800)}${text(944, 651, '→', 26, '#3b4029', 800, 'text-anchor="end"')}
      ${text(90, 756, 'Comunidad Animalia', 18, '#9b6c3d', 800, 'letter-spacing="2"')}${text(90, 802, 'Lo que está pasando', 38, green, 800)}${text(90, 842, 'Elegí un tema para explorar los avisos.', 21, muted)}
      ${['Todo', 'Adopciones', 'Perdidos', 'Rescates'].map((label, i) => `${roundRect(82 + i * 218, 874, i === 0 ? 125 : 205, 58, 29, i === 0 ? green : '#fff', border)}${text(184 + i * 218, 912, label, 17, i === 0 ? '#fff' : muted, 700, 'text-anchor="middle"')}`).join('')}
      ${roundRect(78, 956, 924, 480, 30, '#fff', border)}${roundRect(105, 982, 870, 190, 24, '#f7eadb')}${text(540, 1107, '🐕', 96, green, 500, 'text-anchor="middle"')}
      ${text(110, 1212, 'ADOPCIÓN RESPONSABLE', 16, '#9b6c3d', 800, 'letter-spacing="2"')}${text(110, 1262, 'Luna busca una familia', 30, green, 800)}${text(110, 1305, 'Una perrita tranquila espera conocer', 20, muted)}${text(110, 1337, 'a una familia comprometida.', 20, muted)}${text(110, 1392, 'Perra · adulta     ·     La Pampa', 18, muted, 700)}
      ${roundRect(78, 1460, 924, 156, 28, '#e8efe3')}${text(110, 1515, '¿Querés ayudar?', 26, green, 800)}${text(110, 1553, 'Compartí un rescate, un animal perdido', 19, muted)}${text(110, 1584, 'o una iniciativa de tu comunidad.', 19, muted)}`,
      'Inicio',
    ),
  },
  {
    file: 'animalia-explorar.png',
    svg: base(
      text(90, 335, 'DESCUBRIR', 17, '#9b6c3d', 800, 'letter-spacing="2"') + text(90, 390, 'Explorar avisos', 43, green, 800) +
      text(90, 430, 'Filtrá por tema y encontrá formas', 22, muted) + text(90, 461, 'de ayudar cerca tuyo.', 22, muted),
      '',
      `${['Todo', 'Adopciones', 'Perdidos', 'Rescates'].map((label, i) => `${roundRect(82 + i * 218, 500, i === 0 ? 125 : 205, 58, 29, i === 0 ? green : '#fff', border)}${text(184 + i * 218, 538, label, 17, i === 0 ? '#fff' : muted, 700, 'text-anchor="middle"')}`).join('')}
      ${text(90, 625, 'Avisos de la comunidad', 26, green, 800)}${text(980, 625, '3 resultados', 17, muted, 600, 'text-anchor="end"')}
      ${roundRect(78, 658, 924, 344, 30, '#fff', border)}${roundRect(105, 685, 142, 142, 25, '#f7eadb')}${text(176, 779, '🐕', 65, green, 500, 'text-anchor="middle"')}${text(278, 710, 'ADOPCIÓN RESPONSABLE', 15, '#9b6c3d', 800, 'letter-spacing="1"')}${text(278, 756, 'Luna busca una familia', 25, green, 800)}${text(278, 796, 'Una perrita tranquila que espera', 18, muted)}${text(278, 826, 'un hogar con mucho amor.', 18, muted)}${text(108, 885, 'Perra · adulta', 17, muted, 700)}${text(108, 932, '⌖  Localidad por confirmar', 17, muted, 600)}${roundRect(817, 902, 146, 56, 25, '#e8efe3')}${text(890, 938, 'Ver aviso', 17, green, 800, 'text-anchor="middle"')}
      ${roundRect(78, 1022, 924, 344, 30, '#fff', border)}${roundRect(105, 1049, 142, 142, 25, '#e9efe4')}${text(176, 1144, '🐈', 65, green, 500, 'text-anchor="middle"')}${text(278, 1074, 'PEDIDO DE COLABORACIÓN', 15, '#9b6c3d', 800, 'letter-spacing="1"')}${text(278, 1120, 'Acompañemos este', 25, green, 800)}${text(278, 1153, 'rescate', 25, green, 800)}${text(108, 1249, 'Un espacio para sumar voluntariado', 18, muted)}${text(108, 1281, 'y elementos de cuidado.', 18, muted)}${text(108, 1331, 'Zona por confirmar · Aviso ilustrativo', 16, muted, 600)}
      ${roundRect(78, 1387, 924, 208, 28, '#fff7e9')}${text(110, 1445, 'Una comunidad más cerca', 25, green, 800)}${text(110, 1484, 'Encontrá avisos de adopción, rescate y', 19, muted)}${text(110, 1516, 'animales perdidos en La Pampa.', 19, muted)}${roundRect(110, 1540, 235, 40, 20, '#f2a128')}${text(227, 1567, 'Explorar avisos', 16, green, 800, 'text-anchor="middle"')}`,
      'Explorar',
    ),
  },
  {
    file: 'animalia-aportes.png',
    svg: base(
      text(90, 335, 'APORTES SOLIDARIOS', 17, '#9b6c3d', 800, 'letter-spacing="2"') + text(90, 390, 'Elegí qué iniciativa', 40, green, 800) +
      text(90, 438, 'apoyar', 40, green, 800) + text(90, 482, 'Cada persona elige libremente cuánto', 21, muted) + text(90, 513, 'quiere aportar.', 21, muted),
      '',
      `${roundRect(78, 562, 924, 198, 28, '#fff', green)}${text(116, 614, '♥', 30, orange, 800)}${text(166, 616, 'Aportes generales a Animalia', 25, green, 800)}${text(116, 660, 'Para sostener iniciativas de bienestar', 19, muted)}${text(116, 690, 'y protección animal en comunidad.', 19, muted)}${roundRect(923, 600, 34, 34, 17, green)}${text(940, 624, '✓', 21, '#fff', 800, 'text-anchor="middle"')}
      ${roundRect(78, 781, 924, 240, 28, '#fff', border)}${text(116, 837, '🐾', 30, orange, 700)}${text(166, 839, 'Terreno para el cementerio', 24, green, 800)}${text(166, 873, 'de mascotas', 24, green, 800)}${text(116, 925, 'Campaña para reunir fondos para comprar', 19, muted)}${text(116, 955, 'el terreno de este proyecto comunitario.', 19, muted)}${roundRect(923, 817, 34, 34, 17, '#fff', border)}
      ${roundRect(78, 1042, 924, 256, 28, '#fff', border)}${text(116, 1100, 'Tu aporte en pesos argentinos', 22, green, 800)}${roundRect(110, 1122, 860, 72, 16, paper, border)}${text(146, 1171, '$', 30, green, 800)}${text(195, 1171, 'Escribí el importe que quieras', 18, muted)}${text(116, 1234, 'Sin un monto predefinido por Animalia.', 17, muted)}
      ${roundRect(78, 1320, 924, 102, 25, green)}${text(540, 1385, 'Continuar con Mercado Pago   →', 22, '#fff', 800, 'text-anchor="middle"')}
      ${roundRect(78, 1445, 924, 166, 27, '#fff7e9')}${text(112, 1501, 'Aporte informado y transparente', 24, green, 800)}${text(112, 1541, 'El pago se procesa en Mercado Pago.', 19, muted)}${text(112, 1572, 'La app no guarda datos de tarjetas.', 19, muted)}`,
      'Perfil',
    ),
  },
];

await mkdir(outputDir, { recursive: true });
for (const screen of screens) {
  const svg = Buffer.from(screen.svg);
  const png = await sharp(svg).png().toBuffer();
  await writeFile(resolve(outputDir, screen.file), png);
  console.log(`Captura de presentación lista: screenshots/${screen.file}`);
}
