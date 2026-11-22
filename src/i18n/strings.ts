// English is complete. isiZulu, isiXhosa and Afrikaans are stubs for Phase 2 and fall back to English.
export const languages = { en: 'English', zu: 'isiZulu', xh: 'isiXhosa', af: 'Afrikaans' } as const;
export type Lang = keyof typeof languages;

export const strings: Record<Lang, Record<string, string>> = {
  en: {
    'nav.verify': 'How to verify',
    'nav.demo': 'Demo scan',
    'nav.brands': 'For brands',
    'nav.about': 'About',
    'nav.cta': 'Request a pilot',
    'hero.title': 'Is it genuine? Find out before you buy.',
    'hero.sub': 'Check alcohol and cigarettes in seconds. Free, no app needed.',
  },
  zu: {
    'hero.title': 'Iyiqiniso yini? Zazi ngaphambi kokuthenga.',
  },
  xh: {
    'hero.title': 'Ngaba yinyani? Yazi phambi kokuba uthenge.',
  },
  af: {
    'nav.verify': 'Hoe om te verifieer',
    'nav.demo': 'Demo-skandering',
    'nav.brands': 'Vir handelsmerke',
    'nav.about': 'Oor ons',
    'nav.cta': 'Versoek \'n loodsprojek',
    'hero.title': 'Is dit eg? Vind uit voordat jy koop.',
    'hero.sub': 'Kontroleer alkohol en sigarette in sekondes. Gratis, geen app nodig.',
  },
};
