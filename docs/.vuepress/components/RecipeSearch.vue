<template>
  <div class="recipe-search">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="query"
        type="text"
        placeholder="Buscar receitas... ex: cenoura, frango, chocolate"
        class="search-input"
        @keydown.esc="query = ''"
      />
      <button v-if="query" class="clear-btn" @click="query = ''">✕</button>
    </div>

    <div v-if="query.trim()" class="search-results">
      <div v-if="results.length === 0" class="no-results">
        Nenhuma receita encontrada para "<strong>{{ query }}</strong>"
      </div>
      <a
        v-for="recipe in results"
        :key="recipe.anchor"
        :href="recipe.anchor"
        class="result-item"
        @click="query = ''"
      >
        <span class="result-name">{{ recipe.name }}</span>
        <span v-if="recipe.snippet" class="result-snippet">{{ recipe.snippet }}</span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeSearch',
  data() {
    return {
      query: '',
      recipes: [],
    }
  },
  computed: {
    results() {
      if (!this.query.trim()) return []
      const q = this.normalize(this.query)
      return this.recipes.filter(r => this.normalize(r.fullText).includes(q))
        .map(r => ({
          ...r,
          snippet: this.extractSnippet(r.fullText, this.query),
        }))
    },
  },
  mounted() {
    this.$nextTick(() => this.extractRecipes())
  },
  methods: {
    normalize(text) {
      return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    },
    extractRecipes() {
      const h2s = document.querySelectorAll('.theme-default-content h2')
      const recipes = []
      h2s.forEach(h2 => {
        const name = h2.textContent.trim()
        let fullText = name + ' '
        let el = h2.nextElementSibling
        while (el && el.tagName !== 'H2') {
          fullText += el.textContent + ' '
          el = el.nextElementSibling
        }
        recipes.push({ name, anchor: '#' + h2.id, fullText })
      })
      this.recipes = recipes
    },
    extractSnippet(fullText, query) {
      const norm = this.normalize(fullText)
      const q = this.normalize(query)
      const idx = norm.indexOf(q)
      if (idx === -1) return ''
      const start = Math.max(0, idx - 40)
      const end = Math.min(fullText.length, idx + query.length + 60)
      let snippet = (start > 0 ? '…' : '') + fullText.slice(start, end).trim() + (end < fullText.length ? '…' : '')
      return snippet
    },
  },
}
</script>

<style scoped>
.recipe-search {
  margin: 1.2rem 0 2rem;
  position: relative;
}

.search-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #ddd;
  border-radius: 12px;
  padding: 0.5rem 0.8rem;
  background: #fff;
  transition: border-color 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.search-wrapper:focus-within {
  border-color: #2196f3;
  box-shadow: 0 2px 12px rgba(33,150,243,0.15);
}

.search-icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: inherit;
}

.clear-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #999;
  font-size: 0.9rem;
  padding: 0 0.2rem;
  line-height: 1;
}

.clear-btn:hover {
  color: #333;
}

.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  z-index: 100;
  max-height: 360px;
  overflow-y: auto;
}

.no-results {
  padding: 1rem 1.2rem;
  color: #888;
  font-size: 0.95rem;
}

.result-item {
  display: block;
  padding: 0.7rem 1.2rem;
  border-bottom: 1px solid #f0f0f0;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: #f5f9ff;
}

.result-name {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: #2196f3;
}

.result-snippet {
  display: block;
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
