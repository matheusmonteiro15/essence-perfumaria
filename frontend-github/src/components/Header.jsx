import "./header.css"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useContext, useEffect } from "react"
import { CartContext } from "../contexts/CartContext"
import api from "../services/api"
import logo from "../assets/logo1.png"

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { quantidadeItens, quantidadeFavoritos } = useContext(CartContext)
  const [busca, setBusca] = useState("")
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [catalogo, setCatalogo] = useState([])

  function gerarSlug(texto) {
    if (!texto) return ""
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }
  const [menus, setMenus] = useState([
    { titulo: "Perfumaria", opcoes: [] },
    { titulo: "Família Olfativa", opcoes: [] },
    { titulo: "Marcas", opcoes: [] },
    { titulo: "Corpo e Banho", opcoes: [] },
    { titulo: "Presentes", opcoes: [] },
    { titulo: "Promoção", opcoes: [] },
    { titulo: "Perfume Ideal", opcoes: [{ nome: "Fazer Quiz", slug: "quiz", rota: "/quiz" }] },
  ])

  // Busca o catálogo inteiro e os filtros do menu
  useEffect(() => {
    async function carregarDados() {
      try {
        const [catResponse, menuResponse] = await Promise.all([
          api.get("/products"),
          api.get("/products/menu-filters")
        ])
        
        setCatalogo(catResponse.data)
        
        const data = menuResponse.data
        setMenus([
          {
            titulo: "Perfumaria",
            opcoes: data.categorias.filter(c => c.toLowerCase() !== "indie").map(c => ({ nome: c, slug: gerarSlug(c) }))
          },
          {
            titulo: "Família Olfativa",
            opcoes: data.familias.map(f => ({ nome: f, slug: gerarSlug(f) }))
          },
          {
            titulo: "Marcas",
            opcoes: data.marcas.map(m => ({ nome: m, slug: gerarSlug(m) }))
          },
          {
            titulo: "Corpo e Banho",
            opcoes: [
              { nome: "Sabonetes", slug: "sabonetes" },
              { nome: "Hidratantes", slug: "hidratantes" },
            ]
          },
          {
            titulo: "Presentes",
            opcoes: [
              { nome: "Kits", slug: "kits" },
              { nome: "Até R$100", slug: "ate-100" },
            ]
          },
          {
            titulo: "Perfume Ideal",
            opcoes: [{ nome: "Fazer Quiz", slug: "quiz", rota: "/quiz" }],
          }
        ])

      } catch (e) {
        console.error("Erro na busca do header", e)
      }
    }
    carregarDados()
  }, [])

  // Verifica se o usuário está logado
  const isLogado = !!localStorage.getItem("usuarioLogado")
  const linkUsuario = isLogado ? "/perfil" : "/login"

  const sugestoes = catalogo.filter((produto) => {
    const texto = `
      ${produto.nome}
      ${produto.marca || ""}
      ${produto.descricao || ""}
      ${produto.familia_olfativa || ""}
      ${produto.categoria || ""}
    `.toLowerCase()

    return busca.trim() !== "" && texto.includes(busca.toLowerCase())
  })

  function pesquisar(event) {
    event.preventDefault()

    if (busca.trim() !== "") {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`)
      setBusca("")
      setMostrarSugestoes(false)
    }
  }

  function abrirProduto(id) {
    navigate(`/produto/${id}`)
    setBusca("")
    setMostrarSugestoes(false)
  }



  return (
    <header className="header">
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/">
          <img src={logo} alt="Essence" className="logo-img" />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <form className="search-form" onSubmit={pesquisar} style={{ position: 'relative', width: '500px', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '15px', color: '#000', display: 'flex', alignItems: 'center' }}>
              {/* Lupa SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              className="search"
              type="text"
              placeholder="Buscar perfumes..."
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value)
                setMostrarSugestoes(true)
              }}
              onFocus={() => setMostrarSugestoes(true)}
              style={{ width: '100%', padding: '10px 40px', borderRadius: '8px', border: '1px solid #000', fontSize: '14px', outline: 'none' }}
            />
            <button 
              type="button" 
              onClick={() => {
                setBusca('')
                setMostrarSugestoes(false)
              }} 
              style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
              ✕
            </button>

            {mostrarSugestoes && busca.trim() !== "" && (
              <div className="search-suggestions">
                {sugestoes.length === 0 ? (
                  <p>Nenhum perfume encontrado</p>
                ) : (
                  sugestoes.slice(0, 5).map((produto) => (
                    <button
                      type="button"
                      key={produto.id}
                      onClick={() => abrirProduto(produto.id)}
                    >
                      <img src={produto.imagem} alt={produto.nome} />
                      <span>
                        <strong>{produto.nome}</strong>
                        <small>{produto.marca}</small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </form>

          <div className="icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/favoritos" className="cart-icon-container">
              <svg 
                className="icon-img" 
                viewBox="0 0 24 24" 
                fill={location.pathname === '/favoritos' ? "black" : "none"} 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ display: 'block' }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {quantidadeFavoritos > 0 && <span className="cart-badge">{quantidadeFavoritos}</span>}
            </Link>

            <Link to={linkUsuario}>
              <svg 
                className={`icon-img ${isLogado ? 'logged-in' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                title={isLogado ? "Meu Perfil" : "Fazer Login"}
                style={{ display: 'block' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>

            <Link to="/sacola" className="cart-icon-container" style={{ position: 'relative' }}>
              <svg 
                className="icon-img" 
                viewBox="0 0 24 24" 
                fill={location.pathname === '/sacola' ? "black" : "none"} 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ display: 'block' }}
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {quantidadeItens > 0 && <span className="cart-badge">{quantidadeItens}</span>}
            </Link>

            {isLogado && (
              <button 
                onClick={() => {
                  localStorage.removeItem("usuarioLogado");
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                title="Sair"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="menu">
        {menus.map((menu) => (
          <div className="menu-item" key={menu.titulo}>
            <button className="menu-button" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {menu.titulo} <span style={{ fontSize: '10px' }}>∨</span>
            </button>

            <div className="dropdown">
              {menu.opcoes.map((opcao) => (
                <Link
                  key={opcao.slug}
                  to={opcao.rota ? opcao.rota : `/categoria/${opcao.slug}`}
                >
                  {opcao.nome}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </header>
  )
}

export default Header