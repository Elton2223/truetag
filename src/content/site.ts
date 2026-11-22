// Single source of truth for company details. Replace placeholders with the real values.
export const site = {
  name: 'True Tag',
  legalName: 'True Tag (Pty) Ltd',
  domain: 'www.truetag.co.za',
  email: 'info@truetag.co.za',
  address: '81 Ribbon Road, Newlands East, Durban 4037',
  city: 'Durban, South Africa',
  whatsappNumber: '', // business WhatsApp in international format, no +, e.g. 27XXXXXXXXX. Empty = buttons fall back to email.
  logo: '/logo/truetag-mark.svg',
  logoFull: '/logo/truetag-full.svg',
  tagline: 'Is it genuine? Find out before you buy.',
  aboutHeadline: "Proving what's genuine, before the sale.",
  description:
    'True Tag is an independent product authentication company based in Durban, South Africa. Every product carries a unique, scan-limited code that shoppers can check for free before they buy, by QR scan, WhatsApp, SMS or the web. Brands get reports on scans, suspicious activity and consumer reports of suspected fakes. We serve liquor, beverage and tobacco brands.',
  story:
    'Illicit goods cost South Africa about R100 billion a year, according to SARS. More than 60% of cigarettes sold are illegal, and counterfeit alcohol has killed. Shoppers cannot tell a fake from the real thing, and honest brands cannot see where fakes enter the market. True Tag gives both sides certainty.',
  mission:
    'To protect consumers and honest brands by making the authenticity of every product instantly verifiable, by anyone, on any phone, before they buy.',
  vision:
    'A South Africa, and in time a wider Africa, where counterfeit and illicit goods have nowhere to hide, because trust in what you buy can be proven with a single scan.',
  differentiators: [
    'We are independent of the industries we protect.',
    'We reward shoppers after they verify (scan-to-engage).',
    'No app is needed: shoppers can verify by WhatsApp or SMS.',
    'We are built to work with the planned SARS and National Consumer Commission track-and-trace system.',
  ],
  founders: [
    {
      name: 'Sthembiso Xulu',
      role: 'Co-Founder and CEO',
      bio: "Sthembiso is a self-taught interior designer with more than 10 years of experience in the industry, who runs his own company, MATT Closet. That experience of working with clients and delivering projects underpins his role leading True Tag's brand partnerships and fundraising. He is driven by a personal commitment to fighting South Africa's illicit goods trade and protecting the health of his fellow citizens.",
    },
    {
      name: 'Siphesihle Khoza',
      role: 'Co-Founder and Managing Director',
      bio: "Siphesihle is an IT software development graduate who holds a Bachelor's degree from the Richfield Graduate Institute (2019), where he received a top achiever award. He has worked in technical sales, project management and administration, combining technical understanding with commercial experience. He leads True Tag's platform build and operations, and is committed to making everyday goods safe for South African consumers.",
    },
  ],
  figures: [
    { count: 100, prefix: 'R', suffix: 'bn', label: 'lost every year', source: 'Source: SARS' },
    { count: 60, prefix: '', suffix: '%+', label: 'of cigarettes sold are illicit', source: '' },
    { count: 21, prefix: '', suffix: '', label: 'lives lost at Enyobeni' },
  ],
};

export const whatsappReady = Boolean(site.whatsappNumber);

export const whatsappLink = (text = 'Hi True Tag, I would like to know more.') =>
  site.whatsappNumber
    ? `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`
    : `mailto:${site.email}?subject=${encodeURIComponent('True Tag enquiry')}&body=${encodeURIComponent(text)}`;

export type Verdict = 'genuine' | 'suspicious' | 'invalid';

export const demoCodes: Record<string, { verdict: Verdict; product: string; detail: string }> = {
  'TT-DEMO-1001': {
    verdict: 'genuine',
    product: 'Sample Reserve Lager 340ml',
    detail: 'First scan. Batch B-2026-014.',
  },
  'TT-DEMO-2002': {
    verdict: 'suspicious',
    product: 'Sample Premium Cigarettes 20s',
    detail: 'Scanned many times in different places.',
  },
  'TT-DEMO-3003': {
    verdict: 'invalid',
    product: 'Unknown product',
    detail: '',
  },
};

export const verdictCopy: Record<Verdict, { title: string; text: string; advice: string }> = {
  genuine: {
    title: 'Genuine',
    text: 'Issued by the brand through True Tag. Looks normal.',
    advice: '',
  },
  suspicious: {
    title: 'Suspicious',
    text: 'Real code, but unusual scans.',
    advice: 'Do not drink or smoke it. Report it to us.',
  },
  invalid: {
    title: 'Not found',
    text: 'We have no record of this code.',
    advice: 'Check the code. Still failing? Treat with care and report it.',
  },
};
