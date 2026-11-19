/**
 * The love.fútbol spaces whose location is published: 125 in 20 countries and territories.
 * (The organisation's own headline is 128 projects in 24 countries.)
 *
 * Each row is [name, place, picture, project number]. The picture is the file name of the
 * project's image on lovefutbol.org, or 0 where it has none. The number is 0 where the
 * project has no number. Names, places and numbers are as supplied for the love.fútbol map.
 */
const LIST = {
  BR: ['Brazil', [
    ['Várzea Fria', 'Capibaribe, São Lourenço da Mata, Pernambuco', 'varzea fria', 9],
    ['Cachoeira', 'Maragogi, Alagoas', 'cachoeira', 11],
    ['Complexo do Alemão', 'Ramos, Rio de Janeiro, Rio de Janeiro', 'complexo do alemão', 12],
    ['Foz do Iguaçu', 'Jardim Jupira, Foz do Iguaçu, Paraná', 'foz do iguaçu', 13],
    ['Penedo de Cima', 'Penedo, São Lourenço da Mata, Pernambuco', 'penedo', 14],
    ['Itaquera', 'Itaquera, São Paulo, São Paulo', 'itaquera', 15],
    ['Pinhais, Curitiba', 'Centro, Pinhais, Paraná', 'pinhais', 16],
    ['Cururuquara', 'Jardim Parnaíba, Santana de Parnaíba, São Paulo', 'cururuquara', 17],
    ['Massangana', 'Centro, Cabo de Santo Agostinho, Pernambuco', 'massangana', 18],
    ['Pirituba', 'Piqueri, São Paulo, São Paulo', 0, 19],
    ['Maria Helena', 'Engenho Novo, Rio de Janeiro, Rio de Janeiro', 0, 20],
    ['Morro Dos Macacos', 'Vila Isabel, Rio de Janeiro, Rio de Janeiro', 'morro dos macacos', 21],
    ['Santa Marta', 'Ipanema, Rio de Janeiro, Rio de Janeiro', 'santa marta', 24],
    ['Cantagalo', 'Copacabana, Rio de Janeiro, Rio de Janeiro', 'cantagalo', 25],
    ['São Remo', 'Caxingui, São Paulo, São Paulo', 'são remo', 27],
    ['Cohab 1', 'Rua Rosa Branca, Garanhuns, Pernambuco', 'cohab 1', 32],
    ['Rio Doce', 'Bultrins, Olinda, Pernambuco', 'rio doce', 34],
    ['Brasília Teimosa', 'Pina, Recife, Pernambuco', 'brasilia teimosa', 35],
    ['Parque Fenix', 'Boa Vista, Garanhuns, Pernambuco', 'parque fenix', 44],
    ['Bom Sucesso', 'Quixeré, Ceará', 'bom sucesso', 52],
    ['Santana de Parnaíba', 'Jardim Parnaíba, Santana de Parnaíba, São Paulo', 'santana', 53],
    ['Quilombo Castainho', 'Magano, Garanhuns, Pernambuco', 'castainho', 55],
    ['Charneca', 'Cohab, Cabo de Santo Agostinho, Pernambuco', 'charneca', 58],
    ['Bela Vista', 'São Francisco, Cabo de Santo Agostinho, Pernambuco', 'bela vista', 61],
    ['Córrego da Fortuna', 'Marcos Freire, Jaboatão dos Guararapes, Pernambuco', 'corrego da fortuna', 62],
    ['Curado IV', 'Muribequinha, Jaboatão dos Guararapes, Pernambuco', 'curado iv', 64],
    ['Éden', 'Guaratiba, Rio de Janeiro, Rio de Janeiro', 'éden', 72],
    ['Cruzeiro Velho', 'SCIA, Federal District', 'cruzeiro velho', 80],
    ['Sancho', 'Ipsep, Recife, Pernambuco', 0, 82],
    ['Quadra da Minha Rua - Galícia', 'Brotas, Salvador, Bahia', 'Quadra da Minha Rua - Galícia', 92],
    ['Paraisópolis', 'Paraisópolis, São Paulo, São Paulo', 'Paraisópolis', 95],
    ['Vila Guaíra', 'Setor Sul, Goiânia, Goiás', 'Vila Guaíra', 97],
    ['Passagem do Juazeiro', 'Tirol, Natal, Rio Grande do Norte', 0, 101],
    ['São Benedito', 'Centro, Cajamar, São Paulo', 0, 102],
    ['Santo Afonso', 'Centro, Betim, Minas Gerais', 'Santo Afonso', 113],
    ['Waraotuma a Tuaranoko', 'Centro, Boa Vista, Roraima', 0, 118],
  ]],
  MX: ['Mexico', [
    ['Chimalhuacán', 'Chimalhuacán, State of Mexico', 'Chimalhuacán', 23],
    ['La Doce', 'El Pino, Los Reyes Acaquilpan, State of Mexico', 'La Doce', 31],
    ['Parque Sur 23', 'State of Mexico', 'Parque sur 23', 37],
    ['Korima', 'State of Mexico', 'KORIMA', 49],
    ['Coyotepec', 'Coyotepec, State of Mexico', 'Coyotepec', 54],
    ['Cancha del Rio', 'Tlaltecahuacán, Chiautla, State of Mexico', 'Cuautlalpan', 65],
    ['San Bartolo', 'State of Mexico', 'san bartolo', 69],
    ['Cancha Violeta', 'Fraccionamiento Las Américas, Ecatepec de Morelos, State of Mexico', 'cancha violeta', 71],
    ['Cancha del Viento', 'Santa María Tulpetlac, Ecatepec de Morelos, State of Mexico', 'cancha del viento', 98],
    ['Cancha del Bosque', 'Santa María Tulpetlac, Ecatepec de Morelos, State of Mexico', 'CANCHA DEL BOSQUE', 103],
    ['Teotihuacán', 'San Sebastián Xolalpa, Teotihuacán, State of Mexico', 'TEOTIHUACÁN', 104],
    ['Santiaguito II', 'San Luis Tlaxialtemalco, Mexico City', 'Santiaguito II', 124],
    ['Teotihuacán II', 'San Sebastián Xolalpa, Teotihuacán, State of Mexico', 'Teotihuacán II', 125],
    ['Cancha El huracan', 'Dajiedhi, Actopan, Hidalgo', 0, 126],
    ['El Molino', 'Chimalhuacán, State of Mexico', 'El Molino', 127],
    ['Iztapalapa', 'Mexico City', 'Iztapalapa', 128],
    ['Cancha Indeco', 'San Juan de Aragón, Mexico City', 'indeco', 0],
    ['Cancha Legaria', 'Nuevo Polanco, Mexico City', 'cancha legaria', 0],
    ['El Coyolito', 'Santiago Atzacoalco, Mexico City', 'El Coyolito', 0],
    ['La Martinica', 'Nuevo México, Jalisco', 'la martinica', 0],
    ['La Z', 'Zapopan, Jalisco', 'La Z', 0],
    ['Milpa Alta', 'San Lorenzo Tlacoyucan, Milpa Alta, Mexico City', 'milpa alta', 0],
    ['Parque Ex-Factoría Nanchital', 'El Pollo de Oro, Nanchital, Veracruz', 'Ex-Factoría', 0],
    ['Proyecto Axolotl Sports', 'San Lorenzo Atemoaya, Mexico City', 'axolotl', 0],
    ['Querétaro', 'Centro, Querétaro', 'Queretaro', 0],
    ['Santiaguito', 'Valle de Chalco Solidaridad, State of Mexico', 'santiaguito', 0],
  ]],
  US: ['United States', [
    ['James Finnegan', 'Center City, Philadelphia, Pennsylvania', 'james finnegan', 42],
    ['Tanner Duckrey', 'North Philadelphia, Philadelphia, Pennsylvania', 'Tanner duckrey', 43],
    ['Chicago', 'South Shore, Chicago, Illinois', 'CHICAGO', 56],
    ['Dewey Park', 'Flint, Michigan', 'DEWEY PARK', 59],
    ['Broward County Boys and Girls Club', 'Florida', 'broward bcg', 63],
    ['Cagni Park', 'Shady Oaks Trailer Park, North Miami, Florida', 'Cagni park', 66],
    ['Max Myers', 'North Philadelphia, Philadelphia, Pennsylvania', 'Max myers', 67],
    ['Samuel Park', 'Center City, Philadelphia, Pennsylvania', 'Samuel park', 68],
    ['Sandtown', 'Sowebo, Baltimore, Maryland', 'Sandtown', 70],
    ['Treadwell Park', 'Lauderdale Courts, Memphis, Tennessee', 0, 76],
    ['Sugaw Creek Park', 'University City, Charlotte, North Carolina', 0, 79],
    ['Conwell', 'North Philadelphia, Philadelphia, Pennsylvania', 'Conwell', 81],
    ['Castleberry Hill', 'Bankhead, Atlanta, Georgia', 0, 83],
    ['Safe-Hub', 'Center City, Philadelphia, Pennsylvania', 'SAFE-HUB', 91],
    ['Hissey Playground', 'North Philadelphia, Philadelphia, Pennsylvania', 'HISSEY PLAYGROUND', 100],
    ['SLA at Beeber', 'West Philadelphia, Philadelphia, Pennsylvania', 'SLA AT BEEBER', 105],
    ['Kirkbride', 'Center City, Philadelphia, Pennsylvania', 'Kirkbride', 106],
    ['South Bronx', 'The Bronx, New York', 'South Bronx', 111],
    ['Penrose Elementary', 'South Philadelphia, Philadelphia, Pennsylvania', 0, 115],
    ['7th & Penn', 'Center City, Philadelphia, Pennsylvania', 0, 117],
    ['St James School', 'Center City, Philadelphia, Pennsylvania', 0, 119],
    ['MacClure School', 'North Philadelphia, Philadelphia, Pennsylvania', 0, 120],
  ]],
  GT: ['Guatemala', [
    ['Villa Nueva', 'El Conacaste, Nuevo Progreso, San Marcos', 'VILLA NUEVA', 1],
    ['Las Canoas Altas', 'San Jorge La Laguna, Sololá', 'Las Canoas Altas', 2],
    ['Santiago Atitlán', 'San Chichan, Santiago Atitlán, Sololá', 'Santiago Atitlán', 3],
    ['Tuitzaj', 'Senahú, Alta Verapaz', 'Tuitzaj', 4],
    ['Canguacha', 'Santa Lucia Ixcamal, San Marcos', 'Canguacha', 5],
    ['XeJuyú', 'Las Violetas, Santa María Nebaj, Quiché', 'XeJuyú', 6],
    ['Juil', 'Santa Cruz La Laguna, Sololá', 'Juil', 7],
    ['San Antonio Palopó', 'Agua Escondida, San Antonio Palopó, Sololá', 'San Antonio Palopó', 8],
    ['Cantzela', 'Yalaj, Huehuetenango', 0, 10],
  ]],
  BS: ['Bahamas', [
    ['Wemyss Bight', 'South Eleuthera', 'Wemyss Bight', 84],
    ['Green Castle Primary', 'North Eleuthera', 'Green Castle Primary', 85],
    ['PA Gibson', 'Hatchet Bay, Central Eleuthera', 0, 86],
    ['Deep Creek Primary', 'South Eleuthera', 'Deep Creek Primary', 87],
    ['Tarpum Bay Primary', 'South Eleuthera', 'Tarpum Bay Primary', 88],
    ['Rock Sound Primary', 'Tarpum Head, South Eleuthera', 'Rock Sound Primary', 89],
    ['Tarpum Bay Softball Space', 'South Eleuthera', 'Tarpum Bay', 108],
    ['Emily G. Petty Primary School', "Cupid's Cay, Central Eleuthera", 'Emily G. Petty', 109],
    ['Emma E. Cooper School Playground', 'North Palmetto Point, Central Eleuthera', 'Emma E. Cooper', 110],
  ]],
  AR: ['Argentina', [
    ['La Cava', 'Lomas de San Isidro, San Isidro, Buenos Aires', 'la cava', 22],
    ['Santa Rita', 'Buenos Aires', 0, 50],
    ['Santa Ana', 'Lomas de San Isidro, San Isidro, Buenos Aires', 'Santa Ana', 96],
    ['Boulogne', 'Santa Rita, Boulogne Sur Mer, Buenos Aires', 'BOULOGNE', 0],
  ]],
  CO: ['Colombia', [
    ['Guabal', 'Localidad Puente Aranda, Bogota, Capital District', 'GUABAL', 30],
    ['Bella Vista', 'Comuna San Humberto, Soacha ciudad, Cundinamarca', 'bella vista', 38],
    ['Santa Inés', 'Comuna 15 - Guayabal, Medellín, Antioquia', 'Santa inés', 90],
  ]],
  CA: ['Canada', [
    ['Harbourfront Centre', 'Downtown, Toronto, Ontario', 'harbourfront centre', 112],
    ['Guildford Heights Park', 'Newton, Surrey, British Columbia', 'Guildford Heights Park', 114],
  ]],
  DO: ['Dominican Republic', [
    ['Villa Hermosa', 'La Romana', 'villa hermosa', 45],
    ['La Piña', 'Zona Colonial, Santo Domingo, Distrito Nacional', 'la pina', 47],
  ]],
  IN: ['India', [
    ['Bandepalya', 'Kanakanapalya, Bengaluru, Karnataka', 'Bandepalya', 29],
    ['Dharavi', 'G/N Ward, Maharashtra', 'DHARAVI', 39],
  ]],
  AU: ['Australia', [['Mt Druitt', 'Mount Druitt, New South Wales', 'mt druitt', 36]]],
  EG: ['Egypt', [['Fayoum', 'Second Darb Al Tabakhin, Faiyum', 'fayoum', 26]]],
  ES: ['Spain', [['El Sarchal', 'Manzanera - Otero, Ceuta', 'EL SARCHAL', 107]]],
  HK: ['Hong Kong', [['Wah Sum', 'Tsuen Wan District', 0, 77]]],
  ID: ['Indonesia', [['Tanah Baru', 'Pademangan, North Jakarta', 0, 78]]],
  MY: ['Malaysia', [['Kuala Ampang', 'Kampung Pandan Dalam, Ampang Jaya Municipal Council, Selangor', 0, 75]]],
  NG: ['Nigeria', [['Makoko', 'Lagos Mainland, Lagos State', 'makoko', 48]]],
  PH: ['Philippines', [['Legacy of Light Village', 'Intramuros, Manila', 0, 73]]],
  PR: ['Puerto Rico', [['YMCA San Juan', 'Viejo San Juan, San Juan', 'YMCA San Juan', 52]]],
  TZ: ['Tanzania', [['Sinoni', 'Unga L.T.D, Arusha', 'SINONI', 46]]],
};

