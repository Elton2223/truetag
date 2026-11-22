import type { APIRoute } from 'astro';
import { CODE_ALPHABET } from '../../../../lib/codes';
import { json } from '../../../../lib/request';

export const prerender = false;

/**
 * Documents True Tag's code and data contract for future SARS/NCC track-and-trace
 * alignment. This is not a government certification or live government API.
 */
export const GET: APIRoute = async () => {
  return json({
    name: 'True Tag Integration Manifest',
    version: '1.0',
    status: 'private_voluntary_registry',
    disclaimer:
      'True Tag is an independent voluntary authentication registry. It is not a substitute for SARS excise stamps or any future government-appointed track-and-trace system.',
    code: {
      format: 'TT-XXXX-XXXX-XXXX',
      alphabet: CODE_ALPHABET,
      alphabet_name: 'Crockford base32',
      length_body: 12,
      sequential: false,
      generation: 'cryptographic_random',
      gs1_mapping: {
        planned: true,
        note: 'Consumer-facing TT codes can later map 1:1 to GS1 Digital Link / AI (01)+(21) identifiers without changing shopper UX.',
        fields_reserved: ['gtin', 'serial', 'lot', 'expiry'],
      },
    },
    verdicts: {
      genuine: 'Issued by the brand through True Tag and behaving normally',
      suspicious: 'Real code with unusual scan pattern (limit or multi-region)',
      invalid: 'No record — does not prove the product is fake',
    },
    endpoints: {
      verify: { method: 'POST', path: '/api/v1/verify' },
      reports: { method: 'POST', path: '/api/v1/reports' },
      brand_scans: { method: 'GET', path: '/api/v1/brands/me/scans', auth: 'session' },
      brand_generate_codes: { method: 'POST', path: '/api/v1/brands/me/batches/:id/codes', auth: 'session' },
      channels_inbound: { method: 'POST', path: '/api/v1/channels/inbound', status: 'stub' },
      health: { method: 'GET', path: '/api/v1/health' },
    },
    data_fields_for_future_integration: [
      'brand.reg_number',
      'brand.licence_notes',
      'product.sku',
      'product.category',
      'batch.label',
      'batch.manufactured_on',
      'batch.expires_on',
      'code.code',
      'scan_events.created_at',
      'scan_events.city_approx',
      'scan_events.channel',
      'scan_events.verdict',
    ],
    south_africa_context: {
      as_of: '2026-11',
      voluntary: true,
      sars_excise_stamp: 'still required for cigarettes; True Tag does not replace it',
      dtic_discussion: 'Design reserved for GS1-like unique machine-readable unit codes',
    },
  });
};
