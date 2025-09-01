import AppShell from '../../../../components/AppShell';
import { Button, Cards, Palette } from './parts';

export default function DesignPreview(){
  return (
    <AppShell title="Design System" subtitle="Tokens, knapper, kort og tabeller – rask forhåndsvisning">
      <Palette />
      <div style={{ height: 16 }} />
      <Button />
      <div style={{ height: 16 }} />
      <Cards />
    </AppShell>
  );
}
