import { useState, useEffect } from "react"
import ProductCard from "../components/ProductCard"
import api from "../services/api"
import banner from "../assets/banner.png"

function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function carregarVitrine() {
      try {
        const response = await api.get("/products")
        setProducts(response.data)
      } catch (error) {
        console.error("Erro ao puxar perfumes do banco:", error)
      }
    }
    carregarVitrine()
  }, [])
  return (
    <div>

      {/* 🔥 BANNER */}
      <div className="banner">
        <img src={banner} alt="Banner" />
      </div>

      {/* PRODUTOS */}
      <section className="products-section">
        <h2>Aproveite</h2>

        {products.length === 0 ? (
          <p>Nenhum perfume cadastrado no momento.</p>
        ) : (
          <div className="products-grid">
            {products.map((produto) => (
              <ProductCard key={produto.id} {...produto} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default Home