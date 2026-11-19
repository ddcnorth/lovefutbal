/**
 * Every project on love.fútbol's public list (https://www.lovefutbol.org/projects), read in
 * November 2026: 104 pitches in 16 countries and territories. The site itself says there are
 * 128 projects in 24 countries, so this list is short of the full picture.
 *
 * Each row is [name, place]. The place is only what the site states for that project, and for
 * more than half of them it states nothing beyond the country. Often the name is the place
 * (Paraisópolis, Dharavi, Makoko). Nothing here is filled in from outside knowledge, with one
 * exception: the site files La Cava under "Other" with no country, and it is listed here with
 * the other San Isidro projects in Argentina.
 */
const LIST = {
  Argentina: [['Santa Ana', 'San Isidro'], ['Boulogne', 'San Isidro'], ['La Cava']],
  Australia: [['Mt Druitt', 'Sydney']],
  Bahamas: [
    ['Emma E. Cooper'], ['Tarpum Bay'], ['Emily G. Petty'], ['Wemyss Bight'],
    ['Tarpum Bay Primary'], ['Rock Sound Primary'], ['Green Castle Primary'], ['Deep Creek Primary'],
  ],
  Brazil: [
    ['Vila Guaíra'], ['Santo Afonso'], ['Paraisópolis'], ['Quadra da Minha Rua - Galícia'],
    ['Cruzeiro Velho', 'Distrito Federal'], ['Rio Doce'], ['Éden', 'Rio de Janeiro'],
    ['Curado IV', 'Pernambuco'], ['Córrego da Fortuna', 'Pernambuco'],
    ['Bela Vista', 'Cabo de Santo Agostinho, Pernambuco'], ['Charneca', 'Cabo de Santo Agostinho, Pernambuco'],
    ['Castainho', 'Garanhuns, Pernambuco'], ['Bom Sucesso', 'Ceará'], ['Santana', 'Santana de Parnaíba, São Paulo'],
    ['Parque Fênix'], ['Brasília Teimosa'], ['Cohab 1'], ['São Remo', 'São Paulo'],
    ['Santa Marta', 'Rio de Janeiro'], ['Cantagalo', 'Rio de Janeiro'], ['Morro dos Macacos'],
    ['Massangana', 'Cabo de Santo Agostinho, Pernambuco'], ['Cururuquara'], ['Pinhais', 'Curitiba'],
    ['Itaquera'], ['Penedo', 'Pernambuco'], ['Foz do Iguaçu'], ['Complexo do Alemão'],
    ['Cachoeira', 'Maragogi'], ['Várzea Fria'],
  ],
  Canada: [['Guildford Heights Park'], ['Harbourfront Centre', 'Toronto']],
  Colombia: [['Santa Inés', 'Medellín'], ['Bella Vista'], ['Guabal']],
  'Dominican Republic': [['Villa Hermosa', 'Juan Pablo Duarte'], ['La Piña']],
  Egypt: [['Fayoum', 'Talat']],
  Guatemala: [
    ['San Antonio Palopó'], ['Juil'], ['XeJuyú'], ['Canguacha'],
    ['Santiago Atitlán'], ['Tuitzaj'], ['Las Canoas Altas'], ['Villa Nueva'],
  ],
  India: [['Dharavi', 'Mumbai'], ['Bandepalya', 'Bangalore']],
  Mexico: [
    ['La Z'], ['Santiaguito II'], ['Teotihuacán II'], ['Iztapalapa'], ['El Molino'], ['Teotihuacán'],
    ['Cancha del Bosque'], ['Cancha del Viento', 'Estado de México'], ['La Martinica', 'Zapopan'],
    ['Cancha Indeco', 'Mexico City'], ['Cancha Legaria'], ['Milpa Alta'],
    ['Cancha Violeta', 'Xalostoc, Estado de México'], ['Axolotl'], ['San Bartolo', 'Teoloyucan, Estado de México'],
    ['Cuautlalpan', 'Estado de México'], ['Querétaro'], ['Coyotepec'], ['Korima', 'Valle de Chalco'],
    ['Ex-Factoría', 'Nanchital, Veracruz'], ['Parque Sur 23'], ['Santiaguito'], ['La Doce'],
    ['El Coyolito', 'Gustavo A. Madero, Mexico City'], ['Chimalhuacán', 'Mexico City'],
  ],
  Nigeria: [['Makoko', 'Lagos']],
  'Puerto Rico': [['YMCA San Juan']],
  Spain: [['El Sarchal', 'Ceuta']],
  Tanzania: [['Sinoni', 'Arusha']],
  'United States': [
    ['South Bronx'], ['Kirkbride'], ['SLA at Beeber'], ['Hissey Playground', 'Philadelphia, Pennsylvania'],
    ['Samuel Park', 'Philadelphia, Pennsylvania'], ['Safe-Hub', 'Philadelphia, Pennsylvania'], ['Conwell', 'Pennsylvania'],
    ['Sandtown', 'Baltimore, Maryland'], ['Cagni Park', 'North Miami, Florida'], ['Max Myers', 'Philadelphia, Pennsylvania'],
    ['Broward BCG', 'Broward County, Florida'], ['Dewey Park', 'Flint'], ['Chicago'], ['James Finnegan'],
    ['Tanner Duckrey', 'Pennsylvania'],
  ],
};

// Other names people type for a country, so a search for "Brasil" or "USA" still lands.
const ALSO = {
  Brazil: 'Brasil',
  'Dominican Republic': 'República Dominicana',
  Egypt: 'Egipto Egito',
  Mexico: 'México',
  Spain: 'España Espanha',
  'United States': 'USA US America Estados Unidos',
};

/** Lower case without accents, so "sao" finds São Remo. */
export const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const PITCHES = Object.entries(LIST)
  .flatMap(([country, rows]) => rows.map(([name, place = '']) => ({ name, place, country })))
  .map((p, id) => ({ ...p, id, hay: fold(`${p.name} ${p.place} ${p.country} ${ALSO[p.country] ?? ''}`) }));

export const COUNTRIES = Object.entries(LIST).map(([name, rows]) => ({ name, count: rows.length, hay: fold(`${name} ${ALSO[name] ?? ''}`) }));

/** "Philadelphia, Pennsylvania, United States", or just the country when the site gives no place. */
export const whereIs = (p) => [p.place, p.country].filter(Boolean).join(', ');

export const findPitch = (name, country) => PITCHES.find((p) => p.name === name && p.country === country);
