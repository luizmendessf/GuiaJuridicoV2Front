import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, deleteUser, updateUserRoles } from '../services/apiService';
import './AdminPage.css';

const AdminPage = () => {
  const { hasAdminRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const availableRoles = ['ROLE_USUARIO', 'ROLE_ORGANIZADOR', 'ROLE_ADMIN'];

  useEffect(() => {
    if (!hasAdminRole()) {
      setError('Acesso negado. Apenas administradores podem acessar esta página.');
      setLoading(false);
      return;
    }
    loadUsers();
  }, [hasAdminRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar usuários baseado na pesquisa
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        alert('Usuário deletado com sucesso!');
      } catch (err) {
        alert('Erro ao deletar usuário: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEditRoles = (user) => {
    setEditingUser(user);
    // Se o usuário já tem roles, usa elas, senão usa ROLE_USUARIO como padrão
    setSelectedRoles(user.roles && user.roles.length > 0 ? user.roles : ['ROLE_USUARIO']);
  };

  // Função para formatar roles para exibição
  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return 'USUARIO';
    return roles.map(role => role.replace('ROLE_', '')).join(', ');
  };

  const handleSaveRoles = async () => {
    try {
      await updateUserRoles(editingUser.id, selectedRoles);
      alert('Roles atualizadas com sucesso!');
      setEditingUser(null);
      setSelectedRoles([]);
      loadUsers(); // Recarrega a lista
    } catch (err) {
      alert('Erro ao atualizar roles: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Carregando usuários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Administração de Usuários</h1>
        <p>Gerencie usuários, roles e permissões do sistema</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="search-results">
          {filteredUsers.length} usuário(s) encontrado(s)
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td className="user-roles">{formatRoles(user.roles)}</td>
                <td className="actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditRoles(user)}
                  >
                    Editar Roles
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user.id, user.nome)}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Editar Roles - {editingUser.nome}</h3>
              <button 
                className="close-btn"
                onClick={() => setEditingUser(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Selecione as roles para o usuário:</p>
              <div className="roles-list">
                {availableRoles.map(role => (
                  <label key={role} className="role-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                    />
                    <span>{role.replace('ROLE_', '')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-save"
                onClick={handleSaveRoles}
                disabled={selectedRoles.length === 0}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;