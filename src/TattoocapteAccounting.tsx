import React, { useState, useEffect } from 'react';
import { User, LogOut, Plus, Trash2, Eye, EyeOff, DollarSign, Users, TrendingUp, Package, Wallet, Download, RotateCcw, Gift, Save } from 'lucide-react';

const TattoocapteAccounting = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [employees, setEmployees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [startingFund, setStartingFund] = useState(0);
  const [bonuses, setBonuses] = useState({});
  const [newEmployee, setNewEmployee] = useState({ username: '', password: '', name: '', role: 'employee' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingFund, setEditingFund] = useState(false);
  const [tempFund, setTempFund] = useState(0);
  const [adminUser, setAdminUser] = useState(null);
  
useEffect(() => {
  const loadAdminUser = async () => {
    const user = await window.storage.get('tattoocapte_user');
    if (user) {
      setAdminUser(user);
    }
  };
  loadAdminUser();
}, []);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const empData = await window.storage.get('tattoocapte_employees');
      const transData = await window.storage.get('tattoocapte_transactions');
      const matData = await window.storage.get('tattoocapte_materials');
      const fundData = await window.storage.get('tattoocapte_starting_fund');
      const bonusData = await window.storage.get('tattoocapte_bonuses');
      
      if (empData) setEmployees(JSON.parse(empData.value));
      if (transData) setTransactions(JSON.parse(transData.value));
      if (matData) setMaterials(JSON.parse(matData.value));
      if (fundData) setStartingFund(parseFloat(fundData.value));
      if (bonusData) setBonuses(JSON.parse(bonusData.value));
    } catch (error) {
      const initialEmployees = [{
        id: 'boss',
        username: 'Jaxon',
        password: 'jaxon33',
        name: 'Jaxon (Patron)',
        role: 'boss'
      }];
      setEmployees(initialEmployees);
      await window.storage.set('tattoocapte_employees', JSON.stringify(initialEmployees));
    }
  };

  const saveData = async () => {
    await window.storage.set('tattoocapte_employees', JSON.stringify(employees));
    await window.storage.set('tattoocapte_transactions', JSON.stringify(transactions));
    await window.storage.set('tattoocapte_materials', JSON.stringify(materials));
    await window.storage.set('tattoocapte_starting_fund', startingFund.toString());
    await window.storage.set('tattoocapte_bonuses', JSON.stringify(bonuses));
  };

  useEffect(() => {
    if (employees.length > 0) {
      saveData();
    }
  }, [employees, transactions, materials, startingFund, bonuses]);

  const handleLogin = () => {
  if (
    adminUser &&
    adminUser.username === loginForm.username &&
    adminUser.password === loginForm.password
  ) {
    setCurrentUser(adminUser);
    setLoginForm({ username: '', password: '' });
  } else {
    alert('Identifiants incorrects');
  }
};


  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const addEmployee = () => {
    if (!newEmployee.username || !newEmployee.password || !newEmployee.name) {
      alert('Tous les champs sont requis');
      return;
    }
    const employee = {
      id: Date.now().toString(),
      ...newEmployee
    };
    setEmployees([...employees, employee]);
    setNewEmployee({ username: '', password: '', name: '', role: 'employee' });
  };

  const deleteEmployee = (id) => {
    if (window.confirm('Supprimer cet employé ?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const addTransaction = (type, category, amount, employeeId, description) => {
    const transaction = {
      id: Date.now().toString(),
      type,
      category,
      amount: parseFloat(amount),
      employeeId,
      description,
      date: new Date().toISOString()
    };
    setTransactions([...transactions, transaction]);
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Supprimer cette transaction ?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const addMaterial = (name, quantity, cost) => {
    const material = {
      id: Date.now().toString(),
      name,
      quantity: parseFloat(quantity),
      cost: parseFloat(cost),
      date: new Date().toISOString()
    };
    setMaterials([...materials, material]);
  };

  const toggleBonus = (employeeId) => {
    setBonuses({
      ...bonuses,
      [employeeId]: !bonuses[employeeId]
    });
  };

  const calculateTaxes = (totalRevenue) => {
    if (totalRevenue <= 500000) return totalRevenue * 0.05;
    if (totalRevenue <= 1500000) return totalRevenue * 0.10;
    if (totalRevenue <= 3000000) return totalRevenue * 0.15;
    if (totalRevenue <= 5000000) return totalRevenue * 0.20;
    if (totalRevenue <= 10000000) return totalRevenue * 0.30;
    return totalRevenue * 0.35;
  };

  const getWeekTransactions = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return transactions.filter(t => new Date(t.date) >= oneWeekAgo);
  };

  const calculateStats = () => {
    const weekTrans = getWeekTransactions();
    const allRevenue = transactions.filter(t => t.type === 'revenue');
    const customVipRevenue = allRevenue.filter(t => t.category === 'custom' || t.category === 'vip');
    const catalogueRevenue = allRevenue.filter(t => t.category === 'catalogue');
    
    const totalRevenue = allRevenue.reduce((sum, t) => sum + t.amount, 0);
    const weekRevenue = weekTrans.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const materialsCost = materials.reduce((sum, m) => sum + m.cost, 0);
    
    const employeeShares = {};
    let houseShare = totalRevenue * 0.30;
    
    catalogueRevenue.forEach(trans => {
      const seller = employees.find(e => e.id === trans.employeeId);
      if (seller) {
        if (!employeeShares[seller.id]) {
          employeeShares[seller.id] = { 
            name: seller.name, 
            amount: 0,
            role: seller.role,
            sales: 0
          };
        }
        const percentage = seller.role === 'boss' ? 0.45 : 0.25;
        employeeShares[seller.id].amount += trans.amount * percentage;
        employeeShares[seller.id].sales += trans.amount;
      }
    });
    
    const customVipTotal = customVipRevenue.reduce((sum, t) => sum + t.amount, 0);
    const employeeBonuses = {};
    let totalBonusPool = 0;
    
    Object.keys(bonuses).forEach(empId => {
      if (bonuses[empId]) {
        const bonusAmount = customVipTotal * 0.12;
        employeeBonuses[empId] = bonusAmount;
        totalBonusPool += bonusAmount;
      }
    });
    
    const totalPayroll = Object.values(employeeShares).reduce((sum, emp) => sum + emp.amount, 0);
    const taxableRevenue = totalRevenue - totalBonusPool;
    const taxes = calculateTaxes(taxableRevenue);
    const netBalance = startingFund + totalRevenue - totalExpenses - materialsCost - totalPayroll - totalBonusPool - taxes;
    
    return {
      totalRevenue,
      weekRevenue,
      customVipTotal,
      catalogueTotal: catalogueRevenue.reduce((sum, t) => sum + t.amount, 0),
      totalExpenses,
      materialsCost,
      totalPayroll,
      employeeBonuses,
      totalBonusPool,
      taxes,
      netBalance,
      taxableRevenue,
      employeeShares,
      houseShare
    };
  };

  const exportWeeklyReport = () => {
    const stats = calculateStats();
    const weekTrans = getWeekTransactions();
    
    let report = '=== TATTOOCAPTE - RAPPORT HEBDOMADAIRE ===\n\n';
    report += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    report += `Période: 7 derniers jours\n\n`;
    
    report += '--- VENTES DE LA SEMAINE ---\n';
    weekTrans.filter(t => t.type === 'revenue').forEach(t => {
      const emp = employees.find(e => e.id === t.employeeId);
      report += `${t.description} - ${t.amount.toLocaleString('fr-FR')}$ (${emp?.name || 'N/A'})\n`;
    });
    
    report += `\nTotal semaine: ${stats.weekRevenue.toLocaleString('fr-FR')}$\n\n`;
    
    report += '--- PARTS EMPLOYÉS (CATALOGUE) ---\n';
    Object.values(stats.employeeShares).forEach(emp => {
      report += `${emp.name}: ${emp.amount.toLocaleString('fr-FR')}$ (${emp.role === 'boss' ? '45%' : '25%'} de ${emp.sales.toLocaleString('fr-FR')}$)\n`;
    });
    
    report += '\n--- PRIMES CUSTOM/VIP ---\n';
    Object.entries(stats.employeeBonuses).forEach(([empId, amount]) => {
      const emp = employees.find(e => e.id === empId);
      report += `${emp?.name}: ${amount.toLocaleString('fr-FR')}$ (12% de ${stats.customVipTotal.toLocaleString('fr-FR')}$)\n`;
    });
    
    report += `\n--- RÉSUMÉ FINANCIER ---\n`;
    report += `Revenus totaux: ${stats.totalRevenue.toLocaleString('fr-FR')}$\n`;
    report += `Part Maison (30%): ${stats.houseShare.toLocaleString('fr-FR')}$\n`;
    report += `Paies totales: ${stats.totalPayroll.toLocaleString('fr-FR')}$\n`;
    report += `Primes totales: ${stats.totalBonusPool.toLocaleString('fr-FR')}$\n`;
    report += `Taxes: ${stats.taxes.toLocaleString('fr-FR')}$\n`;
    report += `Matériel: ${stats.materialsCost.toLocaleString('fr-FR')}$\n`;
    report += `Dépenses: ${stats.totalExpenses.toLocaleString('fr-FR')}$\n`;
    report += `SOLDE NET: ${stats.netBalance.toLocaleString('fr-FR')}$\n`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tattoocapte_rapport_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const resetAccounting = () => {
    if (window.confirm('⚠️ ATTENTION : Ceci va effacer toutes les transactions et réinitialiser la comptabilité. Cette action est irréversible. Continuer ?')) {
      setTransactions([]);
      setMaterials([]);
      setBonuses({});
      alert('Comptabilité réinitialisée');
    }
  };

  const saveFund = () => {
    setStartingFund(tempFund);
    setEditingFund(false);
  };

  const stats = calculateStats();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-zinc-800">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Tattoocapte</h1>
            <p className="text-zinc-400">Système de Comptabilité</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-300 mb-2">Identifiant</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                placeholder="Entrez votre identifiant"
              />
            </div>
            
            <div>
              <label className="block text-zinc-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 mb-6 border border-zinc-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Tattoocapte</h1>
              <p className="text-zinc-400">Bienvenue, {currentUser.name}</p>
            </div>
            <div className="flex gap-2">
              {currentUser.role === 'boss' && (
                <>
                  <button
                    onClick={exportWeeklyReport}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all border border-zinc-700"
                  >
                    <Download size={20} />
                    Export
                  </button>
                  <button
                    onClick={resetAccounting}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all border border-zinc-700"
                  >
                    <RotateCcw size={20} />
                    Reset
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg transition-all"
              >
                <LogOut size={20} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {currentUser.role === 'boss' && (
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-4 mb-6 border border-zinc-800">
            <div className="flex gap-2 overflow-x-auto">
              {['dashboard', 'employees', 'transactions', 'materials', 'customvip', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {tab === 'dashboard' && 'Tableau de bord'}
                  {tab === 'employees' && 'Employés'}
                  {tab === 'transactions' && 'Transactions'}
                  {tab === 'materials' && 'Matériel'}
                  {tab === 'customvip' && 'Custom/VIP'}
                  {tab === 'settings' && 'Paramètres'}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={32} className="text-white" />
                  <TrendingUp size={24} className="text-emerald-400" />
                </div>
                <p className="text-zinc-400 text-sm">Ventes Semaine</p>
                <p className="text-3xl font-bold text-white">{stats.weekRevenue.toLocaleString('fr-FR')} $</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Wallet size={32} className="text-white" />
                </div>
                <p className="text-zinc-400 text-sm">Revenus Total</p>
                <p className="text-3xl font-bold text-white">{stats.totalRevenue.toLocaleString('fr-FR')} $</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users size={32} className="text-white" />
                </div>
                <p className="text-zinc-400 text-sm">Paies Totales</p>
                <p className="text-3xl font-bold text-white">{stats.totalPayroll.toLocaleString('fr-FR')} $</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Package size={32} className="text-white" />
                </div>
                <p className="text-zinc-400 text-sm">Solde Net</p>
                <p className="text-3xl font-bold text-emerald-400">{stats.netBalance.toLocaleString('fr-FR')} $</p>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Détails Financiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Fond de départ</p>
                  <p className="text-2xl font-bold text-white">{startingFund.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Catalogue</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.catalogueTotal.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Custom/VIP</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.customVipTotal.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Part Maison (30%)</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.houseShare.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Primes totales (exonérées)</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalBonusPool.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Taxes</p>
                  <p className="text-2xl font-bold text-red-400">{stats.taxes.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Matériel</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.materialsCost.toLocaleString('fr-FR')} $</p>
                </div>
                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Dépenses</p>
                  <p className="text-2xl font-bold text-red-400">{stats.totalExpenses.toLocaleString('fr-FR')} $</p>
                </div>
              </div>
            </div>

            {currentUser.role === 'boss' && (
              <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
                <h2 className="text-2xl font-bold text-white mb-4">Parts Employés (Catalogue uniquement)</h2>
                <div className="space-y-2">
                  {Object.values(stats.employeeShares).map((share, idx) => (
                    <div key={idx} className="bg-black p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{share.name}</p>
                        <p className="text-zinc-400 text-sm">{share.role === 'boss' ? '45%' : '25%'} de {share.sales.toLocaleString('fr-FR')} $</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{share.amount.toLocaleString('fr-FR')} $</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentUser.role === 'employee' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
                  <h2 className="text-2xl font-bold text-white mb-4">Ajouter une Vente</h2>
                  <EmployeeSaleForm 
                    currentEmployee={currentUser} 
                    onAdd={addTransaction}
                  />
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Ma Part Catalogue (25%)</p>
                  <p className="text-4xl font-bold text-white">
                    {(stats.employeeShares[currentUser.id]?.amount || 0).toLocaleString('fr-FR')} $
                  </p>
                </div>

                {bonuses[currentUser.id] && (
                  <div className="bg-purple-900 border border-purple-700 rounded-xl p-6">
                    <p className="text-purple-200 text-sm mb-1">Prime Custom/VIP (12%)</p>
                    <p className="text-4xl font-bold text-white">
                      {(stats.employeeBonuses[currentUser.id] || 0).toLocaleString('fr-FR')} $
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'boss' && activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Ajouter un Employé</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                />
                <input
                  type="text"
                  placeholder="Identifiant"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                />
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="employee">Employé (25%)</option>
                  <option value="boss">Patron (45%)</option>
                </select>
                <button
                  onClick={addEmployee}
                  className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-zinc-200"
                >
                  <Plus size={20} />
                  Ajouter
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Gestion des Primes Custom/VIP</h2>
              <div className="space-y-2">
                {employees.filter(e => e.role === 'employee').map(emp => (
                  <div key={emp.id} className="bg-black p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{emp.name}</p>
                      <p className="text-zinc-400 text-sm">
                        {bonuses[emp.id] ? `Prime: ${(stats.employeeBonuses[emp.id] || 0).toLocaleString('fr-FR')} $` : 'Pas de prime'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleBonus(emp.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                        bonuses[emp.id]
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Gift size={18} />
                      {bonuses[emp.id] ? 'Prime activée' : 'Activer prime'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Liste des Employés</h2>
              <div className="space-y-2">
                {employees.map(emp => (
                  <div key={emp.id} className="bg-black p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{emp.name}</p>
                      <p className="text-zinc-400 text-sm">@{emp.username} • {emp.role === 'boss' ? 'Patron (45%)' : 'Employé (25%)'}</p>
                    </div>
                    {emp.id !== 'boss' && (
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-2 bg-red-900 hover:bg-red-800 rounded-lg text-white border border-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'boss' && activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Nouvelle Transaction</h2>
              <TransactionForm employees={employees} onAdd={addTransaction} />
            </div>

            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Historique Catalogue</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.filter(t => t.category === 'catalogue').slice().reverse().map(trans => {
                  const emp = employees.find(e => e.id === trans.employeeId);
                  return (
                    <div key={trans.id} className="bg-black p-4 rounded-lg border border-zinc-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{trans.description}</p>
                          <p className="text-zinc-400 text-sm">
                            {new Date(trans.date).toLocaleDateString('fr-FR')}
                            {emp && ` • ${emp.name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xl font-bold ${trans.type === 'revenue' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trans.type === 'revenue' ? '+' : '-'}{trans.amount.toLocaleString('fr-FR')} $
                          </p>
                          <button
                            onClick={() => deleteTransaction(trans.id)}
                            className="p-2 bg-red-900 hover:bg-red-800 rounded-lg text-white border border-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'boss' && activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Ajouter Matériel</h2>
              <MaterialForm onAdd={addMaterial} />
            </div>

            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-4">Stock de Matériel</h2>
              <div className="space-y-2">
                {materials.map(mat => (
                  <div key={mat.id} className="bg-black p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{mat.name}</p>
                      <p className="text-zinc-400 text-sm">Quantité: {mat.quantity}</p>
                    </div>
                    <p className="text-xl font-bold text-orange-400">{mat.cost.toLocaleString('fr-FR')} $</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'boss' && activeTab === 'customvip' && (
          <div className="space-y-6">
            <CustomVipSheet transactions={transactions} onDelete={deleteTransaction} employees={employees} stats={stats} />
          </div>
        )}

        {currentUser.role === 'boss' && activeTab === 'settings' && (
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4">Paramètres</h2>
            <div>
              <label className="block text-zinc-300 mb-2">Fond de départ ($)</label>
              {editingFund ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tempFund}
                    onChange={(e) => setTempFund(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={saveFund}
                    className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-zinc-200"
                  >
                    <Save size={20} />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingFund(false)}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <div className="flex-1 px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white">
                    {startingFund.toLocaleString('fr-FR')} $
                  </div>
                  <button
                    onClick={() => {
                      setTempFund(startingFund);
                      setEditingFund(true);
                    }}
                    className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200"
                  >
                    Modifier
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeSaleForm = ({ currentEmployee, onAdd }) => {
  const [form, setForm] = useState({
    clientName: '',
    amount: '',
    category: 'catalogue'
  });

  const handleSubmit = () => {
    if (!form.clientName || !form.amount) {
      alert('Client et prix requis');
      return;
    }
    const description = `${form.category === 'catalogue' ? 'Catalogue' : form.category === 'custom' ? 'Custom' : 'VIP'} - ${form.clientName}`;
    onAdd('revenue', form.category, form.amount, currentEmployee.id, description);
    setForm({ clientName: '', amount: '', category: 'catalogue' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <select
        value={form.category}
        onChange={(e) => setForm({...form, category: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      >
        <option value="catalogue">Catalogue</option>
        <option value="custom">Custom</option>
        <option value="vip">VIP</option>
      </select>

      <input
        type="text"
        value={form.clientName}
        onChange={(e) => setForm({...form, clientName: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
        placeholder="Prénom Nom"
      />

      <input
        type="number"
        value={form.amount}
        onChange={(e) => setForm({...form, amount: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
        placeholder="Prix en $"
      />

      <button
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold"
      >
        <Plus size={20} />
        Ajouter
      </button>
    </div>
  );
};

const CustomVipSheet = ({ transactions, onDelete, employees, stats }) => {
  const customVipTransactions = transactions.filter(t => 
    (t.category === 'custom' || t.category === 'vip') && t.type === 'revenue'
  );

  const totalCustom = customVipTransactions.filter(t => t.category === 'custom').reduce((sum, t) => sum + t.amount, 0);
  const totalVip = customVipTransactions.filter(t => t.category === 'vip').reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Custom</p>
          <p className="text-3xl font-bold text-blue-400">{totalCustom.toLocaleString('fr-FR')} $</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total VIP</p>
          <p className="text-3xl font-bold text-purple-400">{totalVip.toLocaleString('fr-FR')} $</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
        <h2 className="text-2xl font-bold text-white mb-4">Fiche Custom/VIP</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customVipTransactions.slice().reverse().map(trans => {
            const emp = employees.find(e => e.id === trans.employeeId);
            return (
              <div key={trans.id} className="bg-black p-4 rounded-lg border border-zinc-800">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                      trans.category === 'vip' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {trans.category.toUpperCase()}
                    </span>
                    <span className="text-white font-semibold">{trans.description}</span>
                    <p className="text-zinc-400 text-sm mt-1">
                      {new Date(trans.date).toLocaleDateString('fr-FR')}
                      {emp && ` • ${emp.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-emerald-400">
                      {trans.amount.toLocaleString('fr-FR')} $
                    </p>
                    <button
                      onClick={() => onDelete(trans.id)}
                      className="p-2 bg-red-900 hover:bg-red-800 rounded-lg text-white border border-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-purple-900 border border-purple-700 rounded-xl p-6">
        <p className="text-purple-200 text-sm mb-2">Pool de primes total (exonéré de taxes)</p>
        <p className="text-4xl font-bold text-white mb-4">{stats.totalBonusPool.toLocaleString('fr-FR')} $</p>
        <p className="text-purple-300 text-sm">12% de {(totalCustom + totalVip).toLocaleString('fr-FR')} $ réparti entre les employés avec prime activée</p>
      </div>
    </>
  );
};

const TransactionForm = ({ employees, onAdd }) => {
  const [form, setForm] = useState({
    type: 'revenue',
    category: 'catalogue',
    amount: '',
    employeeId: '',
    description: ''
  });

  const handleSubmit = () => {
    if (!form.amount || !form.description) {
      alert('Montant et description requis');
      return;
    }
    onAdd(form.type, form.category, form.amount, form.employeeId, form.description);
    setForm({
      type: 'revenue',
      category: 'catalogue',
      amount: '',
      employeeId: '',
      description: ''
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <select
        value={form.type}
        onChange={(e) => setForm({...form, type: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      >
        <option value="revenue">Revenu</option>
        <option value="expense">Dépense</option>
      </select>

      <select
        value={form.category}
        onChange={(e) => setForm({...form, category: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      >
        <option value="catalogue">Catalogue</option>
        <option value="custom">Custom</option>
        <option value="vip">VIP</option>
        <option value="other">Autre</option>
      </select>

      <select
        value={form.employeeId}
        onChange={(e) => setForm({...form, employeeId: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      >
        <option value="">Aucun</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>{emp.name}</option>
        ))}
      </select>

      <input
        type="number"
        value={form.amount}
        onChange={(e) => setForm({...form, amount: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
        placeholder="Montant en $"
      />

      <input
        type="text"
        value={form.description}
        onChange={(e) => setForm({...form, description: e.target.value})}
        className="md:col-span-2 px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
        placeholder="Description"
      />

      <button
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-zinc-200"
      >
        <Plus size={20} />
        Ajouter
      </button>
    </div>
  );
};

const MaterialForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    cost: ''
  });

  const handleSubmit = () => {
    if (!form.name || !form.quantity || !form.cost) {
      alert('Tous les champs sont requis');
      return;
    }
    onAdd(form.name, form.quantity, form.cost);
    setForm({ name: '', quantity: '', cost: '' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <input
        type="text"
        placeholder="Nom du matériel"
        value={form.name}
        onChange={(e) => setForm({...form, name: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      />
      <input
        type="number"
        placeholder="Quantité"
        value={form.quantity}
        onChange={(e) => setForm({...form, quantity: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      />
      <input
        type="number"
        placeholder="Coût total ($)"
        value={form.cost}
        onChange={(e) => setForm({...form, cost: e.target.value})}
        className="px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
      />
      <button
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-zinc-200"
      >
        <Plus size={20} />
        Ajouter
      </button>
    </div>
  );
};

export default TattoocapteAccounting;
