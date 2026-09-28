import { FlagDefinition } from './feature-flag.types.js';
import { SEED_MERCHANT_ID } from '@modules/users/users.repository.js';

export const FLAGS_SEED: FlagDefinition[] = [
    {
        key: 'maintenance-mode',
        description: 'Kill switch: pone el catálogo en mantenimiento',
        enabled: false,
        rolloutPercent: 100,
        enabledFor: [],
        disabledFor: [],
        expiresAt: '2027-12-31',
    },
    {
        key: 'product-recommendations',
        description: 'Endpoint de recomendaciones (beta)',
        enabled: true,
        rolloutPercent: 50,
        enabledFor: [],
        disabledFor: [],
        expiresAt: '2027-03-31',
    },
    {
        key: 'promo-pricing',
        description: '10% de descuento, solo para comercios elegidos',
        enabled: true,
        rolloutPercent: 0,
        enabledFor: [SEED_MERCHANT_ID],
        disabledFor: [],
        expiresAt: '2027-01-31',
    },
];