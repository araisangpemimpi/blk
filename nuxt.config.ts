export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content'],
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'BLKK Darul Maarif Bangsal Mojokerto — Pelatihan Kerja Gratis & Bersertifikat',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'BLKK Darul Maarif Bangsal Mojokerto — Balai Latihan Kerja Komunitas. 4 program resmi Kemnaker 100% gratis: Junior Web Developer, Practical Office, Desainer Grafis Muda & Konten Social Media. blk.darulmaarif.org'
        },
        { name: 'theme-color', content: '#047857' },
        { property: 'og:title', content: 'BLKK Darul Maarif Bangsal Mojokerto' },
        {
          property: 'og:description',
          content: 'Pelatihan kerja GRATIS 100% untuk usia 17-30 tahun. Dapat sertifikat, toolkit, uang saku & penyaluran kerja.'
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://blk.darulmaarif.org' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-blkk.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap'
        }
      ]
    }
  },

  ui: {
    fonts: false
  },

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    adminTokenSecret: process.env.ADMIN_TOKEN_SECRET || 'blk-darulmaarif-ganti-di-production',
    public: {
      adminEnabled: true
    }
  },

  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})