// Other names people type for a country, so a search for "Brasil" or "USA" still lands.
const ALSO = {
  BR: 'Brasil',
  DO: 'República Dominicana Dominican Rep',
  EG: 'Egipto Egito',
  MX: 'México',
  ES: 'España Espanha',
  US: 'USA US America Estados Unidos United States of America',
};

/** Lower case without accents, so "sao" finds São Remo. */
export const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** The flag for a two-letter country code, as the emoji the visitor's own device draws. */
const flagOf = (code) => String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
const pictureOf = (file) => (file ? `https://www.lovefutbol.org/hs-fs/hubfs/${encodeURIComponent(file)}.png?width=240` : null);

export const PITCHES = Object.entries(LIST)
  .flatMap(([code, [country, rows]]) => rows.map(([name, place, file, num]) => ({ name, place, country, code, img: pictureOf(file), num })))
  .map((p, id) => ({ ...p, id, hay: fold(`${p.name} ${p.place} ${p.country} ${ALSO[p.code] ?? ''}`) }));

// Countries with the most spaces first, as LIST is written.
export const COUNTRIES = Object.entries(LIST).map(([code, [name, rows]]) => ({ code, name, count: rows.length, flag: flagOf(code) }));

/** "Pina, Recife, Pernambuco, Brazil". */
export const whereIs = (p) => [p.place, p.country].filter(Boolean).join(', ');

export const findPitch = (name, country) => PITCHES.find((p) => p.name === name && p.country === country);
