// Single source of truth for company details. Replace placeholders with the real values.
export const site = {
  name: 'True Tag',
  legalName: 'True Tag (Pty) Ltd',
  domain: 'www.truetag.co.za',
  email: 'info@truetag.co.za',
  address: '[Company address - to be inserted]',
  whatsappNumber: '27000000000', // international format, no +, placeholder
  logo: '/logo/logo.svg', // replace public/logo/logo.svg with the real logo
  tagline: 'Is it genuine? Find out before you buy.',
  mission:
    'To give every South African a free, instant way to check that what they are about to buy or drink is genuine, and to help honest brands protect their customers and their name.',
  vision:
    'A South Africa where fake alcohol and cigarettes cannot hide, and where every shopper can trust what is on the shelf.',
  founders: [
    { name: 'Sthembiso Xulu', role: 'Co-founder', bio: '[Short bio to be inserted]' },
    { name: 'Siphesihle Khoza', role: 'Co-founder', bio: '[Short bio to be inserted]' },
  ],
  figures: [
    { value: 'R100bn', label: 'lost to illicit trade in South Africa every year' },
    { value: '60%+', label: 'of cigarettes sold are estimated to be illicit' },
    { value: '21', label: 'young people died at Enyobeni Tavern' },
  ],
};

export const whatsappLink = (text = 'Hi True Tag, I would like to know more.') =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;

export type Verdict = 'genuine' | 'suspicious' | 'invalid';

export const demoCodes: Record<string, { verdict: Verdict; product: string; detail: string }> = {
  'TT-DEMO-1001': {
    verdict: 'genuine',
    product: 'Sample Reserve Lager 340ml',
    detail: 'Issued by the brand through True Tag. First scan of this code. Batch B-2026-014.',
  },
  'TT-DEMO-2002': {
    verdict: 'suspicious',
    product: 'Sample Premium Cigarettes 20s',
    detail: 'This code has been checked many times in different places, which is unusual for one pack.',
  },
  'TT-DEMO-3003': {
    verdict: 'invalid',
    product: 'Unknown product',
    detail: 'We could not find this code in the True Tag system.',
  },
};

export const verdictCopy: Record<Verdict, { title: string; text: string; advice: string }> = {
  genuine: {
    title: 'Genuine',
    text: 'This code was issued by the brand through True Tag and looks normal.',
    advice: 'Enjoy your product. Keep the pack if you want to report a problem later.',
  },
  suspicious: {
    title: 'Suspicious',
    text: 'This code is real, but it has been checked in a way that looks unusual.',
    advice:
      'Do not drink, smoke or give it to others until you are sure. Check where you bought it, compare the pack with a known genuine one, and report it to us.',
  },
  invalid: {
    title: 'Not found',
    text: 'We could not find this code. This does not prove the product is fake, but treat it with care.',
    advice:
      'Check you typed the code correctly. If it still fails, the product may not be registered with True Tag, or it may be counterfeit. Report it to us.',
  },
};
