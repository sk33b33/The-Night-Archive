import type { RegisterEntry } from '../../domain/evidence';

/**
 * Case 013: the four 1981 staff registers, authored once. The register
 * documents and the cross-reference search are both built from these rows,
 * so they cannot disagree. Only the records facility register has a Ward.
 * E. Warden and H. Edwards are deliberate near matches, never matches.
 */
const e = (name: string, post: string, from: string, to: string): RegisterEntry => ({ name, post, from, to });

export const RAILWAY_STAFF: readonly RegisterEntry[] = [
  e('R. Hale', 'Station supervisor, Bellwether', '1974', '1986'),
  e('D. Okafor', 'Porter, Bellwether', '1978', '1984'),
  e('T. Brennan', 'Signalman, Bellwether', '1969', '1983'),
  e('S. Marsh', 'Booking clerk, Bellwether', '1977', '1985'),
  e('L. Price', 'Porter, Bellwether (days)', '1980', '1982'),
  e('E. Warden', 'Signalman, Harlow Junction', '1971', '1989'),
  e('P. Oyelaran', 'Station supervisor, Harlow Junction', '1976', '1988'),
  e('G. Lund', 'Porter, Harlow Junction', '1979', '1981'),
  e('A. Fenwick', 'Booking clerk, Harlow Junction', '1975', '1990'),
  e('K. Doyle', 'Station supervisor, Calder Road', '1972', '1984'),
  e('M. Ashby', 'Porter, Calder Road', '1981', '1983'),
  e('F. Quill', 'Signalman, Calder Road', '1968', '1982'),
  e('B. Sutton', 'Booking clerk, Calder Road', '1979', '1986'),
  e('J. Rees', 'Station supervisor, Millbrook', '1970', '1983'),
  e('N. Kaur', 'Porter, Millbrook', '1980', '1987'),
  e('O. Hart', 'Signalman, Millbrook', '1973', '1985'),
  e('C. Ibbotson', 'Booking clerk, Millbrook', '1978', '1981'),
  e('W. Gale', 'Station supervisor, Eastleigh Halt', '1975', '1982'),
  e('V. Moss', 'Porter, Eastleigh Halt', '1977', '1983'),
  e('I. Carr', 'Signalman, Eastleigh Halt', '1966', '1981'),
  e('Y. Bello', 'Station supervisor, Thornby', '1979', '1991'),
  e('R. Pike', 'Porter, Thornby', '1980', '1984'),
  e('D. Hollis', 'Signalman, Thornby', '1972', '1986'),
  e('U. Lam', 'Booking clerk, Thornby', '1981', '1985'),
  e('H. Strand', 'District engineer', '1977', '1987'),
  e('T. Noakes', 'Lineman, district', '1974', '1982'),
  e('A. Okonjo', 'Lineman, district', '1980', '1988'),
  e('P. Vance', 'Relief porter, district', '1981', '1982'),
];

export const FACILITY_STAFF: readonly RegisterEntry[] = [
  e('M. —', 'Night archivist', '1979', '1983 — tonight'),
  e('A. Pryce', 'Day archivist', '1974', '1986'),
  e('C. Moran', 'Senior archivist', '1968', '1984'),
  e('S. Lyle', 'Courier', '1978', '1985'),
  e('E. Ward', 'Courier', 'Mar 1980', '31 Oct 1981'),
  e('F. Odum', 'Clerk, intake', '1979', '1982'),
  e('L. Garvey', 'Clerk, intake', '1981', '1988'),
  e('B. Haldane', 'Estates officer', '1975', '1990'),
  e('N. Ferris', 'Porter', '1980', '1986'),
];

export const EXCHANGE_STAFF: readonly RegisterEntry[] = [
  e('J. Abbott', 'Supervisor, night', '1972', '1983'),
  e('K. Ellery', 'Operator', '1979', '1983'),
  e('M. Fox', 'Operator', '1978', '1982'),
  e('R. Dunne', 'Operator', '1980', '1983'),
  e('P. Shah', 'Operator', '1981', '1983'),
  e('E. Corr', 'Operator', '1977', '1981'),
  e('T. Vale', 'Engineer, routes', '1970', '1983'),
  e('S. Boyce', 'Engineer, routes', '1976', '1983'),
  e('G. Hume', 'Clerk, records', '1974', '1983'),
  e('A. Lowe', 'Operator', '1980', '1983'),
  e('D. Iqbal', 'Operator', '1979', '1983'),
  e('W. Prentice', 'Supervisor, day', '1969', '1983'),
];

export const POLICE_STAFF: readonly RegisterEntry[] = [
  e('Insp. G. Royle', 'Inspector', '1975', '1988'),
  e('Sgt. A. Kemp', 'Sergeant', '1978', '1986'),
  e('Sgt. L. Osei', 'Sergeant', '1980', '1990'),
  e('PC H. Edwards', 'Constable', '1977', '1985'),
  e('PC J. Tate', 'Constable', '1979', '1984'),
  e('PC R. Mendes', 'Constable', '1981', '1989'),
  e('PC S. Clay', 'Constable', '1976', '1983'),
  e('PC D. Rowe', 'Constable', '1980', '1987'),
  e('PC M. Harker', 'Constable', '1974', '1982'),
  e('PC F. Dimitriou', 'Constable', '1981', '1986'),
  e('PC K. Lyons', 'Constable', '1978', '1985'),
  e('PC T. Ashe', 'Constable', '1979', '1983'),
  e('WPC E. Moore', 'Constable', '1980', '1988'),
  e('Clerk B. Ince', 'Station clerk', '1973', '1984'),
];
