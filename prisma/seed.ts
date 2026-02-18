import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Get DATABASE_URL and remove any SSL parameters to configure them manually
let connectionString = process.env.DATABASE_URL || '';
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

// Strip any existing SSL parameters from the connection string
connectionString = connectionString.split('?')[0];

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alecam.dev' },
    update: {},
    create: {
      email: 'admin@alecam.dev',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create About section
  const about = await prisma.about.upsert({
    where: { id: 'about-main' },
    update: {},
    create: {
      id: 'about-main',
      title: {
        en: 'About Me',
        es: 'Sobre Mí',
      },
      description: {
        en: 'Specialising in web development, working with modern technologies to create projects with an attractive UI and robust infrastructure.\n\nI collaborate with brands, entrepreneurs, businesses, etc., who seek to stand out through professional, well-built software.\n\nBy working with me, you will see your idea digitised and even enhanced, thanks to clear communication and a solid product mindset, focused on offering effective and scalable solutions.\n\nIf you have a project in mind and want to get it off the ground, you\'ve just found your best option.',
        es: 'Especializado en desarrollo web, trabajando con tecnologías modernas para crear proyectos con una interfaz de usuario atractiva e infraestructura robusta.\n\nCollaboro con marcas, emprendedores, empresas, etc., que buscan destacarse a través de software profesional y bien construido.\n\nAl trabajar conmigo, verás tu idea digitalizada e incluso mejorada, gracias a una comunicación clara y una mentalidad de producto sólida, enfocada en ofrecer soluciones efectivas y escalables.\n\nSi tienes un proyecto en mente y quieres ponerlo en marcha, acabas de encontrar tu mejor opción.',
      },
      shortBio: {
        en: 'Full-stack developer specialized in modern web technologies',
        es: 'Desarrollador full-stack especializado en tecnologías web modernas',
      },
      location: 'Lima, Peru',
      email: 'contact@alecam.dev',
    },
  });

  console.log('✅ About section created');

  // Create sample projects (matching frontend structure)
  const project1 = await prisma.project.upsert({
    where: { slug: 'architecture-firm-website' },
    update: {},
    create: {
      slug: 'architecture-firm-website',
      title: {
        en: 'Under development...',
        es: 'En desarrollo...',
      },
      description: {
        en: 'Project for an architecture firm.',
        es: 'Proyecto para una empresa de arquitectura.',
      },
      technologies: ['React', 'Three.js', 'TypeScript'],
      accentColor: '#0ff',
      liveUrl: null,
      githubUrl: null,
      featured: true,
      published: true,
      order: 0,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: 'copilot4yt' },
    update: {},
    create: {
      slug: 'copilot4yt',
      title: {
        en: 'AI Thumbnail Generator',
        es: 'Generador de miniaturas con IA',
      },
      description: {
        en: 'An application that uses artificial intelligence to generate custom thumbnails for YouTube videos, optimizing visual appeal and increasing click-through rates.',
        es: 'Una aplicación que utiliza inteligencia artificial para generar miniaturas personalizadas para videos de YouTube, optimizando la atracción visual y aumentando las tasas de clics.',
      },
      technologies: ['React', 'OpenAI API', 'Node.js', 'Express'],
      accentColor: '#9a031e',
      liveUrl: 'https://copilot4yt.vercel.app/',
      githubUrl: null,
      featured: true,
      published: true,
      order: 1,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { slug: 'moodbeatshub' },
    update: {},
    create: {
      slug: 'moodbeatshub',
      title: {
        en: 'Moodbeatshub',
        es: 'Moodbeatshub',
      },
      description: {
        en: 'Moodbeatshub is a system that generates personalised playlists based on the user\'s mood. It currently works exclusively with Spotify.',
        es: 'Moodbeatshub es un sistema que genera playlists personalizadas según el estado de ánimo del usuario. Actualmente, funciona exclusivamente con el proveedor Spotify.',
      },
      technologies: ['React', 'Spotify API', 'Node.js', 'Machine Learning'],
      accentColor: '#0b5f97',
      liveUrl: 'https://mood-beats-hub.vercel.app/',
      githubUrl: null,
      featured: true,
      published: true,
      order: 2,
    },
  });

  console.log('✅ Sample projects created:', [project1.slug, project2.slug, project3.slug]);

  // Create sample certifications (matching frontend structure)
  const cert1 = await prisma.certification.upsert({
    where: { id: 'cert-postgresql' },
    update: {},
    create: {
      id: 'cert-postgresql',
      title: { en: 'PostgreSQL', es: 'PostgreSQL' },
      issuer: { en: 'Platzi', es: 'Platzi' },
      imageUrl: '/certifications/diploma-postgresql.jpg',
      credentialUrl: 'https://platzi.com/p/alecamdev/curso/12074-postgresql/diploma/detalle/',
      featured: true,
      published: true,
      order: 0,
    },
  });

  const cert2 = await prisma.certification.upsert({
    where: { id: 'cert-backend' },
    update: {},
    create: {
      id: 'cert-backend',
      title: { en: 'Backend', es: 'Backend' },
      issuer: { en: 'Platzi', es: 'Platzi' },
      imageUrl: '/certifications/diploma-backend.jpg',
      credentialUrl: 'https://platzi.com/p/alecamdev/curso/4656-backend/diploma/detalle/',
      featured: true,
      published: true,
      order: 1,
    },
  });

  const cert3 = await prisma.certification.upsert({
    where: { id: 'cert-nodejs' },
    update: {},
    create: {
      id: 'cert-nodejs',
      title: { en: 'Node.JS', es: 'Node.JS' },
      issuer: { en: 'Platzi', es: 'Platzi' },
      imageUrl: '/certifications/diploma-nodejs.jpg',
      credentialUrl: 'https://platzi.com/p/alecamdev/curso/11982-nodejs/diploma/detalle/',
      featured: true,
      published: true,
      order: 2,
    },
  });

  const cert4 = await prisma.certification.upsert({
    where: { id: 'cert-backend-nodejs' },
    update: {},
    create: {
      id: 'cert-backend-nodejs',
      title: { en: 'Api REST + Express.JS', es: 'Api REST + Express.JS' },
      issuer: { en: 'Platzi', es: 'Platzi' },
      imageUrl: '/certifications/diploma-backend-nodejs.jpg',
      credentialUrl: 'https://platzi.com/p/alecamdev/curso/2485-backend-nodejs/diploma/detalle/',
      featured: true,
      published: true,
      order: 3,
    },
  });

  const cert5 = await prisma.certification.upsert({
    where: { id: 'cert-prompt-engineering' },
    update: {},
    create: {
      id: 'cert-prompt-engineering',
      title: { en: 'Prompt Engineering', es: 'Prompt Engineering' },
      issuer: { en: 'Platzi', es: 'Platzi' },
      imageUrl: '/certifications/diploma-prompt-engineering.jpg',
      credentialUrl: 'https://platzi.com/p/alecamdev/curso/12001-prompt-engineering/diploma/detalle/',
      featured: true,
      published: true,
      order: 4,
    },
  });

  console.log('✅ Sample certifications created:', [cert1, cert2, cert3, cert4, cert5].map(c => c.id));

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Admin credentials:');
  console.log('   Email: admin@alecam.dev');
  console.log('   Password: admin123456');
  console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
