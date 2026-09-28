export interface FlagDefinition {
  key: string;
  description: string;
  enabled: boolean;          // interruptor maestro
  rolloutPercent: number;    // 0..100
  enabledFor: string[];      // ids forzados a ON
  disabledFor: string[];     // ids forzados a OFF
  expiresAt: string;         // todo flag nace con fecha de vencimiento
}

export interface FlagContext {
  userId?: string;
  merchantId?: string;
}

export interface FlagDecision {
  enabled: boolean;
  reason:
    | 'not_found' | 'expired' | 'force_disabled' | 'force_enabled'
    | 'flag_disabled' | 'in_rollout' | 'out_of_rollout';
}