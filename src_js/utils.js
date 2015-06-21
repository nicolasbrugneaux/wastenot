const first_char = /\S/;
export const capitalize = s => s.replace( first_char, m => m.toUpperCase() );
