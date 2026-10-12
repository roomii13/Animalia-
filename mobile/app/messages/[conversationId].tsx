import { Card, Notice, PageHeading, Screen } from '../../src/ui';

export default function ConversationScreen() {
  return <Screen>
    <PageHeading eyebrow="Conversación" title="Mensajería en preparación" detail="El chat todavía no está disponible." />
    <Card><Notice>No se envían ni reciben mensajes desde esta pantalla.</Notice></Card>
  </Screen>;
}
