import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { FaSpinner, FaPlus, FaCashRegister, FaCog, FaTrash, FaHandHoldingUsd, FaTrophy, FaSlidersH, FaCamera, FaCheck, FaArrowRight, FaArrowLeft, FaImage, FaTag, FaLock, FaUserPlus, FaSearch, FaEye, FaTimes, FaMoneyBillWave, FaExclamationTriangle, FaHistory, FaDoorOpen, FaDoorClosed, FaArrowDown, FaArrowUp, FaGlassWhiskey, FaPercent, FaUserTie, FaBoxOpen, FaLayerGroup, FaWhatsapp, FaShoppingBag, FaMapMarkerAlt, FaPhone, FaClock } from "react-icons/fa";
import "./PDV.css";
import Message from "./Message";
import { AuthContext } from "./AuthContext";

const API_URL = "https://api-start-pira-qa.vercel.app";

const PDV = () => {
  const { auth } = useContext(AuthContext);

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

  // ADD
  const [addValorTotal, setAddValorTotal] = useState("");
  const [addOrigens, setAddOrigens] = useState([{ nome: "", valor: "" }]);
  const [origensDisponiveis, setOrigensDisponiveis] = useState([]);
  const [addObservacao, setAddObservacao] = useState("");
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [showOrigensConfig, setShowOrigensConfig] = useState(false);
  const [novaOrigem, setNovaOrigem] = useState("");

  // VALE
  const [valeValorTotal, setValeValorTotal] = useState("");
  const [valeOrigens, setValeOrigens] = useState([{ nome: "", valor: "" }]);
  const [valeObservacao, setValeObservacao] = useState("");
  const [isLoadingVale, setIsLoadingVale] = useState(false);
  const [showValeOrigensConfig, setShowValeOrigensConfig] = useState(false);

  // PRÊMIO
  const [premioStep, setPremioStep] = useState(1); // 1=img1, 2=img2+valor+origens, 3=confirmação
  const [premioImagem1, setPremioImagem1] = useState(null); // base64
  const [premioImagem2, setPremioImagem2] = useState(null); // base64
  const [premioValor, setPremioValor] = useState("");
  const [premioOrigens, setPremioOrigens] = useState([{ nome: "", valor: "" }]);
  const [premioObservacao, setPremioObservacao] = useState("");
  const [isLoadingPremio, setIsLoadingPremio] = useState(false);
  const [showPremioOrigensConfig, setShowPremioOrigensConfig] = useState(false);

  // CONFIG VENDA
  const [configSubTab, setConfigSubTab] = useState("cupons"); // cupons, comandas, taxas, limites, pagamentos, origens
  const [vendaRightTab, setVendaRightTab] = useState("carrinho"); // carrinho | saque

  // SAQUE (troco via máquina)
  const [saqueValor, setSaqueValor] = useState("");
  const [saqueObservacao, setSaqueObservacao] = useState("");
  const [isLoadingSaque, setIsLoadingSaque] = useState(false);
  const [taxaSaque, setTaxaSaque] = useState(30); // percentual, ex: 30 = 30%
  const [taxaSaqueInput, setTaxaSaqueInput] = useState("");
  const [isLoadingTaxaSaque, setIsLoadingTaxaSaque] = useState(false);

  // ORIGENS DE SALDO (BAG / MÁQUINA / CAIXA)
  const [origemSaldos, setOrigemSaldos] = useState([]);
  const [origemManualNome, setOrigemManualNome] = useState("BAG");
  const [origemManualTipo, setOrigemManualTipo] = useState("ENTRADA");
  const [origemManualValor, setOrigemManualValor] = useState("");
  const [origemManualDesc, setOrigemManualDesc] = useState("");
  const [isLoadingOrigemSaldo, setIsLoadingOrigemSaldo] = useState(false);
  const [origemHistoricoNome, setOrigemHistoricoNome] = useState(null);
  const [origemHistoricoMovs, setOrigemHistoricoMovs] = useState([]);
  const [isLoadingOrigemHistorico, setIsLoadingOrigemHistorico] = useState(false);
  // transferência entre origens
  const [transferenciaFrom, setTransferenciaFrom] = useState("BAG");
  const [transferenciaTo, setTransferenciaTo] = useState("MÁQUINA");
  const [transferenciaValor, setTransferenciaValor] = useState("");
  const [transferenciaDesc, setTransferenciaDesc] = useState("");
  const [isLoadingTransferencia, setIsLoadingTransferencia] = useState(false);
  const [cupons, setCupons] = useState([]);
  const [novoCupom, setNovoCupom] = useState({ codigo: "", tipo: "PERCENTUAL", valor: "", descricao: "", validoAte: "", limiteUso: "" });
  const [editCupomId, setEditCupomId] = useState(null);
  const [taxas, setTaxas] = useState([]);
  const [novaTaxa, setNovaTaxa] = useState({ nome: "", tipo: "PERCENTUAL", valor: "" });
  const [editTaxaId, setEditTaxaId] = useState(null);
  const [configLimites, setConfigLimites] = useState([]);
  const [comandasPendentes, setComandasPendentes] = useState([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // FORMAS DE PAGAMENTO
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [novaFormaPagamento, setNovaFormaPagamento] = useState("");

  // DESCONTO/CUPOM
  const [descontoTipo, setDescontoTipo] = useState("");
  const [descontoValor, setDescontoValor] = useState("");
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [isValidatingCupom, setIsValidatingCupom] = useState(false);

  // PAGAMENTO AVANÇADO
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState([{ forma: "", valor: "" }]);
  const [clientesFiado, setClientesFiado] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientName, setNewClientName] = useState("");
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [valePassword, setValePassword] = useState("");
  const [valePasswordVerified, setValePasswordVerified] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // COMANDAS MODAL
  const [showComandasModal, setShowComandasModal] = useState(false);
  const [comandasClienteDetail, setComandasClienteDetail] = useState(null);
  const [isLoadingComandas, setIsLoadingComandas] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [showFecharComandaModal, setShowFecharComandaModal] = useState(false);
  const [comandaParaFechar, setComandaParaFechar] = useState(null);
  const [fecharFormaPagamento, setFecharFormaPagamento] = useState("dinheiro");
  const [isClosingComanda, setIsClosingComanda] = useState(false);
  const [comandasSearchTerm, setComandasSearchTerm] = useState("");
  const [isLoadingComandasTab, setIsLoadingComandasTab] = useState(false);
  const [comandaEmPagamento, setComandaEmPagamento] = useState(null); // comanda sendo paga via PDV
  const [comandaClienteNome, setComandaClienteNome] = useState(""); // nome do cliente da comanda

  // ADICIONAR ITENS À COMANDA
  const [showAddItemComandaModal, setShowAddItemComandaModal] = useState(false);
  const [comandaParaAdicionarItens, setComandaParaAdicionarItens] = useState(null);
  const [addItemComandaSearch, setAddItemComandaSearch] = useState("");
  const [addItemComandaCart, setAddItemComandaCart] = useState([]);
  const [isAddingItemsComanda, setIsAddingItemsComanda] = useState(false);

  // CAIXA CONTROLE
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [caixaHistorico, setCaixaHistorico] = useState([]);
  const [isLoadingCaixa, setIsLoadingCaixa] = useState(false);
  const [showAbrirCaixaModal, setShowAbrirCaixaModal] = useState(false);
  const [showFecharCaixaModal, setShowFecharCaixaModal] = useState(false);
  const [caixaSaldoInicial, setCaixaSaldoInicial] = useState("");
  const [caixaObsAbrir, setCaixaObsAbrir] = useState("");
  const [caixaObsFechar, setCaixaObsFechar] = useState("");
  const [caixaOrigemBAG, setCaixaOrigemBAG] = useState("");
  const [caixaOrigemMAQUINA, setCaixaOrigemMAQUINA] = useState("");
  const [showTransacaoForm, setShowTransacaoForm] = useState(false);
  const [transacaoTipo, setTransacaoTipo] = useState("ENTRADA");
  const [transacaoCategoria, setTransacaoCategoria] = useState("");
  const [transacaoValor, setTransacaoValor] = useState("");
  const [transacaoDescricao, setTransacaoDescricao] = useState("");
  const [isSubmittingTransacao, setIsSubmittingTransacao] = useState(false);
  const [caixaSubTab, setCaixaSubTab] = useState("atual"); // "atual", "historico"
  const [caixaAlerta, setCaixaAlerta] = useState(false);

  // GASTOS BAR
  const [gastosBarSemanas, setGastosBarSemanas] = useState([]);
  const [gastosBarResumo, setGastosBarResumo] = useState([]);
  const [isLoadingGastosBar, setIsLoadingGastosBar] = useState(false);
  const [gastosBarSubView, setGastosBarSubView] = useState("semanas"); // "semanas" ou "funcionarios"

  // Seleção de unidade por grupo de produto (productId → estoqueId selecionado)
  const [selectedProductUnits, setSelectedProductUnits] = useState({});

  // ===== COMPOSIÇÃO =====
  const [compModalProduct, setCompModalProduct] = useState(null);
  const [compSelections, setCompSelections] = useState({}); // { composicaoId: [opcaoId, ...] }

  // ===== ÚLTIMOS PEDIDOS =====
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(false);
  const [pedidoDetalhe, setPedidoDetalhe] = useState(null);
  const [pedidosFiltro, setPedidosFiltro] = useState(""); // busca por cliente
  const [pedidosDataInicio, setPedidosDataInicio] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0];
  });
  const [pedidosDataFim, setPedidosDataFim] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0];
  });

  // ===== PEDIDOS ONLINE (sub-aba de gerenciamento) =====
  const [pedidosSubTab, setPedidosSubTab] = useState("historico"); // "historico" | "online"
  const [pedidosOnline, setPedidosOnline] = useState([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [onlineStatusFiltro, setOnlineStatusFiltro] = useState(""); // "" = todos
  const [onlineDetalhe, setOnlineDetalhe] = useState(null);
  const [atualizandoStatusId, setAtualizandoStatusId] = useState(null);

  // ===== EQUIVALÊNCIAS DE UNIDADES (para conversão automática) =====
  const [unitEquivalences, setUnitEquivalences] = useState({});

  // ===== FOLLOW-UP (descartáveis) =====
  const [followUpPendentes, setFollowUpPendentes] = useState([]);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpIdx, setFollowUpIdx] = useState(0);
  const [followUpRespostas, setFollowUpRespostas] = useState({}); // id → { temEstoque, quantidade, observacao }
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  useEffect(() => {
    // Buscar produtos da API quando o componente for montado
    fetchProducts();
    fetchOrigens();
    fetchFormasPagamento();
    fetchCaixaAtual();
    fetchUltimosPedidos();
    fetchUnitEquivalences();
    iniciarFollowUp();
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

  // Calcular desconto e total final
  const calcDesconto = () => {
    if (cupomAplicado) {
      if (cupomAplicado.tipo === "PERCENTUAL") return total * (cupomAplicado.valor / 100);
      return Math.min(cupomAplicado.valor, total);
    }
    if (descontoTipo === "percentual" && descontoValor) return total * (parseFloat(descontoValor) / 100);
    if (descontoTipo === "fixo" && descontoValor) return Math.min(parseFloat(descontoValor), total);
    return 0;
  };
  const desconto = calcDesconto();
  const finalTotal = Math.max(total - desconto, 0);
  const somaSplit = splitPayments.reduce((sum, s) => sum + (parseFloat(s.valor) || 0), 0);

  const getFormaNome = (valor) => {
    const f = formasPagamento.find(fp => fp.valor === valor);
    return f ? f.nome : (valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : "");
  };

  useEffect(() => {
    // Calcular troco
    const receivedAmount = parseFloat(amountReceived) || 0;
    setChange(receivedAmount - finalTotal);
  }, [amountReceived, finalTotal]);

  const fetchProducts = () => {
    axios
      .get(`${API_URL}/api/estoque_prod`)
      .then((response) => {
        // Excluir itens que são apenas componentes de composição (vinculados via composicaoOpcoes)
        const vendiveis = response.data.filter(p => !(p._count?.composicaoOpcoes > 0));
        setProducts(vendiveis);
        setFilteredProducts(vendiveis);
        
        // Sincronizar maxQuantity dos itens no carrinho com o estoque atual
        setCart(prevCart => 
          prevCart.map(cartItem => {
            const productData = vendiveis.find(p => p.id === cartItem.id);
            if (productData) {
              return { ...cartItem, maxQuantity: productData.quantity };
            }
            return cartItem;
          })
        );
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
        setMessage({ show: true, text: "Erro ao carregar produtos!", type: "error" });
        setTimeout(() => setMessage(null), 3000);
      });
  };

  const fetchUnitEquivalences = () => {
    axios
      .get(`${API_URL}/api/unit-equivalences`)
      .then((response) => {
        const map = {};
        response.data.forEach(e => { map[e.unitName] = e.value; });
        setUnitEquivalences(map);
      })
      .catch((error) => {
        console.error("Erro ao buscar equivalências de unidades:", error);
      });
  };

  const iniciarFollowUp = async () => {
    try {
      // Gerar follow-ups da semana (idempotente) e buscar pendentes
      await axios.post(`${API_URL}/api/followup/gerar-semana`, {}, {
        headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}
      });
      const res = await axios.get(`${API_URL}/api/followup/pendentes`);
      if (res.data.length > 0) {
        setFollowUpPendentes(res.data);
        setFollowUpIdx(0);
        setFollowUpRespostas({});
        setShowFollowUpModal(true);
      }
    } catch (e) {
      console.error("Erro ao iniciar follow-up:", e);
    }
  };

  const fetchOrigens = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pdv-origens`);
      setOrigensDisponiveis(response.data);
    } catch (error) {
      console.error("Erro ao buscar origens:", error);
    }
  };

  const fetchFormasPagamento = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pdv-formas-pagamento`);
      setFormasPagamento(response.data);
      if (response.data.length === 0) {
        await axios.post(`${API_URL}/api/pdv-formas-pagamento/init`);
        const updated = await axios.get(`${API_URL}/api/pdv-formas-pagamento`);
        setFormasPagamento(updated.data);
      }
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
    }
  };

  const handleCriarFormaPagamento = async () => {
    if (!novaFormaPagamento.trim()) return;
    try {
      await axios.post(`${API_URL}/api/pdv-formas-pagamento`, { nome: novaFormaPagamento.trim() });
      setNovaFormaPagamento("");
      fetchFormasPagamento();
      setMessage({ show: true, text: "Forma de pagamento criada!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Erro ao criar forma de pagamento!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleFormaPagamento = async (id, ativo) => {
    try {
      await axios.put(`${API_URL}/api/pdv-formas-pagamento/${id}`, { ativo: !ativo });
      fetchFormasPagamento();
    } catch (e) {
      setMessage({ show: true, text: "Erro ao atualizar forma de pagamento!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExcluirFormaPagamento = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pdv-formas-pagamento/${id}`);
      fetchFormasPagamento();
      setMessage({ show: true, text: "Forma de pagamento excluída!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: "Erro ao excluir forma de pagamento!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // CLIENTES FIADO - fetch para fluxo Pendente
  const fetchClientesFiado = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients`);
      setClientesFiado(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const handleCadastrarClienteInline = async () => {
    if (!newClientName.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/api/clients`, { name: newClientName.trim(), totalDebt: 0 });
      setClientesFiado([...clientesFiado, res.data]);
      setSelectedClient(res.data);
      setCustomerName(res.data.name);
      setNewClientName("");
      setShowNewClientInput(false);
      setMessage({ show: true, text: "Cliente cadastrado!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: "Erro ao cadastrar cliente!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // COMANDAS - ver detalhe do cliente (purchases/payments)
  const fetchClienteDetail = async (clientId) => {
    setIsLoadingComandas(true);
    try {
      const res = await axios.get(`${API_URL}/api/clients/${clientId}`);
      setComandasClienteDetail(res.data);
      setShowComandasModal(true);
    } catch (error) {
      setMessage({ show: true, text: "Erro ao buscar dados do cliente!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsLoadingComandas(false);
  };

  // CUPOM - validar
  const handleAplicarCupom = async () => {
    if (!cupomCodigo.trim()) return;
    setIsValidatingCupom(true);
    try {
      const res = await axios.post(`${API_URL}/api/pdv-cupons/validar`, { codigo: cupomCodigo.trim() });
      setCupomAplicado(res.data);
      setDescontoTipo("");
      setDescontoValor("");
      setMessage({ show: true, text: `Cupom "${res.data.codigo}" aplicado!`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Cupom inválido!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsValidatingCupom(false);
  };

  const handleRemoverCupom = () => {
    setCupomAplicado(null);
    setCupomCodigo("");
  };

  // VALE - verificar senha (usa token JWT para identificar o usuário)
  const handleVerifyPassword = async () => {
    if (!valePassword) return;
    setIsVerifyingPassword(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/verify-vale-password`, { password: valePassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setValePasswordVerified(true);
      setMessage({ show: true, text: "Senha verificada!", type: "success" });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Senha incorreta!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsVerifyingPassword(false);
  };

  // SPLIT PAYMENT - handlers
  const handleAddSplit = () => setSplitPayments([...splitPayments, { forma: "", valor: "" }]);
  const handleRemoveSplit = (index) => { if (splitPayments.length > 1) setSplitPayments(splitPayments.filter((_, i) => i !== index)); };
  const handleSplitChange = (index, field, value) => { const u = [...splitPayments]; u[index][field] = value; setSplitPayments(u); };

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
      setMessage({ show: true, text: `A soma das origens (${formatCurrency(somaOrigensVal)}) deve ser igual ao valor total (${formatCurrency(valorTotal)})!`, type: "error" });
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
      fetchCaixaAtual();
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
        setMessage({ show: true, text: `A soma dos destinos (${formatCurrency(somaOrigensVal)}) deve ser igual ao valor total (${formatCurrency(valorTotal)})!`, type: "error" });
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
      fetchCaixaAtual();
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
          setMessage({ show: true, text: `A soma das origens (${formatCurrency(somaVal)}) deve ser igual ao valor (${formatCurrency(valor)})!`, type: "error" });
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
      fetchCaixaAtual();
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
      const data = Array.isArray(res.data) ? res.data.map(c => ({
        ...c,
        name: c.name || "Cliente sem nome",
        comandas: Array.isArray(c.comandas) ? c.comandas : [],
        totalComandas: c.totalComandas || 0,
      })) : [];
      setComandasPendentes(data);
      return data;
    } catch (e) { console.error("Erro ao buscar comandas:", e); return []; }
  };

  const handleFecharComanda = async () => {
    if (!comandaParaFechar) return;
    setIsClosingComanda(true);
    try {
      await axios.put(`${API_URL}/api/pdv-comandas/${comandaParaFechar.id}/fechar`, {
        paymentMethod: fecharFormaPagamento,
      });
      setMessage({ show: true, text: "Comanda fechada com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
      setShowFecharComandaModal(false);
      setComandaParaFechar(null);
      fetchComandasPendentes();
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao fechar comanda!";
      setMessage({ show: true, text: msg, type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsClosingComanda(false);
  };

  // Iniciar pagamento de comanda via PDV completo
  const iniciarPagamentoComanda = (comanda, clienteNome) => {
    // Limpar carrinho atual
    clearCart();
    // Mapear itens da comanda para formato do carrinho
    const cartItems = (comanda.items || []).map(item => ({
      id: item.estoqueId || item.id,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
      unit: "",
      fromComanda: true, // flag para indicar que veio de comanda
    }));
    setCart(cartItems);
    setCustomerName(clienteNome || "Cliente");
    setComandaEmPagamento(comanda);
    setComandaClienteNome(clienteNome || "Cliente");
    setActiveTab("venda");
  };

  // Abrir modal para adicionar itens a uma comanda existente
  const abrirAddItemComanda = (comanda, clienteNome) => {
    setComandaParaAdicionarItens({ ...comanda, clienteNome });
    setAddItemComandaCart([]);
    setAddItemComandaSearch("");
    setShowAddItemComandaModal(true);
  };

  const addItemToComandaCart = (product) => {
    const existing = addItemComandaCart.find(i => i.id === product.id);
    if (existing) {
      setAddItemComandaCart(addItemComandaCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setAddItemComandaCart([...addItemComandaCart, { id: product.id, name: product.name, price: product.value, quantity: 1 }]);
    }
  };

  const removeItemFromComandaCart = (productId) => {
    setAddItemComandaCart(addItemComandaCart.filter(i => i.id !== productId));
  };

  const updateComandaCartQty = (productId, qty) => {
    if (qty <= 0) return removeItemFromComandaCart(productId);
    setAddItemComandaCart(addItemComandaCart.map(i => i.id === productId ? { ...i, quantity: qty } : i));
  };

  const confirmarAddItensComanda = async () => {
    if (addItemComandaCart.length === 0) {
      setMessage({ show: true, text: "Adicione pelo menos um item!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsAddingItemsComanda(true);
    try {
      await axios.post(`${API_URL}/api/pdv-comandas/${comandaParaAdicionarItens.id}/items`, {
        items: addItemComandaCart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      });
      setMessage({ show: true, text: "Itens adicionados à comanda com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
      setShowAddItemComandaModal(false);
      setComandaParaAdicionarItens(null);
      setAddItemComandaCart([]);
      fetchComandasPendentes();
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Erro ao adicionar itens!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsAddingItemsComanda(false);
  };

  // CAIXA CONTROLE - handlers
  const fetchCaixaAtual = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-caixa-controle/atual`);
      setCaixaAtual(res.data);
      // Verificar alerta de caixa aberto há mais de 20h
      if (res.data && res.data.status === "ABERTO" && res.data.horasAberto >= 20) {
        setCaixaAlerta(true);
      } else {
        setCaixaAlerta(false);
      }
    } catch (error) {
      console.error("Erro ao buscar caixa:", error);
    }
  };

  const fetchCaixaHistorico = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-caixa-controle/historico`);
      setCaixaHistorico(res.data.caixas || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  const handleAbrirCaixa = async () => {
    setIsLoadingCaixa(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/pdv-caixa-controle/abrir`, {
        saldoInicial: parseFloat(caixaSaldoInicial) || 0,
        observacao: caixaObsAbrir || null,
        origemBAG: caixaOrigemBAG !== "" ? parseFloat(caixaOrigemBAG) : null,
        origemMAQUINA: caixaOrigemMAQUINA !== "" ? parseFloat(caixaOrigemMAQUINA) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ show: true, text: "Caixa aberto com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
      setShowAbrirCaixaModal(false);
      setCaixaSaldoInicial("");
      setCaixaObsAbrir("");
      setCaixaOrigemBAG("");
      setCaixaOrigemMAQUINA("");
      fetchCaixaAtual();
      fetchOrigemSaldos();
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Erro ao abrir caixa!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsLoadingCaixa(false);
  };

  const handleFecharCaixa = async () => {
    setIsLoadingCaixa(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/api/pdv-caixa-controle/fechar`, {
        observacao: caixaObsFechar || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ show: true, text: "Caixa fechado com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
      setShowFecharCaixaModal(false);
      setCaixaObsFechar("");
      setCaixaAlerta(false);
      fetchCaixaAtual();
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Erro ao fechar caixa!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsLoadingCaixa(false);
  };

  const handleRegistrarTransacao = async () => {
    if (!transacaoCategoria || !transacaoValor || parseFloat(transacaoValor) <= 0) {
      setMessage({ show: true, text: "Preencha categoria e valor!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsSubmittingTransacao(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/pdv-caixa-controle/transacao`, {
        tipo: transacaoTipo,
        categoria: transacaoCategoria,
        valor: parseFloat(transacaoValor),
        descricao: transacaoDescricao || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ show: true, text: "Transação registrada!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
      setTransacaoTipo("ENTRADA");
      setTransacaoCategoria("");
      setTransacaoValor("");
      setTransacaoDescricao("");
      setShowTransacaoForm(false);
      fetchCaixaAtual();
    } catch (error) {
      setMessage({ show: true, text: error.response?.data?.error || "Erro ao registrar transação!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsSubmittingTransacao(false);
  };

  // GASTOS BAR - handlers
  const fetchGastosBarSemanas = async () => {
    setIsLoadingGastosBar(true);
    try {
      const res = await axios.get(`${API_URL}/api/pdv-gastos-bar`);
      setGastosBarSemanas(res.data);
    } catch (error) {
      console.error("Erro ao buscar gastos bar:", error);
    }
    setIsLoadingGastosBar(false);
  };

  const fetchGastosBarResumo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-gastos-bar/resumo`);
      setGastosBarResumo(res.data);
    } catch (error) {
      console.error("Erro ao buscar resumo gastos bar:", error);
    }
  };

  const registrarGastosBarPorVale = async (itensVenda, totalVenda, pagamentosSplit) => {
    const valorVale = pagamentosSplit?.length
      ? parseFloat((pagamentosSplit.find((s) => s.forma === "vale") || {}).valor || 0)
      : parseFloat(totalVenda || 0);

    if (!valorVale || valorVale <= 0 || !Array.isArray(itensVenda) || itensVenda.length === 0) return;

    const totalItens = itensVenda.reduce(
      (sum, item) => sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)),
      0
    );
    if (!totalItens || totalItens <= 0) return;

    const funcionario = auth?.userName || localStorage.getItem("userName") || "Operador";
    const proporcaoVale = Math.min(valorVale / totalItens, 1);
    const valeParcial = proporcaoVale < 0.999;

    const requests = itensVenda
      .map((item) => {
        const qtd = parseFloat(item.quantity) || 0;
        const valorBase = (parseFloat(item.price) || 0) * qtd;
        const valorTotalItem = parseFloat((valorBase * proporcaoVale).toFixed(2));
        if (!qtd || !valorTotalItem) return null;

        return axios.post(`${API_URL}/api/pdv-gastos-bar`, {
          tipo: "PRODUTO",
          funcionario,
          descricao: valeParcial ? `${item.name} (Vale parcial)` : item.name,
          quantidade: qtd,
          valorUnitario: parseFloat((valorTotalItem / qtd).toFixed(2)),
          valorTotal: valorTotalItem,
        });
      })
      .filter(Boolean);

    if (requests.length > 0) {
      await Promise.all(requests);
    }
  };

  // Verificar caixa a cada 5 minutos (para alerta de >20h)
  useEffect(() => {
    const interval = setInterval(() => fetchCaixaAtual(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cancelar pagamento de comanda e voltar
  const cancelarPagamentoComanda = () => {
    setComandaEmPagamento(null);
    setComandaClienteNome("");
    clearCart();
    setActiveTab("comandas");
  };

  useEffect(() => {
    if (activeTab === "add" || activeTab === "vale") {
      fetchOrigemSaldos();
    }
    if (activeTab === "config") {
      fetchCupons();
      fetchTaxas();
      fetchConfigLimites();
      fetchComandasPendentes();
      fetchFormasPagamento();
      fetchOrigemSaldos();
      fetchTaxaSaque();
    }
    if (activeTab === "comandas") {
      setIsLoadingComandasTab(true);
      fetchComandasPendentes().finally(() => setIsLoadingComandasTab(false));
      fetchFormasPagamento();
    }
    if (activeTab === "caixa") {
      fetchCaixaAtual();
      fetchCaixaHistorico();
      fetchGastosBarSemanas();
      fetchGastosBarResumo();
      fetchOrigemSaldos();
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

  // ORIGENS DE SALDO - handlers
  const fetchOrigemSaldos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-origem-saldo`);
      if (res.data.length === 0) {
        await axios.post(`${API_URL}/api/pdv-origem-saldo/init`);
        const res2 = await axios.get(`${API_URL}/api/pdv-origem-saldo`);
        setOrigemSaldos(res2.data);
      } else {
        setOrigemSaldos(res.data);
      }
    } catch (e) { /* silencioso */ }
  };

  const handleOrigemMovimentar = async () => {
    const valorNum = parseFloat(origemManualValor);
    if (!valorNum || valorNum <= 0) {
      setMessage({ show: true, text: "Informe um valor válido.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsLoadingOrigemSaldo(true);
    try {
      await axios.post(
        `${API_URL}/api/pdv-origem-saldo/${encodeURIComponent(origemManualNome)}/movimentar`,
        { tipo: origemManualTipo, valor: valorNum, descricao: origemManualDesc },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchOrigemSaldos();
      setOrigemManualValor("");
      setOrigemManualDesc("");
      setMessage({ show: true, text: `${origemManualTipo === "ENTRADA" ? "Entrada" : origemManualTipo === "SAIDA" ? "Saída" : "Ajuste"} registrado em ${origemManualNome}!`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
      if (origemHistoricoNome === origemManualNome) fetchOrigemHistorico(origemManualNome);
    } catch (e) {
      setMessage({ show: true, text: e.response?.data?.error || "Erro ao movimentar origem.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoadingOrigemSaldo(false);
    }
  };

  const handleOrigemTransferencia = async () => {
    const valorNum = parseFloat(transferenciaValor);
    if (!valorNum || valorNum <= 0) {
      setMessage({ show: true, text: "Informe um valor válido.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (transferenciaFrom === transferenciaTo) {
      setMessage({ show: true, text: "Origem e destino devem ser diferentes.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsLoadingTransferencia(true);
    try {
      await axios.post(
        `${API_URL}/api/pdv-origem-saldo/transferir`,
        { origem: transferenciaFrom, destino: transferenciaTo, valor: valorNum, descricao: transferenciaDesc },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchOrigemSaldos();
      setTransferenciaValor("");
      setTransferenciaDesc("");
      setMessage({ show: true, text: `Transferência de ${formatCurrency(valorNum)} de ${transferenciaFrom} → ${transferenciaTo} realizada!`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: e.response?.data?.error || "Erro ao transferir.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoadingTransferencia(false);
    }
  };

  const fetchOrigemHistorico = async (nome) => {
    setIsLoadingOrigemHistorico(true);
    setOrigemHistoricoNome(nome);
    setOrigemHistoricoMovs([]);
    try {
      const res = await axios.get(`${API_URL}/api/pdv-origem-saldo/${encodeURIComponent(nome)}/historico?limit=30`);
      setOrigemHistoricoMovs(res.data.movimentos || []);
    } catch (e) { /* silencioso */ }
    finally { setIsLoadingOrigemHistorico(false); }
  };

  // CONFIG VENDA - handler Saque
  const handleConfirmarSaque = async () => {
    const valorNum = parseFloat(saqueValor);
    if (!valorNum || valorNum <= 0) {
      setMessage({ show: true, text: "Informe o valor desejado pelo cliente.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsLoadingSaque(true);
    try {
      await axios.post(
        `${API_URL}/api/pdv-saque`,
        { valor: valorNum, observacao: saqueObservacao },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchCaixaAtual();
      setSaqueValor("");
      setSaqueObservacao("");
      setMessage({ show: true, text: `Saque de ${formatCurrency(valorNum)} registrado!`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: e.response?.data?.error || "Erro ao registrar saque.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoadingSaque(false);
    }
  };

  const fetchTaxaSaque = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pdv-saque/config`);
      setTaxaSaque(res.data.taxa);
    } catch (e) { console.error("Erro ao buscar taxa de saque:", e); }
  };

  const handleSalvarTaxaSaque = async () => {
    const taxa = parseFloat(taxaSaqueInput);
    if (isNaN(taxa) || taxa < 0 || taxa > 100) {
      setMessage({ show: true, text: "Taxa inválida. Informe um valor entre 0 e 100.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsLoadingTaxaSaque(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(`${API_URL}/api/pdv-saque/config`, { taxa }, { headers: { Authorization: `Bearer ${token}` } });
      setTaxaSaque(res.data.taxa);
      setTaxaSaqueInput("");
      setMessage({ show: true, text: `Taxa atualizada para ${res.data.taxa}%!`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ show: true, text: e.response?.data?.error || "Erro ao salvar taxa.", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoadingTaxaSaque(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // Abre modal de composição ou adiciona direto ao carrinho
  const handleProductClick = (product) => {
    if (!product || product.quantity <= 0) return;
    if (product.composicoes && product.composicoes.length > 0) {
      setCompSelections({});
      setCompModalProduct(product);
    } else {
      addToCart(product);
    }
  };

  // Confirma seleção de composição e adiciona ao carrinho
  const confirmComposicao = () => {
    if (!compModalProduct) return;
    
    // Validar estoque disponível
    if (compModalProduct.quantity < 1) {
      setMessage({ 
        show: true, 
        text: `Estoque insuficiente para "${compModalProduct.name}". Disponível: ${compModalProduct.quantity}.`, 
        type: "error" 
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    const comps = compModalProduct.composicoes || [];
    for (const comp of comps) {
      if (comp.obrigatorio) {
        const sel = compSelections[comp.id] || [];
        if (sel.length < 1) {
          alert(`Selecione uma opção para: "${comp.nome}"`);
          return;
        }
      }
    }
    // Calcula preço com extras
    let extraTotal = 0;
    const labelParts = [];
    for (const comp of comps) {
      const sel = compSelections[comp.id] || [];
      const selectedOpcoes = comp.opcoes.filter(o => sel.includes(o.id));
      selectedOpcoes.forEach(o => { extraTotal += o.valorExtra || 0; });
      if (selectedOpcoes.length > 0) labelParts.push(`${comp.nome}: ${selectedOpcoes.map(o => o.nome).join(', ')}`);
    }
    const finalPrice = compModalProduct.value + extraTotal;
    const composicaoLabel = labelParts.join(' | ');
    const composicaoJSON = JSON.stringify(compSelections);
    // Cria um ID único para este item composto (estoqueId + hash de seleção)
    const compostoKey = `${compModalProduct.id}__${composicaoJSON}`;
    const existingItem = cart.find(item => item.compostoKey === compostoKey);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      // Validar se pode aumentar a quantidade - usar maxQuantity ou fallback para compModalProduct.quantity
      const maxQty = existingItem.maxQuantity !== undefined ? existingItem.maxQuantity : compModalProduct.quantity;
      if (maxQty < newQuantity) {
        // Permite ultrapassar se há irmão de outra unidade (servidor fará conversão automática)
        if (!hasConversionSibling(compModalProduct)) {
          setMessage({ 
            show: true, 
            text: `Estoque insuficiente para "${compModalProduct.name}". Disponível: ${maxQty}, Solicitado: ${newQuantity}.`, 
            type: "error" 
          });
          setTimeout(() => setMessage(null), 5000);
          return;
        }
      }
      setCart(cart.map(item => item.compostoKey === compostoKey ? { ...item, quantity: newQuantity, maxQuantity: compModalProduct.quantity } : item));
    } else {
      setCart([...cart, {
        id: compModalProduct.id,
        compostoKey,
        name: compModalProduct.name,
        price: finalPrice,
        quantity: 1,
        unit: compModalProduct.unit,
        composicao: composicaoJSON,
        composicaoLabel,
        maxQuantity: compModalProduct.quantity
      }]);
    }
    setCompModalProduct(null);
  };

  const toggleCompOpcao = (composicaoId, opcaoId, multiplo, maxOpcoes) => {
    setCompSelections(prev => {
      const current = prev[composicaoId] || [];
      if (current.includes(opcaoId)) {
        return { ...prev, [composicaoId]: current.filter(id => id !== opcaoId) };
      }
      if (!multiplo) return { ...prev, [composicaoId]: [opcaoId] };
      if (current.length >= maxOpcoes) return { ...prev, [composicaoId]: [...current.slice(1), opcaoId] };
      return { ...prev, [composicaoId]: [...current, opcaoId] };
    });
  };

  // Verifica se um produto tem irmão com unidade diferente no mesmo productId
  // Se sim, o servidor pode fazer conversão automática — não bloquear no frontend
  const hasConversionSibling = (product) => {
    const pid = product.productId || product.product?.id;
    if (!pid) return false;
    return products.some(p => {
      const spid = p.productId || p.product?.id;
      return spid === pid && p.id !== product.id;
    });
  };

  const addToCart = (product) => {
    // Validar estoque disponível
    if (product.quantity < 1) {
      setMessage({ 
        show: true, 
        text: `Estoque insuficiente para "${product.name}". Disponível: ${product.quantity}, Solicitado: 1.`, 
        type: "error" 
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    const existingItem = cart.find(item => !item.compostoKey && item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      // Validar se pode aumentar a quantidade - usar maxQuantity ou fallback para product.quantity
      const maxQty = existingItem.maxQuantity !== undefined ? existingItem.maxQuantity : product.quantity;
      if (maxQty < newQuantity) {
        // Permite ultrapassar se há irmão de outra unidade (servidor fará conversão automática)
        if (!hasConversionSibling(product)) {
          setMessage({ 
            show: true, 
            text: `Estoque insuficiente para "${product.name}". Disponível: ${maxQty}, Solicitado: ${newQuantity}.`, 
            type: "error" 
          });
          setTimeout(() => setMessage(null), 5000);
          return;
        }
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: newQuantity } // não sobrescreve maxQuantity para não travar
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.value,
        quantity: 1,
        unit: product.unit,
        maxQuantity: product.quantity
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity, compostoKey) => {
    if (newQuantity <= 0) {
      if (compostoKey) setCart(cart.filter(item => item.compostoKey !== compostoKey));
      else removeFromCart(productId);
      return;
    }

    // Encontrar o item no carrinho
    const cartItem = cart.find(item => 
      compostoKey ? item.compostoKey === compostoKey : (item.id === productId && !item.compostoKey)
    );
    
    if (!cartItem) return;

    // Validar estoque: usar maxQuantity do item, com fallback para buscar de products
    let maxAvailable = cartItem.maxQuantity;
    if (maxAvailable === undefined) {
      const productInList = products.find(p => p.id === productId);
      maxAvailable = productInList?.quantity;
    }

    if (maxAvailable !== undefined && maxAvailable < newQuantity) {
      // Permite ultrapassar se há irmão de outra unidade (servidor fará conversão automática)
      const productInList = products.find(p => p.id === productId);
      if (!productInList || !hasConversionSibling(productInList)) {
        setMessage({ 
          show: true, 
          text: `Estoque insuficiente para "${cartItem.name}". Disponível: ${maxAvailable}, Solicitado: ${newQuantity}.`, 
          type: "error" 
        });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
    }

    setCart(cart.map(item =>
      compostoKey ? (item.compostoKey === compostoKey ? { ...item, quantity: newQuantity } : item)
                  : (item.id === productId && !item.compostoKey ? { ...item, quantity: newQuantity } : item)
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setAmountReceived("");
    setChange(0);
    setDescontoTipo("");
    setDescontoValor("");
    setCupomCodigo("");
    setCupomAplicado(null);
    setIsSplitPayment(false);
    setSplitPayments([{ forma: "", valor: "" }]);
    setSelectedClient(null);
    setNewClientName("");
    setShowNewClientInput(false);
    setClientSearchTerm("");
    setClientDropdownOpen(false);
    setValePassword("");
    setValePasswordVerified(false);
    setComandaEmPagamento(null);
    setComandaClienteNome("");
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      setMessage({ show: true, text: "Carrinho vazio!", type: "error" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (isSplitPayment) {
      const formasOk = splitPayments.filter(s => s.forma && parseFloat(s.valor) > 0);
      if (formasOk.length === 0) {
        setMessage({ show: true, text: "Preencha ao menos uma forma de pagamento!", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      if (Math.abs(somaSplit - finalTotal) > 0.01) {
        setMessage({ show: true, text: "A soma dos pagamentos deve ser igual ao total!", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
    }
    const needsClients = isSplitPayment ? splitPayments.some(s => s.forma === "pendente") : paymentMethod === "pendente";
    if (needsClients) { fetchClientesFiado(); fetchConfigLimites(); }
    setValePassword("");
    setValePasswordVerified(false);
    setSelectedClient(null);
    setNewClientName("");
    setShowNewClientInput(false);
    setClientSearchTerm("");
    setAmountReceived("");
    setShowPaymentModal(true);
  };

  const canConfirmPayment = () => {
    const needsPendente = isSplitPayment ? splitPayments.some(s => s.forma === "pendente") : paymentMethod === "pendente";
    const needsVale = isSplitPayment ? splitPayments.some(s => s.forma === "vale") : paymentMethod === "vale";
    const needsDinheiro = isSplitPayment ? splitPayments.some(s => s.forma === "dinheiro") : paymentMethod === "dinheiro";
    if (needsPendente && !selectedClient) return false;
    if (needsVale && !valePasswordVerified) return false;
    if (needsDinheiro && !isSplitPayment && parseFloat(amountReceived) < finalTotal) return false;
    if (needsDinheiro && isSplitPayment) {
      const dSplit = splitPayments.find(s => s.forma === "dinheiro");
      if (dSplit && parseFloat(amountReceived) < parseFloat(dSplit.valor)) return false;
    }
    return true;
  };

  const confirmPayment = () => {
    if (!canConfirmPayment()) return;

    // Check comanda limit for pendente (usa total de comandas abertas, não totalDebt)
    const needsPendente = isSplitPayment ? splitPayments.some(s => s.forma === "pendente") : paymentMethod === "pendente";
    if (needsPendente && selectedClient) {
      const limiteConfig = configLimites.find(l => l.chave === "limite_comanda");
      const limite = limiteConfig ? parseFloat(limiteConfig.valor) : null;
      const valorPendente = isSplitPayment
        ? parseFloat(splitPayments.find(s => s.forma === "pendente")?.valor || 0)
        : finalTotal;
      const clienteComandas = comandasPendentes.find(c => c.id === selectedClient.id);
      const totalAberto = (clienteComandas?.totalComandas || 0) + valorPendente;
      if (limite && totalAberto > limite) {
        setMessage({ show: true, text: `Limite de comanda excedido! Em aberto: ${formatCurrency(clienteComandas?.totalComandas || 0)} + ${formatCurrency(valorPendente)} = ${formatCurrency(totalAberto)}, Limite: ${formatCurrency(limite)}`, type: "error" });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
    }

    setIsLoading(true);

    const paymentMethodStr = isSplitPayment
      ? splitPayments.filter(s => s.forma && s.valor).map(s => `${getFormaNome(s.forma)} (${formatCurrency(parseFloat(s.valor))})`).join(" + ")
      : getFormaNome(paymentMethod);

    const needsVale = isSplitPayment ? splitPayments.some(s => s.forma === "vale") : paymentMethod === "vale";

    // Se é pagamento de comanda, apenas fechar a comanda (estoque já foi baixado)
    if (comandaEmPagamento) {
      axios
        .put(`${API_URL}/api/pdv-comandas/${comandaEmPagamento.id}/fechar`, {
          paymentMethod: paymentMethodStr,
        })
        .then(() => {
          setMessage({ show: true, text: `Comanda #${comandaEmPagamento.id} paga com sucesso!`, type: "success" });
          clearCart();
          setShowPaymentModal(false);
          fetchComandasPendentes();
          setTimeout(() => setMessage(null), 3000);
        })
        .catch((error) => {
          console.error("Erro ao fechar comanda:", error);
          const errorMsg = error.response?.data?.error || "Erro ao fechar comanda!";
          setShowPaymentModal(false);
          setMessage({ show: true, text: errorMsg, type: "error" });
          setTimeout(() => setMessage(null), 5000);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    const saleData = {
      items: cart,
      total: finalTotal,
      paymentMethod: paymentMethodStr,
      customerName: selectedClient ? selectedClient.name : (customerName || "Cliente não identificado"),
      amountReceived: !isSplitPayment && paymentMethod === "dinheiro" ? parseFloat(amountReceived) : finalTotal,
      change: !isSplitPayment && paymentMethod === "dinheiro" ? Math.max(parseFloat(amountReceived) - finalTotal, 0) : 0,
      date: new Date().toISOString(),
      discount: desconto > 0 ? { tipo: cupomAplicado ? cupomAplicado.tipo : (descontoTipo || "").toUpperCase(), valor: desconto, cupomCodigo: cupomAplicado?.codigo || null } : null,
      splitPayments: isSplitPayment ? splitPayments.filter(s => s.forma && s.valor).map(s => ({ forma: s.forma, valor: parseFloat(s.valor) })) : null,
      pendente: needsPendente && selectedClient ? { clientId: selectedClient.id } : null,
      vale: needsVale ? { password: valePassword } : null,
      subtotal: total,
      finalTotal: finalTotal,
    };

    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .post(`${API_URL}/api/sales`, saleData, { headers })
      .then(async () => {
        if (needsVale) {
          try {
            await registrarGastosBarPorVale(
              cart,
              finalTotal,
              isSplitPayment ? splitPayments.filter((s) => s.forma && s.valor) : null
            );
            fetchGastosBarSemanas();
            fetchGastosBarResumo();
          } catch (error) {
            console.error("Erro ao registrar gastos do bar via Vale:", error);
          }
        }
        setMessage({ show: true, text: "Venda realizada com sucesso!", type: "success" });
        clearCart();
        setShowPaymentModal(false);
        fetchProducts();
        setTimeout(() => setMessage(null), 3000);
      })
      .catch((error) => {
        console.error("Erro ao registrar venda:", error);
        const errorMsg = error.response?.data?.error || "Erro ao registrar venda!";
        const isStockError = errorMsg.toLowerCase().includes("estoque") || errorMsg.toLowerCase().includes("esgotado") || errorMsg.toLowerCase().includes("insuficiente");
        const duration = isStockError ? 10000 : 5000;
        setShowPaymentModal(false);
        setMessage({ show: true, text: errorMsg, type: "error" });
        setTimeout(() => {
          setMessage(null);
          if (isStockError) fetchProducts();
        }, duration);
      })
      .finally(() => setIsLoading(false));
  };

  const cancelPayment = () => {
    setShowPaymentModal(false);
    setAmountReceived("");
    setChange(0);
    setValePassword("");
    setValePasswordVerified(false);
    setSelectedClient(null);
    setNewClientName("");
    setShowNewClientInput(false);
    setClientSearchTerm("");
    setClientDropdownOpen(false);
  };

  const fetchUltimosPedidos = () => {
    setIsLoadingPedidos(true);
    const params = new URLSearchParams();
    if (pedidosDataInicio) params.append("dataInicio", pedidosDataInicio);
    if (pedidosDataFim) params.append("dataFim", pedidosDataFim);
    axios
      .get(`${API_URL}/api/sales?${params.toString()}`)
      .then((res) => {
        setUltimosPedidos(res.data);
      })
      .catch(() => {
        setMessage({ text: "Erro ao carregar pedidos.", type: "error" });
      })
      .finally(() => setIsLoadingPedidos(false));
  };

  // Etapas do fluxo de pedido online (ordem) e rótulos
  const PEDIDO_STATUS = ["pending", "preparing", "ready", "delivered"];
  const PEDIDO_STATUS_LABELS = {
    pending: "Pendente",
    preparing: "Em preparo",
    ready: "Pronto para retirada",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };
  // Próximo status no fluxo (null se for final/cancelado)
  const proximoStatus = (status) => {
    const idx = PEDIDO_STATUS.indexOf(status);
    if (idx === -1 || idx >= PEDIDO_STATUS.length - 1) return null;
    return PEDIDO_STATUS[idx + 1];
  };

  // Busca os pedidos online (origem ONLINE) com filtro opcional por status
  const fetchPedidosOnline = () => {
    setIsLoadingOnline(true);
    const params = new URLSearchParams();
    if (onlineStatusFiltro) params.append("status", onlineStatusFiltro);
    axios
      .get(`${API_URL}/api/sales/online?${params.toString()}`)
      .then((res) => {
        setPedidosOnline(res.data);
      })
      .catch(() => {
        setMessage({ text: "Erro ao carregar pedidos online.", type: "error" });
      })
      .finally(() => setIsLoadingOnline(false));
  };

  // Atualiza o status de um pedido online e abre o WhatsApp do cliente (se houver telefone)
  const atualizarStatusOnline = (pedidoId, novoStatus) => {
    setAtualizandoStatusId(pedidoId);
    axios
      .put(`${API_URL}/api/sales/${pedidoId}/status`, { status: novoStatus })
      .then((res) => {
        setPedidosOnline((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, statusPedido: novoStatus } : p)));
        const wpp = res.data?.whatsapp;
        if (wpp?.link) {
          window.open(wpp.link, "_blank");
        } else if (wpp && wpp.hasPhone === false) {
          setMessage({ text: `Status atualizado para "${PEDIDO_STATUS_LABELS[novoStatus]}". Cliente sem telefone para WhatsApp.`, type: "info" });
        } else {
          setMessage({ text: `Status atualizado para "${PEDIDO_STATUS_LABELS[novoStatus]}".`, type: "success" });
        }
        // Se há filtro ativo que não bate com o novo status, recarrega a lista
        if (onlineStatusFiltro && onlineStatusFiltro !== novoStatus) fetchPedidosOnline();
      })
      .catch((err) => {
        setMessage({ text: err.response?.data?.error || "Erro ao atualizar status.", type: "error" });
      })
      .finally(() => setAtualizandoStatusId(null));
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
        <button className={`pdv-tab ${activeTab === "comandas" ? "active" : ""}`} onClick={() => setActiveTab("comandas")}>
          <FaEye /> Comandas
        </button>
        <button className={`pdv-tab ${activeTab === "caixa" ? "active" : ""}`} onClick={() => setActiveTab("caixa")}>
          <FaMoneyBillWave /> Caixa {caixaAlerta && <span className="pdv-caixa-alerta-badge">!</span>}
        </button>
        <button className={`pdv-tab ${activeTab === "config" ? "active" : ""}`} onClick={() => setActiveTab("config")}>
          <FaSlidersH /> Config. Venda
        </button>
        <button className={`pdv-tab ${activeTab === "pedidos" ? "active" : ""}`} onClick={() => { setActiveTab("pedidos"); if (pedidosSubTab === "online") fetchPedidosOnline(); else fetchUltimosPedidos(); }}>
          <FaHistory /> Pedidos
        </button>
      </div>

      {/* Aviso de caixa fechado */}
      {caixaAtual !== null && caixaAtual.status !== "ABERTO" && (
        <div className="pdv-caixa-aviso">
          <FaExclamationTriangle size={16} />
          <span>Nenhum caixa aberto. Abra o caixa antes de registrar vendas, vales ou prêmios.</span>
          <button onClick={() => setActiveTab("caixa")}>
            <FaDoorOpen size={13} /> Abrir Caixa
          </button>
        </div>
      )}

      {/* Aviso de follow-up pendente */}
      {!showFollowUpModal && followUpPendentes.filter(f => !followUpRespostas[f.id] || followUpRespostas[f.id].temEstoque === undefined).length > 0 && (
        <div className="pdv-followup-aviso" onClick={() => { setFollowUpIdx(0); setShowFollowUpModal(true); }}>
          <FaBoxOpen size={15} />
          <span>Verificação semanal de descartáveis pendente ({followUpPendentes.filter(f => !followUpRespostas[f.id] || followUpRespostas[f.id].temEstoque === undefined).length} itens)</span>
          <button type="button">Responder</button>
        </div>
      )}

      {/* ========== ABA VENDA ========== */}
      {activeTab === "venda" && (
      <div className="pdv-content">

        {/* Banner de pagamento de comanda */}
        {comandaEmPagamento && (
          <div className="pdv-comanda-banner">
            <div className="pdv-comanda-banner-info">
              <FaCashRegister size={18} />
              <div>
                <strong>Pagando Comanda #{comandaEmPagamento.id}</strong>
                <span>Cliente: {comandaClienteNome} • Aberta em {new Date(comandaEmPagamento.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
            <button className="pdv-comanda-banner-cancel" onClick={cancelarPagamentoComanda}>
              <FaTimes size={12} /> Cancelar
            </button>
          </div>
        )}

        {/* Seção de Produtos (oculta quando pagando comanda) */}
        {!comandaEmPagamento && (
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
            {(() => {
              // Agrupa produtos pelo productId (mesmo produto, unidades diferentes)
              const groups = {};
              filteredProducts.forEach(p => {
                const key = p.productId != null ? `prod-${p.productId}` : `solo-${p.id}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(p);
              });

              const LOW_STOCK_THRESHOLD = 3;

              return Object.entries(groups).slice(0, 30).map(([key, items]) => {
                if (items.length === 1) {
                  const product = items[0];
                  const outOfStock = product.quantity <= 0;
                  const lowStock = !outOfStock && product.quantity <= LOW_STOCK_THRESHOLD;
                  return (
                    <div
                      key={product.id}
                      className={`product-card${outOfStock ? ' product-card--out' : ''}${lowStock ? ' product-card--low' : ''}`}
                      onClick={() => !outOfStock && handleProductClick(product)}
                      title={outOfStock ? 'Produto esgotado' : lowStock ? `Atenção: apenas ${product.quantity} em estoque` : ''}
                    >
                      {outOfStock && <div className="pdv-stock-badge pdv-stock-badge--out">Esgotado</div>}
                      {lowStock && <div className="pdv-stock-badge pdv-stock-badge--low">⚠ Últimas {product.quantity}</div>}
                      <div className="product-namee">{product.name}</div>
                      <div className="product-price">{formatCurrency(product.value)}</div>
                      <div className="pdv-product-unit">{product.unit}</div>
                      <div className="pdv-product-category">{product.category?.name || "Sem categoria"}</div>
                    </div>
                  );
                }

                // Múltiplas unidades — exibe seletor
                const selectedId = selectedProductUnits[key] ?? items[0].id;
                const selectedItem = items.find(i => i.id === selectedId) || items[0];
                const outOfStockSelected = selectedItem.quantity <= 0;
                const lowStockSelected = !outOfStockSelected && selectedItem.quantity <= LOW_STOCK_THRESHOLD;
                return (
                  <div
                    key={key}
                    className={`product-card product-card--multi${outOfStockSelected ? ' product-card--out' : ''}${lowStockSelected ? ' product-card--low' : ''}`}
                    onClick={() => !outOfStockSelected && handleProductClick(selectedItem)}
                    title={outOfStockSelected ? 'Produto esgotado' : lowStockSelected ? `Atenção: apenas ${selectedItem.quantity} em estoque` : ''}
                  >
                    {outOfStockSelected && <div className="pdv-stock-badge pdv-stock-badge--out">Esgotado</div>}
                    {lowStockSelected && <div className="pdv-stock-badge pdv-stock-badge--low">⚠ Últimas {selectedItem.quantity}</div>}
                    <div className="product-namee">{selectedItem.name}</div>
                    <div className="product-price">{formatCurrency(selectedItem.value)}</div>
                    <div className="pdv-unit-options" onClick={e => e.stopPropagation()}>
                      {items.map(item => {
                        const itemOut = item.quantity <= 0;
                        const itemLow = !itemOut && item.quantity <= LOW_STOCK_THRESHOLD;
                        return (
                          <label
                            key={item.id}
                            className={`pdv-unit-option ${selectedId === item.id ? 'pdv-unit-option--active' : ''} ${itemOut ? 'pdv-unit-option--out' : ''}`}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedProductUnits(prev => ({ ...prev, [key]: item.id }));
                            }}
                            title={itemOut ? 'Esgotado' : itemLow ? `Últimas ${item.quantity}` : ''}
                          >
                            <span className="pdv-unit-option-label">{item.unit}{itemOut ? ' ✕' : itemLow ? ' ⚠' : ''}</span>
                            <span className={`pdv-unit-option-price${itemOut ? ' pdv-unit-option-price--out' : ''}`}>{formatCurrency(item.value)}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="pdv-product-category">{selectedItem.category?.name || "Sem categoria"}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
        )}

        {/* Seção do Carrinho */}
        <div className={`cart-section ${comandaEmPagamento ? "pdv-cart-comanda-mode" : ""}`}>
          <div className="pdv-venda-right-tabs">
            <button className={vendaRightTab === "carrinho" ? "active" : ""} onClick={() => setVendaRightTab("carrinho")}>Carrinho</button>
            <button className={vendaRightTab === "saque" ? "active" : ""} onClick={() => { setVendaRightTab("saque"); fetchTaxaSaque(); }}>Saque</button>
          </div>
          
          {vendaRightTab === "saque" && (
            <div className="pdv-saque-panel" style={{ padding: '12px 0' }}>
              <div className="pdv-saque-taxa-config">
                <div className="pdv-saque-taxa-atual">
                  <span>Taxa atual de saque:</span>
                  <strong className="pdv-saque-taxa-valor">{taxaSaque}%</strong>
                  <span className="pdv-saque-taxa-exemplo">
                    — ex: R$ 40 → cobrar {formatCurrency(40 * (1 + taxaSaque / 100))} na máquina
                  </span>
                </div>
                <div className="pdv-saque-taxa-form">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder={`Nova taxa (atual: ${taxaSaque}%)`}
                    value={taxaSaqueInput}
                    onChange={(e) => setTaxaSaqueInput(e.target.value)}
                    className="pdv-saque-taxa-input"
                  />
                  <button
                    className="pdv-saque-taxa-btn"
                    onClick={handleSalvarTaxaSaque}
                    disabled={isLoadingTaxaSaque || taxaSaqueInput === ""}
                  >
                    {isLoadingTaxaSaque ? "Salvando..." : "Salvar Taxa"}
                  </button>
                </div>
              </div>
              <p className="pdv-config-panel-desc" style={{ marginTop: 16 }}>
                Cliente quer dinheiro em nota? Passe na máquina e registre a saída do caixa.
              </p>
              <div className="pdv-saque-form">
                <div className="pdv-saque-field">
                  <label className="sombra-modal">Valor desejado pelo cliente (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 40,00"
                    value={saqueValor}
                    onChange={(e) => setSaqueValor(e.target.value)}
                  />
                </div>
                {saqueValor && parseFloat(saqueValor) > 0 && (
                  <div className="pdv-saque-preview">
                    <div className="pdv-saque-preview-row">
                      <span>Cliente recebe:</span>
                      <strong className="pdv-saque-cash">{formatCurrency(parseFloat(saqueValor))}</strong>
                    </div>
                    <div className="pdv-saque-preview-row">
                      <span>Cobrar na máquina:</span>
                      <strong className="pdv-saque-machine">{formatCurrency(parseFloat(saqueValor) * (1 + taxaSaque / 100))}</strong>
                    </div>
                    <div className="pdv-saque-preview-row pdv-saque-fee-row">
                      <span>Taxa ({taxaSaque}%):</span>
                      <span className="pdv-saque-fee">{formatCurrency(parseFloat(saqueValor) * (taxaSaque / 100))}</span>
                    </div>
                  </div>
                )}
                <div className="pdv-saque-field">
                  <label className="sombra-modal">Observação (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: nome do cliente"
                    value={saqueObservacao}
                    onChange={(e) => setSaqueObservacao(e.target.value)}
                  />
                </div>
                <button
                  className="pdv-saque-btn"
                  onClick={handleConfirmarSaque}
                  disabled={isLoadingSaque || !saqueValor || parseFloat(saqueValor) <= 0}
                >
                  {isLoadingSaque ? "Registrando..." : "Confirmar Saque"}
                </button>
              </div>
            </div>
          )}

          {vendaRightTab === "carrinho" && (<>
          <div className="customer-input">
            <input
              type="text"
              placeholder="Nome do cliente (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              readOnly={!!comandaEmPagamento}
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
                    {item.composicaoLabel && <div className="pdv-cart-comp-label">{item.composicaoLabel}</div>}
                    <div className="item-price">{formatCurrency(item.price)}</div>
                  </div>
                  {!comandaEmPagamento && (
                  <div className="item-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.compostoKey)}
                    >
                      -
                    </button>
                    <span className="item-quantity">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.compostoKey)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => item.compostoKey ? setCart(cart.filter(i => i.compostoKey !== item.compostoKey)) : removeFromCart(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  )}
                  {comandaEmPagamento && (
                    <div className="item-controls">
                      <span className="item-quantity">{item.quantity}x</span>
                    </div>
                  )}
                  <div className="item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total-section">
              <div className="total-label">Subtotal:</div>
              <div className="total-value">{formatCurrency(total)}</div>
            </div>

            {cart.length > 0 && (
              <div className="pdv-discount-section">
                {!cupomAplicado ? (
                  <>
                    <div className="pdv-discount-row">
                      <select value={descontoTipo} onChange={(e) => { setDescontoTipo(e.target.value); setDescontoValor(""); }}>
                        <option value="">Sem desconto</option>
                        <option value="percentual">% Desconto</option>
                        <option value="valor">R$ Desconto</option>
                      </select>
                      {descontoTipo && (
                        <input
                          type="number"
                          step="0.01"
                          placeholder={descontoTipo === "percentual" ? "%" : "R$"}
                          value={descontoValor}
                          onChange={(e) => setDescontoValor(e.target.value)}
                          className="pdv-discount-input"
                        />
                      )}
                    </div>
                    <div className="pdv-cupom-row">
                      <input
                        type="text"
                        placeholder="Código do cupom"
                        value={cupomCodigo}
                        onChange={(e) => setCupomCodigo(e.target.value)}
                      />
                      <button onClick={handleAplicarCupom} disabled={!cupomCodigo || isValidatingCupom} className="pdv-cupom-btn">
                        {isValidatingCupom ? <FaSpinner className="loading-iconn" /> : <FaTag />}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="pdv-cupom-applied">
                    <FaTag /> Cupom: <strong>{cupomAplicado.codigo}</strong>{" "}
                    ({cupomAplicado.tipo === "PERCENTUAL" ? `${cupomAplicado.valor}%` : formatCurrency(cupomAplicado.valor)})
                    <button onClick={handleRemoverCupom} className="pdv-cupom-remove">✕</button>
                  </div>
                )}
                {desconto > 0 && (
                  <div className="pdv-discount-display">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(desconto)}</span>
                  </div>
                )}
              </div>
            )}

            {desconto > 0 && (
              <div className="total-section pdv-final-total">
                <div className="total-label">Total Final:</div>
                <div className="total-value">{formatCurrency(finalTotal)}</div>
              </div>
            )}

            <div className="payment-method">
              <label>Forma de pagamento:</label>
              <div className="pdv-payment-row">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isSplitPayment}
                >
                  {formasPagamento.filter(f => f.ativo && (!comandaEmPagamento || f.valor !== "pendente")).map((f) => (
                    <option key={f.id} value={f.valor}>{f.nome}</option>
                  ))}
                  {formasPagamento.filter(f => f.ativo).length === 0 && (
                    <option value="dinheiro">Dinheiro</option>
                  )}
                </select>
                <label className="pdv-split-toggle">
                  <input
                    type="checkbox"
                    checked={isSplitPayment}
                    onChange={(e) => {
                      setIsSplitPayment(e.target.checked);
                      if (e.target.checked) {
                        setSplitPayments([{ forma: paymentMethod, valor: "" }, { forma: "", valor: "" }]);
                      } else {
                        setSplitPayments([{ forma: "", valor: "" }]);
                      }
                    }}
                  />
                  Dividir
                </label>
              </div>
            </div>

            {isSplitPayment && (
              <div className="pdv-split-section">
                {splitPayments.map((sp, idx) => (
                  <div key={idx} className="pdv-split-row">
                    <select value={sp.forma} onChange={(e) => handleSplitChange(idx, "forma", e.target.value)}>
                      <option value="">Selecione...</option>
                      {formasPagamento.filter(f => f.ativo && (!comandaEmPagamento || f.valor !== "pendente")).map((f) => (
                        <option key={f.id} value={f.valor}>{f.nome}</option>
                      ))}
                    </select>
                    <div className="pdv-split-valor">
                      <span>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={sp.valor}
                        onChange={(e) => handleSplitChange(idx, "valor", e.target.value)}
                      />
                    </div>
                    {splitPayments.length > 2 && (
                      <button className="pdv-split-remove" onClick={() => handleRemoveSplit(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button className="pdv-split-add" onClick={handleAddSplit}><FaPlus size={10} /> Mais</button>
                <div className={`pdv-split-soma ${Math.abs(somaSplit - finalTotal) < 0.01 ? "ok" : "erro"}`}>
                  Soma: <strong>{formatCurrency(somaSplit)}</strong> / Total: <strong>{formatCurrency(finalTotal)}</strong>
                  {Math.abs(somaSplit - finalTotal) < 0.01 ? " ✔" : " ✘"}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="clear-btn"
                onClick={comandaEmPagamento ? cancelarPagamentoComanda : clearCart}
                disabled={cart.length === 0}
              >
                {comandaEmPagamento ? "Cancelar" : "Limpar"}
              </button>
              <button
                className="payment-btn"
                onClick={handlePayment}
                disabled={cart.length === 0}
              >
                {comandaEmPagamento ? "Pagar Comanda" : "Finalizar Venda"}
              </button>
            </div>
          </div>
          </>)}
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
                {/* <button className="pdv-origens-config-btn" onClick={() => setShowOrigensConfig(!showOrigensConfig)} title="Gerenciar origens">
                  <FaCog />
                </button> */}
              </label>

              {/* {showOrigensConfig && (
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
              )} */}

              {addOrigens.map((origem, index) => (
                <div key={index} className="pdv-add-origem-row">
                  <select
                    value={origem.nome}
                    onChange={(e) => handleOrigemChange(index, "nome", e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {origemSaldos.filter(o => o.nome !== "CAIXA").map(o => (
                      <option key={`tracked-${o.nome}`} value={o.nome}>{o.nome} ({formatCurrency(o.saldo)})</option>
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
                  Soma das origens: <strong>{formatCurrency(somaOrigens)}</strong> / Total: <strong>{formatCurrency(parseFloat(addValorTotal || 0))}</strong>
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
            <h3><FaHandHoldingUsd style={{ marginRight: 8 }} /> Vale</h3>
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
                Origem(ns) do pagamento
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
                    {origemSaldos.map(o => (
                      <option key={`tracked-${o.nome}`} value={o.nome}>{o.nome} ({formatCurrency(o.saldo)})</option>
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
                  Soma dos destinos: <strong>{formatCurrency(somaOrigensVale)}</strong> / Total: <strong>{formatCurrency(parseFloat(valeValorTotal || 0))}</strong>
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
                <p className="pdv-premio-step-desc">Anexe a foto que comprova o ganho do cliente na máquina.</p>
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
                        {origemSaldos.filter(o => o.nome !== "CAIXA").map(o => (
                          <option key={`tracked-${o.nome}`} value={o.nome}>{o.nome} ({formatCurrency(o.saldo)})</option>
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
                      Soma das origens: <strong>{formatCurrency(somaOrigensPremio)}</strong> / Total: <strong>{formatCurrency(parseFloat(premioValor || 0))}</strong>
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
                    <strong>{formatCurrency(parseFloat(premioValor || 0))}</strong>
                  </div>
                  {premioOrigens.filter(o => o.nome && o.valor).length > 0 && (
                    <div className="pdv-premio-confirm-row">
                      <span>Origens:</span>
                      <strong>{premioOrigens.filter(o => o.nome && o.valor).map(o => `${o.nome} (${formatCurrency(parseFloat(o.valor))})`).join(", ")}</strong>
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
      {/* ========== ABA COMANDAS ========== */}
      {activeTab === "comandas" && (
        <div className="pdv-comandas-section">
            <div className="pdv-comandas-section-header">
              <h3><FaEye /> Comandas Abertas</h3>
              <p className="pdv-comandas-section-desc">
                Gerencie as comandas pendentes de pagamento. Comandas não pagas em 24h serão convertidas automaticamente para fiado.
              </p>
            </div>

            <div className="pdv-comandas-toolbar">
              <div className="pdv-comandas-search">
                <FaSearch size={14} />
                <input
                  type="text"
                  placeholder="Buscar por nome do cliente..."
                  value={comandasSearchTerm}
                  onChange={(e) => setComandasSearchTerm(e.target.value)}
                />
              </div>
              <button className="pdv-comandas-refresh-btn" onClick={() => { setIsLoadingComandasTab(true); fetchComandasPendentes().finally(() => setIsLoadingComandasTab(false)); }}>
                {isLoadingComandasTab ? <FaSpinner className="loading-iconn" /> : <FaSearch />} Atualizar
              </button>
            </div>

            {isLoadingComandasTab ? (
              <div className="pdv-comandas-loading"><FaSpinner className="loading-iconn" size={24} /> Carregando comandas...</div>
            ) : comandasPendentes.length === 0 ? (
              <div className="pdv-comandas-empty-state">
                <FaCashRegister size={40} />
                <h4>Nenhuma comanda aberta</h4>
                <p>Todas as comandas foram pagas ou não há pedidos pendentes.</p>
              </div>
            ) : (
              <>
                <div className="pdv-comandas-stats">
                  <div className="pdv-comandas-stat">
                    <span className="pdv-comandas-stat-label">Clientes com pendência</span>
                    <strong className="pdv-comandas-stat-value">{comandasPendentes.filter(c => (c.name || "").toLowerCase().includes(comandasSearchTerm.toLowerCase())).length}</strong>
                  </div>
                  <div className="pdv-comandas-stat">
                    <span className="pdv-comandas-stat-label">Comandas abertas</span>
                    <strong className="pdv-comandas-stat-value">{comandasPendentes.filter(c => (c.name || "").toLowerCase().includes(comandasSearchTerm.toLowerCase())).reduce((s, c) => s + (c.comandas?.length || 0), 0)}</strong>
                  </div>
                  <div className="pdv-comandas-stat">
                    <span className="pdv-comandas-stat-label">Total pendente</span>
                    <strong className="pdv-comandas-stat-value pdv-comandas-stat-total">{formatCurrency(comandasPendentes.filter(c => (c.name || "").toLowerCase().includes(comandasSearchTerm.toLowerCase())).reduce((s, c) => s + (c.totalComandas || 0), 0))}</strong>
                  </div>
                </div>

                <div className="pdv-comandas-client-list">
                  {comandasPendentes
                    .filter(c => (c.name || "").toLowerCase().includes(comandasSearchTerm.toLowerCase()))
                    .map((cliente) => (
                      <div key={cliente.id} className="pdv-comanda-client-card">
                        <div className="pdv-comanda-client-header">
                          <div className="pdv-comanda-client-info">
                            <h4>{cliente.name || "Cliente sem nome"}</h4>
                            <span className="pdv-comanda-client-count">{(cliente.comandas || []).length} comanda{(cliente.comandas || []).length > 1 ? "s" : ""}</span>
                          </div>
                          <div className="pdv-comanda-client-total-wrap">
                            <span className="pdv-comanda-client-total-label">Total em aberto</span>
                            <strong className="pdv-comanda-client-total-value">{formatCurrency(cliente.totalComandas)}</strong>
                          </div>
                        </div>

                        <div className="pdv-comanda-list">
                          {(cliente.comandas || []).map((comanda) => {
                            const horasAberta = Math.floor((new Date() - new Date(comanda.createdAt)) / (1000 * 60 * 60));
                            const minutosAberta = Math.floor(((new Date() - new Date(comanda.createdAt)) / (1000 * 60)) % 60);
                            const quaseExpirando = horasAberta >= 20;
                            return (
                              <div key={comanda.id} className={`pdv-comanda-card ${quaseExpirando ? "pdv-comanda-expiring" : ""}`}>
                                <div className="pdv-comanda-card-top">
                                  <span className="pdv-comanda-id">#{comanda.id}</span>
                                  <span className="pdv-comanda-valor">{formatCurrency(comanda.total)}</span>
                                  <span className="pdv-comanda-time">
                                    {new Date(comanda.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  <span className={`pdv-comanda-tempo-aberta ${quaseExpirando ? "alerta" : ""}`}>
                                    ⏱ {horasAberta}h{minutosAberta.toString().padStart(2, "0")}m
                                    {quaseExpirando && " ⚠️"}
                                  </span>
                                </div>
                                <div className="pdv-comanda-items">
                                  {(comanda.items || []).map((item, idx) => (
                                    <span key={idx} className="pdv-comanda-item-tag">
                                      {item.quantity}x {item.productName}
                                    </span>
                                  ))}
                                </div>
                                <div className="pdv-comanda-card-actions">
                                  <button
                                    className="pdv-comanda-add-btn"
                                    onClick={() => abrirAddItemComanda(comanda, cliente.name)}
                                  >
                                    <FaPlus size={11} /> Adicionar Itens
                                  </button>
                                  <button
                                    className="pdv-comanda-fechar-btn"
                                    onClick={() => iniciarPagamentoComanda({...comanda, items: comanda.items || []}, cliente.name)}
                                  >
                                    <FaCashRegister size={11} /> Pagar no PDV
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  {comandasPendentes.filter(c => (c.name || "").toLowerCase().includes(comandasSearchTerm.toLowerCase())).length === 0 && (
                    <div className="pdv-comandas-empty-state">
                      <FaSearch size={30} />
                      <h4>Nenhum cliente encontrado</h4>
                      <p>Tente buscar por outro nome.</p>
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      )}

      {/* MODAL - Adicionar Itens à Comanda */}
      {showAddItemComandaModal && comandaParaAdicionarItens && (
        <div className="pdv-add-comanda-overlay" onClick={() => setShowAddItemComandaModal(false)}>
          <div className="pdv-add-comanda-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdv-add-comanda-modal-header">
              <h3>Adicionar Itens à Comanda #{comandaParaAdicionarItens.id}</h3>
              <p>Cliente: <strong>{comandaParaAdicionarItens.clienteNome}</strong></p>
              <button className="pdv-add-comanda-close" onClick={() => setShowAddItemComandaModal(false)}><FaTimes /></button>
            </div>

            <div className="pdv-add-comanda-modal-body">
              {/* Busca de produtos */}
              <div className="pdv-add-comanda-search-wrap">
                <FaSearch size={14} />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={addItemComandaSearch}
                  onChange={(e) => setAddItemComandaSearch(e.target.value)}
                />
              </div>

              {/* Lista de produtos */}
              <div className="pdv-add-comanda-products">
                {products
                  .filter(p => p.name.toLowerCase().includes(addItemComandaSearch.toLowerCase()))
                  .slice(0, 20)
                  .map(product => (
                    <div key={product.id} className="pdv-add-comanda-product-row">
                      <span>{product.name} — {formatCurrency(product.value)} <small style={{ color: "#888" }}>({product.quantity} em estoque)</small></span>
                      <button className="pdv-comanda-add-btn" onClick={() => addItemToComandaCart(product)} disabled={product.quantity <= 0}>
                        <FaPlus size={10} /> Adicionar
                      </button>
                    </div>
                  ))}
                {products.filter(p => p.name.toLowerCase().includes(addItemComandaSearch.toLowerCase())).length === 0 && (
                  <p className="pdv-add-comanda-empty">Nenhum produto encontrado.</p>
                )}
              </div>

              {/* Carrinho da comanda */}
              {addItemComandaCart.length > 0 && (
                <div className="pdv-add-comanda-cart">
                  <h4>Itens a adicionar:</h4>
                  {addItemComandaCart.map(item => (
                    <div key={item.id} className="pdv-add-comanda-cart-row">
                      <span className="pdv-add-comanda-cart-name">{item.name} — {formatCurrency(item.price)}</span>
                      <div className="pdv-add-comanda-cart-controls">
                        <button onClick={() => updateComandaCartQty(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateComandaCartQty(item.id, item.quantity + 1)}>+</button>
                        <button className="pdv-add-comanda-cart-remove" onClick={() => removeItemFromComandaCart(item.id)}><FaTrash size={10} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="pdv-add-comanda-cart-total">
                    Total: {formatCurrency(addItemComandaCart.reduce((s, i) => s + i.price * i.quantity, 0))}
                  </div>
                </div>
              )}
            </div>

            <div className="pdv-add-comanda-modal-footer">
              <button className="pdv-add-comanda-cancel-btn" onClick={() => setShowAddItemComandaModal(false)}>
                <FaTimes size={11} /> Cancelar
              </button>
              <button
                className="pdv-add-comanda-confirm-btn"
                onClick={confirmarAddItensComanda}
                disabled={isAddingItemsComanda || addItemComandaCart.length === 0}
              >
                {isAddingItemsComanda ? <FaSpinner className="loading-iconn" /> : <FaPlus size={11} />} Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ABA CAIXA CONTROLE ========== */}
      {activeTab === "caixa" && (
        <div className="pdv-caixa-section">
          {/* ALERTA CAIXA ABERTO >20H */}
          {caixaAlerta && caixaAtual && caixaAtual.status === "ABERTO" && (
            <div className="pdv-caixa-alerta">
              <FaExclamationTriangle size={20} />
              <div>
                <strong>Atenção: Caixa aberto há mais de 20 horas!</strong>
                <p>Este caixa foi aberto em {new Date(caixaAtual.abertoEm).toLocaleString("pt-BR")} ({Math.floor(caixaAtual.horasAberto)}h aberto). Verifique se há atualizações pendentes e feche o caixa para abrir um novo turno.</p>
              </div>
              <button className="pdv-caixa-alerta-btn" onClick={() => setShowFecharCaixaModal(true)}>Fechar Caixa</button>
            </div>
          )}

          {/* Sub-tabs */}
          <div className="pdv-caixa-subtabs">
            <button className={caixaSubTab === "atual" ? "active" : ""} onClick={() => setCaixaSubTab("atual")}>
              <FaMoneyBillWave size={13} /> Caixa Atual
            </button>
            <button className={caixaSubTab === "historico" ? "active" : ""} onClick={() => { setCaixaSubTab("historico"); fetchCaixaHistorico(); }}>
              <FaHistory size={13} /> Histórico
            </button>
            <button className={caixaSubTab === "gastosbar" ? "active" : ""} onClick={() => { setCaixaSubTab("gastosbar"); fetchGastosBarSemanas(); fetchGastosBarResumo(); }}>
              <FaGlassWhiskey size={13} /> Gastos Bar
            </button>
            <button className={caixaSubTab === "origens" ? "active" : ""} onClick={() => { setCaixaSubTab("origens"); fetchOrigemSaldos(); }}>
              <FaLayerGroup size={13} /> Origens
            </button>
          </div>

          {/* ---- CAIXA ATUAL ---- */}
          {caixaSubTab === "atual" && (
            <div className="pdv-caixa-atual">
              {caixaAtual && caixaAtual.status === "ABERTO" ? (
                <>
                  <div className="pdv-caixa-status-card pdv-caixa-aberto">
                    <div className="pdv-caixa-status-header">
                      <div className="pdv-caixa-status-badge aberto"><FaDoorOpen size={14} /> ABERTO</div>
                      <span className="pdv-caixa-status-time">
                        Aberto em {new Date(caixaAtual.abertoEm).toLocaleString("pt-BR")}
                        {caixaAtual.abertoPorNome && <> por <strong>{caixaAtual.abertoPorNome}</strong></>}
                      </span>
                    </div>

                    <div className="pdv-caixa-resumo-grid">
                      <div className="pdv-caixa-resumo-item">
                        <span className="pdv-caixa-resumo-label">Saldo Inicial</span>
                        <strong>{formatCurrency(caixaAtual.saldoInicial + (caixaAtual.totalAdd || 0))}</strong>
                      </div>
                      <div className="pdv-caixa-resumo-item entradas">
                        <span className="pdv-caixa-resumo-label"><FaArrowUp size={11} /> Entradas</span>
                        <strong>{formatCurrency(caixaAtual.totalEntradas - (caixaAtual.totalAdd || 0))}</strong>
                      </div>
                      <div className="pdv-caixa-resumo-item saidas">
                        <span className="pdv-caixa-resumo-label"><FaArrowDown size={11} /> Saídas</span>
                        <strong>{formatCurrency(caixaAtual.totalSaidas)}</strong>
                      </div>
                      <div className="pdv-caixa-resumo-item saldo">
                        <span className="pdv-caixa-resumo-label">Saldo Atual</span>
                        <strong className="pdv-caixa-saldo-valor">{formatCurrency(caixaAtual.saldoAtual)}</strong>
                      </div>
                    </div>

                    <div className="pdv-caixa-actions">
                      {/* <button className="pdv-caixa-btn-transacao" onClick={() => setShowTransacaoForm(!showTransacaoForm)}>
                        <FaPlus size={12} /> Registrar Movimentação
                      </button> */}
                      <button className="pdv-caixa-btn-fechar" onClick={() => setShowFecharCaixaModal(true)}>
                        <FaDoorClosed size={12} /> Fechar Caixa
                      </button>
                    </div>
                  </div>

                  {/* Form de transação */}
                  {showTransacaoForm && (
                    <div className="pdv-caixa-transacao-form">
                      <h4>Nova Movimentação</h4>
                      <div className="pdv-caixa-transacao-row">
                        <select value={transacaoTipo} onChange={(e) => setTransacaoTipo(e.target.value)}>
                          <option value="ENTRADA">Entrada</option>
                          <option value="SAIDA">Saída</option>
                        </select>
                        <select value={transacaoCategoria} onChange={(e) => setTransacaoCategoria(e.target.value)}>
                          <option value="">Selecione a categoria</option>
                          <option value="VENDA">Venda</option>
                          <option value="SANGRIA">Sangria</option>
                          <option value="VALE">Vale</option>
                          <option value="ADD">Adição</option>
                          <option value="PREMIO">Prêmio</option>
                          <option value="TROCO">Troco</option>
                          <option value="MAQUINA">Máquina</option>
                          <option value="BAG">Bag</option>
                          <option value="OUTRO">Outro</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor (R$)"
                          value={transacaoValor}
                          onChange={(e) => setTransacaoValor(e.target.value)}
                        />
                      </div>
                      <div className="pdv-caixa-transacao-row">
                        <input
                          type="text"
                          placeholder="Descrição (opcional)"
                          value={transacaoDescricao}
                          onChange={(e) => setTransacaoDescricao(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button className="pdv-caixa-btn-confirmar" onClick={handleRegistrarTransacao} disabled={isSubmittingTransacao}>
                          {isSubmittingTransacao ? <FaSpinner className="loading-iconn" /> : <FaCheck size={12} />} Registrar
                        </button>
                        <button className="pdv-caixa-btn-cancelar" onClick={() => setShowTransacaoForm(false)}>
                          <FaTimes size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de transações */}
                  <div className="pdv-caixa-transacoes">
                    <h4>Movimentações do Caixa</h4>
                    {(caixaAtual.transacoes || []).length === 0 ? (
                      <p className="pdv-caixa-empty">Nenhuma movimentação registrada.</p>
                    ) : (
                      <div className="pdv-caixa-transacoes-list">
                        {(caixaAtual.transacoes || []).map(t => (
                          <div key={t.id} className={`pdv-caixa-transacao-item ${t.tipo === "ENTRADA" ? "entrada" : "saida"}`}>
                            <div className="pdv-caixa-transacao-icon">
                              {t.tipo === "ENTRADA" ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                            </div>
                            <div className="pdv-caixa-transacao-info">
                              <span className="pdv-caixa-transacao-cat">{t.categoria}</span>
                              {t.descricao && <span className="pdv-caixa-transacao-desc">{t.descricao}</span>}
                              <span className="pdv-caixa-transacao-time">{new Date(t.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}{t.userName && ` — ${t.userName}`}</span>
                            </div>
                            <span className={`pdv-caixa-transacao-valor ${t.tipo === "ENTRADA" ? "positivo" : "negativo"}`}>
                              {t.tipo === "ENTRADA" ? "+" : "-"} {formatCurrency(t.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="pdv-caixa-fechado-state">
                  <FaDoorClosed size={40} />
                  <h4>Nenhum caixa aberto</h4>
                  {caixaAtual?.ultimoFechado && (
                    <p>Último caixa fechado em {new Date(caixaAtual.ultimoFechado.fechadoEm).toLocaleString("pt-BR")}
                    {caixaAtual.ultimoFechado.fechadoPorNome && <> por <strong>{caixaAtual.ultimoFechado.fechadoPorNome}</strong></>}
                    </p>
                  )}
                  <p className="pdv-caixa-horario-info">Horário de funcionamento: 17h às 06h</p>
                  <button className="pdv-caixa-btn-abrir" onClick={() => setShowAbrirCaixaModal(true)}>
                    <FaDoorOpen size={14} /> Abrir Novo Caixa
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- HISTÓRICO ---- */}
          {caixaSubTab === "historico" && (
            <div className="pdv-caixa-historico">
              {caixaHistorico.length === 0 ? (
                <div className="pdv-caixa-fechado-state">
                  <FaHistory size={40} />
                  <h4>Nenhum registro de caixa encontrado</h4>
                </div>
              ) : (
                <div className="pdv-caixa-historico-list">
                  {caixaHistorico.map(caixa => {
                    const duracao = caixa.fechadoEm ? Math.floor((new Date(caixa.fechadoEm) - new Date(caixa.abertoEm)) / (1000 * 60 * 60)) : null;
                    const duracaoMin = caixa.fechadoEm ? Math.floor(((new Date(caixa.fechadoEm) - new Date(caixa.abertoEm)) / (1000 * 60)) % 60) : null;
                    return (
                      <div key={caixa.id} className={`pdv-caixa-historico-card ${caixa.status === "ABERTO" ? "aberto" : "fechado"}`}>
                        <div className="pdv-caixa-hist-header">
                          <span className={`pdv-caixa-status-badge ${caixa.status === "ABERTO" ? "aberto" : "fechado"}`}>
                            {caixa.status === "ABERTO" ? <><FaDoorOpen size={11} /> ABERTO</> : <><FaDoorClosed size={11} /> FECHADO</>}
                          </span>
                          <span className="pdv-caixa-hist-date">
                            {new Date(caixa.abertoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            {caixa.fechadoEm && <> → {new Date(caixa.fechadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</>}
                          </span>
                          {duracao !== null && <span className="pdv-caixa-hist-duracao">⏱ {duracao}h{String(duracaoMin).padStart(2, "0")}m</span>}
                        </div>
                        <div className="pdv-caixa-hist-resumo">
                          <div><span>Inicial:</span> <strong>{formatCurrency(caixa.saldoInicial)}</strong></div>
                          <div className="entradas"><span>Entradas:</span> <strong>{formatCurrency(caixa.totalEntradas)}</strong></div>
                          <div className="saidas"><span>Saídas:</span> <strong>{formatCurrency(caixa.totalSaidas)}</strong></div>
                          <div className="saldo"><span>Final:</span> <strong>{formatCurrency(caixa.saldoFinal ?? (caixa.saldoInicial + caixa.totalEntradas - caixa.totalSaidas))}</strong></div>
                        </div>
                        <div className="pdv-caixa-hist-info">
                          {caixa.abertoPorNome && <span>Aberto por: {caixa.abertoPorNome}</span>}
                          {caixa.fechadoPorNome && <span>Fechado por: {caixa.fechadoPorNome}</span>}
                          {caixa.observacao && <span className="pdv-caixa-hist-obs">📝 {caixa.observacao}</span>}
                        </div>
                        {(caixa.transacoes || []).length > 0 && (
                          <details className="pdv-caixa-hist-transacoes-details">
                            <summary>{caixa.transacoes.length} movimentações</summary>
                            <div className="pdv-caixa-hist-transacoes">
                              {caixa.transacoes.map(t => (
                                <div key={t.id} className={`pdv-caixa-hist-tr ${t.tipo === "ENTRADA" ? "entrada" : "saida"}`}>
                                  <span className="pdv-caixa-hist-tr-tipo">{t.tipo === "ENTRADA" ? "▲" : "▼"}</span>
                                  <span className="pdv-caixa-hist-tr-cat">{t.categoria}</span>
                                  <span className="pdv-caixa-hist-tr-desc">{t.descricao || "—"}</span>
                                  <span className={`pdv-caixa-hist-tr-valor ${t.tipo === "ENTRADA" ? "positivo" : "negativo"}`}>
                                    {t.tipo === "ENTRADA" ? "+" : "-"}{formatCurrency(t.valor)}
                                  </span>
                                  <span className="pdv-caixa-hist-tr-time">{new Date(t.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---- GASTOS BAR ---- */}
          {caixaSubTab === "gastosbar" && (
            <div className="pdv-gastos-bar">
              {/* Ações */}
              <div className="pdv-gastos-bar-header">
                <div className="pdv-gastos-bar-views">
                  <button className={gastosBarSubView === "semanas" ? "active" : ""} onClick={() => setGastosBarSubView("semanas")}>
                    Por Semana
                  </button>
                  <button className={gastosBarSubView === "funcionarios" ? "active" : ""} onClick={() => setGastosBarSubView("funcionarios")}>
                    Por Funcionário
                  </button>
                </div>
              </div>
              <p className="pdv-gastos-bar-note">Somente visualização. Lançamentos são gerados automaticamente por vendas com pagamento em Vale no PDV.</p>

              {isLoadingGastosBar ? (
                <div className="pdv-caixa-fechado-state"><FaSpinner className="loading-iconn" size={30} /><p>Carregando...</p></div>
              ) : (
                <>
                  {/* Visão por Semana */}
                  {gastosBarSubView === "semanas" && (
                    <div className="pdv-gastos-bar-semanas">
                      {gastosBarSemanas.length === 0 ? (
                        <div className="pdv-caixa-fechado-state">
                          <FaGlassWhiskey size={40} />
                          <h4>Nenhum gasto registrado</h4>
                          <p style={{ color: "#888" }}>Registre produtos pegos por funcionários e descontos dados.</p>
                        </div>
                      ) : (
                        gastosBarSemanas.map((semana, idx) => {
                          const dataInicio = new Date(semana.semana + "T00:00:00");
                          const dataFim = new Date(dataInicio);
                          dataFim.setDate(dataFim.getDate() + 6);
                          return (
                            <details key={idx} className="pdv-gastos-bar-semana-card" open={idx === 0}>
                              <summary className="pdv-gastos-bar-semana-header">
                                <span className="pdv-gastos-bar-semana-range">
                                  📅 {dataInicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} — {dataFim.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                                </span>
                                <div className="pdv-gastos-bar-semana-totais">
                                  {semana.totalProdutos > 0 && <span className="pdv-gastos-bar-tag produto">🍺 {formatCurrency(semana.totalProdutos)}</span>}
                                  {semana.totalDescontos > 0 && <span className="pdv-gastos-bar-tag desconto">🏷️ {formatCurrency(semana.totalDescontos)}</span>}
                                  <span className="pdv-gastos-bar-tag total">Total: {formatCurrency(semana.total)}</span>
                                </div>
                              </summary>

                              {/* Produtos */}
                              {semana.produtos.length > 0 && (
                                <div className="pdv-gastos-bar-grupo">
                                  <h5><FaGlassWhiskey size={12} /> Produtos pegos por funcionários</h5>
                                  {semana.produtos.map(g => (
                                    <div key={g.id} className="pdv-gastos-bar-item produto">
                                      <div className="pdv-gastos-bar-item-info">
                                        <FaUserTie size={11} />
                                        <strong>{g.funcionario}</strong>
                                        <span className="pdv-gastos-bar-item-desc">{g.descricao || "Produto"}</span>
                                        {g.quantidade && <span className="pdv-gastos-bar-item-qtd">{g.quantidade}x {g.valorUnitario ? formatCurrency(g.valorUnitario) : ""}</span>}
                                        <span className="pdv-gastos-bar-item-time">{new Date(g.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                                      </div>
                                      <div className="pdv-gastos-bar-item-actions">
                                        <span className="pdv-gastos-bar-item-valor negativo">- {formatCurrency(g.valorTotal)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Descontos */}
                              {semana.descontos.length > 0 && (
                                <div className="pdv-gastos-bar-grupo">
                                  <h5><FaPercent size={12} /> Descontos concedidos</h5>
                                  {semana.descontos.map(g => (
                                    <div key={g.id} className="pdv-gastos-bar-item desconto">
                                      <div className="pdv-gastos-bar-item-info">
                                        <FaUserTie size={11} />
                                        <strong>{g.funcionario}</strong>
                                        <span className="pdv-gastos-bar-item-desc">{g.descricao || "Desconto"}</span>
                                        <span className="pdv-gastos-bar-item-time">{new Date(g.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                                      </div>
                                      <div className="pdv-gastos-bar-item-actions">
                                        <span className="pdv-gastos-bar-item-valor negativo">- {formatCurrency(g.valorTotal)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </details>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Visão por Funcionário */}
                  {gastosBarSubView === "funcionarios" && (
                    <div className="pdv-gastos-bar-funcionarios">
                      {gastosBarResumo.length === 0 ? (
                        <div className="pdv-caixa-fechado-state">
                          <FaUserTie size={40} />
                          <h4>Nenhum gasto por funcionário</h4>
                        </div>
                      ) : (
                        gastosBarResumo.map((func, idx) => (
                          <div key={idx} className="pdv-gastos-bar-func-card">
                            <div className="pdv-gastos-bar-func-header">
                              <div className="pdv-gastos-bar-func-name"><FaUserTie size={14} /> {func.funcionario}</div>
                              <span className="pdv-gastos-bar-func-total">Total: {formatCurrency(func.total)}</span>
                            </div>
                            <div className="pdv-gastos-bar-func-resumo">
                              <div className="pdv-gastos-bar-func-stat produto">
                                <span>🍺 Produtos</span>
                                <strong>{formatCurrency(func.totalProdutos)}</strong>
                              </div>
                              <div className="pdv-gastos-bar-func-stat desconto">
                                <span>🏷️ Descontos</span>
                                <strong>{formatCurrency(func.totalDescontos)}</strong>
                              </div>
                            </div>
                            {func.itens.length > 0 && (
                              <details className="pdv-gastos-bar-func-details">
                                <summary>{func.itens.length} registros</summary>
                                <div className="pdv-gastos-bar-func-itens">
                                  {func.itens.map(g => (
                                    <div key={g.id} className={`pdv-gastos-bar-func-item ${g.tipo === "PRODUTO" ? "produto" : "desconto"}`}>
                                      <span className="pdv-gastos-bar-func-item-tipo">{g.tipo === "PRODUTO" ? "🍺" : "🏷️"}</span>
                                      <span className="pdv-gastos-bar-func-item-desc">{g.descricao || g.tipo}</span>
                                      {g.quantidade && <span className="pdv-gastos-bar-func-item-qtd">{g.quantidade}x</span>}
                                      <span className="pdv-gastos-bar-func-item-valor negativo">- {formatCurrency(g.valorTotal)}</span>
                                      <span className="pdv-gastos-bar-func-item-time">{new Date(g.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---- ORIGENS ---- */}
          {caixaSubTab === "origens" && (
            <div className="pdv-caixa-origens-view">
              <div className="pdv-origens-cards">
                {["BAG", "MÁQUINA", "CAIXA"].map((nome) => {
                  const og = origemSaldos.find(o => o.nome === nome);
                  const saldo = og?.saldo ?? 0;
                  return (
                    <div key={nome} className="pdv-origem-card">
                      <div className="pdv-origem-card-nome">{nome}</div>
                      <div className={`pdv-origem-card-saldo ${saldo < 0 ? "negativo" : saldo === 0 ? "zero" : "positivo"}`}>
                        {formatCurrency(saldo)}
                      </div>
                      <button
                        className="pdv-origem-historico-btn"
                        onClick={() => origemHistoricoNome === nome ? setOrigemHistoricoNome(null) : fetchOrigemHistorico(nome)}
                      >
                        {origemHistoricoNome === nome ? "Fechar" : "Histórico"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {origemHistoricoNome && (
                <div className="pdv-origem-historico-wrap">
                  <h4 className="pdv-origem-historico-title">Histórico — {origemHistoricoNome}</h4>
                  {isLoadingOrigemHistorico ? (
                    <p className="pdv-config-empty">Carregando...</p>
                  ) : origemHistoricoMovs.length === 0 ? (
                    <p className="pdv-config-empty">Nenhuma movimentação registrada.</p>
                  ) : (
                    <div className="pdv-origem-historico-list">
                      {origemHistoricoMovs.map(m => (
                        <div key={m.id} className={`pdv-origem-hist-row ${m.tipo === "ENTRADA" ? "entrada" : m.tipo === "SAIDA" ? "saida" : "ajuste"}`}>
                          <span className="pdv-origem-hist-tipo">{m.tipo === "ENTRADA" ? "▲" : m.tipo === "SAIDA" ? "▼" : "⬦"}</span>
                          <span className="pdv-origem-hist-valor">{m.tipo === "ENTRADA" ? "+" : m.tipo === "SAIDA" ? "-" : ""}{formatCurrency(m.valor)}</span>
                          <span className="pdv-origem-hist-saldo">{formatCurrency(m.saldoDepois)}</span>
                          <span className="pdv-origem-hist-desc">{m.descricao || "—"}</span>
                          <span className="pdv-origem-hist-time">{new Date(m.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className="pdv-config-btn-add"
                style={{ marginTop: 12 }}
                onClick={fetchOrigemSaldos}
                disabled={isLoadingOrigemSaldo}
              >
                {isLoadingOrigemSaldo ? <FaSpinner className="loading-iconn" /> : <FaLayerGroup size={13} />} Atualizar Saldos
              </button>
            </div>
          )}

          {/* Modal Abrir Caixa */}
          {showAbrirCaixaModal && (
            <div className="pdv-add-comanda-overlay" onClick={() => setShowAbrirCaixaModal(false)}>
              <div className="pdv-add-comanda-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pdv-add-comanda-modal-header">
                  <h3><FaDoorOpen size={16} /> Abrir Novo Caixa</h3>
                  <p>Horário de funcionamento: 17h às 06h</p>
                  <button className="pdv-add-comanda-close" onClick={() => setShowAbrirCaixaModal(false)}><FaTimes /></button>
                </div>
                <div className="pdv-add-comanda-modal-body">
                  <label style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 6, display: "block" }}>Saldo Inicial — CAIXA (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={caixaSaldoInicial}
                    onChange={(e) => setCaixaSaldoInicial(e.target.value)}
                    className="pdv-caixa-modal-input"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                    <div>
                      <label style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 6, display: "block" }}>Saldo BAG (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={caixaOrigemBAG}
                        onChange={(e) => setCaixaOrigemBAG(e.target.value)}
                        className="pdv-caixa-modal-input"
                      />
                    </div>
                    <div>
                      <label style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 6, display: "block" }}>Saldo MÁQUINA (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={caixaOrigemMAQUINA}
                        onChange={(e) => setCaixaOrigemMAQUINA(e.target.value)}
                        className="pdv-caixa-modal-input"
                      />
                    </div>
                  </div>
                  <label style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 6, marginTop: 14, display: "block" }}>Observação (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Turno noturno, caixa 1..."
                    value={caixaObsAbrir}
                    onChange={(e) => setCaixaObsAbrir(e.target.value)}
                    className="pdv-caixa-modal-input"
                  />
                </div>
                <div className="pdv-add-comanda-modal-footer">
                  <button className="pdv-add-comanda-cancel-btn" onClick={() => setShowAbrirCaixaModal(false)}>
                    <FaTimes size={11} /> Cancelar
                  </button>
                  <button className="pdv-add-comanda-confirm-btn" onClick={handleAbrirCaixa} disabled={isLoadingCaixa}>
                    {isLoadingCaixa ? <FaSpinner className="loading-iconn" /> : <FaDoorOpen size={12} />} Abrir Caixa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Fechar Caixa */}
          {showFecharCaixaModal && (
            <div className="pdv-add-comanda-overlay" onClick={() => setShowFecharCaixaModal(false)}>
              <div className="pdv-add-comanda-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pdv-add-comanda-modal-header">
                  <h3><FaDoorClosed size={16} /> Fechar Caixa</h3>
                  <p>Saldo atual: <strong style={{ color: "#22c55e" }}>{caixaAtual ? formatCurrency(caixaAtual.saldoAtual) : "R$ 0,00"}</strong></p>
                  <button className="pdv-add-comanda-close" onClick={() => setShowFecharCaixaModal(false)}><FaTimes /></button>
                </div>
                <div className="pdv-add-comanda-modal-body">
                  <label style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 6, display: "block" }}>Observação de fechamento (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Conferido e fechado normalmente"
                    value={caixaObsFechar}
                    onChange={(e) => setCaixaObsFechar(e.target.value)}
                    className="pdv-caixa-modal-input"
                  />
                </div>
                <div className="pdv-add-comanda-modal-footer">
                  <button className="pdv-add-comanda-cancel-btn" onClick={() => setShowFecharCaixaModal(false)}>
                    <FaTimes size={11} /> Cancelar
                  </button>
                  <button className="pdv-caixa-btn-fechar" onClick={handleFecharCaixa} disabled={isLoadingCaixa} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isLoadingCaixa ? <FaSpinner className="loading-iconn" /> : <FaDoorClosed size={12} />} Fechar Caixa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
              <button className={configSubTab === "pagamentos" ? "active" : ""} onClick={() => setConfigSubTab("pagamentos")}>Pagamentos</button>
              <button className={configSubTab === "origens" ? "active" : ""} onClick={() => { setConfigSubTab("origens"); fetchOrigemSaldos(); }}>Origens</button>
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
                            <td>{c.tipo === "PERCENTUAL" ? `${c.valor}%` : formatCurrency(c.valor)}</td>
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
                <p className="pdv-config-panel-desc">Comandas abertas (pendentes de pagamento):</p>

                <button className="pdv-config-btn-add" onClick={fetchComandasPendentes} style={{ marginBottom: 12 }}>
                  <FaSearch /> Atualizar
                </button>

                {comandasPendentes.length === 0 ? (
                  <p className="pdv-config-empty">Nenhuma comanda aberta no momento.</p>
                ) : (
                  <div className="pdv-comandas-cards">
                    {comandasPendentes.map((cliente) => (
                      <div key={cliente.id} className="pdv-comanda-client-card">
                        <div className="pdv-comanda-client-header">
                          <h4>{cliente.name}</h4>
                          <span className="pdv-comanda-client-total">
                            Total em aberto: <strong>{formatCurrency(cliente.totalComandas)}</strong>
                          </span>
                        </div>

                        <div className="pdv-comanda-list">
                          {cliente.comandas.map((comanda) => (
                            <div key={comanda.id} className="pdv-comanda-card">
                              <div className="pdv-comanda-card-top">
                                <span className="pdv-comanda-id">#{comanda.id}</span>
                                <span className="pdv-comanda-valor">{formatCurrency(comanda.total)}</span>
                                <span className="pdv-comanda-time">
                                  {new Date(comanda.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <div className="pdv-comanda-items">
                                {comanda.items.map((item, idx) => (
                                  <span key={idx} className="pdv-comanda-item-tag">
                                    {item.quantity}x {item.productName}
                                  </span>
                                ))}
                              </div>
                              <div className="pdv-comanda-card-actions">
                                <button
                                  className="pdv-comanda-fechar-btn"
                                  onClick={() => iniciarPagamentoComanda(comanda, cliente.name)}
                                >
                                  <FaCashRegister size={11} /> Pagar no PDV
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {comandasPendentes.length > 0 && (
                  <div className="pdv-config-comandas-summary">
                    <span>Total geral pendente: <strong>{formatCurrency(comandasPendentes.reduce((s, c) => s + c.totalComandas, 0))}</strong></span>
                    <span>Comandas abertas: <strong>{comandasPendentes.reduce((s, c) => s + c.comandas.length, 0)}</strong></span>
                  </div>
                )}
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

            {/* ---- PAGAMENTOS ---- */}
            {configSubTab === "pagamentos" && (
              <div className="pdv-config-panel">
                <p className="pdv-config-panel-desc">Gerencie as formas de pagamento disponíveis na venda:</p>
                <div className="pdv-config-form-row">
                  <input
                    placeholder="Nome da forma de pagamento"
                    value={novaFormaPagamento}
                    onChange={(e) => setNovaFormaPagamento(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCriarFormaPagamento()}
                  />
                  <button className="pdv-config-btn-add" onClick={handleCriarFormaPagamento} disabled={!novaFormaPagamento.trim()}>
                    <FaPlus /> Criar
                  </button>
                </div>

                {formasPagamento.length === 0 ? (
                  <p className="pdv-config-empty">Nenhuma forma de pagamento cadastrada.</p>
                ) : (
                  <div className="pdv-config-table-wrap">
                    <table className="pdv-config-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Valor Interno</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formasPagamento.map((f) => (
                          <tr key={f.id} className={!f.ativo ? "pdv-config-row-disabled" : ""}>
                            <td><strong>{f.nome}</strong></td>
                            <td>{f.valor}</td>
                            <td>
                              <span className={`pdv-config-badge ${f.ativo ? "ativo" : "inativo"}`}>
                                {f.ativo ? "Ativa" : "Inativa"}
                              </span>
                            </td>
                            <td className="pdv-config-actions">
                              <button onClick={() => handleToggleFormaPagamento(f.id, f.ativo)} title={f.ativo ? "Desativar" : "Ativar"}>
                                {f.ativo ? "⏸" : "▶"}
                              </button>
                              <button onClick={() => handleExcluirFormaPagamento(f.id)} className="delete" title="Excluir">🗑</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ---- ORIGENS DE SALDO ---- */}
            {configSubTab === "origens" && (
              <div className="pdv-config-panel pdv-origens-panel">
                <p className="pdv-config-panel-desc">
                  Gerencie os saldos de cada origem: <strong>BAG</strong>, <strong>MÁQUINA</strong> e <strong>CAIXA</strong>.<br />
                  Quando um ADD ou VALE for registrado com uma dessas origens, o saldo é debitado automaticamente.
                </p>

                {/* Cards de saldo */}
                <div className="pdv-origens-cards">
                  {["BAG", "MÁQUINA", "CAIXA"].map((nome) => {
                    const og = origemSaldos.find(o => o.nome === nome);
                    const saldo = og?.saldo ?? 0;
                    return (
                      <div key={nome} className={`pdv-origem-card ${saldo < 0 ? "negativo" : ""}`}>
                        <div className="pdv-origem-card-nome">{nome}</div>
                        <div className={`pdv-origem-card-saldo ${saldo < 0 ? "negativo" : saldo === 0 ? "zero" : "positivo"}`}>
                          {formatCurrency(saldo)}
                        </div>
                        <button
                          className="pdv-origem-historico-btn"
                          onClick={() => origemHistoricoNome === nome ? setOrigemHistoricoNome(null) : fetchOrigemHistorico(nome)}
                        >
                          {origemHistoricoNome === nome ? "Fechar" : "Histórico"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Histórico inline */}
                {origemHistoricoNome && (
                  <div className="pdv-origem-historico-wrap">
                    <h4 className="pdv-origem-historico-title">Histórico — {origemHistoricoNome}</h4>
                    {isLoadingOrigemHistorico ? (
                      <p className="pdv-config-empty">Carregando...</p>
                    ) : origemHistoricoMovs.length === 0 ? (
                      <p className="pdv-config-empty">Nenhuma movimentação registrada.</p>
                    ) : (
                      <div className="pdv-origem-historico-list">
                        {origemHistoricoMovs.map(m => (
                          <div key={m.id} className={`pdv-origem-hist-row ${m.tipo === "ENTRADA" ? "entrada" : m.tipo === "SAIDA" ? "saida" : "ajuste"}`}>
                            <span className="pdv-origem-hist-tipo">{m.tipo === "ENTRADA" ? "▲" : m.tipo === "SAIDA" ? "▼" : "⬦"}</span>
                            <span className="pdv-origem-hist-valor">{m.tipo === "ENTRADA" ? "+" : m.tipo === "SAIDA" ? "-" : ""}{formatCurrency(m.valor)}</span>
                            <span className="pdv-origem-hist-saldo">{formatCurrency(m.saldoDepois)}</span>
                            <span className="pdv-origem-hist-desc">{m.descricao || "—"}</span>
                            <span className="pdv-origem-hist-time">{new Date(m.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Formulário de movimentação manual */}
                <div className="pdv-origem-form-wrap">
                  <h4 className="pdv-origem-form-title">Movimentação Manual</h4>
                  <div className="pdv-origem-form-row">
                    <div className="pdv-origem-form-group">
                      <label>Origem</label>
                      <select value={origemManualNome} onChange={e => setOrigemManualNome(e.target.value)}>
                        <option value="BAG">BAG</option>
                        <option value="MÁQUINA">MÁQUINA</option>
                        <option value="CAIXA">CAIXA</option>
                      </select>
                    </div>
                    <div className="pdv-origem-form-group">
                      <label>Tipo</label>
                      <select value={origemManualTipo} onChange={e => setOrigemManualTipo(e.target.value)}>
                        <option value="ENTRADA">Entrada</option>
                        <option value="SAIDA">Saída</option>
                        <option value="AJUSTE">Ajuste (definir saldo)</option>
                      </select>
                    </div>
                    <div className="pdv-origem-form-group">
                      <label>Valor (R$)</label>
                      <input
                        type="number" min="0" step="0.01" placeholder="0,00"
                        value={origemManualValor}
                        onChange={e => setOrigemManualValor(e.target.value)}
                      />
                    </div>
                    <div className="pdv-origem-form-group pdv-origem-form-group--flex">
                      <label>Descrição (opcional)</label>
                      <input
                        type="text" placeholder="Ex: conferência manual"
                        value={origemManualDesc}
                        onChange={e => setOrigemManualDesc(e.target.value)}
                      />
                    </div>
                    <button
                      className="pdv-config-btn-add pdv-origem-mov-btn"
                      onClick={handleOrigemMovimentar}
                      disabled={isLoadingOrigemSaldo || !origemManualValor || parseFloat(origemManualValor) <= 0}
                    >
                      {isLoadingOrigemSaldo ? "..." : "Confirmar"}
                    </button>
                  </div>
                </div>

                {/* Transferência entre origens */}
                <div className="pdv-origem-form-wrap pdv-origem-transferencia-wrap">
                  <h4 className="pdv-origem-form-title">Transferência entre Origens</h4>
                  <div className="pdv-origem-form-row">
                    <div className="pdv-origem-form-group">
                      <label>De</label>
                      <select value={transferenciaFrom} onChange={e => setTransferenciaFrom(e.target.value)}>
                        <option value="BAG">BAG</option>
                        <option value="MÁQUINA">MÁQUINA</option>
                        <option value="CAIXA">CAIXA</option>
                      </select>
                    </div>
                    <div className="pdv-origem-form-group">
                      <label>Para</label>
                      <select value={transferenciaTo} onChange={e => setTransferenciaTo(e.target.value)}>
                        <option value="BAG">BAG</option>
                        <option value="MÁQUINA">MÁQUINA</option>
                        <option value="CAIXA">CAIXA</option>
                      </select>
                    </div>
                    <div className="pdv-origem-form-group">
                      <label>Valor (R$)</label>
                      <input
                        type="number" min="0" step="0.01" placeholder="0,00"
                        value={transferenciaValor}
                        onChange={e => setTransferenciaValor(e.target.value)}
                      />
                    </div>
                    <div className="pdv-origem-form-group pdv-origem-form-group--flex">
                      <label>Descrição (opcional)</label>
                      <input
                        type="text" placeholder="Motivo da transferência"
                        value={transferenciaDesc}
                        onChange={e => setTransferenciaDesc(e.target.value)}
                      />
                    </div>
                    <button
                      className="pdv-config-btn-add pdv-origem-mov-btn"
                      onClick={handleOrigemTransferencia}
                      disabled={isLoadingTransferencia || !transferenciaValor || parseFloat(transferenciaValor) <= 0 || transferenciaFrom === transferenciaTo}
                    >
                      {isLoadingTransferencia ? "..." : "Transferir"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="modal">
          <div className="modal-content payment-modal">
            <h3 style={{ textShadow: "none" }}>{comandaEmPagamento ? `Pagar Comanda #${comandaEmPagamento.id}` : "Finalizar Pagamento"}</h3>

            <div className="payment-summary">
              <div className="summary-row">
                <span className="sombra-modal">Subtotal:</span>
                <span className="sombra-modal" >{formatCurrency(total)}</span>
              </div>
              {desconto > 0 && (
                <div className="summary-row pdv-summary-discount">
                  <span className="sombra-modal">Desconto:</span>
                  <span className="sombra-modal">- {formatCurrency(desconto)}</span>
                </div>
              )}
              <div className="summary-row pdv-summary-final">
                <span className="sombra-modal">Total:</span>
                <span className="sombra-modal">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="summary-row">
                <span className="sombra-modal">Pagamento:</span>
                <span className="sombra-modal">{isSplitPayment ? "Dividido" : getFormaNome(paymentMethod)}</span>
              </div>
              {isSplitPayment && (
                <div className="pdv-modal-split-detail">
                  {splitPayments.filter(s => s.forma && s.valor).map((s, idx) => (
                    <div key={idx} className="summary-row pdv-split-detail-row">
                      <span className="sombra-modal">{getFormaNome(s.forma)}:</span>
                      <span className="sombra-modal">{formatCurrency(parseFloat(s.valor))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PENDENTE - Seleção de Cliente */}
            {(isSplitPayment ? splitPayments.some(s => s.forma === "pendente") : paymentMethod === "pendente") && (
              <div className="pdv-pendente-section">
                <h4><FaSearch size={14} /> Selecionar Cliente (Comanda)</h4>

                <div className="pdv-client-select-wrapper">
                  <div className="pdv-client-select-box" onClick={() => setClientDropdownOpen(!clientDropdownOpen)}>
                    <span className={selectedClient ? "" : "pdv-client-placeholder"}>
                      {selectedClient ? selectedClient.name : "Selecione um cliente..."}
                    </span>
                    <span className="pdv-client-select-arrow">{clientDropdownOpen ? "▲" : "▼"}</span>
                  </div>

                  {clientDropdownOpen && (
                    <div className="pdv-client-dropdown">
                      <div className="pdv-client-dropdown-search">
                        <FaSearch size={12} />
                        <input
                          type="text"
                          placeholder="Buscar cliente..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="pdv-client-dropdown-list">
                        {clientesFiado
                          .filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                          .map(c => (
                            <div
                              key={c.id}
                              className={`pdv-client-dropdown-item ${selectedClient?.id === c.id ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedClient(c);
                                setCustomerName(c.name);
                                setClientDropdownOpen(false);
                                setClientSearchTerm("");
                              }}
                            >
                              <span>{c.name}</span>
                              {selectedClient?.id === c.id && <FaCheck size={12} />}
                            </div>
                          ))}
                        {clientesFiado.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())).length === 0 && (
                          <div className="pdv-client-dropdown-empty">Nenhum cliente encontrado</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pdv-pendente-actions">
                  {!showNewClientInput ? (
                    <button className="pdv-new-client-btn" onClick={() => setShowNewClientInput(true)}>
                      <FaUserPlus size={12} /> Cadastrar novo
                    </button>
                  ) : (
                    <div className="pdv-new-client-form">
                      <input
                        type="text"
                        placeholder="Nome do novo cliente"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                      />
                      <button onClick={handleCadastrarClienteInline} disabled={!newClientName.trim()}>Salvar</button>
                      <button onClick={() => { setShowNewClientInput(false); setNewClientName(""); }}>Cancelar</button>
                    </div>
                  )}

                  {selectedClient && (
                    <button
                      className="pdv-ver-comandas-btn"
                      onClick={() => fetchClienteDetail(selectedClient.id)}
                      disabled={isLoadingComandas}
                    >
                      {isLoadingComandas ? <FaSpinner className="loading-iconn" /> : <><FaEye size={12} /> Ver Comandas</>}
                    </button>
                  )}
                </div>

                {selectedClient && (
                  <div className="pdv-selected-client">
                    ✅ Cliente: <strong>{selectedClient.name}</strong> — Débito atual: {formatCurrency(selectedClient.totalDebt)}
                  </div>
                )}
              </div>
            )}

            {/* VALE - Verificação de Senha */}
            {(isSplitPayment ? splitPayments.some(s => s.forma === "vale") : paymentMethod === "vale") && (
              <div className="pdv-vale-verify-section">
                <h4><FaLock size={14} /> Confirmar Vale (Senha)</h4>
                {!valePasswordVerified ? (
                  <div className="pdv-vale-verify-form">
                    <input
                      type="password"
                      placeholder="Digite sua senha"
                      value={valePassword}
                      onChange={(e) => setValePassword(e.target.value)}
                    />
                    <button onClick={handleVerifyPassword} disabled={!valePassword || isVerifyingPassword}>
                      {isVerifyingPassword ? <FaSpinner className="loading-iconn" /> : "Verificar"}
                    </button>
                  </div>
                ) : (
                  <div className="pdv-vale-verified">✅ Senha verificada com sucesso</div>
                )}
              </div>
            )}

            {/* DINHEIRO - Pagamento em Espécie */}
            {(isSplitPayment ? splitPayments.some(s => s.forma === "dinheiro") : paymentMethod === "dinheiro") && (
              <div className="cash-payment">
                <label>Valor recebido em dinheiro:</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0,00"
                />
                <div className="change-display">
                  <span className="sombra-modal" >Troco: {formatCurrency(
                    isSplitPayment
                      ? Math.max(parseFloat(amountReceived || 0) - parseFloat(splitPayments.find(s => s.forma === "dinheiro")?.valor || 0), 0)
                      : change
                  )}</span>
                </div>
              </div>
            )}

            <div className="modal-buttons">
              <button
                onClick={confirmPayment}
                disabled={isLoading || !canConfirmPayment()}
              >
                {isLoading ? <FaSpinner className="loading-iconn" /> : (comandaEmPagamento ? `Pagar Comanda #${comandaEmPagamento.id}` : "Confirmar Pagamento")}
              </button>
              <button onClick={cancelPayment}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comandas Pendentes */}
      {showComandasModal && comandasClienteDetail && (
        <div className="modal">
          <div className="modal-content pdv-comandas-modal">
            <div className="pdv-comandas-header">
              <h3>Comandas — {comandasClienteDetail.name}</h3>
              <button className="pdv-comandas-close" onClick={() => setShowComandasModal(false)}><FaTimes /></button>
            </div>

            <div className="pdv-comandas-summary-bar">
              <div className="pdv-comandas-summary-item">
                <span>Débito Total</span>
                <strong className="pdv-debt-value">{formatCurrency(comandasClienteDetail.totalDebt)}</strong>
              </div>
              <div className="pdv-comandas-summary-item">
                <span>Compras</span>
                <strong>{comandasClienteDetail.Purchase?.length || 0}</strong>
              </div>
              <div className="pdv-comandas-summary-item">
                <span>Pagamentos</span>
                <strong>{comandasClienteDetail.Payment?.length || 0}</strong>
              </div>
            </div>

            {comandasClienteDetail.Purchase && comandasClienteDetail.Purchase.length > 0 ? (
              <div className="pdv-comandas-table-wrap">
                <h4>Compras Pendentes</h4>
                <table className="pdv-comandas-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>Total</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comandasClienteDetail.Purchase.map(p => (
                      <tr key={p.id}>
                        <td>{p.product}</td>
                        <td>{p.quantity}</td>
                        <td>{formatCurrency(p.total)}</td>
                        <td>{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="pdv-comandas-empty">Nenhuma compra pendente.</div>
            )}

            {comandasClienteDetail.Payment && comandasClienteDetail.Payment.length > 0 && (
              <div className="pdv-comandas-table-wrap">
                <h4>Pagamentos Realizados</h4>
                <table className="pdv-comandas-table">
                  <thead>
                    <tr>
                      <th>Valor</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comandasClienteDetail.Payment.map(pay => (
                      <tr key={pay.id}>
                        <td>{formatCurrency(pay.amount)}</td>
                        <td>{new Date(pay.date).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pdv-comandas-footer">
              <button className="pdv-comandas-close-btn" onClick={() => setShowComandasModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ABA PEDIDOS ========== */}
      {activeTab === "pedidos" && (
        <div className="pdv-pedidos-section">
          {/* Sub-abas: Histórico x Pedidos Online */}
          <div className="pdv-pedidos-subtabs">
            <button
              className={`pdv-pedidos-subtab ${pedidosSubTab === "historico" ? "active" : ""}`}
              onClick={() => { setPedidosSubTab("historico"); fetchUltimosPedidos(); }}
            >
              <FaHistory /> Histórico
            </button>
            <button
              className={`pdv-pedidos-subtab ${pedidosSubTab === "online" ? "active" : ""}`}
              onClick={() => { setPedidosSubTab("online"); fetchPedidosOnline(); }}
            >
              <FaShoppingBag /> Pedidos Online
            </button>
          </div>

          {pedidosSubTab === "historico" && (
          <>
          <div className="pdv-pedidos-header">
            <h3 className="sombra-modal"><FaHistory style={{ marginRight: 8 }} /> Últimos Pedidos</h3>
            <div className="pdv-pedidos-filtros">
              <div className="pdv-pedidos-filtro-grupo">
                <label>De</label>
                <input
                  type="date"
                  value={pedidosDataInicio}
                  onChange={e => setPedidosDataInicio(e.target.value)}
                />
              </div>
              <div className="pdv-pedidos-filtro-grupo">
                <label>Até</label>
                <input
                  type="date"
                  value={pedidosDataFim}
                  onChange={e => setPedidosDataFim(e.target.value)}
                />
              </div>
              <button
                className="pdv-pedidos-filtrar-btn"
                onClick={fetchUltimosPedidos}
                disabled={isLoadingPedidos}
              >
                {isLoadingPedidos ? <FaSpinner className="spin" /> : <FaSearch size={13} />} Filtrar
              </button>
              <button
                className="pdv-pedidos-limpar-btn"
                onClick={() => {
                  const hoje = new Date().toISOString().split("T")[0];
                  setPedidosDataInicio(hoje);
                  setPedidosDataFim(hoje);
                  setPedidosFiltro("");
                }}
              >
                Limpar
              </button>
            </div>
            <div className="pdv-pedidos-actions">
              <div className="pdv-pedidos-search">
                <FaSearch size={13} />
                <input
                  className="sombra-modal"
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={pedidosFiltro}
                  onChange={e => setPedidosFiltro(e.target.value)}
                />
              </div>
              <button className="pdv-pedidos-refresh-btn" onClick={fetchUltimosPedidos} disabled={isLoadingPedidos}>
                {isLoadingPedidos ? <FaSpinner className="spin" /> : <FaHistory className="sombra-modal" size={13} />} Atualizar
              </button>
            </div>
          </div>

          {isLoadingPedidos ? (
            <div className="pdv-pedidos-loading"><FaSpinner className="spin" size={24} /> Carregando pedidos...</div>
          ) : ultimosPedidos.length === 0 ? (
            <div className="pdv-pedidos-empty">Nenhum pedido encontrado.</div>
          ) : (
            <div className="pdv-pedidos-list">
              {ultimosPedidos
                .filter(p => p.customerName?.toLowerCase().includes(pedidosFiltro.toLowerCase()))
                .map(pedido => (
                  <div key={pedido.id} className="pdv-pedido-card" onClick={() => setPedidoDetalhe(pedidoDetalhe?.id === pedido.id ? null : pedido)}>
                    <div className="pdv-pedido-card-header">
                      <div className="pdv-pedido-card-left">
                        <span className="pdv-pedido-id"># {pedido.id}</span>
                        <span className="pdv-pedido-cliente">{pedido.customerName || "—"}</span>
                        {pedido.operator && (
                          <span className="pdv-pedido-operador"><FaUserTie size={11} /> {pedido.operator}</span>
                        )}
                      </div>
                      <div className="pdv-pedido-card-right">
                        <span className="pdv-pedido-total">{formatCurrency(pedido.total)}</span>
                        <span className="pdv-pedido-pagamento">{getFormaNome(pedido.paymentMethod)}</span>
                        <span className="pdv-pedido-data">{new Date(pedido.date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    {pedidoDetalhe?.id === pedido.id && (
                      <div className="pdv-pedido-detalhe">
                        <table className="pdv-pedido-itens-table">
                          <thead>
                            <tr>
                              <th>Produto</th>
                              <th>Qtd</th>
                              <th>Unit.</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedido.items.map(item => (
                              <tr key={item.id}>
                                <td>{item.productName}</td>
                                <td>{item.quantity}</td>
                                <td>{formatCurrency(item.unitPrice)}</td>
                                <td>{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {pedido.amountReceived > 0 && (
                          <div className="pdv-pedido-troco">
                            <span>Recebido: <strong>{formatCurrency(pedido.amountReceived)}</strong></span>
                            <span>Troco: <strong>{formatCurrency(pedido.change)}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
          </>
          )}

          {pedidosSubTab === "online" && (
          <>
          <div className="pdv-pedidos-header">
            <h3 className="sombra-modal"><FaShoppingBag style={{ marginRight: 8 }} /> Pedidos Online</h3>
            <div className="pdv-pedidos-actions">
              <div className="pdv-online-status-filtros">
                <button className={`pdv-online-filtro-btn ${onlineStatusFiltro === "" ? "active" : ""}`} onClick={() => { setOnlineStatusFiltro(""); setTimeout(fetchPedidosOnline, 0); }}>Todos</button>
                {PEDIDO_STATUS.map((st) => (
                  <button
                    key={st}
                    className={`pdv-online-filtro-btn pdv-online-filtro-btn--${st} ${onlineStatusFiltro === st ? "active" : ""}`}
                    onClick={() => { setOnlineStatusFiltro(st); setTimeout(fetchPedidosOnline, 0); }}
                  >
                    {PEDIDO_STATUS_LABELS[st]}
                  </button>
                ))}
                <button className={`pdv-online-filtro-btn pdv-online-filtro-btn--cancelled ${onlineStatusFiltro === "cancelled" ? "active" : ""}`} onClick={() => { setOnlineStatusFiltro("cancelled"); setTimeout(fetchPedidosOnline, 0); }}>Cancelado</button>
              </div>
              <button className="pdv-pedidos-refresh-btn" onClick={fetchPedidosOnline} disabled={isLoadingOnline}>
                {isLoadingOnline ? <FaSpinner className="spin" /> : <FaHistory className="sombra-modal" size={13} />} Atualizar
              </button>
            </div>
          </div>

          {isLoadingOnline ? (
            <div className="pdv-pedidos-loading"><FaSpinner className="spin" size={24} /> Carregando pedidos online...</div>
          ) : pedidosOnline.length === 0 ? (
            <div className="pdv-pedidos-empty">Nenhum pedido online encontrado.</div>
          ) : (
            <div className="pdv-pedidos-list">
              {pedidosOnline.map((pedido) => {
                const status = pedido.statusPedido || "pending";
                const next = proximoStatus(status);
                return (
                  <div key={pedido.id} className={`pdv-online-card pdv-online-card--${status}`}>
                    <div className="pdv-online-card-header" onClick={() => setOnlineDetalhe(onlineDetalhe?.id === pedido.id ? null : pedido)}>
                      <div className="pdv-online-card-left">
                        <span className="pdv-pedido-id"># {pedido.id}</span>
                        <span className="pdv-pedido-cliente">{pedido.customerName || "—"}</span>
                        <span className={`pdv-online-status-badge pdv-online-status-badge--${status}`}>{PEDIDO_STATUS_LABELS[status] || status}</span>
                      </div>
                      <div className="pdv-online-card-right">
                        <span className="pdv-pedido-total">{formatCurrency(pedido.total)}</span>
                        <span className="pdv-pedido-data"><FaClock size={11} /> {new Date(pedido.date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    <div className="pdv-online-card-contato">
                      {pedido.customerPhone && <span><FaPhone size={11} /> {pedido.customerPhone}</span>}
                      {pedido.customerAddress && <span><FaMapMarkerAlt size={11} /> {pedido.customerAddress}</span>}
                      <span className="pdv-online-pagamento">{getFormaNome(pedido.paymentMethod)}</span>
                    </div>

                    {onlineDetalhe?.id === pedido.id && (
                      <div className="pdv-pedido-detalhe">
                        <table className="pdv-pedido-itens-table">
                          <thead>
                            <tr><th>Produto</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr>
                          </thead>
                          <tbody>
                            {pedido.items.map((item) => (
                              <tr key={item.id}>
                                <td>{item.productName}</td>
                                <td>{item.quantity}</td>
                                <td>{formatCurrency(item.unitPrice)}</td>
                                <td>{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {pedido.observacoes && (
                          <div className="pdv-online-obs"><strong>Obs.:</strong> {pedido.observacoes}</div>
                        )}
                      </div>
                    )}

                    {status !== "delivered" && status !== "cancelled" && (
                      <div className="pdv-online-acoes">
                        {next && (
                          <button
                            className={`pdv-online-avancar-btn pdv-online-avancar-btn--${next}`}
                            onClick={() => atualizarStatusOnline(pedido.id, next)}
                            disabled={atualizandoStatusId === pedido.id}
                          >
                            {atualizandoStatusId === pedido.id ? <FaSpinner className="spin" /> : <FaArrowRight />} Avançar para: {PEDIDO_STATUS_LABELS[next]}
                          </button>
                        )}
                        {pedido.customerPhone && (
                          <button
                            className="pdv-online-wpp-btn"
                            onClick={() => atualizarStatusOnline(pedido.id, status)}
                            title="Reenviar mensagem do status atual no WhatsApp"
                          >
                            <FaWhatsapp /> Avisar cliente
                          </button>
                        )}
                        <button
                          className="pdv-online-cancelar-btn"
                          onClick={() => { if (window.confirm(`Cancelar o pedido #${pedido.id}?`)) atualizarStatusOnline(pedido.id, "cancelled"); }}
                          disabled={atualizandoStatusId === pedido.id}
                        >
                          <FaTimes /> Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </>
          )}
        </div>
      )}

      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      {/* ===== MODAL DE COMPOSIÇÃO ===== */}
      {compModalProduct && (
        <div className="pdv-comp-modal-overlay" onClick={() => setCompModalProduct(null)}>
          <div className="pdv-comp-modal" onClick={e => e.stopPropagation()}>
            <div className="pdv-comp-modal-header">
              <h3 className="sombra-modal">{compModalProduct.name}</h3>
              <button className="pdv-comp-modal-close" onClick={() => setCompModalProduct(null)}>✕</button>
            </div>
            <div className="pdv-comp-modal-body">
              {(() => {
                const composicoes = compModalProduct.composicoes || [];
                // Encontra o índice do primeiro grupo ainda não preenchido
                const firstEmptyIdx = composicoes.findIndex(comp => !(compSelections[comp.id] || []).length);
                // Mostra até o primeiro não preenchido (inclusive); se todos preenchidos, mostra tudo
                const visibleComps = firstEmptyIdx === -1 ? composicoes : composicoes.slice(0, firstEmptyIdx + 1);
                return visibleComps.map((comp, idx) => {
                  const isActive = idx === (firstEmptyIdx === -1 ? composicoes.length - 1 : firstEmptyIdx);
                  return (
                <div key={comp.id} className={`pdv-comp-group ${isActive ? 'pdv-comp-group--active' : 'pdv-comp-group--done'}`}>
                  <div className="pdv-comp-group-title">
                    {comp.nome}
                    {comp.obrigatorio && <span className="pdv-comp-required">*obrigatório</span>}
                    {comp.multiplo && <span className="pdv-comp-multi">até {comp.maxOpcoes}</span>}
                  </div>
                  <div className="pdv-comp-options">
                    {comp.opcoes.filter(o => o.disponivel).map(opcao => {
                      const selected = (compSelections[comp.id] || []).includes(opcao.id);
                      const stockQty = opcao.estoque?.quantity ?? null;
                      const esgotado = stockQty !== null && stockQty <= 0;
                      const pouco = stockQty !== null && stockQty > 0 && stockQty <= 3;
                      return (
                        <button
                          key={opcao.id}
                          className={`pdv-comp-option ${selected ? 'pdv-comp-option--selected' : ''} ${esgotado ? 'pdv-comp-option--out' : ''}`}
                          onClick={() => !esgotado && toggleCompOpcao(comp.id, opcao.id, comp.multiplo, comp.maxOpcoes)}
                          disabled={esgotado}
                          title={esgotado ? 'Esgotado' : pouco ? `Atenção: apenas ${stockQty} em estoque` : ''}
                        >
                          <span className="pdv-comp-option-name">{opcao.nome}{esgotado ? ' ✕' : ''}</span>
                          {opcao.valorExtra > 0 && <span className="pdv-comp-option-extra">+{formatCurrency(opcao.valorExtra)}</span>}
                          {esgotado && <span className="pdv-comp-option-stock pdv-comp-option-stock--out">Esgotado</span>}
                          {pouco && <span className="pdv-comp-option-stock pdv-comp-option-stock--low">⚠ {stockQty} restantes</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                  );
                });
              })()}
            </div>
            <div className="pdv-comp-modal-footer">
              <span className="pdv-comp-modal-price">
                {formatCurrency(compModalProduct.value + (compModalProduct.composicoes || []).reduce((sum, comp) => {
                  const sel = compSelections[comp.id] || [];
                  return sum + comp.opcoes.filter(o => sel.includes(o.id)).reduce((s, o) => s + (o.valorExtra || 0), 0);
                }, 0))}
              </span>
              <button className="pdv-comp-confirm-btn" onClick={confirmComposicao}>Adicionar ao Carrinho</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL FOLLOW-UP DESCARTÁVEIS ===== */}
      {showFollowUpModal && followUpPendentes.length > 0 && (() => {
        const fu = followUpPendentes[followUpIdx];
        const resp = followUpRespostas[fu.id] || {};
        const isLast = followUpIdx >= followUpPendentes.length - 1;

        const setResp = (patch) => setFollowUpRespostas(prev => ({
          ...prev,
          [fu.id]: { ...prev[fu.id], ...patch }
        }));

        const handleResponder = async () => {
          if (resp.temEstoque === undefined) return; // deve escolher Sim ou Não
          // Se sim, quantidade é obrigatória
          if (resp.temEstoque === true && (!resp.quantidade || isNaN(parseFloat(resp.quantidade)))) return;
          setIsSubmittingFollowUp(true);
          try {
            await axios.put(`${API_URL}/api/followup/${fu.id}`, {
              temEstoque: resp.temEstoque,
              quantidade: resp.temEstoque ? (parseFloat(resp.quantidade) || 0) : null,
              observacao: resp.observacao || null,
              respondidoPor: auth?.userName || null,
            }, { headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {} });

            if (isLast) {
              setShowFollowUpModal(false);
              // Recarregar produtos para refletir estoques atualizados
              fetchProducts();
            } else {
              setFollowUpIdx(i => i + 1);
            }
          } catch (e) {
            console.error("Erro ao responder follow-up:", e);
          } finally {
            setIsSubmittingFollowUp(false);
          }
        };

        return (
          <div className="pdv-followup-overlay">
            <div className="pdv-followup-modal">
              <div className="pdv-followup-header">
                <FaBoxOpen size={18} />
                <span>Verificação Semanal de Estoque</span>
                <span className="pdv-followup-counter">{followUpIdx + 1}/{followUpPendentes.length}</span>
              </div>
              <div className="pdv-followup-body">
                <p className="pdv-followup-produto">{fu.estoque?.name}</p>
                <p className="pdv-followup-pergunta">Você ainda tem esse produto?</p>
                <div className="pdv-followup-btns-resposta">
                  <button
                    className={`pdv-followup-btn-sim ${resp.temEstoque === true ? 'pdv-followup-btn--active' : ''}`}
                    onClick={() => setResp({ temEstoque: true })}
                    type="button"
                  >Sim</button>
                  <button
                    className={`pdv-followup-btn-nao ${resp.temEstoque === false ? 'pdv-followup-btn--active' : ''}`}
                    onClick={() => setResp({ temEstoque: false })}
                    type="button"
                  >Não</button>
                </div>
                {resp.temEstoque === true && (
                  <div className="pdv-followup-qtd">
                    <label>Quantos restam? <span className="pdv-followup-unit">({fu.estoque?.unit})</span></label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={resp.quantidade || ""}
                      onChange={e => setResp({ quantidade: e.target.value })}
                      placeholder="0"
                      autoFocus
                    />
                    {(!resp.quantidade || isNaN(parseFloat(resp.quantidade))) && (
                      <span className="pdv-followup-qtd-hint">Informe a quantidade para continuar</span>
                    )}
                  </div>
                )}
                <div className="pdv-followup-obs">
                  <input
                    type="text"
                    placeholder="Observação (opcional)"
                    value={resp.observacao || ""}
                    onChange={e => setResp({ observacao: e.target.value })}
                  />
                </div>
              </div>
              <div className="pdv-followup-footer">
                <button
                  className="pdv-followup-pular"
                  onClick={() => isLast ? setShowFollowUpModal(false) : setFollowUpIdx(i => i + 1)}
                  type="button"
                >Pular</button>
                <button
                  className="pdv-followup-confirmar"
                  onClick={handleResponder}
                  disabled={
                    resp.temEstoque === undefined ||
                    (resp.temEstoque === true && (!resp.quantidade || isNaN(parseFloat(resp.quantidade)))) ||
                    isSubmittingFollowUp
                  }
                  type="button"
                >
                  {isSubmittingFollowUp ? <FaSpinner className="pdv-spin" /> : (isLast ? "Concluir" : "Próximo")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default PDV;

