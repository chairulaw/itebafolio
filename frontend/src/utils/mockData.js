export function slugify(value = '') {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatCount(value = 0) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

export function formatPublishDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

const tonePresets = [
  'linear-gradient(135deg, #d4d8e4 0%, #bdc8da 45%, #eef1f7 100%)',
  'linear-gradient(135deg, #d5d4d9 0%, #bfbfc8 45%, #f0eff4 100%)',
  'linear-gradient(135deg, #d9d5cd 0%, #d1c5b7 45%, #f3eee7 100%)',
  'linear-gradient(135deg, #ced8d9 0%, #b6cbd1 45%, #edf4f6 100%)',
  'linear-gradient(135deg, #d7d3e0 0%, #c7bdd5 45%, #f1eef8 100%)',
];

export const galleryFilters = [
  {
    slug: 'fyp',
    label: 'FYP',
    kind: 'curated',
    description: 'Kurasi karya mahasiswa yang sedang ramai dilihat dan dibagikan.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
  },
  {
    slug: 'most-liked',
    label: 'Most liked',
    kind: 'sort',
    description: 'Pilihan proyek dengan apresiasi komunitas paling tinggi.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
  },
  // --- KATEGORI BARU ---
  {
    // Tetap gunakan kind: 'program' agar kode Homepage Anda tidak error/rusak
    slug: slugify('Frontend Web Development'),
    label: 'Frontend Web',
    kind: 'program', 
    description: 'Eksplorasi antarmuka web, interaksi, dan implementasi kode.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
  },
  {
    slug: slugify('UI/UX Design'),
    label: 'UI/UX Design',
    kind: 'program',
    description: 'Rancangan pengalaman pengguna dan antarmuka aplikasi intuitif.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80',
  },
  {
    slug: slugify('Desain Grafis / Branding'),
    label: 'Desain Grafis',
    kind: 'program',
    description: 'Eksplorasi identitas visual, branding, dan ilustrasi kreatif.',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&q=80',
  },
  {
    slug: slugify('Aplikasi Mobile'),
    label: 'Mobile App',
    kind: 'program',
    description: 'Pengembangan aplikasi untuk perangkat Android maupun iOS.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80',
  },
  {
    slug: slugify('Backend / Sistem Informasi'),
    label: 'Backend & SI',
    kind: 'program',
    description: 'Arsitektur server, database, dan perancangan sistem informasi.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
  }
];

export const programFilters = galleryFilters.filter((filter) => filter.kind === 'program');

export const initialProfile = {
  id: 'chairulaw',
  name: 'Muhammad Chairul Wibisono',
  username: 'chairulaw',
  program: 'Sistem Informasi',
  cohortLabel: 'Angkatan 2022',
  bio: 'UI-focused frontend developer yang suka merapikan pengalaman digital supaya tetap terasa jelas, cepat, dan menyenangkan dipakai.',
  website: 'chairulaw.vercel.app',
  phone: '0821313xxxx',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
};

export function createDefaultMedia(title, toneIndex = 0) {
  const baseTone = tonePresets[toneIndex % tonePresets.length];
  const accentTone = tonePresets[(toneIndex + 1) % tonePresets.length];
  const softTone = tonePresets[(toneIndex + 2) % tonePresets.length];
  const baseSlug = slugify(title);

  return [
    { id: `${baseSlug}-image`, kind: 'image', label: `${title} cover`, hint: 'Image preview', tone: baseTone },
    { id: `${baseSlug}-video`, kind: 'video', label: `${title} walkthrough`, hint: 'Video preview', tone: accentTone },
    { id: `${baseSlug}-pdf`, kind: 'pdf', label: `${title} presentation`, hint: 'PDF preview', tone: softTone },
  ];
}

function buildDescription(lines) { return lines.join('\n\n'); }

const seedProjects = [
  {
    id: 'campus-service-redesign',
    title: 'Campus Service Redesign',
    programLabel: 'Sistem Informasi',
    publishDate: '2026-04-12',
    likes: 247,
    views: 2100,
    featured: true,
    bestProject: true,
    image: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&q=80',
    description: buildDescription(['Redesign platform layanan kampus ini berfokus pada navigasi yang lebih cepat.']),
    media: createDefaultMedia('Campus Service Redesign', 0),
  },
  {
    id: 'makerspace-monitor',
    title: 'Makerspace Monitor Kit',
    // PERBAIKAN: Diubah dari 'Teknik Komputer' menjadi 'Sistem Informasi'
    programLabel: 'Sistem Informasi', 
    publishDate: '2026-04-10',
    likes: 184,
    views: 1560,
    featured: true,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    description: buildDescription(['Sebuah kit monitoring ruang praktikum yang menggabungkan sensor dan dashboard.']),
    media: createDefaultMedia('Makerspace Monitor Kit', 1),
  },
  {
    id: 'batam-brand-atlas',
    title: 'Batam Brand Atlas',
    programLabel: 'DKV',
    publishDate: '2026-04-08',
    likes: 226,
    views: 1920,
    featured: true,
    bestProject: true,
    image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80',
    description: buildDescription(['Eksplorasi identitas visual untuk ekosistem kreatif lokal.']),
    media: createDefaultMedia('Batam Brand Atlas', 2),
  },
  {
    id: 'math-lab-dashboard',
    title: 'Math Lab Dashboard',
    programLabel: 'Matematika',
    publishDate: '2026-04-07',
    likes: 163,
    views: 1310,
    featured: false,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    description: buildDescription(['Dashboard ini menyatukan visualisasi eksperimen dan performa kelas.']),
    media: createDefaultMedia('Math Lab Dashboard', 3),
  },
  {
    id: 'smart-factory-tracker',
    title: 'Smart Factory Tracker',
    programLabel: 'Teknik Industri',
    publishDate: '2026-04-05',
    likes: 149,
    views: 1180,
    featured: false,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1504917595222-08d27ce7cb07?w=800&q=80',
    description: buildDescription(['Sistem pelacakan proses produksi memetakan bottleneck operasional.']),
    media: createDefaultMedia('Smart Factory Tracker', 4),
  },
  {
    id: 'sprint-ops-kit',
    title: 'Sprint Ops Kit',
    programLabel: 'Manajemen Rekayasa',
    publishDate: '2026-04-04',
    likes: 172,
    views: 1270,
    featured: false,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
    description: buildDescription(['Toolkit ini mendokumentasikan ritme sprint dan alignment meeting.']),
    media: createDefaultMedia('Sprint Ops Kit', 0),
  },
  {
    id: 'export-ready-catalog',
    title: 'Export Ready Catalog',
    programLabel: 'Perdagangan Internasional',
    publishDate: '2026-04-02',
    likes: 141,
    views: 1130,
    featured: false,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    description: buildDescription(['Katalog produk ini dirancang sebagai materi pitch ekspor.']),
    media: createDefaultMedia('Export Ready Catalog', 1),
  },
  {
    id: 'finance-learning-hub',
    title: 'Finance Learning Hub',
    programLabel: 'Bisnis Digital',
    publishDate: '2026-03-30',
    likes: 198,
    views: 1680,
    featured: true,
    bestProject: true,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    description: buildDescription(['Platform pembelajaran finansial mahasiswa.']),
    media: createDefaultMedia('Finance Learning Hub', 2),
  },
  {
    id: 'student-volunteer-platform',
    title: 'Student Volunteer Platform',
    programLabel: 'Sistem Informasi',
    publishDate: '2026-03-28',
    likes: 154,
    views: 1200,
    featured: false,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    description: buildDescription(['Platform ini memudahkan pencarian kegiatan volunteer.']),
    media: createDefaultMedia('Student Volunteer Platform', 3),
  },
  {
    id: 'assistive-campus-map',
    title: 'Assistive Campus Map',
    programLabel: 'DKV',
    publishDate: '2026-03-25',
    likes: 167,
    views: 1390,
    featured: false,
    bestProject: false,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
    description: buildDescription(['Peta kampus berbasis aksesibilitas.']),
    media: createDefaultMedia('Assistive Campus Map', 4),
  },
];

export const initialProjects = seedProjects.map((project, index) => ({
  ...project,
  creatorName: initialProfile.name,
  creatorHandle: initialProfile.username,
  creatorAvatar: initialProfile.avatar, 
  thumbnailTone: tonePresets[index % tonePresets.length],
  programSlug: slugify(project.programLabel),
}));

export const initialComments = Object.fromEntries(
  initialProjects.map((project, index) => [
    project.id,
    [
      { id: `${project.id}-c1`, author: 'anonim', message: 'Presentasinya rapi dan enak banget diikuti.' },
      { id: `${project.id}-c2`, author: 'anonim', message: 'Visualnya clean dan kelihatan matang.' },
    ],
  ]),
);