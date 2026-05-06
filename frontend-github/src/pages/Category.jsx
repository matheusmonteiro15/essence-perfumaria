import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import ProductCard from "../components/ProductCard"
import api from "../services/api"

function Category() {
  const { categoria } = useParams()
  const [produtosFiltrados, setProdutosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function buscar() {
      try {
        const response = await api.get('/products')
        
        function gerarSlug(texto) {
          if (!texto) return ""
          return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        }

        const targetSlug = gerarSlug(categoria)

        const filtrado = response.data.filter((p) => {
          const cat = gerarSlug(p.categoria)
          const mar = gerarSlug(p.marca)
          const fam = gerarSlug(p.familia_olfativa)
          
          return cat === targetSlug || mar === targetSlug || fam === targetSlug ||
                 cat.includes(targetSlug) || mar.includes(targetSlug) || fam.includes(targetSlug)
        })
        setProdutosFiltrados(filtrado)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    buscar()
  }, [categoria])

  return (
    <section className="products-section">
      <h2>{categoria.replaceAll("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</h2>

      {loading ? (
        <p>Buscando...</p>
      ) : produtosFiltrados.length === 0 ? (
        <p>Nenhum produto encontrado nessa categoria.</p>
      ) : (
        <div className="products-grid">
          {produtosFiltrados.map((produto) => (
            <ProductCard key={produto.id} {...produto} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Category