import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaSpinner, FaPlus, FaCashRegister, FaCog, FaTrash, FaHandHoldingUsd, FaTrophy, FaSlidersH, FaCamera, FaCheck, FaArrowRight, FaArrowLeft, FaImage } from "react-icons/fa";
import "./PDV.css";
import Message from "./Message";

const API_URL = "https://api-start-pira.vercel.app";

const PDV = () => {
  const [activeTab, setActiveTab] = useState("venda"); // "venda", "add"
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [change, setChange] = useState(0);

  // ADD - estados
  const [addValorTotal, setAddValorTotal] = useState("");
  const [addOrigens, setAddOrigens] = useState([{ nome: "", valor: "" }]);
  const [origensDisponiveis, setOrigensDisponiveis] = useState([]);
  const [addObservacao, setAddObservacao] = useState("");
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [showOrigensConfig, setShowOrigensConfig] = useState(false);
  const [novaOrigem, setNovaOrigem] = useState("");

  // VALE - estados
  const [valeValorTotal, setValeValorTotal] = useState("");
  const [valeOrigens, setValeOrigens] = useState([{ nome: "", valor: "" }]);
  const [valeObservacao, setValeObservacao] = useState("");
  const [isLoadingVale, setIsLoadingVale] = useState(false);
  const [showValeOrigensConfig, setShowValeOrigensConfig] = useState(false);

  // PRÊMIO - estados
  const [premioStep, setPremioStep] = useState(1); // 1=img1, 2=img2+valor+origens, 3=confirmação
  const [premioImagem1, setPremioImagem1] = useState(null); // base64
  const [premioImagem2, setPremioImagem2] = useState(null); // base64
  const [premioValor, setPremioValor] = useState("");
  const [premioOrigens, setPremioOrigens] = useState([{ nome: "", valor: "" }]);
  const [premioObservacao, setPremioObservacao] = useState("");
  const [isLoadingPremio, setIsLoadingPremio] = useState(false);
  const [showPremioOrigensConfig, setShowPremioOrigensConfig] = useState(false);

  // CONFIG VENDA - estados
  const [configSubTab, setConfigSubTab] = useState("cupons"); // cupons, comandas, taxas, limites
  const [cupons, setCupons] = useState([]);
  const [novoCupom, setNovoCupom] = useState({ codigo: "", tipo: "PERCENTUAL", valor: "", descricao: "", validoAte: "", limiteUso: "" });
  const [editCupomId, setEditCupomId] = useState(null);
  const [taxas, setTaxas] = useState([]);
  const [novaTaxa, setNovaTaxa] = useState({ nome: "", tipo: "PERCENTUAL", valor: "" });
  const [editTaxaId, setEditTaxaId] = useState(null);
  const [configLimites, setConfigLimites] = useState([]);
  const [comandasPendentes, setComandasPendentes] = useState([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  useEffect(() => {
    // Buscar produtos da API quando o componente for montado
    fetchProducts();
    fetchOrigens();
  }, []);

  useEffect(() => {
    // Filtrar produtos baseado no termo de busca
    const filtered = products.filter(
      (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    // Calcular total do carrinho
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  useEffect(() => {
    // Calcular troco
    const receivedAmount = parseFloat(amountReceived) || 0;
    setChange(receivedAmount - total);
  }, [amountReceived, total]);

  const fetchProducts = () => {
    axios
      .get(`${API_URL}/api/estoque_prod`)
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
        setMessage({ show: true, text: "Erro ao carregar produtos!", type: "error" });
        setTimeout(() => setMessage(null), 3000);
      });
  };

  const fetchOrigens = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pdv-origens`);
      setOrigensDisponiveis(response.data);
      if (response.data.length === 0) {
        await axios.post(`${API_URL}/api/pdv-origens/init`);
        const updated = await axios.get(`${API_URL}/api/pdv-origens`);
        setOrigensDisponiveis(updated.data);
      }
    } catch (error) {
      console.error("Erro ao buscar origens:", error);
    }
  };

  const handleAddOrigem = () => {
    setAddOrigens([...addOrigens, { nome: "", valor: "" }]);
  };

  const handleRemoveOrigem = (index) => {
    if (addOrigens.length <= 1) return;
    setAddOrigens(addOrigens.filter((_, i) => i !== index));
  };

  const handleOrigemChange = (index, field, value) => {
    const updated = [...addOrigens];
    updated[index][field] = value;
    setAddOrigens(updated);
  };

  const handleCriarOrigem = async () => {
    if (!novaOrigem.trim()) return;
    try {
      await axios.post(`${API_URL}/api/pdv-origens`, { nome: novaOrigem.trim() });
      setNovaOrigem("");
      fetchOrigens();
      setMessage({ show: true, text: "Origem criada com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: "Erro ao criar origem!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExcluirOrigem = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pdv-origens/${id}`);
      fetchOrigens();
      setMessage({ show: true, text: "Origem excluída!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: "Erro ao excluir origem!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const somaOrigens = addOrigens.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);

  const handleConfirmarAdd = async () => {
    const valorTotal = parseFloat(addValorTotal);
    if (!valorTotal || valorTotal <= 0) {
      setMessage({ show: true, text: "Informe o valor a adicionar!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const origensPreenchidas = addOrigens.filter((o) => o.nome && parseFloat(o.valor) > 0);
    if (origensPreenchidas.length === 0) {
      setMessage({ show: true, text: "Informe pelo menos uma origem!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const somaOrigensVal = origensPreenchidas.reduce((sum, o) => sum + parseFloat(o.valor), 0);
    if (Math.abs(somaOrigensVal - valorTotal) > 0.01) {
      setMessage({ show: true, text: `A soma das origens (R$ ${somaOrigensVal.toFixed(2)}) deve ser igual ao valor total (R$ ${valorTotal.toFixed(2)})!`, type: "error" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsLoadingAdd(true);
    try {
      await axios.post(`${API_URL}/api/pdv-caixa-movimento`, {
        tipo: "ADD",
        valor: valorTotal,
        origens: origensPreenchidas.map((o) => ({ nome: o.nome, valor: parseFloat(o.valor) })),
        observacao: addObservacao || null,
      });
      setMessage({ show: true, text: "Valor adicionado ao caixa com sucesso!", type: "success" });
      setAddValorTotal("");
      setAddOrigens([{ nome: "", valor: "" }]);
      setAddObservacao("");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao adicionar ao caixa:", error);
      setMessage({ show: true, text: "Erro ao adicionar valor!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsLoadingAdd(false);
  };

  // VALE - handlers
  const handleAddOrigemVale = () => {
    setValeOrigens([...valeOrigens, { nome: "", valor: "" }]);
  };

  const handleRemoveOrigemVale = (index) => {
    if (valeOrigens.length <= 1) return;
    setValeOrigens(valeOrigens.filter((_, i) => i !== index));
  };

  const handleOrigemChangeVale = (index, field, value) => {
    const updated = [...valeOrigens];
    updated[index][field] = value;
    setValeOrigens(updated);
  };

  const somaOrigensVale = valeOrigens.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);

  const handleConfirmarVale = async () => {
    const valorTotal = parseFloat(valeValorTotal);
    if (!valorTotal || valorTotal <= 0) {
      setMessage({ show: true, text: "Informe o valor do vale!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const origensPreenchidas = valeOrigens.filter((o) => o.nome && parseFloat(o.valor) > 0);

    if (origensPreenchidas.length > 0) {
      const somaOrigensVal = origensPreenchidas.reduce((sum, o) => sum + parseFloat(o.valor), 0);
      if (Math.abs(somaOrigensVal - valorTotal) > 0.01) {
        setMessage({ show: true, text: `A soma dos destinos (R$ ${somaOrigensVal.toFixed(2)}) deve ser igual ao valor total (R$ ${valorTotal.toFixed(2)})!`, type: "error" });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
    }

    setIsLoadingVale(true);
    try {
      const resp = await axios.post(`${API_URL}/api/pdv-caixa-vale`, {
        valor: valorTotal,
        origens: origensPreenchidas.map((o) => ({ nome: o.nome, valor: parseFloat(o.valor) })),
        observacao: valeObservacao || null,
      });

      let successMsg = "Vale registrado com sucesso!";
      if (resp.data.isAdmin && resp.data.despesaPessoal) {
        successMsg += " Despesa criada no módulo Pessoal.";
      }
      setMessage({ show: true, text: successMsg, type: "success" });
      setValeValorTotal("");
      setValeOrigens([{ nome: "", valor: "" }]);
      setValeObservacao("");
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error("Erro ao registrar vale:", error);
      setMessage({ show: true, text: "Erro ao registrar vale!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsLoadingVale(false);
  };

  // PRÊMIO - handlers
  const handlePremioImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ show: true, text: "Selecione um arquivo de imagem válido!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ show: true, text: "Imagem muito grande! Máximo 5MB.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddOrigemPremio = () => {
    setPremioOrigens([...premioOrigens, { nome: "", valor: "" }]);
  };

  const handleRemoveOrigemPremio = (index) => {
    if (premioOrigens.length <= 1) return;
    setPremioOrigens(premioOrigens.filter((_, i) => i !== index));
  };

  const handleOrigemChangePremio = (index, field, value) => {
    const updated = [...premioOrigens];
    updated[index][field] = value;
    setPremioOrigens(updated);
  };

  const somaOrigensPremio = premioOrigens.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);

  const handlePremioAvancar = (toStep) => {
    if (toStep === 2 && !premioImagem1) {
      setMessage({ show: true, text: "Anexe a imagem de comprovação do ganho!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (toStep === 3) {
      if (!premioImagem2) {
        setMessage({ show: true, text: "Anexe a imagem de comprovação da baixa!", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      const valor = parseFloat(premioValor);
      if (!valor || valor <= 0) {
        setMessage({ show: true, text: "Informe o valor do prêmio!", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      const origensPreenchidas = premioOrigens.filter((o) => o.nome && parseFloat(o.valor) > 0);
      if (origensPreenchidas.length > 0) {
        const somaVal = origensPreenchidas.reduce((sum, o) => sum + parseFloat(o.valor), 0);
        if (Math.abs(somaVal - valor) > 0.01) {
          setMessage({ show: true, text: `A soma das origens (R$ ${somaVal.toFixed(2)}) deve ser igual ao valor (R$ ${valor.toFixed(2)})!`, type: "error" });
          setTimeout(() => setMessage(null), 5000);
          return;
        }
      }
    }
    setPremioStep(toStep);
  };

  const handleConfirmarPremio = async () => {
    setIsLoadingPremio(true);
    try {
      const origensPreenchidas = premioOrigens.filter((o) => o.nome && parseFloat(o.valor) > 0);
      await axios.post(`${API_URL}/api/pdv-premio`, {
        imagem1: premioImagem1,
        imagem2: premioImagem2,
        valor: parseFloat(premioValor),
        origens: origensPreenchidas.map((o) => ({ nome: o.nome, valor: parseFloat(o.valor) })),
        observacao: premioObservacao || null,
      });
      setMessage({ show: true, text: "Prêmio registrado com sucesso!", type: "success" });
      // Reset
      setPremioStep(1);
      setPremioImagem1(null);
      setPremioImagem2(null);
      setPremioValor("");
      setPremioOrigens([{ nome: "", valor: "" }]);
      setPremioObservacao("");
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error("Erro ao registrar prêmio:", error);
      setMessage({ show: true, text: "Erro ao registrar prêmio!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsLoadingPremio(false);
  };

  const handleCancelarPremio = () => {
    setPremioStep(1);
    setPremioImagem1(null);
    setPremioImagem2(null);
    setPremioValor("");
    setPremioOrigens([{ nome: "", valor: "" }]);
    setPremioObservacao("");
  };

  // CONFIG VENDA - fetchers
  const fetchCupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-cupons`);
      setCupons(res.data);
    } catch (e) { console.error("Erro ao buscar cupons:", e); }
  };

  const fetchTaxas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-taxas`);
      setTaxas(res.data);
    } catch (e) { console.error("Erro ao buscar taxas:", e); }
  };

  const fetchConfigLimites = async () => {
    try {
      let res = await axios.get(`${API_URL}/api/pdv-config`);
      if (res.data.length === 0) {
        await axios.post(`${API_URL}/api/pdv-config/init`);
        res = await axios.get(`${API_URL}/api/pdv-config`);
      }
      setConfigLimites(res.data);
    } catch (e) { console.error("Erro ao buscar config:", e); }
  };

  const fetchComandasPendentes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-comandas-pendentes`);
      setComandasPendentes(res.data);
    } catch (e) { console.error("Erro ao buscar comandas:", e); }
  };

  useEffect(() => {
    if (activeTab === "config") {
      fetchCupons();
      fetchTaxas();
      fetchConfigLimites();
      fetchComandasPendentes();
    }
  }, [activeTab]);

  // CONFIG VENDA - handlers Cupons
  const handleCriarCupom = async () => {
    if (!novoCupom.codigo || !novoCupom.valor) {
      setMessage({ show: true, text: "Código e valor são obrigatórios!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    try {
      await axios.post(`${API_URL}/api/pdv-cupons`, {
        ...novoCupom,
        valor: parseFloat(novoCupom.valor),
        limiteUso: novoCupom.limiteUso ? parseInt(novoCupom.limiteUso) : null,
        validoAte: novoCupom.validoAte || null,
      });
      setNovoCupom({ codigo: "", tipo: "PERCENTUAL", valor: "", descricao: "", validoAte: "", limiteUso: "" });
      fetchCupons();
      setMessage({ show: true, text: "Cupom criado!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Erro ao criar cupom!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleCupom = async (id, ativo) => {
    try {
      await axios.put(`${API_URL}/api/pdv-cupons/${id}`, { ativo: !ativo });
      fetchCupons();
    } catch (e) {
      setMessage({ show: true, text: "Erro ao atualizar cupom!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExcluirCupom = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pdv-cupons/${id}`);
      fetchCupons();
      setMessage({ show: true, text: "Cupom excluído!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: "Erro ao excluir cupom!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // CONFIG VENDA - handlers Taxas
  const handleCriarTaxa = async () => {
    if (!novaTaxa.nome || !novaTaxa.valor) {
      setMessage({ show: true, text: "Nome e valor são obrigatórios!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    try {
      await axios.post(`${API_URL}/api/pdv-taxas`, {
        ...novaTaxa,
        valor: parseFloat(novaTaxa.valor),
      });
      setNovaTaxa({ nome: "", tipo: "PERCENTUAL", valor: "" });
      fetchTaxas();
      setMessage({ show: true, text: "Taxa criada!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: "Erro ao criar taxa!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleTaxa = async (id, ativo) => {
    try {
      await axios.put(`${API_URL}/api/pdv-taxas/${id}`, { ativo: !ativo });
      fetchTaxas();
    } catch (e) {
      setMessage({ show: true, text: "Erro ao atualizar taxa!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExcluirTaxa = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pdv-taxas/${id}`);
      fetchTaxas();
      setMessage({ show: true, text: "Taxa excluída!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: "Erro ao excluir taxa!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // CONFIG VENDA - handlers Limites
  const handleSalvarLimite = async (chave, valor, descricao) => {
    try {
      await axios.put(`${API_URL}/api/pdv-config/${chave}`, { valor, descricao });
      fetchConfigLimites();
      setMessage({ show: true, text: "Configuração salva!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: "Erro ao salvar!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.value,
        quantity: 1,
        unit: product.unit
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setAmountReceived("");
    setChange(0);
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      setMessage({ show: true, text: "Carrinho vazio!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (paymentMethod === "dinheiro" && parseFloat(amountReceived) < total) {
      setMessage({ show: true, text: "Valor recebido insuficiente!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    
    const saleData = {
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      customerName: customerName || "Cliente não identificado",
      amountReceived: paymentMethod === "dinheiro" ? parseFloat(amountReceived) : total,
      change: paymentMethod === "dinheiro" ? change : 0,
      date: new Date().toISOString()
    };

    // Simular salvamento da venda
    axios
      .post(`${API_URL}/api/sales`, saleData)
      .then((response) => {
        setMessage({ show: true, text: "Venda realizada com sucesso!", type: "success" });
        clearCart();
        setShowPaymentModal(false);
        fetchProducts(); // Recarregar estoque atualizado
        setTimeout(() => setMessage(null), 3000);
      })
      .catch((error) => {
        console.error("Erro ao registrar venda:", error);
        const errorMsg = error.response?.data?.error || "Erro ao registrar venda!";
        setMessage({ show: true, text: errorMsg, type: "error" });
        setTimeout(() => setMessage(null), 5000);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const cancelPayment = () => {
    setShowPaymentModal(false);
    setAmountReceived("");
    setChange(0);
  };

  return (
    <div className="pdv-container">
      <h2 className="pdv-title">PDV - Ponto de Venda</h2>

      {/* Abas de sub-módulos */}
      <div className="pdv-tabs">
        <button className={`pdv-tab ${activeTab === "venda" ? "active" : ""}`} onClick={() => setActiveTab("venda")}>
          <FaCashRegister /> Venda
        </button>
        <button className={`pdv-tab ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>
          <FaPlus /> ADD
        </button>
        <button className={`pdv-tab ${activeTab === "vale" ? "active" : ""}`} onClick={() => setActiveTab("vale")}>
          <FaHandHoldingUsd /> Vale
        </button>
        <button className={`pdv-tab ${activeTab === "premio" ? "active" : ""}`} onClick={() => setActiveTab("premio")}>
          <FaTrophy /> Prêmio
        </button>
        <button className={`pdv-tab ${activeTab === "config" ? "active" : ""}`} onClick={() => setActiveTab("config")}>
          <FaSlidersH /> Config. Venda
        </button>
      </div>

      {/* ========== ABA VENDA ========== */}
      {activeTab === "venda" && (
      <div className="pdv-content">
        {/* Seção de Produtos */}
        <div className="products-section">
          <h3>Produtos</h3>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="products-grid">
            {filteredProducts.slice(0, 20).map((product) => (
              <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                <div className="product-namee">{product.name}</div>
                <div className="product-price">{formatCurrency(product.value)}</div>
                <div className="pdv-product-unit">{product.unit}</div>
                <div className="pdv-product-category">{product.category?.name || "Sem categoria"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção do Carrinho */}
        <div className="cart-section">
          <h3>Carrinho</h3>
          
          <div className="customer-input">
            <input
              type="text"
              placeholder="Nome do cliente (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">Carrinho vazio</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">{formatCurrency(item.price)}</div>
                  </div>
                  <div className="item-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="item-quantity">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total-section">
              <div className="total-label">Total:</div>
              <div className="total-value">{formatCurrency(total)}</div>
            </div>
            
            <div className="payment-method">
              <label>Forma de pagamento:</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="pix">PIX</option>
                <option value="fiado">Fiado</option>
              </select>
            </div>

            <div className="action-buttons">
              <button 
                className="clear-btn"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Limpar
              </button>
              <button 
                className="payment-btn"
                onClick={handlePayment}
                disabled={cart.length === 0}
              >
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========== ABA ADD ========== */}
      {activeTab === "add" && (
        <div className="pdv-add-section">
          <div className="pdv-add-card">
            <h3><FaPlus style={{ marginRight: 8 }} /> Adicionar Dinheiro ao Caixa</h3>

            <div className="pdv-add-field">
              <label>Quanto?</label>
              <div className="pdv-add-valor-input">
                <span className="pdv-currency-prefix">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={addValorTotal}
                  onChange={(e) => setAddValorTotal(e.target.value)}
                />
              </div>
            </div>

            <div className="pdv-add-field">
              <label>
                Origem(ns)
                <button className="pdv-origens-config-btn" onClick={() => setShowOrigensConfig(!showOrigensConfig)} title="Gerenciar origens">
                  <FaCog />
                </button>
              </label>

              {showOrigensConfig && (
                <div className="pdv-origens-config">
                  <div className="pdv-origens-config-header">
                    <input
                      type="text"
                      placeholder="Nova origem..."
                      value={novaOrigem}
                      onChange={(e) => setNovaOrigem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCriarOrigem()}
                    />
                    <button onClick={handleCriarOrigem} disabled={!novaOrigem.trim()}>+</button>
                  </div>
                  <ul className="pdv-origens-list">
                    {origensDisponiveis.map((o) => (
                      <li key={o.id}>
                        <span>{o.nome}</span>
                        <button onClick={() => handleExcluirOrigem(o.id)} className="pdv-origens-delete"><FaTrash /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {addOrigens.map((origem, index) => (
                <div key={index} className="pdv-add-origem-row">
                  <select
                    value={origem.nome}
                    onChange={(e) => handleOrigemChange(index, "nome", e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {origensDisponiveis.map((o) => (
                      <option key={o.id} value={o.nome}>{o.nome}</option>
                    ))}
                  </select>
                  <div className="pdv-add-origem-valor">
                    <span className="pdv-currency-prefix">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={origem.valor}
                      onChange={(e) => handleOrigemChange(index, "valor", e.target.value)}
                    />
                  </div>
                  {addOrigens.length > 1 && (
                    <button className="pdv-add-origem-remove" onClick={() => handleRemoveOrigem(index)}>✕</button>
                  )}
                </div>
              ))}

              <button className="pdv-add-mais-origem" onClick={handleAddOrigem}>
                <FaPlus size={10} /> Mais uma origem
              </button>

              {addOrigens.length > 0 && addValorTotal && (
                <div className={`pdv-add-soma-info ${Math.abs(somaOrigens - parseFloat(addValorTotal || 0)) < 0.01 ? "ok" : "erro"}`}>
                  Soma das origens: <strong>R$ {somaOrigens.toFixed(2)}</strong> / Total: <strong>R$ {parseFloat(addValorTotal || 0).toFixed(2)}</strong>
                  {Math.abs(somaOrigens - parseFloat(addValorTotal || 0)) < 0.01 ? " ✔" : " ✘"}
                </div>
              )}
            </div>

            <div className="pdv-add-field">
              <label>Observação (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Troco para início do dia"
                value={addObservacao}
                onChange={(e) => setAddObservacao(e.target.value)}
              />
            </div>

            <button className="pdv-add-confirmar" onClick={handleConfirmarAdd} disabled={isLoadingAdd}>
              {isLoadingAdd ? <FaSpinner className="loading-iconn" /> : "Confirmar Adição"}
            </button>
          </div>
        </div>
      )}

      {/* ========== ABA VALE ========== */}
      {activeTab === "vale" && (
        <div className="pdv-vale-section">
          <div className="pdv-vale-card">
            <h3><FaHandHoldingUsd style={{ marginRight: 8 }} /> Vale / Sangria</h3>
            <p className="pdv-vale-subtitle">Registre retiradas de dinheiro do caixa.</p>

            <div className="pdv-vale-field">
              <label>Quanto?</label>
              <div className="pdv-vale-valor-input">
                <span className="pdv-currency-prefix">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={valeValorTotal}
                  onChange={(e) => setValeValorTotal(e.target.value)}
                />
              </div>
            </div>

            <div className="pdv-vale-field">
              <label>
                Destino(s)
                <button className="pdv-origens-config-btn" onClick={() => setShowValeOrigensConfig(!showValeOrigensConfig)} title="Gerenciar origens">
                  <FaCog />
                </button>
              </label>

              {showValeOrigensConfig && (
                <div className="pdv-origens-config">
                  <div className="pdv-origens-config-header">
                    <input
                      type="text"
                      placeholder="Nova origem..."
                      value={novaOrigem}
                      onChange={(e) => setNovaOrigem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCriarOrigem()}
                    />
                    <button onClick={handleCriarOrigem} disabled={!novaOrigem.trim()}>+</button>
                  </div>
                  <ul className="pdv-origens-list">
                    {origensDisponiveis.map((o) => (
                      <li key={o.id}>
                        <span>{o.nome}</span>
                        <button onClick={() => handleExcluirOrigem(o.id)} className="pdv-origens-delete"><FaTrash /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {valeOrigens.map((origem, index) => (
                <div key={index} className="pdv-vale-origem-row">
                  <select
                    value={origem.nome}
                    onChange={(e) => handleOrigemChangeVale(index, "nome", e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {origensDisponiveis.map((o) => (
                      <option key={o.id} value={o.nome}>{o.nome}</option>
                    ))}
                  </select>
                  <div className="pdv-vale-origem-valor">
                    <span className="pdv-currency-prefix">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={origem.valor}
                      onChange={(e) => handleOrigemChangeVale(index, "valor", e.target.value)}
                    />
                  </div>
                  {valeOrigens.length > 1 && (
                    <button className="pdv-vale-origem-remove" onClick={() => handleRemoveOrigemVale(index)}>✕</button>
                  )}
                </div>
              ))}

              <button className="pdv-vale-mais-origem" onClick={handleAddOrigemVale}>
                <FaPlus size={10} /> Mais um destino
              </button>

              {valeOrigens.length > 0 && valeValorTotal && (
                <div className={`pdv-vale-soma-info ${Math.abs(somaOrigensVale - parseFloat(valeValorTotal || 0)) < 0.01 ? "ok" : "erro"}`}>
                  Soma dos destinos: <strong>R$ {somaOrigensVale.toFixed(2)}</strong> / Total: <strong>R$ {parseFloat(valeValorTotal || 0).toFixed(2)}</strong>
                  {Math.abs(somaOrigensVale - parseFloat(valeValorTotal || 0)) < 0.01 ? " ✔" : " ✘"}
                </div>
              )}
            </div>

            <div className="pdv-vale-field">
              <label>Observação (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Pagamento fornecedor, vale funcionário..."
                value={valeObservacao}
                onChange={(e) => setValeObservacao(e.target.value)}
              />
            </div>

            <div className="pdv-vale-info-admin">
              ⓘ Se você for administrador, este vale também será registrado como despesa no módulo <strong>Pessoal</strong>.
            </div>

            <button className="pdv-vale-confirmar" onClick={handleConfirmarVale} disabled={isLoadingVale}>
              {isLoadingVale ? <FaSpinner className="loading-iconn" /> : "Confirmar Vale"}
            </button>
          </div>
        </div>
      )}

      {/* ========== ABA PRÊMIO ========== */}
      {activeTab === "premio" && (
        <div className="pdv-premio-section">
          <div className="pdv-premio-card">
            <h3><FaTrophy style={{ marginRight: 8 }} /> Registrar Prêmio</h3>

            {/* Indicador de etapas */}
            <div className="pdv-premio-steps">
              <div className={`pdv-premio-step-dot ${premioStep >= 1 ? "active" : ""} ${premioStep > 1 ? "done" : ""}`}>
                {premioStep > 1 ? <FaCheck size={10} /> : "1"}
              </div>
              <div className={`pdv-premio-step-line ${premioStep >= 2 ? "active" : ""}`} />
              <div className={`pdv-premio-step-dot ${premioStep >= 2 ? "active" : ""} ${premioStep > 2 ? "done" : ""}`}>
                {premioStep > 2 ? <FaCheck size={10} /> : "2"}
              </div>
              <div className={`pdv-premio-step-line ${premioStep >= 3 ? "active" : ""}`} />
              <div className={`pdv-premio-step-dot ${premioStep >= 3 ? "active" : ""}`}>
                3
              </div>
            </div>
            <div className="pdv-premio-step-labels">
              <span className={premioStep === 1 ? "active" : ""}>Comprovante do Ganho</span>
              <span className={premioStep === 2 ? "active" : ""}>Baixa + Valor</span>
              <span className={premioStep === 3 ? "active" : ""}>Confirmação</span>
            </div>

            {/* ETAPA 1: Imagem do ganho */}
            {premioStep === 1 && (
              <div className="pdv-premio-step-content">
                <p className="pdv-premio-step-desc">Anexe a foto que comprova o ganho do cliente no caça-níquel.</p>
                <div className="pdv-premio-upload-area">
                  {premioImagem1 ? (
                    <div className="pdv-premio-preview">
                      <img src={premioImagem1} alt="Comprovante do ganho" />
                      <button className="pdv-premio-preview-remove" onClick={() => setPremioImagem1(null)}>✕</button>
                    </div>
                  ) : (
                    <label className="pdv-premio-upload-label">
                      <FaCamera size={28} />
                      <span>Clique ou toque para anexar imagem</span>
                      <small>JPG, PNG — Máx. 5MB</small>
                      <input type="file" accept="image/*" onChange={(e) => handlePremioImageUpload(e, setPremioImagem1)} hidden />
                    </label>
                  )}
                </div>
                <div className="pdv-premio-step-actions">
                  <button className="pdv-premio-btn-next" onClick={() => handlePremioAvancar(2)} disabled={!premioImagem1}>
                    Avançar <FaArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: Imagem da baixa + valor + origens */}
            {premioStep === 2 && (
              <div className="pdv-premio-step-content">
                <p className="pdv-premio-step-desc">Anexe a foto que comprova a baixa do valor no jogo, informe o valor e a(s) origem(ns).</p>

                <div className="pdv-premio-upload-area">
                  {premioImagem2 ? (
                    <div className="pdv-premio-preview">
                      <img src={premioImagem2} alt="Comprovante da baixa" />
                      <button className="pdv-premio-preview-remove" onClick={() => setPremioImagem2(null)}>✕</button>
                    </div>
                  ) : (
                    <label className="pdv-premio-upload-label">
                      <FaCamera size={28} />
                      <span>Clique ou toque para anexar imagem</span>
                      <small>JPG, PNG — Máx. 5MB</small>
                      <input type="file" accept="image/*" onChange={(e) => handlePremioImageUpload(e, setPremioImagem2)} hidden />
                    </label>
                  )}
                </div>

                <div className="pdv-premio-field">
                  <label>Valor do Prêmio</label>
                  <div className="pdv-premio-valor-input">
                    <span className="pdv-currency-prefix">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={premioValor}
                      onChange={(e) => setPremioValor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pdv-premio-field">
                  <label>
                    Origem(ns) do pagamento
                    <button className="pdv-origens-config-btn" onClick={() => setShowPremioOrigensConfig(!showPremioOrigensConfig)} title="Gerenciar origens">
                      <FaCog />
                    </button>
                  </label>

                  {showPremioOrigensConfig && (
                    <div className="pdv-origens-config">
                      <div className="pdv-origens-config-header">
                        <input
                          type="text"
                          placeholder="Nova origem..."
                          value={novaOrigem}
                          onChange={(e) => setNovaOrigem(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCriarOrigem()}
                        />
                        <button onClick={handleCriarOrigem} disabled={!novaOrigem.trim()}>+</button>
                      </div>
                      <ul className="pdv-origens-list">
                        {origensDisponiveis.map((o) => (
                          <li key={o.id}>
                            <span>{o.nome}</span>
                            <button onClick={() => handleExcluirOrigem(o.id)} className="pdv-origens-delete"><FaTrash /></button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {premioOrigens.map((origem, index) => (
                    <div key={index} className="pdv-premio-origem-row">
                      <select
                        value={origem.nome}
                        onChange={(e) => handleOrigemChangePremio(index, "nome", e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {origensDisponiveis.map((o) => (
                          <option key={o.id} value={o.nome}>{o.nome}</option>
                        ))}
                      </select>
                      <div className="pdv-premio-origem-valor">
                        <span className="pdv-currency-prefix">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={origem.valor}
                          onChange={(e) => handleOrigemChangePremio(index, "valor", e.target.value)}
                        />
                      </div>
                      {premioOrigens.length > 1 && (
                        <button className="pdv-premio-origem-remove" onClick={() => handleRemoveOrigemPremio(index)}>✕</button>
                      )}
                    </div>
                  ))}

                  <button className="pdv-premio-mais-origem" onClick={handleAddOrigemPremio}>
                    <FaPlus size={10} /> Mais uma origem
                  </button>

                  {premioOrigens.length > 0 && premioValor && (
                    <div className={`pdv-premio-soma-info ${Math.abs(somaOrigensPremio - parseFloat(premioValor || 0)) < 0.01 ? "ok" : "erro"}`}>
                      Soma das origens: <strong>R$ {somaOrigensPremio.toFixed(2)}</strong> / Total: <strong>R$ {parseFloat(premioValor || 0).toFixed(2)}</strong>
                      {Math.abs(somaOrigensPremio - parseFloat(premioValor || 0)) < 0.01 ? " ✔" : " ✘"}
                    </div>
                  )}
                </div>

                <div className="pdv-premio-field">
                  <label>Observação (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Cliente João, máquina 3..."
                    value={premioObservacao}
                    onChange={(e) => setPremioObservacao(e.target.value)}
                  />
                </div>

                <div className="pdv-premio-step-actions dual">
                  <button className="pdv-premio-btn-back" onClick={() => setPremioStep(1)}>
                    <FaArrowLeft size={12} /> Voltar
                  </button>
                  <button className="pdv-premio-btn-next" onClick={() => handlePremioAvancar(3)}>
                    Revisar <FaArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: Confirmação */}
            {premioStep === 3 && (
              <div className="pdv-premio-step-content">
                <p className="pdv-premio-step-desc">Revise as informações antes de confirmar:</p>

                <div className="pdv-premio-confirm-grid">
                  <div className="pdv-premio-confirm-img">
                    <span className="pdv-premio-confirm-label"><FaImage size={12} /> Comprovante do Ganho</span>
                    {premioImagem1 && <img src={premioImagem1} alt="Ganho" />}
                  </div>
                  <div className="pdv-premio-confirm-img">
                    <span className="pdv-premio-confirm-label"><FaImage size={12} /> Comprovante da Baixa</span>
                    {premioImagem2 && <img src={premioImagem2} alt="Baixa" />}
                  </div>
                </div>

                <div className="pdv-premio-confirm-info">
                  <div className="pdv-premio-confirm-row">
                    <span>Valor do Prêmio:</span>
                    <strong>R$ {parseFloat(premioValor || 0).toFixed(2)}</strong>
                  </div>
                  {premioOrigens.filter(o => o.nome && o.valor).length > 0 && (
                    <div className="pdv-premio-confirm-row">
                      <span>Origens:</span>
                      <strong>{premioOrigens.filter(o => o.nome && o.valor).map(o => `${o.nome} (R$ ${parseFloat(o.valor).toFixed(2)})`).join(", ")}</strong>
                    </div>
                  )}
                  {premioObservacao && (
                    <div className="pdv-premio-confirm-row">
                      <span>Observação:</span>
                      <strong>{premioObservacao}</strong>
                    </div>
                  )}
                </div>

                <div className="pdv-premio-step-actions dual">
                  <button className="pdv-premio-btn-back" onClick={() => setPremioStep(2)}>
                    <FaArrowLeft size={12} /> Voltar
                  </button>
                  <button className="pdv-premio-btn-confirm" onClick={handleConfirmarPremio} disabled={isLoadingPremio}>
                    {isLoadingPremio ? <FaSpinner className="loading-iconn" /> : <><FaCheck size={12} /> Confirmar Prêmio</>}
                  </button>
                </div>

                <button className="pdv-premio-btn-cancelar" onClick={handleCancelarPremio}>
                  Cancelar e recomeçar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== ABA CONFIG. VENDA ========== */}
      {activeTab === "config" && (
        <div className="pdv-config-section">
          <div className="pdv-config-card">
            <h3><FaSlidersH style={{ marginRight: 8 }} /> Configuração de Venda</h3>

            {/* Sub-tabs */}
            <div className="pdv-config-subtabs">
              <button className={configSubTab === "cupons" ? "active" : ""} onClick={() => setConfigSubTab("cupons")}>Cupons</button>
              <button className={configSubTab === "comandas" ? "active" : ""} onClick={() => setConfigSubTab("comandas")}>Comandas</button>
              <button className={configSubTab === "taxas" ? "active" : ""} onClick={() => setConfigSubTab("taxas")}>Taxas</button>
              <button className={configSubTab === "limites" ? "active" : ""} onClick={() => setConfigSubTab("limites")}>Limites</button>
            </div>

            {/* ---- CUPONS ---- */}
            {configSubTab === "cupons" && (
              <div className="pdv-config-panel">
                <div className="pdv-config-form-row">
                  <input placeholder="Código" value={novoCupom.codigo} onChange={(e) => setNovoCupom({ ...novoCupom, codigo: e.target.value })} />
                  <select value={novoCupom.tipo} onChange={(e) => setNovoCupom({ ...novoCupom, tipo: e.target.value })}>
                    <option value="PERCENTUAL">% Desconto</option>
                    <option value="FIXO">R$ Fixo</option>
                  </select>
                  <input type="number" placeholder="Valor" step="0.01" value={novoCupom.valor} onChange={(e) => setNovoCupom({ ...novoCupom, valor: e.target.value })} />
                </div>
                <div className="pdv-config-form-row">
                  <input placeholder="Descrição (opcional)" value={novoCupom.descricao} onChange={(e) => setNovoCupom({ ...novoCupom, descricao: e.target.value })} />
                  <input type="date" placeholder="Válido até" value={novoCupom.validoAte} onChange={(e) => setNovoCupom({ ...novoCupom, validoAte: e.target.value })} />
                  <input type="number" placeholder="Limite uso" min="1" value={novoCupom.limiteUso} onChange={(e) => setNovoCupom({ ...novoCupom, limiteUso: e.target.value })} />
                  <button className="pdv-config-btn-add" onClick={handleCriarCupom}><FaPlus /> Criar</button>
                </div>

                {cupons.length === 0 ? (
                  <p className="pdv-config-empty">Nenhum cupom cadastrado.</p>
                ) : (
                  <div className="pdv-config-table-wrap">
                    <table className="pdv-config-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Validade</th>
                          <th>Uso</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cupons.map((c) => (
                          <tr key={c.id} className={!c.ativo ? "pdv-config-row-disabled" : ""}>
                            <td><strong>{c.codigo}</strong></td>
                            <td>{c.tipo === "PERCENTUAL" ? "%" : "R$"}</td>
                            <td>{c.tipo === "PERCENTUAL" ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}</td>
                            <td>{c.validoAte ? new Date(c.validoAte).toLocaleDateString("pt-BR") : "∞"}</td>
                            <td>{c.vezesUsado}{c.limiteUso ? `/${c.limiteUso}` : "/∞"}</td>
                            <td>
                              <span className={`pdv-config-badge ${c.ativo ? "ativo" : "inativo"}`}>
                                {c.ativo ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                            <td className="pdv-config-actions">
                              <button onClick={() => handleToggleCupom(c.id, c.ativo)} title={c.ativo ? "Desativar" : "Ativar"}>
                                {c.ativo ? "⏸" : "▶"}
                              </button>
                              <button onClick={() => handleExcluirCupom(c.id)} className="delete" title="Excluir">🗑</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ---- COMANDAS ---- */}
            {configSubTab === "comandas" && (
              <div className="pdv-config-panel">
                <p className="pdv-config-panel-desc">Clientes com comandas abertas (débito &gt; 0):</p>
                {comandasPendentes.length === 0 ? (
                  <p className="pdv-config-empty">Nenhuma comanda pendente.</p>
                ) : (
                  <div className="pdv-config-table-wrap">
                    <table className="pdv-config-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Débito</th>
                          <th>Última compra</th>
                          <th>Último pagamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comandasPendentes.map((c) => {
                          const limiteConfig = configLimites.find(l => l.chave === "limite_comanda");
                          const limite = limiteConfig ? parseFloat(limiteConfig.valor) : null;
                          const excedeu = limite && c.totalDebt > limite;
                          return (
                            <tr key={c.id} className={excedeu ? "pdv-config-row-alert" : ""}>
                              <td><strong>{c.name}</strong></td>
                              <td className={excedeu ? "pdv-config-valor-alert" : ""}>
                                R$ {c.totalDebt.toFixed(2)}
                                {excedeu && <span className="pdv-config-badge alerta" title="Excedeu o limite"> !</span>}
                              </td>
                              <td>{c.Purchase.length > 0 ? new Date(c.Purchase[0].createdAt).toLocaleDateString("pt-BR") : "—"}</td>
                              <td>{c.Payment.length > 0 ? new Date(c.Payment[0].createdAt).toLocaleDateString("pt-BR") : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="pdv-config-comandas-summary">
                  <span>Total pendente: <strong>R$ {comandasPendentes.reduce((s, c) => s + c.totalDebt, 0).toFixed(2)}</strong></span>
                  <span>Comandas abertas: <strong>{comandasPendentes.length}</strong></span>
                </div>
              </div>
            )}

            {/* ---- TAXAS ---- */}
            {configSubTab === "taxas" && (
              <div className="pdv-config-panel">
                <div className="pdv-config-form-row">
                  <input placeholder="Nome da taxa" value={novaTaxa.nome} onChange={(e) => setNovaTaxa({ ...novaTaxa, nome: e.target.value })} />
                  <select value={novaTaxa.tipo} onChange={(e) => setNovaTaxa({ ...novaTaxa, tipo: e.target.value })}>
                    <option value="PERCENTUAL">% Percentual</option>
                    <option value="FIXO">R$ Fixo</option>
                  </select>
                  <input type="number" placeholder="Valor" step="0.01" value={novaTaxa.valor} onChange={(e) => setNovaTaxa({ ...novaTaxa, valor: e.target.value })} />
                  <button className="pdv-config-btn-add" onClick={handleCriarTaxa}><FaPlus /> Criar</button>
                </div>

                {taxas.length === 0 ? (
                  <p className="pdv-config-empty">Nenhuma taxa cadastrada.</p>
                ) : (
                  <div className="pdv-config-table-wrap">
                    <table className="pdv-config-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxas.map((t) => (
                          <tr key={t.id} className={!t.ativo ? "pdv-config-row-disabled" : ""}>
                            <td><strong>{t.nome}</strong></td>
                            <td>{t.tipo === "PERCENTUAL" ? "%" : "R$"}</td>
                            <td>{t.tipo === "PERCENTUAL" ? `${t.valor}%` : `R$ ${t.valor.toFixed(2)}`}</td>
                            <td>
                              <span className={`pdv-config-badge ${t.ativo ? "ativo" : "inativo"}`}>
                                {t.ativo ? "Ativa" : "Inativa"}
                              </span>
                            </td>
                            <td className="pdv-config-actions">
                              <button onClick={() => handleToggleTaxa(t.id, t.ativo)} title={t.ativo ? "Desativar" : "Ativar"}>
                                {t.ativo ? "⏸" : "▶"}
                              </button>
                              <button onClick={() => handleExcluirTaxa(t.id)} className="delete" title="Excluir">🗑</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ---- LIMITES ---- */}
            {configSubTab === "limites" && (
              <div className="pdv-config-panel">
                <p className="pdv-config-panel-desc">Defina os limites e regras para comandas e vendas:</p>
                {configLimites.map((cfg) => (
                  <div key={cfg.id} className="pdv-config-limite-row">
                    <div className="pdv-config-limite-info">
                      <strong>{cfg.chave.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</strong>
                      {cfg.descricao && <small>{cfg.descricao}</small>}
                    </div>
                    <div className="pdv-config-limite-input">
                      <input
                        type="number"
                        value={cfg.valor}
                        onChange={(e) => {
                          setConfigLimites(configLimites.map(c => c.id === cfg.id ? { ...c, valor: e.target.value } : c));
                        }}
                      />
                      <button onClick={() => handleSalvarLimite(cfg.chave, cfg.valor, cfg.descricao)}>Salvar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="modal">
          <div className="modal-content payment-modal">
            <h3>Finalizar Pagamento</h3>
            
            <div className="payment-summary">
              <div className="summary-row">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="summary-row">
                <span>Forma de pagamento:</span>
                <span>{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
              </div>
              <div className="summary-row">
                <span>Cliente:</span>
                <span>{customerName || "Cliente não identificado"}</span>
              </div>
            </div>

            {paymentMethod === "dinheiro" && (
              <div className="cash-payment">
                <label>Valor recebido:</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0,00"
                />
                <div className="change-display">
                  <span>Troco: {formatCurrency(change)}</span>
                </div>
              </div>
            )}

            <div className="modal-buttons">
              <button 
                onClick={confirmPayment} 
                disabled={isLoading || (paymentMethod === "dinheiro" && parseFloat(amountReceived) < total)}
              >
                {isLoading ? <FaSpinner className="loading-iconn" /> : "Confirmar Pagamento"}
              </button>
              <button onClick={cancelPayment}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
};

export default PDV;
