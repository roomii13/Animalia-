export type AnimalPost = {
  id: string;
  category: string;
  type: string;
  title: string;
  description: string;
  animal: string;
  location: string;
  author: string;
  username?: string;
  emoji: string;
  tint: string;
};

export const categories = ['Todo', 'Adopciones', 'Perdidos', 'Rescates', 'Ayuda', 'Actividades'];

export const posts: AnimalPost[] = [
  {
    id: 'adopcion-luna',
    category: 'Adopciones',
    type: 'Adopción responsable',
    title: 'Luna busca una familia paciente',
    description: 'Una perrita tranquila que espera conocer a una familia comprometida con su cuidado.',
    animal: 'Perra · adulta',
    location: 'Localidad por confirmar',
    author: 'Refugio de ejemplo',
    emoji: '🐕',
    tint: '#f7eadb',
  },
  {
    id: 'rescate-gatitos',
    category: 'Ayuda',
    type: 'Pedido de colaboración',
    title: 'Acompañemos este rescate',
    description: 'Aviso ilustrativo para reunir voluntariado y elementos de cuidado. Los datos están sin confirmar.',
    animal: 'Gatitos · edad por confirmar',
    location: 'Zona por confirmar',
    author: 'Comunidad de ejemplo',
    emoji: '🐈',
    tint: '#e9efe4',
  },
  {
    id: 'perdido-toto',
    category: 'Perdidos',
    type: 'Animal perdido',
    title: 'Ayudemos a reunir a Toto con su familia',
    description: 'Ejemplo de aviso de búsqueda. Antes de difundir, se verificarán los datos de contacto.',
    animal: 'Perro · pequeño',
    location: 'Barrio por confirmar',
    author: 'Perfil de muestra',
    emoji: '🐶',
    tint: '#f8e8e3',
  },
];

export const conversations = [
  { id: 'refugio-patitas', name: 'Refugio Patitas (ejemplo)', preview: 'Gracias por interesarte en la adopción.', emoji: '🐾' },
  { id: 'red-voluntaria', name: 'Red voluntaria (ejemplo)', preview: 'La actividad se publicará al confirmar el lugar.', emoji: '🤝' },
];
