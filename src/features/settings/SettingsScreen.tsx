import { OptionGroup, type Option } from '../../components/OptionGroup';
import { ScreenLayout } from '../../components/ScreenLayout';
import type {
  MotionPreference,
  Preferences,
  TextSizePreference,
} from '../../services/preferences/preferences';

const MOTION_CHOICES: readonly Option<MotionPreference>[] = [
  { value: 'system', label: 'Match device', hint: 'Follow your system motion setting.' },
  { value: 'reduced', label: 'Reduced', hint: 'Turn off transitions and animation.' },
  { value: 'full', label: 'Full', hint: 'Allow subtle transitions.' },
];

const TEXT_SIZE_CHOICES: readonly Option<TextSizePreference>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large', hint: 'Increase text size throughout the archive.' },
];

interface SettingsScreenProps {
  readonly preferences: Preferences;
  readonly onChange: (patch: Partial<Preferences>) => void;
  readonly persistFailed: boolean;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
}

export function SettingsScreen({
  preferences,
  onChange,
  persistFailed,
  onBack,
  focusOnMount,
}: SettingsScreenProps) {
  return (
    <ScreenLayout title="Settings" onBack={onBack} focusOnMount={focusOnMount}>
      <section className="panel" aria-labelledby="accessibility-heading">
        <h2 id="accessibility-heading" className="panel__title">
          Accessibility
        </h2>
        <OptionGroup
          legend="Motion"
          options={MOTION_CHOICES}
          value={preferences.motion}
          onChange={(motion) => onChange({ motion })}
        />
        <OptionGroup
          legend="Text size"
          options={TEXT_SIZE_CHOICES}
          value={preferences.textSize}
          onChange={(textSize) => onChange({ textSize })}
        />
      </section>
      <p className={persistFailed ? 'notice notice--warning' : 'notice'} role="status">
        {persistFailed
          ? 'Changes apply now but could not be saved on this device. They will reset when you close the archive.'
          : 'Changes apply immediately and are saved on this device.'}
      </p>
    </ScreenLayout>
  );
}
