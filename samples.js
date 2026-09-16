/* ============================================================
   Sample reference library — line-art SVGs bundled in-app.
   Each entry: { id, name, category, svg }
   ============================================================ */

window.AR_SAMPLES = (function () {
  const wrap = (body, w = 200, h = 200) =>
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${body}</svg>`;

  return [
    // ---------- Animals ----------
    { id: 'cat', name: 'Cat', category: 'Animals', svg: wrap(`
      <path d='M60 60 L45 30 L70 55'/>
      <path d='M140 60 L155 30 L130 55'/>
      <ellipse cx='100' cy='105' rx='55' ry='50'/>
      <circle cx='82' cy='95' r='4' fill='black'/>
      <circle cx='118' cy='95' r='4' fill='black'/>
      <path d='M100 110 L95 118 L105 118 Z' fill='black'/>
      <path d='M100 118 Q90 130 80 122'/>
      <path d='M100 118 Q110 130 120 122'/>
      <path d='M70 100 L45 95 M70 105 L45 108 M70 110 L45 118'/>
      <path d='M130 100 L155 95 M130 105 L155 108 M130 110 L155 118'/>`) },

    { id: 'dog', name: 'Dog', category: 'Animals', svg: wrap(`
      <ellipse cx='100' cy='110' rx='55' ry='52'/>
      <path d='M55 75 Q40 90 50 115 Q60 120 65 110'/>
      <path d='M145 75 Q160 90 150 115 Q140 120 135 110'/>
      <circle cx='85' cy='100' r='4' fill='black'/>
      <circle cx='115' cy='100' r='4' fill='black'/>
      <ellipse cx='100' cy='125' rx='8' ry='6' fill='black'/>
      <path d='M100 131 L100 140 M100 140 Q92 145 88 140 M100 140 Q108 145 112 140'/>`) },

    { id: 'panda', name: 'Panda', category: 'Animals', svg: wrap(`
      <circle cx='100' cy='110' r='55'/>
      <ellipse cx='58' cy='70' rx='14' ry='16' fill='black'/>
      <ellipse cx='142' cy='70' rx='14' ry='16' fill='black'/>
      <ellipse cx='80' cy='105' rx='14' ry='16' fill='black'/>
      <ellipse cx='120' cy='105' rx='14' ry='16' fill='black'/>
      <circle cx='80' cy='105' r='4' fill='white'/>
      <circle cx='120' cy='105' r='4' fill='white'/>
      <ellipse cx='100' cy='128' rx='7' ry='5' fill='black'/>
      <path d='M100 133 L100 142 M100 142 Q92 148 88 142 M100 142 Q108 148 112 142'/>`) },

    { id: 'rabbit', name: 'Rabbit', category: 'Animals', svg: wrap(`
      <ellipse cx='75' cy='55' rx='12' ry='35'/>
      <ellipse cx='125' cy='55' rx='12' ry='35'/>
      <circle cx='100' cy='115' r='48'/>
      <circle cx='83' cy='105' r='4' fill='black'/>
      <circle cx='117' cy='105' r='4' fill='black'/>
      <path d='M100 118 L95 123 L105 123 Z' fill='black'/>
      <path d='M95 130 Q100 135 105 130'/>
      <path d='M75 122 L60 122 M75 127 L60 130 M125 122 L140 122 M125 127 L140 130'/>`) },

    { id: 'fox', name: 'Fox', category: 'Animals', svg: wrap(`
      <path d='M55 55 L45 90 L75 80 Z'/>
      <path d='M145 55 L155 90 L125 80 Z'/>
      <path d='M60 90 Q60 150 100 165 Q140 150 140 90 Q100 70 60 90 Z'/>
      <path d='M100 100 L80 130 L120 130 Z'/>
      <circle cx='82' cy='108' r='4' fill='black'/>
      <circle cx='118' cy='108' r='4' fill='black'/>
      <ellipse cx='100' cy='140' rx='5' ry='4' fill='black'/>`) },

    { id: 'owl', name: 'Owl', category: 'Animals', svg: wrap(`
      <path d='M100 40 L70 60 Q45 90 55 130 Q75 165 100 165 Q125 165 145 130 Q155 90 130 60 Z'/>
      <circle cx='82' cy='95' r='16'/>
      <circle cx='118' cy='95' r='16'/>
      <circle cx='82' cy='95' r='5' fill='black'/>
      <circle cx='118' cy='95' r='5' fill='black'/>
      <path d='M100 110 L92 122 L108 122 Z'/>
      <path d='M75 130 Q100 145 125 130'/>
      <path d='M75 45 L82 65 M125 45 L118 65'/>`) },

    { id: 'fish', name: 'Fish', category: 'Animals', svg: wrap(`
      <path d='M40 100 Q80 55 140 100 Q80 145 40 100 Z'/>
      <path d='M140 100 L175 70 L165 100 L175 130 Z'/>
      <circle cx='75' cy='95' r='5' fill='black'/>
      <path d='M100 80 Q110 100 100 120'/>
      <path d='M115 85 Q125 100 115 115'/>`) },

    { id: 'butterfly', name: 'Butterfly', category: 'Animals', svg: wrap(`
      <line x1='100' y1='60' x2='100' y2='150'/>
      <path d='M100 70 Q60 40 40 70 Q30 100 70 110 Q95 105 100 90'/>
      <path d='M100 70 Q140 40 160 70 Q170 100 130 110 Q105 105 100 90'/>
      <path d='M100 100 Q65 105 55 130 Q65 155 100 135'/>
      <path d='M100 100 Q135 105 145 130 Q135 155 100 135'/>
      <circle cx='60' cy='80' r='4'/>
      <circle cx='140' cy='80' r='4'/>
      <path d='M100 60 L95 50 M100 60 L105 50'/>`) },

    // ---------- Anime & faces ----------
    { id: 'anime-eye', name: 'Anime eye', category: 'Anime', svg: wrap(`
      <path d='M20 100 Q100 40 180 100 Q100 130 20 100 Z'/>
      <ellipse cx='100' cy='100' rx='32' ry='36'/>
      <circle cx='100' cy='100' r='14' fill='black'/>
      <circle cx='108' cy='92' r='5' fill='white'/>
      <path d='M25 95 L15 85 M40 80 L35 68 M60 72 L58 58 M100 60 L100 46 M140 72 L142 58 M160 80 L165 68 M175 95 L185 85'/>`) },

    { id: 'chibi-face', name: 'Chibi face', category: 'Anime', svg: wrap(`
      <path d='M50 90 Q50 40 100 40 Q150 40 150 90 Q150 145 100 165 Q50 145 50 90 Z'/>
      <path d='M55 65 Q75 40 100 45 Q125 40 145 65 Q135 55 100 55 Q65 55 55 65 Z' fill='black'/>
      <ellipse cx='78' cy='105' rx='9' ry='12' fill='black'/>
      <ellipse cx='122' cy='105' rx='9' ry='12' fill='black'/>
      <circle cx='81' cy='102' r='3' fill='white'/>
      <circle cx='125' cy='102' r='3' fill='white'/>
      <path d='M90 135 Q100 145 110 135'/>
      <circle cx='60' cy='125' r='5' fill='pink' opacity='0.5'/>
      <circle cx='140' cy='125' r='5' fill='pink' opacity='0.5'/>`) },

    { id: 'manga-face', name: 'Manga face', category: 'Anime', svg: wrap(`
      <path d='M60 85 Q60 45 100 45 Q140 45 140 85 Q140 135 115 155 L100 165 L85 155 Q60 135 60 85 Z'/>
      <path d='M60 75 Q70 40 100 40 Q130 40 140 75 Q125 60 100 62 Q75 60 60 75 Z' fill='black'/>
      <path d='M70 100 L85 100'/>
      <path d='M115 100 L130 100'/>
      <circle cx='77' cy='108' r='3' fill='black'/>
      <circle cx='123' cy='108' r='3' fill='black'/>
      <path d='M100 115 L98 130 L102 130'/>
      <path d='M90 145 L110 145'/>`) },

    // ---------- Nature ----------
    { id: 'rose', name: 'Rose', category: 'Nature', svg: wrap(`
      <circle cx='100' cy='80' r='8'/>
      <path d='M100 72 Q88 74 88 84 Q88 94 100 96'/>
      <path d='M100 72 Q112 74 112 84 Q112 94 100 96'/>
      <path d='M85 82 Q75 76 72 90 Q75 100 90 96'/>
      <path d='M115 82 Q125 76 128 90 Q125 100 110 96'/>
      <path d='M78 92 Q65 94 68 108 Q80 112 92 102'/>
      <path d='M122 92 Q135 94 132 108 Q120 112 108 102'/>
      <path d='M100 100 L100 165'/>
      <path d='M100 130 Q80 115 70 130 Q80 140 100 135'/>
      <path d='M100 145 Q120 130 130 145 Q120 155 100 150'/>`) },

    { id: 'tulip', name: 'Tulip', category: 'Nature', svg: wrap(`
      <path d='M75 75 Q75 50 100 50 Q125 50 125 75 L125 100 Q105 108 100 95 Q95 108 75 100 Z'/>
      <path d='M100 50 L100 100'/>
      <path d='M100 100 L100 175'/>
      <path d='M100 135 Q75 120 65 140'/>
      <path d='M100 150 Q125 135 135 155'/>`) },

    { id: 'sun', name: 'Sun', category: 'Nature', svg: wrap(`
      <circle cx='100' cy='100' r='40'/>
      <line x1='100' y1='25' x2='100' y2='50'/>
      <line x1='100' y1='150' x2='100' y2='175'/>
      <line x1='25' y1='100' x2='50' y2='100'/>
      <line x1='150' y1='100' x2='175' y2='100'/>
      <line x1='45' y1='45' x2='63' y2='63'/>
      <line x1='137' y1='137' x2='155' y2='155'/>
      <line x1='155' y1='45' x2='137' y2='63'/>
      <line x1='63' y1='137' x2='45' y2='155'/>
      <path d='M85 100 Q92 108 100 100 Q108 108 115 100'/>
      <circle cx='88' cy='92' r='2' fill='black'/>
      <circle cx='112' cy='92' r='2' fill='black'/>`) },

    { id: 'tree', name: 'Tree', category: 'Nature', svg: wrap(`
      <path d='M60 90 Q30 90 45 65 Q45 40 75 45 Q90 25 115 40 Q145 30 155 60 Q180 70 165 95 Q170 115 145 115 Q140 130 115 125 Q95 145 70 120 Q45 120 60 90 Z'/>
      <line x1='100' y1='125' x2='100' y2='175'/>
      <path d='M100 140 L85 155'/>
      <path d='M100 145 L115 160'/>`) },

    // ---------- Vehicles ----------
    { id: 'car', name: 'Car', category: 'Vehicles', svg: wrap(`
      <path d='M25 130 L40 100 Q45 90 55 90 L145 90 Q155 90 160 100 L175 130 L175 145 L25 145 Z'/>
      <path d='M55 90 L65 70 Q70 65 80 65 L120 65 Q130 65 135 70 L145 90'/>
      <line x1='100' y1='65' x2='100' y2='90'/>
      <circle cx='60' cy='150' r='14'/>
      <circle cx='140' cy='150' r='14'/>`) },

    { id: 'plane', name: 'Plane', category: 'Vehicles', svg: wrap(`
      <path d='M30 100 L90 90 L90 55 L100 50 L110 55 L110 90 L170 100 L110 115 L110 145 L125 155 L110 160 L100 158 L90 160 L75 155 L90 145 L90 115 Z'/>`) },

    { id: 'ship', name: 'Ship', category: 'Vehicles', svg: wrap(`
      <path d='M30 130 L170 130 L155 165 L45 165 Z'/>
      <line x1='100' y1='40' x2='100' y2='130'/>
      <path d='M100 45 L145 90 L100 90 Z'/>
      <path d='M100 95 L155 125 L100 125 Z'/>
      <path d='M20 130 L15 140'/>
      <path d='M180 130 L185 140'/>`) },

    // ---------- Objects ----------
    { id: 'house', name: 'House', category: 'Objects', svg: wrap(`
      <path d='M30 100 L100 40 L170 100'/>
      <path d='M45 90 L45 165 L155 165 L155 90'/>
      <rect x='85' y='115' width='30' height='50'/>
      <rect x='55' y='105' width='20' height='20'/>
      <rect x='125' y='105' width='20' height='20'/>
      <path d='M135 60 L135 80 L150 80 L150 70'/>`) },

    { id: 'star', name: 'Star', category: 'Objects', svg: wrap(`
      <polygon points='100,25 122,80 180,85 135,120 150,178 100,145 50,178 65,120 20,85 78,80'/>`) },

    { id: 'heart', name: 'Heart', category: 'Objects', svg: wrap(`
      <path d='M100 165 L40 105 Q20 80 40 55 Q65 35 100 70 Q135 35 160 55 Q180 80 160 105 Z'/>`) },

    { id: 'crown', name: 'Crown', category: 'Objects', svg: wrap(`
      <path d='M30 130 L45 60 L80 100 L100 40 L120 100 L155 60 L170 130 Z'/>
      <line x1='30' y1='140' x2='170' y2='140'/>
      <line x1='30' y1='150' x2='170' y2='150'/>
      <circle cx='100' cy='75' r='4' fill='black'/>
      <circle cx='55' cy='95' r='3' fill='black'/>
      <circle cx='145' cy='95' r='3' fill='black'/>`) },

    { id: 'diamond', name: 'Diamond', category: 'Objects', svg: wrap(`
      <path d='M50 70 L150 70 L170 95 L100 175 L30 95 Z'/>
      <line x1='30' y1='95' x2='170' y2='95'/>
      <line x1='50' y1='70' x2='80' y2='95'/>
      <line x1='150' y1='70' x2='120' y2='95'/>
      <line x1='80' y1='95' x2='100' y2='175'/>
      <line x1='120' y1='95' x2='100' y2='175'/>
      <line x1='80' y1='95' x2='120' y2='95'/>`) },

    { id: 'guitar', name: 'Guitar', category: 'Objects', svg: wrap(`
      <ellipse cx='110' cy='135' rx='45' ry='40'/>
      <circle cx='110' cy='135' r='12'/>
      <rect x='100' y='55' width='20' height='60'/>
      <rect x='95' y='30' width='30' height='30' rx='4'/>
      <line x1='103' y1='60' x2='103' y2='110'/>
      <line x1='110' y1='60' x2='110' y2='110'/>
      <line x1='117' y1='60' x2='117' y2='110'/>`) },
  ];
})();
