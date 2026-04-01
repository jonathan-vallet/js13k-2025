const TRADS = [TRAD_EN, TRAD_FR];

function t(key) {
  return TRADS[currentLanguageIndex][key] || key;
}
