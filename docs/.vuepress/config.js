module.exports = {
  title: 'Receitas da Wivian',
  description: 'Lista de receitas',
  base: '/',
  serviceWorker: true,
  head: [
    ['meta', { name: 'theme-color', content: '#2196f3' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
  ],
  plugins: ['@vuepress/pwa']
}