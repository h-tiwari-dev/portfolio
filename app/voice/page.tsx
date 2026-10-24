import type { Metadata } from 'next';
import VoiceStage from '@/components/voice/VoiceStage';

export const metadata: Metadata = {
  title: 'Voice — Harsh Tiwari',
  description: 'A spoken conversation about Harsh Tiwari’s work, with a low-resolution talking portrait.',
};

export default function VoicePage() {
  return <VoiceStage />;
}
